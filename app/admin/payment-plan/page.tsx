'use client';

import { useState } from 'react';
import { Download, Image as ImageIcon, Calculator } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function PaymentPlanPage() {
  const [formData, setFormData] = useState({
    unitNo: '',
    plotSize: '',
    propertyType: 'Residential Farm House',
    costPerSqYd: '',
    bookingAmount: '',
    emis: '12',
    startDate: new Date().toISOString().split('T')[0]
  });

  const [preview, setPreview] = useState(false);
  const [schedule, setSchedule] = useState<any[]>([]);
  const [totals, setTotals] = useState({ totalCost: 0, balance: 0, emiAmount: 0 });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const calculatePlan = (e: React.FormEvent) => {
    e.preventDefault();
    
    const size = parseFloat(formData.plotSize) || 0;
    const rate = parseFloat(formData.costPerSqYd) || 0;
    const booking = parseFloat(formData.bookingAmount) || 0;
    const emiCount = parseInt(formData.emis) || 1;

    const totalCost = size * rate;
    const balance = totalCost - booking;
    const emiAmount = balance / emiCount;

    const newSchedule = [];
    const start = new Date(formData.startDate);

    for (let i = 1; i <= emiCount; i++) {
       const emiDate = new Date(start);
       emiDate.setMonth(start.getMonth() + i);
       
       newSchedule.push({
         month: i,
         date: emiDate.toLocaleDateString('en-GB'),
         amount: emiAmount.toFixed(2)
       });
    }

    setTotals({ totalCost, balance, emiAmount });
    setSchedule(newSchedule);
    setPreview(true);
  };

  const handleDownloadPDF = async () => {
    const element = document.getElementById('planPreview');
    if (!element) return;
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL('image/jpeg', 1.0);
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
    pdf.save('Payment_Plan.pdf');
  };

  const handleDownloadImage = async () => {
    const element = document.getElementById('planPreview');
    if (!element) return;
    const canvas = await html2canvas(element, { scale: 2 });
    const link = document.createElement('a');
    link.download = 'Payment_Plan.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Form Section */}
      <div className="bg-white dark:bg-[#16161f] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
        <h2 className="text-2xl font-serif text-brand-gold mb-6">Payment Plan Calculator</h2>
        <form onSubmit={calculatePlan} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Unit Number</label>
              <input type="text" name="unitNo" required value={formData.unitNo} onChange={handleChange} className="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-[#0e0e14] border border-gray-200 dark:border-gray-800 focus:border-brand-gold focus:ring-1 focus:ring-brand-gold outline-none transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Size of Plot (Sq. Yds.)</label>
              <input type="number" step="0.01" name="plotSize" required value={formData.plotSize} onChange={handleChange} className="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-[#0e0e14] border border-gray-200 dark:border-gray-800 focus:border-brand-gold focus:ring-1 focus:ring-brand-gold outline-none transition-colors" />
            </div>
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Property Type</label>
              <input type="text" name="propertyType" required value={formData.propertyType} onChange={handleChange} className="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-[#0e0e14] border border-gray-200 dark:border-gray-800 focus:border-brand-gold focus:ring-1 focus:ring-brand-gold outline-none transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cost / Sq.Yd (₹)</label>
              <input type="number" step="0.01" name="costPerSqYd" required value={formData.costPerSqYd} onChange={handleChange} className="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-[#0e0e14] border border-gray-200 dark:border-gray-800 focus:border-brand-gold focus:ring-1 focus:ring-brand-gold outline-none transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Booking Amount (₹)</label>
              <input type="number" step="0.01" name="bookingAmount" required value={formData.bookingAmount} onChange={handleChange} className="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-[#0e0e14] border border-gray-200 dark:border-gray-800 focus:border-brand-gold focus:ring-1 focus:ring-brand-gold outline-none transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">No of EMI's Required</label>
              <input type="number" min="1" max="120" name="emis" required value={formData.emis} onChange={handleChange} className="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-[#0e0e14] border border-gray-200 dark:border-gray-800 focus:border-brand-gold focus:ring-1 focus:ring-brand-gold outline-none transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Plan Start Date</label>
              <input type="date" name="startDate" required value={formData.startDate} onChange={handleChange} className="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-[#0e0e14] border border-gray-200 dark:border-gray-800 focus:border-brand-gold focus:ring-1 focus:ring-brand-gold outline-none transition-colors" />
            </div>
          </div>

          <button type="submit" className="w-full mt-6 flex items-center justify-center gap-2 bg-brand-gold text-black font-semibold py-3 px-4 rounded-lg hover:bg-yellow-500 transition-colors">
            <Calculator className="w-5 h-5" /> Calculate & Generate Plan
          </button>
        </form>
      </div>

      {/* Preview Section */}
      <div className="bg-white dark:bg-[#16161f] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col">
        <h2 className="text-2xl font-serif text-brand-gold mb-6">Payment Plan Preview</h2>
        
        <div className="flex-1 bg-gray-50 dark:bg-[#0e0e14] p-6 rounded-xl border border-gray-200 dark:border-gray-800 overflow-y-auto max-h-[600px]">
          {preview ? (
            <div id="planPreview" className="text-gray-800 bg-white p-8 rounded border border-gray-200 shadow-sm relative">
              <div className="text-center border-b-2 border-brand-gold pb-6 mb-6">
                <h1 className="text-2xl font-bold font-serif text-brand-gold">Payment Plan</h1>
                <p className="font-semibold mt-2">{formData.propertyType}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm mb-8 font-medium">
                <div>Unit Number: {formData.unitNo}</div>
                <div>Plot Size: {formData.plotSize} Sq. Yds.</div>
                <div>Cost/Sq.Yd: ₹ {formData.costPerSqYd}</div>
                <div>Total Cost: ₹ {totals.totalCost.toFixed(2)}</div>
                <div>Booking Amount: ₹ {formData.bookingAmount}</div>
                <div>Balance Amount: ₹ {totals.balance.toFixed(2)}</div>
              </div>

              <table className="w-full text-sm text-left border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 p-2">Month</th>
                    <th className="border border-gray-300 p-2">Expected Date</th>
                    <th className="border border-gray-300 p-2">Details</th>
                    <th className="border border-gray-300 p-2">Expected Amount (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="font-semibold bg-green-50">
                    <td className="border border-gray-300 p-2">0</td>
                    <td className="border border-gray-300 p-2">{new Date(formData.startDate).toLocaleDateString('en-GB')}</td>
                    <td className="border border-gray-300 p-2">Booking Amount</td>
                    <td className="border border-gray-300 p-2 underline">{parseFloat(formData.bookingAmount).toFixed(2)}</td>
                  </tr>
                  {schedule.map((row) => (
                    <tr key={row.month}>
                      <td className="border border-gray-300 p-2">{row.month}</td>
                      <td className="border border-gray-300 p-2">{row.date}</td>
                      <td className="border border-gray-300 p-2">EMI {row.month}</td>
                      <td className="border border-gray-300 p-2">{row.amount}</td>
                    </tr>
                  ))}
                  <tr className="font-bold bg-gray-100">
                    <td className="border border-gray-300 p-2" colSpan={3}>Grand Total</td>
                    <td className="border border-gray-300 p-2 underline text-red-600">₹ {totals.totalCost.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>

              <div className="mt-12 pt-8 text-center text-xs text-gray-500 border-t">
                Disclaimer: This is a computer generated document and does not require physical signature. Dates are approximate and subject to realization.
              </div>
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center mt-10">Please fill out the form and calculate the plan to see the schedule.</p>
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