import React from "react";
import adminIcon from "../assets/pointing.png";
import usersIcon from "../assets/people-black.png";
import bookIcon from "../assets/book-square.png";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  ArcElement,
} from "chart.js";
import logo from "../assets/black-logo.png";
import Header from "../layout/Header";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  ArcElement
);

const AdminDashboard = () => {
  return (
    <div className="w-full p-6 pt-20">
      <Header />
      <div className="flex flex-col items-center justify-center mt-16">
        <img src={logo} alt="logo" className="h-28 w-auto mb-8" />
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">
          Welcome, Admin
        </h1>
        <p className="text-gray-500 text-sm md:text-base text-center max-w-md">
          Manage Sci Library from the sidebar — oversee books, users, catalog,
          and admin settings.
        </p>
        <div className="flex gap-6 mt-10">
          <div className="flex flex-col items-center bg-white rounded-xl shadow-md p-6 w-40">
            <img src={bookIcon} alt="books" className="w-10 h-10 mb-3" />
            <span className="text-sm font-semibold text-gray-700">Books</span>
          </div>
          <div className="flex flex-col items-center bg-white rounded-xl shadow-md p-6 w-40">
            <img src={usersIcon} alt="users" className="w-10 h-10 mb-3" />
            <span className="text-sm font-semibold text-gray-700">Users</span>
          </div>
          <div className="flex flex-col items-center bg-white rounded-xl shadow-md p-6 w-40">
            <img src={adminIcon} alt="admin" className="w-10 h-10 mb-3" />
            <span className="text-sm font-semibold text-gray-700">Admins</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
