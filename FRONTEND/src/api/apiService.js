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

// Response interceptor: handle auth errors and 429 rate limiting
apiService.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status;

    if (status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("userLogedIn");
      window.location.href = "/login";
    }

    // 429: back off and retry once
    if (status === 429) {
      const retryAfter = error.response?.headers?.["retry-after"] || 2;
      const delay = Math.min(Number(retryAfter) * 1000, 5000);
      await new Promise((resolve) => setTimeout(resolve, delay));
      const config = { ...error.config, _retried: true };
      if (!config._retried) {
        return apiService.request(config);
      }
    }

    throw error;
  }
);

export default apiService;
