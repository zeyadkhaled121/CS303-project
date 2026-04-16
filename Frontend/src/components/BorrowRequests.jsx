
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  FaCheck,
  FaTimes,
  FaSearch,
  FaCalendarDay,
  FaClock,
  FaUndoAlt,
  FaBook,
  FaExclamationTriangle,
} from "react-icons/fa";
import { ImSpinner2 } from "react-icons/im";
import {
  fetchAllBorrowedBooks,
  approveBorrow,
  rejectBorrow,
  returnBook,
  reportIssue,
} from "../store/slices/borrowSlice";
import {
  extractUserName,
} from "../utils/dataShapeNormalizer";
import {
  notifyError,
} from "../utils/toastNotificationManager";
import { EmptyState, TableLoadingRow } from "./UITemplates";
import ReportIssuePopup from "../popups/ReportIssuePopup";
import ApproveRequestPopup from "../popups/ApproveRequestPopup";
import RejectRequestPopup from "../popups/RejectRequestPopup";
import ReturnConfirmPopup from "../popups/ReturnConfirmPopup";

const BorrowRequestsV2 = ({ searchTerm = "" }) => {
  const dispatch = useDispatch();
  const { allBorrowedBooks, loading } = useSelector(
    (state) => state.borrow
  );
  const { books } = useSelector((state) => state.book);
  const [filterStatus, setFilterStatus] = useState("Active");
  const [localSearch, setLocalSearch] = useState("");
  const [processingId, setProcessingId] = useState(null);
  const [reportIssueOpen, setReportIssueOpen] = useState(false);
  const [selectedBorrowRecord, setSelectedBorrowRecord] = useState(null);
  const [approvePopupOpen, setApprovePopupOpen] = useState(false);
  const [itemToApprove, setItemToApprove] = useState(null);
  const [rejectPopupOpen, setRejectPopupOpen] = useState(false);
  const [itemToReject, setItemToReject] = useState(null);
  const [returnPopupOpen, setReturnPopupOpen] = useState(false);
  const [itemToReturn, setItemToReturn] = useState(null);

  useEffect(() => {
    dispatch(fetchAllBorrowedBooks());
  }, [dispatch]);

  // Safe extraction of full book object from global state
  const getFullBookDetails = (item) => {
    if (!books || books.length === 0) return null;
    const bookId = item?.book_id || item?.bookId || item?.book?._id;
    return books.find(b => b._id === bookId || b.id === bookId) || null;
  };

  // Safe extraction of book image
  const getBookImage = (item, fullBook) => {
    return (
      item?.bookImage?.url ||
      item?.bookImage ||
      fullBook?.image?.url ||
      fullBook?.imageUrl ||
      item?.book?.image?.url ||
      item?.bookId?.image?.url ||
      null
    );
  };

  // Safe extraction of book title across multiple payload shapes
  const getBookTitle = (item) => {
    return (
      item?.book?.title ||
      item?.bookId?.title ||
      item?.book_title ||
      item?.book?.name || item?.bookTitle ||
      "Unknown Title"
    );
  };

  // Safe extraction of user name across multiple payload shapes
  const getUserName = (item) => {
    return (
      item?.user?.name ||
      item?.userId?.name ||
      item?.user_name ||
      item?.userName || item?.user?.name ||
      extractUserName(item) ||
      "Unknown User"
    );
  };

  // Safe extraction of user role
  const getUserRole = (item) => {
    return item?.user?.role || item?.userId?.role || item?.user_role || "User";
  };

    // Safe extraction of user email
    const getUserEmail = (item) => {
      return item?.user?.email || item?.userId?.email || item?.userEmail || item?.email || "No Email Provided";
    };

    // Safe extraction of user avatar initial
    const getUserInitial = (item) => {
      const name = getUserName(item);
      return name.charAt(0).toUpperCase();
    };

  // Safe due date extraction and status calculation
const getDueDateStatus = (dueDate, requestDate) => {
      if (!dueDate) return { text: "Pending Appro", color: "text-amber-500", durationString: "" };

      try {
        let target;
        if (dueDate && dueDate._seconds) {
          target = new Date(dueDate._seconds * 1000);
        } else {
          target = new Date(dueDate);
        }

        let start;
        if (requestDate && requestDate._seconds) {
          start = new Date(requestDate._seconds * 1000);
        } else if (requestDate) {
          start = new Date(requestDate);
        } else {
          start = new Date();
        }

        const today = new Date();

        if (Number.isNaN(target.getTime())) {
          return { text: "Invalid Date", color: "text-rose-500", durationString: "" };
        }

        const diffTime = target - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        const totalDurationDays = Math.ceil((target - start) / (1000 * 60 * 60 * 24));
        const durationString = totalDurationDays > 0 ? `(${totalDurationDays} Days Total)` : "";

        if (diffDays < 0) {
          return {
            text: `Overdue by ${Math.abs(diffDays)} days`,
            color: "text-rose-800 font-black",
            durationString
          };
        }
        if (diffDays <= 2) {
          return {
            text: `Due in ${diffDays} days`,
            color: "text-amber-800 font-bold",
            durationString
          };
        }
        return { text: target.toLocaleDateString(), color: "text-slate-500 font-medium", durationString };
      } catch (e) {
        console.error("Date parse error", e);
        return { text: "Invalid", color: "text-slate-500", durationString: "" };
    }
  };

  // Safe status filtering across multiple status field names
  const getStatusFromRecord = (item) => {
    return item?.status || item?.borrowStatus || item?.state || "Unknown";
  };

  // Enhanced filtering with multi-format support
  const filteredData = Array.isArray(allBorrowedBooks)
    ? allBorrowedBooks.filter((item) => {
        if (!item) return false;

        const status = getStatusFromRecord(item);
          let matchesStatus = filterStatus === "All" || status === filterStatus;
          
          if (filterStatus === "Active") {
            matchesStatus = ["Pending", "Borrowed", "Overdue"].includes(status);
          } else if (filterStatus === "Completed") {
            matchesStatus = ["Returned", "Rejected", "Cancelled"].includes(status);
          }

        const title = (getBookTitle(item) || "").toLowerCase();
        const userName = (getUserName(item) || "").toLowerCase();
        const userEmail = (getUserEmail(item) || "").toLowerCase();
        const activeSearch = (searchTerm || localSearch || "").trim().toLowerCase();

        const matchesSearch = title.includes(activeSearch) || userName.includes(activeSearch) || userEmail.includes(activeSearch);

        return matchesStatus && matchesSearch;
      })
    : [];

// Handle approve action with dynamic due date
const handleApprove = (item) => {
        if (!item._id && !item.id) {
          notifyError("Invalid borrow record ID");
          return;
        }

        setItemToApprove(item);
        setApprovePopupOpen(true);
    };

    const confirmApprove = async (days, hours, minutes) => {
      const item = itemToApprove;
      if(!item) return;

      if (days === 0 && hours === 0 && minutes === 0) {
        notifyError("Please enter a valid duration");
        return;
      }
      setApprovePopupOpen(false);
      setProcessingId(item._id || item.id);
      try {
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + days);
        dueDate.setHours(dueDate.getHours() + hours);
        dueDate.setMinutes(dueDate.getMinutes() + minutes);

        await dispatch(
          approveBorrow(item._id || item.id, dueDate)
        );
      } catch (err) {
        console.error("Approve error:", err);
        notifyError("Failed to approve request");
      } finally {
        setProcessingId(null);
        setItemToApprove(null);
    }
  };

  // Handle return action with proper validation
  const handleReturn = (item) => {
    if (!item._id && !item.id) {
      notifyError("Invalid borrow record ID");
      return;
    }
    setItemToReturn(item);
    setReturnPopupOpen(true);
  };

  const confirmReturn = async () => {
    const item = itemToReturn;
    if (!item) return;

    setReturnPopupOpen(false);
    setProcessingId(item._id || item.id);
    try {
      await dispatch(
        returnBook(item._id || item.id)
      );
    } catch (err) {
      console.error("Return error:", err);
      notifyError("Failed to return book");
    } finally {
      setProcessingId(null);
      setItemToReturn(null);
    }
  };

  // Handle reject action
  const handleReject = (item) => {
    if (!item._id && !item.id) {
      notifyError("Invalid borrow record ID");
      return;
    }
    setItemToReject(item);
    setRejectPopupOpen(true);
  };

  const confirmReject = async (reason) => {
    const item = itemToReject;
    if (!item) return;

    setRejectPopupOpen(false);
    setProcessingId(item._id || item.id);
    try {
      await dispatch(
        rejectBorrow(item._id || item.id, reason)
      );
    } catch (err) {
      console.error("Reject error:", err);
      notifyError("Failed to reject request");
    } finally {
      setProcessingId(null);
      setItemToReject(null);
    }
  };

  // Handle report issue action
  const handleReportIssueClick = (item) => {
    setSelectedBorrowRecord(item);
    setReportIssueOpen(true);
  };

  const handleReportIssueSubmit = async (data) => {
    setProcessingId(data.borrowId);
    try {
      await dispatch(
        reportIssue(data.borrowId, data.issueType, data.remarks)
      );
      setReportIssueOpen(false);
      setSelectedBorrowRecord(null);
    } catch (err) {
      console.error("Report issue error:", err);
      notifyError("Failed to report issue");
    } finally {
      setProcessingId(null);
    }
  };

  // Render loading state
  if (loading) {
    return (
      <div className="pt-24 pb-12 px-8 min-h-screen bg-slate-50 font-sans">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="h-10 bg-slate-200 rounded-lg w-64 animate-pulse mb-2" />
            <div className="h-4 bg-slate-100 rounded-lg w-96 animate-pulse" />
          </div>

          <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-8 py-6 text-[17px] font-black uppercase text-slate-600">
                    Member
                  </th>
                  <th className="px-8 py-6 text-[17px] font-black uppercase text-slate-600">
                    Asset Detail
                  </th>
                  <th className="px-8 py-6 text-[17px] font-black uppercase text-slate-600">
                    Status
                  </th>
                  <th className="px-8 py-6 text-[17px] font-black uppercase text-slate-600">
                    Timeline
                  </th>
                  <th className="px-8 py-6 text-[17px] font-black uppercase text-slate-600">
                    Operations
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {[1, 2, 3, 4].map((i) => (
                  <TableLoadingRow key={i} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // Render empty state
  if (!filteredData || filteredData.length === 0) {
    return (
      <div className="pt-24 pb-12 px-8 min-h-screen bg-slate-50 font-sans">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div>
<h2 className="text-4xl font-black text-slate-900 tracking-tight capitalize italic">                Borrowing Logistics
              </h2>
              <p className="text-[15px] font-bold text-slate-900 uppercase tracking-[0.1em] mt-5 italic">
                Monitor assets & approval workflows
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search member or book..."
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                  className="bg-white border border-slate-200 rounded-xl px-10 py-2.5 text-m focus:outline-none focus:ring-2 focus:ring-[#358a74]/20 w-64 shadow-sm"
                />
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={12} />
              </div>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-[10px] font-black uppercase text-slate-600 focus:outline-none cursor-pointer shadow-sm"
              >
                  <option value="Active">Active Only</option>
                  <option value="All">All History</option>
                  <option value="Pending">Pending Approval</option>
                  <option value="Borrowed">On Loan</option>
                  <option value="Completed">Completed / Closed</option>
              </select>
            </div>
          </div>

          <EmptyState
            icon={<FaBook size={48} className="text-slate-300" />}
            title="No Requests Found"
            description={
              filterStatus !== "All" && (searchTerm || localSearch)
                ? `No records match your search: "${searchTerm || localSearch}" (Status: ${filterStatus})`
                : "No borrowing requests at this time. Check back soon!"
            }
          />
        </div>
      </div>
    );
  }

  // Render table with borrow requests
  return (
    <div className="pt-24 pb-12 px-8 min-h-screen bg-slate-50 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
<h2 className="text-4xl font-black text-slate-900 tracking-tight capitalize italic">                Borrowing Logistics
              </h2>
              <p className="text-[15px] font-bold text-slate-900 uppercase tracking-[0.1em] mt-5 italic">
                Monitor assets & approval workflows
              </p>
            </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search member or book..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl px-10 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#358a74]/20 w-64 shadow-sm transition-all"
              />
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={12} />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-[11px] font-black uppercase text-slate-600 focus:outline-none cursor-pointer shadow-sm tracking-widest"
            >
              <option value="Active">Active Only</option>
              <option value="All">All History</option>
              <option value="Pending">Pending Approval</option>
              <option value="Borrowed">On Loan</option>
              <option value="Completed">Completed / Closed</option>
            </select>
          </div>
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-6 text-[10px] font-black uppercase text-slate-600 tracking-[0.2em]">
                  Member
                </th>
                <th className="px-8 py-6 text-[10px] font-black uppercase text-slate-600 tracking-[0.2em]">
                  Asset Detail
                </th>
                <th className="px-8 py-6 text-[10px] font-black uppercase text-slate-600 tracking-[0.2em]">
                  Status
                </th>
                <th className="px-8 py-6 text-[10px] font-black uppercase text-slate-600 tracking-[0.2em] text-center">
                  Timeline
                </th>
                <th className="px-8 py-6 text-[10px] font-black uppercase text-slate-600 tracking-[0.2em] text-right">
                  Operations
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredData.map((item) => {
                if (!item) return null;

                const deadline = getDueDateStatus(
                  item?.dueDate || item?.due_date,
                  item?.requestDate || item?.createdAt || item?.created_at
                );
                const isProcessing = processingId === (item._id || item.id);
                const status = getStatusFromRecord(item);
                const title = getBookTitle(item);
                const userName = getUserName(item);
                const userRole = getUserRole(item);
                const userEmail = getUserEmail(item);
                const userInitial = getUserInitial(item);
                  // Extended book details
                  const fullBook = getFullBookDetails(item);
                  const bookCover = getBookImage(item, fullBook);
                  const edition = fullBook?.edition || (item?.bookTotalCopies ? `${item.bookTotalCopies} Total Copies` : null);
                  const genre = fullBook?.category || fullBook?.genre || null;
                  const author = fullBook?.author || item?.book?.author || item?.author || null;
                  
                return (
                  <tr
                    key={item._id || item.id}
                    className="hover:bg-slate-50/40 transition-colors group"
                  >
                    {/* Member Column */}
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-xs border border-slate-800 shadow-lg shadow-slate-200">
                          {userInitial}
                        </div>
                        <div>
                            <p className="text-m font-black text-slate-900 leading-tight">
                              {userName}
                            </p>
                            <p className="text-[12px] text-slate-500 font-medium">
                              {userEmail}
                            </p>
                            <p className="text-[10px] text-[#358a74] font-black uppercase tracking-widest mt-0.5">
                            {userRole}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Asset Detail Column */}
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        {/* Mini Photo */}
                        <div className="w-12 h-16 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center border border-slate-200 shadow-sm">
                          {bookCover ? (
                            <img src={bookCover} alt={title} className="w-full h-full object-cover" />
                          ) : (
                            <FaBook size={18} className="text-slate-300" />
                          )}
                        </div>
                        
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-sm font-bold text-slate-800 tracking-tight">
                              {title}
                            </span>
                          </div>
                          
                          {author && (
                            <span className="text-[12px] font-medium text-slate-500">
                              {author}
                            </span>
                          )}

                          {(genre || edition) && (
                            <div className="flex flex-wrap gap-2 mt-0.5">
                              {genre && (
                                <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                                  {genre}
                                </span>
                              )}
                              {edition && (
                                <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                                  {edition}
                                </span>
                              )}
                            </div>
                          )}

                          <span className="text-[11px] text-slate-400 flex items-center gap-1 font-bold mt-0.5">
                            <FaClock size={10} /> Applied:{" "}
                              {(() => {
                                const dt = item?.requestDate || item?.createdAt || item?.created_at;
                                if (dt && dt._seconds) return new Date(dt._seconds * 1000).toLocaleDateString();
                                return dt ? new Date(dt).toLocaleDateString() : "N/A";
                              })()}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Status Column */}
                    <td className="px-8 py-5">
                      <span
                        className={`text-[10px] font-black uppercase px-3 py-1.5 rounded-lg border ${
                          status === "Pending"
                            ? "bg-amber-50 text-amber-600 border-amber-100"
                            : status === "Borrowed"
                            ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                            : status === "Returned"
                            ? "bg-blue-50 text-blue-600 border-blue-100"
                            : status === "Rejected"
                            ? "bg-rose-50 text-rose-600 border-rose-100"
                            : "bg-slate-50 text-slate-400 border-slate-100"
                        }`}
                      >
                        {status}
                      </span>
                    </td>

                    {/* Timeline Column */}
                    <td className="px-8 py-5">
                      <div className="flex flex-col gap-1.5 text-s min-w-max">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-slate-400 uppercase w-17 text-right">Borrow:</span>
                          <span className="font-bold text-slate-600 tracking-tight">
                            {(() => {
                              const d = item?.borrowDate || item?.requestDate || item?.createdAt || item?.created_at;
                              if (!d) return "N/A";
                              const ms = d._seconds ? d._seconds * 1000 : d;
                              return new Date(ms).toLocaleString("en-US", { weekday: "short", year: "numeric", month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit" }).replace(/,/g, "");
                            })()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-slate-400 uppercase w-17 text-right">Due:</span>
                          <span className={"font-bold tracking-tight " + (status === "Overdue" ? "text-rose-500" : status === "Pending" ? "text-amber-500" : "text-[#358a74]")}>
                            {status === "Rejected" || status === "Pending" ? "�" : (() => {
                              const d = item?.dueDate || item?.due_date;
                              if (!d) return "Not Set";
                              const ms = d._seconds ? d._seconds * 1000 : d;
                              return new Date(ms).toLocaleString("en-US", { weekday: "short", year: "numeric", month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit" }).replace(/,/g, "");
                            })()}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Operations Column */}
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center gap-2 justify-end">
                        {isProcessing ? (
                          <ImSpinner2 className="animate-spin text-[#358a74]" size={18} />
                        ) : status === "Pending" ? (
                          <>
                            <button
                              onClick={() => handleApprove(item)}
                              className="p-2.5 bg-[#358a74] text-white rounded-xl hover:bg-slate-900 transition-all shadow-md active:scale-90"
                              title="Approve borrow request"
                            >
                              <FaCheck size={10} />
                            </button>
                            <button
                              onClick={() => handleReject(item)}
                              className="p-2.5 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all active:scale-90"
                              title="Reject borrow request"
                            >
                              <FaTimes size={10} />
                            </button>
                          </>
                          ) : status === "Borrowed" || status === "Overdue" ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleReturn(item)}
                              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-slate-900 transition-all shadow-md active:scale-90"
                              title="Record book return"
                            >
                              <FaUndoAlt size={10} /> Return
                            </button>
                            <button
                              onClick={() => handleReportIssueClick(item)}
                              className="p-2.5 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all shadow-md active:scale-90"
                              title="Report book as lost or damaged"
                            >
                              <FaExclamationTriangle size={10} />
                            </button>
                          </div>
                        ) : (
                          <span className="text-[13px] font-black text-slate-300 uppercase tracking-widest ">
                            CLOSED / COMPLETED
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Report Issue Popup */}
      <ReportIssuePopup
        isOpen={reportIssueOpen}
        borrowRecord={selectedBorrowRecord}
        onClose={() => {
          setReportIssueOpen(false);
          setSelectedBorrowRecord(null);
        }}
        onSubmit={handleReportIssueSubmit}
        isLoading={processingId === (selectedBorrowRecord?._id || selectedBorrowRecord?.id)}
      />

      {/* Approve Request Popup */}
      <ApproveRequestPopup
        isOpen={approvePopupOpen}
        onClose={() => {
          setApprovePopupOpen(false);
          setItemToApprove(null);
        }}
        onConfirm={confirmApprove}
      />

      {/* Reject Request Popup */}
      <RejectRequestPopup
        isOpen={rejectPopupOpen}
        onClose={() => {
          setRejectPopupOpen(false);
          setItemToReject(null);
        }}
        onConfirm={confirmReject}
      />

      {/* Return Confirm Popup */}
      <ReturnConfirmPopup
        isOpen={returnPopupOpen}
        onClose={() => {
          setReturnPopupOpen(false);
          setItemToReturn(null);
        }}
        onConfirm={confirmReturn}
        item={itemToReturn}
      />
    </div>
  );
};

export default BorrowRequestsV2;