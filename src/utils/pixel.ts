declare global {
  interface Window {
    fbq: any;
    _fbq: any;
  }
}

export const initPixel = (pixelId: string) => {
  if (typeof window === 'undefined' || window.fbq) return;

  (function(f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
    if (f.fbq) return;
    n = f.fbq = function() {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    };
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = !0;
    n.version = '2.0';
    n.queue = [];
    t = b.createElement(e);
    t.async = !0;
    t.src = v;
    s = b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t, s);
  })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

  window.fbq('init', pixelId);
  window.fbq('track', 'PageView');
};

export const generateEventId = () => {
  return 'event_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
};

export const trackPageView = () => {
  if (window.fbq) {
    window.fbq('track', 'PageView');
  }
};

export const trackEvent = (eventName: string, params?: object, eventId?: string) => {
  if (window.fbq) {
    window.fbq('track', eventName, params, eventId ? { eventID: eventId } : undefined);
  }
};

export const trackCustomEvent = (eventName: string, params?: object, eventId?: string) => {
  if (window.fbq) {
    window.fbq('trackCustom', eventName, params, eventId ? { eventID: eventId } : undefined);
  }
};
