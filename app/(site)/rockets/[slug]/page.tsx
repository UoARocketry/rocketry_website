import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getRocketBySlug } from "@/lib/site-data";
import { formatDateLong, formatDateShort } from "@/lib/utils";
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
              <h1 className="text-5xl font-extrabold mb-4 text-primary">
                {rocket.name}
              </h1>
              {rocket.launchedAt && (
                <p className="text-lg text-text-secondary mb-4">
                  Launched: {formatDateShort(rocket.launchedAt)}
                </p>
              )}
            </div>

            <div className="prose prose-lg max-w-none">
              <p className="text-lg text-text-main leading-relaxed">
                {rocket.description}
              </p>
            </div>

            {/* Additional Details */}
            <div className="bg-surface rounded-lg p-6 border border-accent">
              <h3 className="text-xl font-bold text-primary mb-4">About</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-text-secondary">Rocket Name</p>
                  <p className="font-semibold">{rocket.name}</p>
                </div>
                <div>
                  <p className="text-sm text-text-secondary">Status</p>
                  <p className="font-semibold">
                    {rocket.launchedAt ? "Launched" : "In Development"}
                  </p>
                </div>
                {rocket.launchedAt && (
                  <div>
                    <p className="text-sm text-text-secondary">Launch Date</p>
                    <p className="font-semibold">
                      {formatDateLong(rocket.launchedAt)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
