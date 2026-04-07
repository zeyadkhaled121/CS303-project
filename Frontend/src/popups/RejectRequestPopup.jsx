import React, { useState, useEffect } from "react";
import { FaTimes, FaExclamationCircle } from "react-icons/fa";

const RejectRequestPopup = ({ isOpen, onClose, onConfirm }) => {
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (isOpen) {
      setReason(""); // Reset reason when popup opens
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reason.trim()) return;
    onConfirm(reason);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div
        className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md relative animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-50 transition-colors"
        >
          <FaTimes size={18} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-rose-50 rounded-xl text-rose-500">
            <FaExclamationCircle size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Reject Request</h2>
            <p className="text-xs text-gray-500">
              Please provide a reason for rejecting this borrow request.
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
            
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">
              Reason for Rejection
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="E.g., User has too many overdue books..."
              className="w-full border border-gray-100 bg-gray-50/50 rounded-xl py-3 px-4 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition-all text-sm font-medium text-gray-700 resize-none"
              required
            />
          </div>

          <div className="pt-2 flex gap-3">
             <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3.5 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-all active:scale-95"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3.5 rounded-xl font-bold text-white bg-rose-500 hover:bg-rose-600 shadow-md hover:shadow-lg hover:shadow-rose-500/20 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              Reject Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RejectRequestPopup;