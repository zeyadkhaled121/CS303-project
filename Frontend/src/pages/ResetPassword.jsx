import React, { useEffect, useState } from "react";
import { Link, Navigate, useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/logo-green.png";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { resetPassword, resetAuthSlice } from "../store/slices/authSlice";
import { FaEnvelope, FaKey, FaLock, FaArrowLeft } from "react-icons/fa";

const ResetPassword = () => {
  const location = useLocation();
  const emailFromState = location.state?.email || "";

  const [email, setEmail] = useState(emailFromState);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const dispatch = useDispatch();
  const navigateTo = useNavigate();
  const { loading, error, message, isAuthenticated } = useSelector(
    (state) => state.auth
  );

  // Validation and Dispatching reset action
  const handleResetPassword = (e) => {
    e.preventDefault();
    if (newPassword.length < 8 || newPassword.length > 16) {
      toast.error("Password must be between 8 and 16 characters.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    dispatch(resetPassword({ email, otp, newPassword, confirmNewPassword }));
  };

  useEffect(() => {
    if (message) {
      toast.success(message);
      dispatch(resetAuthSlice());
      navigateTo("/login");
    }
    if (error) {
      toast.error(error);
      dispatch(resetAuthSlice());
    }
  }, [dispatch, message, error, navigateTo]);

  // Redirect if user is already logged in
  if (isAuthenticated) {
    return <Navigate to={"/"} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-lg p-8 relative">
        
        {/* Back Link */}
        <Link to={"/password/forgot"} className="absolute top-6 left-6 text-gray-400 hover:text-gray-600 flex items-center gap-2 text-sm">
          <FaArrowLeft />
          Back
        </Link>

        <div className="flex flex-col items-center mt-10">
          <img src={logo} alt="logo" className="h-36 w-auto mb-6" />
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-3">
            Reset Password
          </h2>
          <p className="text-gray-500 text-center mb-8 text-sm">
            Enter the OTP sent to your email and choose a new password.
          </p>
        </div>

        <form onSubmit={handleResetPassword} className="space-y-4">
          {/* Email Field */}
          <div className="relative">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email Address"
              className="w-full border border-gray-200 rounded-xl py-3 px-10 focus:outline-none focus:ring-1 focus:ring-[#358a74]"
              required
            />
            <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>

          {/* OTP Field */}
          <div className="relative">
            <input
              type="number"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Verification Code (OTP)"
              className="w-full border border-gray-200 rounded-xl py-3 px-10 focus:outline-none focus:ring-1 focus:ring-[#358a74]"
              required
            />
            <FaKey className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>

          {/* New Password Field */}
          <div className="relative">
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New Password"
              className="w-full border border-gray-200 rounded-xl py-3 px-10 focus:outline-none focus:ring-1 focus:ring-[#358a74]"
              required
            />
            <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>

          {/* Confirm Password Field */}
          <div className="relative">
            <input
              type="password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              placeholder="Confirm New Password"
              className="w-full border border-gray-200 rounded-xl py-3 px-10 focus:outline-none focus:ring-1 focus:ring-[#358a74]"
              required
            />
            <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#358a74] text-white py-3 rounded-xl font-semibold hover:bg-[#2c7360] transition disabled:opacity-50"
          >
            {loading ? "Updating..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;