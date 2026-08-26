import React from "react";
import ImageWithFallback from "@/components/ui/image-with-fallback";

type BaseProps = {
  image?: string;
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
        <div className="relative w-full h-42 overflow-hidden">
          <ImageWithFallback
            src={image}
            alt={imageAlt || (typeof title === "string" ? title : "")}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        </div>
      ) : showImagePlaceholder ? (
        <div className="relative w-full h-44 overflow-hidden bg-gradient-to-br from-surface via-background to-surface">
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
          <div className="text-text-secondary text-sm leading-relaxed">
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
