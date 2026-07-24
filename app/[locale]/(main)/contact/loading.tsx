export default function ContactLoading() {
  return (
    <div className="bg-[#FDFBF7] dark:bg-gray-900">
      {/* ── Hero skeleton ─────────────────────────── */}
      <section className="relative overflow-hidden border-b border-gray-200/70 bg-[#FDFBF7] pt-28 pb-20 dark:border-gray-800 dark:bg-gray-900">
        <div className="container mx-auto px-4 text-center">
          <div className="mb-6 inline-block h-7 w-40 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />
          <div className="mx-auto mb-5 h-12 w-3/4 max-w-lg animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
          <div className="mx-auto h-4 w-full max-w-md animate-pulse rounded bg-gray-100 dark:bg-gray-800" />
          <div className="mx-auto mt-8 flex items-center justify-center gap-3">
            <div className="h-px w-12 bg-gray-200 dark:bg-gray-700" />
            <div className="h-1 w-1 rounded-full bg-gray-300 dark:bg-gray-600" />
            <div className="h-px w-12 bg-gray-200 dark:bg-gray-700" />
          </div>
        </div>
      </section>

      {/* ── Content skeleton ──────────────────────── */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto flex max-w-6xl flex-col gap-8 lg:flex-row lg:gap-10">
            {/* Sidebar skeleton */}
            <aside className="lg:w-[320px] lg:flex-shrink-0">
              <div className="sticky top-24 overflow-hidden rounded-2xl bg-white p-1 shadow-[0_4px_32px_rgba(0,0,0,0.06)] ring-1 ring-black/5 dark:bg-gray-800/80 dark:ring-white/[0.08]">
                <div className="rounded-[14px] bg-[#1a2744] p-7">
                  <div className="mb-1 h-3 w-16 animate-pulse rounded bg-white/10" />
                  <div className="mb-8 h-8 w-32 animate-pulse rounded bg-white/10" />
                  <div className="space-y-7">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="flex items-start gap-4">
                        <div className="h-8 w-8 flex-shrink-0 rounded-lg bg-[#d4af37]/12 ring-1 ring-[#d4af37]/20" />
                        <div className="min-w-0 flex-1 space-y-1.5">
                          <div className="h-3 w-20 animate-pulse rounded bg-white/10" />
                          <div className="h-4 w-36 animate-pulse rounded bg-white/10" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </aside>

            {/* Form + Map skeleton */}
            <div className="flex flex-1 flex-col gap-6 md:gap-8">
              <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-lg dark:border-gray-700 dark:bg-gray-900">
                <div className="mx-auto mb-6 h-8 w-48 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                <div className="space-y-4">
                  <div className="h-12 w-full animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800" />
                  <div className="h-12 w-full animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800" />
                  <div className="h-24 w-full animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800" />
                  <div className="h-12 w-full animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800" />
                </div>
              </div>
              <div className="flex h-[400px] w-full animate-pulse items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-800">
                <span className="text-xs text-gray-400">Loading map…</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
