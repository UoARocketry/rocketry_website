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

      {/* History Section */}
      <section className="py-16 px-4 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-extrabold mb-4">Our Journey</h2>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto">
              From humble beginnings to launching rockets that reach new heights
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-surface rounded-lg p-6 border border-accent">
              <div className="text-4xl mb-4">🚀</div>
              <h3 className="text-xl font-bold text-primary mb-3">2024 - Foundation</h3>
              <p className="text-text-secondary">
                UARC was established by Laura with a vision to bring rocketry to the University of Auckland.
              </p>
            </div>
            <div className="bg-surface rounded-lg p-6 border border-accent">
              <div className="text-4xl mb-4">🏆</div>
              <h3 className="text-xl font-bold text-primary mb-3">2025 - First Launch</h3>
              <p className="text-text-secondary">
                Successfully launched our first rocket, marking a major milestone in our club's history and proving our engineering capabilities.
              </p>
            </div>
            <div className="bg-surface rounded-lg p-6 border border-accent">
              <div className="text-4xl mb-4">🌟</div>
              <h3 className="text-xl font-bold text-primary mb-3">2 - Years Active</h3>
              <p className="text-text-secondary">
                Continuing to push boundaries with advanced rocket designs, expanded team, and growing influence in the aerospace community.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Achievements Section */}
      <section className="py-16 px-4 bg-surface">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-extrabold mb-4">Our Achievements</h2>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto">
              Milestones that showcase our commitment to excellence in rocketry
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-background rounded-lg p-6 text-center border border-accent">
              <div className="text-3xl font-bold text-primary mb-2">4+</div>
              <p className="text-text-secondary">Rockets Launched</p>
            </div>
            <div className="bg-background rounded-lg p-6 text-center border border-accent">
              <div className="text-3xl font-bold text-primary mb-2">50+</div>
              <p className="text-text-secondary">Active Members</p>
            </div>
            <div className="bg-background rounded-lg p-6 text-center border border-accent">
              <div className="text-3xl font-bold text-primary mb-2">100m+</div>
              <p className="text-text-secondary">Maximum Altitude</p>
            </div>
            <div className="bg-background rounded-lg p-6 text-center border border-accent">
              <div className="text-3xl font-bold text-primary mb-2">0+</div>
              <p className="text-text-secondary">Competitions</p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Structure Section */}
      <section className="py-16 px-4 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-extrabold mb-4">Our Team Structure</h2>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto">
              Organized teams working together to achieve our rocketry goals
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-surface rounded-lg p-6 border border-accent">
              <h3 className="text-xl font-bold text-primary mb-4">Ground Station Team</h3>
              <p className="text-text-secondary mb-4">
                Manage launch operations, tracking systems, and communication with rockets during flight.
              </p>
              <ul className="text-text-secondary text-sm space-y-2">
                <li>• Launch coordination</li>
                <li>• Telemetry tracking</li>
                <li>• Communication systems</li>
              </ul>
            </div>
            <div className="bg-surface rounded-lg p-6 border border-accent">
              <h3 className="text-xl font-bold text-primary mb-4">Recovery Team</h3>
              <p className="text-text-secondary mb-4">
                Develop parachute systems and recovery mechanisms to safely return rockets to the ground.
              </p>
              <ul className="text-text-secondary text-sm space-y-2">
                <li>• Parachute design</li>
                <li>• Deployment mechanisms</li>
                <li>• Landing zone analysis</li>
              </ul>
            </div>
            <div className="bg-surface rounded-lg p-6 border border-accent">
              <h3 className="text-xl font-bold text-primary mb-4">Structural Team</h3>
              <p className="text-text-secondary mb-4">
                Design and manufacture rocket airframes, ensuring structural integrity and aerodynamic efficiency.
              </p>
              <ul className="text-text-secondary text-sm space-y-2">
                <li>• Airframe design</li>
                <li>• Material selection</li>
                <li>• Manufacturing processes</li>
              </ul>
            </div>
            <div className="bg-surface rounded-lg p-6 border border-accent">
              <h3 className="text-xl font-bold text-primary mb-4">Avionics Team</h3>
              <p className="text-text-secondary mb-4">
                Handle all electronic systems including flight computers, sensors, and communication systems.
              </p>
              <ul className="text-text-secondary text-sm space-y-2">
                <li>• Flight computer programming</li>
                <li>• Sensor integration</li>
                <li>• Telemetry systems</li>
              </ul>
            </div>
            <div className="bg-surface rounded-lg p-6 border border-accent">
              <h3 className="text-xl font-bold text-primary mb-4">Control Systems Team</h3>
              <p className="text-text-secondary mb-4">
                Design and implement guidance, navigation, and control systems for rocket stability and trajectory.
              </p>
              <ul className="text-text-secondary text-sm space-y-2">
                <li>• Guidance algorithms</li>
                <li>• Navigation systems</li>
                <li>• Flight control</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-16 px-4 bg-background">
        <div className="max-w-2xl mx-auto">
          <div className="bg-surface rounded-xl p-8 text-center border border-accent shadow-md" style={{ backgroundColor: '#232323' }}>
            <h2 className="text-2xl font-bold text-primary mb-2">Ready to Join?</h2>
            <p className="text-text-secondary mb-4">
              Whether you're an experienced engineer or just starting your journey in aerospace, there's a place for you in UARC. Join us in pushing the boundaries of student rocketry!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="https://docs.google.com/forms/d/e/1FAIpQLSfS7PS--UX-fQinUfuYzVLV3-rM92cW7uVFOqoEVczgYLb8Qg/viewform?usp=sf_link" className="button bg-primary text-white px-6 py-3 font-bold hover:bg-[#a94425] transition-all duration-200" target="_blank" rel="noopener noreferrer">
                Become a Member
              </Link>
              <Link href="/events" className="button bg-primary text-white px-6 py-3 font-bold hover:bg-[#a94425] transition-all duration-200">
                Attend an Event
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
} 