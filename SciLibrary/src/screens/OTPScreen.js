import React, { useState, useRef, useEffect } from "react";
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

const OTPLENGTH = 4;
const RESENDTIMERSECONDS = 60;

function OTPScreen({ navigation, route }) {
  // debug incoming parameters
  console.log("OTPScreen params", route?.params);
  const [otp, setOtp] = useState(Array(OTPLENGTH).fill(""));
  const { email, code } = route.params || {};
  const [secondsLeft, setSecondsLeft] = useState(RESENDTIMERSECONDS);
  const [canResend, setCanResend] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const inputRefs = useRef(
    Array(OTPLENGTH)
      .fill(null)
      .map(() => React.createRef()),
  );
  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  const handleOtpChange = (text, index) => {
    const cleaned = text.replace(/[^0-9]/g, "").slice(0, 1);
    const newOtp = [...otp];
    newOtp[index] = cleaned;
    setOtp(newOtp);
    if (cleaned && index < OTPLENGTH - 1) {
      inputRefs.current[index + 1].current.focus();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].current.focus();
    }
  };
  const verifyOtp = async (otpCode) => {
    const codeToVerify = otpCode || otp.join("");

    if (codeToVerify.length < OTPLENGTH) {
      Alert.alert(`Please enter all ${OTPLENGTH} digits.`);
      return;
    }

    setIsVerifying(true);

    try {
      const response = await API.post("/api/v1/user/verify-email", {
        email,
        otp: codeToVerify,
      });
      Alert.alert("Success", "Email verified successfully!");
      navigation.navigate("Login");
    } catch (error) {
      console.error("OTP verification error:", error);
      Alert.alert(
        "Verification Failed",
        error.response?.data?.message || "Invalid OTP",
      );
      setOtp(Array(OTPLENGTH).fill(""));
      if (inputRefs.current[0] && inputRefs.current[0].current) {
        inputRefs.current[0].current.focus();
      }
    } finally {
      setIsVerifying(false);
    }
  };

  // RESEND OTP

  const handleResend = () => {
    if (!canResend) return;
    // in a real app you would call an API to resend the code
    Alert.alert("OTP Sent!", `A new code has been sent to ${email}`);

    setSecondsLeft(RESENDTIMERSECONDS);
    setCanResend(false);
    setOtp(Array(OTPLENGTH).fill(""));

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60)
      .toString()
      .padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };
  useEffect(() => {
    // if we receive code from params (dev mode), fill and verify automatically
    if (code) {
      const codeStr = String(code);
      setOtp(codeStr.split(""));
      verifyOtp(codeStr);
    }
  }, [code]);

  if (!email) {
    // nothing to verify, show fallback so screen isn't blank
    return (
      <View style={[styles.container, {justifyContent: 'center', alignItems: 'center'}]}>
        <Text style={{fontSize:16, color:'#333'}}>No email provided</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{marginTop:20}}>
          <Text style={{color:'#2c7360',fontWeight:'600'}}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Show code for debugging if available */}
      {code && (
        <Text style={styles.debugCode}>Code: {code}</Text>
      )}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <View style={styles.header}>
        {/* <Text style={styles.emoji}></Text> */}
        <Text style={styles.title}>Verify Your Email</Text>
        <Text style={styles.subtitle}>
          We sent a {OTPLENGTH}-digit code to{"\n"}
          <Text style={styles.emailHighlight}>{email}</Text>
        </Text>

        <Text style={styles.demoHint}>(Demo: use 123456)</Text>
      </View>

      <View style={styles.otpRow}>
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            ref={inputRefs.current[index]}
            style={[styles.otpBox, digit && styles.otpBoxFilled]}
            value={digit}
            onChangeText={(text) => handleOtpChange(text, index)}
            onKeyPress={(e) => handleKeyPress(e, index)}
            keyboardType="numeric"
            maxLength={1}
            textAlign="center"
            selectTextOnFocus
          />
        ))}
      </View>

      <TouchableOpacity
        style={[styles.verifyBtn, isVerifying && styles.verifyBtnDisabled]}
        onPress={() => verifyOtp()}
        disabled={isVerifying}
      >
        <Text style={styles.verifyBtnText}>
          {isVerifying ? "Verifying..." : "Verify Code"}
        </Text>
      </TouchableOpacity>

      <View style={styles.resendSection}>
        <Text style={styles.resendLabel}>Didn't receive the code?</Text>

        {canResend ? (
          <TouchableOpacity onPress={handleResend}>
            <Text style={styles.resendLink}>Resend OTP</Text>
          </TouchableOpacity>
        ) : (
          <Text style={styles.timerText}>
            Resend in{" "}
            <Text style={styles.timerNumber}>{formatTime(secondsLeft)}</Text>
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f4ff",
    padding: 24,
    paddingTop: 60,
  },
  backButton: {
    marginBottom: 30,
  },
  backText: {
    color: "#2c7360",
    fontSize: 16,
    fontWeight: "600",
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  emoji: {
    fontSize: 60,
    marginBottom: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#2c7360",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
  },
  emailHighlight: {
    fontWeight: "bold",
    color: "#2c7360",
  },
  demoHint: {
    marginTop: 8,
    fontSize: 12,
    color: "#ff9800",
    fontStyle: "italic",
  },
  otpRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    marginBottom: 36,
  },
  otpBox: {
    width: 48,
    height: 56,
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#dde1f0",
    borderRadius: 12,
    fontSize: 22,
    fontWeight: "bold",
    color: "#2c7360",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 3,
  },
  otpBoxFilled: {
    borderColor: "#2c7360",
    backgroundColor: "#eef0ff",
  },
  verifyBtn: {
    backgroundColor: "#2c7360",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginHorizontal: 4,
    marginBottom: 24,
  },
  verifyBtnDisabled: {
    backgroundColor: "#9fa8da",
  },
  verifyBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  resendSection: {
    alignItems: "center",
    gap: 8,
  },
  resendLabel: {
    color: "#888",
    fontSize: 14,
  },
  resendLink: {
    color: "#2c7360",
    fontSize: 15,
    fontWeight: "bold",
  },
  timerText: {
    color: "#888",
    fontSize: 14,
  },
  timerNumber: {
    color: "#2c7360",
    fontWeight: "bold",
  },
});
export default OTPScreen;
