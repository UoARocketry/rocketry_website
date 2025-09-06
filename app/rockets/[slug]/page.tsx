import Link from 'next/link';
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic';

interface RocketPageProps {
  readonly params: Promise<{ slug: string }>
}

export default async function RocketPage({ params }: RocketPageProps) {
  // await the params promise to pull out slug
  const { slug } = await params

  const base = process.env.NEXT_PUBLIC_BASE_URL ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : `http://localhost:${process.env.PORT ?? 3000}`);
  const res = await fetch(new URL(`/api/rockets/${slug}`, base).toString(), { cache: 'no-store' });

  if (!res.ok) {
    // if 404, show notFound
    if (res.status === 404) return notFound();
    console.error('Failed to load rocket from API:', await res.text());
    return notFound();
  }

  const rocket = await res.json();

  if (!rocket) {
    notFound()
  }

  return (
    <main className="min-h-screen max-w-7xl mx-auto pb-16">
      <section className="max-w-7xl mx-auto pt-16 pb-8 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Rocket Image */}
          <div className="relative">
            <img
              src={rocket.image}
              alt={rocket.name}
              className="w-full h-96 object-cover rounded-lg shadow-lg"
            />
          </div>

          {/* Rocket Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-5xl font-extrabold mb-4 text-primary">
                {rocket.name}
              </h1>
              {rocket.launchedAt && (
                <p className="text-lg text-text-secondary mb-4">
                  Launched:{' '}
                  {new Date(rocket.launchedAt).toLocaleDateString()}
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
              <h3 className="text-xl font-bold text-primary mb-4">
                Technical Specifications
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-text-secondary">Rocket Name</p>
                  <p className="font-semibold">{rocket.name}</p>
                </div>
                <div>
                  <p className="text-sm text-text-secondary">Status</p>
                  <p className="font-semibold">
                    {rocket.launchedAt ? 'Launched' : 'In Development'}
                  </p>
                </div>
                {rocket.launchedAt && (
                  <div>
                    <p className="text-sm text-text-secondary">
                      Launch Date
                    </p>
                    <p className="font-semibold">
                      {new Date(rocket.launchedAt).toLocaleDateString(
                        'en-US',
                        {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        }
                      )}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Back to Rockets */}
            <div className="pt-6">
              <Link
                href="/rockets"
                className="inline-flex items-center text-primary hover:text-primary/80 transition-colors"
              >
                ← Back to All Rockets
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}