import { useQuery } from "@tanstack/react-query";
import apiService from "@/api/apiService";

export function useUserProfile(username) {
  return useQuery({
    queryKey: ["profile", username],
    queryFn: async () => {
      const { data } = await apiService.get(`/api/profiles/${username}`);
      return data.data;
    },
    enabled: !!username,
    staleTime: 30_000,
  });
}
