import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserBorrowedBooks } from "../store/slices/borrowSlice";
import { 
  BookOpen, 
  RotateCcw, 
  Calendar, 
  AlertCircle, 
  ChevronRight,
  Library
} from "lucide-react";

const MyBorrowedBooks = () => {
  const dispatch = useDispatch();
  const { userBorrowedBooks, loading } = useSelector((state) => state.borrow);

  useEffect(() => {
    dispatch(fetchUserBorrowedBooks());
  }, [dispatch]);

  const getStatusTheme = (record) => {
    if (record.returned) return { 
      label: "Returned", 
      color: "text-emerald-600", 
      bg: "bg-emerald-50", 
      dot: "bg-emerald-500" 
    };
    if (new Date(record.dueDate) < new Date()) return { 
      label: "Overdue", 
      color: "text-rose-600", 
      bg: "bg-rose-50", 
      dot: "bg-rose-500" 
    };
    return { 
      label: "Reading", 
      color: "text-[#358a74]", 
      bg: "bg-[#358a74]/10", 
      dot: "bg-[#358a74]" 
    };
  };

  return (
    <div className="p-6 md:p-12 pt-28 min-h-screen bg-[#f8fafc]">
      
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        
        <div className="md:col-span-2 bg-[#358a74] rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl shadow-emerald-900/20">
          <Library className="absolute right-[-20px] bottom-[-20px] size-64 text-white/10 rotate-12" />
          <div className="relative z-10">
            <h1 className="text-4xl font-black tracking-tighter mb-2">My Digital Shelf</h1>
            <p className="text-emerald-100 font-bold text-sm uppercase tracking-widest opacity-80">
              Manage your personal collection and returns
            </p>
          </div>
        </div>

        {/* Quick Stats Card */}
        <div className="bg-white rounded-[3rem] p-10 border border-emerald-50 flex flex-col justify-center shadow-sm">
          <p className="text-[#358a74] font-black text-[10px] uppercase tracking-[0.3em] mb-4">Reading Progress</p>
          <div className="flex items-end gap-2">
            <span className="text-5xl font-black text-gray-800 leading-none">
              {userBorrowedBooks?.filter(b => !b.returned).length || 0}
            </span>
            <span className="text-gray-400 font-bold mb-1">Books active</span>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full mt-6 overflow-hidden">
            <div className="h-full bg-[#358a74] rounded-full w-2/3 shadow-[0_0_10px_rgba(53,138,116,0.5)]"></div>
          </div>
        </div>
      </div>

      {/* 2. Books List Section */}
      <div className="max-w-7xl mx-auto space-y-4">
        <div className="flex items-center justify-between px-8 mb-6">
          <h2 className="font-black text-gray-800 text-xl tracking-tight flex items-center gap-2">
            <BookOpen size={20} className="text-[#358a74]" /> Borrowing History
          </h2>
        </div>

        {loading ? (
          <div className="text-center py-20 font-black text-[#358a74] tracking-widest animate-pulse">LOADING SHELF...</div>
        ) : (
          userBorrowedBooks?.map((record) => {
            const theme = getStatusTheme(record);
            return (
              <div key={record._id} className="group bg-white hover:bg-[#358a74]/[0.02] border border-gray-100 rounded-[2.5rem] p-4 pr-10 transition-all duration-500 flex flex-col md:flex-row items-center gap-8 shadow-sm hover:shadow-xl hover:shadow-[#358a74]/5">
                
                {/* Book Cover Placeholder / Icon */}
                <div className="w-24 h-32 bg-gray-50 rounded-3xl flex items-center justify-center text-[#358a74] group-hover:scale-105 transition-transform duration-500 shadow-inner">
                   <BookOpen size={32} strokeWidth={1.5} />
                </div>

                {/* Main Content */}
                <div className="flex-grow text-center md:text-left">
                  <div className={`inline-flex items-center gap-2 ${theme.bg} ${theme.color} px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter mb-4`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${theme.dot}`}></span>
                    {theme.label}
                  </div>
                  <h3 className="text-xl font-black text-gray-800 group-hover:text-[#358a74] transition-colors duration-300">
                    {record.bookId?.title}
                  </h3>
                  <p className="text-gray-400 font-bold text-xs mt-1 uppercase">{record.bookId?.author}</p>
                </div>

                {/* Dates & Timeline */}
                <div className="flex gap-10 items-center border-t md:border-t-0 md:border-l border-gray-100 pt-6 md:pt-0 md:pl-10 w-full md:w-auto justify-center">
                  <div className="text-center md:text-left">
                    <p className="text-[9px] font-black text-gray-300 uppercase mb-1">Borrow Date</p>
                    <div className="flex items-center gap-2 font-black text-gray-600 text-xs">
                      <Calendar size={14} className="text-gray-400" />
                      {new Date(record.borrowDate).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="text-center md:text-left">
                    <p className="text-[9px] font-black text-gray-300 uppercase mb-1">Return By</p>
                    <div className={`flex items-center gap-2 font-black text-xs ${new Date(record.dueDate) < new Date() && !record.returned ? 'text-rose-500' : 'text-[#358a74]'}`}>
                      <RotateCcw size={14} />
                      {new Date(record.dueDate).toLocaleDateString()}
                    </div>
                  </div>

                  <button className="hidden lg:flex w-12 h-12 rounded-full border border-gray-100 items-center justify-center text-gray-300 group-hover:text-[#358a74] group-hover:border-[#358a74] transition-all">
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default MyBorrowedBooks;