import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { 
  FaCheckCircle, FaTimesCircle, FaEnvelope, 
  FaHistory, FaArrowLeft, FaUserCircle, FaBook 
} from "react-icons/fa";
import { approveBorrow, rejectBorrow, fetchAllBorrowedBooks } from "../store/slices/borrowSlice";
import { toast } from "react-toastify";
import RejectRequestPopup from "../popups/RejectRequestPopup";

const UserProfile = () => {
  const { userId } = useParams(); 
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [rejectPopupOpen, setRejectPopupOpen] = useState(false);

  // Get data from Redux Store
  const { allUsers } = useSelector((state) => state.auth);
  const { allBorrowedBooks, loading } = useSelector((state) => state.borrow);

  // 1. Find user details from the members list
  const userDetails = allUsers?.find((u) => u._id === userId);

  // 2. Find the "Pending" borrow request for this specific user
  const pendingRequest = allBorrowedBooks?.find(
    (b) => b.user?._id === userId && b.status === "Pending"
  );

  // 3. Filter the borrowing history 
  const userHistory = allBorrowedBooks?.filter(
    (b) => b.user?._id === userId && b.status !== "Pending"
  );

  useEffect(() => {
    // Fetch data if the list is empty on page load
    if (allBorrowedBooks.length === 0) {
      dispatch(fetchAllBorrowedBooks());
    }
  }, [dispatch, allBorrowedBooks.length]);

  // Approval Logic
  const handleApprove = () => {
    if (pendingRequest) {
      // Set a default return date 
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 7);
      
      dispatch(approveBorrow(userId, pendingRequest.book._id, dueDate.toISOString()));
      toast.info("Processing Approval...");
      navigate(-1);
    }
  };

  // Rejection Logic
  const handleRejectClick = () => {
    if (pendingRequest) {
      setRejectPopupOpen(true);
    }
  };

  const confirmReject = (reason) => {
    if (pendingRequest) {
      setRejectPopupOpen(false);
      dispatch(rejectBorrow(pendingRequest._id, reason));
      navigate(-1);
    }
  };

  if (!userDetails) {
    return (
      <div className="pt-32 text-center text-slate-400 font-black uppercase tracking-widest">
        User Not Found
      </div>
    );
  }

  return (
    <div className="pt-28 pb-12 px-8 min-h-screen bg-[#f8fafc] font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)} 
          className="mb-8 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#358a74] hover:gap-4 transition-all"
        >
          <FaArrowLeft /> Back to Request Queue
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* User Card (Left Side) */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-100 text-center">
              <div className="w-28 h-28 bg-emerald-50 rounded-[2.2rem] mx-auto mb-6 flex items-center justify-center text-[#358a74] shadow-inner">
                <FaUserCircle size={60} className="opacity-80" />
              </div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">{userDetails.name}</h2>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 mt-2 bg-emerald-50 inline-block px-4 py-1 rounded-full">
                {userDetails.role}
              </p>
              
              <div className="mt-8 pt-8 border-t border-slate-50 space-y-4 text-left">
                <div className="flex items-center gap-3">
                  <FaEnvelope className="text-slate-300" size={14} />
                  <span className="text-xs font-bold text-slate-500">{userDetails.email}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Request Details & Controls (Right Side) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Current Borrow Request */}
            {pendingRequest ? (
              <div className="bg-white rounded-[2.5rem] p-10 shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden">
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-6">
                    <span className="text-[10px] font-black uppercase tracking-widest text-amber-500 bg-amber-50 px-4 py-1.5 rounded-full">Pending Request</span>
                  </div>
                  
                  <h4 className="text-3xl font-light text-slate-800 leading-tight">
                    Wants to borrow <br />
                    <span className="font-serif italic text-[#358a74] font-bold">"{pendingRequest.book?.title}"</span>
                  </h4>
                  
                  <div className="mt-10 flex gap-4">
                    <button 
                      disabled={loading}
                      onClick={handleApprove}
                      className="flex-1 py-4 bg-[#358a74] text-white rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-slate-900 transition-all shadow-lg shadow-emerald-900/10"
                    >
                      <FaCheckCircle size={14} />
                      {loading ? "Processing..." : "Approve Request"}
                    </button>
                    <button 
                      disabled={loading}
                      onClick={handleRejectClick}
                      className="flex-1 py-4 bg-white border border-rose-100 text-rose-500 rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-rose-50 transition-all"
                    >
                      <FaTimesCircle size={14} />
                      Reject Request
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-slate-100/50 border border-dashed border-slate-200 rounded-[2.5rem] p-12 text-center">
                <p className="text-slate-400 font-bold text-sm">No active borrow requests for this user.</p>
              </div>
            )}

            {/* History Log */}
            <div className="bg-white rounded-[2.5rem] p-10 shadow-xl shadow-slate-200/50 border border-slate-100">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400">Borrowing History</h3>
                <FaHistory className="text-slate-200" size={18} />
              </div>
              
              {userHistory?.length > 0 ? (
                <div className="space-y-4">
                  {userHistory.map((item) => (
                    <div key={item._id} className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-white rounded-xl shadow-sm">
                          <FaBook className="text-emerald-600" size={14} />
                        </div>
                        <span className="text-sm font-black text-slate-700">{item.book?.title}</span>
                      </div>
                      <span className={`text-[9px] font-black uppercase px-4 py-1.5 rounded-full ${
                        item.status === 'Approved' ? 'bg-blue-50 text-blue-600' : 'bg-slate-200 text-slate-500'
                      }`}>
                        {item.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-slate-400 text-xs italic">No previous borrowing records.</div>
              )}
            </div>
          </div>

        </div>
      </div>
      <RejectRequestPopup
        isOpen={rejectPopupOpen}
        onClose={() => setRejectPopupOpen(false)}
        onConfirm={confirmReject}
      />
    </div>
  );
};

export default UserProfile;