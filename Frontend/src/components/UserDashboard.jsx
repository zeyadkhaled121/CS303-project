// src/components/UserDashboard.jsx
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { FaBookOpen, FaBook } from "react-icons/fa";
import { fetchAllBooks, resetBookSlice } from "../store/slices/bookSlice";
import { toggleReadBookPopup } from "../store/slices/popUpSlice";
import { toast } from "react-toastify";
import ReadBookPopup from "../popups/ReadBookPopup";

const UserDashboard = ({ searchTerm = "" }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { books, loading, error, message } = useSelector((state) => state.book);
  const { readBookPopup } = useSelector((state) => state.popup);

  const [selectedBook, setSelectedBook] = useState(null);

  useEffect(() => {
    dispatch(fetchAllBooks());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(resetBookSlice());
    }
    if (message) {
      toast.success(message);
      dispatch(resetBookSlice());
    }
  }, [error, message, dispatch]);

  const handleViewBook = (book) => {
    setSelectedBook(book);
    dispatch(toggleReadBookPopup());
  };

  const filteredBooks = books.filter(
    (book) =>
      book.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.genre?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full space-y-8 animate-fadeIn">

      {/* Welcome Section */}
      <div>
        <h2 className="text-2xl font-extrabold text-gray-900">
          Welcome, {user?.name}!
        </h2>
        <p className="text-gray-500 text-sm mt-1">
          Browse the library collection and discover new books.
        </p>
      </div>

      {/* Books Grid */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl font-extrabold text-gray-900">Library Collection</h3>
            <p className="text-gray-500 text-sm mt-1">
              {filteredBooks.length} {filteredBooks.length === 1 ? "book" : "books"} available
            </p>
          </div>
        </div>

        {loading && !books.length ? (
          <div className="text-center py-16 text-gray-400">Loading books...</div>
        ) : filteredBooks.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            {searchTerm ? "No books match your search." : "No books available in the library yet."}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {filteredBooks.map((book) => (
              <div
                key={book.id}
                className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex flex-col hover:shadow-xl transition-all duration-300 group"
              >
                {/* Image Container */}
                <div className="w-full h-56 bg-gray-100 rounded-2xl mb-5 overflow-hidden flex items-center justify-center relative">
                  <span className="absolute top-4 left-4 bg-black/30 backdrop-blur-sm text-white text-xs px-4 py-1.5 rounded-full font-semibold">
                    {book.genre}
                  </span>
                  <span
                    className={`absolute top-4 right-4 text-xs px-3 py-1 rounded-full font-bold ${
                      book.status === "Available"
                        ? "bg-green-100 text-green-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {book.status}
                  </span>
                  {book.image?.url ? (
                    <img
                      src={book.image.url}
                      alt={book.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <FaBook size={40} className="text-gray-300" />
                  )}
                </div>

                {/* Content Section */}
                <div className="flex flex-col flex-grow text-left px-1">
                  <h3 className="font-extrabold text-gray-900 text-base mb-1 h-12 overflow-hidden line-clamp-2 leading-snug">
                    {book.title}
                  </h3>
                  <p className="text-xs text-gray-500 mb-1">{book.author}</p>
                  <p className="text-xs text-gray-400 mb-4">Edition: {book.edition}</p>
                </div>

                {/* Action Button */}
                <button
                  onClick={() => handleViewBook(book)}
                  className="w-full flex items-center justify-center gap-2 text-sm bg-gray-100 text-gray-700 py-3 rounded-2xl font-bold hover:bg-[#358a74] hover:text-white transition-all mt-auto active:scale-95"
                >
                  <FaBookOpen /> View Details
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Read Book Popup */}
      {readBookPopup && selectedBook && <ReadBookPopup book={selectedBook} />}
    </div>
  );
};

export default UserDashboard;
