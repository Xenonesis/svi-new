export default function ChangelogLoading() {
  return (
    <div className="dark:bg-brand-dark-bg min-h-screen bg-gray-50 pt-24 pb-20">
      {/* Hero skeleton */}
      <section className="bg-brand-navy relative overflow-hidden py-16 md:py-20">
        <div className="relative z-10 container mx-auto flex flex-col items-center gap-4 px-4 text-center">
          <div
            className="h-7 w-40 rounded-full bg-white/10"
            style={{ animation: 'pulse 2s ease-in-out infinite' }}
          />
          <div
            className="h-10 w-72 rounded bg-white/10 md:w-96"
            style={{ animation: 'pulse 2s ease-in-out 0.1s infinite' }}
          />
          <div
            className="bg-brand-gold/20 h-10 w-56 rounded"
            style={{ animation: 'pulse 2s ease-in-out 0.2s infinite' }}
          />
          <div
            className="mt-2 h-4 w-full max-w-2xl rounded bg-white/10"
            style={{ animation: 'pulse 2s ease-in-out 0.3s infinite' }}
          />
        </div>
      </section>

      {/* Stats skeleton */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto max-w-5xl px-4 md:px-8">
          <div className="mb-8 grid grid-cols-2 gap-4 rounded-2xl border border-gray-200 bg-white p-6 md:grid-cols-4 dark:border-gray-700 dark:bg-gray-800">
            {[0, 0.1, 0.2, 0.3].map((d, i) => (
              <div key={i} className="flex flex-col gap-2">
                <div
                  className="h-3 w-20 rounded bg-gray-200 dark:bg-gray-700"
                  style={{ animation: `pulse 2s ${d}s infinite` }}
                />
                <div
                  className="bg-brand-gold/20 h-8 w-24 rounded"
                  style={{ animation: `pulse 2s ${d + 0.1}s infinite` }}
                />
              </div>
            ))}
          </div>

          {/* Timeline skeleton */}
          <div className="space-y-8">
            {[0, 0.15, 0.3].map((d, i) => (
              <div
                key={i}
                className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800"
                style={{ animation: `pulse 2s ${d}s infinite` }}
              >
                <div className="mb-3 flex items-center gap-2">
                  <div className="h-5 w-16 rounded-full bg-gray-200 dark:bg-gray-700" />
                  <div className="h-5 w-24 rounded-full bg-gray-100 dark:bg-gray-800" />
                </div>
                <div className="mb-3 h-6 w-3/4 rounded bg-gray-200 dark:bg-gray-700" />
                <div className="mb-4 flex gap-3">
                  <div className="h-4 w-20 rounded bg-gray-100 dark:bg-gray-800" />
                  <div className="h-4 w-28 rounded bg-gray-100 dark:bg-gray-800" />
                </div>
                <div className="space-y-2">
                  <div className="h-3 w-full rounded bg-gray-100 dark:bg-gray-800" />
                  <div className="h-3 w-5/6 rounded bg-gray-100 dark:bg-gray-800" />
                  <div className="h-3 w-4/6 rounded bg-gray-100 dark:bg-gray-800" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
