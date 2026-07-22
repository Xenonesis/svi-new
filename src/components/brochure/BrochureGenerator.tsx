'use client';

import { useState } from 'react';
import { Download, Loader2, X } from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

export default function BrochureGenerator() {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsGenerating(true);
    setProgress(0);

    try {
      // 1. Inject name into the DOM
      const placeholder = document.getElementById('brochure-client-name-placeholder');
      if (placeholder) {
        placeholder.innerText = `Specially Prepared for: ${name.toUpperCase()}`;
        placeholder.classList.remove('hidden');
      }

      // 2. Initialize PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pages = [
        'page-1-cover',
        'page-2-promise',
        'page-3-growth',
        'page-4-masterplan',
        'page-5-lifestyle',
        'page-6-investment',
        'page-7-trust',
        'page-8-closing',
      ];

      for (let i = 0; i < pages.length; i++) {
        const element = document.getElementById(pages[i]);
        if (!element) continue;

        // html2canvas takes a snapshot
        const canvas = await html2canvas(element, { scale: 1.5, useCORS: true });
        const imgData = canvas.toDataURL('image/jpeg', 0.8);

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        if (i > 0) pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);

        setProgress(Math.round(((i + 1) / pages.length) * 100));
      }

      // Hide the placeholder again
      if (placeholder) {
        placeholder.classList.add('hidden');
      }

      pdf.save(`Shivani_Vatika_11th_Brochure_${name.replace(/\s+/g, '_')}.pdf`);
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGenerating(false);
      setProgress(0);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed right-8 bottom-8 z-50 flex h-16 w-16 items-center justify-center rounded-full bg-[#D4AF37] text-[#0F1A2E] shadow-2xl transition-transform hover:scale-110 hover:bg-[#C9A84C]"
        aria-label="Download Brochure"
      >
        <Download size={24} strokeWidth={2.5} />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
            <button
              onClick={() => !isGenerating && setIsOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-800"
              disabled={isGenerating}
            >
              <X size={24} />
            </button>

            <h3 className="font-heading mb-2 text-2xl font-bold text-[#0F1A2E]">
              Download Custom Brochure
            </h3>
            <p className="font-body mb-6 text-sm text-gray-500">
              Enter your details to generate a personalized high-resolution brochure.
            </p>

            <form onSubmit={handleGenerate} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-700">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isGenerating}
                  className="w-full rounded-lg border border-gray-300 p-3 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] focus:outline-none"
                  placeholder="e.g. Rahul Sharma"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-700">
                  Phone Number (Optional)
                </label>
                <input
                  type="tel"
                  disabled={isGenerating}
                  className="w-full rounded-lg border border-gray-300 p-3 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] focus:outline-none"
                  placeholder="+91"
                />
              </div>

              <button
                type="submit"
                disabled={isGenerating || !name.trim()}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-[#0F1A2E] py-3 font-semibold text-white transition-colors hover:bg-black disabled:opacity-70"
              >
                {isGenerating ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Generating PDF ({progress}%)...
                  </>
                ) : (
                  <>
                    <Download size={18} />
                    Generate PDF
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
