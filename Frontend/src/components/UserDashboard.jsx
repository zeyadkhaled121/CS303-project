import React from "react";

import returnIcon from "../assets/redo.png";
import browseIcon from "../assets/pointing.png";
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

const UserDashboard = () => {
  return (
    <div className="w-full p-6 pt-20">
      <Header />
      <div className="flex flex-col items-center justify-center mt-16">
        <img src={logo} alt="logo" className="h-28 w-auto mb-8" />
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">
          Welcome to Sci Library
        </h1>
        <p className="text-gray-500 text-sm md:text-base text-center max-w-md">
          Browse and borrow books from the sidebar. Happy reading!
        </p>
        <div className="flex gap-6 mt-10">
          <div className="flex flex-col items-center bg-white rounded-xl shadow-md p-6 w-44">
            <img src={bookIcon} alt="books" className="w-10 h-10 mb-3" />
            <span className="text-sm font-semibold text-gray-700">Browse Books</span>
          </div>
          <div className="flex flex-col items-center bg-white rounded-xl shadow-md p-6 w-44">
            <img src={returnIcon} alt="return" className="w-10 h-10 mb-3" />
            <span className="text-sm font-semibold text-gray-700">My Returns</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
