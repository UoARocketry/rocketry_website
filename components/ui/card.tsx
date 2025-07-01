import React from "react";

interface CardProps {
  image: string;
  title: string;
  date: string;
  description: string;
  reverse?: boolean;
  vertical?: boolean;
}

export default function Card({ image, title, date, description, reverse = false, vertical = false }: CardProps) {
  if (vertical) {
    return (
      <div
        className="bg-surface rounded border border-accent flex flex-col h-full transition-all duration-200 shadow-[0_2px_12px_0_rgba(194,86,50,0.15)] hover:shadow-[0_6px_24px_0_rgba(194,86,50,0.25)] hover:scale-101 hover:-translate-y-1 hover:ring-1 hover:ring-primary/60 hover:cursor-pointer"
        style={{ backgroundColor: '#292929' }}
      >
        <img src={image} alt={title} className="w-full h-48 object-cover rounded-t" />
        <div className="flex-1 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs" style={{ color: '#C25632' }}>{date}</span>
            </div>
            <h3 className="text-xl font-bold mb-2 !text-white">{title}</h3>
            <p className="text-text-secondary text-sm mb-4">{description}</p>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div
      className={`bg-surface rounded border border-accent flex h-96 transition-all duration-200 shadow-[0_2px_12px_0_rgba(194,86,50,0.15)] hover:shadow-[0_6px_24px_0_rgba(194,86,50,0.25)] hover:scale-101 hover:-translate-y-1 hover:ring-1 hover:ring-primary/60 hover:cursor-pointer ${reverse ? 'flex-row-reverse' : 'flex-row'}`}
      style={{ backgroundColor: '#292929' }}
    >
      <img src={image} alt={title} className="h-full w-3/5 object-cover rounded-l-lg rounded-r-none" style={reverse ? { borderRadius: '0 .5rem .5rem 0' } : { borderRadius: '.5rem 0 0 .5rem' }} />
      <div className="flex-1 p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs" style={{ color: '#C25632' }}>{date}</span>
          </div>
          <h3 className="text-xl font-bold mb-2 !text-white">{title}</h3>
          <p className="text-text-secondary text-sm mb-4">{description}</p>
        </div>
      </div>
    </div>
  );
}
