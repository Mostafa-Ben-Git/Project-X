import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { connectEcho, disconnectEcho } from "@/lib/echo";
import { toast } from "sonner";

export function useRealtime(userId) {
  const qc = useQueryClient();
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!userId) return;

    let channel;
    try {
      const echo = connectEcho();
      if (!echo) return;

      channel = echo.private(`user.${userId}`);

      channel.listen(".notification.created", (payload) => {
        qc.invalidateQueries({ queryKey: ["notifications"] });
        qc.invalidateQueries({ queryKey: ["notifications", "unread"] });
        if (payload?.from_user?.username) {
          toast(`${payload.from_user.first_name} ${payload.from_user.last_name} — ${payload.content}`);
        }
      });

      channel.listen(".message.sent", (payload) => {
        qc.invalidateQueries({ queryKey: ["conversations"] });
        qc.invalidateQueries({ queryKey: ["messages"] });
      });

      setConnected(true);
    } catch (e) {
      console.warn("Realtime connection failed:", e);
    }

    return () => {
      try {
        channel?.stopListening(".notification.created");
        channel?.stopListening(".message.sent");
      } catch {
        /* noop */
      }
    };
  }, [userId, qc]);

  return { connected };
}
