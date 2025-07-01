import Card from "@/components/ui/card";

export default function EventsPage() {
  return (
    <main className="min-h-screen bg-gray-50 pb-16">
      <section className="max-w-7xl mx-auto pt-12 pb-6 px-4 text-left">
        <h1 className="text-5xl font-extrabold mb-4">Events</h1>
        <p className="text-lg text-gray-700">
          Discover and join our upcoming and past events! From launches to workshops, our events are open to all members and enthusiasts. Stay tuned for more updates and relive the highlights from our past activities.
        </p>
      </section>

      <section className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-bold mb-4 mt-10 text-left">Upcoming Events</h2>
        <div className="grid gap-8 grid-cols-1 sm:grid-cols-2">
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-bold mb-4 mt-10 text-left">Past Events</h2>
        <div className="grid gap-8 grid-cols-1 sm:grid-cols-2">
        </div>
      </section>
    </main>
  );
} 