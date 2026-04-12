

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserBorrowedBooks, cancelBorrow } from "../store/slices/borrowSlice";
import {
  BookOpen,
  RotateCcw,
  Calendar,
  ChevronRight,
  Library,
} from "lucide-react";
import { ImSpinner2 } from "react-icons/im";
import {
  isBorrowPending,
  isBorrowBorrowedOrOverdue,
  isBorrowReturned,
  isBorrowActive,
} from "../utils/dataShapeNormalizer";
import { notifyError } from "../utils/toastNotificationManager";
import { EmptyState, TableLoadingRow } from "./UITemplates";

const MyBorrowedBooksV2 = ({ searchTerm = "" }) => {
  const dispatch = useDispatch();
  const { userBorrowedBooks, loading } = useSelector(
    (state) => state.borrow
  );
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    dispatch(fetchUserBorrowedBooks());
  }, [dispatch]);

  // Handler for cancel button
  const handleCancel = async (record) => {
    if (!record._id && !record.id) {
      notifyError("Invalid borrow record ID");
      return;
    }

    if (!window.confirm("Are you sure you want to cancel this borrow request?")) {
      return;
    }

    setProcessingId(record._id || record.id);
    try {
      await dispatch(cancelBorrow(record._id || record.id));
    } catch (err) {
      console.error("Cancel error:", err);
      notifyError("Failed to cancel request");
    } finally {
      setProcessingId(null);
    }
  };

  // Safe extraction of book title from multi-format payload
  const getBookTitle = (record) => {
    return (
      record?.book?.title ||
      record?.bookId?.title ||
      record?.book_title || record?.bookTitle ||
      "Unknown Title"
    );
  };

  // Safe extraction of book author
  const getBookAuthor = (record) => {
    return (
      record?.book?.author ||
      record?.bookId?.author ||
      record?.book_author || record?.bookAuthor ||
      "Unknown Author"
    );
  };

  // Safe extraction of book image
  const getBookImage = (record) => {
    return (
      record?.bookImage?.url || 
      record?.bookImage || 
      record?.book?.image?.url ||
      record?.bookId?.image?.url ||
      null
    );
  };

  // Safe extraction of dates
  const getBorrowDate = (record) => {
    const date = record?.borrowDate || record?.requestDate || record?.createdAt;
    if (date && date._seconds) {
      return new Date(date._seconds * 1000).toLocaleString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }).replace(/,/g, '');
    }
    return date ? new Date(date).toLocaleString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }).replace(/,/g, '') : "N/A";
  };

  const getDueDate = (record) => {
    if (isBorrowPending(record)) return "Awaiting Approval";
    const date = record?.dueDate || record?.due_date;
    if (date && date._seconds) {
      return new Date(date._seconds * 1000).toLocaleString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }).replace(/,/g, '');
    }
    return date ? new Date(date).toLocaleString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }).replace(/,/g, '') : "Not Set";
  };

  // Comprehensive status detection
  const getStatusTheme = (record) => {
    if (isBorrowReturned(record)) {
      return {
        label: "Returned",
        color: "text-emerald-600",
        bg: "bg-emerald-50",
        dot: "bg-emerald-500",
      };
    }

    const dueDate = new Date(record?.dueDate || record?.due_date);
    const now = new Date();

    if (isBorrowPending(record)) {
      return {
        label: "Pending Approval",
        color: "text-amber-600",
        bg: "bg-amber-50",
        dot: "bg-amber-500",
      };
    }

    if (record?.status === "Rejected") {
      return {
        label: "Rejected",
        color: "text-rose-700",
        bg: "bg-rose-100",
        dot: "bg-rose-600",
      };
    }

    if (record?.status === "Cancelled") {
      return {
        label: "Cancelled",
        color: "text-gray-500",
        bg: "bg-gray-100",
        dot: "bg-gray-400",
      };
    }

    if (dueDate < now && isBorrowActive(record)) {
      return {
        label: "Overdue",
        color: "text-rose-600",
        bg: "bg-rose-50",
        dot: "bg-rose-500",
      };
    }

    if (isBorrowBorrowedOrOverdue(record) || isBorrowActive(record)) {
      return {
        label: "Reading",
        color: "text-[#358a74]",
        bg: "bg-[#358a74]/10",
        dot: "bg-[#358a74]",
      };
    }

    return {
      label: "Unknown",
      color: "text-gray-600",
      bg: "bg-gray-50",
      dot: "bg-gray-500",
    };
  };

  // Count active books
  const activeCount = Array.isArray(userBorrowedBooks)
    ? userBorrowedBooks.filter(
        (b) => isBorrowActive(b) && !isBorrowReturned(b)
      ).length
    : 0;

  // Filter books based on search term
  const filteredBorrowedBooks = Array.isArray(userBorrowedBooks)
    ? userBorrowedBooks.filter((record) => {
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();
        const title = getBookTitle(record).toLowerCase();
        const author = getBookAuthor(record).toLowerCase();
        return title.includes(term) || author.includes(term);
      })
    : [];

  // Handle loading state
  if (loading) {
    return (
      <div className="p-6 md:p-12 pt-28 min-h-screen bg-[#f8fafc]">
        <div className="max-w-7xl mx-auto">
          {/* Header Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="md:col-span-2 bg-slate-200 rounded-[3rem] p-10 h-40 animate-pulse" />
            <div className="bg-slate-100 rounded-[3rem] p-10 h-40 animate-pulse" />
          </div>

          {/* List Skeleton */}
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <TableLoadingRow key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Handle empty state
  if (!userBorrowedBooks || userBorrowedBooks.length === 0) {
    return (
      <div className="p-6 md:p-12 pt-28 min-h-screen bg-[#f8fafc]">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="md:col-span-2 bg-[#358a74] rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl shadow-emerald-900/20">
              <Library className="absolute right-[-20px] bottom-[-20px] size-64 text-white/10 rotate-12" />
              <div className="relative z-10">
                <h1 className="text-4xl font-black tracking-tighter mb-2">
                  My Digital Shelf
                </h1>
                <p className="text-emerald-100 font-bold text-m uppercase tracking-widest opacity-40">
                  Manage your personal collection and returns
                </p>
              </div>
            </div>

            {/* Stats Card */}
            <div className="bg-white rounded-[3rem] p-10 border border-emerald-50 flex flex-col justify-center shadow-sm">
              <p className="text-[#358a74] font-black text-[15px] uppercase tracking-[0.1em] mb-4">
                Reading Progress
              </p>
              <div className="flex items-end gap-2">
                <span className="text-5xl font-black text-gray-800 leading-none">
                  {activeCount}
                </span>
                <span className="text-gray-400 font-bold mb-1">Books active</span>
              </div>
            </div>
          </div>

          {/* Empty State */}
          <div className="max-w-7xl mx-auto">
            <EmptyState
              icon={<BookOpen size={48} className="text-slate-300" />}
              title="Your Shelf is Empty"
              description="You haven't borrowed any books yet. Visit the catalog to find your next great read!"
              actionLabel="Browse Catalog"
              actionHref="/catalog"
            />
          </div>
        </div>
      </div>
    );
  }

  // Render borrowed books list
  return (
    <div className="p-6 md:p-12 pt-28 min-h-screen bg-[#f8fafc]">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="md:col-span-2 bg-[#358a74] rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl shadow-emerald-900/20">
          <Library className="absolute right-[-20px] bottom-[-20px] size-64 text-white/10 rotate-12" />
          <div className="relative z-10">
            <h1 className="text-4xl font-black tracking-tighter mb-2">
              My Digital Shelf
            </h1>
            <p className="text-emerald-100 font-bold text-sm uppercase tracking-widest opacity-80">
              Manage your personal collection and returns
            </p>
          </div>
        </div>

        {/* Quick Stats Card */}
        <div className="bg-white rounded-[3rem] p-10 border border-emerald-50 flex flex-col justify-center shadow-sm">
          <p className="text-[#358a74] font-black text-[10px] uppercase tracking-[0.3em] mb-4">
            Reading Progress
          </p>
          <div className="flex items-end gap-2">
            <span className="text-5xl font-black text-gray-800 leading-none">
              {activeCount}
            </span>
            <span className="text-gray-400 font-bold mb-1">Books active</span>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full mt-6 overflow-hidden">
            <div className="h-full bg-[#358a74] rounded-full w-2/3 shadow-[0_0_10px_rgba(53,138,116,0.5)]"></div>
          </div>
        </div>
      </div>

      {/* Books List Section */}
      <div className="max-w-7xl mx-auto space-y-4">
        <div className="flex items-center justify-between px-8 mb-6">
          <h2 className="font-black text-gray-800 text-xl tracking-tight flex items-center gap-2">
            <BookOpen size={20} className="text-[#358a74]" /> Borrowing History
          </h2>
          <span className="text-sm font-bold text-gray-400">
            {filteredBorrowedBooks.length} record{filteredBorrowedBooks.length !== 1 ? "s" : ""}
          </span>
        </div>

        {filteredBorrowedBooks.length === 0 && !loading && (
          <div className="text-center py-10 opacity-60">
            <p className="font-bold text-slate-500">No books found matching your search.</p>
          </div>
        )}

        {filteredBorrowedBooks.map((record) => {
          if (!record) return null;

          const theme = getStatusTheme(record);
          const title = getBookTitle(record);
          const author = getBookAuthor(record);
          const bookCover = getBookImage(record);
          const borrowDate = getBorrowDate(record);
          const dueDate = getDueDate(record);

          return (
            <div
              key={record._id || record.id}
              className="group bg-white hover:bg-[#358a74]/[0.02] border border-gray-100 rounded-[2.5rem] p-4 pr-10 transition-all duration-500 flex flex-col md:flex-row items-center gap-8 shadow-sm hover:shadow-xl hover:shadow-[#358a74]/5"
            >
              {/* Book Cover Placeholder / Icon */}
              <div className="w-24 h-32 bg-gray-50 rounded-3xl flex items-center justify-center text-[#358a74] group-hover:scale-105 transition-transform duration-500 shadow-inner overflow-hidden">
                {bookCover ? (
                  <img src={bookCover} alt={title} className="w-full h-full object-cover" />
                ) : (
                  <BookOpen size={32} strokeWidth={1.5} />
                )}
              </div>

              {/* Main Content */}
              <div className="flex-grow text-center md:text-left">
                <div
                  className={`inline-flex items-center gap-2 ${theme.bg} ${theme.color} px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter mb-4`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${theme.dot}`}></span>
                  {theme.label}
                </div>
                <h3 className="text-xl font-black text-gray-800 group-hover:text-[#358a74] transition-colors duration-300">
                  {title}
                </h3>
                <p className="text-gray-400 font-bold text-xs mt-1 uppercase">
                  {author}
                </p>
              </div>

              {/* Dates & Timeline */}
              <div className="flex gap-10 items-center border-t md:border-t-0 md:border-l border-gray-100 pt-6 md:pt-0 md:pl-10 w-full md:w-auto justify-center flex-wrap md:flex-nowrap">
                <div className="text-center md:text-left">
                  <p className="text-[9px] font-black text-gray-300 uppercase mb-1">
                    Borrow Date
                  </p>
                  <div className="flex items-center gap-2 font-black text-gray-600 text-xs">
                    <Calendar size={14} className="text-gray-400" />
                    {borrowDate}
                  </div>
                </div>

                <div className="text-center md:text-left">
                  <p className="text-[9px] font-black text-gray-300 uppercase mb-1">
                    Return By
                  </p>
                  <div
                    className={`flex items-center gap-2 font-black text-xs ${
                      new Date(record?.dueDate || record?.due_date) < new Date() &&
                      !isBorrowReturned(record)
                        ? "text-rose-500"
                        : "text-[#358a74]"
                    }`}
                  >
                    <RotateCcw size={14} />
                    {dueDate}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3">
                  {isBorrowPending(record) && (
                    <button
                      onClick={() => handleCancel(record)}
                      disabled={processingId === (record._id || record.id)}
                      className="px-4 py-2 bg-rose-50 text-rose-600 text-[9px] font-black uppercase rounded-lg hover:bg-rose-600 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Cancel this borrow request"
                    >
                      {processingId === (record._id || record.id) ? (
                        <ImSpinner2 className="animate-spin" size={12} />
                      ) : (
                        "Cancel"
                      )}
                    </button>
                  )}
                  <button className="hidden lg:flex w-10 h-10 rounded-full border border-gray-100 items-center justify-center text-gray-300 group-hover:text-[#358a74] group-hover:border-[#358a74] transition-all hover:bg-slate-50">
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MyBorrowedBooksV2;
