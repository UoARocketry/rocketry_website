import Link from "next/link";
import Card from "@/components/ui/card";

export default async function EventsPage() {
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : `http://localhost:${process.env.PORT ?? 3000}`);
  const res = await fetch(new URL('/api/events', base).toString(), { cache: 'no-store' });

  if (!res.ok) {
    console.error('Failed to load events from API:', await res.text());
    return (
      <main className="min-h-screen bg-background pb-16 text-text-main">
        <section className="max-w-7xl mx-auto pt-16 pb-8 px-4 text-left">
          <h1 className="text-5xl font-extrabold mb-4 text-primary">Events</h1>
          <p className="text-lg text-text-secondary max-w-2xl">Could not load events.</p>
        </section>
      </main>
    );
  }
  const events = await res.json();

  const now = new Date();
  const upcoming = events.filter((e: any) => !e.isPast && new Date(e.date) >= now);
  const past = events.filter((e: any) => e.isPast || new Date(e.date) < now);

  const placeholder = "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=600&q=80";

  return (
    <main className="min-h-screen bg-background pb-16 text-text-main">
      <section className="max-w-7xl mx-auto pt-16 pb-8 px-4 text-left">
        <h1 className="text-5xl font-extrabold mb-4 text-primary">Events</h1>
        <p className="text-lg text-text-secondary max-w-2xl">
          Discover and join our upcoming and past events! From launches to workshops, our events are open to all members and enthusiasts. Stay tuned for more updates and relive the highlights from our past activities.
        </p>
      </section>

      <section className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-bold mb-4 mt-10 text-primary">Upcoming Events</h2>
        <div className="grid gap-8 grid-cols-1 sm:grid-cols-2">
          {upcoming.length === 0 && (
            <p className="text-text-secondary col-span-2">No upcoming events at the moment. Check back soon!</p>
          )}
          {upcoming.map((event: any) => (
            <Link key={event.id} href={`/events/${event.slug}`} className="block h-full">
              <Card
                image={placeholder}
                title={event.title}
                date={new Date(event.date).toLocaleDateString()}
                description={event.description}
                vertical
              />
            </Link>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 mt-16">
        <h2 className="text-3xl font-bold mb-4 text-primary">Past Events</h2>
        <div className="grid gap-8 grid-cols-1 sm:grid-cols-2">
          {past.length === 0 && (
            <p className="text-text-secondary col-span-2">No past events yet.</p>
          )}
          {past.map((event: any) => (
            <Link key={event.id} href={`/events/${event.slug}`} className="block h-full">
              <Card
                image={placeholder}
                title={event.title}
                date={new Date(event.date).toLocaleDateString()}
                description={event.description}
                vertical
              />
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}