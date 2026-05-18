'use client';

import { useState } from 'react';
import { Download, Image as ImageIcon, RefreshCw } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function PaymentReceiptPage() {
  const [formData, setFormData] = useState({
    receiptNo: '',
    date: '',
    name: '',
    refId: '',
    amount: '',
    amountWords: '',
    paymentRef: '',
    drawnOn: '',
    plotNo: '',
    plotSize: '',
    account: '',
    paymentMethod: 'UPI' // Defaulted
  });

  const [preview, setPreview] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPreview(true);
  };

  const handleDownloadPDF = async () => {
    const element = document.getElementById('receiptPreview');
    if (!element) return;
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL('image/jpeg', 1.0);
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
    pdf.save('Payment_Receipt.pdf');
  };

  const handleDownloadImage = async () => {
    const element = document.getElementById('receiptPreview');
    if (!element) return;
    const canvas = await html2canvas(element, { scale: 2 });
    const link = document.createElement('a');
    link.download = 'Payment_Receipt.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Form Section */}
      <div className="bg-white dark:bg-[#16161f] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
        <h2 className="text-2xl font-serif text-brand-gold mb-6">Enter Payment Details</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Receipt Number</label>
              <input type="text" name="receiptNo" required value={formData.receiptNo} onChange={handleChange} className="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-[#0e0e14] border border-gray-200 dark:border-gray-800 focus:border-brand-gold focus:ring-1 focus:ring-brand-gold outline-none transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
              <input type="date" name="date" required value={formData.date} onChange={handleChange} className="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-[#0e0e14] border border-gray-200 dark:border-gray-800 focus:border-brand-gold focus:ring-1 focus:ring-brand-gold outline-none transition-colors" />
            </div>
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name (Mr./Mrs./M/s)</label>
              <input type="text" name="name" required value={formData.name} onChange={handleChange} className="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-[#0e0e14] border border-gray-200 dark:border-gray-800 focus:border-brand-gold focus:ring-1 focus:ring-brand-gold outline-none transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ref. Id</label>
              <input type="text" name="refId" required value={formData.refId} onChange={handleChange} className="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-[#0e0e14] border border-gray-200 dark:border-gray-800 focus:border-brand-gold focus:ring-1 focus:ring-brand-gold outline-none transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount (in digits)</label>
              <input type="number" name="amount" required value={formData.amount} onChange={handleChange} className="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-[#0e0e14] border border-gray-200 dark:border-gray-800 focus:border-brand-gold focus:ring-1 focus:ring-brand-gold outline-none transition-colors" />
            </div>
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount (in words)</label>
              <input type="text" name="amountWords" required value={formData.amountWords} onChange={handleChange} className="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-[#0e0e14] border border-gray-200 dark:border-gray-800 focus:border-brand-gold focus:ring-1 focus:ring-brand-gold outline-none transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Payment Method</label>
              <select name="paymentMethod" value={formData.paymentMethod} onChange={handleChange} className="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-[#0e0e14] border border-gray-200 dark:border-gray-800 focus:border-brand-gold focus:ring-1 focus:ring-brand-gold outline-none transition-colors">
                <option value="Cash">Cash</option>
                <option value="Draft">Draft</option>
                <option value="Cheque">Cheque</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="UPI">UPI</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Payment Reference Number</label>
              <input type="text" name="paymentRef" required value={formData.paymentRef} onChange={handleChange} className="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-[#0e0e14] border border-gray-200 dark:border-gray-800 focus:border-brand-gold focus:ring-1 focus:ring-brand-gold outline-none transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Drawn On</label>
              <input type="date" name="drawnOn" value={formData.drawnOn} onChange={handleChange} className="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-[#0e0e14] border border-gray-200 dark:border-gray-800 focus:border-brand-gold focus:ring-1 focus:ring-brand-gold outline-none transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Plot No</label>
              <input type="text" name="plotNo" value={formData.plotNo} onChange={handleChange} className="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-[#0e0e14] border border-gray-200 dark:border-gray-800 focus:border-brand-gold focus:ring-1 focus:ring-brand-gold outline-none transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Plot Size</label>
              <input type="text" name="plotSize" required value={formData.plotSize} onChange={handleChange} className="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-[#0e0e14] border border-gray-200 dark:border-gray-800 focus:border-brand-gold focus:ring-1 focus:ring-brand-gold outline-none transition-colors" />
            </div>
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">On Account Of</label>
              <input type="text" name="account" required value={formData.account} onChange={handleChange} className="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-[#0e0e14] border border-gray-200 dark:border-gray-800 focus:border-brand-gold focus:ring-1 focus:ring-brand-gold outline-none transition-colors" />
            </div>
          </div>

          <button type="submit" className="w-full mt-6 flex items-center justify-center gap-2 bg-brand-gold text-black font-semibold py-3 px-4 rounded-lg hover:bg-yellow-500 transition-colors">
            <RefreshCw className="w-5 h-5" /> Generate Receipt
          </button>
        </form>
      </div>

      {/* Preview Section */}
      <div className="bg-white dark:bg-[#16161f] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col">
        <h2 className="text-2xl font-serif text-brand-gold mb-6">Receipt Preview</h2>
        
        <div className="flex-1 bg-gray-50 dark:bg-[#0e0e14] p-6 rounded-xl border border-gray-200 dark:border-gray-800 overflow-y-auto">
          {preview ? (
            <div id="receiptPreview" className="space-y-6 text-gray-800 bg-white p-8 rounded border border-gray-200 shadow-sm relative">
              {/* Header */}
              <div className="flex justify-between items-start border-b-2 border-brand-gold pb-6">
                <div>
                  <h1 className="text-2xl font-bold font-serif text-brand-gold">SVI Infra Solutions Pvt. Ltd</h1>
                  <p className="text-sm">A-61 Sector 65 Noida Uttar Pradesh 201309</p>
                  <p className="text-sm">Cell: +91 9216014579 | Email: info@sviinfrasolutions.com</p>
                  <p className="text-sm">Website: www.sviinfrasolutions.in</p>
                </div>
              </div>
              
              <div className="text-center">
                <h2 className="text-xl font-bold uppercase tracking-wider underline">Payment Receipt</h2>
              </div>

              <div className="flex justify-between text-sm font-semibold">
                <p>Receipt No: <span className="text-red-600">{formData.receiptNo}</span></p>
                <p>Date: <span className="text-red-600">{formData.date}</span></p>
              </div>

              <div className="space-y-4 text-sm leading-relaxed mt-4">
                <p>Received with thanks from Mr. / Mrs. / M/s : <span className="font-bold border-b border-gray-400 pb-1">{formData.name}</span></p>
                <p>Ref. Id : <span className="font-bold">{formData.refId}</span></p>
                <p>The sum of Rupees : <span className="font-bold border-b border-gray-400 pb-1">₹ {formData.amount}</span></p>
                <p>Rupees in Words : <span className="font-bold border-b border-gray-400 pb-1">{formData.amountWords}</span></p>
                <p>By {formData.paymentMethod} No : <span className="font-bold border-b border-gray-400 pb-1">{formData.paymentRef}</span></p>
                
                <div className="flex justify-between gap-4">
                  <p>Drawn On : <span className="font-bold">{formData.drawnOn}</span></p>
                  <p>Plot No : <span className="font-bold">{formData.plotNo}</span></p>
                  <p>Plot Size : <span className="font-bold">{formData.plotSize}</span></p>
                </div>
                
                <p>On Account of : <span className="font-bold border-b border-gray-400 pb-1">{formData.account}</span></p>
              </div>

              <div className="mt-8 flex justify-between items-end pb-8">
                <div className="text-xl font-bold p-3 border-2 border-black inline-block">
                  ₹ {formData.amount}/-
                </div>
                <div className="text-center border-t border-gray-800 pt-2 w-48">
                  <p className="font-bold">Authorized Signatory</p>
                  <p className="text-xs text-gray-500 mt-1">Stamp & Signature</p>
                </div>
              </div>

              <p className="text-xs text-center italic text-gray-500 mt-4 border-t border-gray-200 pt-4">
                Thank you for your business. Please keep this receipt for your records.
              </p>
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center mt-10">Please fill out the form and generate your receipt to see the preview.</p>
          )}
        </div>

        {preview && (
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-4">Download Options</h3>
            <div className="grid grid-cols-2 gap-4">
              <button onClick={handleDownloadPDF} className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors">
                <Download className="w-5 h-5" /> Download PDF
              </button>
              <button onClick={handleDownloadImage} className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium py-3 rounded-lg transition-colors">
                <ImageIcon className="w-5 h-5" /> Save as Image
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}