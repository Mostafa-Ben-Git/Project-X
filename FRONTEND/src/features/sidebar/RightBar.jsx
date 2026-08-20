import apiService from "@/api/apiService";
import LoaderCircle from "@/components/LoaderCircle";
import UserMiniProfile from "@/components/UserMiniProfile";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { useEffect, useState } from "react";

function RightBar() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(true);

  // Debounce keystrokes so we don't fire a request per character
  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timeout);
  }, [query]);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchUsers() {
      if (!/\S/.test(debouncedQuery)) {
        setUsers([]);
        return;
      }
      try {
        setIsLoading(true);
        const { data } = await apiService.get("/api/users/search", {
          signal: controller.signal,
          params: { q: debouncedQuery },
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
  }, [debouncedQuery]);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchSuggestions() {
      try {
        const { data } = await apiService.get("/api/user/suggestions", {
          signal: controller.signal,
        });
        setSuggestions(data.data);
      } catch (err) {
        if (err.name !== "AbortError") console.error(err.message);
      } finally {
        setSuggestionsLoading(false);
      }
    }

    fetchSuggestions();
    return () => controller.abort();
  }, []);

  const isSearching = /\S/.test(query);

  return (
    <aside className="fixed right-0 top-0 z-40 hidden h-screen max-w-xs overflow-y-auto border-l border-border p-4 2xl:block">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search users..."
          aria-label="Search users"
          className="pl-9 pr-8"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label="Clear search"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {isSearching && (
        <div className="mt-4">
          {isLoading ? (
            <div className="flex justify-center py-6">
              <LoaderCircle />
            </div>
          ) : users.length > 0 ? (
            <ul className="flex flex-col gap-2">
              {users.map((user) => (
                <UserMiniProfile key={user.id} user={user} />
              ))}
            </ul>
          ) : (
            <p className="py-4 text-center text-sm text-muted-foreground">
              No users found for &quot;{query}&quot;
            </p>
          )}
        </div>
      )}

      {!isSearching && (
        <section className="mt-6">
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
            Suggested for you
          </h2>
          {suggestionsLoading ? (
            <div className="flex justify-center py-6">
              <LoaderCircle />
            </div>
          ) : suggestions.length > 0 ? (
            <ul className="flex flex-col gap-2">
              {suggestions.map((user) => (
                <UserMiniProfile key={user.id} user={user} />
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">
              No suggestions right now.
            </p>
          )}
        </section>
      )}
    </aside>
  );
}

export default RightBar;