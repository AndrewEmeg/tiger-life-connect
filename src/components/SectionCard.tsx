
import React from "react";
import { Link } from "react-router-dom";

interface SectionCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  to: string;
  gradient?: string;
}

const SectionCard: React.FC<SectionCardProps> = ({ 
  title, 
  description, 
  icon, 
  to,
  gradient = "from-primary/50 to-primary"
}) => {
  return (
    <Link 
      to={to} 
      className={`block bg-gradient-to-br ${gradient} rounded-xl shadow-lg p-6 text-left transition-all duration-300 hover:shadow-xl hover:scale-[1.02] h-full`}
    >
      <div className="flex flex-col h-full">
        <div className="text-tigerBlack mb-4 p-3 bg-white rounded-full w-fit">
          {icon}
        </div>
        <h2 className="text-2xl font-bold mb-2 text-tigerBlack">{title}</h2>
        <p className="text-tigerBlack/80 mb-6">{description}</p>
        <div className="mt-auto">
          <span className="text-sm font-semibold bg-white text-tigerBlack px-4 py-2 rounded-full inline-flex items-center">
            Explore
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-4 w-4 ml-2" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M14 5l7 7m0 0l-7 7m7-7H3" 
              />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  );
};

export default SectionCard;
