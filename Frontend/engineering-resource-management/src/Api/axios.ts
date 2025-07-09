// // src/api/axios.ts
// import axios from "axios";

// const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8081/api/";

// const api = axios.create({
//   baseURL: baseURL,
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

let baseURL = "https://engineering-resource-management-system-2lkf.onrender.com/api/"; // default to live

// Attempt to check if local backend is running
try {
  const response = await fetch("http://localhost:8081/api/ping", { method: "GET" });
  if (response.ok) {
    baseURL = "http://localhost:8081/api/";
  }
} catch (err) {
  // Local backend is not running, fallback to live
  console.warn("Local backend not available, using live backend.");
}

const api = axios.create({
  baseURL: baseURL,
});

// Add request interceptor to inject token
api.interceptors.request.use(
  async (config) => {
    const authState = localStorage.getItem("authState");
    const token = authState ? JSON.parse(authState).token : null;

    if (token) {
      config.headers.authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("authState");
      window.location.href = "/login";
    }
    return Promise.reject(error); 
  }
);

export default api;
