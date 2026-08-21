import apiService from "@/api/apiService";

export async function fetchPosts({ pageParam = 1 } = {}) {
  const { data } = await apiService.get(`/api/posts?page=${pageParam}`);
  return data;
}

export async function getPost(username, postId) {
  const { data } = await apiService.get(`/api/${username}/post/${postId}`);
  return data;
}

export async function createPost(payload) {
  const { data } = await apiService.post("/api/posts", payload);
  return data;
}

export async function updatePost(postId, payload) {
  const { data } = await apiService.post(`/api/post/${postId}/update`, payload);
  return data;
}

export async function deletePost(postId) {
  const { data } = await apiService.delete(`/api/posts/${postId}`);
  return data;
}

export async function toggleLike(postId) {
  const { data } = await apiService.post(`/api/posts/${postId}/changeLikeStatus`);
  return data;
}

export async function recordView(postId) {
  const { data } = await apiService.post(`/api/posts/${postId}/view`);
  return data;
}

export async function toggleBookmark(postId) {
  const { data } = await apiService.post(`/api/posts/${postId}/bookmark`);
  return data;
}

export async function fetchBookmarks({ pageParam = 1 } = {}) {
  const { data } = await apiService.get(`/api/bookmarks?page=${pageParam}`);
  return data;
}

export async function fetchPostComments(postId, { pageParam = 1 } = {}) {
  const { data } = await apiService.get(`/api/posts/${postId}/comments?page=${pageParam}`);
  return data;
}
