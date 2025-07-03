 import Link from "next/link";
import Card from "../components/ui/card";

// Dummy data for the home page
const featuredRockets = [
  {
    id: 1,
    name: 'Aurora',
    slug: 'aurora',
    description: 'Our flagship high-altitude research rocket, designed for maximum altitude and payload capacity.',
    image: 'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=600&q=80',
    launchedAt: '2023-05-12',
  },
  {
    id: 2,
    name: 'Pioneer',
    slug: 'pioneer',
    description: 'A compact, reusable rocket built for rapid prototyping and testing new avionics.',
    image: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=600&q=80',
    launchedAt: '2022-11-03',
  },
];

const latestBlogs = [
  {
    id: 1,
    title: "How We Built Aurora: Behind the Scenes",
    date: "2024-06-15",
    image: "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=600&q=80",
    description: "A deep dive into the engineering, teamwork, and challenges behind our flagship rocket, Aurora.",
    slug: "how-we-built-aurora"
  },
  {
    id: 2,
    title: "Rocketry 101: Getting Started as a Student",
    date: "2024-05-28",
    image: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=600&q=80",
    description: "Tips, resources, and advice for students interested in joining the world of rocketry.",
    slug: "rocketry-101"
  },
];

const execTeam = [
  {
    id: 1,
    name: "Alex Chen",
    role: "President",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
    description: "Leading the club's strategic vision and operations.",
    slug: "alex-chen"
  },
  {
    id: 2,
    name: "Sarah Johnson",
    role: "Vice President",
    image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?auto=format&fit=crop&w=400&q=80",
    description: "Overseeing project management and team coordination.",
    slug: "sarah-johnson"
  },
  {
    id: 3,
    name: "Michael Rodriguez",
    role: "Technical Lead",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80",
    description: "Managing technical development and engineering standards.",
    slug: "michael-rodriguez"
  },
];

const featuredSponsors = [
  {
    name: "Gold Sponsor 1",
    logo: "https://via.placeholder.com/200x100?text=Gold+1",
    link: "#",
    description: "Leading supporter of our rocketry program."
  },
  {
    name: "Silver Sponsor 1",
    logo: "https://via.placeholder.com/180x90?text=Silver+1",
    link: "#",
    description: "Supporting our workshops and events."
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background text-text-main">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center py-24 px-4 bg-background relative overflow-hidden">
        <div className="relative z-10">
          <img src="/UARC logo.png" alt="UARC Logo" className="h-24 mb-6 drop-shadow-xl mx-auto" />
          <h1 className="text-5xl md:text-6xl font-extrabold mb-4">University of Auckland Rocketry Club</h1>
          <p className="text-xl md:text-2xl text-text-secondary mb-8 max-w-3xl mx-auto">
            The University Of Auckland Rocketry Club is a club dedicated to all things rockets. We give students the opportunity to design, build and fly rockets as we learn about aerospace.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/signup" className="button bg-primary text-white text-lg px-8 py-3 font-bold shadow-lg hover:bg-[#a94425] transition-all duration-300 hover:scale-103">
              Join The Club
            </Link>
            <Link href="/rockets" className="button bg-primary text-white text-lg px-8 py-3 font-bold shadow-lg hover:bg-[#a94425] transition-all duration-300 hover:scale-103">
              View Our Rockets
            </Link>
          </div>
        </div>
      </section>
      
      {/* Featured Rockets Section */}
      <section className="py-16 px-4 bg-surface">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-extrabold mb-4">Featured Rockets</h2>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto">
              Explore our latest rocket projects and achievements!
            </p>
          </div>
          <div className="grid grid-cols-1 gap-8">
            {featuredRockets.map((rocket, idx) => (
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
          <div className="text-center mt-8">
            <Link href="/rockets" className="button bg-primary text-white px-6 py-3 font-bold hover:bg-[#a94425] transition-all duration-200">
              View All Rockets
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}