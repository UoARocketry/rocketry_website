import React from "react";

type Props = {
  title?: string;
  description?: string;
  className?: string;
  align?: "center" | "left";
};

export default function SectionFallback({
  title = "Coming Soon",
  description = "We are working on exciting content for this section. Check back soon!",
  className = "",
  align = "center",
}: Props) {
  const justifyClass = align === "left" ? "justify-start" : "justify-center";
  const textAlignClass = align === "left" ? "text-left" : "text-center";

  return (
    <div className={`w-full flex ${justifyClass} ${className}`}>
      <div
        role="status"
        aria-live="polite"
        className={`relative max-w-2xl w-full bg-card rounded-xl border border-border border-dashed p-10 ${textAlignClass}`}
      >
        {/* Decorative background pattern */}
        <div className="absolute inset-0 opacity-5 rounded-xl overflow-hidden">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 1px, transparent 1px)`,
            backgroundSize: '20px 20px',
          }} />
        </div>
        
        <div className="relative z-10">
          <div className={`inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 text-primary mb-4 ${align === "center" ? "mx-auto" : ""}`}>
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-text-main mb-2">{title}</h3>
          <p className="text-text-secondary text-sm leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}
