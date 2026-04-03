

import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { returnBook } from "../store/slices/borrowSlice";
import {
  CheckCircle2,
  X,
  BookOpen,
  User,
  Clock,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import {
  extractUserName,
} from "../utils/dataShapeNormalizer";
import { notifyError } from "../utils/toastNotificationManager";

const ReturnBookPopupV2 = ({ loan, onClose }) => {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.borrow);

  // Safe extraction of book title across multi-format payloads
  const getBookTitle = (loanRecord) => {
    if (!loanRecord) return "Unknown Book";
    return (
      loanRecord?.book?.title ||
      loanRecord?.bookId?.title ||
      loanRecord?.book_title ||
      loanRecord?.book?.name ||
      "Unknown Book"
    );
  };

  // Safe extraction of borrower name across multi-format payloads
  const getBorrowerName = (loanRecord) => {
    if (!loanRecord) return "Unknown Member";
    return (
      loanRecord?.user?.name ||
      loanRecord?.userId?.name ||
      loanRecord?.user_name ||
      loanRecord?.userName ||
      extractUserName(loanRecord) ||
      "Unknown Member"
    );
  };

  // Safe extraction of due date
  const getDueDate = (loanRecord) => {
    return (
      loanRecord?.dueDate ||
      loanRecord?.due_date ||
      loanRecord?.returnDate ||
      new Date()
    );
  };

  // Calculate overdue days safely
  const calculateOverdueDays = (dueDate) => {
    try {
      const today = new Date();
      const due = new Date(dueDate);

      // Validate date
      if (Number.isNaN(due.getTime())) {
        return 0;
      }

      today.setHours(0, 0, 0, 0);
      due.setHours(0, 0, 0, 0);

      if (today <= due) return 0;

      const diffTime = today - due;
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    } catch (e) {
      console.error("Date calculation error:", e);
      return 0;
    }
  };

  // Validate loan record exists
  if (!loan) {
    return (
      <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
        <div className="bg-white w-full max-w-[380px] rounded-[3rem] shadow-2xl overflow-hidden p-10 text-center">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <h3 className="text-lg font-black text-slate-800 mb-2">
            No Loan Record
          </h3>
          <p className="text-sm text-slate-500 mb-6">
            The loan record could not be loaded. Please try again.
          </p>
          <button
            onClick={onClose}
            className="w-full py-3 bg-slate-100 text-slate-600 rounded-2xl font-black text-xs uppercase hover:bg-slate-200 transition-all"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  // Get overdue status
  const overdueDays = calculateOverdueDays(getDueDate(loan));
  const borrowerName = getBorrowerName(loan);
  const bookTitle = getBookTitle(loan);
  const loanId = loan?._id || loan?.id;

  // Get borrow record ID safely
  if (!loanId) {
    return (
      <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
        <div className="bg-white w-full max-w-[380px] rounded-[3rem] shadow-2xl overflow-hidden p-10 text-center">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <h3 className="text-lg font-black text-slate-800 mb-2">
            Invalid Record
          </h3>
          <p className="text-sm text-slate-500 mb-6">
            The loan record ID is missing. Please refresh and try again.
          </p>
          <button
            onClick={onClose}
            className="w-full py-3 bg-slate-100 text-slate-600 rounded-2xl font-black text-xs uppercase hover:bg-slate-200 transition-all"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  // Handle return confirmation
  const handleConfirm = async () => {
    try {
      await dispatch(
        returnBook(loanId)
      );

      // Close popup after success
      setTimeout(() => {
        onClose?.();
      }, 1000);
    } catch (err) {
      const errorMsg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to process return";
      notifyError(errorMsg);
    }
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-fadeIn">
      <div className="bg-white w-full max-w-[380px] rounded-[3rem] shadow-[0_25px_70px_-15px_rgba(0,0,0,0.15)] overflow-hidden animate-slideUp relative border border-slate-50">
        {/* Decorative Top Bar */}
        <div className="h-2 w-full bg-[#358a74]/10" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-8 top-8 text-slate-300 hover:text-[#358a74] transition-all"
        >
          <X size={18} />
        </button>

        <div className="p-10 flex flex-col items-center text-center">
          {/* Main Logo Icon */}
          <div className="relative mb-6">
            <div className="w-20 h-20 bg-emerald-50 text-[#358a74] rounded-[2rem] flex items-center justify-center shadow-inner group transition-transform duration-500 hover:rotate-6">
              <CheckCircle2 size={36} strokeWidth={1.5} />
            </div>
            <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-sm border border-emerald-50">
              <ShieldCheck size={14} className="text-[#358a74]" />
            </div>
          </div>

          {/* Header */}
          <div className="space-y-1">
            <h4 className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-300">
              Sci Library System
            </h4>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight italic">
              Return Book
            </h3>
            <p className="text-slate-400 text-[11px] font-medium max-w-[200px] leading-relaxed">
              Verify that the copy has been inspected and returned to the shelf.
            </p>
          </div>

          {/* Info Card - Book & Borrower Details */}
          <div className="mt-8 w-full bg-slate-50/50 rounded-[2rem] p-6 border border-slate-100 space-y-4">
            {/* Book Title */}
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center text-[#358a74] shadow-sm mb-2">
                <BookOpen size={14} />
              </div>
              <p className="text-[8px] font-black uppercase text-slate-300 tracking-[0.2em] mb-1">
                Book Identity
              </p>
              <p className="font-bold text-slate-800 text-sm leading-tight italic px-2 line-clamp-2">
                "{bookTitle}"
              </p>
            </div>

            {/* Separator */}
            <div className="h-px w-12 bg-slate-200 mx-auto" />

            {/* Borrower Name */}
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center text-[#358a74] shadow-sm mb-2">
                <User size={14} />
              </div>
              <p className="text-[8px] font-black uppercase text-slate-300 tracking-[0.2em] mb-1">
                Borrower
              </p>
              <p className="font-bold text-slate-800 text-sm line-clamp-1">
                {borrowerName}
              </p>
            </div>
          </div>

          {/* Overdue Alert - Conditional Display */}
          {overdueDays > 0 && (
            <div className="mt-4 flex items-center gap-2 px-4 py-2 bg-rose-50 rounded-full border border-rose-100">
              <Clock size={12} className="text-rose-500 shrink-0" />
              <p className="text-[10px] font-black text-rose-600 uppercase tracking-tighter">
                Overdue: {overdueDays} {overdueDays === 1 ? "Day" : "Days"}
              </p>
            </div>
          )}

          {/* Borrow Date Info */}
          {loan?.borrowDate || loan?.createdAt ? (
            <p className="mt-4 text-[9px] text-slate-400 font-medium">
              Borrowed:{" "}
              {new Date(
                loan?.borrowDate || loan?.createdAt
              ).toLocaleDateString()}
            </p>
          ) : null}

          {/* Action Buttons */}
          <div className="flex flex-col w-full gap-3 mt-10">
            <button
              disabled={loading}
              onClick={handleConfirm}
              className="w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] bg-[#358a74] text-white shadow-[0_15px_30px_-10px_rgba(53,138,116,0.4)] hover:bg-[#2d7663] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Processing Protocol..." : "Complete Return"}
            </button>
            <button
              onClick={onClose}
              disabled={loading}
              className="w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all disabled:opacity-50"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReturnBookPopupV2;
