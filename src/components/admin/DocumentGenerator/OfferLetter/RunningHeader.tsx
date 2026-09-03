interface RunningHeaderProps {
  docReferenceNumber: string;
  language?: 'en' | 'hi';
}

export default function RunningHeader({ docReferenceNumber, language = 'en' }: RunningHeaderProps) {
  return (
    <div className="mb-2.5 grid grid-cols-[1fr_auto] items-center border-b border-gray-400 pb-1.5 text-[11px] text-gray-700">
      <div className="flex items-center gap-2">
        <img
          src="/icons/icon-192x192.png"
          alt="Company Logo"
          className="h-6 w-6 rounded-xs object-contain"
          onError={(e) => (e.currentTarget.style.display = 'none')}
        />
        <span className="text-gray-300">|</span>
        <span className="text-[10.5px] font-semibold tracking-wide text-gray-800 uppercase">
          {language === 'hi'
            ? 'रोजगार अनुबंध एवं नियुक्ति प्रस्ताव पत्र'
            : 'Employment Contract & Offer of Appointment'}
        </span>
      </div>
      <div className="text-right font-mono text-[10.5px] font-bold text-[#1e3a8a]">
        {docReferenceNumber}
      </div>
    </div>
  );
}
