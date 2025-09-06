import Card from '../../components/ui/card';
import Link from 'next/link';

type RocketItem = {
  id: number;
  name: string;
  slug: string;
  image?: string | null;
  description?: string | null;
  launchedAt?: string | null;
};

export default async function RocketsPage() {
  let rockets: RocketItem[] = [];
  
  try {
    const base = process.env.NEXT_PUBLIC_BASE_URL ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : `http://localhost:${process.env.PORT ?? 3000}`);
    const res = await fetch(new URL('/api/rockets', base).toString(), { 
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache',
      }
    });

    if (res.ok) {
      rockets = await res.json();
    } else {
      console.error('Failed to load rockets from API:', await res.text());
    }
  } catch (error) {
    console.error('Error fetching rockets:', error);
  }

  if (rockets.length === 0) {
    return (
      <main className="min-h-screen max-w-7xl mx-auto pb-16">
        <section className="max-w-7xl mx-auto pt-16 pb-8 px-4 text-left">
          <h1 className="text-5xl font-extrabold mb-4 text-primary">Our Rockets</h1>
          <p className="text-lg text-text-secondary max-w-2xl">
            No rockets available at the moment. Check back soon!
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen max-w-7xl mx-auto pb-16">
      <section className="max-w-7xl mx-auto pt-16 pb-8 px-4 text-left">
        <h1 className="text-5xl font-extrabold mb-4 text-primary">Our Rockets</h1>
        <p className="text-lg text-text-secondary max-w-2xl">
          Explore our rocket projects and achievements!
        </p>
      </section>
      <div className="grid grid-cols-1 gap-8">
        {rockets.map((rocket: RocketItem, idx: number) => (
          <Link key={rocket.id} href={`/rockets/${rocket.slug}`} className="block h-full">
            <Card
              image={rocket.image ?? ''}
              title={rocket.name}
              date={rocket.launchedAt ? new Date(rocket.launchedAt).toLocaleDateString() : 'TBA'}
              description={rocket.description ?? ''}
              reverse={idx % 2 === 1}
            />
          </Link>
        ))}
      </div>
    </main>
  );
}