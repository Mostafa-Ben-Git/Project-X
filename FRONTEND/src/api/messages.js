import apiService from "@/api/apiService";

export async function fetchConversations() {
  const { data } = await apiService.get("/api/conversations");
  return data.data;
}

export async function fetchMessagesWith(userId) {
  const { data } = await apiService.get(`/api/messages/${userId}`);
  return data.data;
}

export async function sendMessage(userId, content, imageFile = null) {
  if (imageFile) {
    const fd = new FormData();
    if (content) fd.append("content", content);
    fd.append("image", imageFile);
    const { data } = await apiService.post(`/api/messages/${userId}`, fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  }
  const { data } = await apiService.post(`/api/messages/${userId}`, { content });
  return data;
}

// ── Secure room helpers (encrypted URL) ──
export async function getRoomForUser(userId) {
  const { data } = await apiService.get(`/api/users/${userId}/room`);
  return data.room;
}

export async function fetchMessagesByRoom(room) {
  const { data } = await apiService.get(`/api/messages/room/${encodeURIComponent(room)}`);
  return data.data;
}

export async function sendMessageToRoom(room, content, imageFile = null) {
  if (imageFile) {
    const fd = new FormData();
    if (content) fd.append("content", content);
    fd.append("image", imageFile);
    const { data } = await apiService.post(`/api/messages/room/${encodeURIComponent(room)}`, fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  }
  const { data } = await apiService.post(`/api/messages/room/${encodeURIComponent(room)}`, { content });
  return data;
}

export async function resolveRoom(room) {
  const { data } = await apiService.get(`/api/messages/room/${encodeURIComponent(room)}/resolve`);
  return data.partner;
}

export async function replyToMessage(room, messageId, content, imageFile = null) {
  if (imageFile) {
    const fd = new FormData();
    if (content) fd.append("content", content);
    fd.append("image", imageFile);
    const { data } = await apiService.post(`/api/messages/room/${encodeURIComponent(room)}/reply/${messageId}`, fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  }
  const { data } = await apiService.post(`/api/messages/room/${encodeURIComponent(room)}/reply/${messageId}`, { content });
  return data;
}

export async function deleteMessage(room, messageId) {
  const { data } = await apiService.delete(`/api/messages/room/${encodeURIComponent(room)}/${messageId}`);
  return data;
}

export async function togglePin(room, messageId) {
  const { data } = await apiService.post(`/api/messages/room/${encodeURIComponent(room)}/${messageId}/pin`);
  return data;
}

export async function fetchPinned(room) {
  const { data } = await apiService.get(`/api/messages/room/${encodeURIComponent(room)}/pinned`);
  return data.data;
}

export async function getMessagesUnread() {
  const { data } = await apiService.get("/api/messages/unread-count");
  return data.count;
}
