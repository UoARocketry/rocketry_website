import Image from "next/image";

/**
 * Stands in for a content image that has not been supplied.
 *
 * Deliberately not an image file. The same placeholder has to sit in a 4:5
 * poster frame, a squat landscape card and a full-height hero, and a fixed
 * artwork forced through all three either letterboxes or crops. A themed block
 * built from the site's own tokens fits any shape and stays on palette.
 *
 * The caller supplies the frame (height, aspect, positioning) through
 * `className`, exactly as it would size an image.
 */
export default function ImagePlaceholder({
  className = "",
  label = "No image yet",
}: {
  readonly className?: string;
  readonly label?: string;
}) {
  return (
    <div
      className={`flex items-center justify-center overflow-hidden bg-linear-to-br from-surface via-background to-surface ${className}`}
      role="img"
      aria-label={label}
    >
      {/* The hairline accent the About cards use, so a card with no image still
          reads as part of the set rather than as a hole in the grid. */}
      <div className="absolute top-0 left-6 right-6 h-px bg-linear-to-r from-transparent via-primary/30 to-transparent" />
      <Image
        src="/UARC logo.png"
        alt=""
        aria-hidden="true"
        width={361}
        height={129}
        sizes="200px"
        className="h-auto w-1/2 min-w-24 max-w-45 opacity-15"
      />
    </div>
  );
}
