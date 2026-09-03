export default function SecurityWatermark() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center overflow-hidden select-none">
      <svg
        viewBox="0 0 500 200"
        className="w-[75%] max-w-xl opacity-[0.035]"
        style={{ transform: 'rotate(-25deg)', pointerEvents: 'none' }}
      >
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#1e3a8a"
          fontSize="34"
          fontWeight="bold"
          letterSpacing="4"
        >
          SVI INFRA SOLUTIONS
        </text>
      </svg>
    </div>
  );
}
