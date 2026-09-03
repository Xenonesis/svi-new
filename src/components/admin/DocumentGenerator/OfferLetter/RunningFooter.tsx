interface RunningFooterProps {
  pageNum: number;
  docReferenceNumber: string;
  companyName: string;
}

export default function RunningFooter({
  pageNum,
  docReferenceNumber,
  companyName,
}: RunningFooterProps) {
  return (
    <div className="mt-auto grid grid-cols-[1fr_auto_auto] items-center gap-2 border-t border-gray-400 pt-2 text-[10.5px] text-gray-600">
      <div>
        <span className="font-bold text-gray-800">CONFIDENTIAL &amp; PROPRIETARY</span> &mdash;{' '}
        {companyName}
      </div>
      <div className="font-mono font-medium text-gray-700">Ref: {docReferenceNumber}</div>
      <div className="flex items-center gap-3">
        <span>
          Candidate Initials:{' '}
          <span className="inline-block border-b border-gray-500 px-3 font-mono">______</span>
        </span>
        <span className="font-bold text-gray-900">Page {pageNum} of 3</span>
      </div>
    </div>
  );
}
