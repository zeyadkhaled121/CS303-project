// src/pages/UserDashboard.jsx
import React from "react";
import { useSelector } from "react-redux";
// Import images
import image1 from "../assets/1.png";
import image2 from "../assets/2.png";
import image3 from "../assets/3.png";
import image4 from "../assets/4.png";
import { FaChevronLeft, FaChevronRight, FaBookOpen, FaEdit, FaPlus } from "react-icons/fa";

const UserDashboard = () => {
  // الحصول على بيانات المستخدم من Redux
  const { user } = useSelector((state) => state.auth);

  // تحديد هل المستخدم أدمن (سوبر أو عادي)
  const isAdmin = user?.role === "Admin" || user?.role === "SuperAdmin";

  const books = [
    { id: 1, title: "The Noonday Demon", author: "Andrew Solomon", category: "Review", color: "bg-orange-400", imageUrl: image1 },
    { id: 2, title: "Why Greatness Cannot Be Planned", author: "Kenneth Stanley", category: "Review", color: "bg-red-500", imageUrl: image2 },
    { id: 3, title: "Elastic Habits", author: "Stephen Guise", category: "Review", color: "bg-green-500", imageUrl: image3 },
    { id: 4, title: "The Expectation Effect", author: "David Robson", category: "Review", color: "bg-yellow-500", imageUrl: image4 },
  ];

  return (
    <div className="w-full space-y-10 animate-fadeIn">
      
      {/* Navigation Tabs - Dynamic Labels */}
      <div className="flex gap-8 border-b border-gray-200 text-sm">
        <button className="pb-3 border-b-2 border-[#358a74] text-[#358a74] font-bold">
          {isAdmin ? "Inventory Management" : "My Library"}
        </button>
        <button className="pb-3 text-gray-400 hover:text-gray-600 transition flex items-center gap-2">
          {isAdmin ? <><FaPlus size={12}/> Add Global Book</> : "Borrow New Book"}
        </button>
      </div>

      {/* Book Management Section */}
      <section>
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900">
              {isAdmin ? "Global Book Collection" : "Manage Your Books"}
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              {isAdmin ? "Update, edit or remove books from the system." : "View your borrowed books and reading progress."}
            </p>
          </div>
          
          {/* Slider Controls */}
          <div className="flex gap-2">
            <button className="p-2.5 bg-white rounded-full shadow-sm hover:bg-gray-50 border border-gray-100 transition">
              <FaChevronLeft className="text-gray-400" />
            </button>
            <button className="p-2.5 bg-white rounded-full shadow-sm hover:bg-gray-50 border border-gray-100 transition">
              <FaChevronRight className="text-gray-400" />
            </button>
          </div>
        </div>

        {/* Responsive Grid for Book Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {books.map((book) => (
            <div key={book.id} className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex flex-col hover:shadow-xl transition-all duration-300 group">
              
              {/* Image Container */}
              <div className={`w-full h-56 ${book.color} rounded-2xl mb-5 overflow-hidden flex items-center justify-center relative`}>
                <span className="absolute top-4 left-4 bg-black/30 backdrop-blur-sm text-white text-xs px-4 py-1.5 rounded-full font-semibold">
                  {book.category}
                </span>
                
                {/* Edit Icon (Always Green theme) */}
                <button className="absolute top-4 right-4 p-2 bg-white/70 backdrop-blur-sm rounded-full text-[#358a74] hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity">
                    <FaEdit size={14} />
                </button>

                <img src={book.imageUrl} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              </div>
              
              {/* Content Section */}
              <div className="flex flex-col flex-grow text-left px-1">
                <h3 className="font-extrabold text-gray-900 text-base mb-1 h-12 overflow-hidden line-clamp-2 leading-snug">
                  {book.title}
                </h3>
                <p className="text-xs text-gray-500 mb-6">{book.author}</p>
              </div>
              
              {/* Dynamic Action Button */}
              <button className="w-full flex items-center justify-center gap-2 text-sm bg-gray-100 text-gray-700 py-3 rounded-2xl font-bold hover:bg-[#358a74] hover:text-white transition-all mt-auto active:scale-95">
                {isAdmin ? (
                  <><FaEdit /> Edit Properties</>
                ) : (
                  <><FaBookOpen /> Continue Reading</>
                )}
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default UserDashboard;