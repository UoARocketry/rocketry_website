import React from "react";

type Props = {
  className?: string;
  variant?: 1 | 2 | 3 | 4;
};

const WAVE_PATHS: Record<1 | 2 | 3 | 4, string> = {
  1: "M0,22 C120,8 220,36 340,22 C470,8 580,36 700,22 C830,8 940,36 1060,22 C1180,10 1280,28 1440,22",
  2: "M0,22 C90,34 210,6 320,22 C430,36 560,8 690,22 C810,34 930,6 1050,22 C1180,38 1300,8 1440,22",
  3: "M0,22 C110,12 210,30 320,22 C450,12 560,30 680,22 C810,12 910,30 1030,22 C1160,12 1260,30 1440,22",
  4: "M0,22 C80,4 210,38 330,22 C460,4 580,38 710,22 C840,4 960,38 1080,22 C1210,6 1320,34 1440,22",
};

const DOTS: Record<1 | 2 | 3 | 4, Array<{ x: number; y: number }>> = {
  1: [
    { x: 130, y: 14 },
    { x: 410, y: 28 },
    { x: 760, y: 13 },
    { x: 1080, y: 27 },
  ],
  2: [
    { x: 90, y: 29 },
    { x: 360, y: 12 },
    { x: 760, y: 30 },
    { x: 1130, y: 11 },
  ],
  3: [
    { x: 160, y: 15 },
    { x: 520, y: 27 },
    { x: 860, y: 14 },
    { x: 1220, y: 26 },
  ],
  4: [
    { x: 70, y: 10 },
    { x: 430, y: 30 },
    { x: 910, y: 9 },
    { x: 1310, y: 29 },
  ],
};

export default function SectionSeparator({
  className = "",
  variant = 1,
}: Props) {
  const isWhiteVariant = variant % 2 === 0;
  const strokeColor = isWhiteVariant ? "#F5F5F5" : "#C25632";

  return (
    <div
      aria-hidden="true"
      className={`relative h-14 flex items-center justify-center overflow-hidden ${className}`}
    >
      <div className="relative w-full h-full">
        <svg
          viewBox="0 0 1440 44"
          preserveAspectRatio="none"
          className="w-full h-full"
          role="presentation"
        >
          <path
            d={WAVE_PATHS[variant]}
            fill="none"
            stroke={strokeColor}
            strokeWidth="2"
            strokeLinecap="round"
            strokeOpacity="0.9"
            strokeDasharray="8 8"
          />
          <path
            d={WAVE_PATHS[variant]}
            fill="none"
            stroke={strokeColor}
            strokeWidth="6"
            strokeLinecap="round"
            strokeOpacity="0.12"
            strokeDasharray="8 8"
          />
          {DOTS[variant].map((dot, i) => (
            <g key={`${variant}-dot-${i}`}>
              <circle cx={dot.x} cy={dot.y} r="4" fill="#181818" />
              <circle
                cx={dot.x}
                cy={dot.y}
                r="3"
                fill={strokeColor}
                fillOpacity="0.92"
              />
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}
