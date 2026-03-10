import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import BookCard from "../components/BookCard";
import AdminDashboard from "../components/AdminDashboard";
import UserDashboard from "../components/UserDashboard";
import Catalog from "../components/Catalog";
import Users from "../components/Users";
import AddNewAdmin from "../popups/AddNewAdmin";
import Login from "./Login";
import Register from "./Register";
import { useLocation } from "react-router-dom";
import { fetchAllBooks } from "../store/slices/bookSlice";

const Home = ({ selectedComponent, searchTerm }) => {
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { books, loading: booksLoading } = useSelector((state) => state.book);
  const { AddNewAdminPopup } = useSelector((state) => state.popup);
  const location = useLocation();

  // Fetch books from database for the guest landing page
  useEffect(() => {
    if (!isAuthenticated) {
      dispatch(fetchAllBooks());
    }
  }, [dispatch, isAuthenticated]);

  // Filter books based on Header search bar input
  const filteredBooks = books.filter((book) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      book.title?.toLowerCase().includes(term) ||
      book.author?.toLowerCase().includes(term) ||
      book.genre?.toLowerCase().includes(term)
    );
  });

  // Check current route to determine if modal should be shown
  const isLoginPath = location.pathname === "/login";
  const isRegisterPath = location.pathname === "/register";

  // Render the correct component based on sidebar selection
  const renderSelectedComponent = () => {
    const isAdmin = user?.role === "Admin" || user?.role === "Super Admin";

    switch (selectedComponent) {
      case "Dashboard":
        return isAdmin ? <AdminDashboard searchTerm={searchTerm} /> : <UserDashboard searchTerm={searchTerm} />;
      case "Books":
        return <Catalog searchTerm={searchTerm} />;
      case "AllUsers":
        return isAdmin ? <Users searchTerm={searchTerm} /> : <UserDashboard searchTerm={searchTerm} />;
      case "My Borrowed Books":
        return <UserDashboard searchTerm={searchTerm} />;
      default:
        return isAdmin ? <AdminDashboard searchTerm={searchTerm} /> : <UserDashboard searchTerm={searchTerm} />;
    }
  };

  return (
    /* Main container */
    <div className="min-h-screen bg-[#f9f9f9]">
      
      {!isAuthenticated ? (
        <>
          {/* Guest View: Featured Content */}
          <div className="max-w-7xl mx-auto p-6 md:p-10">
            <section className="mb-12">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-extrabold text-gray-900">
                  Library Catalog
                </h2>
              </div>
              
              {booksLoading ? (
                <div className="flex justify-center items-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#358a74]"></div>
                </div>
              ) : filteredBooks.length === 0 ? (
                <p className="text-gray-500 text-center py-16 text-lg">
                  {searchTerm ? "No books match your search." : "No books available yet."}
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                  {filteredBooks.map((book) => (
                    <BookCard key={book.id} {...book} />
                  ))}
                </div>
              )}
            </section>
          </div>
        </>
      ) : (
        /* Authenticated View: render selected component */
        <div className="transition-all duration-500">
          {renderSelectedComponent()}
        </div>
      )}

      {/* Auth Modal: Renders when route matches /login or /register */}
      {/* Login & Register already have their own fixed overlay — render them directly */}
      {!isAuthenticated && isLoginPath && <Login />}
      {!isAuthenticated && isRegisterPath && <Register />}

      {/* AddNewAdmin Popup (opened via sidebar "Add Admin" for Super Admin) */}
      {AddNewAdminPopup && <AddNewAdmin />}
    </div>
  );
};

export default Home;
