import React from "react";
import { 
  FaAngleDoubleLeft, FaAngleDoubleRight, FaHome, FaBook, 
  FaFolder, FaCog, FaSignOutAlt, FaUserPlus, FaUsers, 
  FaHandHolding, FaChartPie 
} from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../store/slices/authSlice";
import { toggleAddNewAdminPopup } from "../store/slices/popUpSlice";

const SideBar = ({ isSideBarOpen, setIsSideBarOpen, setSelectedComponent, selectedComponent }) => {
  const dispatch = useDispatch();
  const navigateTo = useNavigate();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  // 1. Menu logic based on roles
  let menuItems = [
    { name: "Home", icon: <FaHome />, component: "Dashboard" },
    { name: "Categories", icon: <FaBook />, component: "Books" },
  ];

  if (isAuthenticated) {
    if (user?.role === "Admin" || user?.role === "Super Admin") {
      menuItems.push({ name: "System Stats", icon: <FaChartPie />, component: "Stats" });
      menuItems.push({ name: "Loan Management", icon: <FaHandHolding />, component: "BookManagement" });
      menuItems.push({ name: "Users List", icon: <FaUsers />, component: "AllUsers" });
      if (user?.role === "Super Admin") {
        menuItems.push({ name: "Add Admin", icon: <FaUserPlus />, component: "CreateAdmin" });
      }
    } else {
      menuItems.push({ name: "My Library", icon: <FaFolder />, component: "My Borrowed Books" });
    }
    menuItems.push({ name: "Settings", icon: <FaCog />, component: "Settings" });
  }

  const handleItemClick = (item) => {
    if (item.component === "CreateAdmin") {
      dispatch(toggleAddNewAdminPopup());
      return;
    }
    setSelectedComponent(item.component);
    if(item.name === "Settings") navigateTo("/settings");
    else navigateTo("/");
  };

  return (
    <aside className={`fixed left-0 top-16 h-[calc(100vh-64px)] bg-[#358a74] text-white flex flex-col z-40 transition-all duration-500 shadow-xl ${isSideBarOpen ? "w-64" : "w-20"}`}>
      <button onClick={() => setIsSideBarOpen(!isSideBarOpen)} className="absolute -right-5 top-1/2 -translate-y-1/2 bg-[#358a74] text-white py-6 px-1 rounded-md shadow-lg opacity-0 hover:opacity-100 transition-opacity">
        {isSideBarOpen ? <FaAngleDoubleLeft /> : <FaAngleDoubleRight />}
      </button>
      
      <nav className="flex-1 px-3 space-y-3 pt-9 overflow-y-auto">
        {menuItems.map((item, index) => (
          <button
            key={index}
            onClick={() => handleItemClick(item)}
            className={`w-full py-3.5 px-4 font-bold text-sm rounded-xl flex items-center transition-all
              ${selectedComponent === item.component ? "bg-[#2c7360] shadow-inner" : "hover:bg-[#2c7360]"}
              ${isSideBarOpen ? "justify-start gap-4" : "justify-center"}`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className={`${!isSideBarOpen && "hidden"} whitespace-nowrap`}>{item.name}</span>
          </button>
        ))}
      </nav>

      {isAuthenticated && (
        <div className="p-4 border-t border-white/10">
          <button onClick={() => { dispatch(logout()); navigateTo("/login"); }} className={`w-full py-3 px-4 rounded-xl flex items-center hover:bg-[#2c7360] transition-all ${isSideBarOpen ? "justify-start gap-4" : "justify-center"}`}>
            <FaSignOutAlt className="text-xl" />
            <span className={`${!isSideBarOpen && "hidden"} font-bold`}>Logout</span>
          </button>
        </div>
      )}
    </aside>
  );
};

export default SideBar;