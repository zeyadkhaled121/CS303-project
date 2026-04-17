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
import { fetchAllBooks } from "./store/slices/bookSlice";
import UserProfile from "./components/UserProfile";
import BorrowRequests from "./components/BorrowRequests";
import ProtectedRoute from "./components/ProtectedRoute";
import AppErrorBoundary from "./components/AppErrorBoundary";

const App = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const [isSideBarOpen, setIsSideBarOpen] = useState(true);
  const [selectedComponent, setSelectedComponent] = useState(() => {
    return sessionStorage.getItem("selectedComponent") || "Dashboard";
  });
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    sessionStorage.setItem("selectedComponent", selectedComponent);
  }, [selectedComponent]);


  useEffect(() => {
    if (user && user._id) {
      const sessionUser = sessionStorage.getItem("loggedUserId");
      const sessionRole = sessionStorage.getItem("loggedUserRole");
      
      // Only reset the view if this is actually a DIFFERENT user logging in
      // or if their role was just changed dynamically.
      if (sessionUser && (sessionUser !== user._id || sessionRole !== user.role)) {
        setSelectedComponent("Dashboard");
        setSearchTerm("");
      }
      
      sessionStorage.setItem("loggedUserId", user._id);
      sessionStorage.setItem("loggedUserRole", user.role);
    }
  }, [user]); 

  useEffect(() => {
    dispatch(getUser());
    dispatch(fetchAllBooks());
  }, [dispatch]);

  return (
    <AppErrorBoundary>
      <Router>
        <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans">
        
        <Header 
          isSideBarOpen={isSideBarOpen} 
          setIsSideBarOpen={setIsSideBarOpen} 
          setSelectedComponent={setSelectedComponent} 
          selectedComponent={selectedComponent} 
          searchTerm={searchTerm} 
          setSearchTerm={setSearchTerm} 
        />
        
        <div className="flex flex-1 pt-16 relative"> 
          
          {isAuthenticated && (
            <SideBar 
              isSideBarOpen={isSideBarOpen} 
              setIsSideBarOpen={setIsSideBarOpen}
              setSelectedComponent={setSelectedComponent}
              selectedComponent={selectedComponent}
            />
          )}
          
          <main className={`transition-all duration-500 ease-in-out flex-1 
            ${isAuthenticated && isSideBarOpen ? "md:ml-64" : isAuthenticated ? "md:ml-20" : "ml-0"}`}>
            
            <div className="w-full h-full min-h-[calc(100vh-64px)]">
              <Routes>
                <Route path="/" element={<Home selectedComponent={selectedComponent} searchTerm={searchTerm}  setSelectedComponent={setSelectedComponent}/>}>
                    <Route path="login" element={<Login />} />
                    <Route path="register" element={<Register />} />
                </Route>

                <Route path="/password/forgot" element={<ForgotPassword />} />
                <Route path="/otp-verification/:email" element={<OTP />} />
                <Route path="/password/reset" element={<ResetPassword />} />
                
                {/* Protected Routes (All Authenticated Users) */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/settings" element={<Settings setSelectedComponent={setSelectedComponent} />} />
                </Route>

                {/* Admin Only Routes */}
                <Route element={<ProtectedRoute allowedRoles={["Admin", "Super Admin"]} />}>
                  <Route path="/user-profile/:userId" element={<UserProfile />} />
                  <Route path="/borrow-requests" element={<BorrowRequests />} />
                </Route>
              </Routes>
            </div>
          </main>
        </div>
        
        <ToastContainer 
          theme="colored" 
          position="bottom-right" 
          toastStyle={{ backgroundColor: "#358a74" }}
          rtl={false} 
        />
        </div>
      </Router>
    </AppErrorBoundary>
  );
};

export default App;