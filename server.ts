import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function hashData(data: string | undefined): string | undefined {
  if (!data) return undefined;
  return crypto
    .createHash("sha256")
    .update(data.trim().toLowerCase())
    .digest("hex");
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Facebook CAPI Proxy
  app.post("/api/facebook-capi", async (req, res) => {
    const { eventName, userData, customData, eventId } = req.body;
    const pixelId = process.env.VITE_FB_PIXEL_ID;
    const accessToken = process.env.FB_ACCESS_TOKEN;

    if (!pixelId || !accessToken) {
      console.warn("[CAPI] No pixel ID or access token provided, skipping call.");
      return res.json({ success: true, message: "No token or pixel ID" });
    }

    // Hash PII data as required by Facebook
    const hashedUserData = {
      ...userData,
      fn: hashData(userData?.fn),
      ph: hashData(userData?.ph),
      ct: hashData(userData?.ct),
      zp: hashData(userData?.zp),
      em: hashData(userData?.em),
      external_id: hashData(userData?.ph || userData?.em), // Use phone or email as external_id
    };

    // Get real client IP if behind proxy
    const clientIp = (req.headers["x-forwarded-for"] as string)?.split(",")[0] || req.ip;

    try {
      const response = await fetch(
        `https://graph.facebook.com/v18.0/${pixelId}/events?access_token=${accessToken}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            data: [
              {
                event_name: eventName,
                event_time: Math.floor(Date.now() / 1000),
                event_id: eventId,
                action_source: "website",
                user_data: {
                  client_ip_address: clientIp,
                  client_user_agent: req.headers["user-agent"],
                  ...hashedUserData,
                },
                custom_data: customData,
              },
            ],
          }),
        }
      );
      const result = await response.json();
      console.log(`[CAPI] Event: ${eventName} Result:`, result);
      res.json({ success: true, result });
    } catch (error) {
      console.error("[CAPI] Error:", error);
      res.status(500).json({ success: false, error: "CAPI call failed" });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
