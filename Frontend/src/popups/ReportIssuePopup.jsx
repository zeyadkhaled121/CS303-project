

import React, { useState } from "react";
import { AiOutlineClose } from "react-icons/ai";
import { FaExclamationTriangle, FaBook } from "react-icons/fa";

const ReportIssuePopup = ({ isOpen, borrowRecord, onClose, onSubmit, isLoading }) => {
  const [issueType, setIssueType] = useState("Lost");
  const [remarks, setRemarks] = useState("");

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!issueType) {
      alert("Please select an issue type");
      return;
    }

    onSubmit({
      borrowId: borrowRecord?._id || borrowRecord?.id,
      issueType,
      remarks,
    });

    // Reset form
    setIssueType("Lost");
    setRemarks("");
  };

  const handleClose = () => {
    setIssueType("Lost");
    setRemarks("");
    onClose();
  };

  const getBookTitle = (record) => {
    return (
      record?.book?.title ||
      record?.bookId?.title ||
      record?.book_title ||
      record?.bookTitle ||
      "Unknown Title"
    );
  };

  const getUserName = (record) => {
    return (
      record?.user?.name ||
      record?.userId?.name ||
      record?.user_name ||
      record?.userName ||
      "Unknown User"
    );
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[2rem] shadow-2xl max-w-md w-full border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-50 to-orange-50 rounded-t-[2rem] px-8 py-8 border-b border-rose-100 flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-rose-100 rounded-xl">
              <FaExclamationTriangle className="text-rose-600" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-800 tracking-tight">
                Report Issue
              </h2>
              <p className="text-xs text-slate-500 font-bold uppercase mt-1 tracking-widest">
                Mark book as lost or damaged
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-slate-600 transition-colors p-1"
            disabled={isLoading}
          >
            <AiOutlineClose size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          {/* Book & User Info */}
          <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
            <div className="space-y-3">
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">
                  Book
                </p>
                <p className="flex items-center gap-2 text-sm font-bold text-slate-700">
                  <FaBook size={12} className="text-[#358a74]" />
                  {getBookTitle(borrowRecord)}
                </p>
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">
                  Borrowed By
                </p>
                <p className="text-sm font-bold text-slate-700">
                  {getUserName(borrowRecord)}
                </p>
              </div>
            </div>
          </div>

          {/* Issue Type Selection */}
          <div>
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 block">
              Issue Type <span className="text-rose-500">*</span>
            </label>
            <div className="space-y-2">
              {["Lost", "Damaged"].map((type) => (
                <label
                  key={type}
                  className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    issueType === type
                      ? "border-[#358a74] bg-[#358a74]/5"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="issueType"
                    value={type}
                    checked={issueType === type}
                    onChange={(e) => setIssueType(e.target.value)}
                    disabled={isLoading}
                    className="w-4 h-4 cursor-pointer"
                  />
                  <span className="font-bold text-slate-700">{type}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Remarks */}
          <div>
            <label htmlFor="remarks" className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block">
              Remarks (Optional)
            </label>
            <textarea
              id="remarks"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              disabled={isLoading}
              placeholder="Enter any additional details about the issue..."
              className="w-full p-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#358a74]/20 resize-none disabled:bg-slate-50"
              rows="3"
            />
          </div>

          {/* Warning Message */}
          <div className="bg-rose-50 border border-rose-200 rounded-lg p-4">
            <p className="text-xs font-bold text-rose-700">
              ⚠️ This action will remove the book from inventory and mark the borrow record as completed.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 rounded-b-[2rem] px-8 py-5 border-t border-slate-100 flex gap-3">
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 font-bold rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="flex-1 px-4 py-3 bg-rose-600 text-white font-bold rounded-lg hover:bg-rose-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Reporting..." : "Report Issue"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportIssuePopup;
