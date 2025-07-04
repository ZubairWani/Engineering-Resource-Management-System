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

const backends = [
  {
    url: "http://localhost:8081/",
    isActive: true // Will be checked at runtime
  },
  {
    url: "https://engineering-resource-management-system-oiua.onrender.com/",
    isActive: true
  }
];

const api = axios.create({
  baseURL: `${backends[0].url}api/`,
  withCredentials: true // Important for cookies/sessions
});

// Health check function
const checkBackendHealth = async (url: string) => {
  try {
    await axios.get(`${url}api/health-check`, { timeout: 2000 });
    return true;
  } catch {
    return false;
  }
};

// Active backend index
let activeBackendIndex = 0;

// Request interceptor for token
api.interceptors.request.use((config) => {
  const authState = localStorage.getItem('authState');
  const token = authState ? JSON.parse(authState).token : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor with improved error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Handle 401 unauthorized
    if (error.response?.status === 401) {
      localStorage.removeItem('authState');
      window.location.href = '/login';
      return Promise.reject(error);
    }

    // Try fallback if connection failed
    if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED') {
      // Find next active backend
      for (let i = 0; i < backends.length; i++) {
        if (i !== activeBackendIndex && backends[i].isActive) {
          const isHealthy = await checkBackendHealth(backends[i].url);
          if (isHealthy) {
            activeBackendIndex = i;
            api.defaults.baseURL = `${backends[i].url}api/`;
            originalRequest.baseURL = api.defaults.baseURL;
            return api(originalRequest);
          }
        }
      }
    }

    return Promise.reject(error);
  }
);

// Initial health check
(async () => {
  if (!await checkBackendHealth(backends[activeBackendIndex].url)) {
    for (let i = 0; i < backends.length; i++) {
      if (i !== activeBackendIndex) {
        const isHealthy = await checkBackendHealth(backends[i].url);
        if (isHealthy) {
          activeBackendIndex = i;
          api.defaults.baseURL = `${backends[i].url}api/`;
          break;
        }
      }
    }
  }
})();

export default api;