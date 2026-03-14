import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchAllBooks, deleteBook } from "../store/slices/bookSlice";
import { toggleReadBookPopup, toggleAddBookPopup } from "../store/slices/popUpSlice";
import { FaBook, FaFilter, FaChevronDown, FaUserShield, FaBookOpen, FaTrash, FaEdit } from "react-icons/fa";
import { toast } from "react-toastify";
import ReadBookPopup from "../popups/ReadBookPopup";
import AddBookPopup from "../popups/AddBookPopup";
import BookCard from "./BookCard";

const ExecutiveBtn = ({ icon, color, onClick }) => (
  <button 
    onClick={(e) => { e.stopPropagation(); onClick(); }}
    className={`w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-slate-100 transition-all hover:shadow-md hover:-translate-y-0.5 active:scale-90 ${color}`}
  >
    {React.cloneElement(icon, { size: 12 })}
  </button>
);

const Catalog = ({ searchTerm = "" }) => {
  const dispatch = useDispatch();
  const { books, loading } = useSelector((state) => state.book);
  const { readBookPopup, addBookPopup } = useSelector((state) => state.popup);
  const { user } = useSelector((state) => state.auth);

  const [selectedGenre, setSelectedGenre] = useState("All");
  const [selectedBook, setSelectedBook] = useState(null);
  const [editBook, setEditBook] = useState(null);

  useEffect(() => { dispatch(fetchAllBooks()); }, [dispatch]);

  const isAdmin = user?.role === "Admin" || user?.role === "Super Admin";
  const genres = ["All", ...new Set(books.map((b) => b.genre).filter(Boolean))];

  const filteredBooks = books.filter((book) => {
    const matchesSearch = book.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGenre = selectedGenre === "All" || book.genre === selectedGenre;
    return matchesSearch && matchesGenre;
  });

  const handleDeleteConfirm = (id, title) => {
    toast(({ closeToast }) => (
      <div className="flex flex-col items-center text-center w-full ltr p-2">
        <div className="relative mb-4">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center border border-slate-100 shadow-sm"><FaBookOpen className="text-[#358a74]" size={20} /></div>
          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-rose-50 rounded-full flex items-center justify-center border border-white"><FaTrash className="text-rose-500" size={8} /></div>
        </div>
        <div className="mb-5">
          <h4 className="text-[8px] font-black uppercase tracking-[0.4em] text-slate-300">Sci Library</h4>
          <p className="text-sm font-bold text-[#358a74]">Remove Asset?</p>
          <p className="text-[9px] text-slate-400 mt-1 truncate max-w-[150px]">"{title}"</p>
        </div>
        <div className="flex flex-col w-full gap-2">
          <button onClick={() => { dispatch(deleteBook(id)); closeToast(); }} className="w-full bg-[#358a74] text-white py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg hover:bg-rose-600 transition-all">Confirm</button>
          <button onClick={closeToast} className="w-full bg-white text-slate-400 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest border border-slate-100">Cancel</button>
        </div>
      </div>
    ), { position: "top-center", autoClose: false, closeOnClick: false, className: "!rounded-[2rem] !shadow-2xl !max-w-[260px] !mx-auto border border-slate-50", icon: false, closeButton: false });
  };

  return (
    <div className="space-y-10 p-4 md:p-8">
      {/* Filters */}
      <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-50 flex flex-col md:flex-row justify-between items-center gap-6">
        <h2 className="text-3xl font-black text-slate-800 tracking-tighter flex items-center gap-3">
          <div className="p-3 bg-emerald-50 rounded-xl text-[#358a74]"><FaBook size={24} /></div>
          {isAdmin ? "Assets Management" : "Library Catalog"}
        </h2>
     <div className="relative inline-block">
 <div className="relative inline-block">
  <select 
    value={selectedGenre} 
    onChange={(e) => setSelectedGenre(e.target.value)} 
    className="appearance-none bg-white text-[11px] font-bold uppercase tracking-wider px-10 py-3.5 rounded-xl border border-slate-200 text-slate-700 shadow-sm hover:border-blue-400 hover:shadow-md transition-all duration-300 outline-none cursor-pointer"
  >
    <option value="" disabled className="text-slate-400">Select Genre</option>
    
    {genres.map(g => (
      <option 
        key={g} 
        value={g} 
        className="bg-white text-slate-700 py-2 font-sans capitalize"
      >
        {g}
      </option>
    ))}
  </select>
  
  <div className="absolute inset-y-0 right-3 flex items-center px-2 pointer-events-none text-slate-400">
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
    </svg>
  </div>
</div>
</div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {filteredBooks.map((book) => (
          isAdmin ? (
            <div key={book._id} className="bg-white p-6 rounded-[3rem] shadow-sm border border-slate-50 flex flex-col items-center group relative hover:shadow-xl transition-all">
              <div className="absolute top-6 right-6 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all">
                <ExecutiveBtn icon={<FaEdit />} color="hover:text-emerald-500" onClick={() => { setEditBook(book); dispatch(toggleAddBookPopup()); }} />
                <ExecutiveBtn icon={<FaTrash />} color="hover:text-rose-500" onClick={() => handleDeleteConfirm(book._id, book.title)} />
              </div>
              <div className="w-full h-56 bg-slate-50 rounded-[2rem] mb-4 overflow-hidden shadow-inner">
                {book.image?.url ? <img src={book.image.url} className="w-full h-full object-cover" /> : <FaBookOpen size={40} className="text-slate-100 m-auto h-full" />}
              </div>
              <div className="mb-4 w-full text-center">
                <h3 className="font-black text-slate-800 text-sm ">{book.title}</h3>
                <div className={`mt-2 inline-block px-3 py-1 rounded-full text-[8px] font-black uppercase ${book.status === 'Available' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-500'}`}>
                  {book.status}
                </div>
              </div>
              <button onClick={() => { setSelectedBook(book); dispatch(toggleReadBookPopup()); }} className="w-full py-3 rounded-2xl bg-slate-900 text-white font-black text-[9px] uppercase tracking-widest hover:bg-[#358a74] transition-all">
                <FaUserShield className="inline mr-2" /> View Details
              </button>
            </div>
          ) : (
            <BookCard key={book._id} {...book} />
          )
        ))}
      </div>

      {readBookPopup && selectedBook && <ReadBookPopup book={selectedBook} setEditBook={setEditBook} />}
      {addBookPopup && <AddBookPopup editBook={editBook} />}
    </div>
  );
};

export default Catalog;