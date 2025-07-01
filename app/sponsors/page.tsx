import React from "react";

const sponsors = {
  gold: [
    {
      name: "Gold Sponsor 1",
      logo: "https://via.placeholder.com/200x100?text=Gold+1",
      link: "#",
      description: "Leading supporter of our rocketry program."
    },
    {
      name: "Gold Sponsor 2",
      logo: "https://via.placeholder.com/200x100?text=Gold+2",
      link: "#",
      description: "Major contributor to our launches."
    }
  ],
  silver: [
    {
      name: "Silver Sponsor 1",
      logo: "https://via.placeholder.com/180x90?text=Silver+1",
      link: "#",
      description: "Supporting our workshops and events."
    },
    {
      name: "Silver Sponsor 2",
      logo: "https://via.placeholder.com/180x90?text=Silver+2",
      link: "#",
      description: "Valued partner in education."
    }
  ],
  bronze: [
    {
      name: "Bronze Sponsor 1",
      logo: "https://via.placeholder.com/150x75?text=Bronze+1",
      link: "#",
      description: "Community supporter."
    },
    {
      name: "Bronze Sponsor 2",
      logo: "https://via.placeholder.com/150x75?text=Bronze+2",
      link: "#",
      description: "Friend of the club."
    }
  ]
};

function SponsorCard({ sponsor }: { sponsor: any }) {
  return (
    <a
      href={sponsor.link}
      target="_blank"
      rel="noopener noreferrer"
      className="bg-surface rounded border border-accent flex flex-col items-center p-6 shadow-[0_2px_12px_0_rgba(194,86,50,0.15)] hover:shadow-[0_6px_24px_0_rgba(194,86,50,0.25)] hover:scale-101 hover:-translate-y-1 hover:ring-1 hover:ring-primary/60 transition-all duration-200"
      style={{ backgroundColor: '#232323' }}
    >
      <img
        src={sponsor.logo}
        alt={sponsor.name}
        className="mb-4 object-contain"
        style={{ maxHeight: 80, maxWidth: 200, background: '#fff', borderRadius: 8, padding: 8 }}
      />
      <h3 className="text-lg font-bold text-primary mb-1 text-center">{sponsor.name}</h3>
      <p className="text-text-secondary text-sm text-center">{sponsor.description}</p>
    </a>
  );
}

export default function SponsorsPage() {
  return (
    <main className="min-h-screen bg-background pb-16 text-text-main flex justify-center">
      <div className="w-full max-w-7xl">
        <section className="max-w-7xl mx-auto pt-16 pb-8 px-4 text-left">
          <h1 className="text-5xl font-extrabold mb-4 text-primary">Our Sponsors</h1>
          <p className="text-lg text-text-secondary max-w-2xl mb-4">
            We are grateful for the generous support of our sponsors. Their contributions make our rocketry projects and events possible. Interested in sponsoring us?
          </p>
          <a href="mailto:uoarocketryclub@gmail.com" className="button inline-block">Contact Us</a>
        </section>

        {/* Gold Sponsors */}
        <section className="max-w-7xl mx-auto px-4 mt-12">
          <h2 className="text-3xl font-bold mb-6 text-primary text-left">Gold Sponsors</h2>
          <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
            {sponsors.gold.map((sponsor, idx) => (
              <SponsorCard sponsor={sponsor} key={idx} />
            ))}
          </div>
        </section>

        {/* Silver Sponsors */}
        <section className="max-w-7xl mx-auto px-4 mt-16">
          <h2 className="text-2xl font-bold mb-6 text-primary text-left">Silver Sponsors</h2>
          <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
            {sponsors.silver.map((sponsor, idx) => (
              <SponsorCard sponsor={sponsor} key={idx} />
            ))}
          </div>
        </section>

        {/* Bronze Sponsors */}
        <section className="max-w-7xl mx-auto px-4 mt-16">
          <h2 className="text-xl font-bold mb-6 text-primary text-left">Bronze Sponsors</h2>
          <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
            {sponsors.bronze.map((sponsor, idx) => (
              <SponsorCard sponsor={sponsor} key={idx} />
            ))}
          </div>
        </section>

        {/* Contact */}
        <section className="max-w-7xl mx-auto mt-20 px-4">
          <div className="bg-surface rounded-xl p-12 text-center border border-accent shadow-md" style={{ backgroundColor: '#232323' }}>
            <h3 className="text-2xl font-bold text-primary mb-2">Become a Sponsor</h3>
            <p className="text-text-secondary mb-4">Support the next generation of rocketeers and get your company featured here!</p>
            <a href="mailto:uoarocketryclub@gmail.com" className="button">Contact Us</a>
          </div>
        </section>
      </div>
    </main>
  );
} 