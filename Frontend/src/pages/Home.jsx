import React from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";

// Layout & Components
import Header from "../layout/Header";
import BookCard from "../components/BookCard";
import AdminDashboard from "../components/AdminDashboard";
import UserDashboard from "../components/UserDashboard";
import BookManagement from "../components/BookManagement";
import AddBookPopup from "../popups/AddBookPopup"; // Ensure path is correct

// Auth Components
import Login from "./Login";
import Register from "./Register";

// Assets (Static images for guest view)
import image1 from "../assets/1.png";
import image2 from "../assets/2.png";
import image3 from "../assets/3.png";
import image4 from "../assets/4.png";

const realBooks = [
  { title: "Thinking Outside the Box", author: "Mohamed Taha", type: "Review", imageUrl: image1 },
  { title: "Atomic Habits", author: "James Clear", type: "Review", imageUrl: image2 },
  { title: "The Subtle Art", author: "Mark Manson", type: "Review", imageUrl: image3 },
  { title: "The Power of Habit", author: "Charles Duhigg", type: "Review", imageUrl: image4 },
];

const Home = ({ selectedComponent }) => {
  // 1. Extract authentication state
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  
  // 2. Extract popup state (FIXED: using 'addBookPopup' to match your Slice)
  const { addBookPopup } = useSelector((state) => state.popup); 
  
  const location = useLocation();

  // Route checks for rendering Auth Modals over the home page
  const isLoginPath = location.pathname === "/login";
  const isRegisterPath = location.pathname === "/register";

  // Helper function to switch views based on Sidebar selection
  const renderSelectedComponent = () => {
    switch (selectedComponent) {
      case "BookManagement":
        return <BookManagement />;
      case "Dashboard":
        return user?.role === "Admin" || user?.role === "SuperAdmin" ? (
          <AdminDashboard />
        ) : (
          <UserDashboard />
        );
      case "AllUsers":
        return <div className="p-6 font-bold text-gray-600">Users List (Coming Soon)</div>;
      default:
        // Default view for normal users or if nothing is selected
        return <UserDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-[#f9f9f9]">
      
      {/* --- GUEST VIEW (If not logged in) --- */}
      {!isAuthenticated ? (
        <>
          <Header />
          <div className="max-w-7xl mx-auto p-6 md:p-10">
            <section className="mb-12">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-extrabold text-gray-900">
                  Most Popular Book Reviews
                </h2>
                <button className="text-sm text-[#358a74] font-semibold hover:underline">
                  View All
                </button>
              </div>
              
              {/* Render static book cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {realBooks.map((book, index) => (
                  <BookCard key={index} {...book} />
                ))}
              </div>
            </section>
          </div>
        </>
      ) : (
        /* --- AUTHENTICATED VIEW (Based on Sidebar) --- */
        <div className="transition-all duration-500 ease-in-out">
          {renderSelectedComponent()}
        </div>
      )}

      {/* --- GLOBAL POPUPS --- */}
      
      {/* 1. Add Book Popup (Controlled by Redux State) */}
      {addBookPopup && <AddBookPopup />}

      {/* 2. Authentication Modal Overlays */}
      {!isAuthenticated && (isLoginPath || isRegisterPath) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="w-full max-w-md animate-in fade-in zoom-in duration-300">
             {isRegisterPath ? <Register /> : <Login />}
          </div>
        </div>
      )}
      
    </div>
  );
};

export default Home;