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


    </main>
  );
} 