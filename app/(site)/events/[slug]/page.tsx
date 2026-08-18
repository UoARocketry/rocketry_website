import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getEventBySlug } from "@/lib/site-data";
import { formatDateWithTime } from "@/lib/utils";
import { PLACEHOLDER_IMAGE } from "@/lib/constants";

interface EventPageProps {
  readonly params: Promise<{ slug: string }>;
}

function isUpcoming(dateValue: string): boolean {
  return new Date(dateValue).getTime() >= Date.now();
}

export default async function EventPage({ params }: EventPageProps) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);

  if (!event) {
    notFound();
  }

  return (
    <main className="min-h-screen max-w-7xl mx-auto pb-16">
      <section className="max-w-7xl mx-auto pt-16 pb-8 px-4">
        <div className="mb-6">
          <Link
            href="/events"
            className="inline-flex items-center text-primary hover:text-primary/80 transition-colors"
          >
            ← Back to all Events
          </Link>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Event Image */}
          <div className="relative">
            <Image
              src={event.image ?? PLACEHOLDER_IMAGE}
              alt={event.title}
              width={1200}
              height={900}
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="w-full h-96 object-cover rounded-lg shadow-lg"
            />
          </div>

          {/* Event Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-5xl font-extrabold mb-4 text-primary">
                {event.title}
              </h1>
              <div className="mb-4">
                <span className="inline-flex items-center text-xs px-3 py-1 rounded-full border border-primary/50 text-primary bg-primary/10">
                  {event.eventTag ?? "General"}
                </span>
              </div>
              <div className="space-y-2 mb-4 text-sm sm:text-base">
                <p className="text-text-secondary leading-relaxed">
                  <span className="text-primary font-semibold">Date:</span>{" "}
                  {formatDateWithTime(event.date)}
                </p>
                <p className="text-text-secondary leading-relaxed">
                  <span className="text-primary font-semibold">Location:</span>{" "}
                  {event.location}
                </p>
              </div>
            </div>

            <p className="text-lg text-text-main leading-relaxed">
              {event.description}
            </p>

            {isUpcoming(event.date) && event.signupUrl && (
              <div className="mt-8">
                <a
                  href={event.signupUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="button bg-primary px-6 py-3 font-bold hover:bg-primary-dark transition-all duration-200"
                  style={{ color: "#ffffff" }}
                  aria-label={`Sign up for ${event.title}`}
                >
                  Sign Up
                </a>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
