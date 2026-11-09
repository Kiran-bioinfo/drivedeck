import { useId } from "react";

// DriveDeck D monogram — geometric indigo D with a nested card motif.
// Inline SVG (same pattern as GoogleIcon): no asset pipeline, crisp at any size.
// `useId` suffix matters: the cutout mask id must be unique per instance or
// multiple logos on one page would reference the same mask (colons stripped
// because they break url(#…) fragment references in some browsers).
export function Logo({ size = 28, className = "" }: { size?: number; className?: string }) {
  const uid = `deck-cutout-${useId().replace(/:/g, "")}`;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 512 512"
      fill="none"
      role="img"
      aria-labelledby="drivedeck-logo-title drivedeck-logo-desc"
      className={className}
    >
      <title id="drivedeck-logo-title">DriveDeck D monogram</title>
      <desc id="drivedeck-logo-desc">A geometric indigo D monogram with a nested card motif, representing DriveDeck.</desc>
      <defs>
        <mask id={uid} maskUnits="userSpaceOnUse" x="80" y="48" width="384" height="416">
          <rect x="80" y="48" width="384" height="416" fill="#FFFFFF" />
          <path d="M104 160H246C299.019 160 342 202.981 342 256V352H278V256C278 238.327 263.673 224 246 224H104V160Z" fill="#000000" />
        </mask>
      </defs>
      <path d="M104 64H254C360.039 64 446 149.961 446 256C446 362.039 360.039 448 254 448H104V64Z" fill="#4F46E5" mask={`url(#${uid})`} />
      <rect x="104" y="288" width="128" height="128" rx="22" fill="#4F46E5" />
    </svg>
  );
}
