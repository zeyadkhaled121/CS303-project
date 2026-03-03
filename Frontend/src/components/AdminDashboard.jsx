import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { FaPlus, FaTrash, FaEdit, FaUserShield, FaBook } from 'react-icons/fa';
// import AddBookPopup from '../popups/AddBookPopup';

const AdminDashboard = () => {
  const [isAddPopupOpen, setIsAddPopupOpen] = useState(false);
  
  // Accessing auth and books state from Redux
  const { user } = useSelector((state) => state.auth);
  const { adminBooks } = useSelector((state) => state.books);

  // Role constants for cleaner logic
  const isSuperAdmin = user?.role === "SuperAdmin";

  return (
    <div className="p-6 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            {isSuperAdmin ? <FaUserShield className="text-[#358a74]" /> : <FaBook className="text-[#358a74]" />}
            {isSuperAdmin ? "Super Admin Dashboard" : "Admin Dashboard"}
          </h2>
          <p className="text-sm text-gray-500">Welcome back, {user?.name}.</p>
        </div>

        {/* Both Admin and Super Admin can add books */}
        <button 
          onClick={() => setIsAddPopupOpen(true)}
          className="bg-[#358a74] text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-[#2c7360] transition-all shadow-md flex items-center gap-2 active:scale-95"
        >
          <FaPlus /> Add New Book
        </button>
      </div>
      
      {/* Books Table Container */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 text-gray-600 uppercase text-[11px] font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4">Title</th>
                <th className="px-6 py-4">Author</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            
          </table>
        </div>
      </div>
    
    </div>
  );
};

export default AdminDashboard;