import React, { useEffect } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import { navigationRef } from "./navigationRef";
import { useDispatch, useSelector } from "react-redux";
import { getUser } from "../store/slices/authSlice";
import Toast from "react-native-toast-message";
import { ActivityIndicator, View } from "react-native";

// Auth Screens
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import OTPScreen from "../screens/OTPScreen";
import ForgetPasswordScreen from "../screens/ForgetPasswordScreen";
import ResetPasswordScreen from "../screens/ResetPasswordScreen";

// Main App Screens
import CatalogScreen from "../screens/CatalogScreen";
import BookDetailsScreen from "../screens/BookDetailsScreen";
import MyBorrowedBooksScreen from "../screens/MyBorrowedBooksScreen";
import SettingsScreen from "../screens/SettingsScreen";

// Admin Screens
import AdminDashboardScreen from "../screens/AdminDashboardScreen";
import BorrowRequestsScreen from "../screens/BorrowRequestsScreen";
import AddEditBookScreen from "../screens/AddEditBookScreen";
import UsersScreen from "../screens/UsersScreen";
import AddNewAdminScreen from "../screens/AddNewAdminScreen";
import StatsScreen from "../screens/StatsScreen";

// Notification Screens
import NotificationCenterScreen from "../screens/NotificationCenterScreen";

// Tab Navigators
import UserTabNavigator from "./UserTabNavigator";
import AdminTabNavigator from "./AdminTabNavigator";

const Stack = createNativeStackNavigator();

// Auth Stack Navigator
const AuthStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      animationEnabled: false,
    }}
  >
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
    <Stack.Screen name="OTP" component={OTPScreen} />
    <Stack.Screen name="ForgetPassword" component={ForgetPasswordScreen} />
    <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
  </Stack.Navigator>
);

// User Stack Navigator
const UserStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Group>
      <Stack.Screen name="UserTabs" component={UserTabNavigator} options={{ headerShown: false }} />
    </Stack.Group>

    {/* Book Details Modal across tabs */}
    <Stack.Group screenOptions={{ presentation: 'modal' }}>
      <Stack.Screen
        name="BookDetails"
        component={BookDetailsScreen}
        options={{
          headerShown: true,
          headerTitle: 'Book Details',
          headerStyle: {
            backgroundColor: '#fff',
          },
          headerTitleStyle: {
            fontSize: 16,
            fontWeight: '600',
            color: '#111827',
          },
        }}
      />
    </Stack.Group>
  </Stack.Navigator>
);

// Admin Stack Navigator
const AdminStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
    }}
  >
    <Stack.Screen name="AdminTabs" component={AdminTabNavigator} />
    <Stack.Screen name="AddEditBook" component={AddEditBookScreen} />
    <Stack.Screen name="AddNewAdmin" component={AddNewAdminScreen} />
    <Stack.Screen name="BookDetails" component={BookDetailsScreen} />
    <Stack.Screen name="MyBorrowedBooks" component={MyBorrowedBooksScreen} />
  </Stack.Navigator>
);

// Root Stack Navigator
const RootStack = ({ isAuthenticated, user }) => {
  if (!isAuthenticated) {
    return <AuthStack />;
  }

  const isAdmin = user?.role === 'Admin' || user?.role === 'Super Admin';
  
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Group>
        {isAdmin ? (
          <Stack.Screen name="AdminStackScreen" component={AdminStack} />
        ) : (
          <Stack.Screen name="UserStackScreen" component={UserStack} />
        )}
      </Stack.Group>

      {/* Modal screens - overlay on top of main stack */}
      <Stack.Group screenOptions={{ presentation: 'modal' }}>
        <Stack.Screen
          name="NotificationCenter"
          component={NotificationCenterScreen}
          options={{
            headerShown: true,
            headerTitle: 'Notifications',
            headerStyle: {
              backgroundColor: '#fff',
            },
            headerTitleStyle: {
              fontSize: 18,
              fontWeight: '600',
              color: '#111827',
            },
          }}
        />
      </Stack.Group>
    </Stack.Navigator>
  );
};

// Main App Navigator
const AppNavigator = function () {
  const dispatch = useDispatch();
  const { isAuthenticated, user, loading } = useSelector((state) => state.auth);

  // Restore session on app load
  useEffect(() => {
    dispatch(getUser());
  }, [dispatch]);

  if (loading && !isAuthenticated) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' }}>
        <ActivityIndicator size="large" color="#358a74" />
      </View>
    );
  }

  return (
    <NavigationContainer ref={navigationRef}>
      <RootStack isAuthenticated={isAuthenticated} user={user} />
    </NavigationContainer>
  );
};

export default AppNavigator;
