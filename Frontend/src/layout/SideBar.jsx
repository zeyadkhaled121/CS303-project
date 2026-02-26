import React, { useEffect } from "react";
import whiteLogo from "../assets/white-logo.png";
import logoutIcon from "../assets/logout.png";
import closeIcon from "../assets/white-close-icon.png";
import dashboardIcon from "../assets/element.png";
import bookIcon from "../assets/book.png";
import catalogIcon from "../assets/catalog.png";
import settingIcon from "../assets/setting-white.png";
import usersIcon from "../assets/people.png";
import AddNewAdmin from "../popups/AddNewAdmin";
import { RiAdminFill } from "react-icons/ri";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { logout, resetAuthSlice } from "../store/slices/authSlice";
import { toggleAddNewAdminPopup } from "../store/slices/popUpSlice";

const SideBar = ({ isSideBarOpen, setIsSideBarOpen, setSelectedComponent }) => {
  const dispatch = useDispatch();
  const { AddNewAdminPopup: isAddNewAdminOpen } = useSelector((state) => state.popup);
  // Extract auth state from Redux store
  const { loading, error, message, isAuthenticated, user } = useSelector(
    (state) => state.auth
  );

  // Function to handle user logout
  const handleLogout = () => {
    dispatch(logout());
  };

  // Effect to handle success/error notifications and state reset
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(resetAuthSlice());
    }
    if (message) {
      toast.success(message);
      dispatch(resetAuthSlice());
    }
  }, [dispatch, error, message]);

  return (
    <>
      {/* Sidebar Container: Responsive drawer with transition effects */}
      <aside
        className={`${
          isSideBarOpen ? "left-0" : "-left-full"
        } z-10 transition-all duration-700 md:fixed md:left-0 flex w-64 bg-black text-white flex-col h-full`}
        style={{ position: "fixed" }}
      >
        {/* Sidebar Header: Logo Section */}
        <div className="px-6 py-4 my-8 flex flex-col items-center">
          <img src={whiteLogo} alt="logo" className="w-20 mb-2" />
          <span className="text-xl font-bold tracking-wide">Sci</span>
          <span className="text-[10px] tracking-[0.3em] uppercase text-gray-400">Library</span>
        </div>

        {/* Navigation Section: Sidebar menu items */}
        <nav className="flex-1 px-6 space-y-2 overflow-y-auto">
          {/* Dashboard Link: Shared by all roles */}
          <button
            onClick={() => { setSelectedComponent("Dashboard"); setIsSideBarOpen(false); }}
            className="w-full py-2 font-medium hover:bg-zinc-800 rounded-md flex items-center space-x-2 transition-colors bg-transparent hover:cursor-pointer"
          >
            <img src={dashboardIcon} alt="dashboard" className="w-5" /> <span>Dashboard</span>
          </button>

          {/* Books Management Link */}
          <button
            onClick={() => { setSelectedComponent("Books"); setIsSideBarOpen(false); }}
            className="w-full py-2 font-medium hover:bg-zinc-800 rounded-md flex items-center space-x-2 transition-colors"
          >
            <img src={bookIcon} alt="books" className="w-5" /> <span>Books</span>
          </button>

          {/* Admin Restricted Routes */}
          {isAuthenticated && user?.role === "Admin" && (
            <>
              <button
                onClick={() => { setSelectedComponent("Catalog"); setIsSideBarOpen(false); }}
                className="w-full py-2 font-medium hover:bg-zinc-800 rounded-md flex items-center space-x-2 transition-colors"
              >
                <img src={catalogIcon} alt="catalog" className="w-5" /> <span>Catalog</span>
              </button>
              <button
                onClick={() => { setSelectedComponent("Users"); setIsSideBarOpen(false); }}
                className="w-full py-2 font-medium hover:bg-zinc-800 rounded-md flex items-center space-x-2 transition-colors"
              >
                <img src={usersIcon} alt="users" className="w-5" /> <span>Users</span>
              </button>
              <button
                className="w-full py-2 font-medium hover:bg-zinc-800 rounded-md flex items-center space-x-3 transition-colors"
                onClick={() => dispatch(toggleAddNewAdminPopup())}
              >
                <RiAdminFill className="w-6 h-5" /> <span>Add New Admin</span>
              </button>
            </>
          )}
          

          {/* User Restricted Routes */}
          {isAuthenticated && user?.role === "User" && (
            <button
              onClick={() => { setSelectedComponent("My Borrowed Books"); setIsSideBarOpen(false); }}
              className="w-full py-2 font-medium hover:bg-zinc-800 rounded-md flex items-center space-x-3 transition-colors"
            >
              <img src={catalogIcon} alt="borrowed" className="w-5" /> <span>My Borrowed Books</span>
            </button>
          )}

          {/* Settings Section */}
          <button
            className="w-full py-2 font-medium hover:bg-zinc-800 rounded-md flex items-center space-x-2 transition-colors"
          >
            <img src={settingIcon} alt="icon" className="w-5" /> <span>Update Credentials</span>
          </button>
        </nav>

        {/* Sidebar Footer: Logout Button */}
        <div className="px-6 py-6 border-t border-zinc-800">
          <button
            className="w-full py-2 font-medium text-red-400 hover:bg-zinc-800 rounded-md flex items-center justify-center space-x-3 transition-colors"
            onClick={handleLogout}
          >
            <img src={logoutIcon} alt="logout" className="w-5" /> <span>Log Out</span>
          </button>
        </div>

        {/* Mobile View: Close Sidebar Button */}
        <img
          src={closeIcon}
          alt="close"
          onClick={() => setIsSideBarOpen(false)}
          className="absolute top-4 right-4 cursor-pointer block md:hidden w-fit h-fit"
        />
      </aside>
      {isAddNewAdminOpen && <AddNewAdmin />}
    </>
  );
};

export default SideBar;