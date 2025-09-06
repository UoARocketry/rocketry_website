import Link from 'next/link';
import { notFound } from 'next/navigation';

interface EventPageProps {
  readonly params: Promise<{ slug: string }>
}

const placeholder = "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=800&q=80";

async function getEventFromApi(slug: string) {
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : `http://localhost:${process.env.PORT ?? 3000}`);
  const res = await fetch(new URL(`/api/events/${slug}`, base).toString(), { cache: 'no-store' });
  if (!res.ok) {
    return null;
  }
  return res.json();
}

export default async function EventPage({ params }: EventPageProps) {
  const { slug } = await params; 
  const event = await getEventFromApi(slug);

  if (!event) {
    notFound();
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <main className="min-h-screen max-w-7xl mx-auto pb-16">
      <section className="max-w-7xl mx-auto pt-16 pb-8 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Event Image */}
          <div className="relative">
            <img
              src={placeholder}
              alt={event.title}
              className="w-full h-96 object-cover rounded-lg shadow-lg"
            />
          </div>

          {/* Event Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-5xl font-extrabold mb-4 text-primary">{event.title}</h1>
              <div className="flex flex-wrap gap-4 mb-4">
                <div className="bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
                  {formatDate(event.date)}
                </div>
                <div className="bg-secondary/10 text-secondary px-4 py-2 rounded-full text-sm font-medium">
                  📍 {event.location}
                </div>
              </div>
            </div>

            <div className="prose prose-lg max-w-none">
              <p className="text-lg text-text-main leading-relaxed">
                {event.description}
              </p>
            </div>

            {/* Call to Action for Upcoming Events */}
            {!event.isPast && (
              <div className="mt-8 p-6 bg-primary/5 rounded-lg border border-primary/20">
                <h3 className="text-xl font-semibold text-primary mb-2">
                  Join Us!
                </h3>
                <p className="text-text-secondary mb-4">
                  Don&apos;t miss out on this exciting event! Make sure to mark your calendar and join us for an unforgettable experience.
                </p>
                <button className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors font-medium">
                  Register Interest
                </button>
              </div>
            )}

            {/* Back to Events */}
            <div className="pt-6">
              <Link
                href="/events"
                className="inline-flex items-center text-primary hover:text-primary/80 transition-colors"
              >
                ← Back to All Events
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}