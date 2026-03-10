import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchAllBooks, resetBookSlice } from "../store/slices/bookSlice";
import { toggleReadBookPopup } from "../store/slices/popUpSlice";
import { toast } from "react-toastify";
import { FaBook, FaBookOpen, FaFilter } from "react-icons/fa";
import ReadBookPopup from "../popups/ReadBookPopup";

const Catalog = ({ searchTerm = "" }) => {
  const dispatch = useDispatch();
  const { books, loading, error } = useSelector((state) => state.book);
  const { readBookPopup } = useSelector((state) => state.popup);

  const [selectedGenre, setSelectedGenre] = useState("All");
  const [selectedBook, setSelectedBook] = useState(null);

  useEffect(() => {
    dispatch(fetchAllBooks());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(resetBookSlice());
    }
  }, [error, dispatch]);

  const genres = ["All", ...new Set(books.map((b) => b.genre).filter(Boolean))];

  const filteredBooks = books.filter((book) => {
    const matchesSearch =
      book.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGenre = selectedGenre === "All" || book.genre === selectedGenre;
    return matchesSearch && matchesGenre;
  });

  const handleViewBook = (book) => {
    setSelectedBook(book);
    dispatch(toggleReadBookPopup());
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <FaBook className="text-[#358a74]" /> Book Catalog
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Browse all available books in the library.
        </p>
      </div>

      {/* Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex items-center gap-2">
          <FaFilter className="text-gray-400" />
          <select
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
            className="border border-gray-200 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#358a74]/20 focus:border-[#358a74] bg-white transition-all"
          >
            {genres.map((genre) => (
              <option key={genre} value={genre}>
                {genre}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results Count */}
      <p className="text-sm text-gray-500">
        {filteredBooks.length} {filteredBooks.length === 1 ? "book" : "books"} found
      </p>

      {/* Books Grid */}
      {loading && !books.length ? (
        <div className="text-center py-16 text-gray-400">Loading books...</div>
      ) : filteredBooks.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          {searchTerm || selectedGenre !== "All"
            ? "No books match your filters."
            : "No books in the catalog yet."}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredBooks.map((book) => (
            <div
              key={book.id}
              className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex flex-col hover:shadow-xl transition-all duration-300 group"
            >
              <div className="w-full h-52 bg-gray-100 rounded-2xl mb-4 overflow-hidden flex items-center justify-center relative">
                <span className="absolute top-3 left-3 bg-black/30 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full font-semibold">
                  {book.genre}
                </span>
                <span
                  className={`absolute top-3 right-3 text-xs px-3 py-1 rounded-full font-bold ${
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
                  <FaBook size={36} className="text-gray-300" />
                )}
              </div>

              <div className="flex flex-col flex-grow text-left px-1">
                <h3 className="font-extrabold text-gray-900 text-sm mb-1 h-10 overflow-hidden line-clamp-2 leading-snug">
                  {book.title}
                </h3>
                <p className="text-xs text-gray-500 mb-1">{book.author}</p>
                <p className="text-xs text-gray-400 mb-3">Edition: {book.edition}</p>
              </div>

              <button
                onClick={() => handleViewBook(book)}
                className="w-full flex items-center justify-center gap-2 text-sm bg-gray-100 text-gray-700 py-2.5 rounded-2xl font-bold hover:bg-[#358a74] hover:text-white transition-all mt-auto active:scale-95"
              >
                <FaBookOpen /> View Details
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Read Popup */}
      {readBookPopup && selectedBook && <ReadBookPopup book={selectedBook} />}
    </div>
  );
};

export default Catalog;
