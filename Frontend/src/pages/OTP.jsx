import React, { useEffect, useState } from "react";
import logo from "../assets/logo-green.png";
import { useParams, Link, Navigate, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { otpVerification, resetAuthSlice } from "../store/slices/authSlice";
import { FaArrowLeft, FaKey } from "react-icons/fa";

const OTP = () => {
  const { email } = useParams();
  const [otp, setOtp] = useState("");
  const dispatch = useDispatch();
  const navigateTo = useNavigate();
  
  // Extract state from auth slice
  const { loading, error, message, isAuthenticated } = useSelector(
    (state) => state.auth
  );

  // Verification handler
  const handleOtpVerification = (e) => {
    e.preventDefault();
    dispatch(otpVerification(email, otp));
  };

  useEffect(() => {
    // Navigate to login on successful verification
    if (message) {
      toast.success(message);
      dispatch(resetAuthSlice());
      navigateTo("/login");
    }
    // Clear errors and notify user
    if (error) {
      toast.error(error);
      dispatch(resetAuthSlice());
    }
  }, [dispatch, message, error, navigateTo]);

  // If already logged in, redirect to home
  if (isAuthenticated) {
    return <Navigate to={"/"} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-lg p-8 relative">
        
        <Link to={"/login"} className="absolute top-6 left-6 text-gray-400 hover:text-gray-600 flex items-center gap-2 text-sm">
          <FaArrowLeft />
          Back
        </Link>

        <div className="flex flex-col items-center mt-10">
          <img src={logo} alt="logo" className="h-36 w-auto mb-6" />
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-3">
            Email Verification
          </h2>
          <p className="text-gray-500 text-center mb-8 text-sm">
            Please enter the 6-digit OTP sent to your email address to continue.
          </p>
        </div>

        <form onSubmit={handleOtpVerification} className="space-y-4">
          {/* OTP Input Field */}
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

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#358a74] text-white py-3 rounded-xl font-semibold hover:bg-[#2c7360] transition disabled:opacity-50"
          >
            {loading ? "Verifying..." : "Verify Code"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default OTP;