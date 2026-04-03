import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { updateBook } from "../store/slices/bookSlice"; 
import { toast } from "react-toastify";
import { X, Save, Edit3, Check } from "lucide-react";

const UpdateBookPopup = ({ book, onClose }) => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({ ...book });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await dispatch(updateBook({ id: book._id, formData })).unwrap();
      
      toast.success("Changes Saved", {
        icon: <div className="bg-[#358a74] p-1 rounded-md text-white"><Check size={12}/></div>,
        className: "rounded-[1.5rem] font-bold text-xs p-4"
      });
      
      onClose();
    } catch (error) {
      toast.error(error || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/40 backdrop-blur-md p-4">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/20 animate-in fade-in zoom-in duration-300">
        
        {/* Header  */}
        <div className="p-8 pb-4 text-center relative">
          <button 
            onClick={onClose} 
            className="absolute top-6 right-6 p-2 bg-gray-50 rounded-full text-gray-400 hover:text-red-500 transition-all"
          >
            <X size={18} />
          </button>
          
          <div className="inline-flex p-3 bg-blue-50 rounded-2xl text-blue-500 mb-3">
            <Edit3 size={28} />
          </div>
          <h3 className="text-xl font-black text-gray-900 tracking-tight">Edit Book Info</h3>
          <p className="text-[10px] text-blue-500 font-black uppercase tracking-[0.2em] mt-1 italic">
            Updating: {book.title}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 pt-4 space-y-5">
          
          {/* Inputs Section */}
          <div className="space-y-4">
            <div className="space-y-1">
              <input 
                value={formData.title} required 
                placeholder="Book Title"
                className="w-full p-4 bg-gray-50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-blue-200 focus:ring-4 focus:ring-blue-50 transition-all text-sm font-medium"
                onChange={(e) => setFormData({...formData, title: e.target.value})}
              />
            </div>

            <input 
              value={formData.author} required 
              placeholder="Author Name"
              className="w-full p-4 bg-gray-50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-blue-200 focus:ring-4 focus:ring-blue-50 transition-all text-sm font-medium"
              onChange={(e) => setFormData({...formData, author: e.target.value})}
            />

            <div className="flex gap-3">
              <input 
                value={formData.genre} placeholder="Genre"
                className="w-1/2 p-4 bg-gray-50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-blue-200 transition-all text-sm font-medium"
                onChange={(e) => setFormData({...formData, genre: e.target.value})}
              />
              <input 
                value={formData.edition} placeholder="Edition"
                className="w-1/2 p-4 bg-gray-50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-blue-200 transition-all text-sm font-medium"
                onChange={(e) => setFormData({...formData, edition: e.target.value})}
              />
            </div>
          </div>

          {/* Action Buttons  */}
          <div className="flex flex-col gap-2 pt-2">
            <button 
              disabled={loading}
              className={`w-full py-4 ${loading ? 'bg-gray-400' : 'bg-gray-900'} text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-black transition-all active:scale-95 flex items-center justify-center gap-2`}
            >
              {loading ? "Saving..." : <><Save size={16} /> Update Record</>}
            </button>
            
            <button 
              type="button" 
              onClick={onClose}
              className="w-full py-3 text-gray-400 text-[10px] font-black uppercase tracking-widest hover:text-gray-600 transition-all"
            >
              Discard Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateBookPopup;