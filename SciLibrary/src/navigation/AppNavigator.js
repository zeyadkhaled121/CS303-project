import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
// import { GestureHandlerRootView } from 'react-native-gesture-handler';

import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import OTPScreen from "../screens/OTPScreen";
import ForgetPasswordScreen from "../screens/ForgetPasswordScreen";
import HomeScreen from "../screens/HomeScreen";
import Toast from "react-native-toast-message";

const Stack = createNativeStackNavigator();

// const linking = {
//   prefixes: [/* e.g. 'https://myapp.com', 'http://localhost:19006' */],
//   config: {
//     screens: {
//       Login: "login",
//       Register: "register",
      
//     },
//   },
// };

const AppNavigator = function () {
  return (
    <>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="OTP" component={OTPScreen} />
          <Stack.Screen name="ForgetPassword" component={ForgetPasswordScreen} />
          <Stack.Screen name="Home" component={HomeScreen} />
        </Stack.Navigator>
      </NavigationContainer>
      <Toast/>
    </>
  );
};

export default AppNavigator;
