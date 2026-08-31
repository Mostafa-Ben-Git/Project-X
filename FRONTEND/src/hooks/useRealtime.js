import { useEffect, useRef, useState } from "react";
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
  // Accumulate rapid incoming messages so we show ONE grouped toast with a count
  const pendingMessages = useRef([]);
  const toastTimer = useRef(null);

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
          qc.invalidateQueries({ queryKey: ["notifications"] });
          qc.invalidateQueries({ queryKey: ["notifications", "unread"] });
          // Suppress toast if user is currently inside a message room (they'll see the bubble + arrow indicator)
          const inMessageRoom = window.location.pathname.startsWith("/messages/");
          if (inMessageRoom) return;
          // Debounce/group rapid incoming messages into a single toast with a count
          const from = payload?.sender;
          const name = from
            ? `${from.first_name} ${from.last_name}`
            : "Someone";
          const preview = payload.content || (payload.image_url ? "📷 Image" : "");
          pendingMessages.current.push({ name, preview, senderId: payload.sender_id });
          if (toastTimer.current) clearTimeout(toastTimer.current);
          toastTimer.current = setTimeout(() => {
            toastTimer.current = null;
            const batch = pendingMessages.current;
            pendingMessages.current = [];
            if (batch.length === 0) return;
            const last = batch[batch.length - 1];
            toast(batch.length > 1 ? `${batch.length} new messages` : "New message", {
              description: `${last.name}: ${last.preview}`,
              action: {
                label: "Open chat",
                onClick: () => navigate(`/messages/${last.senderId}`),
              },
            });
          }, 1200);
        } else if (payload && payload.sender_id === userId) {
          qc.invalidateQueries({ queryKey: ["messages", payload.receiver_id] });
        }
      });

      // Status updates are now handled by useOnlineStatus (presence channel)

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
      if (toastTimer.current) clearTimeout(toastTimer.current);
      pendingMessages.current = [];
    };
  }, [userId, qc, navigate]);

  return { connected };
}
