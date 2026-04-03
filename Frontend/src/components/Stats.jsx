import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getBorrowStats } from "../store/slices/borrowSlice";
// Chart components for visual representation
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from "recharts";
// UI Icons
import { 
  FaBook, FaUsers, FaHandHolding, FaChartLine, 
  FaHistory, FaStar 
} from "react-icons/fa";

const Stats = ({ setSelectedComponent }) => {
  const dispatch = useDispatch();
  const { books } = useSelector((state) => state.book);
  const { allUsers } = useSelector((state) => state.auth);
  const [stats, setStats] = useState({
    totalPending: 0,
    totalBorrowed: 0,
    totalOverdue: 0,
    totalReturned: 0,
    totalBooks: 0,
    totalUsers: 0,
  });

  // Fetch statistics from backend
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const result = await dispatch(getBorrowStats());
        if (result?.ok && result?.data) {
          setStats(result.data);
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error);
        // Continue with Redux data as fallback
      }
    };

    fetchStats();
  }, [dispatch]);

  // 1. Core Calculations for Info Cards
  // Calculate total physical copies if redux state has the books array, otherwise fallback to the unique book count
  const totalPhysicalCopies = books?.length > 0 
    ? books.reduce((sum, book) => sum + (Number(book.totalCopies) || 1), 0) 
    : stats.totalBooks || 0;

  const totalBooks = stats.totalBooks || books?.length || 0;
  const activeLoans = stats.totalBorrowed || 0;
  // Loan rate reflects the percentage of physical copies currently checked out
  const loanRate = totalPhysicalCopies > 0 ? ((activeLoans / totalPhysicalCopies) * 100).toFixed(1) : 0;
  const totalUsers = stats.totalUsers || allUsers?.length || 0;
  const returnedTotal = stats.totalReturned || 0;

  // 2. Dynamic Genre Analysis for the Bar Chart
  const getGenreData = () => {
    const counts = {};
    books.forEach(book => {
      const genre = book.genre || "Other";
      counts[genre] = (counts[genre] || 0) + 1;
    });
    // Convert object to array format required by Recharts
    return Object.keys(counts).map(key => ({ name: key, count: counts[key] }));
  };

  // 3. Loan Status Data for the Pie Chart
  const loanStatusData = [
    { name: "Borrowed", value: activeLoans },
    { name: "Available", value: Math.max(0, totalPhysicalCopies - activeLoans) },
  ];

  // Professional color palette: [Primary Emerald, Light Gray]
  const COLORS = ["#358a74", "#f1f5f9"];

  return (
    <div className="p-4 md:p-8 pt-24 max-w-7xl mx-auto space-y-8 bg-[#f8fafc] min-h-screen">
      
      {/* Upper Header: Dashboard Identity */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-8 rounded-[3rem] shadow-sm border border-gray-100">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tighter flex items-center gap-3">
            Library Analytics 
            <span className="text-xs bg-emerald-100 text-[#358a74] px-3 py-1 rounded-full uppercase tracking-widest animate-pulse">
              Live
            </span>
          </h2>
          <p className="text-gray-400 font-medium mt-1">Operational overview of inventory and user engagement.</p>
        </div>
        <div className="flex gap-4">
            <div className="text-right">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Loan Rate</p>
                <p className="text-2xl font-black text-[#358a74]">{loanRate}%</p>
            </div>
            <div className="w-[2px] h-10 bg-gray-100 mx-2"></div>
            <div className="text-right">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Members</p>
                <p className="text-2xl font-black text-gray-800">{totalUsers}</p>
            </div>
        </div>
      </div>

      {/* Main Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Total Books", val: totalBooks, icon: <FaBook />, color: "text-[#358a74]", bg: "bg-emerald-50" },
          { label: "Active Loans", val: activeLoans, icon: <FaHandHolding />, color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Total Users", val: totalUsers, icon: <FaUsers />, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Returned Items", val: returnedTotal, icon: <FaHistory />, color: "text-purple-600", bg: "bg-purple-50" },
        ].map((item, i) => (
          <div key={i} className="bg-white p-6 rounded-[2.5rem] shadow-sm hover:shadow-md transition-all border border-gray-50 group">
            <div className="flex justify-between items-start mb-4">
                <div className={`${item.bg} ${item.color} p-4 rounded-2xl group-hover:scale-110 transition-transform`}>
                    {item.icon}
                </div>
            </div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{item.label}</p>
            <h4 className="text-3xl font-black text-gray-800">{item.val}</h4>
          </div>
        ))}
      </div>

      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Genre Distribution Bar Chart */}
        <div className="lg:col-span-2 bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-10">
            <div>
                <h4 className="font-black text-gray-800 flex items-center gap-2">Genre Popularity</h4>
                <p className="text-xs text-gray-400">Inventory volume categorized by book genre</p>
            </div>
            <FaChartLine className="text-gray-200" size={24} />
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={getGenreData()}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#94a3b8'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}} 
                  contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'}} 
                />
                <Bar dataKey="count" fill="#358a74" radius={[12, 12, 12, 12]} barSize={35} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Availability Pie Chart */}
        <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100 flex flex-col items-center">
            <div className="w-full mb-6">
                <h4 className="font-black text-gray-800">Library Status</h4>
                <p className="text-xs text-gray-400">Ratio of available vs currently borrowed books</p>
            </div>
            <div className="h-64 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={loanStatusData}
                            innerRadius={75}
                            outerRadius={95}
                            paddingAngle={15}
                            dataKey="value"
                            stroke="none"
                        >
                            {loanStatusData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                    </PieChart>
                </ResponsiveContainer>
                {/* Visual indicator in the center of the donut chart */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                    <p className="text-2xl font-black text-gray-800">{loanRate}%</p>
                    <p className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter">Borrowed</p>
                </div>
            </div>
            {/* Custom Legend for clarity */}
            <div className="w-full space-y-3 mt-4">
                <div className="flex justify-between items-center text-xs font-bold">
                    <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#358a74]"></span> Borrowed</div>
                    <span className="text-gray-400">{activeLoans} Books</span>
                </div>
                <div className="flex justify-between items-center text-xs font-bold">
                    <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-gray-200"></span> Available</div>
                    <span className="text-gray-400">{Math.max(0, totalPhysicalCopies - activeLoans)} Books</span>
                </div>
            </div>
        </div>

      </div>

      {/* Suggestion Card for Administrators */}
      <div className="bg-[#358a74] p-10 rounded-[3rem] shadow-xl shadow-emerald-900/10 text-white flex flex-col md:flex-row items-center gap-10">
        <div className="bg-white/10 p-6 rounded-full">
            <FaStar size={40} className="text-amber-300" />
        </div>
        <div className="flex-1">
            <h3 className="text-xl font-black mb-1">Inventory Insight</h3>
            <p className="opacity-80 text-sm">
                Based on current activity, your collection is performing well. 
                Keep track of "Active Loans" to ensure timely returns and maintain high book availability for all members.
            </p>
        </div>
     <button 
    onClick={() => {
      setSelectedComponent("BookManagement"); 
      window.scrollTo(0, 0); 
    }}
    className="bg-white text-[#358a74] px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-50 transition-all"
  >
      Open Management
  </button>
      </div>
    </div>
  );
};

export default Stats;