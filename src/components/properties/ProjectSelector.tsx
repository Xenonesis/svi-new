'use client';

type ProjectOption = {
  id: string;
  name: string;
  pricePerSqYd: number;
};

type ProjectSelectorProps = {
  projectOptions: ProjectOption[];
  selectedProjectId: string;
  onProjectChange: (id: string) => void;
  plotSize: number;
  onPlotSizeChange: (size: number) => void;
  selectedProject: ProjectOption;
  hasFixedPrice: boolean;
};

export default function ProjectSelector({
  projectOptions,
  selectedProjectId,
  onProjectChange,
  plotSize,
  onPlotSizeChange,
  selectedProject,
  hasFixedPrice,
}: ProjectSelectorProps) {
  return (
    <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-900">
      <div className="grid gap-4 md:grid-cols-2 md:items-end">
        <div>
          <label className="mb-1.5 block text-xs font-bold tracking-wider text-gray-500 uppercase">
            Select Project
          </label>
          <select
            value={selectedProjectId}
            onChange={(e) => onProjectChange(e.target.value)}
            className="focus:border-brand-gold focus:ring-brand-gold w-full rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm transition-all outline-none focus:ring-1 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          >
            {projectOptions.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {hasFixedPrice ? (
          <div className="rounded-lg bg-gray-50 p-4 text-center dark:bg-gray-800">
            <p className="text-xs font-bold tracking-wider text-gray-500 uppercase">Base Price</p>
            <p className="text-brand-gold text-2xl font-bold">
              ₹{selectedProject.pricePerSqYd.toLocaleString('en-IN')}
              <span className="text-sm font-normal text-gray-400">/sq.yd.</span>
            </p>
          </div>
        ) : (
          <div className="rounded-lg bg-gray-50 p-4 text-center dark:bg-gray-800">
            <p className="text-xs font-bold tracking-wider text-gray-500 uppercase">
              Investment Type
            </p>
            <p className="text-brand-navy text-lg font-bold dark:text-gray-200">Flexible Amount</p>
          </div>
        )}
      </div>

      {hasFixedPrice && (
        <div className="mt-5 border-t border-gray-100 pt-5 dark:border-gray-700">
          <div className="flex items-baseline justify-between">
            <span className="text-xs font-bold tracking-wider text-gray-500 uppercase">
              Plot Size
            </span>
            <span className="text-brand-gold text-lg font-bold">{plotSize} sq.yd.</span>
          </div>
          <input
            type="range"
            min={50}
            max={200}
            step={10}
            value={plotSize}
            onChange={(e) => onPlotSizeChange(Number(e.target.value))}
            className="accent-brand-gold mt-3 h-2 w-full cursor-pointer appearance-none rounded-full bg-gray-200 outline-none dark:bg-gray-700"
          />
          <div className="mt-1 flex justify-between text-xs text-gray-400">
            <span>50 sq.yd.</span>
            <span>200 sq.yd.</span>
          </div>
          <div className="bg-brand-gold/10 mt-4 flex items-baseline justify-between rounded-lg px-4 py-3">
            <span className="text-sm font-bold tracking-wider text-gray-600 uppercase dark:text-gray-400">
              Estimated Value
            </span>
            <span className="text-brand-navy text-xl font-bold dark:text-gray-200">
              ₹{(plotSize * selectedProject.pricePerSqYd).toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
