import Card from "@/components/ui/card";

const dummyBlogs = [
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
  {
    id: 3,
    title: "Competition Recap: Our Experience at Spaceport America Cup",
    date: "2024-04-10",
    image: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=600&q=80",
    description: "Highlights and lessons learned from our recent competition at Spaceport America Cup.",
    slug: "spaceport-america-cup-recap"
  },
];

export default function BlogsPage() {
  return (
    <main className="min-h-screen bg-background pb-16 text-text-main">
      <section className="max-w-7xl mx-auto pt-16 pb-8 px-4 text-left">
        <h1 className="text-5xl font-extrabold mb-4 text-primary pb-1">Blogs</h1>
        <p className="text-lg text-text-secondary max-w-2xl mb-8">
          Read our latest blogs and articles about rocketry and space exploration!
        </p>
      </section>
      <section className="max-w-7xl mx-auto px-4">
        <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
          {dummyBlogs.map((blog) => (
            <a key={blog.id} href={`/blogs/${blog.slug}`} className="block h-full">
              <Card
                image={blog.image}
                title={blog.title}
                date={new Date(blog.date).toLocaleDateString()}
                description={blog.description}
                vertical
              />
            </a>
          ))}
        </div>
      </section>

      {/* Contact Section */}
      <section className="max-w-2xl mx-auto mt-20 px-4">
        <div className="bg-surface rounded-xl p-8 text-center border border-accent shadow-md" style={{ backgroundColor: '#232323' }}>
          <h3 className="text-2xl font-bold text-primary mb-2">Want to Contribute?</h3>
          <p className="text-text-secondary mb-4">Have a story, project, or insight to share? Reach out and get featured on our blog!</p>
          <a href="mailto:uoarocketryclub@gmail.com" className="button">Contact Us</a>
        </div>
      </section>
    </main>
  );
} 