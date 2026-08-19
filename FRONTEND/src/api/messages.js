import apiService from "@/api/apiService";

export async function fetchConversations() {
  const { data } = await apiService.get("/api/conversations");
  return data.data;
}

export async function fetchMessagesWith(userId) {
  const { data } = await apiService.get(`/api/messages/${userId}`);
  return data.data;
}

export async function sendMessage(userId, content) {
  const { data } = await apiService.post(`/api/messages/${userId}`, { content });
  return data;
}

export async function getMessagesUnread() {
  const { data } = await apiService.get("/api/messages/unread-count");
  return data.count;
}
