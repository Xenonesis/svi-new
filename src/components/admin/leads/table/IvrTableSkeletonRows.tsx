export function IvrTableSkeletonRows({ count = 8 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, idx) => (
        <tr
          key={idx}
          data-testid="ivr-table-skeleton-row"
          className="animate-pulse transition-colors"
          style={{ animationDelay: `${idx * 75}ms` }}
        >
          {/* Checkbox */}
          <td className="px-4 py-3.5">
            <div className="h-4 w-4 rounded-md bg-gray-200 dark:bg-white/10" />
          </td>

          {/* Customer Contact */}
          <td className="px-5 py-3.5">
            <div className="flex flex-col gap-1.5">
              <div className="h-4 w-28 rounded-md bg-gray-200 dark:bg-white/10" />
              <div className="h-3 w-16 rounded bg-gray-100 dark:bg-white/5" />
            </div>
          </td>

          {/* Attended By */}
          <td className="px-4 py-3.5">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 shrink-0 rounded-full bg-gray-200 dark:bg-white/10" />
              <div className="flex flex-col gap-1">
                <div className="h-3.5 w-20 rounded-md bg-gray-200 dark:bg-white/10" />
                <div className="h-2.5 w-14 rounded bg-gray-100 dark:bg-white/5" />
              </div>
            </div>
          </td>

          {/* Follow-up Advisor */}
          <td className="px-4 py-3.5">
            <div className="h-7 w-28 rounded-lg bg-gray-200 dark:bg-white/10" />
          </td>

          {/* Dial Status */}
          <td className="px-4 py-3.5">
            <div className="h-5 w-20 rounded-full bg-gray-200 dark:bg-white/10" />
          </td>

          {/* Call Duration */}
          <td className="px-4 py-3.5">
            <div className="flex flex-col gap-1.5">
              <div className="h-3.5 w-12 rounded bg-gray-200 dark:bg-white/10" />
              <div className="h-1.5 w-20 rounded-full bg-gray-100 dark:bg-white/5" />
            </div>
          </td>

          {/* Pressed Key */}
          <td className="px-4 py-3.5">
            <div className="h-6 w-8 rounded-lg bg-gray-200 dark:bg-white/10" />
          </td>

          {/* Lead Intent */}
          <td className="px-4 py-3.5">
            <div className="h-6 w-16 rounded-xl bg-gray-200 dark:bg-white/10" />
          </td>

          {/* Dialed At */}
          <td className="px-5 py-3.5 text-right">
            <div className="ml-auto flex flex-col items-end gap-1">
              <div className="h-3.5 w-20 rounded bg-gray-200 dark:bg-white/10" />
              <div className="h-2.5 w-14 rounded bg-gray-100 dark:bg-white/5" />
            </div>
          </td>
        </tr>
      ))}
    </>
  );
}
