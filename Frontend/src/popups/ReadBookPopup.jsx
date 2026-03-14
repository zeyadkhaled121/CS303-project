import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toggleReadBookPopup, toggleAddBookPopup } from "../store/slices/popUpSlice";
import { recordBorrowBook, resetBorrowSliceAction } from "../store/slices/borrowSlice";
import { deleteBook } from "../store/slices/bookSlice"; 
import { FaTimes, FaBook, FaCheckCircle, FaEdit, FaTrashAlt } from "react-icons/fa";
import { toast } from "react-toastify";

const ReadBookPopup = ({ book, setEditBook }) => {
  const dispatch = useDispatch();
  
  const { loading: borrowLoading, message, error } = useSelector((state) => state.borrow || {});
  const { user } = useSelector((state) => state.auth || {});

  if (!book) return null;

  const isAdmin = user?.role === "Admin" || user?.role === "Super Admin";

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(resetBorrowSliceAction());
    }
    if (message) {
      toast.success(message);
      dispatch(resetBorrowSliceAction());
      dispatch(toggleReadBookPopup());
    }
  }, [error, message, dispatch]);

 
  const handleDeleteAction = () => {
    if (window.confirm(`Are you sure you want to delete "${book.title}"?`)) {
      dispatch(deleteBook(book.id || book._id));
      dispatch(toggleReadBookPopup());
    }
  };

 
  const handleEditAction = () => {
    dispatch(toggleReadBookPopup());
    if (setEditBook) {
      setEditBook(book);
    }
    dispatch(toggleAddBookPopup());
  };

  return (
    <div className="fixed inset-0 bg-emerald-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={() => dispatch(toggleReadBookPopup())}>
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md relative overflow-hidden animate-slideUp border border-emerald-100" onClick={(e) => e.stopPropagation()}>
        
        {/* Close Button */}
        <button onClick={() => dispatch(toggleReadBookPopup())} className="absolute top-4 right-4 z-50 p-2 bg-white/80 rounded-full text-emerald-600 hover:text-rose-500 transition-all shadow-sm">
          <FaTimes size={16} />
        </button>

        {/* Book Cover */}
        <div className="w-full h-64 bg-emerald-50/50 relative overflow-hidden">
          {book?.image?.url ? (
            <img src={book.image.url} alt={book.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-emerald-200">
              <FaBook size={60} />
            </div>
          )}
        </div>

        <div className="p-8 space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-black text-gray-900 tracking-tighter">{book?.title}</h2>
            <p className="text-[#358a74] text-[10px] font-black mt-1 uppercase tracking-[0.2em]">{book?.genre}</p>
          </div>

          {/* Logic: Role-Based Buttons */}
          {isAdmin ? (
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={handleEditAction}
                className="flex items-center justify-center gap-2 py-4 bg-[#358a74] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-800 transition-all shadow-lg active:scale-95"
              >
                <FaEdit /> Edit Details
              </button>
              <button 
                onClick={handleDeleteAction}
                className="flex items-center justify-center gap-2 py-4 bg-rose-50 text-rose-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all active:scale-95"
              >
                <FaTrashAlt /> Delete Book
              </button>
            </div>
          ) : (
            <button
              onClick={() => dispatch(recordBorrowBook(book.id || book._id))}
              disabled={borrowLoading || book?.status !== "Available"}
              className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95
                ${book?.status === "Available" ? "bg-[#358a74] text-white hover:bg-emerald-800" : "bg-gray-100 text-gray-300 cursor-not-allowed"}`}
            >
              {borrowLoading ? "Processing..." : <><FaCheckCircle /> Confirm Borrowing</>}
            </button>
          )}

          <div className="flex justify-between items-center text-[10px] font-bold text-gray-400 uppercase tracking-widest border-t border-emerald-50 pt-4">
             <span>{book?.author}</span>
             <span className="w-1 h-1 bg-emerald-200 rounded-full"></span>
             <span>{book?.edition}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReadBookPopup;