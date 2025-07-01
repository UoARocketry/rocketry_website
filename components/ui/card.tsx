import React from "react";

interface CardProps {
  image: string;
  title: string;
  date: string;
  description: string;
}

export default function Card({ image, title, date, description }: CardProps) {
  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 flex flex-col h-full transition-transform duration-200 hover:shadow-2xl hover:scale-102 hover:cursor-pointer focus-within:shadow-2xl focus-within:scale-102">
      <img src={image} alt={title} className="w-full h-48 object-cover rounded-t-xl"/>
      <div className="flex-1 p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-gray-500 text-xs">{date}</span>
          </div>
          <h3 className="text-xl font-bold mb-2">{title}</h3>
          <p className="text-gray-700 text-sm mb-4">{description}</p>
        </div>
      </div>
    </div>
  );
}
