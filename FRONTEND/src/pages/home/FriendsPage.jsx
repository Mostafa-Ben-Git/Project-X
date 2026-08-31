import LoaderCircle from "@/components/LoaderCircle";
import UserMiniProfile from "@/components/UserMiniProfile";
import { EmptyState } from "@/components/empty-state";
import { Users, UserPlus, UserCheck } from "lucide-react";
import useAuth from "@/hooks/useAuth";
import { useFriends } from "@/hooks/useFriends";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function FriendList({ query, emptyText }) {
  if (query.isLoading) {
    return (
      <div className="flex justify-center py-8">
        <LoaderCircle />
      </div>
    );
  }
  if (query.isError) {
    return (
      <EmptyState
        icon={UserPlus}
        title="Could not load users"
        message="An error occurred while fetching this list."
      />
    );
  }
  const items = query.data ?? [];
  if (items.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title={emptyText}
        message="Try again later or search for people to connect with."
      />
    );
  }
  return (
    <ul className="space-y-2">
      {items.map((user) => (
        <UserMiniProfile key={user.id} user={user} />
      ))}
    </ul>
  );
}

function FriendsPage() {
  const { user } = useAuth();
  const { suggestions, followers, following } = useFriends(user?.id);

  return (
    <main className="mx-auto max-w-2xl p-4">
      <h1 className="mb-6 text-2xl font-bold">Friends</h1>

      <Tabs defaultValue="suggestions">
        <TabsList className="mb-4 grid w-full grid-cols-3">
          <TabsTrigger value="suggestions" className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            <span className="hidden sm:inline">Suggestions</span>
          </TabsTrigger>
          <TabsTrigger value="followers" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Followers ({user?.followers_count ?? 0})</span>
          </TabsTrigger>
          <TabsTrigger value="following" className="flex items-center gap-2">
            <UserCheck className="h-4 w-4" />
            <span className="hidden sm:inline">Following ({user?.following_count ?? 0})</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="suggestions">
          <FriendList query={suggestions} emptyText="No suggestions available" />
        </TabsContent>
        <TabsContent value="followers">
          <FriendList query={followers} emptyText="No followers yet" />
        </TabsContent>
        <TabsContent value="following">
          <FriendList query={following} emptyText="Not following anyone yet" />
        </TabsContent>
      </Tabs>
    </main>
  );
}

export default FriendsPage;
