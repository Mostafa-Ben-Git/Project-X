import apiService from "@/api/apiService";
import LoaderCircle from "@/components/LoaderCircle";
import UserMiniProfile from "@/components/UserMiniProfile";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";

function RightBar() {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchUsers() {
      if (!/\S/.test(query)) {
        setUsers([]);
        return;
      }
      try {
        setIsLoading(true);
        const { data } = await apiService.get("/api/users/search", {
          signal: controller.signal,
          params: { q: query },
        });
        setUsers(data.data);
      } catch (err) {
        if (err.name !== "AbortError") console.error(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchUsers();
    return () => controller.abort();
  }, [query]);

  useEffect(() => {
    async function fetchSuggestions() {
      try {
        const { data } = await apiService.get("/api/user/suggestions");
        setSuggestions(data.data);
      } catch (err) {
        console.error(err.message);
      }
    }
    fetchSuggestions();
  }, []);

  return (
    <aside className="fixed right-0 top-0 z-40 hidden h-screen max-w-xs border-l border-border p-4 2xl:block">
      <Input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search users..."
        className="mb-4"
      />
      {isLoading ? (
        <LoaderCircle />
      ) : (
        <ul className="flex flex-col gap-2">
          {users.map((user) => (
            <UserMiniProfile key={user.id} user={user} />
          ))}
        </ul>
      )}
      <section className="mt-6">
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
          Suggested for you
        </h2>
        <ul className="flex flex-col gap-2">
          {suggestions.map((user) => (
            <UserMiniProfile key={user.id} user={user} />
          ))}
        </ul>
      </section>
    </aside>
  );
}

export default RightBar;
