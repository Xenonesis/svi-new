export default function RootLoading() {
  return (
    <div className="bg-brand-navy relative flex min-h-[80vh] items-center justify-center overflow-hidden md:min-h-[900px]">
      {/* Skeleton overlay that matches hero layout */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/70" />

      {/* Pulsing placeholder for text */}
      <div className="z-10 container mx-auto flex flex-col items-center px-5 text-center sm:px-8 md:px-4">
        {/* Badge skeleton */}
        <div
          className="mb-6 h-3 w-36 rounded-full bg-white/10"
          style={{ animation: 'pulse 2s ease-in-out infinite' }}
        />

        {/* Title skeletons */}
        <div className="mb-4 flex flex-col items-center gap-2">
          <div
            className="h-10 w-64 rounded bg-white/10 sm:h-12 sm:w-80 md:h-16 md:w-96"
            style={{ animation: 'pulse 2s ease-in-out 0.1s infinite' }}
          />
          <div
            className="h-10 w-48 rounded bg-[#c9a84c]/20 sm:h-12 sm:w-56 md:h-16 md:w-64"
            style={{ animation: 'pulse 2s ease-in-out 0.2s infinite' }}
          />
        </div>

        {/* Description skeleton */}
        <div className="mb-10 flex max-w-2xl flex-col items-center gap-2 px-2">
          <div
            className="h-4 w-full rounded bg-white/10"
            style={{ animation: 'pulse 2s ease-in-out 0.3s infinite' }}
          />
          <div
            className="h-4 w-3/4 rounded bg-white/10"
            style={{ animation: 'pulse 2s ease-in-out 0.4s infinite' }}
          />
        </div>

        {/* Button skeletons */}
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-5">
          <div
            className="h-12 w-44 rounded bg-[#c9a84c]/30"
            style={{ animation: 'pulse 2s ease-in-out 0.5s infinite' }}
          />
          <div
            className="h-4 w-28 rounded bg-white/10"
            style={{ animation: 'pulse 2s ease-in-out 0.6s infinite' }}
          />
        </div>

        {/* Scroll indicator skeleton */}
        <div className="absolute bottom-16 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 md:flex">
          <div
            className="h-3 w-10 rounded bg-white/10"
            style={{ animation: 'pulse 2s ease-in-out infinite' }}
          />
          <div className="h-8 w-px bg-white/10" />
        </div>
      </div>

      {/* Loading indicator */}
      <div className="absolute right-8 bottom-8 z-20 flex items-center gap-2">
        <div
          className="h-1.5 w-1.5 rounded-full bg-[#c9a84c]/60"
          style={{ animation: 'pulse-gold 1.2s ease-in-out 0s infinite' }}
        />
        <div
          className="h-1.5 w-1.5 rounded-full bg-[#c9a84c]/60"
          style={{ animation: 'pulse-gold 1.2s ease-in-out 0.2s infinite' }}
        />
        <div
          className="h-1.5 w-1.5 rounded-full bg-[#c9a84c]/60"
          style={{ animation: 'pulse-gold 1.2s ease-in-out 0.4s infinite' }}
        />
      </div>
    </div>
  );
}
