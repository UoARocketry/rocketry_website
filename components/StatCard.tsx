import React from "react";

type Props = {
  value: React.ReactNode;
  label?: React.ReactNode;
  centered?: boolean;
  variant?: "surface" | "background";
  className?: string;
};

export default function StatCard({
  value,
  label,
  centered = false,
  variant = "background",
  className = "",
}: Props) {
  const bg = variant === "surface" ? "bg-surface" : "bg-card";

  return (
    <div
      className={`group relative ${bg} rounded-xl p-6 border border-border transition-all duration-300 hover:border-primary/30 ${
        centered ? "text-center" : ""
      } ${className}`.trim()}
    >
      {/* Animated gradient background on hover */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative z-10">
        <div className="text-4xl font-bold text-primary mb-2 transition-transform duration-300 group-hover:scale-105">
          {value}
        </div>
        {label && (
          <p className="text-text-secondary text-sm">{label}</p>
        )}
      </div>
    </div>
  );
}
