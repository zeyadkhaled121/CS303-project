import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Clock, Book as BookIcon, AlertCircle, Plus, Search } from "lucide-react"; 
import { FaHandHolding } from "react-icons/fa";
import { fetchAllBooks } from '../store/slices/bookSlice';
import { fetchAllBorrowedBooks, resetBorrowSliceAction } from '../store/slices/borrowSlice';
import { toast } from 'react-toastify';
import ReturnBookPopup from "../popups/ReturnBookPopup";
import RecordBookPopup from "../popups/RecordBookPopup";

const BookManagement = () => {
  const dispatch = useDispatch();
  
  const { books } = useSelector((state) => state.book);
  const { allBorrowedBooks, message, error } = useSelector((state) => state.borrow);

  const [selectedLoan, setSelectedLoan] = useState(null);
  const [showReturnPopup, setShowReturnPopup] = useState(false);
  const [showRecordPopup, setShowRecordPopup] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const activeLoans = allBorrowedBooks.filter(loan => !loan.returned);
  
  const filteredLoans = activeLoans.filter(loan => 
    loan.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    loan.bookId?.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    dispatch(fetchAllBooks());
    dispatch(fetchAllBorrowedBooks());
  }, [dispatch]);

  useEffect(() => {
    if (error) { 
      toast.error(error); 
      dispatch(resetBorrowSliceAction()); 
    }
    if (message) {
      toast.success(message);
      setShowReturnPopup(false);
      setShowRecordPopup(false);
      dispatch(resetBorrowSliceAction());
      dispatch(fetchAllBorrowedBooks());
      dispatch(fetchAllBooks());
    }
  }, [error, message, dispatch]);

  return (
    <div className="space-y-8 p-6 bg-gray-50/50 min-h-screen pt-24">
      
      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 gap-4">
        <h2 className="text-2xl font-black text-gray-800 flex items-center gap-3">
          <div className="p-2 bg-[#358a74] rounded-xl text-white shadow-lg shadow-emerald-900/20">
            <FaHandHolding size={20} />
          </div>
          Loan Management
        </h2>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-grow">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
            <input 
              type="text"
              placeholder="Search loans..."
              className="bg-gray-50 border-none rounded-2xl py-3 pl-12 pr-4 text-xs font-bold w-full md:w-64 focus:ring-2 focus:ring-[#358a74]/20 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={() => setShowRecordPopup(true)} 
            className="bg-[#358a74] text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#2d7663] transition-all shadow-lg shadow-emerald-900/10 active:scale-95 whitespace-nowrap"
          >
            <Plus size={14} className="inline mr-1" /> New Record
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[2rem] shadow-sm flex items-center gap-4 border border-gray-50">
          <div className="p-4 bg-amber-50 text-amber-600 rounded-2xl"><Clock size={24} /></div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Loans</p>
            <p className="text-2xl font-black text-gray-800">{activeLoans.length}</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-[2rem] shadow-sm flex items-center gap-4 border border-gray-50">
          <div className="p-4 bg-emerald-50 text-[#358a74] rounded-2xl"><BookIcon size={24} /></div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Books</p>
            <p className="text-2xl font-black text-gray-800">{books.length}</p>
          </div>
        </div>

        <div className="bg-[#358a74] p-6 rounded-[2rem] shadow-lg flex items-center gap-4 text-white">
          <div className="p-4 bg-white/20 rounded-2xl"><AlertCircle size={24} /></div>
          <div>
            <p className="text-[10px] font-black text-emerald-100 uppercase tracking-widest">Overdue Items</p>
            <p className="text-2xl font-black">{activeLoans.filter(l => new Date(l.dueDate) < new Date()).length}</p>
          </div>
        </div>
      </div>

      {/* Records Table */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50/50 text-gray-400 text-[10px] font-black uppercase tracking-widest">
              <tr>
                <th className="px-8 py-5">Borrower & Book</th>
                <th className="px-8 py-5">Due Date</th>
                <th className="px-8 py-5 text-center">Status</th>
                <th className="px-8 py-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredLoans.length > 0 ? (
                filteredLoans.map((loan) => (
                  <tr key={loan._id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-8 py-5">
                      <p className="font-black text-gray-800 text-sm">{loan.userId?.name}</p>
                      <p className="text-[10px] text-[#358a74] font-bold uppercase tracking-tight">{loan.bookId?.title}</p>
                    </td>
                    <td className="px-8 py-5 text-xs font-black text-gray-500">
                      {new Date(loan.dueDate).toLocaleDateString('en-GB')}
                    </td>
                    <td className="px-8 py-5 text-center">
                      <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-tighter shadow-sm ${
                        new Date(loan.dueDate) < new Date() 
                        ? 'bg-red-50 text-red-500' 
                        : 'bg-emerald-50 text-[#358a74]'
                      }`}>
                        {new Date(loan.dueDate) < new Date() ? 'Overdue' : 'On Track'}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button 
                        onClick={() => { setSelectedLoan(loan); setShowReturnPopup(true); }} 
                        className="bg-gray-50 text-gray-700 px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-[#358a74] hover:text-white transition-all active:scale-95 border border-gray-100"
                      >
                        Process Return
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-8 py-20 text-center text-gray-400 font-bold">
                    No active loans found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Popups Integration */}
      {showReturnPopup && <ReturnBookPopup loan={selectedLoan} onClose={() => setShowReturnPopup(false)} />}
      {showRecordPopup && <RecordBookPopup onClose={() => setShowRecordPopup(false)} />}
    </div>
  );
};

export default BookManagement;