import axios from "axios";

const apiService = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
  withCredentials: true,
  withXSRFToken: true,
});

// Bearer token interceptor - sends token from localStorage on every request
apiService.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      config.headers["Content-Type"] = "application/json";
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auto-refresh CSRF on 419 errors
apiService.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 419) {
      await apiService.get("/sanctum/csrf-cookie");
      return apiService.request(error.config);
    }
    // Clear token on 401
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("userLogedIn");
    }
    throw error;
  }
);

export default apiService;
