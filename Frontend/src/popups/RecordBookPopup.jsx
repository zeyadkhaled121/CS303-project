import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { X, BookPlus, User, Calendar, CheckCircle, Info } from "lucide-react"; 
import { fetchAllBooks } from "../store/slices/bookSlice"; 
import { getAllUsers } from "../store/slices/authSlice"; 
import { approveBorrow } from "../store/slices/borrowSlice"; 
import { toast } from "react-toastify"; 

const RecordBookPopup = ({ onClose }) => {
  const dispatch = useDispatch();
  
  // Get data from Redux store
  const { books } = useSelector((state) => state.book);
  const { allUsers } = useSelector((state) => state.auth);
  const { loading } = useSelector((state) => state.borrow);

  // Form state to hold user choice, book choice, and return date
  const [formData, setFormData] = useState({
    userId: "",
    bookId: "",
    dueDate: "",
  });

  // Fetch users and books immediately when the popup opens
  useEffect(() => {
    dispatch(fetchAllBooks());
    dispatch(getAllUsers());
  }, [dispatch]);

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate that all fields are selected
    if (!formData.userId || !formData.bookId || !formData.dueDate) {
      return toast.error("Please fill all fields before confirming");
    }
    
    // Send the borrowing request to the server
    dispatch(approveBorrow(formData.userId, formData.bookId, formData.dueDate)); 
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden animate-slideUp">
        
        {/* Header Section with Theme Color */}
        <div className="relative p-8 bg-[#358a74] text-white">
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-2xl">
              <BookPlus size={28} />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight">Record New Loan</h2>
              <p className="text-emerald-100 text-[10px] font-medium uppercase tracking-widest mt-1">Librarian Management System</p>
            </div>
          </div>
        </div>

        {/* Input Form Section */}
        <form onSubmit={handleSubmit} className="p-10 space-y-6">
          
          {/* User Selection Dropdown */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Select Member</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <select 
                className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-gray-700 focus:ring-2 focus:ring-[#358a74] transition-all appearance-none cursor-pointer"
                value={formData.userId}
                onChange={(e) => setFormData({...formData, userId: e.target.value})}
              >
                <option value="">Choose a member...</option>
                {allUsers && allUsers.length > 0 ? (
                  allUsers.map(u => (
                    <option key={u._id} value={u._id}>{u.name} — {u.email}</option>
                  ))
                ) : (
                  <option disabled>Loading members...</option>
                )}
              </select>
            </div>
          </div>

          {/* Book Selection Dropdown (Only shows available books) */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Select Book</label>
            <div className="relative">
              <BookPlus className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <select 
                className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-gray-700 focus:ring-2 focus:ring-[#358a74] transition-all appearance-none cursor-pointer"
                value={formData.bookId}
                onChange={(e) => setFormData({...formData, bookId: e.target.value})}
              >
                <option value="">Choose a book...</option>
                {books?.filter(b => b.stock > 0).map(b => (
                  <option key={b._id} value={b._id}>{b.title} (Stock: {b.stock})</option>
                ))}
              </select>
            </div>
          </div>

          {/* Due Date Input (Prevents past dates) */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Return Date</label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="date"
                min={new Date().toISOString().split('T')[0]} // Sets minimum date to today
                className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-gray-700 focus:ring-2 focus:ring-[#358a74] transition-all"
                value={formData.dueDate}
                onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
              />
            </div>
          </div>

          {/* Operational Info Message */}
          <div className="bg-amber-50 rounded-2xl p-4 flex gap-3 items-start border border-amber-100">
             <Info className="text-amber-500 shrink-0" size={18} />
             <p className="text-[11px] text-amber-700 leading-relaxed font-medium">
               Recording a loan will automatically decrease the book stock by 1. Please ensure the member is verified.
             </p>
          </div>

          {/* Confirmation Button */}
          <button 
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-[#358a74] text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] shadow-lg shadow-emerald-900/20 hover:bg-[#2d7562] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-3 disabled:opacity-50 active:scale-95"
          >
            {loading ? "Registering..." : <>Confirm & Record <CheckCircle size={18} /></>}
          </button>

        </form>
      </div>
    </div>
  );
};

export default RecordBookPopup;