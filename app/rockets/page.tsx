import Card from '../../components/ui/card';
import Link from 'next/link';

const dummyRockets = [
  {
    id: 1,
    name: 'Aurora',
    slug: 'aurora',
    description: 'Aurora is our flagship high-altitude research rocket, designed for maximum altitude and payload capacity.',
    image: 'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=600&q=80',
    launchedAt: '2023-05-12',
  },
  {
    id: 2,
    name: 'Pioneer',
    slug: 'pioneer',
    description: 'Pioneer is a compact, reusable rocket built for rapid prototyping and testing new avionics.',
    image: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=600&q=80',
    launchedAt: '2022-11-03',
  },
  {
    id: 3,
    name: 'Vanguard',
    slug: 'vanguard',
    description: 'Vanguard is our experimental hybrid propulsion rocket, pushing the boundaries of student rocketry.',
    image: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=600&q=80',
    launchedAt: null,
  },
];

export default function RocketsPage() {
  return (
    <main className="min-h-screen max-w-7xl mx-auto pb-16">
      <section className="max-w-7xl mx-auto pt-16 pb-8 px-4 text-left">
        <h1 className="text-5xl font-extrabold mb-4 text-primary">Our Rockets</h1>
        <p className="text-lg text-text-secondary max-w-2xl">
          Explore our rocket projects and achievements!
        </p>
      </section>
      <div className="grid grid-cols-1 gap-8">
        {dummyRockets.map((rocket, idx) => (
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