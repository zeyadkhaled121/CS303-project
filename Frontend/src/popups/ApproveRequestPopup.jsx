import React, { useState } from "react";
import { FaTimes, FaCalendarAlt } from "react-icons/fa";

const ApproveRequestPopup = ({ isOpen, onClose, onConfirm }) => {
  const [days, setDays] = useState(7);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm(parseInt(days) || 0, parseInt(hours) || 0, parseInt(minutes) || 0);
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
          <div className="p-3 bg-emerald-50 rounded-xl text-[#358a74]">
            <FaCalendarAlt size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Set Due Date</h2>
            <p className="text-xs text-gray-500">
              Specify the borrowing duration for this request.
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
            
          <div className="grid grid-cols-3 gap-4">
              {/* Days */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">
                  Days
                </label>
                <input
                  type="number"
                  min="0"
                  value={days}
                  onChange={(e) => setDays(e.target.value)}
                  className="w-full border border-gray-100 bg-gray-50/50 rounded-xl py-3 px-4 focus:ring-2 focus:ring-[#358a74]/20 focus:border-[#358a74] outline-none transition-all text-center font-bold text-gray-700"
                />
              </div>

               {/* Hours */}
               <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">
                  Hours
                </label>
                <input
                  type="number"
                  min="0"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  className="w-full border border-gray-100 bg-gray-50/50 rounded-xl py-3 px-4 focus:ring-2 focus:ring-[#358a74]/20 focus:border-[#358a74] outline-none transition-all text-center font-bold text-gray-700"
                />
              </div>

               {/* Minutes */}
               <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">
                  Minutes
                </label>
                <input
                  type="number"
                  min="0"
                  value={minutes}
                  onChange={(e) => setMinutes(e.target.value)}
                  className="w-full border border-gray-100 bg-gray-50/50 rounded-xl py-3 px-4 focus:ring-2 focus:ring-[#358a74]/20 focus:border-[#358a74] outline-none transition-all text-center font-bold text-gray-700"
                />
              </div>
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
              className="flex-1 py-3.5 rounded-xl font-bold text-white bg-[#358a74] hover:bg-[#2c7360] shadow-md hover:shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              Approve Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApproveRequestPopup;
