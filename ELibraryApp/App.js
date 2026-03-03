
import 'react-native-gesture-handler';

import React from 'react';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  // The navigator already includes NavigationContainer/stack etc.
  // If you want to add a safe area provider you can wrap it here.
  return <AppNavigator />;
}
