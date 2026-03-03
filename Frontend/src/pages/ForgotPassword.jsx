import React, { useEffect, useState } from "react";
import logo from "../assets/logo-green.png";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { forgotPassword, resetAuthSlice } from "../store/slices/authSlice";
import { FaEnvelope, FaArrowLeft } from "react-icons/fa";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const dispatch = useDispatch();
  const navigateTo = useNavigate();
  
  // Get auth state from Redux store
  const { loading, error, message, isAuthenticated } = useSelector(
    (state) => state.auth
  );

  // Form submission: request password reset link/OTP
  const handleForgotPassword = (e) => {
    e.preventDefault();
    dispatch(forgotPassword(email));
  };

  useEffect(() => {
    // On success: Navigate to reset page and pass the email via state
    if (message) {
      toast.success(message);
      dispatch(resetAuthSlice());
      navigateTo("/password/reset", { state: { email } });
    }
    // On error: Show toast and reset slice state
    if (error) {
      toast.error(error);
      dispatch(resetAuthSlice());
    }
  }, [dispatch, message, error, navigateTo, email]);

  // Prevent accessing this page if already logged in
  if (isAuthenticated) {
    return <Navigate to={"/"} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-lg p-8 relative">
        
        <Link 
          to={"/login"} 
          className="absolute top-6 left-6 text-gray-400 hover:text-gray-600 flex items-center gap-2 text-sm"
        >
          <FaArrowLeft />
          Back to Login
        </Link>

        <div className="flex flex-col items-center mt-10">
          <img src={logo} alt="logo" className="h-36 w-auto mb-6" />
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-3">
            Forgot Password?
          </h2>
          <p className="text-gray-500 text-center mb-8 text-sm">
            Enter your email address and we'll send you a code to reset your password.
          </p>
        </div>

        <form onSubmit={handleForgotPassword} className="space-y-4">
          {/* Email Input Field */}
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

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#358a74] text-white py-3 rounded-xl font-semibold hover:bg-[#2c7360] transition disabled:opacity-50"
          >
            {loading ? "Sending..." : "Send Reset Code"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;