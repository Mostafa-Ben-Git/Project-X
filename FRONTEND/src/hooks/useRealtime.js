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

      channel.listen(".notification.created", (payload) => {
        qc.invalidateQueries({ queryKey: ["notifications"] });
        qc.invalidateQueries({ queryKey: ["notifications", "unread"] });
        const from = payload?.from_user;
        if (!from?.first_name) return;
        // Messages are surfaced by the .message.sent handler; skip here to avoid duplicates.
        if (payload.type === "message") return;
        const label = TYPE_LABELS[payload.type] || "notified you";
        toast(`${from.first_name} ${from.last_name} ${label}`, {
          action: {
            label: "View",
            onClick: () => navigate("/home"),
          },
        });
      });

      channel.listen(".message.sent", (payload) => {
        qc.invalidateQueries({ queryKey: ["conversations"] });
        qc.invalidateQueries({ queryKey: ["messages"] });
        qc.invalidateQueries({ queryKey: ["messages", "unread"] });
        if (payload && payload.sender_id !== userId) {
          qc.invalidateQueries({ queryKey: ["user", payload.sender_id] });
          const from = payload?.sender;
          // Mark incoming message delivered/unread via stale invalidation
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
  }, [userId, qc, navigate]);

  return { connected };
}
