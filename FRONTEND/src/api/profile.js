import apiService from "@/api/apiService";

export async function getProfile(userId) {
  const { data } = await apiService.get(`/api/users/${userId}`);
  return data.data ?? data;
}

export async function updateProfile(formData) {
  const { data } = await apiService.post("/api/profile", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}
