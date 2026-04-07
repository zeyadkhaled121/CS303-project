import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import {
  FaSearch,
  FaChevronDown,
  FaUserAlt,
  FaSignOutAlt,
  FaBell,
  FaInbox,
  FaCheckCircle,
  FaExclamationTriangle,
  FaInfoCircle,
  FaArrowRight,
  FaTimes,
} from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { logout } from "../store/slices/authSlice";
import { throttle } from "../utils/debounce";
import api from "../api/axios";
import logoImg from "../assets/logo.png";

const Header = ({ setSelectedComponent, searchTerm, setSearchTerm }) => {
  const dispatch = useDispatch();
  const navigateTo = useNavigate();
  const location = useLocation();
  
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notiOpen, setNotiOpen] = useState(false);
  
  const dropdownRef = useRef(null);
  const notiRef = useRef(null);
  const eventSourceRef = useRef(null);
  
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  // Notifications State for User and Admin
  const [realNotifications, setRealNotifications] = useState([]);
  const [unreadNotiCount, setUnreadNotiCount] = useState(0);
  const [livePopups, setLivePopups] = useState([]);

  const seenNotificationIdsRef = useRef(new Set());
  const initializedNotificationsRef = useRef(false);
  const popupTimeoutsRef = useRef(new Map());

  const clearPopupTimer = useCallback((notificationId) => {
    const timeoutId = popupTimeoutsRef.current.get(notificationId);
    if (timeoutId) {
      clearTimeout(timeoutId);
      popupTimeoutsRef.current.delete(notificationId);
    }
  }, []);

  const dismissLivePopup = useCallback((notificationId) => {
    clearPopupTimer(notificationId);
    setLivePopups((prev) => prev.filter((popup) => popup._id !== notificationId));
  }, [clearPopupTimer]);

  const getNotificationTimeMs = useCallback((value) => {
    if (!value) return Date.now();
    if (typeof value === "object" && value._seconds) {
      return value._seconds * 1000;
    }
    const parsed = new Date(value).getTime();
    return Number.isNaN(parsed) ? Date.now() : parsed;
  }, []);

  const formatNotificationTime = useCallback((value) => {
    return new Date(getNotificationTimeMs(value)).toLocaleString();
  }, [getNotificationTimeMs]);

  const getNotificationTone = (item) => {
    const severity = String(item?.severity || "info").toLowerCase();
    const type = String(item?.type || "").toUpperCase();

    if (
      severity === "warning" ||
      severity === "alert" ||
      type.includes("REJECT") ||
      type.includes("ISSUE") ||
      type.includes("OVERDUE")
    ) {
      return {
        icon: <FaExclamationTriangle size={12} />,
        iconClass: "bg-rose-50 text-rose-600 ring-1 ring-rose-100",
        badgeClass: "bg-rose-50 text-rose-700",
      };
    }

    if (
      severity === "success" ||
      type.includes("APPROVED") ||
      type.includes("RETURNED") ||
      type.includes("RECORDED")
    ) {
      return {
        icon: <FaCheckCircle size={12} />,
        iconClass: "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100",
        badgeClass: "bg-emerald-50 text-emerald-700",
      };
    }

    return {
      icon: <FaInfoCircle size={12} />,
      iconClass: "bg-sky-50 text-sky-600 ring-1 ring-sky-100",
      badgeClass: "bg-sky-50 text-sky-700",
    };
  };

  const spawnLivePopup = useCallback((notification) => {
    if (!notification?._id || notification.read) return;

    setLivePopups((prev) => {
      if (prev.some((popup) => popup._id === notification._id)) {
        return prev;
      }
      return [notification, ...prev].slice(0, 3);
    });

    clearPopupTimer(notification._id);
    const timeoutId = setTimeout(() => {
      dismissLivePopup(notification._id);
    }, 8000);
    popupTimeoutsRef.current.set(notification._id, timeoutId);
  }, [clearPopupTimer, dismissLivePopup]);

  const pushIncomingNotification = useCallback((notification) => {
    if (!notification?._id) return;

    const alreadyKnown = seenNotificationIdsRef.current.has(notification._id);
    seenNotificationIdsRef.current.add(notification._id);

    setRealNotifications((prev) => {
      const withoutDuplicate = prev.filter((item) => item._id !== notification._id);
      return [notification, ...withoutDuplicate].slice(0, 30);
    });

    if (!alreadyKnown && !notification.read) {
      setUnreadNotiCount((prev) => prev + 1);
      spawnLivePopup(notification);
    }
  }, [spawnLivePopup]);

  const fetchNotifications = useCallback(async (options = {}) => {
    const { showIncomingPopup = false } = options;

    try {
      const res = await api.get("/api/v1/notifications");
      if (res.data?.success) {
        const newNotifs = res.data.data.notifications || [];
        const newCount = res.data.data.unreadCount || 0;

        setRealNotifications((prev) => (
          JSON.stringify(prev) === JSON.stringify(newNotifs) ? prev : newNotifs
        ));
        setUnreadNotiCount((prev) => (prev === newCount ? prev : newCount));

        if (!initializedNotificationsRef.current) {
          initializedNotificationsRef.current = true;
          newNotifs.forEach((item) => {
            if (item?._id) {
              seenNotificationIdsRef.current.add(item._id);
            }
          });
          return;
        }

        const freshNotifications = [];
        newNotifs.forEach((item) => {
          if (!item?._id) return;
          const isKnown = seenNotificationIdsRef.current.has(item._id);
          if (!isKnown && !item.read) {
            freshNotifications.push(item);
          }
          seenNotificationIdsRef.current.add(item._id);
        });

        if (showIncomingPopup && freshNotifications.length > 0) {
          freshNotifications.slice(0, 2).forEach((item) => spawnLivePopup(item));
        }
      }
    } catch (e) {
      console.error("Failed to fetch notifications", e);
    }
  }, [spawnLivePopup]);

  const buildNotificationStreamUrl = () => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || window.location.origin;
    return `${baseUrl}/api/v1/notifications/stream`;
  };

  useEffect(() => {
    if (!isAuthenticated || !user) {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }

      popupTimeoutsRef.current.forEach((timeoutId) => clearTimeout(timeoutId));
      popupTimeoutsRef.current.clear();
      initializedNotificationsRef.current = false;
      seenNotificationIdsRef.current = new Set();
      setLivePopups([]);
      setRealNotifications([]);
      setUnreadNotiCount(0);
      return;
    }

    let fallbackInterval = null;
    let reconcileInterval = null;

    const connectToNotificationStream = () => {
      fetchNotifications({ showIncomingPopup: false });

      // Safety net: reconcile notification list frequently even when SSE is connected.
      // This avoids missed updates when network intermediaries drop events silently.
      reconcileInterval = setInterval(() => {
        fetchNotifications({ showIncomingPopup: true });
      }, 4000);

      try {
        const stream = new EventSource(buildNotificationStreamUrl(), {
          withCredentials: true
        });

        eventSourceRef.current = stream;

        stream.addEventListener("connected", () => {
          if (fallbackInterval) {
            clearInterval(fallbackInterval);
            fallbackInterval = null;
          }
        });

        stream.addEventListener("notification_changed", (event) => {
          let payload = {};
          try {
            payload = JSON.parse(event?.data || "{}");
          } catch {
            payload = {};
          }

          if (payload?.reason === "created" && payload?.notification?._id) {
            pushIncomingNotification(payload.notification);
            return;
          }

          fetchNotifications({ showIncomingPopup: false });
        });

        stream.onerror = () => {
          if (!fallbackInterval) {
            fallbackInterval = setInterval(() => {
              fetchNotifications({ showIncomingPopup: true });
            }, 5000);
          }
        };
      } catch (error) {
        console.error("Notification stream failed, fallback polling enabled", error);
        if (!fallbackInterval) {
          fallbackInterval = setInterval(() => {
            fetchNotifications({ showIncomingPopup: true });
          }, 5000);
        }
      }
    };

    connectToNotificationStream();

    return () => {
      if (fallbackInterval) {
        clearInterval(fallbackInterval);
      }
      if (reconcileInterval) {
        clearInterval(reconcileInterval);
      }
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [isAuthenticated, user, fetchNotifications, pushIncomingNotification]);

  useEffect(() => {
    const popupTimeouts = popupTimeoutsRef.current;

    return () => {
      popupTimeouts.forEach((timeoutId) => clearTimeout(timeoutId));
      popupTimeouts.clear();
    };
  }, []);

  const markAsRead = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      await api.put(`/api/v1/notifications/${id}/read`);
      fetchNotifications({ showIncomingPopup: false });
    } catch (err) {
      console.error("Failed to mark notification as read", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/api/v1/notifications/read-all');
      fetchNotifications({ showIncomingPopup: false });
    } catch (err) {
      console.error("Failed to mark all notifications as read", err);
    }
  };

  const deleteNotification = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      await api.delete(`/api/v1/notifications/${id}`);
      fetchNotifications({ showIncomingPopup: false });
    } catch (err) {
      console.error("Failed to delete notification", err);
    }
  };


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (notiRef.current && !notiRef.current.contains(event.target)) {
        setNotiOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    setDropdownOpen(false);
    navigateTo("/");
  };

  // Throttle notification toggles to prevent rapid double-triggering.
  const throttledNotiClick = useMemo(() => {
    return throttle(() => {
      setNotiOpen((prev) => !prev);
    }, 300);
  }, []);

  const throttledDropdownClick = useMemo(() => {
    return throttle(() => {
      setDropdownOpen((prev) => !prev);
    }, 300);
  }, []);

  const handleNotificationNavigation = useCallback((item) => {
    if (!item?.actionUrl) return;

    setNotiOpen(false);

    if (item.actionUrl === "/borrow/all" || item.actionUrl === "/my-borrowings") {
      setSelectedComponent(user?.role === "User" ? "My Borrowed Books" : "BorrowRequests");
    }

    if (item.actionUrl === "/borrow-requests" || item.actionUrl === "/admin/borrowLogistics") {
      setSelectedComponent("BorrowRequests");
    }

    navigateTo(
      item.actionUrl === "/borrow/all" ||
      item.actionUrl === "/my-borrowings" ||
      item.actionUrl === "/admin/borrowLogistics"
        ? "/"
        : item.actionUrl
    );
  }, [navigateTo, setSelectedComponent, user?.role]);

  const handleNotificationClick = (item) => {
    if (!item) return;
    if (!item.read) {
      markAsRead(item._id, { stopPropagation: () => {} });
    }
    handleNotificationNavigation(item);
  };

  const viewerRoleLabel = user?.role === "Super Admin"
    ? "Super Admin Console"
    : user?.role === "Admin"
      ? "Admin Console"
      : "Member Portal";

  return (
    <>
      <header className="fixed top-0 left-0 w-full bg-[#358a74] py-3 px-8 flex items-center justify-between z-50 h-20 shadow-2xl font-sans">
      
      {/* --- Logo Section --- */}
      <div className="flex items-center h-full">
        <div 
          className="cursor-pointer flex items-center group" 
          onClick={() => { setSelectedComponent("Dashboard"); navigateTo("/"); }}
        >
          <img src={logoImg} alt="Library Logo" className="h-16 w-auto object-contain group-hover:scale-105 transition-transform duration-500" />
        </div>
      </div>

      {/* --- Search Bar Section --- */}
      <div className={`flex-1 max-w-xl mx-12 ${location.pathname === "/settings" ? "invisible" : ""}`}>
        <div className="relative group">
          <input
            type="text"
            placeholder="Search assets, records..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-12 text-[13px] font-medium text-white placeholder:text-emerald-100/50 bg-white/10 hover:bg-white/15 focus:bg-white/20 rounded-2xl py-2 pl-12 pr-4 focus:outline-none focus:ring-1 focus:ring-white/30 transition-all duration-500 border border-white/5"
          />
          <FaSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-white transition-colors" size={14} />
        </div>
      </div>

      {/* --- Actions Section --- */}
      <div className="flex items-center gap-4">
        {isAuthenticated && user ? (
          <>
            {/* UNIFIED NOTIFICATION HUB */}
              <div className="relative" ref={notiRef}>
                <button
                  onClick={throttledNotiClick}
                  className={`p-3 rounded-2xl transition-all duration-500 relative ${notiOpen ? "bg-white text-[#358a74] shadow-lg" : "hover:bg-white/10 text-white"}`}
                >
                  <FaBell size={20} />
                  {unreadNotiCount > 0 && (
                    <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-rose-500 border-2 border-[#358a74] rounded-full animate-pulse shadow-sm"></span>
                  )}
                </button>

                {/* Dropdown Menu */}
                {notiOpen && (
                  <div className="absolute top-full mt-4 right-0 w-[400px] bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] py-2 z-50 border border-emerald-50 overflow-hidden animate-fadeIn">
                    <div className="px-8 py-6 border-b border-gray-50 flex justify-between items-center bg-emerald-50/20">
                      <div>
                        <h3 className="font-black text-[10px] uppercase tracking-[0.2em] text-gray-400">Notifications</h3>
                        <p className="text-[9px] text-emerald-600 font-bold mt-0.5">Recent updates</p>
                      </div>
                      <div className="flex gap-2 items-center">
                        {unreadNotiCount > 0 && (
                          <button onClick={markAllAsRead} className="text-[9px] font-bold text-[#358a74] hover:underline uppercase tracking-wide">
                            Mark all read
                          </button>
                        )}
                        <span className="bg-[#358a74] text-white text-[10px] px-3 py-1 rounded-full font-black">
                          {unreadNotiCount}
                        </span>
                      </div>
                    </div>

                    <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                      {realNotifications.length === 0 ? (
                        <div className="p-12 text-center flex flex-col items-center gap-4">
                          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
                            <FaInbox size={24} />
                          </div>
                          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">
                            No Notifications
                          </p>
                        </div>
                      ) : (
                        realNotifications.map((item) => (
                          <div
                            key={item._id}
                            onClick={() => handleNotificationClick(item)}
                            className={`p-6 border-b border-gray-50 hover:bg-emerald-50/50 cursor-pointer transition-all flex flex-col gap-2 group ${!item.read ? 'bg-emerald-50/20' : ''}`}
                          >
                            <div className="flex justify-between items-start w-full">
                              <p className="text-[12px] font-black text-gray-800 leading-tight pr-4">
                                {item.message}
                              </p>
                              {!item.read && <div className="w-2 h-2 rounded-full bg-[#358a74] mt-1 shrink-0" />}
                            </div>
                            <div className="flex justify-between items-center mt-2">
                              <span className="text-[10px] font-bold text-gray-400">
                                {formatNotificationTime(item.createdAt)}
                              </span>
                              <div className="flex gap-3">
                                {!item.read && (
                                  <button onClick={(e) => markAsRead(item._id, e)} className="text-[10px] text-[#358a74] font-bold hover:underline">
                                    Mark Read
                                  </button>
                                )}
                                <button onClick={(e) => deleteNotification(item._id, e)} className="text-[10px] text-rose-500 font-bold hover:underline">
                                  Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

            {/* PROFILE MENU */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={throttledDropdownClick}
                className="flex items-center gap-3 bg-white/10 px-4 py-2 rounded-2xl hover:bg-white/20 transition-all border border-white/5"
              >
                <div className="w-9 h-9 rounded-xl bg-white text-[#358a74] flex items-center justify-center font-black shadow-lg uppercase text-sm">
                  {user.name?.charAt(0)}
                </div>
                <div className="text-left hidden xl:block">
                  <div className="font-black text-[11px] text-white leading-none uppercase tracking-wider">{user.name}</div>
                  <div className="text-[9px] text-emerald-100/60 font-bold mt-1 uppercase tracking-widest">{user.role}</div>
                </div>
                <FaChevronDown className={`text-white/40 text-[10px] transition-transform duration-500 ${dropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {dropdownOpen && (
                <div className="absolute top-full mt-4 right-0 w-60 bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] py-3 z-50 border border-gray-100 animate-fadeIn overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-50 mb-2 text-left">
                    <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Account</p>
                    <p className="text-xs font-bold text-gray-700 truncate mt-1">{user.email}</p>
                  </div>
                  <button
                    onClick={() => { setDropdownOpen(false); navigateTo("/settings"); }}
                    className="flex w-full items-center gap-4 px-6 py-3 text-[11px] font-bold text-gray-600 hover:bg-emerald-50 hover:text-[#358a74] transition-all uppercase tracking-widest"
                  >
                    <FaUserAlt size={12} className="opacity-30" /> Profile Settings
                  </button>
                  <div className="h-[1px] bg-gray-50 mx-4 my-2"></div>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-4 px-6 py-3 text-[11px] font-bold text-rose-500 hover:bg-rose-50 transition-all uppercase tracking-widest"
                  >
                    <FaSignOutAlt size={12} /> Log out
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          /* GUEST VIEW */
          <div className="flex items-center gap-4">
            <button onClick={() => navigateTo("/login")} className="text-white text-[11px] font-black uppercase tracking-widest px-6 py-3 hover:bg-white/10 transition-all rounded-xl border border-white/20">
              Sign In
            </button>
            <button onClick={() => navigateTo("/register")} className="bg-white text-[#358a74] text-[11px] font-black uppercase tracking-widest px-6 py-3 rounded-xl hover:shadow-xl hover:-translate-y-0.5 transition-all">
              Register
            </button>
          </div>
        )}
      </div>
    </header>

      {isAuthenticated && livePopups.length > 0 && (
        <div className="fixed top-24 right-6 z-[90] flex w-[380px] max-w-[calc(100vw-1.5rem)] flex-col gap-3">
          {livePopups.map((item) => {
            const tone = getNotificationTone(item);
            return (
              <div key={item._id} className="notification-popup-card notification-popup-enter">
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />
                <div className="flex items-start gap-3 p-4 pt-5">
                  <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${tone.iconClass}`}>
                    {tone.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <p className="truncate text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">
                        {item.title || "New Notification"}
                      </p>
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${tone.badgeClass}`}>
                        {viewerRoleLabel}
                      </span>
                    </div>
                    <p className="text-[13px] font-bold leading-snug text-slate-800">
                      {item.message || "You have a new update."}
                    </p>
                    <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                      {formatNotificationTime(item.createdAt)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => dismissLivePopup(item._id)}
                    className="rounded-lg p-1.5 text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-600"
                    aria-label="Dismiss notification popup"
                  >
                    <FaTimes size={11} />
                  </button>
                </div>

                {item.actionUrl && (
                  <div className="px-4 pb-4">
                    <button
                      type="button"
                      onClick={() => {
                        if (!item.read) {
                          markAsRead(item._id);
                        }
                        dismissLivePopup(item._id);
                        handleNotificationNavigation(item);
                      }}
                      className="notification-popup-action"
                    >
                      Open Details <FaArrowRight size={10} />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
};

export default Header;

