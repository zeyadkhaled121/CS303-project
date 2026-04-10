import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { FaBook, FaSearch, FaBell, FaExclamationTriangle, FaBan } from "react-icons/fa";
import { fetchAllBooks, resetBookSlice } from "../store/slices/bookSlice";
import { toast } from "react-toastify";
import BookCard from "./BookCard";
import { collection, query, where, onSnapshot, doc } from "firebase/firestore";
import { db } from "../utils/firebase";

const UserDashboard = ({ searchTerm = "" }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { books, loading, error, message } = useSelector((state) => state.book);

  const [liveUser, setLiveUser] = useState(null);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!user?.id) return;
    
    // Listen to current user document
    const userUnsub = onSnapshot(doc(db, "users", user.id), (docSnap) => {
      if (docSnap.exists()) {
        setLiveUser(docSnap.data());
      }
    });

    // Listen to notifications
    const q = query(collection(db, "notifications"), where("userId", "==", user.id));
    const notifUnsub = onSnapshot(q, (snapshot) => {
      const notifs = [];
      snapshot.forEach((doc) => notifs.push({ id: doc.id, ...doc.data() }));
      notifs.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
      setNotifications(notifs);
    });

    return () => {
      userUnsub();
      notifUnsub();
    };
  }, [user?.id]);

  useEffect(() => {
    dispatch(fetchAllBooks());
  }, [dispatch]);

  useEffect(() => {
    if (error) { toast.error(error); dispatch(resetBookSlice()); }
    if (message) { toast.success(message); dispatch(resetBookSlice()); }
  }, [error, message, dispatch]);

  const filteredBooks = books.filter(
    (book) =>
      book.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.genre?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full space-y-10 animate-fadeIn p-2">
      {/* Banners */}
      {liveUser?.isBanned && (
        <div className="bg-red-50 text-red-700 p-4 rounded-2xl flex items-center gap-3 border border-red-200">
          <FaBan className="text-xl shrink-0" />
          <p className="font-bold">Your account has been banned. You can no longer borrow books. Please contact an administrator.</p>
        </div>
      )}
      {!liveUser?.isBanned && liveUser?.isFineRestricted && (
        <div className="bg-yellow-50 text-yellow-800 p-4 rounded-2xl flex items-center gap-3 border border-yellow-200">
          <FaExclamationTriangle className="text-xl shrink-0" />
          <p className="font-bold">Your account is restricted due to unpaid fines (${liveUser.fineBalance || 0}). Please pay your fines to resume borrowing.</p>
        </div>
      )}

      {/* Notifications Panel */}
      {notifications.length > 0 && (
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <FaBell className="text-gray-400" />
            <h3 className="font-black text-gray-800 uppercase tracking-widest text-xs">Notifications</h3>
          </div>
          <div className="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
            {notifications.map((notif) => (
              <div key={notif.id} className={`p-3 rounded-xl text-sm ${notif.read ? 'bg-gray-50' : 'bg-blue-50 border border-blue-100'}`}>
                <p className="text-gray-700">{notif.message || notif.title}</p>
                <span className="text-xs text-gray-400 block mt-1">{new Date(notif.createdAt?.toMillis() || Date.now()).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Welcome & Stats Summary */}
      <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">
            Hello, {user?.name || "Reader"}! 
          </h2>
          <p className="text-gray-400 font-medium mt-1">Discover your next favorite book today.</p>
        </div>
        <div className="flex gap-6 items-center bg-gray-50 px-8 py-4 rounded-3xl">
           <div className="text-center">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Available</p>
              <p className="text-xl font-black text-[#358a74]">{books.length}</p>
           </div>
           <div className="w-[1px] h-8 bg-gray-200"></div>
           <FaBook className="text-[#358a74] opacity-20" size={30} />
        </div>
      </div>

      {/* Books Grid Section */}
      <section>
        <div className="mb-8 px-4">
          <h3 className="text-xl font-black text-gray-800 uppercase tracking-widest text-xs">Library Collection</h3>
        </div>

        {loading && !books.length ? (
          <div className="flex flex-col items-center py-20 text-gray-300">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#358a74] mb-4"></div>
            <p className="font-bold">Loading library...</p>
          </div>
        ) : filteredBooks.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200">
            <FaSearch size={40} className="mx-auto text-gray-200 mb-4" />
            <p className="text-gray-400 font-bold">{searchTerm ? "No matches found." : "The library is currently empty."}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {filteredBooks.map((book) => (
              <BookCard key={book._id} {...book} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default UserDashboard;