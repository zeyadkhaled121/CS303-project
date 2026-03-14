import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchAllUsers,
  promoteUser,
  demoteUser,
  deleteUser,
  resetUserSlice,
} from "../store/slices/userSlice";
import { toast } from "react-toastify";
import { 
  FaArrowUp, FaArrowDown, FaTrash, 
  FaUserShield, FaCircle, FaFingerprint 
} from "react-icons/fa";

const Users = ({ searchTerm = "" }) => {
  const dispatch = useDispatch();
  const { users, loading, error, message } = useSelector((state) => state.user);
  const { user: currentUser } = useSelector((state) => state.auth);

  const isSuperAdmin = currentUser?.role === "Super Admin";

  useEffect(() => {
    dispatch(fetchAllUsers());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(resetUserSlice());
    }
    if (message) {
      toast.success(message);
      dispatch(resetUserSlice());
      dispatch(fetchAllUsers());
    }
  }, [error, message, dispatch]);

  const handleAction = (action, userId, name) => {
    if (window.confirm(`Are you sure you want to perform this action on ${name}?`)) {
      dispatch(action(userId));
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-12 animate-fadeIn min-h-screen bg-white">
      
      {/* --- Elegant Minimalist Header --- */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-4 border-b border-slate-100 pb-10">
        <div>
          <h2 className="text-3xl font-black text-gray-800 tracking-tighter uppercase ">
            Member <span className="text-[#358a74] not-">Base</span>
          </h2>
          <div className="flex items-center gap-2 mt-2">
          </div>
        </div>
        <div className="text-right">
          <p className="text-[2rem] font-black text-slate-1 leading-none select-none">#{users.length}</p>
        </div>
      </div>

      {/* --- The Smart List System --- */}
      <div className="space-y-2">
        {loading && !users.length ? (
          <div className="py-20 text-center font-black text-slate-200 text-2xl  animate-pulse tracking-widest uppercase">Syncing Database...</div>
        ) : (
          filteredUsers.map((u) => (
            <div 
              key={u.id} 
              className="group flex flex-col md:flex-row items-center justify-between p-6 rounded-[1.5rem] transition-all duration-500 hover:bg-[#358a74]/[0.03] border border-transparent hover:border-emerald-50"
            >
              {/* User Main Identity */}
              <div className="flex items-center gap-6 flex-1 w-full md:w-auto">
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-[#358a74] font-black text-xl group-hover:scale-110 transition-transform duration-500">
                    {u.name?.charAt(0).toUpperCase()}
                  </div>
                  <FaCircle className={`absolute -top-1 -right-1 text-[10px] ${u.role !== 'User' ? 'text-[#358a74]' : 'text-slate-200'} border-2 border-white rounded-full`} />
                </div>
                
                <div className="flex-1">
                  <h4 className="font-black text-slate-800 text-lg tracking-tight group-hover:text-[#358a74] transition-colors uppercase">
                    {u.name}
                  </h4>
                  <div className="flex items-center gap-2">
                    <FaFingerprint className="text-slate-300" size={10} />
                    <p className="text-slate-400 text-xs font-medium tracking-tight">{u.email}</p>
                  </div>
                </div>
              </div>

              {/* Role & Actions Container */}
              <div className="flex items-center justify-between md:justify-end gap-10 w-full md:w-auto mt-6 md:mt-0">
                
                {/* Minimalist Role Badge */}
                <div className="text-right">
                   <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Authorization</p>
                   <p className={`text-xs font-black uppercase ${u.role !== 'User' ? 'text-[#358a74]' : 'text-slate-500'}`}>
                      {u.role}
                   </p>
                </div>

                {/* Cyber Action Buttons */}
                <div className="flex items-center gap-1">
                  {isSuperAdmin && u.role !== "Super Admin" ? (
                    <>
                      <button 
                        onClick={() => handleAction(u.role === "User" ? promoteUser : demoteUser, u.id, u.name)}
                        className={`w-11 h-11 flex items-center justify-center rounded-xl transition-all border ${
                          u.role === "User" 
                          ? "bg-white border-slate-100 text-[#358a74] hover:bg-[#358a74] hover:text-white" 
                          : "bg-white border-slate-100 text-amber-500 hover:bg-amber-500 hover:text-white"
                        }`}
                        title={u.role === "User" ? "Promote to Admin" : "Demote to User"}
                      >
                        {u.role === "User" ? <FaArrowUp size={14} /> : <FaArrowDown size={14} />}
                      </button>
                      
                      <button 
                        onClick={() => handleAction(deleteUser, u.id, u.name)}
                        className="w-11 h-11 flex items-center justify-center rounded-xl bg-white border border-slate-100 text-rose-400 hover:bg-rose-500 hover:text-white transition-all"
                        title="Permanently Delete"
                      >
                        <FaTrash size={14} />
                      </button>
                    </>
                  ) : (
                    <div className="w-11 h-11 flex items-center justify-center text-slate-200 opacity-0 group-hover:opacity-100 transition-opacity">
                       <FaUserShield size={18} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* --- Footer Status Line --- */}
      <div className="mt-24 pt-8 border-t border-slate-50 flex flex-col md:flex-row justify-between items-center gap-4 text-[9px] font-black text-slate-300 tracking-[0.4em] uppercase">
         <span>Secured Library Infrastructure</span>
         <span className="flex items-center gap-2">
           <span className="w-1 h-1 bg-[#358a74] rounded-full"></span>
           Live Feed Active
         </span>
      </div>
    </div>
  );
};

export default Users;