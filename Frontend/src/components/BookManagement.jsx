import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Trash2, Edit3, Plus, Search, BookOpen, ImageIcon } from "lucide-react"; 
import { fetchBooks, deleteBook } from "../store/slices/bookSlice";
import { toggleAddBookPopup } from "../store/slices/popUpSlice";
import { toast } from "react-toastify";

const BookManagement = () => {
  const dispatch = useDispatch();
  const { books, loading } = useSelector((state) => state.book);
  const [searchedKeyword, setSearchedKeyword] = useState("");

  useEffect(() => {
    dispatch(fetchBooks());
  }, [dispatch]);

  // ---  Delete Alert ---
  const confirmDelete = (id, title) => {
    const DeleteMsg = ({ closeToast }) => (
      <div className="flex flex-col items-center justify-center w-full text-center p-1 font-sans">
        <div className="w-12 h-12 bg-[#358a74] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-[#358a74]/20 mb-3">
          <BookOpen size={24} />
        </div>
        <div className="flex flex-col items-center w-full">
          <span className="text-[10px] font-black text-[#358a74] uppercase tracking-[0.2em] mb-1">Sci Library</span>
          <h3 className="text-sm font-bold text-gray-800 tracking-tight mb-4">Remove this book?</h3>
        </div>
        <div className="w-full px-2 mb-6">
          <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 w-full flex justify-center">
            <p className="text-[11px] text-gray-500 italic line-clamp-2 text-center leading-relaxed italic">"{title}"</p>
          </div>
        </div>
        <div className="flex gap-2 w-full justify-center">
          <button onClick={closeToast} className="flex-1 py-3 bg-gray-100 text-gray-500 text-[10px] font-black tracking-widest rounded-xl hover:bg-gray-200 transition-all uppercase">Cancel</button>
          <button 
            onClick={async () => {
              try {
                await dispatch(deleteBook(id)).unwrap();
                toast.success("Catalog Updated", { icon: <BookOpen size={14}/> });
                closeToast();
              } catch (err) {
                toast.error(err || "Delete Failed");
              }
            }} 
            className="flex-1 py-3 bg-red-600 text-white text-[10px] font-black tracking-widest rounded-xl shadow-lg shadow-red-100 hover:bg-red-700 transition-all uppercase"
          >
            Delete
          </button>
        </div>
      </div>
    );

    toast.info(<DeleteMsg />, {
      position: "top-center",
      autoClose: false,
      closeOnClick: false,
      draggable: true,
      icon: false,
      className: "!bg-white rounded-[2rem] shadow-2xl p-6 border border-gray-50 min-w-[300px] !flex !justify-center !items-center",
      bodyClassName: "!p-0 !m-0 !w-full !flex !justify-center !items-center",
    });
  };

 const filteredBooks = Array.isArray(books) 
  ? books.filter((book) =>
      book.title.toLowerCase().includes(searchedKeyword.toLowerCase()) ||
      book.author.toLowerCase().includes(searchedKeyword.toLowerCase())
    )
  : [];

  return (
    <main className="p-4 md:p-8 bg-[#f8fafc] min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <header className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
          <div className="text-center md:text-left">
            <h2 className="text-3xl font-black text-gray-900 flex items-center gap-3">
              <div className="p-2 bg-[#358a74] rounded-xl text-white"><BookOpen size={28} /></div>
              Book Management
            </h2>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="text" 
                placeholder="Search By Title or Author" 
                className="pl-10 pr-4 py-3 border border-gray-200 rounded-2xl w-full sm:w-80 outline-none focus:border-[#358a74] transition-all bg-white"
                onChange={(e) => setSearchedKeyword(e.target.value)}
              />
            </div>
            <button onClick={() => dispatch(toggleAddBookPopup())} className="bg-[#358a74] text-white px-7 py-3 rounded-2xl flex items-center justify-center gap-2 hover:bg-[#2c7360] font-bold shadow-xl shadow-[#358a74]/20 active:scale-95 transition-all">
              <Plus size={22} /> Add New Book
            </button>
          </div>
        </header>

        {/* Table */}
        <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr className="text-gray-400 text-[10px] uppercase tracking-widest font-black">
                  <th className="px-8 py-5 text-center">Cover</th>
                  <th className="px-6 py-5">Book Details</th>
                  <th className="px-6 py-5">Category</th>
                  <th className="px-6 py-5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr></tr>
                ) : filteredBooks.map((book) => (
                  <tr key={book._id} className="hover:bg-gray-50 transition-all group">
                    <td className="px-8 py-5">
                      <div className="w-14 h-20 mx-auto rounded-xl overflow-hidden shadow-md border-2 border-white group-hover:scale-105 transition-transform">
                        {book.image ? <img src={book.image} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-300"><ImageIcon size={20}/></div>}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="font-bold text-gray-800 text-lg group-hover:text-[#358a74] transition-colors">{book.title}</div>
                      <div className="text-xs text-gray-400 font-bold uppercase mt-1">By {book.author}</div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="bg-[#358a74]/10 text-[#358a74] px-4 py-1.5 rounded-full text-[10px] font-black">{book.genre}</span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex justify-center gap-2">
                        <button className="p-3 text-blue-500 hover:bg-blue-50 rounded-2xl transition-all active:scale-90"><Edit3 size={20}/></button>
                        <button onClick={() => confirmDelete(book._id, book.title)} className="p-3 text-red-500 hover:bg-red-50 rounded-2xl transition-all active:scale-90"><Trash2 size={20}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
};

export default BookManagement;