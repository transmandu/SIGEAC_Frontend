import React from "react";

interface FeatureCardProps {
  image: string;
  title: string;
  items: string[];
}

const FeatureCard: React.FC<FeatureCardProps> = ({ image, title, items }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 flex flex-col h-full">
      {/* Imagen */}
      <div className="mb-4 flex justify-center">
        <img
          src={image}
          alt={title}
          className="w-20 h-20 object-cover rounded-lg"
        />
      </div>

      {/* Título */}
      <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">
        {title}
      </h3>

      {/* Lista de items */}
      <ul className="space-y-2 flex-grow">
        {items.map((item, index) => (
          <li key={index} className="flex items-start text-gray-700">
            <span className="text-green-500 mr-2 mt-1">•</span>
            <span className="text-sm">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FeatureCard;
