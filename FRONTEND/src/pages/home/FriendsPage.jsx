import LoaderCircle from "@/components/LoaderCircle";
import UserMiniProfile from "@/components/UserMiniProfile";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import useAuth from "@/hooks/useAuth";
import apiService from "@/api/apiService";
import { useEffect, useState } from "react";

function FriendsPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState("suggestions");
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        if (tab === "followers" && user?.id) {
          const { data } = await apiService.get(`/api/users/${user.id}/followers`);
          setFollowers(data.data);
        } else if (tab === "following" && user?.id) {
          const { data } = await apiService.get(`/api/users/${user.id}/following`);
          setFollowing(data.data);
        } else if (tab === "suggestions") {
          const { data } = await apiService.get("/api/user/suggestions");
          setSuggestions(data.data);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [tab, user?.id]);

  const items =
    tab === "followers" ? followers : tab === "following" ? following : suggestions;

  return (
    <main className="mx-auto max-w-2xl p-4">
      <h1 className="mb-6 text-2xl font-bold">Friends</h1>

      <Tabs defaultValue="suggestions" onValueChange={setTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
          <TabsTrigger value="followers">
            Followers ({user?.followers_count ?? 0})
          </TabsTrigger>
          <TabsTrigger value="following">
            Following ({user?.following_count ?? 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="suggestions">
          {isLoading ? (
            <LoaderCircle />
          ) : suggestions.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">
              No suggestions available
            </p>
          ) : (
            <ul className="space-y-2">
              {suggestions?.map((u) => (
                <UserMiniProfile key={u.id} user={u} />
              ))}
            </ul>
          )}
        </TabsContent>

        <TabsContent value="followers">
          {isLoading ? (
            <LoaderCircle />
          ) : followers.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">
              No followers yet
            </p>
          ) : (
            <ul className="space-y-2">
              {followers?.map((u) => (
                <UserMiniProfile key={u.id} user={u} />
              ))}
            </ul>
          )}
        </TabsContent>

        <TabsContent value="following">
          {isLoading ? (
            <LoaderCircle />
          ) : following.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">
              Not following anyone yet
            </p>
          ) : (
            <ul className="space-y-2">
              {following?.map((u) => (
                <UserMiniProfile key={u.id} user={u} />
              ))}
            </ul>
          )}
        </TabsContent>
      </Tabs>
    </main>
  );
}

export default FriendsPage;
