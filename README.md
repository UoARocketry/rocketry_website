# University of Auckland Rocketry Club Website

A full-stack website for the University of Auckland Rocketry Club, built with Next.js, TypeScript, Tailwind CSS, and Prisma.

## Features

### Pages
- **Home**: Club overview, blog/events preview, exec team showcase, sponsors section
- **About**: Detailed information about what the club does, mission, and activities
- **Events**: Display of upcoming and past events with individual event details
- **Rockets**: Showcase of all rockets built by the club with images and descriptions
- **Blogs**: Organized blog sections (recent, projects, other) with article previews
- **Exec Team**: Executive team profiles with photos and detailed information
- **Sign Up**: Membership application form for new members
- **Sponsors**: Sponsorship opportunities and current sponsors

### Tech Stack
- **Frontend**: Next.js 15 with React 19 and TypeScript
- **Styling**: Tailwind CSS with custom UI components
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Deployment**: Vercel-ready

## Project Structure

```
rocketry_website/
├── app/                    # App directory
│   ├── about/             # About page
│   ├── events/            # Events page
│   ├── rockets/           # Rockets page
│   ├── blogs/             # Blogs page
│   ├── exec/              # Executive team page
│   ├── signup/            # Sign up page
│   ├── sponsors/          # Sponsors page
│   ├── api/               # API routes
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # Reusable components
│   ├── ui/               # UI components (Button, Card, Badge)
│   └── navigation.tsx    # Navigation component
├── lib/                  # Utility functions
│   ├── prisma.ts         # Prisma client
│   └── utils.ts          # Utility functions
├── prisma/               # Database schema and migrations
│   └── schema.prisma     # Database schema
└── public/               # Static assets
```

## Database Schema

The project includes a comprehensive Prisma schema with models for:
- **Events**: Club events with dates, locations, and categories
- **Rockets**: Rocket projects with specifications and launch data
- **Exec**: Executive team members with roles and bios
- **BlogPosts**: Blog articles with categories and content
- **Sponsors**: Sponsor information and logos

## Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Adding New Pages
1. Create a new directory in `app/` with the page name
2. Add a `page.tsx` file with the component
3. Update the navigation in `components/navigation.tsx`

### Styling
The project uses Tailwind CSS with custom UI components. All components are in `components/ui/` and follow a consistent design system.

### Database Changes
1. Update the Prisma schema in `prisma/schema.prisma`
2. Generate the Prisma client: `npx prisma generate`
3. Create and run migrations: `npx prisma migrate dev`

## License

This project is licensed under the MIT License.

## Contact

For questions about the website or the University of Auckland Rocketry Club:
- Email: rocketry@auckland.ac.nz
