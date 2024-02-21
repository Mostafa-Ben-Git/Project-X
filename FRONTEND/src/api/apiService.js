import axios from "axios";

const apiService = axios.create({
  baseURL: "http://localhost:8000",
  withCredentials: true,
  withXSRFToken: true,
});

apiService.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Check if the error is related to CSRF token
    if (error.response && error.response.status === 419) {
      // Try to refresh the CSRF token by making a request to /sanctum/csrf-cookie
      try {
        await apiService.get("/sanctum/csrf-cookie");
        // Retry the original request
        return apiService.request(error.config);
      } catch (csrfError) {
        // Handle error while refreshing CSRF token (e.g., redirect to login)
        console.error("Error refreshing CSRF token:", csrfError);
        throw csrfError;
      }
    }
    // For other errors, just throw the original error
    throw error;
  }
);

apiService.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("token");

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
      config.headers["Content-Type"] = `application/json`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiService;
