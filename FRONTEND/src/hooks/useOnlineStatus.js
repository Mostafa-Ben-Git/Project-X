import { useEffect, useCallback, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { connectEcho } from "@/lib/echo";

/**
 * Joins the "online-users" presence channel and listens for
 * real-time status updates from ALL connected users.
 *
 * Returns a Set of user IDs that are currently online.
 */
export function useOnlineStatus() {
  const qc = useQueryClient();
  const channelRef = useRef(null);

  const handleStatusUpdate = useCallback(
    (payload) => {
      const { user_id, status, last_active_at } = payload;
      if (!user_id) return;

      // Update any cached user data with the new status
      qc.setQueryData(["user", user_id], (old) => {
        if (!old) return old;
        return { ...old, status, last_active_at };
      });

      // Also update conversations list
      qc.invalidateQueries({ queryKey: ["conversations"] });
    },
    [qc],
  );

  useEffect(() => {
    let channel;
    try {
      const echo = connectEcho();
      if (!echo) return;

      channel = echo.join("online-users");

      channel.listen(".user.status.updated", handleStatusUpdate);

      channelRef.current = channel;
    } catch (e) {
      console.warn("Online status channel failed:", e);
    }

    return () => {
      if (channelRef.current) {
        try {
          channelRef.current.stopListening(".user.status.updated");
          channelRef.current.leave();
        } catch {
          /* noop */
        }
        channelRef.current = null;
      }
    };
  }, [handleStatusUpdate]);

  return { channel: channelRef.current };
}
