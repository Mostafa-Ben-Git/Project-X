import { useState, useRef, useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import useAuth from "@/hooks/useAuth";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useProfileTabs } from "@/hooks/useProfileTabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Post from "@/features/post/Post";
import { EmptyState } from "@/components/empty-state";

function ProfilePage() {
  const { username } = useParams();
  const { user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState("posts");

  // If username param exists, fetch that user's profile; otherwise use current user
  const { data: profileUser, isLoading: profileLoading } = useUserProfile(username);
  const displayUser = username ? profileUser : currentUser;
  const userId = displayUser?.id;

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useProfileTabs(userId, activeTab);

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

  if (!displayUser) return null;

  const isOwn = currentUser?.id === displayUser.id;

  return (
    <main className="mx-auto max-w-2xl">
      {/* Cover */}
      <div className="relative h-48 bg-muted">
        {displayUser.cover_image && (
          <img src={displayUser.cover_image} alt="" className="h-full w-full object-cover" loading="lazy" />
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
            <Button variant="outline" size="sm">Follow</Button>
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
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="border-t">
        <TabsList className="w-full rounded-none">
          <TabsTrigger value="posts" className="flex-1">Posts</TabsTrigger>
          <TabsTrigger value="replies" className="flex-1">Replies</TabsTrigger>
          <TabsTrigger value="likes" className="flex-1">Likes</TabsTrigger>
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
