import React, { useEffect, useState, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { 
  FaPlus, FaTrash, FaEdit, FaEye, FaLayerGroup, 
  FaShieldAlt, FaBookOpen, FaInbox, FaMoneyBillWave, FaBan 
} from "react-icons/fa";
import { fetchAllBooks, deleteBook, resetBookSlice } from "../store/slices/bookSlice";
import { toggleAddBookPopup, toggleReadBookPopup } from "../store/slices/popUpSlice";
import { toast } from "react-toastify";
import AddBookPopup from "../popups/AddBookPopup";
import ReadBookPopup from "../popups/ReadBookPopup";
import api from "../api/axios";

const AdminDashboard = ({ searchTerm = "" }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { books, loading, error, message } = useSelector((state) => state.book);
  const { addBookPopup, readBookPopup } = useSelector((state) => state.popup);

  const [selectedBook, setSelectedBook] = useState(null);
  const [editBook, setEditBook] = useState(null);

  const [unpaidFines, setUnpaidFines] = useState([]);
  const [bannedUsers, setBannedUsers] = useState([]);

  const fetchFines = async () => {
    try {
      const res = await api.get("/api/admin/fines?status=unpaid");
      setUnpaidFines(res.data.fines || []);
    } catch (err) {
      console.error("Failed to fetch unpaid fines", err);
    }
  };

  const fetchBannedUsers = async () => {
    try {
      const res = await api.get("/api/admin/banned-users");
      setBannedUsers(res.data.users || []);
    } catch (err) {
      console.error("Failed to fetch banned users", err);
    }
  };

  useEffect(() => {
    fetchFines();
    fetchBannedUsers();
  }, []);

  useEffect(() => {
    dispatch(fetchAllBooks());
  }, [dispatch]);

  // Handle Notifications & State Reset
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(resetBookSlice());
    }
    if (message) {
      toast.success(message);
      dispatch(resetBookSlice());
      dispatch(fetchAllBooks());
    }
  }, [error, message, dispatch]);

  const filteredBooks = useMemo(() => {
    return books.filter((b) => 
      b.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.author?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.genre?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [books, searchTerm]);
  const handleConfirmPayment = async (fineId) => {
    try {
      await api.patch(`/api/admin/fines/${fineId}/confirm-payment`);
      toast.success("Payment confirmed!");
      fetchFines();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Failed to confirm payment");
    }
  };

  const handleUnbanUser = async (userId) => {
    try {
      await api.patch(`/api/admin/users/${userId}/unban`);
      toast.success("User unbanned successfully");
      fetchBannedUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Failed to unban user");
    }
  };
 const handleDeleteConfirm = (id, title) => {
  toast(
    ({ closeToast }) => (
      <div className="flex flex-col items-center text-center w-full ltr">
        
        <div className="relative mb-4">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center border border-slate-100 shadow-sm transition-transform hover:rotate-12">
            <FaBookOpen className="text-[#358a74]" size={20} />
          </div>
          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-rose-50 rounded-full flex items-center justify-center border border-white">
            <FaTrash className="text-rose-500" size={8} />
          </div>
        </div>

        {/* Content Section */}
        <div className="space-y-1 mb-5">
          <h4 className="text-[8px] font-black uppercase tracking-[0.4em] text-slate-300">Sci Library</h4>
          <p className="text-sm font-bold text-[#358a74] tracking-tight">Remove Book ?</p>
          <div className="px-2 py-1 bg-slate-50 rounded-lg mt-2 inline-block">
             <p className="text-[10px] font-black text-slate-500  truncate max-w-[160px]">
               "{title}"
             </p>
          </div>
        </div>

        <div className="flex flex-col w-full gap-2">
          <button
            onClick={() => {
              dispatch(deleteBook(id));
              closeToast();
            }}
            className="w-full bg-[#358a74] text-white py-2.5 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] shadow-lg shadow-slate-200 hover:bg-rose-600 transition-all active:scale-95"
          >
            Confirm
          </button>
          <button
            onClick={closeToast}
            className="w-full bg-white text-slate-400 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] border border-slate-100 hover:bg-slate-50 transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    ),
    {
      position: "top-center",
      autoClose: false,
      closeOnClick: false,
      draggable: false,
      className: "ltr !bg-white !rounded-[2.5rem] !p-7 !shadow-[0_20px_50px_rgba(0,0,0,0.1)] !max-w-[270px] !mx-auto !min-h-[auto] border border-slate-50",
      bodyClassName: "!p-0 !m-0 !flex !justify-center",
      icon: false,
      closeButton: false,
    }
  );
};

  return (
    <div className="max-w-[1600px] mx-auto p-4 lg:p-8 space-y-8 animate-fadeIn text-slate-800">
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Profile & Action Card */}
        <div className="lg:col-span-8 bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full -mr-20 -mt-20 blur-3xl transition-all group-hover:bg-emerald-100" />
          
          <div className="relative z-10 space-y-4 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-full border border-emerald-100/50">
              <FaShieldAlt className="text-[#358a74] text-[10px]" />
              <span className="text-[10px] font-black uppercase tracking-widest text-[#358a74]">Security Verified</span>
            </div>
            <h1 className="text-4xl font-light leading-tight">
              Welcome, <span className="font-black text-slate-900">{user?.name?.split(' ')[0]}</span>
              <p className="text-sm font-medium text-slate-400 mt-2 ">You have full control over the library catalog.</p>
            </h1>
          </div>

          <button 
            onClick={() => { setEditBook(null); dispatch(toggleAddBookPopup()); }}
            className="relative z-10 mt-6 md:mt-0 bg-[#358a74] text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-emerald-200/50 hover:bg-slate-900 hover:shadow-slate-200 transition-all active:scale-95 flex items-center gap-3"
          >
            <FaPlus className="text-xs" /> <span>Add New Book</span>
          </button>
        </div>

        {/* Quick Stats Bento */}
        <div className="lg:col-span-4 grid grid-cols-2 gap-4">
          <div className="bg-slate-900 rounded-[2rem] p-6 text-white flex flex-col justify-between group hover:ring-4 ring-slate-100 transition-all">
            <FaLayerGroup className="text-emerald-400 text-xl group-hover:scale-110 transition-transform" />
            <div>
              <p className="text-4xl font-black  tracking-tighter">{books.length}</p>
              <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Total Catalog</p>
            </div>
          </div>
          <div className="bg-white border border-slate-100 rounded-[2rem] p-6 flex flex-col justify-between shadow-sm group hover:border-[#358a74] transition-all">
            <FaBookOpen className="text-[#358a74] text-xl group-hover:rotate-12 transition-transform" />
            <div>
              <p className="text-4xl font-black text-slate-900 tracking-tighter">
                {books.reduce((acc, book) => acc + (book.availableCopies || 0), 0)}
              </p>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">In Stock</p>
            </div>
          </div>
        </div>
      </div>

      {/* --- BANNED USERS & UNPAID FINES --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Unpaid Fines Table */}
        <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
            <h2 className="font-black text-[10px] uppercase tracking-[0.3em] text-slate-400 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-yellow-400" /> Unpaid Fines
            </h2>
            <div className="text-[10px] font-bold text-slate-400 bg-white px-3 py-1 rounded-full border border-slate-100">
              {unpaidFines.length} Fines
            </div>
          </div>
          <div className="overflow-x-auto p-4 custom-scrollbar max-h-80 overflow-y-auto">
            <table className="w-full text-left border-separate border-spacing-y-2">
              <thead>
                <tr className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    <th className="px-4 py-2">User Details</th>
                  <th className="px-4 py-2">Amount</th>
                  <th className="px-4 py-2 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {unpaidFines.length === 0 ? (
                  <tr><td colSpan="3" className="text-center py-8 text-slate-400 text-xs font-bold">No unpaid fines</td></tr>
                ) : (
                  unpaidFines.map((fine) => (
                    <tr key={fine.id} className="bg-slate-50 rounded-xl hover:bg-slate-100 transition-all">
                      <td className="px-4 py-3 rounded-l-xl text-xs font-bold text-slate-700">
                          {fine.userName || "Unknown"}
                          <div className="text-[9px] text-slate-400 font-normal">{fine.userEmail}</div>
                      </td>
                      <td className="px-4 py-3 text-xs font-black text-red-500">${fine.amount || fine.fineAmount || 0}</td>
                      <td className="px-4 py-3 rounded-r-xl text-center">
                        <button 
                          onClick={() => handleConfirmPayment(fine.id)}
                          className="bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider hover:bg-emerald-600 transition-colors"
                        >
                          Confirm
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Banned Users Table */}
        <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
            <h2 className="font-black text-[10px] uppercase tracking-[0.3em] text-slate-400 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500" /> Banned Users
            </h2>
            <div className="text-[10px] font-bold text-slate-400 bg-white px-3 py-1 rounded-full border border-slate-100">
              {bannedUsers.length} Users
            </div>
          </div>
          <div className="overflow-x-auto p-4 custom-scrollbar max-h-80 overflow-y-auto">
            <table className="w-full text-left border-separate border-spacing-y-2">
              <thead>
                <tr className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                  <th className="px-4 py-2">User Details</th>
                  <th className="px-4 py-2">Offenses</th>
                  <th className="px-4 py-2 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {bannedUsers.length === 0 ? (
                  <tr><td colSpan="3" className="text-center py-8 text-slate-400 text-xs font-bold">No banned users</td></tr>
                ) : (
                  bannedUsers.map((bUser) => (
                    <tr key={bUser.id} className="bg-slate-50 rounded-xl hover:bg-slate-100 transition-all">
                      <td className="px-4 py-3 rounded-l-xl text-xs font-bold text-slate-700">
                        {bUser.name || "Unknown"}
                        <div className="text-[9px] text-slate-400 font-normal">{bUser.email}</div>
                      </td>
                      <td className="px-4 py-3 text-xs font-black text-red-500">{bUser.offenseCount || 0}</td>
                      <td className="px-4 py-3 rounded-r-xl text-center">
                        <button 
                          onClick={() => handleUnbanUser(bUser.id)}
                          className="bg-blue-500 text-white px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider hover:bg-blue-600 transition-colors"
                        >
                          Unban
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* --- INNOVATIVE ASSET LIST --- */}
      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/20 overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
          <h2 className="font-black text-[10px] uppercase tracking-[0.3em] text-slate-400 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[#358a74]" /> Live Database
          </h2>
          <div className="text-[10px] font-bold text-slate-400 bg-white px-3 py-1 rounded-full border border-slate-100">
            Showing {filteredBooks.length} Books
          </div>
        </div>

        <div className="overflow-x-auto px-4 pb-8">
          <table className="w-full border-separate border-spacing-y-3">
            <thead>
              <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <th className="px-6 py-4 text-left">Asset Details</th>
                <th className="px-6 py-4 text-left">Category</th>
                <th className="px-6 py-4 text-left">Availability</th>
                <th className="px-6 py-4 text-center">Control</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="4" className="text-center py-20 text-slate-300 animate-pulse font-bold tracking-widest">Synchronizing Data...</td></tr>
              ) : filteredBooks.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-20">
                    <FaInbox className="mx-auto text-slate-100 text-6xl mb-4" />
                    <p className="font-black text-slate-300 uppercase tracking-widest">No Matches Found</p>
                  </td>
                </tr>
              ) : (
                filteredBooks.map((book) => (
                  <tr key={book.id} className="group hover:bg-slate-50/80 transition-all">
                    <td className="px-6 py-4 bg-white group-hover:bg-slate-50/80 rounded-l-[2rem] transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-16 rounded-xl bg-slate-100 overflow-hidden shadow-sm group-hover:shadow-md transition-all duration-500">
                          <img 
                            src={book.image?.url } 
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                            alt={book.title}
                          />
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-900 leading-none">{book.title}</p>
                          <p className="text-[10px] font-bold text-[#358a74] uppercase tracking-tighter mt-1">{book.author}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 bg-white group-hover:bg-slate-50/80 transition-all">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-600 ">#{book.genre}</span>
                        <span className="text-[9px] text-slate-300 font-black tracking-widest uppercase mt-0.5">
                          {book.edition || '1st'} Edition
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 bg-white group-hover:bg-slate-50/80 transition-all">
                      <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all ${
                        book.availableCopies > 0
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                        : 'bg-amber-50 text-amber-600 border-amber-100'
                      }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${book.availableCopies > 0 ? 'bg-emerald-500' : 'bg-amber-500'} animate-pulse`} />
                        {book.availableCopies > 0 ? `${book.availableCopies}/${book.totalCopies} AVAILABLE` : 'BORROWED'}
                      </div>
                    </td>
                    <td className="px-6 py-4 bg-white group-hover:bg-slate-50/80 rounded-r-[2rem] transition-all">
                      <div className="flex items-center justify-center gap-2">
                        <ExecutiveBtn 
                          icon={<FaEye />} 
                          color="hover:text-blue-500 hover:bg-blue-50" 
                          onClick={() => { setSelectedBook(book); dispatch(toggleReadBookPopup()); }} 
                        />
                        <ExecutiveBtn
                          icon={<FaEdit />}
                          color="hover:text-emerald-500 hover:bg-emerald-50"
                          onClick={() => { 
                            if (book.availableCopies !== book.totalCopies) {
                                toast.error("Cannot edit a book while copies are currently borrowed.");
                                return;
                            }
                            setEditBook(book); 
                            dispatch(toggleAddBookPopup()); 
                          }}
                        />
                        <ExecutiveBtn 
                          icon={<FaTrash />} 
                          color="hover:text-rose-500 hover:bg-rose-50" 
                          onClick={() => handleDeleteConfirm(book.id, book.title)} 
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {addBookPopup && <AddBookPopup editBook={editBook} />}
      {readBookPopup && selectedBook && <ReadBookPopup book={selectedBook} />}
    </div>
  );
};

const ExecutiveBtn = ({ icon, color, onClick }) => (
  <button 
    onClick={onClick}
    className={`w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-slate-100 transition-all hover:shadow-md hover:-translate-y-0.5 active:scale-90 ${color}`}
  >
    {React.cloneElement(icon, { size: 12 })}
  </button>
);

export default AdminDashboard;