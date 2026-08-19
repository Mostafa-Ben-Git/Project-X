import apiService from "@/api/apiService";

export async function getSuggestions() {
  const { data } = await apiService.get("/api/user/suggestions");
  return data.data;
}

export async function getFollowers(userId) {
  const { data } = await apiService.get(`/api/users/${userId}/followers`);
  return data.data;
}

export async function getFollowing(userId) {
  const { data } = await apiService.get(`/api/users/${userId}/following`);
  return data.data;
}

export async function searchUsers(query) {
  const { data } = await apiService.get("/api/users/search", { params: { q: query } });
  return data.data;
}

export async function toggleFollow(userId) {
  const { data } = await apiService.post(`/api/users/${userId}/changeFollowStatus`);
  return data;
}
