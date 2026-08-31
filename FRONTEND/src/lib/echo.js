import Echo from "laravel-echo";
import Pusher from "pusher-js";

export function getAuthHeaders() {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

let echoInstance = null;

export function connectEcho() {
  if (echoInstance) return echoInstance;
  if (typeof window === "undefined") return null;

  window.Pusher = Pusher;

  echoInstance = new Echo({
    broadcaster: "reverb",
    key: import.meta.env.VITE_REVERB_APP_KEY || "projectx-key",
    wsHost: import.meta.env.VITE_REVERB_HOST || window.location.hostname || "localhost",
    wsPort: Number(import.meta.env.VITE_REVERB_PORT || 8080),
    forceTLS: false,
    enabledTransports: ["ws", "wss"],
    disableStats: true,
    authEndpoint: "/broadcasting/auth",
    auth: {
      headers: getAuthHeaders(),
    },
  });

  return echoInstance;
}

export function disconnectEcho() {
  if (echoInstance) {
    echoInstance.disconnect();
    echoInstance = null;
  }
}

export default connectEcho;
