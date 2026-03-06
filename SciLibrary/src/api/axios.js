import axios from "axios";
import { Platform } from "react-native";

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
