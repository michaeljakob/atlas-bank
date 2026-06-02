export function CardChip({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 38" fill="none" className={className} aria-hidden="true">
      <rect x="0.5" y="0.5" width="47" height="37" rx="6" fill="#B4B1AB" stroke="#00000022" />
      <g stroke="#000000" strokeOpacity="0.18" strokeWidth="1">
        <line x1="0" y1="13" x2="48" y2="13" />
        <line x1="0" y1="25" x2="48" y2="25" />
        <line x1="17" y1="0" x2="17" y2="38" />
        <line x1="31" y1="0" x2="31" y2="38" />
        <rect x="17" y="13" width="14" height="12" fill="none" />
      </g>
    </svg>
  );
}

export function ContactlessIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M5 9.5a4 4 0 0 1 0 5" />
      <path d="M9 6.5a9 9 0 0 1 0 11" />
      <path d="M13 4a14 14 0 0 1 0 16" />
    </svg>
  );
}
