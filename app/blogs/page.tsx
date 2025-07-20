import Card from "@/components/ui/card";
import prisma from '@/lib/prisma';
import { BlogPost } from '@prisma/client';

async function getBlogsByCategory() {
  const blogs: BlogPost[] = await prisma.blogPost.findMany({
    orderBy: { date: 'desc' }
  });
  // Group blogs by category
  const grouped = {
    recent: blogs.filter((b: BlogPost) => b.category === 'recent'),
    projects: blogs.filter((b: BlogPost) => b.category === 'projects'),
    other: blogs.filter((b: BlogPost) => b.category === 'other'),
  };
  return grouped;
}

export default async function BlogsPage() {
  const blogsByCategory = await getBlogsByCategory();

  return (
    <main className="min-h-screen bg-background pb-16 text-text-main">
      <section className="max-w-7xl mx-auto pt-16 pb-8 px-4 text-left">
        <h1 className="text-5xl font-extrabold mb-4 text-primary pb-1">Blogs</h1>
        <p className="text-lg text-text-secondary max-w-2xl mb-8">
          Read our latest blogs and articles about rocketry and space exploration!
        </p>
      </section>
      <section className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-bold mb-4 text-primary">Recent</h2>
        <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
          {blogsByCategory.recent.map((blog: BlogPost) => (
            <a key={blog.id} href={`/blogs/${blog.slug}`} className="block h-full">
              <Card
                image={"/UARC logo.png"}
                title={blog.title}
                date={new Date(blog.date).toLocaleDateString()}
                description={blog.content}
                vertical
              />
            </a>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 mt-16">
        <h2 className="text-3xl font-bold mb-4 text-primary">Projects</h2>
        <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
          {blogsByCategory.projects.map((blog: BlogPost) => (
            <a key={blog.id} href={`/blogs/${blog.slug}`} className="block h-full">
              <Card
                image={"/UARC logo.png"}
                title={blog.title}
                date={new Date(blog.date).toLocaleDateString()}
                description={blog.content}
                vertical
              />
            </a>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 mt-16">
        <h2 className="text-3xl font-bold mb-4 text-primary">Other</h2>
        <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
          {blogsByCategory.other.map((blog: BlogPost) => (
            <a key={blog.id} href={`/blogs/${blog.slug}`} className="block h-full">
              <Card
                image={"/UARC logo.png"}
                title={blog.title}
                date={new Date(blog.date).toLocaleDateString()}
                description={blog.content}
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