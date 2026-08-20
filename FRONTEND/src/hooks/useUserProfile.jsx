import { useQuery } from "@tanstack/react-query";
import apiService from "@/api/apiService";
import { EmptyState } from "@/components/empty-state";

export function useUserProfile(username) {
  return useQuery({
    queryKey: ["profile", username],
    queryFn: async () => {
      // UserResource has $wrap = null, so the response body IS the user object.
      const { data } = await apiService.get(`/api/profiles/${username}`);
      if (!data || data?.id == null) {
        throw new Error("User not found");
      }
      return data;
    },
    enabled: !!username,
    retry: false,
    staleTime: 30_000,
  });
}

// Render helper for callers that need to show a 404 state on missing user.
export function ProfileNotFound() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <EmptyState
        title="User not found"
        message="This account doesn't exist or may have been removed."
      />
    </main>
  );
}
