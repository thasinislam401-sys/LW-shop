import React, { useState, useEffect } from 'react';
import { X, Printer, Download, Save, FileText, User, MapPin, Phone, Hash, ShieldCheck, CreditCard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Order } from '../types';
import { format } from 'date-fns';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface InvoiceModalProps {
  order: Order;
  isOpen: boolean;
  onClose: () => void;
}

const InvoiceModal: React.FC<InvoiceModalProps> = ({ order, isOpen, onClose }) => {
  const invoiceRef = React.useRef<HTMLDivElement>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [invoiceData, setInvoiceData] = useState({
    name: order.customer.name,
    phone: order.customer.phone,
    address: `${order.customer.address.village}, ${order.customer.address.thana}, ${order.customer.address.district}`,
    items: [...order.items],
    shippingCharge: order.shippingCharge || 0,
    extraDiscount: order.extraDiscount || 0,
    steadfastTrackingId: order.steadfastTrackingId || ''
  });

  useEffect(() => {
    setInvoiceData({
      name: order.customer.name,
      phone: order.customer.phone,
      address: `${order.customer.address.village}, ${order.customer.address.thana}, ${order.customer.address.district}`,
      items: [...order.items],
      shippingCharge: order.shippingCharge || 0,
      extraDiscount: order.extraDiscount || 0,
      steadfastTrackingId: order.steadfastTrackingId || ''
    });
  }, [order]);

  const subtotal = invoiceData.items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const finalTotal = subtotal + invoiceData.shippingCharge - invoiceData.extraDiscount;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateDoc(doc(db, 'orders', order.id), {
        'customer.name': invoiceData.name,
        'customer.phone': invoiceData.phone,
        extraDiscount: invoiceData.extraDiscount,
        steadfastTrackingId: invoiceData.steadfastTrackingId,
        total: finalTotal
      });
      alert('Invoice data saved successfully!');
    } catch (error) {
      console.error('Save invoice error:', error);
      alert('Failed to save invoice data');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrint = () => {
    window.focus();
    window.print();
  };

  const handleDownloadPDF = async () => {
    if (!invoiceRef.current) return;
    setIsGeneratingPDF(true);
    try {
      const canvas = await html2canvas(invoiceRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a5',
      });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`invoice-${order.orderNumber}.pdf`);
    } catch (error) {
      console.error('PDF generation error:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-0 sm:p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-leather-900/80 backdrop-blur-md no-print"
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative bg-white w-full max-w-3xl h-full sm:h-auto sm:max-h-[90vh] overflow-hidden sm:rounded-[2.5rem] shadow-2xl flex flex-col no-print"
      >
        {/* Header Controls */}
        <div className="p-4 sm:p-6 border-b border-leather-50 bg-white z-20">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="p-2 sm:p-3 bg-gold-50 text-gold-600 rounded-2xl">
                <FileText size={20} className="sm:w-6 sm:h-6" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-leather-900 font-serif">Invoice Settings</h2>
                <p className="text-[10px] sm:text-xs text-leather-400 font-medium tracking-wider uppercase">ORDER #{order.orderNumber}</p>
              </div>
              <button onClick={onClose} className="ml-auto p-2 hover:bg-leather-50 rounded-full transition-colors sm:hidden text-leather-400 font-bold text-xs">
                CLOSE
              </button>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
              <button 
                onClick={handleDownloadPDF}
                disabled={isGeneratingPDF}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-leather-100 text-leather-900 rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm hover:bg-leather-200 transition-all disabled:opacity-50"
              >
                <Download size={16} />
                <span>{isGeneratingPDF ? '...' : 'Save PDF'}</span>
              </button>
              <button 
                onClick={handlePrint}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-gold-500 text-leather-900 rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm hover:bg-gold-600 transition-all shadow-lg shadow-gold-500/20"
              >
                <Printer size={16} />
                <span>Print A5</span>
              </button>
              <button onClick={onClose} className="hidden sm:block p-2 hover:bg-leather-50 rounded-full transition-colors text-leather-400 font-bold text-xs">
                CLOSE
              </button>
            </div>
          </div>
        </div>

        <div className="flex-grow overflow-y-auto p-6 sm:p-8 bg-white">
          <div className="max-w-2xl mx-auto space-y-8">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold text-leather-400 uppercase tracking-widest">Edit Details</h3>
                <button 
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-1.5 text-gold-600 font-bold text-xs hover:underline disabled:opacity-50"
                >
                  <Save size={14} />
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5 md:col-span-2">
                  <label className="flex items-center gap-2 text-[10px] font-bold text-leather-500 uppercase tracking-wider">
                    <Hash size={12} className="text-gold-600" />
                    Steadfast Tracking ID
                  </label>
                  <input 
                    type="text"
                    value={invoiceData.steadfastTrackingId}
                    onChange={(e) => setInvoiceData({...invoiceData, steadfastTrackingId: e.target.value})}
                    placeholder="Enter 7-14 digit ID"
                    className={`w-full px-4 py-3 bg-gold-50/30 border rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-500 font-bold text-sm ${
                      invoiceData.steadfastTrackingId && (invoiceData.steadfastTrackingId.length < 7 || invoiceData.steadfastTrackingId.length > 14)
                        ? 'border-red-300'
                        : 'border-gold-100'
                    }`}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 text-[10px] font-bold text-leather-500 uppercase tracking-wider">
                    <User size={12} />
                    Full Name
                  </label>
                  <input 
                    type="text"
                    value={invoiceData.name}
                    onChange={(e) => setInvoiceData({...invoiceData, name: e.target.value})}
                    className="w-full px-4 py-3 bg-leather-50 border border-leather-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-500 font-medium text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 text-[10px] font-bold text-leather-500 uppercase tracking-wider">
                    <Phone size={12} />
                    Phone Number
                  </label>
                  <input 
                    type="text"
                    value={invoiceData.phone}
                    onChange={(e) => setInvoiceData({...invoiceData, phone: e.target.value})}
                    className="w-full px-4 py-3 bg-leather-50 border border-leather-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-500 font-medium text-sm"
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="flex items-center gap-2 text-[10px] font-bold text-leather-500 uppercase tracking-wider">
                    <MapPin size={12} />
                    Shipping Address
                  </label>
                  <textarea 
                    value={invoiceData.address}
                    onChange={(e) => setInvoiceData({...invoiceData, address: e.target.value})}
                    rows={3}
                    className="w-full px-4 py-3 bg-leather-50 border border-leather-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-500 resize-none font-medium text-sm leading-relaxed"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-leather-500 uppercase tracking-wider">Extra Discount (৳)</label>
                  <input 
                    type="number"
                    value={isNaN(invoiceData.extraDiscount) ? '' : invoiceData.extraDiscount}
                    onChange={(e) => setInvoiceData({...invoiceData, extraDiscount: e.target.value === '' ? 0 : Number(e.target.value)})}
                    className="w-full px-4 py-3 bg-leather-50 border border-leather-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-500 font-medium text-sm"
                  />
                </div>

                <div className="flex items-end">
                  <button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className="w-full py-3 bg-leather-900 text-white rounded-xl font-bold text-sm hover:bg-leather-800 transition-all shadow-lg shadow-leather-900/20 flex items-center justify-center gap-2"
                  >
                    <Save size={18} />
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-leather-50">
              <div className="bg-stone-50 p-6 rounded-2xl">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-xs font-bold text-leather-400 uppercase tracking-widest">Order Summary</h4>
                  <span className="text-lg font-black text-leather-900">৳{finalTotal.toLocaleString()}</span>
                </div>
                <div className="space-y-2">
                  {invoiceData.items.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-leather-600">{item.name} x {item.qty}</span>
                      <span className="font-bold">৳{(item.price * item.qty).toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="pt-2 border-t border-stone-200 flex justify-between text-sm">
                    <span className="text-leather-400">Shipping</span>
                    <span>৳{invoiceData.shippingCharge.toLocaleString()}</span>
                  </div>
                  {invoiceData.extraDiscount > 0 && (
                    <div className="flex justify-between text-sm text-red-500">
                      <span>Discount</span>
                      <span>-৳{invoiceData.extraDiscount.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Actual Print Layout (Hidden on screen) - Optimized for A5 */}
      <div ref={invoiceRef} className="print-only" style={{ 
        position: 'fixed',
        top: '-10000px',
        left: '-10000px',
        width: '148mm',
        height: '210mm',
        backgroundColor: '#ffffff',
        zIndex: -1,
        pointerEvents: 'none'
      }}>
        <style>{`
          @media screen {
            .print-only {
              display: block !important;
            }
          }
          @media print {
            @page {
              size: A5;
              margin: 0;
            }
            body * {
              visibility: hidden !important;
            }
            .print-only, .print-only * {
              visibility: visible !important;
            }
            .print-only {
              position: fixed !important;
              left: 0 !important;
              top: 0 !important;
              width: 148mm !important;
              height: 210mm !important;
              padding: 10mm !important;
              margin: 0 !important;
              background-color: white !important;
              -webkit-print-color-adjust: exact;
              display: block !important;
              z-index: 9999 !important;
            }
            .no-print {
              display: none !important;
            }
          }
        `}</style>
        
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', color: '#000000', fontFamily: 'sans-serif', border: '2pt solid #000000', padding: '10mm', boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8mm' }}>
            <div>
              <h1 style={{ fontSize: '24pt', fontWeight: 900, letterSpacing: '-1.5pt', margin: 0, lineHeight: 1 }}>LEATHER WALLAH</h1>
              <p style={{ fontSize: '8pt', fontWeight: 'bold', color: '#666666', textTransform: 'uppercase', letterSpacing: '2pt', margin: '2pt 0 0 0' }}>Premium Leather Goods</p>
              <p style={{ fontSize: '10pt', fontWeight: '900', color: '#000000', margin: '6pt 0 0 0', display: 'flex', alignItems: 'center', gap: '4pt' }}>
                WhatsApp: +880 1956-869107
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '7pt', fontWeight: 900, color: '#999999', textTransform: 'uppercase', letterSpacing: '1pt', margin: '0 0 2pt 0' }}>Date Issued</p>
              <p style={{ fontSize: '10pt', fontWeight: 'bold', margin: 0 }}>{format(new Date(), 'dd MMM, yyyy')}</p>
            </div>
          </div>

          <div style={{ backgroundColor: '#f8f9fa', color: '#000000', padding: '6mm', borderRadius: '4mm', border: '1pt solid #e9ecef', marginBottom: '10mm', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: '7pt', fontWeight: 'bold', color: '#666666', textTransform: 'uppercase', letterSpacing: '1pt', margin: '0 0 2pt 0' }}>Steadfast Tracking ID</p>
              <p style={{ fontSize: '28pt', fontWeight: 900, letterSpacing: '3pt', margin: 0, lineHeight: 1, color: '#b4943e' }}>{invoiceData.steadfastTrackingId || '-------'}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '7pt', fontWeight: 'bold', color: '#666666', textTransform: 'uppercase', letterSpacing: '1pt', margin: '0 0 2pt 0' }}>Order Ref</p>
              <p style={{ fontSize: '18pt', fontWeight: 900, margin: 0, lineHeight: 1 }}>#{order.orderNumber}</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10mm', marginBottom: '10mm' }}>
            <div>
              <p style={{ fontSize: '7pt', fontWeight: 900, color: '#999999', textTransform: 'uppercase', letterSpacing: '1pt', margin: '0 0 4pt 0', borderBottom: '1pt solid #eeeeee', paddingBottom: '2pt' }}>Bill To</p>
              <div style={{ lineHeight: 1.4 }}>
                <p style={{ fontSize: '16pt', fontWeight: 900, margin: 0 }}>{invoiceData.name}</p>
                <p style={{ fontSize: '14pt', fontWeight: 'bold', margin: '2pt 0' }}>{invoiceData.phone}</p>
                <p style={{ fontSize: '11pt', color: '#000000', fontWeight: '500', margin: '4pt 0 0 0' }}>{invoiceData.address}</p>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '7pt', fontWeight: 900, color: '#999999', textTransform: 'uppercase', letterSpacing: '1pt', margin: '0 0 4pt 0', borderBottom: '1pt solid #eeeeee', paddingBottom: '2pt' }}>Payment Method</p>
              <p style={{ fontSize: '12pt', fontWeight: 900, margin: 0 }}>Cash on Delivery</p>
              <p style={{ fontSize: '8pt', color: '#666666', margin: '2pt 0 0 0', fontStyle: 'italic' }}>Verified Secure Order</p>
            </div>
          </div>

          <div style={{ flexGrow: 1 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2.5pt solid #000000', textAlign: 'left' }}>
                  <th style={{ padding: '4mm 0', fontSize: '8pt', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1pt' }}>Product Description</th>
                  <th style={{ padding: '4mm 0', fontSize: '8pt', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1pt', textAlign: 'center' }}>Qty</th>
                  <th style={{ padding: '4mm 0', fontSize: '8pt', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1pt', textAlign: 'right' }}>Price</th>
                  <th style={{ padding: '4mm 0', fontSize: '8pt', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1pt', textAlign: 'right' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {invoiceData.items.map((item, i) => (
                  <tr key={i} style={{ borderBottom: '1pt solid #eeeeee' }}>
                    <td style={{ padding: '5mm 0' }}>
                      <p style={{ fontSize: '11pt', fontWeight: 900, margin: 0 }}>{item.name}</p>
                      <p style={{ fontSize: '8pt', color: '#666666', margin: 0 }}>
                        {item.size && `Size: ${item.size}`} {item.color && ` | Color: ${item.color}`}
                      </p>
                    </td>
                    <td style={{ padding: '5mm 0', textAlign: 'center', fontSize: '11pt', fontWeight: 900 }}>{item.qty}</td>
                    <td style={{ padding: '5mm 0', textAlign: 'right', fontSize: '10pt', fontWeight: 'bold', color: '#444444' }}>৳{item.price.toLocaleString()}</td>
                    <td style={{ padding: '5mm 0', textAlign: 'right', fontSize: '11pt', fontWeight: 900 }}>৳{(item.price * item.qty).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: '10mm', paddingTop: '6mm', borderTop: '2.5pt solid #000000' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <div style={{ width: '55mm' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9pt', color: '#666666', marginBottom: '3pt' }}>
                  <span style={{ fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1pt' }}>Subtotal</span>
                  <span style={{ fontWeight: 900, color: '#000000' }}>৳{subtotal.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9pt', color: '#666666', marginBottom: '3pt' }}>
                  <span style={{ fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1pt' }}>Shipping</span>
                  <span style={{ fontWeight: 900, color: '#000000' }}>৳{invoiceData.shippingCharge.toLocaleString()}</span>
                </div>
                {invoiceData.extraDiscount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9pt', color: '#ff0000', marginBottom: '3pt' }}>
                    <span style={{ fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1pt' }}>Discount</span>
                    <span style={{ fontWeight: 900 }}>-৳{invoiceData.extraDiscount.toLocaleString()}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '4mm', borderTop: '1pt solid #dddddd', marginTop: '3mm' }}>
                  <span style={{ fontSize: '10pt', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '2pt' }}>Final Total</span>
                  <span style={{ fontSize: '18pt', fontWeight: 900 }}>৳{finalTotal.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '12mm', textAlign: 'center' }}>
            <div style={{ display: 'inline-block', padding: '3mm 10mm', backgroundColor: '#f9f9f9', borderRadius: '15mm', fontSize: '8pt', fontWeight: 900, color: '#999999', textTransform: 'uppercase', letterSpacing: '3pt' }}>
              Thank you for your trust
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceModal;
