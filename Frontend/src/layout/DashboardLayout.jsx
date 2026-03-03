import React from "react";
import { useSelector } from "react-redux";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./SideBar";
import Header from "./Header";
import Login from "../pages/Login";
import Register from "../pages/Register";

const DashboardLayout = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const location = useLocation();

  // Check current path to determine which modal to render
  const isRegister = location.pathname === "/register";

  return (
    /* Main wrapper */
    <div className="flex h-screen overflow-hidden bg-[#f4f7f6]">
      

      <Sidebar />

      <div className="flex flex-col flex-1 overflow-hidden relative">
        
        {/* 2. Header}
        <Header />

        {/* 3. Main Content: 
            - Blurred and non-interactive if not authenticated
        */}
        <main className={`flex-1 overflow-y-auto p-6 mt-16 transition-all duration-500 ${!isAuthenticated ? "blur-[2px] pointer-events-none opacity-80" : ""}`}>
          <Outlet />
        </main>

        {/* 4. Overlay & Auth Modal: Visible only if not authenticated */}
        {!isAuthenticated && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-[1px]">
            <div className="w-full max-w-md animate-slideUp">
               {isRegister ? <Register /> : <Login />}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardLayout;