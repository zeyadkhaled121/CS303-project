import React from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import { Provider, useSelector } from 'react-redux';
import Toast from 'react-native-toast-message';
import AppErrorBoundary from './src/components/AppErrorBoundary';
import store from './src/store/store';
import { useNotificationStream } from './src/hooks/useNotificationStream';

/**
 * AppWrapper component to initialize notification stream
 * Must be inside Redux Provider to access auth state
 */
function AppWrapper() {
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
  
  // Initialize notification stream when authenticated
  useNotificationStream(isAuthenticated);

  return (
    <>
      <AppNavigator />
      <Toast />
    </>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <AppErrorBoundary>
        <AppWrapper />
      </AppErrorBoundary>
    </Provider>
  );
}


