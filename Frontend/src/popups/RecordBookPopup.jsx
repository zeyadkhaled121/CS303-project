

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { X, BookPlus, User, Calendar, CheckCircle, Info, AlertCircle } from "lucide-react";
import { fetchAllBooks } from "../store/slices/bookSlice";
import { getAllUsers } from "../store/slices/authSlice";
import { recordDirectBorrow } from "../store/slices/borrowSlice";
import {
  validateDirectBorrowRequest,
  extractErrorMessage,
} from "../utils/validationEngine";
import {
  notifyError,
  notifyWarning,
  notifySuccess,
} from "../utils/toastNotificationManager";

const RecordBookPopupV2 = ({ onClose }) => {
  const dispatch = useDispatch();

  // Get data from Redux store
  const { books, loading: booksLoading } = useSelector((state) => state.book);
  const { allUsers, loading: usersLoading } = useSelector((state) => state.auth);
  const { loading: borrowLoading } = useSelector((state) => state.borrow);

  // Form state
  const [formData, setFormData] = useState({
    userId: "",
    bookId: "",
    dueDate: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch users and books on mount
  useEffect(() => {
    dispatch(fetchAllBooks());
    dispatch(getAllUsers());
  }, [dispatch]);

  // Pre-flight validation function
  const validateForm = () => {
    const newErrors = {};

    if (!formData.userId?.trim()) {
      newErrors.userId = "Please select a member";
    }

    if (!formData.bookId?.trim()) {
      newErrors.bookId = "Please select a book";
    }

    if (!formData.dueDate?.trim()) {
      newErrors.dueDate = "Please select a return date";
    } else {
      const dueDate = new Date(formData.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      dueDate.setHours(0, 0, 0, 0);

      if (dueDate <= today) {
        newErrors.dueDate = "Return date must be in the future";
      }
    }

    // Validate using the enterprise validation engine
    if (formData.userId && formData.bookId && formData.dueDate) {
      const validation = validateDirectBorrowRequest(
        formData.userId,
        formData.bookId,
        formData.dueDate
      );

      if (!validation.isValid) {
        newErrors.general = validation.error || "Validation failed";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Run pre-flight validation
    if (!validateForm()) {
      const errorMsg =
        errors.general ||
        Object.values(errors).find((err) => err) ||
        "Please fix validation errors";
      notifyError(errorMsg);
      return;
    }

    if (isSubmitting || borrowLoading) {
      notifyWarning("Request is already being processed");
      return;
    }

    setIsSubmitting(true);
    try {
      // Dispatch the action
      const result = await dispatch(
        recordDirectBorrow(
          formData.userId,
          formData.bookId,
          formData.dueDate
        )
      );

      if (result?.ok) {
        setFormData({ userId: "", bookId: "", dueDate: "" });
        setErrors({});

        // Close popup after short delay
        setTimeout(() => {
          onClose?.();
        }, 1500);
      }
    } catch (err) {
      const errorMsg = extractErrorMessage(err);
      notifyError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get available books (safe)
  const availableBooks = Array.isArray(books)
    ? books.filter((b) => {
        const stock = Number(b.stock || b.availableCopies || 0);
        return stock > 0;
      })
    : [];

  const isLoading = usersLoading || booksLoading;
  const isDisabled = isLoading || isSubmitting || borrowLoading;

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
              <h2 className="text-2xl font-black tracking-tight">
                Record New Loan
              </h2>
              <p className="text-emerald-100 text-[10px] font-medium uppercase tracking-widest mt-1">
                Librarian Management System
              </p>
            </div>
          </div>
        </div>

        {/* Input Form Section */}
        <form onSubmit={handleSubmit} className="p-10 space-y-6">
          {/* General Error Alert */}
          {errors.general && (
            <div className="bg-rose-50 rounded-2xl p-4 flex gap-3 items-start border border-rose-100">
              <AlertCircle className="text-rose-500 shrink-0" size={18} />
              <p className="text-[11px] text-rose-700 leading-relaxed font-medium">
                {errors.general}
              </p>
            </div>
          )}

          {/* User Selection Dropdown */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">
              Select Member {errors.userId && <span className="text-rose-500">*</span>}
            </label>
            <div className="relative">
              <User
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <select
                className={`w-full bg-gray-50 border-none rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-gray-700 focus:ring-2 transition-all appearance-none cursor-pointer ${
                  errors.userId
                    ? "focus:ring-rose-500/30"
                    : "focus:ring-[#358a74]/30"
                }`}
                value={formData.userId}
                onChange={(e) => {
                  setFormData({ ...formData, userId: e.target.value });
                  setErrors({ ...errors, userId: "" });
                }}
                disabled={isDisabled}
              >
                <option value="">Choose a member...</option>
                {Array.isArray(allUsers) && allUsers.length > 0 ? (
                  allUsers.map((u) => (
                    <option key={u._id} value={u._id}>
                      {u.name} — {u.email}
                    </option>
                  ))
                ) : (
                  <option disabled>Loading members...</option>
                )}
              </select>
              {errors.userId && (
                <p className="text-[9px] text-rose-500 font-bold mt-1 ml-2">
                  {errors.userId}
                </p>
              )}
            </div>
          </div>

          {/* Book Selection Dropdown (Only shows available books) */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">
              Select Book {errors.bookId && <span className="text-rose-500">*</span>}
            </label>
            <div className="relative">
              <BookPlus
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <select
                className={`w-full bg-gray-50 border-none rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-gray-700 focus:ring-2 transition-all appearance-none cursor-pointer ${
                  errors.bookId
                    ? "focus:ring-rose-500/30"
                    : "focus:ring-[#358a74]/30"
                }`}
                value={formData.bookId}
                onChange={(e) => {
                  setFormData({ ...formData, bookId: e.target.value });
                  setErrors({ ...errors, bookId: "" });
                }}
                disabled={isDisabled}
              >
                <option value="">Choose a book...</option>
                {availableBooks.length > 0 ? (
                  availableBooks.map((b) => {
                    const stock = Number(b.stock || b.availableCopies || 0);
                    return (
                      <option key={b._id} value={b._id}>
                        {b.title} (Stock: {stock})
                      </option>
                    );
                  })
                ) : (
                  <option disabled>
                    {isLoading
                      ? "Loading books..."
                      : "No books available in stock"}
                  </option>
                )}
              </select>
              {errors.bookId && (
                <p className="text-[9px] text-rose-500 font-bold mt-1 ml-2">
                  {errors.bookId}
                </p>
              )}
            </div>
          </div>

          {/* Due Date Input (Prevents past dates) */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">
              Return Date {errors.dueDate && <span className="text-rose-500">*</span>}
            </label>
            <div className="relative">
              <Calendar
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="date"
                min={new Date().toISOString().split("T")[0]}
                className={`w-full bg-gray-50 border-none rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-gray-700 focus:ring-2 transition-all ${
                  errors.dueDate
                    ? "focus:ring-rose-500/30"
                    : "focus:ring-[#358a74]/30"
                }`}
                value={formData.dueDate}
                onChange={(e) => {
                  setFormData({ ...formData, dueDate: e.target.value });
                  setErrors({ ...errors, dueDate: "" });
                }}
                disabled={isDisabled}
              />
              {errors.dueDate && (
                <p className="text-[9px] text-rose-500 font-bold mt-1 ml-2">
                  {errors.dueDate}
                </p>
              )}
            </div>
          </div>

          {/* Operational Info Message */}
          <div className="bg-amber-50 rounded-2xl p-4 flex gap-3 items-start border border-amber-100">
            <Info className="text-amber-500 shrink-0" size={18} />
            <p className="text-[11px] text-amber-700 leading-relaxed font-medium">
              Recording a loan will automatically decrease the book stock by 1.
              Please ensure the member is verified.
            </p>
          </div>

          {/* Confirmation Button */}
          <button
            type="submit"
            disabled={isDisabled}
            className="w-full py-5 bg-[#358a74] text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] shadow-lg shadow-emerald-900/20 hover:bg-[#2d7562] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
          >
            {isSubmitting ||borrowLoading ? (
              "Registering..."
            ) : (
              <>
                Confirm & Record <CheckCircle size={18} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RecordBookPopupV2;
