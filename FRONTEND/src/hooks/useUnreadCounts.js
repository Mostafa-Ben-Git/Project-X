import { useQuery } from "@tanstack/react-query";
import { getUnreadCount } from "@/api/notifications";
import { getMessagesUnread } from "@/api/messages";

/**
 * Central store of unread badge counts (notifications + messages).
 * Invalidated by the realtime hook so badges update live.
 */
export function useUnreadCounts() {
  const notifications = useQuery({
    queryKey: ["notifications", "unread"],
    queryFn: getUnreadCount,
    staleTime: 15_000,
  });

  const messages = useQuery({
    queryKey: ["messages", "unread"],
    queryFn: getMessagesUnread,
    staleTime: 15_000,
  });

  return {
    notifications: notifications.data ?? 0,
    messages: messages.data ?? 0,
  };
}
