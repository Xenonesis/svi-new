export default function MainLoading() {
  return (
    <div className="dark:bg-brand-dark-bg flex min-h-screen w-full flex-col bg-gray-50">
      {/* Hero skeleton */}
      <div className="bg-brand-navy relative flex min-h-[60vh] items-center justify-center overflow-hidden">
        {/* Shimmer overlay */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'linear-gradient(105deg, transparent 40%, rgba(212, 175, 55,0.04) 50%, transparent 60%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 2s ease-in-out infinite',
          }}
        />

        <div className="z-10 flex w-full max-w-xl flex-col items-center gap-5 px-6 text-center">
          {/* Eyebrow */}
          <div
            className="h-3 w-32 rounded-full bg-white/10"
            style={{ animation: 'pulse 2s ease-in-out infinite' }}
          />
          {/* Heading lines */}
          <div className="flex w-full flex-col items-center gap-3">
            <div
              className="h-8 w-3/4 rounded bg-white/10"
              style={{ animation: 'pulse 2s ease-in-out 0.1s infinite' }}
            />
            <div
              className="bg-brand-gold/20 h-8 w-1/2 rounded"
              style={{ animation: 'pulse 2s ease-in-out 0.2s infinite' }}
            />
          </div>
          {/* Paragraph lines */}
          <div className="flex w-full flex-col items-center gap-2">
            <div
              className="h-4 w-full rounded bg-white/10"
              style={{ animation: 'pulse 2s ease-in-out 0.3s infinite' }}
            />
            <div
              className="h-4 w-4/5 rounded bg-white/10"
              style={{ animation: 'pulse 2s ease-in-out 0.4s infinite' }}
            />
          </div>
          {/* Buttons */}
          <div className="mt-2 flex gap-4">
            <div
              className="bg-brand-gold/30 h-11 w-36 rounded"
              style={{ animation: 'pulse 2s ease-in-out 0.5s infinite' }}
            />
            <div
              className="h-11 w-28 rounded bg-white/10"
              style={{ animation: 'pulse 2s ease-in-out 0.6s infinite' }}
            />
          </div>
        </div>

        {/* Slide dots */}
        <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-2 rounded-full bg-white/20"
              style={{
                width: i === 0 ? '28px' : '10px',
                animation: `pulse 2s ease-in-out ${i * 0.2}s infinite`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Content section skeleton */}
      <div className="bg-white py-16 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center gap-12 lg:flex-row">
            {/* Left text block */}
            <div className="flex flex-1 flex-col gap-4">
              <div
                className="h-3 w-24 rounded-full bg-gray-200 dark:bg-gray-700"
                style={{ animation: 'pulse 2s infinite' }}
              />
              <div
                className="h-10 w-3/4 rounded bg-gray-200 dark:bg-gray-700"
                style={{ animation: 'pulse 2s 0.1s infinite' }}
              />
              <div className="flex flex-col gap-2">
                {[0.2, 0.3, 0.4, 0.5].map((d) => (
                  <div
                    key={d}
                    className="h-4 rounded bg-gray-100 dark:bg-gray-800"
                    style={{
                      width: `${80 + Math.random() * 20}%`,
                      animation: `pulse 2s ${d}s infinite`,
                    }}
                  />
                ))}
              </div>
              <div
                className="mt-4 h-10 w-36 rounded bg-gray-200 dark:bg-gray-700"
                style={{ animation: 'pulse 2s 0.6s infinite' }}
              />
            </div>

            {/* Right image block */}
            <div className="relative flex-1">
              <div
                className="h-80 w-full rounded bg-gray-200 dark:bg-gray-700"
                style={{ animation: 'pulse 2s 0.2s infinite' }}
              />
              <div
                className="bg-brand-gold/20 absolute -bottom-4 -left-4 h-20 w-28"
                style={{ animation: 'pulse 2s 0.4s infinite' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Stats bar skeleton */}
      <div className="bg-brand-navy py-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {[0, 0.1, 0.2, 0.3].map((d, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <div
                  className="bg-brand-gold/20 h-10 w-24 rounded"
                  style={{ animation: `pulse 2s ${d}s infinite` }}
                />
                <div
                  className="h-3 w-16 rounded bg-white/10"
                  style={{ animation: `pulse 2s ${d + 0.1}s infinite` }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Card grid skeleton */}
      <div className="bg-gray-50 py-16 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          {/* Section header */}
          <div className="mb-12 flex flex-col items-center gap-3">
            <div
              className="h-3 w-20 rounded-full bg-gray-200 dark:bg-gray-700"
              style={{ animation: 'pulse 2s infinite' }}
            />
            <div
              className="h-8 w-64 rounded bg-gray-200 dark:bg-gray-700"
              style={{ animation: 'pulse 2s 0.1s infinite' }}
            />
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {[0, 0.15, 0.3].map((d, i) => (
              <div
                key={i}
                className="border border-gray-200 bg-white p-8 dark:border-gray-700 dark:bg-gray-900"
                style={{ animation: `pulse 2s ${d}s infinite` }}
              >
                <div className="bg-brand-gold/20 mb-4 h-10 w-10 rounded" />
                <div className="mb-3 h-6 w-32 rounded bg-gray-200 dark:bg-gray-700" />
                <div className="space-y-2">
                  <div className="h-3 w-full rounded bg-gray-100 dark:bg-gray-800" />
                  <div className="h-3 w-4/5 rounded bg-gray-100 dark:bg-gray-800" />
                  <div className="h-3 w-3/4 rounded bg-gray-100 dark:bg-gray-800" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Loading indicator */}
      <div className="bg-brand-navy/95 fixed right-6 bottom-6 z-50 flex items-center gap-3 rounded-full border border-white/10 px-5 py-3 shadow-2xl backdrop-blur-md">
        <div
          className="h-4 w-4 rounded-full border-2 border-transparent"
          style={{
            borderTopColor: '#d4af37',
            animation: 'rotate-slow 0.8s linear infinite',
          }}
        />
        <span className="text-brand-gold text-[11px] font-semibold tracking-widest uppercase">
          Loading
        </span>
      </div>
    </div>
  );
}
