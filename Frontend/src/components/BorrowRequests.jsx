import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { 
  FaCheck, 
  FaTimes, 
  FaSearch, 
  FaCalendarDay, 
  FaClock, 
  FaUndoAlt, 
  FaBook 
} from "react-icons/fa";
import { ImSpinner2 } from "react-icons/im";
import { 
  fetchAllBorrowedBooks, 
  approveBorrow, 
  rejectBorrow, 
  returnBook 
} from "../store/slices/borrowSlice";

const BorrowRequests = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { allBorrowedBooks, loading } = useSelector((state) => state.borrow);
  const [filterStatus, setFilterStatus] = useState("All");
  const [localSearch, setLocalSearch] = useState("");
  const [processingId, setProcessingId] = useState(null); 

  useEffect(() => {
    dispatch(fetchAllBorrowedBooks());
  }, [dispatch]);

  const getDueDateStatus = (dueDate) => {
    if (!dueDate) return { text: "N/A", color: "text-slate-300" };
    const today = new Date();
    const target = new Date(dueDate);
    const diffTime = target - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { text: `Overdue by ${Math.abs(diffDays)} days`, color: "text-rose-500 font-black" };
    if (diffDays <= 2) return { text: `Due in ${diffDays} days`, color: "text-amber-500 font-bold" };
    return { text: target.toLocaleDateString(), color: "text-slate-500 font-medium" };
  };

  const filteredData = allBorrowedBooks?.filter((item) => {
    const matchesStatus = filterStatus === "All" || item.status === filterStatus;
    const matchesSearch = item.user?.name?.toLowerCase().includes(localSearch.toLowerCase()) || 
                          item.book?.title?.toLowerCase().includes(localSearch.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleApprove = async (id, userId, bookId) => {
    setProcessingId(id);
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7);
    await dispatch(approveBorrow(userId, bookId, dueDate.toISOString()));
    setProcessingId(null);
  };

  const handleReturn = async (id) => {
    setProcessingId(id);
    await dispatch(returnBook(id));
    setProcessingId(null);
  };

  return (
    <div className="pt-24 pb-12 px-8 min-h-screen bg-slate-50 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase italic">Borrowing Logistics</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1 italic">Monitor assets & approval workflows</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search member or book..." 
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl px-10 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#358a74]/20 w-64 shadow-sm transition-all"
              />
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={12} />
            </div>
            
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-[10px] font-black uppercase text-slate-600 focus:outline-none cursor-pointer shadow-sm tracking-widest"
            >
              <option value="All">All activity</option>
              <option value="Pending">Pending Approval</option>
              <option value="Approved">On Loan</option>
              <option value="Returned">Returned Assets</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-6 text-[9px] font-black uppercase text-slate-400 tracking-[0.2em]">Member</th>
                <th className="px-8 py-6 text-[9px] font-black uppercase text-slate-400 tracking-[0.2em]">Asset Detail</th>
                <th className="px-8 py-6 text-[9px] font-black uppercase text-slate-400 tracking-[0.2em]">Status</th>
                <th className="px-8 py-6 text-[9px] font-black uppercase text-slate-400 tracking-[0.2em] text-center">Timeline</th>
                <th className="px-8 py-6 text-[9px] font-black uppercase text-slate-400 tracking-[0.2em] text-right">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredData?.length > 0 ? (
                filteredData.map((item) => {
                  const deadline = getDueDateStatus(item.dueDate);
                  const isProcessing = processingId === item._id;

                  return (
                    <tr key={item._id} className="hover:bg-slate-50/40 transition-colors group">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-xs border border-slate-800 shadow-lg shadow-slate-200">
                            {item.user?.name?.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-700">{item.user?.name}</p>
                            <p className="text-[9px] text-[#358a74] font-black uppercase tracking-widest">{item.user?.role}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex flex-col gap-1">
                          <span className="text-xs font-bold text-slate-600 italic">"{item.book?.title}"</span>
                          <span className="text-[9px] text-slate-400 flex items-center gap-1 font-bold">
                            <FaClock size={8}/> Applied: {new Date(item.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className={`text-[8px] font-black uppercase px-3 py-1.5 rounded-lg border ${
                          item.status === 'Pending' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                          item.status === 'Approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                          item.status === 'Returned' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                          'bg-slate-50 text-slate-400 border-slate-100'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-center">
                        <div className={`text-[10px] flex items-center justify-center gap-2 ${deadline.color}`}>
                          {(item.status === 'Approved' || item.status === 'Overdue') && <FaCalendarDay size={10} />}
                          {item.status === 'Approved' || item.status === 'Overdue' ? deadline.text : "—"}
                        </div>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex items-center gap-2 justify-end">
                          {isProcessing ? (
                            <ImSpinner2 className="animate-spin text-[#358a74]" size={18} />
                          ) : item.status === "Pending" ? (
                            <>
                              <button 
                                onClick={() => handleApprove(item._id, item.user?._id, item.book?._id)}
                                className="p-2.5 bg-[#358a74] text-white rounded-xl hover:bg-slate-900 transition-all shadow-md active:scale-90"
                              >
                                <FaCheck size={10} />
                              </button>
                              <button 
                                onClick={() => dispatch(rejectBorrow(item._id))}
                                className="p-2.5 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all active:scale-90"
                              >
                                <FaTimes size={10} />
                              </button>
                            </>
                          ) : item.status === "Approved" ? (
                            <button 
                              onClick={() => handleReturn(item._id)}
                              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-slate-900 transition-all shadow-md active:scale-90"
                            >
                              <FaUndoAlt size={10} /> Return Asset
                            </button>
                          ) : (
                            <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest italic">Archived</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="5" className="px-8 py-32 text-center">
                    <div className="flex flex-col items-center gap-3 opacity-20">
                      <FaBook size={40} className="text-slate-400" />
                      <p className="font-black uppercase text-[10px] tracking-[0.5em]">Clear of all requests</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BorrowRequests;