import { useState, useRef, useCallback, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import useAuth from "@/hooks/useAuth";
import { useFollow } from "@/hooks/useFollow";
import { useUserProfile, ProfileNotFound } from "@/hooks/useUserProfile";
import { useProfileTabs } from "@/hooks/useProfileTabs";
import { getUserPostsCount, getUserRepliesCount, getUserRepostsCount } from "@/api/users";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Post from "@/features/post/Post";
import { EmptyState } from "@/components/empty-state";
import { Calendar, Camera } from "lucide-react";
import { format } from "date-fns";

function ProfilePage() {
  const { username } = useParams();
  const { user: currentUser } = useAuth();
  const { handleFollow, isPending } = useFollow();
  const [activeTab, setActiveTab] = useState("posts");

  const { data: profileUser, isLoading: profileLoading } = useUserProfile(username);
  const displayUser = username ? profileUser : currentUser;
  const userId = displayUser?.id;

  // isFollowing: start false, sync from server once profile loads
  const [isFollowing, setIsFollowing] = useState(false);
  const [followPending, setFollowPending] = useState(false);

  useEffect(() => {
    if (displayUser?.is_following != null) {
      setIsFollowing(displayUser.is_following);
    }
  }, [displayUser?.is_following]);

  const onFollow = async () => {
    if (isPending || !userId) return;
    setFollowPending(true);
    setIsFollowing((prev) => !prev); // optimistic
    try {
      await handleFollow(userId);
    } catch {
      setIsFollowing((prev) => !prev); // rollback
    } finally {
      setFollowPending(false);
    }
  };

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useProfileTabs(userId, activeTab);

  const { data: postsCount } = useQuery({
    queryKey: ["user-posts-count", userId],
    queryFn: () => getUserPostsCount(userId),
    enabled: !!userId,
  });
  const { data: repliesCount } = useQuery({
    queryKey: ["user-replies-count", userId],
    queryFn: () => getUserRepliesCount(userId),
    enabled: !!userId,
  });
  const { data: repostsCount } = useQuery({
    queryKey: ["user-reposts-count", userId],
    queryFn: () => getUserRepostsCount(userId),
    enabled: !!userId,
  });

  const posts = data?.pages?.flatMap((p) => p.data) ?? [];

  const observerRef = useRef();
  const lastPostRef = useCallback(
    (node) => {
      if (isFetchingNextPage) return;
      if (observerRef.current) observerRef.current.disconnect();
      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasNextPage) fetchNextPage();
      });
      if (node) observerRef.current.observe(node);
    },
    [isFetchingNextPage, hasNextPage, fetchNextPage]
  );

  if (profileLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (username && !profileUser) return <ProfileNotFound />;

  if (!displayUser) return null;

  const isOwn = currentUser?.id === displayUser.id;

  const joinedDate = displayUser.created_at
    ? format(new Date(displayUser.created_at), "MMMM yyyy")
    : null;

  return (
    <main className="mx-auto max-w-2xl">
      {/* Cover */}
      <div className="relative h-48 bg-muted">
        {displayUser.cover_image && (
          <img src={displayUser.cover_image} alt="" className="h-full w-full object-cover" loading="lazy" />
        )}
        {isOwn && (
          <Link
            to="/settings/profile"
            className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-md bg-black/60 px-3 py-1.5 text-xs font-medium text-white backdrop-blur transition hover:bg-black/75"
          >
            <Camera className="h-3.5 w-3.5" />
            {displayUser.cover_image ? "Change cover" : "Add cover"}
          </Link>
        )}
      </div>

      {/* Profile header */}
      <div className="relative px-4 pb-4">
        <div className="-mt-16 flex items-end justify-between">
          <Avatar className="h-28 w-28 border-4 border-background">
            <AvatarImage src={displayUser.avatar} loading="lazy" />
            <AvatarFallback className="text-2xl">
              {displayUser.first_name?.[0]}{displayUser.last_name?.[0]}
            </AvatarFallback>
          </Avatar>
          {isOwn ? (
            <Link to="/settings/profile">
              <Button variant="outline" size="sm">Edit profile</Button>
            </Link>
          ) : (
            <Button
              variant={isFollowing ? "outline" : "default"}
              size="sm"
              disabled={followPending}
              onClick={onFollow}
            >
              {isFollowing ? "Following" : "Follow"}
            </Button>
          )}
        </div>

        <h2 className="mt-2 text-xl font-bold">{displayUser.first_name} {displayUser.last_name}</h2>
        <p className="text-sm text-muted-foreground">@{displayUser.username}</p>
        {displayUser.bio && <p className="mt-1 text-sm text-muted-foreground">{displayUser.bio}</p>}

        <div className="mt-3 flex gap-6 text-sm text-muted-foreground">
          <span><strong className="text-foreground">{displayUser.followers_count ?? 0}</strong> followers</span>
          <span><strong className="text-foreground">{displayUser.following_count ?? 0}</strong> following</span>
          <span><strong className="text-foreground">{displayUser.posts_count ?? 0}</strong> posts</span>
        </div>
        {joinedDate && (
          <div className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Joined {joinedDate}</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="border-t">
        <TabsList className="w-full rounded-none">
          <TabsTrigger value="posts" className="flex-1">
            Posts{postsCount != null && <span className="ml-1 text-muted-foreground">({postsCount})</span>}
          </TabsTrigger>
          <TabsTrigger value="replies" className="flex-1">
            Replies{repliesCount != null && <span className="ml-1 text-muted-foreground">({repliesCount})</span>}
          </TabsTrigger>
          <TabsTrigger value="reposts" className="flex-1">
            Reposts{repostsCount != null && <span className="ml-1 text-muted-foreground">({repostsCount})</span>}
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-0">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : posts.length === 0 ? (
            <EmptyState title="Nothing here yet" message={`No ${activeTab} to show.`} />
          ) : (
            <div className="divide-y">
              {posts.map((post, i) => (
                <Post
                  key={post.post_id}
                  {...post}
                  postData={post}
                  innerRef={i === posts.length - 1 ? lastPostRef : undefined}
                  className="cursor-pointer"
                />
              ))}
            </div>
          )}
          {isFetchingNextPage && (
            <div className="flex justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          )}
        </TabsContent>
      </Tabs>
    </main>
  );
}

export default ProfilePage;
