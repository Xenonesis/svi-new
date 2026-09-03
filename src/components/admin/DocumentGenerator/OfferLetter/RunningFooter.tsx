interface RunningFooterProps {
  pageNum: number;
  docReferenceNumber: string;
  companyName: string;
  language?: 'en' | 'hi';
}

export default function RunningFooter({
  pageNum,
  docReferenceNumber,
  companyName,
  language = 'en',
}: RunningFooterProps) {
  return (
    <div className="mt-auto grid grid-cols-[1fr_auto_auto] items-center gap-2 border-t border-gray-400 pt-2 text-[10.5px] text-gray-600">
      <div>
        <span className="font-bold text-gray-800">
          {language === 'hi' ? 'गोपनीय एवं सर्वाधिकार सुरक्षित' : 'CONFIDENTIAL & PROPRIETARY'}
        </span>{' '}
        &mdash; {companyName}
      </div>
      <div className="font-mono font-medium text-gray-700">
        {language === 'hi' ? 'संदर्भ' : 'Ref'}: {docReferenceNumber}
      </div>
      <div className="flex items-center gap-3">
        <span>
          {language === 'hi' ? 'अभ्यर्थी के आद्यक्षर:' : 'Candidate Initials:'}{' '}
          <span className="inline-block border-b border-gray-500 px-3 font-mono">______</span>
        </span>
        <span className="font-bold text-gray-900">
          {language === 'hi' ? `पृष्ठ ${pageNum} / 3` : `Page ${pageNum} of 3`}
        </span>
      </div>
    </div>
  );
}
