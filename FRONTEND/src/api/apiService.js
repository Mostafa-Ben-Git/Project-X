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
      // Retry ONCE after a short delay — absorbs transient 401s during a
      // frontend redeploy (non-atomic asset copy / config:clear cold boot).
      // If the retry also 401s, the session is genuinely dead → log out.
      if (!error.config.__authRetry) {
        error.config.__authRetry = true;
        await new Promise((r) => setTimeout(r, 1500));
        try {
          await apiService.get("/api/user");
          // Re-validation succeeded: session is alive, don't log out.
          return Promise.reject({ ...error, __absorbed: true });
        } catch (retryErr) {
          if (retryErr?.response?.status !== 401) {
            // Not a 401 on retry — leave as-is, don't wipe session.
            return Promise.reject(error);
          }
        }
      }
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

  // Set offline when user switches tabs (hidden), online when they come back (visible)
  document.addEventListener("visibilitychange", handleVisibilityChange);
}

export function stopHeartbeat() {
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
    heartbeatInterval = null;
  }
  window.removeEventListener("beforeunload", setOffline);
  document.removeEventListener("visibilitychange", handleVisibilityChange);
}

function handleVisibilityChange() {
  if (document.hidden) {
    setOffline();
  } else {
    // Tab became visible again — immediately ping online
    apiService.post("/api/heartbeat").catch(() => {});
  }
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
