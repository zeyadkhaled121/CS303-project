import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchAllUsers,
  promoteUser,
  demoteUser,
  deleteUser,
  resetUserSlice,
} from "../store/slices/userSlice";
import { toast } from "react-toastify";
import {
  FaUsers,
  FaArrowUp,
  FaArrowDown,
  FaTrash,
  FaShieldAlt,
  FaUser,
  FaUserShield,
} from "react-icons/fa";

const Users = ({ searchTerm = "" }) => {
  const dispatch = useDispatch();
  const { users, loading, error, message } = useSelector((state) => state.user);
  const { user: currentUser } = useSelector((state) => state.auth);

  const isSuperAdmin = currentUser?.role === "Super Admin";

  useEffect(() => {
    dispatch(fetchAllUsers());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(resetUserSlice());
    }
    if (message) {
      toast.success(message);
      dispatch(resetUserSlice());
      dispatch(fetchAllUsers());
    }
  }, [error, message, dispatch]);

  const handlePromote = (userId, name) => {
    if (window.confirm(`Promote "${name}" to Admin?`)) {
      dispatch(promoteUser(userId));
    }
  };

  const handleDemote = (userId, name) => {
    if (window.confirm(`Demote "${name}" to User?`)) {
      dispatch(demoteUser(userId));
    }
  };

  const handleDelete = (userId, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}"'s account? This cannot be undone.`)) {
      dispatch(deleteUser(userId));
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.role?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleIcon = (role) => {
    switch (role) {
      case "Super Admin":
        return <FaUserShield className="text-purple-500" />;
      case "Admin":
        return <FaShieldAlt className="text-[#358a74]" />;
      default:
        return <FaUser className="text-gray-400" />;
    }
  };

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case "Super Admin":
        return "bg-purple-50 text-purple-600";
      case "Admin":
        return "bg-emerald-50 text-[#358a74]";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FaUsers className="text-[#358a74]" />
            Users Management
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {isSuperAdmin
              ? "View and manage all system users and admins."
              : "View registered users in the system."}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className={`grid grid-cols-1 ${isSuperAdmin ? "sm:grid-cols-3" : "sm:grid-cols-2"} gap-4`}>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            {isSuperAdmin ? "Total Users" : "Total Registered Users"}
          </p>
          <p className="text-3xl font-black text-gray-900 mt-1">{users.length}</p>
        </div>
        {isSuperAdmin && (
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Admins</p>
            <p className="text-3xl font-black text-[#358a74] mt-1">
              {users.filter((u) => u.role === "Admin").length}
            </p>
          </div>
        )}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Regular Users</p>
          <p className="text-3xl font-black text-gray-900 mt-1">
            {users.filter((u) => u.role === "User").length}
          </p>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 text-gray-600 uppercase text-[11px] font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Role</th>
                {isSuperAdmin && <th className="px-6 py-4 text-center">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading && !users.length ? (
                <tr>
                  <td colSpan={isSuperAdmin ? 4 : 3} className="px-6 py-12 text-center text-gray-400">
                    Loading users...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={isSuperAdmin ? 4 : 3} className="px-6 py-12 text-center text-gray-400">
                    {searchTerm ? "No users match your search." : "No users found."}
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#358a74] text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                          {u.name?.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-semibold text-gray-800 text-sm">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{u.email}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${getRoleBadgeClass(
                          u.role
                        )}`}
                      >
                        {getRoleIcon(u.role)}
                        {u.role}
                      </span>
                    </td>
                    {isSuperAdmin && (
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          {u.role === "Super Admin" ? (
                            <span className="text-xs text-gray-400 italic">Protected</span>
                          ) : (
                            <>
                              {u.role === "User" && (
                                <button
                                  onClick={() => handlePromote(u.id, u.name)}
                                  className="p-2 rounded-lg hover:bg-emerald-50 text-gray-400 hover:text-[#358a74] transition-colors"
                                  title="Promote to Admin"
                                >
                                  <FaArrowUp size={14} />
                                </button>
                              )}
                              {u.role === "Admin" && (
                                <button
                                  onClick={() => handleDemote(u.id, u.name)}
                                  className="p-2 rounded-lg hover:bg-amber-50 text-gray-400 hover:text-amber-500 transition-colors"
                                  title="Demote to User"
                                >
                                  <FaArrowDown size={14} />
                                </button>
                              )}
                              <button
                                onClick={() => handleDelete(u.id, u.name)}
                                className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                                title="Delete User"
                              >
                                <FaTrash size={14} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Users;
