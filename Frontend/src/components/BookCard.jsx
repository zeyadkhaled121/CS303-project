import React from "react";
import { FaBookOpen } from "react-icons/fa";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const BookCard = ({ title, author, image, genre, status }) => {
  const imageUrl = image?.url;
  const { isAuthenticated } = useSelector((state) => state.auth);
  const navigateTo = useNavigate();

  const handleClick = () => {
    if (!isAuthenticated) {
      toast.info("Please login to access or borrow this book.", { toastId: "login-prompt" });
      navigateTo("/login");
    }
  };

  return (
    // Main card container with hover shadow and scale effects
    <div
      onClick={handleClick}
      className={`bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center text-center hover:shadow-lg transition-all duration-300 group ${!isAuthenticated ? "cursor-pointer" : ""}`}
    >  
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
        
        {/* Genre Badge */}
        {genre && (
          <span className="absolute top-3 left-3 bg-white/70 backdrop-blur-sm text-xs px-3 py-1 rounded-full font-semibold text-gray-700">
              {genre}
          </span>
        )}
      </div>
      
      {/* Book Title */}
      <h3 className="font-bold text-gray-800 text-sm mb-1 h-10 overflow-hidden line-clamp-2">
        {title}
      </h3>
      
      {/* Author Name */}
      <p className="text-xs text-gray-500 mb-3">{author}</p>
      
      {/* Status Badge */}
      <span className={`w-full text-sm py-2.5 rounded-full font-semibold text-center
        ${status === "Available" ? "bg-emerald-50 text-[#358a74]" : "bg-amber-50 text-amber-600"}`}>
        {status || "Available"}
      </span>
    </div>
  );
};

export default BookCard;
