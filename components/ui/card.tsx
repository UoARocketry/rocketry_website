import React from "react";
import Image from "next/image";

interface CardProps {
  readonly image: string;
  readonly title: string;
  readonly date: string;
  readonly description: string;
  readonly tag?: string | null;
  readonly reverse?: boolean;
  readonly vertical?: boolean;
}

export default function Card({
  image,
  title,
  date,
  description,
  tag,
  reverse = false,
  vertical = false,
}: CardProps) {
  const imageSrc = image || "/UARC logo.png";
  const trimmedDescription = description.trim();
  const eventCardDescription =
    trimmedDescription.length > 0
      ? `${trimmedDescription} ... see more`
      : "See more";

  if (vertical) {
    return (
      <div className="group bg-card rounded-xl border border-border overflow-hidden flex flex-col h-full transition-all duration-300 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1">
        <div className="relative overflow-hidden">
          <Image
            src={imageSrc}
            alt={title}
            width={1200}
            height={600}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
        <div className="flex-1 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-xs font-medium text-primary">{date}</span>
              {tag && (
                <span className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 font-medium">
                  {tag}
                </span>
              )}
            </div>
            <h3 className="text-lg font-semibold text-text-main mb-2 group-hover:text-primary transition-colors duration-200">
              {title}
            </h3>
            <p
              className="text-text-secondary text-sm leading-relaxed"
              style={{
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {eventCardDescription}
            </p>
          </div>
          <div className="mt-4 flex items-center text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            Learn more
            <svg
              className="w-4 h-4 ml-1 transition-transform duration-200 group-hover:translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`group bg-card rounded-xl border border-border overflow-hidden flex h-80 md:h-72 transition-all duration-300 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 ${
        reverse
          ? "flex-col-reverse md:flex-row-reverse"
          : "flex-col md:flex-row"
      }`}
    >
      <div className="relative overflow-hidden h-48 md:h-full md:w-1/2">
        <Image
          src={imageSrc}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-linear-to-r from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      <div className="flex-1 p-6 flex flex-col justify-center">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-xs font-medium text-primary">{date}</span>
          {tag && (
            <span className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 font-medium">
              {tag}
            </span>
          )}
        </div>
        <h3 className="text-xl font-semibold text-text-main mb-2 group-hover:text-primary transition-colors duration-200">
          {title}
        </h3>
        <p className="text-text-secondary text-sm leading-relaxed line-clamp-3">
          {description}
        </p>
        <div className="mt-4 flex items-center text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          View details
          <svg
            className="w-4 h-4 ml-1 transition-transform duration-200 group-hover:translate-x-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 8l4 4m0 0l-4 4m4-4H3"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
