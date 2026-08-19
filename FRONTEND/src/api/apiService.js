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

// Heartbeat: update last_active_at periodically
let heartbeatInterval = null;

export function startHeartbeat() {
  if (heartbeatInterval) return;
  heartbeatInterval = setInterval(() => {
    apiService.post("/api/heartbeat").catch(() => {});
  }, 30_000); // every 30s

  // Set offline on browser close / tab close
  window.addEventListener("beforeunload", setOffline);
}

export function stopHeartbeat() {
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
    heartbeatInterval = null;
  }
  window.removeEventListener("beforeunload", setOffline);
}

// Set user offline immediately (best-effort via sendBeacon)
function setOffline() {
  const token = localStorage.getItem("token");
  if (!token) return;
  const blob = new Blob([JSON.stringify({ status: "offline" })], { type: "application/json" });
  navigator.sendBeacon?.(
    `${window.location.origin}/api/status`,
    new Request("/api/status", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: blob,
    })
  );
}

export default apiService;
