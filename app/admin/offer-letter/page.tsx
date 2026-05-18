'use client';

import { useState } from 'react';
import { Download, Image as ImageIcon, RefreshCw } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function OfferLetterPage() {
  const [formData, setFormData] = useState({
    date: '',
    name: '',
    address: '',
    mobileNo: '',
    alternativeNo: '',
    emailId: '',
    designation: '',
    department: '',
    reportingTo: '',
    appointmentDate: '',
    location: '',
    salaryCtc: '',
    target: '',
    offerSlab: ''
  });

  const [preview, setPreview] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPreview(true);
  };

  const handleDownloadPDF = async () => {
    const element = document.getElementById('offerPreview');
    if (!element) return;
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL('image/jpeg', 1.0);
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
    pdf.save('Offer_Letter.pdf');
  };

  const handleDownloadImage = async () => {
    const element = document.getElementById('offerPreview');
    if (!element) return;
    const canvas = await html2canvas(element, { scale: 2 });
    const link = document.createElement('a');
    link.download = 'Offer_Letter.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-white dark:bg-[#16161f] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
        <h2 className="text-2xl font-serif text-brand-gold mb-6">Offer Letter Generator</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
              <input
                type="date"
                name="date"
                required
                value={formData.date}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-[#0e0e14] border border-gray-200 dark:border-gray-800 focus:border-brand-gold focus:ring-1 focus:ring-brand-gold outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
              <input
                type="text"
                name="name"
                required
                placeholder="Enter name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-[#0e0e14] border border-gray-200 dark:border-gray-800 focus:border-brand-gold focus:ring-1 focus:ring-brand-gold outline-none transition-colors"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label>
              <textarea
                name="address"
                required
                placeholder="Enter address"
                value={formData.address}
                onChange={handleChange}
                rows={2}
                className="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-[#0e0e14] border border-gray-200 dark:border-gray-800 focus:border-brand-gold focus:ring-1 focus:ring-brand-gold outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mobile No</label>
              <input
                type="text"
                name="mobileNo"
                required
                placeholder="Primary mobile"
                value={formData.mobileNo}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-[#0e0e14] border border-gray-200 dark:border-gray-800 focus:border-brand-gold focus:ring-1 focus:ring-brand-gold outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Alternative No</label>
              <input
                type="text"
                name="alternativeNo"
                placeholder="Alternative mobile (optional)"
                value={formData.alternativeNo}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-[#0e0e14] border border-gray-200 dark:border-gray-800 focus:border-brand-gold focus:ring-1 focus:ring-brand-gold outline-none transition-colors"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email ID</label>
              <input
                type="email"
                name="emailId"
                required
                placeholder="Email address"
                value={formData.emailId}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-[#0e0e14] border border-gray-200 dark:border-gray-800 focus:border-brand-gold focus:ring-1 focus:ring-brand-gold outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Designation</label>
              <input
                type="text"
                name="designation"
                required
                placeholder="Offered designation"
                value={formData.designation}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-[#0e0e14] border border-gray-200 dark:border-gray-800 focus:border-brand-gold focus:ring-1 focus:ring-brand-gold outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Department</label>
              <input
                type="text"
                name="department"
                required
                placeholder="Department"
                value={formData.department}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-[#0e0e14] border border-gray-200 dark:border-gray-800 focus:border-brand-gold focus:ring-1 focus:ring-brand-gold outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Reporting To</label>
              <input
                type="text"
                name="reportingTo"
                required
                placeholder="Reporting person"
                value={formData.reportingTo}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-[#0e0e14] border border-gray-200 dark:border-gray-800 focus:border-brand-gold focus:ring-1 focus:ring-brand-gold outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Appointment Date</label>
              <input
                type="date"
                name="appointmentDate"
                required
                value={formData.appointmentDate}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-[#0e0e14] border border-gray-200 dark:border-gray-800 focus:border-brand-gold focus:ring-1 focus:ring-brand-gold outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location of Posting</label>
              <input
                type="text"
                name="location"
                required
                placeholder="Location"
                value={formData.location}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-[#0e0e14] border border-gray-200 dark:border-gray-800 focus:border-brand-gold focus:ring-1 focus:ring-brand-gold outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Salary (CTC) Per Month</label>
              <input
                type="number"
                step="0.01"
                name="salaryCtc"
                required
                value={formData.salaryCtc}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-[#0e0e14] border border-gray-200 dark:border-gray-800 focus:border-brand-gold focus:ring-1 focus:ring-brand-gold outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Target</label>
              <input
                type="text"
                name="target"
                required
                placeholder="Target"
                value={formData.target}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-[#0e0e14] border border-gray-200 dark:border-gray-800 focus:border-brand-gold focus:ring-1 focus:ring-brand-gold outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Offer Slab Per Month</label>
              <input
                type="text"
                name="offerSlab"
                required
                placeholder="Enter Slab"
                value={formData.offerSlab}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-[#0e0e14] border border-gray-200 dark:border-gray-800 focus:border-brand-gold focus:ring-1 focus:ring-brand-gold outline-none transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-6 flex items-center justify-center gap-2 bg-brand-gold text-black font-semibold py-3 px-4 rounded-lg hover:bg-yellow-500 transition-colors"
          >
            <RefreshCw className="w-5 h-5" /> Generate Offer Letter
          </button>
        </form>
      </div>

      <div className="bg-white dark:bg-[#16161f] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col">
        <div className="flex items-baseline justify-between mb-6">
          <h2 className="text-2xl font-serif text-brand-gold">Offer Letter Preview</h2>
          <span className="text-sm text-gray-500 dark:text-gray-400">Generated Document</span>
        </div>

        <div className="flex-1 bg-gray-50 dark:bg-[#0e0e14] p-6 rounded-xl border border-gray-200 dark:border-gray-800 overflow-y-auto">
          {preview ? (
            <div
              id="offerPreview"
              className="space-y-6 text-gray-800 bg-white p-8 rounded border border-gray-200 shadow-sm relative"
            >
              <div className="border-b-2 border-brand-gold pb-4">
                <h1 className="text-2xl font-bold font-serif text-brand-gold">SVI Infra Solutions Pvt. Ltd</h1>
                <p className="text-sm">A-61 Sector 65 Noida Uttar Pradesh 201309</p>
                <p className="text-sm">Cell: +91 9216014579 | Email: info@sviinfrasolutions.com</p>
                <p className="text-sm">Website: www.sviinfrasolutions.in</p>
              </div>

              <div className="text-sm space-y-1">
                <p><span className="font-semibold">Date:</span> {formData.date}</p>
                <p><span className="font-semibold">To:</span> {formData.name}</p>
                <p><span className="font-semibold">Address:</span> {formData.address}</p>
                <p><span className="font-semibold">Mobile:</span> {formData.mobileNo}{formData.alternativeNo ? ` / ${formData.alternativeNo}` : ''}</p>
                <p><span className="font-semibold">Email:</span> {formData.emailId}</p>
              </div>

              <div className="text-sm">
                <p className="font-semibold underline">Subject: Offer Letter - {formData.designation}</p>
              </div>

              <div className="text-sm leading-relaxed space-y-4">
                <p>Dear {formData.name},</p>
                <p>
                  We are pleased to offer you the position of <span className="font-semibold">{formData.designation}</span> in the
                  <span className="font-semibold"> {formData.department}</span> department at SVI Infra Solutions Pvt. Ltd.
                  You will report to <span className="font-semibold">{formData.reportingTo}</span> and be based at
                  <span className="font-semibold"> {formData.location}</span>.
                </p>
                <p>
                  Your appointment date is <span className="font-semibold">{formData.appointmentDate}</span>. The monthly CTC offered is
                  <span className="font-semibold"> ₹{formData.salaryCtc}</span> with a target of
                  <span className="font-semibold"> {formData.target}</span> and offer slab per month of
                  <span className="font-semibold"> {formData.offerSlab}</span>.
                </p>
                <p>
                  Please confirm your acceptance of this offer by signing and returning a copy of this letter.
                  We look forward to welcoming you to the team.
                </p>
              </div>

              <div className="pt-6 text-sm">
                <p>Warm regards,</p>
                <p className="font-semibold mt-6">Authorized Signatory</p>
                <p>SVI Infra Solutions Pvt. Ltd</p>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center mt-10">Please fill out the form and generate the offer letter.</p>
          )}
        </div>

        <div className="mt-6">
          <h3 className="text-lg font-medium mb-4">Download Options</h3>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={handleDownloadPDF}
              disabled={!preview}
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-5 h-5" /> Download as PDF
            </button>
            <button
              onClick={handleDownloadImage}
              disabled={!preview}
              className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ImageIcon className="w-5 h-5" /> Save as Image
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
