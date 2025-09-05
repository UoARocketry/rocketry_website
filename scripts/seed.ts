import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

const prisma = new PrismaClient();

async function main() {
  console.log('📝 Starting sponsor-only database seeding...');

  try {
    console.log('🗑️  Clearing existing sponsors...');
    await prisma.sponsor.deleteMany({});

    console.log('🪪 Inserting sponsor mock data...');
    const sponsorData = [
      { name: 'AeroTech Industries', logo: 'https://via.placeholder.com/200x100?text=AeroTech', url: 'https://aerotech.example', description: 'Carbon fiber materials supplier and fabrication support.' },
      { name: 'Launch Labs', logo: 'https://via.placeholder.com/200x100?text=Launch+Labs', url: 'https://launchlabs.example', description: 'Provides testing facilities and flight instrumentation.' },
      { name: 'RotorWorks', logo: 'https://via.placeholder.com/180x90?text=RotorWorks', url: 'https://rotorworks.example', description: 'Machining and fabrication partner for airframes.' },
      { name: 'PartsCo', logo: 'https://via.placeholder.com/180x90?text=PartsCo', url: 'https://partsco.example', description: 'Donates fasteners and off-the-shelf components.' },
      { name: 'Community Makers', logo: 'https://via.placeholder.com/150x75?text=Makers', url: 'https://makers.example', description: 'Local makerspace offering workshop time and mentorship.' },
      { name: 'Cafe Support', logo: 'https://via.placeholder.com/150x75?text=Cafe', url: 'https://cafesupport.example', description: 'Event refreshments and on-site volunteer support.' }
    ];

    for (const s of sponsorData) {
      await prisma.sponsor.create({ data: s });
      console.log(`✅ Created sponsor: ${s.name}`);
    }

    const totalSponsors = await prisma.sponsor.count();
    console.log(`📊 Total sponsors in database: ${totalSponsors}`);

    console.log('🎉 Sponsor seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error during sponsor seeding:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error('💥 Seeding failed:', e);
  process.exit(1);
});