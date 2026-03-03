import React from "react";
import { FaBookOpen } from "react-icons/fa";

const BookCard = ({ title, author, imageUrl, type }) => {
  return (
    // Main card container with hover shadow and scale effects
    <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center text-center hover:shadow-lg transition-all duration-300 group">
      
      {/* Image container with zoom effect on hover */}
      <div className="w-full h-48 bg-gray-100 rounded-2xl mb-4 overflow-hidden flex items-center justify-center relative">
        {imageUrl ? (
            <img 
              src={imageUrl} 
              alt={title} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
            />
        ) : (
            // Default icon if image is missing
            <FaBookOpen size={50} className="text-gray-300" />
        )}
        
        {/* Category Badge (e.g., Review/Summary) - Positioned Top-Left for LTR */}
        <span className="absolute top-3 left-3 bg-white/70 backdrop-blur-sm text-xs px-3 py-1 rounded-full font-semibold text-gray-700">
            {type}
        </span>
      </div>
      
      {/* Book Title */}
      <h3 className="font-bold text-gray-800 text-sm mb-1 h-10 overflow-hidden line-clamp-2">
        {title}
      </h3>
      
      {/* Author Name */}
      <p className="text-xs text-gray-500 mb-3">{author}</p>
      
      {/* Action Button */}
      <button className="w-full text-sm bg-[#358a74] text-white py-2.5 rounded-full font-semibold hover:bg-[#2c7361] transition-colors">
        View Review
      </button>
    </div>
  );
};

export default BookCard;