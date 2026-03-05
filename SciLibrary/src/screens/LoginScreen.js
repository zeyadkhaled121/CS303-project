import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native";

const LoginScreen = function ({ navigation }) {
  console.log("LoginScreen component mounted");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberME] = useState(false);

  const validateInputs = () => {
    // check if email is empty
    if (!email.trim()) {
      Alert.alert("Validation Error", "Please enter your email address.");
      return false;
    }
    // check if email have regular exp.
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Validation Error", "Please enter a valid email address.");
      return false;
    }
    // check if pass is empty
    if (!password.trim()) {
      Alert.alert("Validation Error", "Please enter your password.");
      return false;
    }
    // check length of pass
    if (password.length < 6 || password.length > 16) {
      Alert.alert(
        "Validation Error",
        "Password must be at least 6 characters and not greater than 16 characters.",
      );
      return false;
    }

    // all thing pervouis is okey
    return true;
  };
  // handle of login
  // called after user entered data and clicked login button
  const handleLogin = () => {
    if (!validateInputs()) return; // when validateinput not return true stop
    setIsLoading(true); // Show loading to user

    // In a real app, you would call your API here:
    // const response = await fetch('https://yourapi.com/login', {...})
    //
    // For now, we simulate a 1.5 second API call using setTimeout
    setTimeout(() => {
      setIsLoading(false);

      navigation.navigate("Home", { userName: email.split("@")[0] });
    }, 1500);
  };

  //  THE UI

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* <View style={styles.headerSection}>
          <Text style={styles.logo}>
            <Image
              source={require("/mnt/storage/projects of learning/CS303-project/SciLibrary/assets/image.png")}
            />
          </Text>
          <Text style={styles.title}>SCi-Library</Text>
          <Text style={styles.subtitle}>Your digital reading companion</Text> */}
        {/* </View> */}

        <View style={styles.formSection}>
          <Text style={styles.formTitle}>Welcome Back!</Text>
          <Text style={styles.formSubtitle}>Sign in to continue reading</Text>

          {/* EMAIL INPUT */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email Address</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              placeholderTextColor="#aaa"
              value={email}
              // 'text' is the new full value of the input
              onChangeText={(text) => setEmail(text)}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
          {/* PASSWORD INPUT */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Password</Text>
            <View style={styles.passwordRow}>
              <TextInput
                style={[styles.input, styles.passwordInput]}
                placeholder="Enter your password"
                placeholderTextColor="#aaa"
                value={password}
                onChangeText={(text) => setPassword(text)}
                // secureTextEntry hides text (shows dots) when true
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              {/* Toggle show/hide password */}
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Text style={styles.eyeText}>{showPassword ? "🙈" : "👁️"}</Text>
              </TouchableOpacity>
            </View>
          </View>
          <TouchableOpacity
            style={styles.forgotContainer}
            onPress={() => navigation.navigate("ForgetPassword")}
          >
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>

          {/* LOGIN BUTTON */}

          <TouchableOpacity
            style={[
              styles.loginButton,
              isLoading && styles.loginButtonDisabled,
            ]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            <Text style={styles.loginButtonText}>
              {isLoading ? "Logging In..." : "Login"}
            </Text>
          </TouchableOpacity>

          {/* REGISTER LINK */}
          <View style={styles.registerRow}>
            <Text style={styles.registerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Register")}>
              <Text style={styles.registerLink}>Register</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "gray",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
  },
  headerSection: {
    alignItems: "center",
    marginBottom: 40,
  },
  // logo: {
  //   fontSize: 60,
  //   marginBottom: 8,
  //   resizeMode:"center",
  // },
  // title: {
  //   fontSize: 32,
  //   fontWeight: "bold",
  //   color: "#086f27",
  //   letterSpacing: 1,
  // },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  formSection: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 28,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2c7360",
    marginBottom: 4,
  },
  formSubtitle: {
    fontSize: 14,
    color: "#888",
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#444",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#f5f7ff",
    borderWidth: 1.5,
    borderColor: "#dde1f0",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 13,
    fontSize: 15,
    color: "#222",
  },
  passwordRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  passwordInput: {
    flex: 1,
    marginRight: 8,
  },
  eyeButton: {
    padding: 10,
  },
  eyeText: {
    fontSize: 20,
  },
  forgotContainer: {
    alignSelf: "flex-end", // Push to right side
    marginBottom: 20,
  },
  forgotText: {
    color: "#2c7360",
    fontSize: 13,
    fontWeight: "600",
  },
  loginButton: {
    backgroundColor: "#2c7360",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 20,
  },
  loginButtonDisabled: {
    backgroundColor: "#9fa8da",
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  registerRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  registerText: {
    color: "#666",
    fontSize: 14,
  },
  registerLink: {
    color: "#2c7360",
    fontSize: 14,
    fontWeight: "bold",
  },
});

export default LoginScreen;
