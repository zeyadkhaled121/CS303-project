export const getStatusColor = (status) => {
  const statusColors = {
    'Pending': '#FFA500',
    'Active': '#358a74',
    'Overdue': '#e74c3c',
    'Returned': '#95a5a6',
    'Cancelled': '#95a5a6',
    'Lost': '#e74c3c',
    'Damaged': '#e74c3c',
  };
  return statusColors[status] || '#7f8c8d';
};