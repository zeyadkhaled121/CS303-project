import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";

import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import OTPScreen from "../screens/OTPScreen";
import ForgetPasswordScreen from "../screens/ForgetPasswordScreen";
import HomeScreen from "../screens/HomeScreen";

const Stack = createNativeStackNavigator();

const AppNavigator = function () {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="OTP" component={OTPScreen} />
        <Stack.Screen name="ForgetPassword" component={ForgetPasswordScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
