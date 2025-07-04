// src/api/axios.ts
import axios from "axios";
import { useAuth } from "../hooks/useAuth";

const url = "http://localhost:8081/";
// const url = "http://168.220.237.8:8000/";

const api = axios.create({
  baseURL: `${url}api/`
});

// Add request interceptor to inject token
api.interceptors.request.use(
  async (config) => {
    // Get token from auth context or storage
    const authState = localStorage.getItem('authState');
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
      // Handle unauthorized error
      localStorage.removeItem('authState');
      window.location.href = '/login'; // Redirect to login
    }
    return Promise.reject(error);
  }
);

export default api;





