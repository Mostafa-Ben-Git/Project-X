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

    // Only force-logout on 401 from the /api/user endpoint (real auth check).
    // Other 401s may be transient (deploy, server restart) — don't wipe the session.
    if (status === 401 && error?.config?.url?.includes("/api/user")) {
      localStorage.removeItem("token");
      localStorage.removeItem("userLogedIn");
      window.location.href = "/login";
    }

    throw error;
  }
);

export default apiService;
