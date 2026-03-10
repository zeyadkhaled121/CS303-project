import { useState } from "react";
import { useDispatch } from "react-redux";
import { toggleAddNewAdminPopup } from "../store/slices/popUpSlice";
import { FaTimes, FaUserShield, FaUser, FaEnvelope, FaLock, FaKey } from "react-icons/fa";
import { toast } from "react-toastify";
import api from "../api/axios";

const AddNewAdmin = () => {
  const dispatch = useDispatch();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [adminSecret, setAdminSecret] = useState("");
  const [loading, setLoading] = useState(false);

  const handleClose = () => dispatch(toggleAddNewAdminPopup());

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 8 || password.length > 16) {
      toast.error("Password must be between 8 and 16 characters.");
      return;
    }
    setLoading(true);
    try {
      const res = await api.post("/api/v1/user/register", {
        name,
        email,
        password,
        adminSecret,
      });
      // تم تعديل الرسالة هنا عشان تناسب الباك إند الجديد
      toast.success(res.data.message || "Admin registered and verified successfully!");
      handleClose();
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to register admin."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-50"
        >
          <FaTimes size={18} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-emerald-50 rounded-xl text-[#358a74]">
            <FaUserShield size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Add New Admin</h2>
            <p className="text-xs text-gray-500">
              Register a new administrator account.
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div className="relative">
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full border border-gray-100 bg-gray-50/50 rounded-xl py-3 pl-11 pr-4 focus:ring-2 focus:ring-[#358a74]/20 focus:border-[#358a74] outline-none transition-all"
            />
            <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>

          {/* Email */}
          <div className="relative">
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border border-gray-100 bg-gray-50/50 rounded-xl py-3 pl-11 pr-4 focus:ring-2 focus:ring-[#358a74]/20 focus:border-[#358a74] outline-none transition-all"
            />
            <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>

          {/* Password */}
          <div className="relative">
            <input
              type="password"
              placeholder="Password (8–16 chars)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full border border-gray-100 bg-gray-50/50 rounded-xl py-3 pl-11 pr-4 focus:ring-2 focus:ring-[#358a74]/20 focus:border-[#358a74] outline-none transition-all"
            />
            <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>

          {/* Admin Secret Key */}
          <div className="relative">
            <input
              type="password"
              placeholder="Admin Secret Key"
              value={adminSecret}
              onChange={(e) => setAdminSecret(e.target.value)}
              required
              className="w-full border border-gray-100 bg-gray-50/50 rounded-xl py-3 pl-11 pr-4 focus:ring-2 focus:ring-[#358a74]/20 focus:border-[#358a74] outline-none transition-all"
            />
            <FaKey className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>

          {/* تم تعديل الرسالة دي */}
          <p className="text-[11px] text-gray-400">
            The new admin account will be verified automatically and is ready for login.
          </p>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl font-bold text-white bg-[#358a74] hover:bg-[#2c7360] shadow-md hover:shadow-lg transition-all disabled:opacity-50 active:scale-95"
          >
            {loading ? "Registering..." : "Register Admin"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddNewAdmin;