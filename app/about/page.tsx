import Link from "next/link";
import Card from "../../components/ui/card";

// Define the Exec type
type Exec = {
  id: number;
  name: string;
  role: string;
  bio: string;
  photo: string;
  order: number;
};

// Function to fetch exec data
async function getExecMembers(): Promise<Exec[]> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/exec`, {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      console.error('Failed to fetch exec members');
      return [];
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching exec members:', error);
    return [];
  }
}

export default async function AboutPage() {
  const execMembers = await getExecMembers();
  return (
    <main className="min-h-screen bg-background text-text-main pt-20">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center py-24 px-4 bg-background relative overflow-hidden">
        <div className="relative z-10 max-w-4xl mx-auto">
          <img
            src="https://via.placeholder.com/800x250?text=About+UARC+Placeholder"
            alt="About UARC Placeholder"
            className="rounded-xl shadow-2xl w-full max-w-3xl mx-auto"
          />
        </div>
      </section>

      {/* What Do We Do Section */}
      <section className="py-16 px-4 bg-surface">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-extrabold mb-4">What Do We Do?</h2>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto">
              We offer a variety of activities to help students learn, network, and grow in the field of rocketry
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-background rounded-lg p-6 border border-accent text-center">
              <div className="text-4xl mb-4">🔧</div>
              <h3 className="text-xl font-bold text-primary mb-3">Workshops</h3>
              <p className="text-text-secondary">
                Hands-on workshops covering rocket design, propulsion systems, and manufacturing techniques. Learn practical skills from experienced members.
              </p>
            </div>
            <div className="bg-background rounded-lg p-6 border border-accent text-center">
              <div className="text-4xl mb-4">🏭</div>
              <h3 className="text-xl font-bold text-primary mb-3">Industry Events</h3>
              <p className="text-text-secondary">
                Connect with professionals in the aerospace industry through guest lectures, site visits, and networking events with leading companies.
              </p>
            </div>
            <div className="bg-background rounded-lg p-6 border border-accent text-center">
              <div className="text-4xl mb-4">🎉</div>
              <h3 className="text-xl font-bold text-primary mb-3">Social Events</h3>
              <p className="text-text-secondary">
                Build friendships and team spirit through social gatherings, team building activities, and celebrations of our achievements.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
} 