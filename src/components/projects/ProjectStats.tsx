type ProjectStatsProps = {
  totalPlots?: string;
  startingSize?: string;
  isHindi?: boolean;
};

export default function ProjectStats({ totalPlots, startingSize, isHindi }: ProjectStatsProps) {
  if (!totalPlots && !startingSize) return null;

  return (
    <div className="mb-10 grid grid-cols-2 gap-6">
      {totalPlots && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <span className="text-brand-navy mb-2 text-4xl font-bold dark:text-white">
            {totalPlots}
          </span>
          <span className="text-sm font-bold tracking-wider text-gray-500 uppercase dark:text-gray-400">
            {isHindi ? 'कुल प्लॉट्स' : 'Total Plots'}
          </span>
        </div>
      )}
      {startingSize && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <span className="text-brand-navy mb-2 text-3xl font-bold dark:text-white">
            {startingSize}
          </span>
          <span className="text-sm font-bold tracking-wider text-gray-500 uppercase dark:text-gray-400">
            {isHindi ? 'शुरुआती आकार' : 'Starting Size'}
          </span>
        </div>
      )}
    </div>
  );
}
