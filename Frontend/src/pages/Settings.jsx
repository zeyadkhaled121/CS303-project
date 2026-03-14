import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Navigate, useNavigate } from "react-router-dom";
import { 
  FaUser, FaLock, FaEnvelope, FaShieldAlt, 
  FaMoneyBillWave, FaUsers, FaPlusCircle, FaCogs 
} from "react-icons/fa";
import { updatePassword, resetAuthSlice } from "../store/slices/authSlice";
import { toggleAddNewAdminPopup } from "../store/slices/popUpSlice";
import AddNewAdmin from "../popups/AddNewAdmin";
import { toast } from "react-toastify";

const Settings = ({ setSelectedComponent }) => {
  const dispatch = useDispatch();
  const navigateTo = useNavigate();
  
  const { user, loading, error, message, isAuthenticated } = useSelector((state) => state.auth);
  const { AddNewAdminPopup } = useSelector((state) => state.popup);

  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(resetAuthSlice());
    }
    if (message) {
      toast.success(message);
      dispatch(resetAuthSlice());
      setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "" });
    }
  }, [error, message, dispatch]);

  if (!isAuthenticated && !loading) {
    return <Navigate to="/" replace />;
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-gray-400 animate-pulse">Loading System Settings...</p>
      </div>
    );
  }

  const handlePasswordUpdate = (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return toast.warn("New passwords do not match!");
    }
    dispatch(updatePassword({
      oldPassword: passwordData.oldPassword,
      newPassword: passwordData.newPassword,
      confirmNewPassword: passwordData.confirmPassword,
    }));
  };

  const rolesConfig = {
    "Super Admin": {
      title: "Super Admin Control",
      subtitle: "Full system authority and advanced configurations.",
      icon: <FaCogs />,
      actionText: "Launch Tools"
    },
    Admin: {
      title: "Admin Settings",
      subtitle: "Manage your administrative account and security.",
      icon: <FaShieldAlt />,
      actionText: "Manage Users"
    },
    User: {
      title: "Account Settings",
      subtitle: "Update your profile and check your library status.",
      icon: <FaUser />,
      actionText: "View History"
    }
  };

  const currentConfig = rolesConfig[user?.role] || rolesConfig.User;

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-10 animate-fadeIn space-y-10">
      
      {/* Header Section */}
      <header className="mb-10">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">
          {currentConfig.title}
        </h1>
        <p className="text-slate-500 mt-2 font-medium">
          {currentConfig.subtitle}
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        
        {/* Left Column: Profile Card */}
        <div className="md:col-span-1">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 flex flex-col items-center text-center shadow-sm">
            <div className="w-24 h-24 bg-[#358a74] text-white rounded-full flex items-center justify-center text-3xl font-bold mb-6 shadow-lg border-4 border-white transition-transform hover:scale-105">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            
            <h3 className="text-xl font-black text-slate-800 tracking-tight">{user?.name}</h3>
            
            <span className="inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-black mt-3 uppercase tracking-widest bg-emerald-50 text-[#358a74] border border-emerald-100">
              <span className="mr-2 opacity-70">{currentConfig.icon}</span> {user?.role}
            </span>
            
            <div className="w-full border-t border-slate-50 mt-8 pt-8 space-y-4">
              <div className="flex items-center justify-center gap-3 text-sm text-slate-600 font-bold">
                <FaEnvelope className="text-[#358a74] flex-shrink-0 opacity-60" />
                <span className="truncate max-w-[150px] italic lowercase">{user?.email}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Content */}
        <div className="md:col-span-2 space-y-8">
          
          {/* Security Form */}
          <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-sm border border-slate-100">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3.5 bg-emerald-50 rounded-2xl text-[#358a74]">
                <FaLock size={20} />
              </div>
              <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Security Credentials</h3>
            </div>

            <form onSubmit={handlePasswordUpdate} className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest ml-1">Current Password</label>
                <input
                  type="password"
                  required
                  value={passwordData.oldPassword}
                  className="w-full border border-slate-100 bg-slate-50/50 rounded-2xl py-3.5 px-5 focus:ring-4 focus:ring-[#358a74]/5 focus:border-[#358a74] outline-none transition-all font-bold"
                  onChange={(e) => setPasswordData({...passwordData, oldPassword: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest ml-1">New Password</label>
                  <input
                    type="password"
                    required
                    value={passwordData.newPassword}
                    className="w-full border border-slate-100 bg-slate-50/50 rounded-2xl py-3.5 px-5 focus:ring-4 focus:ring-[#358a74]/5 focus:border-[#358a74] outline-none transition-all font-bold"
                    onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest ml-1">Confirm New</label>
                  <input
                    type="password"
                    required
                    value={passwordData.confirmPassword}
                    className="w-full border border-slate-100 bg-slate-50/50 rounded-2xl py-3.5 px-5 focus:ring-4 focus:ring-[#358a74]/5 focus:border-[#358a74] outline-none transition-all font-bold"
                    onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                  />
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto px-12 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest text-white bg-[#358a74] hover:bg-[#2c7360] shadow-xl shadow-emerald-900/10 transition-all disabled:opacity-50 active:scale-95"
                >
                  {loading ? "Syncing.." : "Update Password"}
                </button>
              </div>
            </form>
          </div>

          {/* Role-Based Actions */}
          <div className="mt-8">
            {user?.role === "Super Admin" ? (
              <div className="bg-emerald-50 border border-emerald-100 p-8 rounded-[2.5rem] flex flex-col sm:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-5">
                  <div className="p-4 bg-white text-[#358a74] rounded-2xl shadow-sm border border-emerald-50">
                    <FaPlusCircle size={24} />
                  </div>
                  <div>
                    <h4 className="font-black text-slate-800 uppercase tracking-tight text-lg">Admin Management</h4>
                    <p className="text-[10px] text-[#358a74] font-black uppercase tracking-widest">Authority Control</p>
                  </div>
                </div>
                <button
                  onClick={() => dispatch(toggleAddNewAdminPopup())}
                  className="bg-[#358a74] text-white px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 transition-all shadow-lg shadow-emerald-200"
                >
                  {currentConfig.actionText}
                </button>
              </div>
            ) : user?.role === "Admin" ? (
              <div className="bg-emerald-50 border border-emerald-100 p-8 rounded-[2.5rem] flex flex-col sm:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-5">
                  <div className="p-4 bg-white text-[#358a74] rounded-2xl shadow-sm border border-emerald-50">
                    <FaUsers size={24} />
                  </div>
                  <div>
                    <h4 className="font-black text-slate-800 uppercase tracking-tight text-lg">Users Directory</h4>
                    <p className="text-[10px] text-[#358a74] font-black uppercase tracking-widest">Record Management</p>
                  </div>
                </div>
                <button
                  onClick={() => { setSelectedComponent("AllUsers"); navigateTo('/'); }}
                  className="bg-[#358a74] text-white px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 transition-all shadow-lg shadow-emerald-200"
                >
                  {currentConfig.actionText}
                </button>
              </div>
            ) : (
              <div className={`p-8 rounded-[2.5rem] flex justify-between items-center shadow-sm border transition-all duration-500
                ${user?.fines > 0 ? "bg-amber-50 border-amber-100" : "bg-emerald-50 border-emerald-100"}`}>
                <div className="flex items-center gap-5">
                  <div className={`p-4 rounded-2xl shadow-sm bg-white ${user?.fines > 0 ? "text-amber-600 border-amber-50" : "text-[#358a74] border-emerald-50"} border`}>
                    <FaMoneyBillWave size={24} />
                  </div>
                  <div>
                    <h4 className="font-black text-slate-800 uppercase tracking-tight text-lg italic">Library Wallet</h4>
                    <p className={`text-[10px] font-black uppercase tracking-widest ${user?.fines > 0 ? "text-amber-600" : "text-[#358a74]"}`}>
                      {user?.fines > 0 ? "Pending Dues Found" : "Account Clear"}
                    </p>
                  </div>
                </div>
                <div className={`text-3xl font-black italic tracking-tighter tabular-nums ${user?.fines > 0 ? "text-amber-600" : "text-[#358a74]"}`}>
                  ${user?.fines ? Number(user.fines).toFixed(2) : "0.00"}
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Popup */}
      {AddNewAdminPopup && <AddNewAdmin />}
    </div>
  );
};

export default Settings;