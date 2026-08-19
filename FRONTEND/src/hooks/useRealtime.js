import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { connectEcho } from "@/lib/echo";
import { toast } from "sonner";

const TYPE_LABELS = {
  follow: "started following you",
  like: "liked your post",
  comment: "commented on your post",
  message: "sent you a message",
};

export function useRealtime(userId) {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!userId) return;

    let channel;
    try {
      const echo = connectEcho();
      if (!echo) return;

      channel = echo.private(`user.${userId}`);

      // Listen for notification events
      channel.listen(".notification.created", (payload) => {
        qc.invalidateQueries({ queryKey: ["notifications"] });
        qc.invalidateQueries({ queryKey: ["notifications", "unread"] });
        const from = payload?.from_user;
        if (!from?.first_name) return;
        if (payload.type === "message") return;
        const label = TYPE_LABELS[payload.type] || "notified you";
        toast(`${from.first_name} ${from.last_name} ${label}`, {
          action: {
            label: "View",
            onClick: () => navigate("/home"),
          },
        });
      });

      // Listen for message events
      channel.listen(".message.sent", (payload) => {
        qc.invalidateQueries({ queryKey: ["conversations"] });
        qc.invalidateQueries({ queryKey: ["messages"] });
        qc.invalidateQueries({ queryKey: ["messages", "unread"] });
        if (payload && payload.sender_id !== userId) {
          qc.invalidateQueries({ queryKey: ["user", payload.sender_id] });
          const from = payload?.sender;
          const name = from
            ? `${from.first_name} ${from.last_name}`
            : "Someone";
          toast("New message", {
            description: `${name}: ${payload.content}`,
            action: {
              label: "Open chat",
              onClick: () => navigate(`/messages/${payload.sender_id}`),
            },
          });
        } else if (payload && payload.sender_id === userId) {
          qc.invalidateQueries({ queryKey: ["messages", payload.receiver_id] });
        }
      });

      // Listen for status updates from other users
      channel.listen(".user.status.updated", (payload) => {
        // Update the partner's cached data with new status
        qc.setQueryData(["user", payload.user_id], (old) => {
          if (!old) return old;
          return {
            ...old,
            status: payload.status,
            last_active_at: payload.last_active_at,
          };
        });
        // Also invalidate conversations to refresh status dots
        qc.invalidateQueries({ queryKey: ["conversations"] });
      });

      setConnected(true);
    } catch (e) {
      console.warn("Realtime connection failed:", e);
    }

    return () => {
      try {
        channel?.stopListening(".notification.created");
        channel?.stopListening(".message.sent");
        channel?.stopListening(".user.status.updated");
      } catch {
        /* noop */
      }
    };
  }, [userId, qc, navigate]);

  return { connected };
}
