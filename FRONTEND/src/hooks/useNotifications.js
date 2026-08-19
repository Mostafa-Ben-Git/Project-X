import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import * as api from "@/api/notifications";

export function useNotifications() {
  const qc = useQueryClient();
  const KEY = ["notifications"];

  const refresh = () => {
    qc.invalidateQueries({ queryKey: KEY });
    qc.invalidateQueries({ queryKey: [KEY[0], "unread"] });
  };

  const notifications = useInfiniteQuery({
    queryKey: KEY,
    queryFn: ({ pageParam }) => api.fetchNotifications({ pageParam }),
    initialPageParam: 1,
    getNextPageParam: (last) =>
      last.meta.current_page < last.meta.last_page
        ? last.meta.current_page + 1
        : undefined,
  });

  const unreadCount = useQuery({
    queryKey: [KEY[0], "unread"],
    queryFn: api.getUnreadCount,
    staleTime: 15_000,
  });

  const markRead = useMutation({
    mutationFn: api.markNotificationRead,
    onMutate: (id) => {
      // optimistic cache write
      qc.setQueryData(KEY, (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            data: page.data.map((n) =>
              n.id === id ? { ...n, read_at: n.read_at ?? new Date().toISOString() } : n,
            ),
          })),
        };
      });
      qc.setQueryData([KEY[0], "unread"], (c) => Math.max(0, (c ?? 1) - 1));
    },
    onSettled: refresh,
  });

  const markAllRead = useMutation({
    mutationFn: api.markAllNotificationsRead,
    onMutate: () => {
      qc.setQueryData([KEY[0], "unread"], 0);
      qc.setQueryData(KEY, (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            data: page.data.map((n) => ({
              ...n,
              read_at: n.read_at ?? new Date().toISOString(),
            })),
          })),
        };
      });
    },
    onSuccess: () => toast.success("All notifications marked as read"),
    onSettled: refresh,
  });

  const all = notifications.data?.pages.flatMap((p) => p.data) ?? [];

  return {
    notifications: all,
    unreadCount: unreadCount.data ?? 0,
    isLoading: notifications.isLoading,
    isError: notifications.isError,
    fetchNextPage: notifications.fetchNextPage,
    hasNextPage: notifications.hasNextPage,
    isFetchingNextPage: notifications.isFetchingNextPage,
    markRead: (id) => markRead.mutate(id),
    markAllRead: () => markAllRead.mutate(),
  };
}
