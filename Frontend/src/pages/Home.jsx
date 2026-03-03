import React from "react";
import { useSelector } from "react-redux";
import BookCard from "../components/BookCard";
import Header from "../layout/Header";
import AdminDashboard from "../components/AdminDashboard";
import UserDashboard from "../components/UserDashboard";
import Login from "./Login";
import Register from "./Register";
import { useLocation } from "react-router-dom";
import image1 from "../assets/1.png";
import image2 from "../assets/2.png";
import image3 from "../assets/3.png";
import image4 from "../assets/4.png";

const realBooks = [
  { title: "Thinking Outside the Box", author: "Mohamed Taha", type: "Review", imageUrl: image1 },
  { title: "Atomic Habits", author: "James Clear", type: "Review", imageUrl: image2 },
  { title: "The Subtle Art k", author: "Mark Manson", type: "Review", imageUrl: image3 },
  { title: "The Power of Habit", author: "Charles Duhigg", type: "Review", imageUrl: image4 },
];

const Home = () => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const location = useLocation();

  // Check current route to determine if modal should be shown
  const isLoginPath = location.pathname === "/login";
  const isRegisterPath = location.pathname === "/register";

  return (
    /* Main container */
    <div className="min-h-screen bg-[#f9f9f9]">
      
      {!isAuthenticated ? (
        <>
          {/* Guest View: Header and Featured Content */}
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
              
              {/*  book cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {realBooks.map((book, index) => (
                  <BookCard key={index} {...book} />
                ))}
              </div>
            </section>
          </div>
        </>
      ) : (
        /* Authenticated View: User/Admin Dashboard */
        <div className="transition-all duration-500">
          {user?.role === "Admin" ? <AdminDashboard /> : <UserDashboard />}
        </div>
      )}

      {/* Auth Modal Overlay: Renders when route matches /login or /register */}
      {!isAuthenticated && (isLoginPath || isRegisterPath) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md p-4 animate-fade-in-down">
             {isRegisterPath ? <Register /> : <Login />}
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;