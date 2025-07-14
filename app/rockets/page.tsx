import Card from '../../components/ui/card';
import Link from 'next/link';
import prisma from '../../lib/prisma';

export default async function RocketsPage() {
  // Fetch rockets from the database
  const rockets = await prisma.rocket.findMany({
    orderBy: {
      launchedAt: 'desc'
    }
  });

  return (
    <main className="min-h-screen max-w-7xl mx-auto pb-16">
      <section className="max-w-7xl mx-auto pt-16 pb-8 px-4 text-left">
        <h1 className="text-5xl font-extrabold mb-4 text-primary">Our Rockets</h1>
        <p className="text-lg text-text-secondary max-w-2xl">
          Explore our rocket projects and achievements!
        </p>
      </section>
      <div className="grid grid-cols-1 gap-8">
        {rockets.map((rocket, idx) => (
          <Link key={rocket.id} href={`/rockets/${rocket.slug}`} className="block h-full">
            <Card
              image={rocket.image}
              title={rocket.name}
              date={rocket.launchedAt ? new Date(rocket.launchedAt).toLocaleDateString() : 'TBA'}
              description={rocket.description}
              reverse={idx % 2 === 1}
            />
          </Link>
        ))}
      </div>
    </main>
  );
} 