import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  isRefreshing = false;
  failedQueue = [];
};

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error.config;

    const isAuthRoute =
      originalRequest.url.includes("/login") ||
      originalRequest.url.includes("/register") ||
      originalRequest.url.includes("/me");

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isAuthRoute
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      return api
        .get("/api/v1/user/me")
        .then((res) => {
          if (res.status === 200 && res.data.success) {
            processQueue(null);
            return api(originalRequest);
          } else {
            localStorage.removeItem("token");
            processQueue(new Error("Session expired"), null);
            window.location.href = "/login";
            return Promise.reject(error);
          }
        })
        .catch((err) => {
          localStorage.removeItem("token");
          processQueue(err, null);
          window.location.href = "/login";
          return Promise.reject(err);
        });
    }

    return Promise.reject(error);
  },
);

export default api;
