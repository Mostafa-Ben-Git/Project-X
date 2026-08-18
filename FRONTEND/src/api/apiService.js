import axios from "axios";

const apiService = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "",
  withCredentials: false,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Bearer token interceptor - sends token from localStorage on every request
apiService.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle auth errors
apiService.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("userLogedIn");
      window.location.href = "/login";
    }
    throw error;
  }
);

export default apiService;
