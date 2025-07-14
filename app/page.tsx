import Link from "next/link";
import Card from "../components/ui/card";
import prisma from "../lib/prisma";

export default async function HomePage() {
  // Fetch featured rockets from the database (latest 2)
  const featuredRockets = await prisma.rocket.findMany({
    take: 2,
    orderBy: {
      launchedAt: 'desc'
    }
  });

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
                    <Link href="https://docs.google.com/forms/d/e/1FAIpQLSfS7PS--UX-fQinUfuYzVLV3-rM92cW7uVFOqoEVczgYLb8Qg/viewform?usp=sf_link" className="button bg-primary text-white text-lg px-8 py-3 font-bold shadow-lg hover:bg-[#a94425] transition-all duration-300 hover:scale-103" target="_blank" rel="noopener noreferrer">
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
        
        {/* Latest Blogs Section */}
        <section className="py-16 px-4 bg-background">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-extrabold mb-4">Latest Updates</h2>
                    <p className="text-lg text-text-secondary max-w-2xl mx-auto">
                    Stay up to date with our latest projects, competitions, and blogs!
                    </p>
                </div>
                <div className="grid gap-8 grid-cols-1 sm:grid-cols-2">
                    {latestBlogs.map((blog) => (
                        <Link key={blog.id} href={`/blogs/${blog.slug}`} className="block h-full">
                            <Card
                            image={blog.image}
                            title={blog.title}
                            date={new Date(blog.date).toLocaleDateString()}
                            description={blog.description}
                            vertical
                            />
                        </Link>
                    ))}
                </div>
                <div className="text-center mt-8">
                    <Link href="/blogs" className="button bg-primary text-white px-6 py-3 font-bold hover:bg-[#a94425] transition-all duration-200">
                    Read All Blogs
                    </Link>
                </div>
            </div>
        </section>

        {/* Sponsors Section */}
        <section className="py-16 px-4 bg-background">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center md:items-stretch gap-12">
                <div className="flex-1 flex flex-col justify-center">
                    <h2 className="text-4xl font-extrabold mb-4">Our Sponsors</h2>
                    <p className="text-lg text-text-secondary max-w-2xl">
                    We are grateful for the generous support of our sponsors who make our rocketry projects possible.
                    </p>
                    <div className="text-start mt-8">
                        <Link href="/sponsors" className="button bg-primary text-white px-6 py-3 rounded-full font-bold hover:bg-[#a94425] transition-all duration-200">
                            View Our Sponsors
                        </Link>
                    </div>
                </div>
                {/* Placeholder Sponsor Image*/}
                <div className="flex-1 flex items-center justify-center min-h-[300px] w-full">
                    <img
                    src="/sponsors-placeholder.png"
                    alt="Sponsors Placeholder"
                    className="w-full max-w-md object-contain rounded-xl border border-accent shadow-md bg-white"
                    style={{ minHeight: 200 }}
                    />
                </div>
            </div>
        </section>

        {/* Quick Navigation Section */}
        <section className="py-16 px-4 bg-surface">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-extrabold mb-4">Explore More</h2>
                    <p className="text-lg text-text-secondary max-w-2xl mx-auto">
                    Discover everything the University of Auckland Rocketry Club has to offer.
                    </p>
                </div>
                <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
                    <Link href="/events" className="bg-background rounded-lg p-6 text-center hover:bg-primary/10 transition-all duration-200 border border-accent hover:border-primary">
                        <div className="text-4xl mb-3">📅</div>
                        <h3 className="text-lg font-bold text-primary mb-2">Events</h3>
                        <p className="text-text-secondary text-sm">Check out upcoming events and competitions</p>
                    </Link>
                    <Link href="/blogs" className="bg-background rounded-lg p-6 text-center hover:bg-primary/10 transition-all duration-200 border border-accent hover:border-primary">
                        <div className="text-4xl mb-3">📝</div>
                        <h3 className="text-lg font-bold text-primary mb-2">Blogs</h3>
                        <p className="text-text-secondary text-sm">Read our latest articles and updates</p>
                    </Link>
                    <Link href="/rockets" className="bg-background rounded-lg p-6 text-center hover:bg-primary/10 transition-all duration-200 border border-accent hover:border-primary">
                        <div className="text-4xl mb-3">🚀</div>
                        <h3 className="text-lg font-bold text-primary mb-2">Our Rockets</h3>
                        <p className="text-text-secondary text-sm">View our rocket projects and achievements</p>
                    </Link>
                    <Link href="/sponsors" className="bg-background rounded-lg p-6 text-center hover:bg-primary/10 transition-all duration-200 border border-accent hover:border-primary">
                        <div className="text-4xl mb-3">🤝</div>
                        <h3 className="text-lg font-bold text-primary mb-2">Sponsors</h3>
                        <p className="text-text-secondary text-sm">Meet our generous sponsors</p>
                    </Link>
                </div>
            </div>
        </section>
    </main>
  );
}