import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useLocation } from "react-router-dom";

// Components
import BookCard from "../components/BookCard";
import AdminDashboard from "../components/AdminDashboard";
import UserDashboard from "../components/UserDashboard";
import Catalog from "../components/Catalog";
import BookManagement from "../components/BookManagement";
import MyBorrowedBooks from "../components/MyBorrowedBooks";
import Users from "../components/Users";
import Stats from "../components/Stats"; 
import BorrowRequests from "../components/BorrowRequests"; 
import AddNewAdmin from "../popups/AddNewAdmin";
import Login from "./Login";
import Register from "./Register";

// Actions
import { fetchAllBooks } from "../store/slices/bookSlice";
import { 
  fetchAllBorrowedBooks, 
  fetchUserBorrowedBooks 
} from "../store/slices/borrowSlice"; 
import { getAllUsers } from "../store/slices/authSlice"; 

const Home = ({ selectedComponent, searchTerm , setSelectedComponent}) => {
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { books, loading: booksLoading } = useSelector((state) => state.book);
  const { AddNewAdminPopup } = useSelector((state) => state.popup);
  const location = useLocation();

  useEffect(() => {
    dispatch(fetchAllBooks());

    if (isAuthenticated) {
      if (user?.role === "Admin" || user?.role === "Super Admin") {
        dispatch(fetchAllBorrowedBooks());
        
        if (typeof getAllUsers === "function") {
          dispatch(getAllUsers());
        }
      } 
      
      else {
        dispatch(fetchUserBorrowedBooks());
      }
    }
  }, [dispatch, isAuthenticated, user?.role]);

  const filteredBooks = books?.filter((book) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      book.title?.toLowerCase().includes(term) ||
      book.author?.toLowerCase().includes(term) ||
      book.genre?.toLowerCase().includes(term)
    );
  }) || [];

  const isLoginPath = location.pathname === "/login";
  const isRegisterPath = location.pathname === "/register";

  const renderSelectedComponent = () => {
    const isAdmin = user?.role === "Admin" || user?.role === "Super Admin";

    switch (selectedComponent) {
      case "Dashboard":
      case "AdminDashboard": 
        return isAdmin ? <AdminDashboard searchTerm={searchTerm} /> : <UserDashboard searchTerm={searchTerm} />;
      
      case "Books":
        return <Catalog searchTerm={searchTerm} />;

      case "Stats":
        return isAdmin ? <Stats setSelectedComponent={setSelectedComponent} /> : <UserDashboard searchTerm={searchTerm} />;

      case "BookManagement":
        return isAdmin ? <BookManagement searchTerm={searchTerm} /> : <UserDashboard searchTerm={searchTerm} />;

      case "AllUsers":
        return isAdmin ? <Users searchTerm={searchTerm} /> : <UserDashboard searchTerm={searchTerm} />;

      case "My Borrowed Books":
        return <MyBorrowedBooks searchTerm={searchTerm} />;

      case "BorrowingRequests":
      case "BorrowRequests":
        return isAdmin ? <BorrowRequests searchTerm={searchTerm} /> : <UserDashboard searchTerm={searchTerm} />;
      default:
        return isAdmin ? <AdminDashboard searchTerm={searchTerm} /> : <UserDashboard searchTerm={searchTerm} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#f9f9f9]">
      {!isAuthenticated ? (
        <div className="max-w-7xl mx-auto p-6 md:p-10">
          <section className="mb-12">
            <div className="flex items-center gap-4 mb-8">
               <div className="w-2 h-10 bg-[#358a74] rounded-full"></div>
               <h2 className="text-3xl font-black text-gray-900 tracking-tight ">Sci Library Catalog</h2>
            </div>

            {booksLoading ? (
              <div className="flex flex-col justify-center items-center py-32 gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#358a74]"></div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Syncing Library...</p>
              </div>
            ) : filteredBooks.length === 0 ? (
              <div className="text-center py-24 bg-white rounded-[3rem] border border-dashed border-gray-200">
                <p className="text-gray-400 font-bold text-sm uppercase tracking-widest">
                  {searchTerm ? "No matches found for your search" : "The library is currently empty"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10">
                {filteredBooks.map((book) => (
                  <BookCard key={book._id || book.id} {...book} />
                ))}
              </div>
            )}
          </section>
        </div>
      ) : (
        <div className="transition-all duration-500 ease-in-out">
          {renderSelectedComponent()}
        </div>
      )}

      {/* Popups & Auth Modals */}
      {!isAuthenticated && isLoginPath && <Login />}
      {!isAuthenticated && isRegisterPath && <Register />}
      {AddNewAdminPopup && <AddNewAdmin />}
    </div>
  );
};

export default Home;