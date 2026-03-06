import axios from "axios";
import { Platform } from "react-native";

// In Expo/React Native, "localhost" refers to the device/emulator itself.
// When running on a physical device or Android emulator use the machine's
// local network IP or the special Android alias 10.0.2.2. For web we can
// safely use localhost.
let baseURL = "http://localhost:5000";
if (Platform.OS === "android") {
  // Android emulator metro uses 10.0.2.2 to refer to host machine
  baseURL = "http://10.0.2.2:5000";
} else if (Platform.OS === "ios") {
  // ios simulator can use localhost
  baseURL = "http://localhost:5000";
}
// you could also override with an env var like process.env.API_URL when building

const API = axios.create({
    baseURL,
});
export default API; 