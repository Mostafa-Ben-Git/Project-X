import { useInfiniteQuery } from "@tanstack/react-query";
import { getUserPosts, getUserReplies, getUserLikes } from "@/api/users";

const fetchers = {
  posts: getUserPosts,
  replies: getUserReplies,
  likes: getUserLikes,
};

export function useProfileTabs(userId, tab = "posts") {
  return useInfiniteQuery({
    queryKey: ["profile", userId, tab],
    queryFn: ({ pageParam = 1 }) => fetchers[tab](userId, { pageParam }),
    getNextPageParam: (lastPage) => {
      const meta = lastPage.meta;
      return meta?.current_page < meta?.last_page ? meta.current_page + 1 : undefined;
    },
    enabled: !!userId,
    staleTime: 30_000,
  });
}
