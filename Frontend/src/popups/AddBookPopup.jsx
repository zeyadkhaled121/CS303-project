import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addBook, updateBook } from "../store/slices/bookSlice";
import { toggleAddBookPopup } from "../store/slices/popUpSlice";
import { FaTimes, FaCloudUploadAlt, FaBook } from "react-icons/fa";

const AddBookPopup = ({ editBook }) => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.book);

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [genre, setGenre] = useState("");
  const [edition, setEdition] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const isEditing = !!editBook;

  useEffect(() => {
    if (editBook) {
      setTitle(editBook.title || "");
      setAuthor(editBook.author || "");
      setGenre(editBook.genre || "");
      setEdition(editBook.edition || "");
      setImagePreview(editBook.image?.url || "");
    }
  }, [editBook]);

  // Close popup when operation completes successfully
  useEffect(() => {
    if (submitted && !loading) {
      if (!error) {
        dispatch(toggleAddBookPopup());
      }
      setSubmitted(false);
    }
  }, [submitted, loading, error, dispatch]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("title", title);
    formData.append("author", author);
    formData.append("genre", genre);
    formData.append("edition", edition);
    if (image) {
      formData.append("image", image);
    }

    if (isEditing) {
      dispatch(updateBook(editBook.id, formData));
    } else {
      dispatch(addBook(formData));
    }

    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div
        className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-lg relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={() => dispatch(toggleAddBookPopup())}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-50"
        >
          <FaTimes size={18} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-emerald-50 rounded-xl text-[#358a74]">
            <FaBook size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              {isEditing ? "Edit Book" : "Add New Book"}
            </h2>
            <p className="text-xs text-gray-500">
              {isEditing ? "Update the book details below." : "Fill in the details to add a new book."}
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Image Upload */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">
              Book Cover
            </label>
            <div
              className="border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center hover:border-[#358a74] transition-colors cursor-pointer"
              onClick={() => document.getElementById("book-image-input").click()}
            >
              {imagePreview ? (
                <div className="flex flex-col items-center">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-32 h-44 object-cover rounded-xl mb-3"
                  />
                  <p className="text-xs text-gray-500">Click to change image</p>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <FaCloudUploadAlt size={36} className="text-gray-300 mb-2" />
                  <p className="text-sm text-gray-500 font-medium">Click to upload book cover</p>
                  <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</p>
                </div>
              )}
              <input
                id="book-image-input"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter book title"
              required={!isEditing}
              className="w-full border border-gray-100 bg-gray-50/50 rounded-xl py-3 px-4 focus:ring-2 focus:ring-[#358a74]/20 focus:border-[#358a74] outline-none transition-all"
            />
          </div>

          {/* Author */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">
              Author
            </label>
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Enter author name"
              required={!isEditing}
              className="w-full border border-gray-100 bg-gray-50/50 rounded-xl py-3 px-4 focus:ring-2 focus:ring-[#358a74]/20 focus:border-[#358a74] outline-none transition-all"
            />
          </div>

          {/* Genre */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">
              Genre
            </label>
            <input
              type="text"
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              placeholder="e.g. Science, Fiction, History"
              required={!isEditing}
              className="w-full border border-gray-100 bg-gray-50/50 rounded-xl py-3 px-4 focus:ring-2 focus:ring-[#358a74]/20 focus:border-[#358a74] outline-none transition-all"
            />
          </div>

          {/* Edition */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">
              Edition
            </label>
            <input
              type="text"
              value={edition}
              onChange={(e) => setEdition(e.target.value)}
              placeholder="e.g. 1st, 2nd, 3rd"
              required={!isEditing}
              className="w-full border border-gray-100 bg-gray-50/50 rounded-xl py-3 px-4 focus:ring-2 focus:ring-[#358a74]/20 focus:border-[#358a74] outline-none transition-all"
            />
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-bold text-white bg-[#358a74] hover:bg-[#2c7360] shadow-md hover:shadow-lg transition-all disabled:opacity-50 active:scale-95"
            >
              {loading
                ? isEditing
                  ? "Updating..."
                  : "Adding..."
                : isEditing
                ? "Update Book"
                : "Add Book"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddBookPopup;
