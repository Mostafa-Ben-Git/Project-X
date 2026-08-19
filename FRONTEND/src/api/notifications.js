import apiService from "@/api/apiService";

export async function fetchNotifications({ pageParam = 1 } = {}) {
  const { data } = await apiService.get(`/api/notifications?page=${pageParam}`);
  return data;
}

export async function getUnreadCount() {
  const { data } = await apiService.get("/api/notifications/unread-count");
  return data.count;
}

export async function markNotificationRead(id) {
  return apiService.post(`/api/notifications/${id}/read`);
}

export async function markAllNotificationsRead() {
  return apiService.post("/api/notifications/read-all");
}
