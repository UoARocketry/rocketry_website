export default function SponsorCard({ sponsor }: { readonly sponsor: any }) {
  return (
    <a
      href={sponsor.url}
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
      {sponsor.description ? (
        <p className="text-sm text-text-secondary text-center mt-1">{sponsor.description}</p>
      ) : null}
    </a>
  );
}