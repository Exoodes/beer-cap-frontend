// The app's mark: a crown cork with 21 crimps, as on a real bottle cap.
// Same drawing as public/cap.svg (the favicon).
const CROWN =
  "M32.0 1.0 L36.1 4.8 L41.1 2.4 L43.9 7.2 L49.5 6.4 L50.7 11.8 L56.2 12.7 L55.8 18.2 L60.9 20.7 L58.8 25.9 L62.9 29.7 L59.4 34.1 L62.2 38.9 L57.6 42.0 L58.8 47.5 L53.5 49.1 L53.1 54.7 L47.5 54.7 L45.5 59.9 L40.1 58.3 L36.6 62.7 L32.0 59.5 L27.4 62.7 L23.9 58.3 L18.5 59.9 L16.5 54.7 L10.9 54.7 L10.5 49.1 L5.2 47.5 L6.4 42.0 L1.8 38.9 L4.6 34.1 L1.1 29.7 L5.2 25.9 L3.1 20.7 L8.2 18.3 L7.8 12.7 L13.3 11.8 L14.5 6.4 L20.1 7.2 L22.9 2.4 L27.9 4.8Z";

export function CapMark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <path
        d={CROWN}
        fill="var(--mantine-color-lager-5)"
        stroke="var(--lager-deep)"
        strokeWidth={2}
        strokeLinejoin="round"
      />
      <circle
        cx={32}
        cy={32}
        r={20}
        fill="var(--mantine-color-lager-4)"
        stroke="var(--lager-deep)"
        strokeWidth={2}
      />
    </svg>
  );
}
