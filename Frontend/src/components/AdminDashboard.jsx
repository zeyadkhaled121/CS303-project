import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { FaPlus, FaTrash, FaEdit, FaUserShield, FaBook, FaEye } from "react-icons/fa";
import { fetchAllBooks, deleteBook, resetBookSlice } from "../store/slices/bookSlice";
import { toggleAddBookPopup, toggleReadBookPopup } from "../store/slices/popUpSlice";
import { toast } from "react-toastify";
import AddBookPopup from "../popups/AddBookPopup";
import ReadBookPopup from "../popups/ReadBookPopup";

const AdminDashboard = ({ searchTerm = "" }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { books, loading, error, message } = useSelector((state) => state.book);
  const { addBookPopup, readBookPopup } = useSelector((state) => state.popup);


  const [selectedBook, setSelectedBook] = useState(null);
  const [editBook, setEditBook] = useState(null);

  const isSuperAdmin = user?.role === "Super Admin";

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
      dispatch(fetchAllBooks());
      setEditBook(null);
    }
  }, [error, message, dispatch]);

  const handleDelete = (bookId, title) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      dispatch(deleteBook(bookId));
    }
  };

  const handleView = (book) => {
    setSelectedBook(book);
    dispatch(toggleReadBookPopup());
  };

  const handleEdit = (book) => {
    setEditBook(book);
    dispatch(toggleAddBookPopup());
  };

  const handleAddNew = () => {
    setEditBook(null);
    dispatch(toggleAddBookPopup());
  };

  const filteredBooks = books.filter(
    (book) =>
      book.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.genre?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            {isSuperAdmin ? (
              <FaUserShield className="text-[#358a74]" />
            ) : (
              <FaBook className="text-[#358a74]" />
            )}
            {isSuperAdmin ? "Super Admin Dashboard" : "Admin Dashboard"}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Welcome back, {user?.name}. Manage the library collection below.
          </p>
        </div>

        <button
          onClick={handleAddNew}
          className="bg-[#358a74] text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-[#2c7360] transition-all shadow-md flex items-center gap-2 active:scale-95"
        >
          <FaPlus /> Add New Book
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Books</p>
          <p className="text-3xl font-black text-gray-900 mt-1">{books.length}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Available</p>
          <p className="text-3xl font-black text-[#358a74] mt-1">
            {books.filter((b) => b.status === "Available").length}
          </p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Genres</p>
          <p className="text-3xl font-black text-gray-900 mt-1">
            {[...new Set(books.map((b) => b.genre))].length}
          </p>
        </div>
      </div>

      {/* Books Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 text-gray-600 uppercase text-[11px] font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4">Book</th>
                <th className="px-6 py-4">Author</th>
                <th className="px-6 py-4">Genre</th>
                <th className="px-6 py-4">Edition</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading && !books.length ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-400">
                    Loading books...
                  </td>
                </tr>
              ) : filteredBooks.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-400">
                    {searchTerm ? "No books match your search." : "No books in the library yet. Add your first book!"}
                  </td>
                </tr>
              ) : (
                filteredBooks.map((book) => (
                  <tr key={book.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-14 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          {book.image?.url ? (
                            <img
                              src={book.image.url}
                              alt={book.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <FaBook className="text-gray-300" />
                            </div>
                          )}
                        </div>
                        <span className="font-semibold text-gray-800 text-sm">{book.title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{book.author}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-[#358a74]">
                        {book.genre}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{book.edition}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${
                          book.status === "Available"
                            ? "bg-green-50 text-green-600"
                            : "bg-amber-50 text-amber-600"
                        }`}
                      >
                        {book.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleView(book)}
                          className="p-2 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-500 transition-colors"
                          title="View"
                        >
                          <FaEye size={14} />
                        </button>
                        <button
                          onClick={() => handleEdit(book)}
                          className="p-2 rounded-lg hover:bg-emerald-50 text-gray-400 hover:text-[#358a74] transition-colors"
                          title="Edit"
                        >
                          <FaEdit size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(book.id, book.title)}
                          className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                          title="Delete"
                        >
                          <FaTrash size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Popups */}
      {addBookPopup && <AddBookPopup editBook={editBook} />}
      {readBookPopup && selectedBook && <ReadBookPopup book={selectedBook} />}
    </div>
  );
};

export default AdminDashboard;
