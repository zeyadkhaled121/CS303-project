import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import OTP from './pages/OTP';
import ResetPassword from './pages/ResetPassword';
import Settings from './pages/Settings'; 
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getUser } from "./store/slices/authSlice";

import SideBar from "./layout/SideBar";
import Header from "./layout/Header";

const App = () => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);

  // State to manage Sidebar collapse/expand status
  const [isSideBarOpen, setIsSideBarOpen] = useState(true);
  
  // State to track which component should be rendered in the main view
  const [selectedComponent, setSelectedComponent] = useState("Dashboard");

  // State to track the search term from the Header search bar
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch user profile on initial load to restore session from cookies
  useEffect(() => {
    dispatch(getUser());
  }, [dispatch]);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        
        <Header isSideBarOpen={isSideBarOpen} setIsSideBarOpen={setIsSideBarOpen} setSelectedComponent={setSelectedComponent} selectedComponent={selectedComponent} searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        
        <div className="flex flex-1 pt-16"> 
          
          {/* Sidebar: only show when authenticated */}
          {isAuthenticated && (
            <SideBar 
              isSideBarOpen={isSideBarOpen} 
              setIsSideBarOpen={setIsSideBarOpen}
              setSelectedComponent={setSelectedComponent}
              selectedComponent={selectedComponent}
            />
          )}
          
          <main className={`transition-all duration-300 flex-1 
                            ${isAuthenticated && isSideBarOpen ? "ml-64" : isAuthenticated ? "ml-20" : "ml-0"}`}>
            <div className="p-6">
              <Routes>
                <Route path="/" element={<Home selectedComponent={selectedComponent} searchTerm={searchTerm} />}>
                    <Route path="login" element={<Login />} />
                    <Route path="register" element={<Register />} />
                </Route>
                
                {/* Authentication & Security Routes */}
                <Route path="/password/forgot" element={<ForgotPassword />} />
                <Route path="/otp-verification/:email" element={<OTP />} />
                <Route path="/password/reset" element={<ResetPassword />} />
                
                <Route path="/settings" element={<Settings setSelectedComponent={setSelectedComponent} />} />
              </Routes>
            </div>
          </main>
        </div>
        
        {/* Global Toast Notifications */}
        <ToastContainer 
          theme="colored" 
          position="top-right" 
          rtl={false} 
        />
      </div>
    </Router>
  );
};

export default App;
