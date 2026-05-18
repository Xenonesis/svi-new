'use client';

import { useState } from 'react';
import { Download, Image as ImageIcon, RefreshCw } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function BbaPage() {
  const [formData, setFormData] = useState({
    date: '',
    name: '',
    address: '',
    mobileNo: '',
    emailId: '',
    courseName: '',
    duration: '',
    semester: '',
    fees: '',
    admissionDate: ''
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
    const element = document.getElementById('bbaPreview');
    if (!element) return;
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL('image/jpeg', 1.0);
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
    pdf.save('BBA_Document.pdf');
  };

  const handleDownloadImage = async () => {
    const element = document.getElementById('bbaPreview');
    if (!element) return;
    const canvas = await html2canvas(element, { scale: 2 });
    const link = document.createElement('a');
    link.download = 'BBA_Document.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-white dark:bg-[#16161f] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
        <h2 className="text-2xl font-serif text-brand-gold mb-6">BBA Document Generator</h2>
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Student Name</label>
              <input
                type="text"
                name="name"
                required
                placeholder="Enter student name"
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
                placeholder="Mobile number"
                value={formData.mobileNo}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-[#0e0e14] border border-gray-200 dark:border-gray-800 focus:border-brand-gold focus:ring-1 focus:ring-brand-gold outline-none transition-colors"
              />
            </div>
            <div>
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Course Name</label>
              <input
                type="text"
                name="courseName"
                required
                placeholder="e.g., Bachelor of Business Administration"
                value={formData.courseName}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-[#0e0e14] border border-gray-200 dark:border-gray-800 focus:border-brand-gold focus:ring-1 focus:ring-brand-gold outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Duration</label>
              <input
                type="text"
                name="duration"
                required
                placeholder="e.g., 3 Years"
                value={formData.duration}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-[#0e0e14] border border-gray-200 dark:border-gray-800 focus:border-brand-gold focus:ring-1 focus:ring-brand-gold outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Semester</label>
              <input
                type="text"
                name="semester"
                required
                placeholder="e.g., Semester IV"
                value={formData.semester}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-[#0e0e14] border border-gray-200 dark:border-gray-800 focus:border-brand-gold focus:ring-1 focus:ring-brand-gold outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Total Fees</label>
              <input
                type="number"
                step="0.01"
                name="fees"
                required
                value={formData.fees}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-[#0e0e14] border border-gray-200 dark:border-gray-800 focus:border-brand-gold focus:ring-1 focus:ring-brand-gold outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Admission Date</label>
              <input
                type="date"
                name="admissionDate"
                required
                value={formData.admissionDate}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-[#0e0e14] border border-gray-200 dark:border-gray-800 focus:border-brand-gold focus:ring-1 focus:ring-brand-gold outline-none transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-6 flex items-center justify-center gap-2 bg-brand-gold text-black font-semibold py-3 px-4 rounded-lg hover:bg-yellow-500 transition-colors"
          >
            <RefreshCw className="w-5 h-5" /> Generate BBA Document
          </button>
        </form>
      </div>

      <div className="bg-white dark:bg-[#16161f] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col">
        <div className="flex items-baseline justify-between mb-6">
          <h2 className="text-2xl font-serif text-brand-gold">BBA Document Preview</h2>
          <span className="text-sm text-gray-500 dark:text-gray-400">Generated Document</span>
        </div>

        <div className="flex-1 bg-gray-50 dark:bg-[#0e0e14] p-6 rounded-xl border border-gray-200 dark:border-gray-800 overflow-y-auto">
          {preview ? (
            <div
              id="bbaPreview"
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
                <p><span className="font-semibold">Mobile:</span> {formData.mobileNo}</p>
                <p><span className="font-semibold">Email:</span> {formData.emailId}</p>
              </div>

              <div className="text-sm">
                <p className="font-semibold underline">Subject: BBA Course Enrollment - {formData.courseName}</p>
              </div>

              <div className="text-sm leading-relaxed space-y-4">
                <p>Dear {formData.name},</p>
                <p>
                  We are pleased to confirm your enrollment in the <span className="font-semibold">{formData.courseName}</span> program
                  at SVI Infra Solutions Pvt. Ltd. This is a <span className="font-semibold">{formData.duration}</span> course.
                </p>
                <p>
                  You are currently enrolled in <span className="font-semibold">{formData.semester}</span>. Your admission date was
                  <span className="font-semibold"> {formData.admissionDate}</span>. The total course fees amount to
                  <span className="font-semibold"> ₹{formData.fees}</span>.
                </p>
                <p>
                  Please ensure all fee payments are made on time to continue your studies without interruption.
                  For any queries regarding your course, please contact the administration office.
                </p>
              </div>

              <div className="pt-6 text-sm">
                <p>Warm regards,</p>
                <p className="font-semibold mt-6">Authorized Signatory</p>
                <p>SVI Infra Solutions Pvt. Ltd</p>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center mt-10">Please fill out the form and generate the BBA document.</p>
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
