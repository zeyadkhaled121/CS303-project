import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link, Navigate } from "react-router-dom";
import { toast } from "react-toastify";
import { register, resetAuthSlice } from "../store/slices/authSlice";
import { FaUser, FaEnvelope, FaLock, FaTimes } from "react-icons/fa";

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const dispatch = useDispatch();
  const { loading, error, message, isAuthenticated } = useSelector(
    (state) => state.auth
  );
  const navigateTo = useNavigate();

  // Handle registration form submission
  const handleRegister = (e) => {
    e.preventDefault();
    dispatch(register({ name, email, password }));
  };

  useEffect(() => {
    // Handle success message
    if (message) {
      toast.success(message, {
        position: "bottom-right",
      });
      dispatch(resetAuthSlice());
      navigateTo(`/otp-verification/${email}`);
    }
    
    // Handle error messages
    if (error) {
      toast.error(error, {
        position: "bottom-right",
      });
      dispatch(resetAuthSlice());
    }
  }, [dispatch, error, message, navigateTo, email]);

  if (isAuthenticated) {
    return <Navigate to={"/"} />;
  }

  return (
    <div 
      className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50" 
      onClick={() => navigateTo("/")}
    >
      
      {/* Modal Content Box */}
      <div 
        className="w-full max-w-md bg-white rounded-3xl shadow-lg p-8 relative m-4"
        onClick={(e) => e.stopPropagation()} // Prevent modal close when clicking inside
      >
        
        {/* Close Button */}
        <button 
          onClick={() => navigateTo("/")}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-50"
        >
          <FaTimes />
        </button>

        <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">
          Create Account
        </h2>
        
        <p className="text-gray-500 text-center mb-8 text-sm">
          Join us to enjoy all features and track your activities.
        </p>

        {/* Registration Form */}
        <form onSubmit={handleRegister} className="space-y-4">
          
          {/* Full Name Input */}
          <div className="relative">
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-200 rounded-xl py-3 px-10 focus:outline-none focus:ring-1 focus:ring-[#358a74]"
              required
            />
            <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>

          {/* Email Input */}
          <div className="relative">
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-200 rounded-xl py-3 px-10 focus:outline-none focus:ring-1 focus:ring-[#358a74]"
              required
            />
            <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>

          {/* Password Input */}
          <div className="relative">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
            {loading ? "Creating Account..." : "Register Now"}
          </button>
        </form>

        {/* Login Link */}
        <p className="text-center text-sm text-gray-600 mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-[#358a74] font-semibold">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;