import React from "react";
import { useDispatch } from "react-redux";
import { toggleReadBookPopup } from "../store/slices/popUpSlice";
import { FaTimes, FaBook, FaUser, FaTag, FaLayerGroup } from "react-icons/fa";

const ReadBookPopup = ({ book }) => {
  const dispatch = useDispatch();

  if (!book) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={() => dispatch(toggleReadBookPopup())}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={() => dispatch(toggleReadBookPopup())}
          className="absolute top-4 right-4 z-50 p-2 bg-white/80 backdrop-blur-sm rounded-full text-gray-500 hover:text-gray-700 transition-colors"
        >
          <FaTimes size={16} />
        </button>

        {/* Book Cover */}
        <div className="w-full h-64 bg-gray-100 relative">
          {book.image?.url ? (
            <img
              src={book.image.url}
              alt={book.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <FaBook size={60} className="text-gray-300" />
            </div>
          )}
          {/* Status Badge */}
          <span
            className={`absolute bottom-4 left-4 px-4 py-1.5 rounded-full text-xs font-bold ${
              book.status === "Available"
                ? "bg-green-100 text-green-700"
                : "bg-amber-100 text-amber-700"
            }`}
          >
            {book.status}
          </span>
        </div>

        {/* Book Details */}
        <div className="p-6 space-y-4">
          <h2 className="text-2xl font-extrabold text-gray-900 leading-tight">
            {book.title}
          </h2>

          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <div className="p-2 bg-emerald-50 rounded-lg text-[#358a74]">
                <FaUser size={12} />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-bold uppercase">Author</p>
                <p className="font-semibold text-gray-800">{book.author}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm text-gray-600">
              <div className="p-2 bg-emerald-50 rounded-lg text-[#358a74]">
                <FaTag size={12} />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-bold uppercase">Genre</p>
                <p className="font-semibold text-gray-800">{book.genre}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm text-gray-600">
              <div className="p-2 bg-emerald-50 rounded-lg text-[#358a74]">
                <FaLayerGroup size={12} />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-bold uppercase">Edition</p>
                <p className="font-semibold text-gray-800">{book.edition}</p>
              </div>
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={() => dispatch(toggleReadBookPopup())}
            className="w-full py-3 rounded-xl font-bold text-white bg-[#358a74] hover:bg-[#2c7360] shadow-md transition-all active:scale-95 mt-2"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReadBookPopup;
