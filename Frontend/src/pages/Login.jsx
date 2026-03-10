import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { login, resetAuthSlice } from "../store/slices/authSlice";
import { FaEnvelope, FaLock, FaTimes } from "react-icons/fa";

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const dispatch = useDispatch(); 
  const navigateTo = useNavigate();
  
  // Extracting auth state from Redux
  const { loading, error, isAuthenticated } = useSelector((state) => state.auth);

  // Form submission handler
  const handleLogin = (e) => {
    e.preventDefault();
    dispatch(login({ email, password }));
  };

  useEffect(() => {
    // Redirect if already authenticated
    if (isAuthenticated) {
      navigateTo('/');
    }
    
    // Show error notifications
    if (error) {
      toast.error(error, {
        position: "bottom-right",
      });
      dispatch(resetAuthSlice());
    }
  }, [isAuthenticated, error, navigateTo, dispatch]);

  return (
    /* Modal Overlay: Closes when clicking outside the content */
    <div 
      className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4" 
      onClick={() => navigateTo("/")} 
    >
      
      {/* Modal Card */}
      <div 
        className="w-full max-w-md bg-white rounded-3xl shadow-lg p-8 relative"
        onClick={(e) => e.stopPropagation()} // Prevents closing when clicking inside
      >
        
        {/* Close Button */}
        <button 
          onClick={() => navigateTo("/")}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-50"
        >
          <FaTimes />
        </button>

        <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">
          Welcome Back
        </h2>
        
        <p className="text-gray-500 text-center mb-8 text-sm">
          Glad to see you again! Please log in to manage your library and track your activities.
        </p>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          
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

          {/* Forgot Password Link */}
          <div className="text-left">
            <Link to="/password/forgot" className="text-sm text-gray-500 hover:text-[#358a74]">
              Forgot Password ?
            </Link>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#358a74] text-white py-3 rounded-xl font-semibold hover:bg-[#2c7360] transition disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Registration Link */}
        <p className="text-center text-sm text-gray-600 mt-6">
          New user?{" "}
          <Link to="/register" className="text-[#358a74] font-semibold">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
