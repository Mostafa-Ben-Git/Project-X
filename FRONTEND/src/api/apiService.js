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
    // Let browser set Content-Type automatically for FormData (multipart)
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle auth errors and 429 rate limiting
let isLoggingOut = false;

function forceLogout() {
  if (isLoggingOut) return;
  isLoggingOut = true;
  localStorage.removeItem("token");
  localStorage.removeItem("userLogedIn");
  // Avoid redirect loop if already on login
  if (window.location.pathname !== "/login") {
    window.location.href = "/login";
  }
}

apiService.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Retry probe must bypass this interceptor to avoid recursion
    if (error?.config?.__skipAuthRetry) {
      throw error;
    }

    const status = error?.response?.status;
    const url = error?.config?.url || "";

    // Any 401 from our API with a stored token means the session is dead
    // (e.g. DB was re-seeded and tokens were wiped). We must handle
    // /api/posts, /api/conversations etc. — otherwise the UI just shows
    // {"message":"Unauthenticated."} and stays locked on the protected route.
    const isApiRequest = url.includes("/api/");
    const isAuthEndpoint = url.includes("/api/token-login") || url.includes("/register");
    const hasToken = !!localStorage.getItem("token");

    if (status === 401 && isApiRequest && !isAuthEndpoint && hasToken) {
      // Retry ONCE after a short delay — absorbs transient 401s during a
      // frontend redeploy (non-atomic asset copy / config:clear cold boot).
      // For a real invalid token (fresh seed) the retry will also 401 → logout.
      if (!error.config.__authRetry) {
        error.config.__authRetry = true;
        await new Promise((r) => setTimeout(r, 1500));
        try {
          // Use skip flag so this probe doesn't re-enter the interceptor
          await apiService.get("/api/user", { __skipAuthRetry: true });
          // Re-validation succeeded: session is alive, don't log out.
          return Promise.reject({ ...error, __absorbed: true });
        } catch (retryErr) {
          if (retryErr?.response?.status !== 401) {
            // Not a 401 on retry — transient/server error, don't wipe session.
            return Promise.reject(error);
          }
        }
      }
      forceLogout();
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
