import axios from "axios";

// Reads from VITE_API_BASE_URL in .env
// In development this is empty — requests go through the Vite proxy.
// In production set it to your backend origin (e.g. https://api.yourdomain.com).
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
