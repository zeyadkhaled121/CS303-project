import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FaPlus, FaUserShield, FaBook } from 'react-icons/fa';
import { toggleAddBookPopup } from "../store/slices/popUpSlice"; 

const AdminDashboard = () => {
  const dispatch = useDispatch();
  
  const { books } = useSelector((state) => state.books || { books: [] });
  const { user } = useSelector((state) => state.auth); 

  const isSuperAdmin = user?.role === "SuperAdmin";

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            {isSuperAdmin ? <FaUserShield className="text-[#358a74]" /> : <FaBook className="text-[#358a74]" />}
            {isSuperAdmin ? "Super Admin Dashboard" : "Admin Dashboard"}
          </h2>
          <p className="text-sm text-gray-500">Welcome back, {user?.name}.</p>
        </div>

        <button 
          onClick={() => dispatch(toggleAddBookPopup())} 
          className="bg-[#358a74] text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-[#2c7360] transition-all shadow-md flex items-center gap-2"
        >
          <FaPlus /> Add New Book
        </button>
      </div>

      <div className="bg-white rounded-2xl  border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-600 uppercase text-[11px] font-bold">
            <tr>
              <th className="px-6 py-4">Title</th>
              <th className="px-6 py-4">Author</th>
              <th className="px-6 py-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {books.slice(0, 5).map((book) => (
              <tr key={book._id} className="border-t border-gray-50">
                <td className="px-6 py-4 font-medium">{book.title}</td>
                <td className="px-6 py-4">{book.author}</td>
                <td className="px-6 py-4 text-center">---</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;