import React from "react";
import { 
  FaAngleDoubleLeft, 
  FaAngleDoubleRight, 
  FaHome, 
  FaBook, 
  FaFolder, 
  FaCog, 
  FaSignOutAlt,
  FaUserPlus, 
  FaUsers   
} from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../store/slices/authSlice";
import { toggleAddNewAdminPopup } from "../store/slices/popUpSlice";
import { toast } from 'react-toastify';

const SideBar = ({ isSideBarOpen, setIsSideBarOpen, setSelectedComponent, selectedComponent }) => {
  const dispatch = useDispatch();
  const navigateTo = useNavigate();
  
  // Get authentication and user role from Redux
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  // 1. Common items for everyone
  const commonItems = [
    { name: "Home", icon: <FaHome />, component: "Dashboard" },
    { name: "Categories", icon: <FaBook />, component: "Books" },
  ];

  // 2. Build the menu dynamically based on roles
  let menuItems = [...commonItems];

  if (isAuthenticated) {
    // Check if the user is ANY type of Admin (Admin or SuperAdmin)
    if (user?.role === "Admin" || user?.role === "Super Admin") {
      // Both Admin and Super Admin can see the Users List
      menuItems.push({ name: "Users List", icon: <FaUsers />, component: "AllUsers" });

      // ONLY Super Admin can see the "Add Admin" option
      if (user?.role === "Super Admin") {
        menuItems.push({ name: "Add Admin", icon: <FaUserPlus />, component: "CreateAdmin" });
      }
    } else {
      // Regular User items
      menuItems.push({ name: "My Library", icon: <FaFolder />, component: "My Borrowed Books" });
    }

    // Settings is for everyone logged in
    menuItems.push({ name: "Settings", icon: <FaCog />, component: "Settings" });
  }

  const handleItemClick = (item) => {
    if (item.component === "CreateAdmin") {
      // Open AddNewAdmin popup directly instead of routing through selectedComponent
      dispatch(toggleAddNewAdminPopup());
      return;
    }
    setSelectedComponent(item.component);
    if(item.name === "Settings") navigateTo("/settings");
    else navigateTo("/");
  };

  const handleLogout = () => {
    dispatch(logout());
    navigateTo("/login");
  };

  return (
    <aside
      className={`group fixed left-0 top-16 h-[calc(100vh-64px)] bg-[#358a74] text-white flex flex-col z-40 
                  transition-all duration-500 ease-in-out shadow-xl
                  ${isSideBarOpen ? "w-64" : "w-20"}`}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsSideBarOpen(!isSideBarOpen)}
        className="absolute -right-5 top-1/2 -translate-y-1/2 bg-[#358a74] text-white
                   py-6 px-1 rounded-md shadow-lg z-50 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        {isSideBarOpen ? <FaAngleDoubleLeft /> : <FaAngleDoubleRight />}
      </button>
      
      {/* Nav List */}
      <nav className="flex-1 px-3 space-y-3 overflow-y-auto pt-9">
        {menuItems.map((item, index) => (
          <button
            key={index}
            onClick={() => handleItemClick(item)}
            className={`w-full py-3 px-4 font-bold text-base rounded-md flex items-center transition-all
                        ${selectedComponent === item.component ? "bg-[#2c7360]" : "hover:bg-[#2c7360]"}
                        ${isSideBarOpen ? "justify-start space-x-4" : "justify-center"}`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className={`text-base whitespace-nowrap ${!isSideBarOpen && "hidden"}`}>
              {item.name}
            </span>
          </button>
        ))}
      </nav>
      
      {/* Logout */}
      {isAuthenticated && (
        <div className="p-3 border-t border-white/20">
          <button
            onClick={handleLogout}
            className={`w-full py-3 px-4 rounded-md flex items-center hover:bg-[#2c7360] transition-all
                        ${isSideBarOpen ? "justify-start space-x-4" : "justify-center"}`}
          >
            <span className="text-xl"><FaSignOutAlt /></span>
            <span className={`text-base font-bold ${!isSideBarOpen && "hidden"}`}>Logout</span>
          </button>
        </div>
      )}
    </aside>
  );
};

export default SideBar;
