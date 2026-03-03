import React, { useState, useRef, useEffect } from "react";
import { FaSearch, FaChevronDown, FaUserAlt, FaSignOutAlt } from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../store/slices/authSlice";
import logoImg from "../assets/logo.png";

const Header = () => {
  const dispatch = useDispatch();
  const navigateTo = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  // Accessing authentication state from Redux
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  // Close the user dropdown menu when clicking anywhere outside of it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle user logout and redirection
  const handleLogout = () => {
    dispatch(logout());
    setDropdownOpen(false);
    navigateTo("/login");
  };

  return (
    <header className="fixed top-0 left-0 w-full bg-[#358a74] py-3 px-6 flex items-center justify-between z-50 h-16 ">
      
      {/* Brand Logo Section */}
      <div className="flex items-center h-full">
        <div 
          className="cursor-pointer flex items-center transition-transform " 
          onClick={() => navigateTo("/")}
        >
          <img 
            src={logoImg} 
            alt="Logo" 
            className="h-20  w-auto object-contain  " 
         
          />
        </div>
      </div>

      {/* Search Bar Section */}
      <div className="flex-1 max-w-2xl mx-8">
        <form className="relative group">
          <input
            type="text"
            name="search"
            autoComplete="off"
            placeholder="Search for books, authors..."
            className="w-full h-11 text-white placeholder:text-emerald-100/70 bg-white/10 hover:bg-white/20 focus:bg-white/20 rounded-xl py-2 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all duration-300 border border-transparent focus:border-white/20"
          />
          <button type="submit" className="absolute left-4 top-1/2 -translate-y-1/2">
            <FaSearch className="text-white/70 group-hover:text-white transition-colors" />
          </button>
        </form>
      </div>

      {/* User Actions Section */}
      <div className="flex items-center gap-4">
        {isAuthenticated && user ? (
          <div className="relative" ref={dropdownRef}>
            {/* User Profile Button */}
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-3 bg-white/10 px-3 py-1.5 rounded-xl hover:bg-white/20 transition-all border border-white/10"
            >
              <div className="w-8 h-8 rounded-full bg-white text-[#358a74] flex items-center justify-center font-bold shadow-inner">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="text-left hidden lg:block">
                <div className="font-bold text-xs text-white leading-none">{user.name}</div>
                <div className="text-[10px] text-emerald-100 opacity-80">{user.role}</div>
              </div>
              <FaChevronDown className={`text-white/70 text-[10px] transition-transform duration-300 ${dropdownOpen ? "rotate-180" : "rotate-0"}`} />
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute top-full mt-2 right-0 w-52 bg-white rounded-2xl shadow-2xl py-2 z-50 border border-gray-100">
                <div className="px-4 py-2 border-b border-gray-50 mb-1">
                  <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Account</p>
                </div>
                <button
                  onClick={() => { setDropdownOpen(false); navigateTo("/profile"); }}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-emerald-50 hover:text-[#358a74] transition-colors"
                >
                  <FaUserAlt className="text-gray-400" />
                  Profile 
                </button>
                <div className="border-t border-gray-100 my-1"></div>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                >
                  <FaSignOutAlt className="mr-2" />
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Guest Access: Login and Registration buttons */
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigateTo("/login")}
              className="text-white text-sm font-bold px-6 py-2.5 hover:bg-white/10 transition-all rounded-lg border border-white/50"
            >
              Login
            </button>
            <button 
              onClick={() => navigateTo("/register")}
              className="bg-white text-[#358a74] text-sm font-bold px-6 py-2.5 rounded-lg hover:bg-emerald-50  transition-all "
            >
              Join Now
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;