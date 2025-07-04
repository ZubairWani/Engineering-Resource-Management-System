import axios from 'axios';
// We can no longer import from a store here

const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add the auth token to every request
api.interceptors.request.use(
  (config) => {
    let token: string | null = null;
    try {
      // Get the entire auth state from localStorage
      const storedState = localStorage.getItem('authState');
      if (storedState) {
        // Parse it and extract the token
        const authState = JSON.parse(storedState);
        token = authState.token;
      }
    } catch (error) {
      console.error("Could not parse auth token from localStorage", error);
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;