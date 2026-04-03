
import React from 'react';
import { Link } from 'react-router-dom';
import { FaBook, FaSpinner, FaExclamationTriangle, FaSync } from "react-icons/fa";

/**
 * Skeleton Load Card
 * Shows while data is loading
 */
export const SkeletonCard = () => (
  <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 animate-pulse">
    <div className="w-full h-64 bg-slate-200 rounded-[1.5rem] mb-4"></div>
    <div className="h-4 bg-slate-200 rounded mb-3"></div>
    <div className="h-4 bg-slate-200 rounded w-3/4 mb-6"></div>
    <div className="h-12 bg-slate-200 rounded-lg"></div>
  </div>
);

/**
 * Loading Skeleton Grid
 * Shows multiple skeleton cards while loading list
 */
export const LoadingSkeleton = ({ count = 4 }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
);

/**
 * Centered Loading Spinner
 * For overlays or inline loading states
 */
export const LoadingSpinner = ({ text = "Loading..." }) => (
  <div className="flex flex-col items-center justify-center py-24 gap-4">
    <FaSpinner className="animate-spin text-[#358a74]" size={32} />
    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
      {text}
    </p>
  </div>
);

/**
 * Empty State Component
 * Shows when no data is available
 */
export const EmptyState = ({ 
  icon: Icon = FaBook, 
  title = "No items found", 
  description = "",
  action = null,
  actionLabel = null,
  actionHref = null
}) => (
  <div className="text-center py-24 bg-white rounded-[2rem] border border-dashed border-gray-200">
    {React.isValidElement(Icon) ? (
      <div className="mx-auto flex justify-center text-gray-200 mb-4">{Icon}</div>
    ) : (
      <Icon size={48} className="mx-auto text-gray-200 mb-4" />
    )}
    <h3 className="text-lg font-black text-gray-600 uppercase tracking-widest mb-2">
      {title}
    </h3>
    {description && (
      <p className="text-gray-400 text-sm font-medium max-w-xs mx-auto mb-6"> 
        {description}
      </p>
    )}
    {action && action}
    {actionLabel && actionHref && (
      <Link to={actionHref} className="inline-block px-6 py-3 bg-[#358a74] text-white rounded-xl font-bold uppercase tracking-wider text-[11px] hover:bg-[#2c7562] transition-colors shadow-md hover:-translate-y-0.5">
        {actionLabel}
      </Link>
    )}

  </div>
);

/**
 * Error State Component
 * Shows when an operation fails with retry option
 */
export const ErrorState = ({ 
  message = "Something went wrong",
  onRetry = null,
  details = null 
}) => (
  <div className="text-center py-20 bg-rose-50 rounded-[2rem] border border-rose-200">
    <FaExclamationTriangle size={48} className="mx-auto text-rose-300 mb-4" />
    <h3 className="text-lg font-black text-rose-600 uppercase tracking-widest mb-2">
      Error
    </h3>
    <p className="text-rose-500 text-sm font-medium max-w-xs mx-auto mb-2">
      {message}
    </p>
    {details && (
      <p className="text-[10px] text-rose-400 font-mono max-w-lg mx-auto mb-6 truncate">
        {details}
      </p>
    )}
    {onRetry && (
      <button
        onClick={onRetry}
        className="inline-flex items-center gap-2 px-6 py-2 bg-rose-500 text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-rose-600 transition-all"
      >
        <FaSync size={12} /> Try Again
      </button>
    )}
  </div>
);

/**
 * Inline Loading Badge
 * Shows loading state inline with other content
 */
export const InlineLoading = ({ text = "Updating..." }) => (
  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-100 rounded-lg">
    <FaSpinner className="animate-spin text-amber-500" size={12} />
    <span className="text-[9px] font-black text-amber-600 uppercase tracking-tighter">
      {text}
    </span>
  </div>
);

/**
 * Data Table Loading Row
 * Skeleton row for table rows while loading
 */
export const TableLoadingRow = ({ columns = 4 }) => (
  <tr className="animate-pulse">
    {Array.from({ length: columns }).map((_, i) => (
      <td key={i} className="px-8 py-5">
        <div className="h-4 bg-slate-200 rounded w-full"></div>
      </td>
    ))}
  </tr>
);

/**
 * Retry Boundary Component
 * Wraps components that might fail and provides retry
 */
export const RetryBoundary = ({ 
  error, 
  onRetry, 
  children 
}) => {
  if (error) {
    return (
      <ErrorState
        message={error.message || "Couldn't load this section"}
        onRetry={onRetry}
        details={error.details}
      />
    );
  }
  return children;
};
