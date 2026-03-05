import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { addBook } from "../store/slices/bookSlice"; 
import { toggleAddBookPopup } from "../store/slices/popUpSlice";
import { toast } from "react-toastify";
import { X, Upload, Image as ImageIcon, BookOpen, Check } from "lucide-react";

const AddBookPopup = () => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({ title: "", author: "", genre: "", edition: "" });
  
  const [imageFile, setImageFile] = useState(null); 
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file); 
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!imageFile) {
        return toast.error("Please upload a book cover image");
    }

    setLoading(true);
    
    const data = new FormData();
    data.append("title", formData.title);
    data.append("author", formData.author);
    data.append("genre", formData.genre);
    data.append("edition", formData.edition);
    data.append("image", imageFile); 

    try {
      await dispatch(addBook(data)).unwrap();
      
      toast.success("Book Added to Catalog", {
        icon: <div className="bg-[#358a74] p-1 rounded-md text-white"><Check size={12}/></div>,
        className: "rounded-[1.5rem] font-bold text-xs p-4"
      });
      
      dispatch(toggleAddBookPopup());
    } catch (error) {
      toast.error(error || "Failed to add book");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/40 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/20">
        
        {/* Header */}
        <div className="p-8 pb-4 text-center relative">
          <button 
            onClick={() => dispatch(toggleAddBookPopup())} 
            className="absolute top-6 right-6 p-2 bg-gray-50 rounded-full text-gray-400 hover:text-red-500 transition-all"
          >
            <X size={18} />
          </button>
          
          <div className="inline-flex p-3 bg-[#358a74]/10 rounded-2xl text-[#358a74] mb-3">
            <BookOpen size={28} />
          </div>
          <h3 className="text-xl font-black text-gray-900 tracking-tight">Add New Book</h3>
          <p className="text-[10px] text-[#358a74] font-black uppercase tracking-[0.2em] mt-1">Sci Library Records</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 pt-4 space-y-6">
          
          {/* Upload Area */}
          <div className="group relative flex flex-col items-center justify-center border-2 border-dashed border-gray-100 rounded-[2rem] p-6 hover:border-[#358a74] transition-all bg-gray-50/50">
            {imagePreview ? (
              <div className="relative w-24 h-32 group">
                <img src={imagePreview} className="w-full h-full object-cover rounded-xl shadow-xl" alt="preview" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                  <p className="text-[10px] text-white font-bold">Change Cover</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-2">
                <div className="mx-auto w-10 h-10 mb-2 bg-white rounded-xl flex items-center justify-center shadow-sm text-gray-300 group-hover:text-[#358a74] transition-colors">
                  <ImageIcon size={20} />
                </div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Upload Cover Image</p>
              </div>
            )}
            <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleImageChange} />
          </div>

          {/* Input Fields */}
          <div className="grid grid-cols-1 gap-4">
            <input 
              placeholder="Book Title" required 
              className="w-full p-4 bg-gray-50/80 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-[#358a74]/30 transition-all text-sm font-medium"
              onChange={(e) => setFormData({...formData, title: e.target.value})}
            />
            
            <input 
              placeholder="Author Name" required 
              className="w-full p-4 bg-gray-50/80 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-[#358a74]/30 transition-all text-sm font-medium"
              onChange={(e) => setFormData({...formData, author: e.target.value})}
            />

            <div className="flex gap-3">
              <input 
                placeholder="Genre"
                className="w-1/2 p-4 bg-gray-50/80 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-[#358a74]/30 transition-all text-sm font-medium"
                onChange={(e) => setFormData({...formData, genre: e.target.value})}
              />
              <input 
                placeholder="Edition"
                className="w-1/2 p-4 bg-gray-50/80 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-[#358a74]/30 transition-all text-sm font-medium"
                onChange={(e) => setFormData({...formData, edition: e.target.value})}
              />
            </div>
          </div>

          <button 
            disabled={loading}
            className={`w-full py-4 ${loading ? 'bg-gray-400' : 'bg-[#358a74]'} text-white rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-[#358a74]/20 hover:-translate-y-1 transition-all flex items-center justify-center gap-2`}
          >
            {loading ? "Adding..." : <><Upload size={16} /> Add Book</>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddBookPopup;