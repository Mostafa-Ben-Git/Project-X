import axios from "axios";

const apiService = axios.create({
  baseURL: "http://localhost:8000",
  withCredentials: true,
  withXSRFToken: true,
});

apiService.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 419) {
      try {
        await apiService.get("/sanctum/csrf-cookie");

        return apiService.request(error.config);
      } catch (csrfError) {
        console.error("Error refreshing CSRF token:", csrfError);
        throw csrfError;
      }
    }
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
