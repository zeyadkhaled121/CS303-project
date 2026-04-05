import Toast from 'react-native-toast-message';



export const notifySuccess = (message, duration = 3000) => {
  Toast.show({
    type: 'success',
    text1: 'Success',
    text2: message,
    duration,
  });
};

export const notifyError = (message, duration = 4000) => {
  Toast.show({
    type: 'error',
    text1: 'Error',
    text2: message,
    duration,
  });
};

export const notifyInfo = (message, duration = 3000) => {
  Toast.show({
    type: 'info',
    text1: 'Info',
    text2: message,
    duration,
  });
};

export const notifyWarning = (message, duration = 3000) => {
  Toast.show({
    type: 'info', 
    text1: 'Warning',
    text2: message,
    duration,
  });
};

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

export default {
  notifySuccess,
  notifyError,
  notifyInfo,
  notifyWarning,
};
