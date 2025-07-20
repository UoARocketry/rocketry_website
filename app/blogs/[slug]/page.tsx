import prisma from '@/lib/prisma';
import Card from '@/components/ui/card';
import { notFound } from 'next/navigation';
import { BlogPost } from '@prisma/client';

interface BlogPageProps {
  params: { slug: string };
}

export default async function BlogPostPage({ params }: BlogPageProps) {
  const blog: BlogPost | null = await prisma.blogPost.findUnique({
    where: { slug: params.slug },
  });

  if (!blog) return notFound();

  return (
    <main className="min-h-screen bg-background pb-16 text-text-main">
      <section className="max-w-3xl mx-auto pt-16 pb-8 px-4 text-left">
        <h1 className="text-4xl font-extrabold mb-4 text-primary pb-1">{blog.title}</h1>
        <p className="text-text-secondary mb-2">{new Date(blog.date).toLocaleDateString()}</p>
        <div className="mb-8">
          <Card
            image={"/UARC logo.png"}
            title={blog.title}
            date={new Date(blog.date).toLocaleDateString()}
            description={blog.content}
            vertical
          />
        </div>
        <article className="prose prose-invert max-w-none text-lg">
          {blog.content}
        </article>
      </section>
    </main>
  );
} 