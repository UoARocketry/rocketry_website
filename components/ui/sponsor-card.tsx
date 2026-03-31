import Image from "next/image";

interface Sponsor {
  id: number;
  name: string;
  logo: string;
  url: string;
  description?: string | null;
  tier?: string | null;
}

export default function SponsorCard({
  sponsor,
}: {
  readonly sponsor: Sponsor;
}) {
  const logoSrc = sponsor.logo || "/UARC logo.png";

  return (
    <a
      href={sponsor.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative bg-card rounded-xl border border-border flex flex-col items-center p-6 transition-all duration-300 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 overflow-hidden"
    >
      {/* Subtle gradient overlay on hover */}
      <div className="absolute inset-0 bg-linear-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative z-10 flex flex-col items-center">
        <div className="bg-white rounded-lg p-4 mb-4 transition-transform duration-300 group-hover:scale-105">
          <Image
            src={logoSrc}
            alt={sponsor.name}
            width={160}
            height={60}
            className="object-contain"
            style={{
              maxHeight: 60,
              maxWidth: 160,
            }}
          />
        </div>
        <h3 className="text-base font-semibold text-text-main mb-1 text-center group-hover:text-primary transition-colors duration-200">
          {sponsor.name}
        </h3>
        {sponsor.description && (
          <p className="text-sm text-text-secondary text-center mt-1 leading-relaxed">
            {sponsor.description}
          </p>
        )}

        {/* External link indicator */}
        <div className="mt-4 flex items-center text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          Visit website
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
        </div>
      </div>
    </a>
  );
}
