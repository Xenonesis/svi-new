'use client';

import { useState } from 'react';
import { Download, Image as ImageIcon, RefreshCw } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function AllotmentLetterPage() {
  const [formData, setFormData] = useState({
    clientName: '',
    address: '',
    ticketId: '',
    projectName: 'Shyam Aangan',
    unitNumber: '',
    area: '',
    bsp: '',
    plc: '',
    paymentPlan: '12',
    bookingDate: '',
    secondPaymentDays: '15',
    advisorName: '',
    advisorNumber: ''
  });

  const [preview, setPreview] = useState(false);

  const calculateTotalCost = () => {
    const area = parseFloat(formData.area) || 0;
    const bsp = parseFloat(formData.bsp) || 0;
    const plc = parseFloat(formData.plc) || 0;
    
    let base = area * bsp;
    let plcAmount = base * (plc / 100);
    return base + plcAmount;
  };

  const totalCost = calculateTotalCost();
  const initialPayment = totalCost * 0.1;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPreview(true);
  };

  const handleDownloadPDF = async () => {
    const element = document.getElementById('allotmentPreview');
    if (!element) return;
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL('image/jpeg', 1.0);
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
    pdf.save('Allotment_Letter.pdf');
  };

  const handleDownloadImage = async () => {
    const element = document.getElementById('allotmentPreview');
    if (!element) return;
    const canvas = await html2canvas(element, { scale: 2 });
    const link = document.createElement('a');
    link.download = 'Allotment_Letter.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Form Section */}
      <div className="bg-white dark:bg-[#16161f] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
        <h2 className="text-2xl font-serif text-brand-gold mb-6">Enter Your Details</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Client Name</label>
              <input type="text" name="clientName" required value={formData.clientName} onChange={handleChange} className="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-[#0e0e14] border border-gray-200 dark:border-gray-800 focus:border-brand-gold focus:ring-1 focus:ring-brand-gold outline-none transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label>
              <input type="text" name="address" required value={formData.address} onChange={handleChange} className="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-[#0e0e14] border border-gray-200 dark:border-gray-800 focus:border-brand-gold focus:ring-1 focus:ring-brand-gold outline-none transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ticket ID</label>
              <input type="text" name="ticketId" required value={formData.ticketId} onChange={handleChange} className="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-[#0e0e14] border border-gray-200 dark:border-gray-800 focus:border-brand-gold focus:ring-1 focus:ring-brand-gold outline-none transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Project Name</label>
              <select name="projectName" value={formData.projectName} onChange={handleChange} className="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-[#0e0e14] border border-gray-200 dark:border-gray-800 focus:border-brand-gold focus:ring-1 focus:ring-brand-gold outline-none transition-colors">
                <option value="Shyam Aangan">Shyam Aangan</option>
                <option value="Shyam Aangan Farm House">Shyam Aangan Farm House</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Unit Number</label>
              <input type="text" name="unitNumber" required value={formData.unitNumber} onChange={handleChange} className="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-[#0e0e14] border border-gray-200 dark:border-gray-800 focus:border-brand-gold focus:ring-1 focus:ring-brand-gold outline-none transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Area (Sq. Yds.)</label>
              <input type="number" step="0.01" name="area" required value={formData.area} onChange={handleChange} className="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-[#0e0e14] border border-gray-200 dark:border-gray-800 focus:border-brand-gold focus:ring-1 focus:ring-brand-gold outline-none transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">BSP (Per Sq.Yd)</label>
              <input type="number" step="0.01" name="bsp" required value={formData.bsp} onChange={handleChange} className="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-[#0e0e14] border border-gray-200 dark:border-gray-800 focus:border-brand-gold focus:ring-1 focus:ring-brand-gold outline-none transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">PLC (%)</label>
              <input type="number" step="0.01" name="plc" value={formData.plc} onChange={handleChange} className="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-[#0e0e14] border border-gray-200 dark:border-gray-800 focus:border-brand-gold focus:ring-1 focus:ring-brand-gold outline-none transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Payment Plan (Months)</label>
              <select name="paymentPlan" value={formData.paymentPlan} onChange={handleChange} className="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-[#0e0e14] border border-gray-200 dark:border-gray-800 focus:border-brand-gold focus:ring-1 focus:ring-brand-gold outline-none transition-colors">
                <option value="3">3 Months</option>
                <option value="6">6 Months</option>
                <option value="12">12 Months</option>
                <option value="18">18 Months</option>
                <option value="24">24 Months</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Booking Date</label>
              <input type="date" name="bookingDate" required value={formData.bookingDate} onChange={handleChange} className="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-[#0e0e14] border border-gray-200 dark:border-gray-800 focus:border-brand-gold focus:ring-1 focus:ring-brand-gold outline-none transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Second Payment Days</label>
              <select name="secondPaymentDays" value={formData.secondPaymentDays} onChange={handleChange} className="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-[#0e0e14] border border-gray-200 dark:border-gray-800 focus:border-brand-gold focus:ring-1 focus:ring-brand-gold outline-none transition-colors">
                <option value="15">15 days</option>
                <option value="28">28 days</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Advisor Name</label>
              <input type="text" name="advisorName" required value={formData.advisorName} onChange={handleChange} className="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-[#0e0e14] border border-gray-200 dark:border-gray-800 focus:border-brand-gold focus:ring-1 focus:ring-brand-gold outline-none transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Advisor Number</label>
              <input type="text" name="advisorNumber" required value={formData.advisorNumber} onChange={handleChange} className="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-[#0e0e14] border border-gray-200 dark:border-gray-800 focus:border-brand-gold focus:ring-1 focus:ring-brand-gold outline-none transition-colors" />
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-[#0e0e14] p-4 rounded-xl border border-gray-200 dark:border-gray-800 mt-6">
            <p className="font-medium">Total Cost: ₹{totalCost.toFixed(2)}</p>
            <p className="font-medium text-brand-gold">Initial Payment (10%): ₹{initialPayment.toFixed(2)}</p>
          </div>

          <button type="submit" className="w-full flex items-center justify-center gap-2 bg-brand-gold text-black font-semibold py-3 px-4 rounded-lg hover:bg-yellow-500 transition-colors">
            <RefreshCw className="w-5 h-5" /> Generate Allotment Letter
          </button>
        </form>
      </div>

      {/* Preview Section */}
      <div className="bg-white dark:bg-[#16161f] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col">
        <h2 className="text-2xl font-serif text-brand-gold mb-6">Allotment Letter Preview</h2>
        
        <div className="flex-1 bg-gray-50 dark:bg-[#0e0e14] p-6 rounded-xl border border-gray-200 dark:border-gray-800 overflow-y-auto">
          {preview ? (
            <div id="allotmentPreview" className="space-y-4 text-gray-800 dark:text-gray-200 bg-white dark:bg-black p-8 rounded border border-gray-200 dark:border-gray-800 shadow-sm relative">
              <h1 className="text-xl font-bold text-center border-b pb-4 mb-6 uppercase">Allotment Letter</h1>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="font-semibold">Client Name:</span> {formData.clientName}</div>
                <div><span className="font-semibold">Project:</span> {formData.projectName}</div>
                <div><span className="font-semibold">Ticket ID:</span> {formData.ticketId}</div>
                <div><span className="font-semibold">Unit Number:</span> {formData.unitNumber}</div>
                <div className="col-span-2"><span className="font-semibold">Address:</span> {formData.address}</div>
                <div><span className="font-semibold">Area:</span> {formData.area} Sq. Yds.</div>
                <div><span className="font-semibold">BSP:</span> ₹{formData.bsp} / Sq.Yd</div>
                <div><span className="font-semibold">PLC:</span> {formData.plc || 0}%</div>
                <div><span className="font-semibold">Plan:</span> {formData.paymentPlan} Months</div>
              </div>
              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-800 space-y-2 text-sm">
                <p><span className="font-semibold">Total Cost:</span> ₹{totalCost.toFixed(2)}</p>
                <p><span className="font-semibold">Initial Payment (10%):</span> ₹{initialPayment.toFixed(2)}</p>
                <p><span className="font-semibold">Booking Date:</span> {formData.bookingDate}</p>
                <p><span className="font-semibold">Second Payment:</span> {formData.secondPaymentDays} days after booking</p>
              </div>
              <div className="mt-8 grid grid-cols-2 gap-4 text-sm">
                <div><span className="font-semibold">Advisor:</span> {formData.advisorName}</div>
                <div><span className="font-semibold">Contact:</span> {formData.advisorNumber}</div>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center mt-10">Please fill out the form and generate your allotment letter to see the preview.</p>
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