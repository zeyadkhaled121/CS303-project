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
} from "react-native";
import API from "../api/axios";

const RegisterScreen = function ({ navigation }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // password strength for user when create  ===> mostafa
  const getPasswordStrength = (pass) => {
    if (pass.length === 0) return null;
    if (pass.length < 6) return "Week password";
    if (pass.length < 10) return "Medium password";

    const hasUpperChar = /[A-Z]/.test(pass);
    const hasLowerChar = /[a-z]/.test(pass);
    const hasNumber = /[0-9]/.test(pass);
    const hasSpecialChar = /[!@#$%^&*]/.test(pass);
    const mixScore = [
      hasUpperChar,
      hasLowerChar,
      hasNumber,
      hasSpecialChar,
    ].filter(Boolean).length;
    return mixScore >= 3 ? "Strong" : "Medium";
  };

  const getStrengthColor = (strength) => {
    if (strength === "Strong") {
      return "#4caf50";
    }
    if (strength === "Medium") {
      return "#ff9800";
    }
    return "#f44336"; // for week password
  };
  const validateinput = () => {
    if (!name.trim()) {
      Alert.alert("Please Enter your name ");
      return false;
    }
    if (name.trim().length < 2) {
      Alert.alert("Name must be at least 2 character");
      return false;
    }
    if (!email.trim()) {
      Alert.alert(" Please enter your email");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Please enter a valid email format");
      return false;
    }
    if (!password) {
      Alert.alert("Please enter your password");
      return false;
    }
    if (password.length < 6) {
      Alert.alert("Password must be at least 6 characters");
      return false;
    }
    if (password !== confirmPassword) {
      Alert.alert("Passwords do not match. Please try again");
      return false;
    }
    return true;
  };

  const handleRegister = async () => {
    if (!validateinput()) return;

    setIsLoading(true);

    try {
      const response = await API.post('/api/v1/user/register', { name, email, password });
      console.log('register response', response?.data);
      // show success alert; include code if returned (dev only)
      let msg = "Please check your email for verification code";
      if (response?.data?.data?.code) {
        msg += `\n(code: ${response.data.data.code})`;
      }
      Alert.alert("Registration Successful", msg);
      navigation.navigate("OTP", {
        email: email,
        name: name,
        isRegistration: true,
        code: response?.data?.data?.code, // may be undefined
      });
    } catch (error) {
      console.error('Registration error:', error);
      Alert.alert(
        "Registration Failed",
        error.response?.data?.message ||
          "An error occurred during registration (check network or server)",
      );
    } finally {
      setIsLoading(false);
    }
  };
  const passwordStrength = getPasswordStrength(password);

  // Our UI
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* BACK BUTTON */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.headerEmoji}>📖</Text>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join the Sci-Library community</Text>
        </View>

        {/* FORM CARD */}
        <View style={styles.formCard}>
          {/* FULL NAME */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Mostafa Mahmoud"
              placeholderTextColor="#aaa"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
          </View>

          {/* EMAIL */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="your@email.com"
              placeholderTextColor="#aaa"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* PASSWORD */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordRow}>
              <TextInput
                style={[styles.input, styles.passwordInput]}
                placeholder="Min 6 characters"
                placeholderTextColor="#aaa"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeBtn}
              >
                <Text>{showPassword ? "🙈" : "👁️"}</Text>
              </TouchableOpacity>
            </View>

            {passwordStrength && (
              <View style={styles.strengthRow}>
                <View style={styles.strengthBarBg}>
                  <View
                    style={[
                      styles.strengthBarFill,
                      {
                        width:
                          passwordStrength === "Strong"
                            ? "100%"
                            : passwordStrength === "Medium"
                              ? "66%"
                              : "33%",
                        backgroundColor: getStrengthColor(passwordStrength),
                      },
                    ]}
                  />
                </View>
                <Text
                  style={[
                    styles.strengthText,
                    { color: getStrengthColor(passwordStrength) },
                  ]}
                >
                  {passwordStrength}
                </Text>
              </View>
            )}
          </View>

          {/* CONFIRM PASSWORD */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirm Password</Text>
            <View style={styles.passwordRow}>
              <TextInput
                style={[
                  styles.input,
                  styles.passwordInput,

                  confirmPassword &&
                    password !== confirmPassword &&
                    styles.inputError,
                ]}
                placeholder="Re-enter your password"
                placeholderTextColor="#aaa"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={styles.eyeBtn}
              >
                <Text>{showConfirmPassword ? "🙈" : "👁️"}</Text>
              </TouchableOpacity>
            </View>

            {/* Show mismatch warning in real-time */}
            {confirmPassword && password !== confirmPassword && (
              <Text style={styles.errorText}>⚠️ Passwords do not match</Text>
            )}
            {/* Show match confirmation */}
            {confirmPassword &&
              password === confirmPassword &&
              confirmPassword.length > 0 && (
                <Text style={styles.successText}>✅ Passwords match!</Text>
              )}
          </View>

          {/* REGISTER BUTTON */}
          <TouchableOpacity
            style={[
              styles.registerBtn,
              isLoading && styles.registerBtnDisabled,
            ]}
            onPress={handleRegister}
            disabled={isLoading}
          >
            <Text style={styles.registerBtnText}>
              {isLoading ? "Creating Account..." : "Create Account"}
            </Text>
          </TouchableOpacity>

          {/* LOGIN LINK */}
          <View style={styles.loginRow}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Login")}>
              <Text style={styles.loginLink}>Sign In</Text>
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
    backgroundColor: "#f0f4ff",
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 60,
  },
  backButton: {
    marginBottom: 16,
  },
  backText: {
    color: "rgb(44, 115, 96)",
    fontSize: 16,
    fontWeight: "600",
  },
  header: {
    alignItems: "center",
    marginBottom: 28,
  },
  headerEmoji: {
    fontSize: 50,
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "rgb(44, 115, 96)",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  formCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 30,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
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
    flex: 1,
  },
  inputError: {
    borderColor: "#f44336", // Red border for error state
  },
  passwordRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  passwordInput: {
    marginRight: 8,
  },
  eyeBtn: {
    padding: 10,
  },
  strengthRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    gap: 8,
  },
  strengthBarBg: {
    flex: 1,
    height: 6,
    backgroundColor: "#e0e0e0",
    borderRadius: 3,
    overflow: "hidden",
  },
  strengthBarFill: {
    height: "100%",
    borderRadius: 3,
  },
  strengthText: {
    fontSize: 12,
    fontWeight: "bold",
    width: 50,
  },
  errorText: {
    color: "#f44336",
    fontSize: 12,
    marginTop: 4,
  },
  successText: {
    color: "#4caf50",
    fontSize: 12,
    marginTop: 4,
  },
  registerBtn: {
    backgroundColor: "rgb(44, 115, 96)",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 20,
  },
  registerBtnDisabled: {
    backgroundColor: "#9fa8da",
  },
  registerBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  loginRow: {
    flexDirection: "row",
    justifyContent: "center",
  },
  loginText: {
    color: "#666",
    fontSize: 14,
  },
  loginLink: {
    color: "rgb(44, 115, 96)",
    fontSize: 14,
    fontWeight: "bold",
  },
});

export default RegisterScreen;
