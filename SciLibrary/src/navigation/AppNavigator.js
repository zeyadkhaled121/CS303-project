import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import OTPScreen from "../screens/OTPScreen";
import ForgetPasswordScreen from "../screens/ForgetPasswordScreen";
import HomeScreen from "../screens/HomeScreen";
import CatalogScreen from "../screens/CatalogScreen";
import ResetPasswordScreen from "../screens/ResetPasswordScreen"; 
import Toast from "react-native-toast-message";
import BookDetailsScreen from "../screens/BookDetailsScreen";
import SettingsScreen from "../screens/SettingsScreen";
import AdminDashboardScreen from "../screens/AdminDashboardScreen";
import AddEditBookScreen from "../screens/AddEditBookScreen";
import UsersScreen from "../screens/UsersScreen";
import AddNewAdminScreen from "../screens/AddNewAdminScreen";

const Stack = createNativeStackNavigator();

const AppNavigator = function () {
  return (
    <>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="OTP" component={OTPScreen} />
          <Stack.Screen name="ForgetPassword" component={ForgetPasswordScreen} />
          <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Catalog" component={CatalogScreen} />
          <Stack.Screen name="BookDetails" component={BookDetailsScreen} />
          <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen name="AddEditBook" component={AddEditBookScreen} />
          <Stack.Screen name="AllUsers" component={UsersScreen} />
          <Stack.Screen name="AddNewAdmin" component={AddNewAdminScreen} />
        </Stack.Navigator>
      </NavigationContainer>
      <Toast/>
    </>
  );
};

export default AppNavigator;
