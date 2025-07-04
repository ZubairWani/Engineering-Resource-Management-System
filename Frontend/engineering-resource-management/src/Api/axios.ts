// // src/api/axios.ts
// import axios from "axios";
// import { useAuth } from "../hooks/useAuth";

// const url = "http://localhost:8081/";
// // const url = "http://168.220.237.8:8000/";

// const api = axios.create({
//   baseURL: `${url}api/`
// });

// // Add request interceptor to inject token
// api.interceptors.request.use(
//   async (config) => {
//     // Get token from auth context or storage
//     const authState = localStorage.getItem('authState');
//     const token = authState ? JSON.parse(authState).token : null;
   
//     if (token) {
//       config.headers.authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

// // Add response interceptor to handle 401 errors
// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status === 401) {
//       // Handle unauthorized error
//       localStorage.removeItem('authState');
//       window.location.href = '/login'; // Redirect to login
//     }
//     return Promise.reject(error);
//   }
// );

// export default api;







// src/api/axios.ts
import axios from "axios";

const LOCAL_BACKEND = "http://localhost:8081/";
const RENDER_BACKEND = "https://engineering-resource-management-system-oiua.onrender.com/";

const api = axios.create({
  baseURL: `${LOCAL_BACKEND}api/`, // Default to local
  timeout: 5000, // 5s timeout
  withCredentials: true, // For cookies/sessions
});

// Health check endpoint (must match your backend)
const checkBackendHealth = async (url: string) => {
  try {
    await axios.get(`${url}api/health-check`, { timeout: 2000 });
    return true;
  } catch {
    return false;
  }
};

// Fallback to Render if local fails
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Skip if already retried or not a network error
    if (originalRequest._retry || !["ERR_NETWORK", "ECONNREFUSED"].includes(error.code)) {
      return Promise.reject(error);
    }

    console.log("Local backend failed, trying Render fallback...");
    originalRequest._retry = true;

    // Switch to Render backend if healthy
    if (await checkBackendHealth(RENDER_BACKEND)) {
      api.defaults.baseURL = `${RENDER_BACKEND}api/`;
      return api(originalRequest);
    }

    return Promise.reject(error);
  }
);

export default api;