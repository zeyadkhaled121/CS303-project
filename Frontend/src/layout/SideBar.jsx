import React from "react";
import { FaAngleDoubleLeft, FaAngleDoubleRight, FaHome, FaBook, FaFolder, FaCog, FaSignOutAlt, FaUserPlus, FaUsers, FaBookOpen } from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../store/slices/authSlice";
import { toast } from 'react-toastify';

const SideBar = ({ isSideBarOpen, setIsSideBarOpen, setSelectedComponent, selectedComponent }) => {
  const dispatch = useDispatch();
  const navigateTo = useNavigate();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const handleItemClick = (item) => {
    setSelectedComponent(item.component); 
    if(item.name === "Settings") navigateTo("/settings");
    else navigateTo("/"); 
  };

  const handleLogout = () => {
    dispatch(logout());
    navigateTo("/login");
  };

  let menuItems = [{ name: "Dashboard", icon: <FaHome />, component: "Dashboard" }];

  if (isAuthenticated) {
    if (user?.role === "Admin" || user?.role === "SuperAdmin") {
      menuItems.push({ name: "Books", icon: <FaBookOpen />, component: "BookManagement" });
      menuItems.push({ name: "Users List", icon: <FaUsers />, component: "AllUsers" });
      if (user?.role === "Super Admin") {
        menuItems.push({ name: "Add Admin", icon: <FaUserPlus />, component: "CreateAdmin" });
      }
    } else {
      menuItems.push({ name: "Categories", icon: <FaBook />, component: "Books" });
      menuItems.push({ name: "My Library", icon: <FaFolder />, component: "MyBorrowedBooks" });
    }
    menuItems.push({ name: "Settings", icon: <FaCog />, component: "Settings" });
  }

  return (
    <aside className={`fixed left-0 top-16 h-[calc(100vh-64px)] bg-[#358a74] text-white flex flex-col z-40 transition-all duration-500 shadow-xl ${isSideBarOpen ? "w-64" : "w-20"}`}>
      <button onClick={() => setIsSideBarOpen(!isSideBarOpen)} className="absolute -right-5 top-1/2 bg-[#358a74] text-white p-1 rounded-md shadow-lg">
        {isSideBarOpen ? <FaAngleDoubleLeft /> : <FaAngleDoubleRight />}
      </button>
      
      <nav className="flex-1 px-3 space-y-3 pt-9">
        {menuItems.map((item, index) => (
          <button
            key={index}
            onClick={() => handleItemClick(item)}
            className={`w-full py-3 px-4 font-bold rounded-md flex items-center transition-all ${selectedComponent === item.component ? "bg-[#2c7360]" : "hover:bg-[#2c7360]"} ${isSideBarOpen ? "justify-start space-x-4" : "justify-center"}`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className={`${!isSideBarOpen && "hidden"}`}>{item.name}</span>
          </button>
        ))}
      </nav>
      
      {isAuthenticated && (
        <div className="p-3 border-t border-white/20">
          <button onClick={handleLogout} className={`w-full py-3 px-4 rounded-md flex items-center hover:bg-[#2c7360] transition-all ${isSideBarOpen ? "justify-start space-x-4" : "justify-center"}`}>
            <FaSignOutAlt />
            <span className={`${!isSideBarOpen && "hidden"} font-bold ml-4`}>Logout</span>
          </button>
        </div>
      )}
    </aside>
  );
};

export default SideBar;