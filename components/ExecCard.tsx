import React from "react";
import Image from "next/image";
import type { Exec } from "@/lib/site-data";
import { parsePhotoFraming, photoFramingStyle } from "@/lib/photo-position";

type ExecCardModel = {
  id?: Exec["id"];
  name: Exec["name"];
  role?: Exec["role"];
  bio?: Exec["bio"];
  photo?: Exec["photo"];
  photoPosition?: Exec["photoPosition"];
  linkedinUrl?: Exec["linkedinUrl"];
};

type Props = {
  exec: ExecCardModel;
  centered?: boolean;
  className?: string;
};

export default function ExecCard({
  exec,
  centered = false,
  className = "",
}: Props) {
  const photoSrc = exec.photo || "/UARC logo.png";

  return (
    <div
      className={`group relative bg-card rounded-xl p-6 border border-border transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 ${
        centered ? "text-center" : ""
      } ${className}`.trim()}
    >
      {/* Photo with hover effect */}
      <div className="relative mb-5 inline-block">
        <div className="relative w-28 h-28 mx-auto rounded-full overflow-hidden border-2 border-border group-hover:border-primary/50 transition-all duration-300">
          <Image
            src={photoSrc}
            alt={exec.name}
            fill
            sizes="112px"
            style={photoFramingStyle(parsePhotoFraming(exec.photoPosition))}
            className="transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-linear-to-t from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
        {/* Decorative ring */}
        <div className="absolute inset-0 rounded-full border-2 border-primary/30 scale-110 opacity-0 group-hover:opacity-100 transition-all duration-300" />
      </div>

      <h3 className="text-lg font-semibold text-text-main mb-1 group-hover:text-primary transition-colors duration-200">
        {exec.name}
      </h3>
      {exec.role && (
        <p className="text-primary text-sm font-medium mb-3">{exec.role}</p>
      )}
      {exec.bio && (
        <p className="text-text-secondary text-sm leading-relaxed">
          {exec.bio}
        </p>
      )}
      {exec.linkedinUrl && (
        <a
          href={exec.linkedinUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`mt-4 inline-flex items-center text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${centered ? "justify-center" : ""}`}
        >
          Visit Profile
          <svg
            className="w-4 h-4 ml-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
        </a>
      )}
    </div>
  );
}
