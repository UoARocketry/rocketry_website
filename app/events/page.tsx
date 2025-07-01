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
          <Card
            image="https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=600&q=80"
            title="Rocket Launch Day 2024"
            date="July 20, 2024"
            description="Join us for our annual Rocket Launch Day! Experience the thrill of launching model rockets and learn about the science behind rocketry. Open to all skill levels."
          />
          <Card
            image="https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=600&q=80"
            title="Rocket Design Workshop"
            date="August 10, 2024"
            description="Learn the basics of rocket design and construction in this hands-on workshop. Materials provided, just bring your curiosity!"
          />
          <Card
            image="https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=600&q=80"
            title="Propulsion Seminar"
            date="September 5, 2024"
            description="A deep dive into rocket propulsion systems, featuring guest speakers from the aerospace industry."
          />
          <Card
            image="https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=600&q=80"
            title="Team Social Night"
            date="October 2, 2024"
            description="Meet fellow rocketry enthusiasts, play games, and enjoy some snacks at our club social night!"
          />
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-bold mb-4 mt-10 text-left">Past Events</h2>
        <div className="grid gap-8 grid-cols-1 sm:grid-cols-2">
          <Card
            image="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80"
            title="Rocketry Workshop 2023"
            date="October 15, 2023"
            description="A hands-on workshop where members built and launched their own model rockets. Thanks to everyone who participated and made it a blast!"
          />
          <Card
            image="https://images.unsplash.com/photo-1468421870903-4df1664ac249?auto=format&fit=crop&w=600&q=80"
            title="Annual General Meeting 2023"
            date="September 12, 2023"
            description="Our yearly AGM where we discussed club progress, elected new execs, and planned for the future."
          />
          <Card
            image="https://images.unsplash.com/photo-1465101178521-c1a9136a3fd8?auto=format&fit=crop&w=600&q=80"
            title="Rocket Build Night"
            date="August 18, 2023"
            description="Members gathered to build and decorate their own rockets, with prizes for the most creative designs."
          />
          <Card
            image="https://images.unsplash.com/photo-1468449032589-876ed4b3eefe?auto=format&fit=crop&w=600&q=80"
            title="Intro to Rocketry Seminar"
            date="July 5, 2023"
            description="An introductory seminar for new members covering the basics of rocketry and club activities."
          />
        </div>
      </section>
    </main>
  );
} 