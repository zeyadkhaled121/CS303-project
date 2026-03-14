import React from "react";
import { FaBookOpen, FaPlusCircle, FaCheckCircle, FaExclamationTriangle, FaClock } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { recordBorrowBook } from "../store/slices/borrowSlice";
import { toast } from "react-toastify";
import { ImSpinner2 } from "react-icons/im";

const BookCard = (props) => {
  const { _id, title, author, image, genre, status } = props;
  const dispatch = useDispatch();
  const navigateTo = useNavigate();
  
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { userBorrowedBooks, loading } = useSelector((state) => state.borrow);

  const borrowRecord = userBorrowedBooks?.find((record) => record.book?._id === _id);
  const isPending = borrowRecord?.status === "Pending";
  const isAlreadyBorrowed = borrowRecord && ["Approved", "Borrowed", "Overdue"].includes(borrowRecord.status);
  
  const isAvailable = status === "Available";

  const handleBorrowRequest = (e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.info("Please login to borrow this book.");
      return navigateTo("/login");
    }
    if (!isAvailable) {
      return toast.error("This book is currently out of stock.");
    }
    if (isPending || isAlreadyBorrowed) {
      return toast.warning("You already have an active request for this book.");
    }
    dispatch(recordBorrowBook(_id));
  };

  return (
    <div className="bg-white p-6 rounded-[3rem] shadow-sm border border-slate-50 flex flex-col items-center text-center hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group relative">
      {/* Cover */}
      <div className="w-full h-64 bg-slate-50 rounded-[2.5rem] mb-6 overflow-hidden flex items-center justify-center relative shadow-inner border border-slate-100">
        {image?.url ? (
          <img src={image.url} alt={title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
        ) : (
          <FaBookOpen size={45} className="text-slate-200" />
        )}
        <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-md text-[9px] px-3 py-1.5 rounded-xl font-black text-[#358a74] uppercase tracking-widest shadow-sm">
          {genre}
        </span>
      </div>

      {/* Title & Author */}
      <div className="mb-4 w-full">
        <h3 className="font-black text-slate-800 text-sm mb-1 line-clamp-1  group-hover:text-[#358a74] transition-colors tracking-tight">
          {title}
        </h3>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-70">by {author}</p>
      </div>

      {/* Status Badge */}
      <div className="w-full mb-6">
        <div className={`inline-flex items-center gap-2 px-5 py-2 rounded-full border transition-all duration-500 ${
          isPending ? "bg-amber-50 border-amber-100 text-amber-600" :
          isAvailable ? "bg-emerald-50 border-emerald-100 text-emerald-600" : 
          "bg-rose-50 border-rose-100 text-rose-500"
        }`}>
          <div className={`w-1.5 h-1.5 rounded-full ${isPending || isAvailable ? "animate-pulse" : ""} ${
            isPending ? "bg-amber-500" : isAvailable ? "bg-emerald-500" : "bg-rose-500"
          }`} />
          <span className="text-[9px] font-black uppercase tracking-[0.2em]">
            {isPending ? "Pending Approval" : isAvailable ? "Available" : "Borrowed"}
          </span>
        </div>
      </div>

      {/* Action Button */}
      <button
        onClick={handleBorrowRequest}
        disabled={loading || (!isAvailable && !isPending) || isAlreadyBorrowed}
        className={`w-full py-4 rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.25em] transition-all flex items-center justify-center gap-3 shadow-lg active:scale-95
          ${isPending ? "bg-amber-100 text-amber-600 cursor-default" : 
            !isAvailable ? "bg-slate-50 text-slate-300 shadow-none cursor-not-allowed" : 
            "bg-[#358a74] text-white hover:bg-slate-900 shadow-emerald-900/10"}`}
      >
        {loading ? <ImSpinner2 className="animate-spin" size={16} /> : 
         isPending ? <><FaClock size={12} /> Pending</> : 
         !isAvailable ? <><FaExclamationTriangle size={12} /> Out of Stock</> : 
         <>Borrow Asset <FaPlusCircle size={14} /></>}
      </button>
    </div>
  );
};

export default BookCard;