import { useQuery, useQueryClient } from "@tanstack/react-query";
import * as api from "@/api/users";

export function useFriends(userId) {
  const qc = useQueryClient();

  const suggestions = useQuery({
    queryKey: ["friends", "suggestions"],
    queryFn: api.getSuggestions,
    staleTime: 30_000,
  });

  const followers = useQuery({
    queryKey: ["friends", "followers"],
    queryFn: () => api.getFollowers(userId),
    enabled: !!userId,
    staleTime: 30_000,
  });

  const following = useQuery({
    queryKey: ["friends", "following"],
    queryFn: () => api.getFollowing(userId),
    enabled: !!userId,
    staleTime: 30_000,
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["friends"] });
    qc.invalidateQueries({ queryKey: ["user"] });
  };

  return {
    suggestions,
    followers,
    following,
    invalidate,
  };
}
