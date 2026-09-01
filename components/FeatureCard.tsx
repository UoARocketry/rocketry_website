import React from "react";
import ImageWithFallback from "@/components/ui/image-with-fallback";
import { parsePhotoFraming, photoFramingStyle } from "@/lib/photo-position";

type BaseProps = {
  image?: string;
  /** Editor-chosen focus and zoom for the crop. Centred when absent. */
  imagePosition?: string | null;
  imageAlt?: string;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  children?: React.ReactNode;
  centered?: boolean;
  variant?: "surface" | "background";
  showImagePlaceholder?: boolean;
  className?: string;
  ariaLabel?: string;
};

type DivProps = BaseProps & {
  as?: "div";
  href?: never;
  onClick?: never;
};

type AnchorProps = BaseProps & {
  as: "a";
  href: string;
  target?: React.HTMLAttributeAnchorTarget;
  rel?: string;
};

type ButtonProps = BaseProps & {
  as: "button";
  href?: never;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  buttonType?: "button" | "submit" | "reset";
  disabled?: boolean;
};

type Props = DivProps | AnchorProps | ButtonProps;

export default function FeatureCard(props: Props) {
  const {
    image,
    imagePosition,
    imageAlt = "",
    title,
    subtitle,
    children,
    centered = false,
    variant = "surface",
    showImagePlaceholder = false,
    className = "",
    ariaLabel,
  } = props;

  const bg = variant === "surface" ? "bg-surface" : "bg-card";
  const rootClassName =
    `group relative ${bg} rounded-xl border border-border transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 overflow-hidden ${
      centered ? "text-center" : ""
    } ${className}`.trim();

  const cardContent = (
    <>
      {/* Subtle top accent line */}
      <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />

      {/* Card image */}
      {image ? (
        // Taller than the text alone needs, so more of the photo survives the
        // crop. Width is the grid column's, so this is the only lever.
        <div className="relative w-full h-56 overflow-hidden">
          <ImageWithFallback
            src={image}
            alt={imageAlt || (typeof title === "string" ? title : "")}
            fill
            style={photoFramingStyle(parsePhotoFraming(imagePosition))}
            className="transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        </div>
      ) : showImagePlaceholder ? (
        // Matches the image frame above so a card with no image is the same
        // height as its neighbours in the grid.
        <div className="relative w-full h-56 overflow-hidden bg-gradient-to-br from-surface via-background to-surface">
          <div className="absolute inset-0 bg-gradient-to-t from-black/15 to-transparent" />
        </div>
      ) : null}

      <div className="p-6">
        {title && (
          <h3 className="text-lg font-semibold text-text-main mb-3 group-hover:text-primary transition-colors duration-200">
            {title}
          </h3>
        )}
        {subtitle && <p className="text-text-secondary mb-3">{subtitle}</p>}
        {children && (
          <div className="whitespace-pre-line text-text-secondary text-sm leading-relaxed">
            {children}
          </div>
        )}
      </div>
    </>
  );

  if (props.as === "a") {
    return (
      <a
        className={rootClassName}
        href={props.href}
        target={props.target}
        rel={props.rel}
        aria-label={ariaLabel}
      >
        {cardContent}
      </a>
    );
  }

  if (props.as === "button") {
    return (
      <button
        type={props.buttonType ?? "button"}
        className={rootClassName}
        onClick={props.onClick}
        disabled={props.disabled}
        aria-label={ariaLabel}
      >
        {cardContent}
      </button>
    );
  }

  return (
    <div className={rootClassName} aria-label={ariaLabel}>
      {cardContent}
    </div>
  );
}
