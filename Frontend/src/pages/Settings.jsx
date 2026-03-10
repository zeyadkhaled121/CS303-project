// src/pages/Settings.jsx
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

  // Auth guard: redirect to home if not authenticated (and not loading)
  if (!isAuthenticated && !loading) {
    return <Navigate to="/" replace />;
  }

  // Show loading state while user data is being fetched
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-gray-400">Loading...</p>
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

  // إعدادات الأدوار (كلها تعتمد الآن على اللون الأخضر #358a74)
  const rolesConfig = {
    "Super Admin": {
      title: "Super Admin Control",
      subtitle: "Full system authority and advanced configurations.",
      icon: <FaCogs className="text-[#358a74]" />,
      actionText: "Launch Admin Tools"
    },
    Admin: {
      title: "Admin Settings",
      subtitle: "Manage your administrative account and security.",
      icon: <FaShieldAlt className="text-[#358a74]" />,
      actionText: "Manage Users"
    },
    User: {
      title: "Account Settings",
      subtitle: "Update your profile and check your library status.",
      icon: <FaUser className="text-[#358a74]" />,
      actionText: "View History"
    }
  };

  const currentConfig = rolesConfig[user?.role] || rolesConfig.User;

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-4 animate-fadeIn">
      
      {/* Header Section */}
      <header>
        <h1 className="text-3xl font-extrabold text-gray-900 leading-tight">
          {currentConfig.title}
        </h1>
        <p className="text-gray-500 mt-2 font-medium">
          {currentConfig.subtitle}
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Profile Card */}
        <div className="md:col-span-1">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 flex flex-col items-center text-center shadow-sm">
            <div className="w-24 h-24 bg-[#358a74] text-white rounded-full flex items-center justify-center text-3xl font-bold mb-4 shadow-lg border-4 border-white">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <h3 className="text-xl font-bold text-gray-900">{user?.name}</h3>
            
            <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold mt-2 uppercase tracking-wider bg-emerald-100 text-[#358a74]">
              {currentConfig.icon} <span className="ml-1.5">{user?.role}</span>
            </span>
            
            <div className="w-full border-t border-gray-50 mt-6 pt-6 space-y-4 text-left">
              <div className="flex items-center gap-3 text-sm text-gray-600 font-medium">
                <FaEnvelope className="text-[#358a74] flex-shrink-0" />
                <span className="truncate">{user?.email}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Security Form - Always Green Theme */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-emerald-50 rounded-xl text-[#358a74]">
                <FaLock />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Security Credentials</h3>
            </div>

            <form onSubmit={handlePasswordUpdate} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">Current Password</label>
                <input
                  type="password"
                  required
                  value={passwordData.oldPassword}
                  className="w-full border border-gray-100 bg-gray-50/50 rounded-xl py-3 px-4 focus:ring-2 focus:ring-[#358a74]/20 focus:border-[#358a74] outline-none transition-all"
                  onChange={(e) => setPasswordData({...passwordData, oldPassword: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">New Password</label>
                  <input
                    type="password"
                    required
                    value={passwordData.newPassword}
                    className="w-full border border-gray-100 bg-gray-50/50 rounded-xl py-3 px-4 focus:ring-2 focus:ring-[#358a74]/20 focus:border-[#358a74] outline-none transition-all"
                    onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">Confirm New</label>
                  <input
                    type="password"
                    required
                    value={passwordData.confirmPassword}
                    className="w-full border border-gray-100 bg-gray-50/50 rounded-xl py-3 px-4 focus:ring-2 focus:ring-[#358a74]/20 focus:border-[#358a74] outline-none transition-all"
                    onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                  />
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto px-10 py-3.5 rounded-xl font-bold text-white bg-[#358a74] hover:bg-[#2c7360] shadow-md hover:shadow-lg transition-all disabled:opacity-50 active:scale-95"
                >
                  {loading ? "Updating.." : "Update Password"}
                </button>
              </div>
            </form>
          </div>


          {user?.role === "Super Admin" ? (
            /* SuperAdmin  */
            <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-3xl flex flex-col sm:flex-row justify-between items-center gap-4 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-white text-[#358a74] rounded-2xl shadow-sm">
                  <FaPlusCircle size={22} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-800">Admin Management</h4>
                  <p className="text-xs text-[#358a74] font-medium tracking-wide uppercase">Add or Remove System Managers</p>
                </div>
              </div>
              <button
                onClick={() => dispatch(toggleAddNewAdminPopup())}
                className="bg-[#358a74] text-white px-6 py-2.5 rounded-xl text-xs font-bold hover:bg-[#2c7360] transition-colors shadow-lg shadow-emerald-200"
              >
                Launch Tools
              </button>
            </div>
          ) : user?.role === "Admin" ? (
            /* Admin  */
            <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-3xl flex flex-col sm:flex-row justify-between items-center gap-4 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-white text-[#358a74] rounded-2xl shadow-sm">
                  <FaUsers size={22} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-800">Users Directory</h4>
                  <p className="text-xs text-[#358a74] font-medium tracking-wide uppercase">Member Records Access</p>
                </div>
              </div>
              <button
                onClick={() => { setSelectedComponent("AllUsers"); navigateTo('/'); }}
                className="bg-[#358a74] text-white px-6 py-2.5 rounded-xl text-xs font-bold hover:bg-[#2c7360] transition-colors shadow-lg shadow-emerald-200"
              >
                Manage Users
              </button>
            </div>
          ) : (
            /* User  */
            <div className={`p-6 rounded-3xl flex justify-between items-center shadow-sm border transition-colors duration-500
              ${user?.fines > 0 ? "bg-amber-50 border-amber-100" : "bg-emerald-50 border-emerald-100"}`}>
              <div className="flex items-center gap-4">
                <div className={`p-4 rounded-2xl shadow-sm bg-white ${user?.fines > 0 ? "text-amber-600" : "text-emerald-600"}`}>
                  <FaMoneyBillWave size={22} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-800 tracking-tight">Library Wallet</h4>
                  <p className={`text-xs font-bold uppercase ${user?.fines > 0 ? "text-amber-600" : "text-emerald-600"}`}>
                    {user?.fines > 0 ? "Outstanding balance detected" : "No pending liabilities"}
                  </p>
                </div>
              </div>
              <div className={`text-2xl font-black tabular-nums ${user?.fines > 0 ? "text-amber-600" : "text-emerald-600"}`}>
                ${user?.fines ? Number(user.fines).toFixed(2) : "0.00"}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Add New Admin Popup */}
      {AddNewAdminPopup && <AddNewAdmin />}
    </div>
  );
};

export default Settings;
