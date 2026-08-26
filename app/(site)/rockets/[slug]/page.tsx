import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getRocketBySlug } from "@/lib/site-data";
import { formatDateShort, getRocketStatus } from "@/lib/utils";
import StatusBadgePill, {
  rocketStatusBadge,
} from "@/components/ui/status-badge";
import RocketImageCycler from "@/components/ui/rocket-image-cycler";

interface RocketPageProps {
  readonly params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: RocketPageProps): Promise<Metadata> {
  const { slug } = await params;
  const rocket = await getRocketBySlug(slug);

  if (!rocket) {
    return {};
  }

  const description =
    rocket.description ??
    `Details on ${rocket.name}, a rocket built by the University of Auckland Rocketry Club.`;

  return {
    title: rocket.name,
    description,
    alternates: {
      canonical: `/rockets/${slug}`,
    },
    openGraph: {
      title: rocket.name,
      description,
      images: rocket.image ? [{ url: rocket.image }] : undefined,
    },
  };
}

export default async function RocketPage({ params }: RocketPageProps) {
  const { slug } = await params;
  const rocket = await getRocketBySlug(slug);

  if (!rocket) {
    notFound();
  }

  const status = getRocketStatus(rocket);
  const badge = rocketStatusBadge(rocket);
  const dateLabel = status === "scheduled" ? "Scheduled launch" : "Launched";

  return (
    <main className="min-h-screen max-w-7xl mx-auto pb-16">
      <section className="max-w-7xl mx-auto pt-16 pb-8 px-4">
        <div className="mb-6">
          <Link
            href="/rockets"
            className="inline-flex items-center text-primary hover:text-primary/80 transition-colors"
          >
            ← Back to all Rockets
          </Link>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Rocket Image */}
          <RocketImageCycler images={rocket.images} alt={rocket.name} />

          {/* Rocket Details */}
          <div className="space-y-6">
            <div>
              <div className="flex flex-wrap items-center gap-4 mb-4">
                <h1 className="text-5xl font-extrabold text-primary">
                  {rocket.name}
                </h1>
                {badge && <StatusBadgePill badge={badge} />}
              </div>
              {rocket.launchedAt && (
                <p className="text-lg text-text-secondary mb-4">
                  {dateLabel}: {formatDateShort(rocket.launchedAt)}
                </p>
              )}
            </div>

            <div className="prose prose-lg max-w-none">
              <p className="text-lg text-text-main leading-relaxed">
                {rocket.description}
              </p>
            </div>

            {/* Details, entirely CMS-driven. The name, status and launch date
                that used to sit here are all already shown above, so the box
                now holds only what an editor adds in Payload. */}
            {rocket.specs.length > 0 && (
              <div className="bg-surface rounded-lg p-6 border border-accent">
                <h3 className="text-xl font-bold text-primary mb-4">Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {rocket.specs.map((spec) => (
                    <div key={`${spec.label}-${spec.value}`}>
                      <p className="text-sm text-text-secondary">
                        {spec.label}
                      </p>
                      <p className="font-semibold">{spec.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
