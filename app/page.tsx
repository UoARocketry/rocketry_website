import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background text-text-main">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center py-24 px-4 bg-background">
        <img src="/UARC logo.png" alt="UARC Logo" className="h-24 mb-6 drop-shadow-xl" />
        <h1 className="text-5xl md:text-6xl font-extrabold mb-4">University of Auckland Rocketry Club</h1>
        <p className="text-xl md:text-2xl text-text-secondary mb-8 max-w-2xl">
          Student-led rocketry club dedicated to designing, building, and launching rockets. Join us in exploring aerospace engineering and space exploration.
        </p>
        <Link href="/signup" className="button bg-primary text-white text-lg px-8 py-3 rounded-full font-bold shadow-lg hover:bg-[#a94425] transition">Sign Up</Link>
      </section>

    </main>
  );
}
