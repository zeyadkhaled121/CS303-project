import React from "react";
import { FaTimes, FaUndoAlt } from "react-icons/fa";

const ReturnConfirmPopup = ({ isOpen, onClose, onConfirm, item }) => {
  if (!isOpen || !item) return null;

  const userName = item?.user?.name || item?.userId?.name || item?.user_name || item?.userName || "Unknown Member";
  const userEmail = item?.user?.email || item?.userId?.email || item?.userEmail || item?.email || "No email";
  const bookTitle = item?.book?.title || item?.bookId?.title || item?.book_title || item?.bookTitle || item?.book?.name || "Unknown Book";

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm();
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
          <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
            <FaUndoAlt size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Confirm Return</h2>
            <p className="text-xs text-gray-500">
              Please verify the return details before proceeding.
            </p>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-gray-50/50 border border-gray-100 rounded-2xl p-5 mb-6 text-center space-y-2">
          <p className="text-sm text-gray-600">
            Are you sure you want to return <br/>
            <span className="font-bold text-gray-800 italic">"{bookTitle}"</span> ?
          </p>
          <div className="w-8 h-[1px] bg-gray-200 mx-auto my-3"></div>
          <p className="text-xs text-gray-500 uppercase tracking-widest font-black">
            Returning for
          </p>
          <p className="text-sm font-bold text-blue-600">
            {userName}
          </p>
          <p className="text-xs text-gray-400">
            {userEmail}
          </p>
        </div>

        {/* Form Controls */}
        <form onSubmit={handleSubmit}>
          <div className="flex gap-3">
             <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3.5 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-all active:scale-95"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3.5 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg hover:shadow-blue-500/20 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              Yes, Return Book
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReturnConfirmPopup;