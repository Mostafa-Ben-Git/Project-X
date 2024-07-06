import apiService from "@/api/apiService";
import LoaderCircle from "@/components/LoaderCircle";
import UserMiniProfile from "@/components/UserMiniProfile";
import { useEffect, useState } from "react";

function RightBar({ className }) {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [users, setUsers] = useState([]);
  const [suggestions, setSuggestions] = useState([]);

  // const { searchUsers, searchResults, isLoading } = useAuth();
  useEffect(
    function () {
      const controller = new AbortController();

      async function fetchUsers() {
        try {
          setIsLoading(true);
          setError("");

          const { data } = await apiService.get(`/api/users/search`, {
            signal: controller.signal,
            params: {
              q: query,
            },
          });

          // if (!res.ok)
          //   throw new Error("Something went wrong with fetching movies");

          setUsers(data.data);
          // console.log(data);
        } catch (err) {
          if (err.name !== "AbortError") {
            console.log(err.message);
            setError(err.message);
          }
        } finally {
          setIsLoading(false);
        }
      }

      if (!/\S/.test(query)) {
        setUsers([]);
        setError("");
        return;
      }

      fetchUsers();

      return function () {
        controller.abort();
      };
    },
    [query],
  );

  useEffect(() => {
    async function fetchSuggestions() {
      try {
        setIsLoading(true);
        setError("");
        const { data } = await apiService.get(`/api/user/suggestions`);
        setSuggestions(data.data);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.log(err.message);
          setError(err.message);
        }
      } finally {
        setIsLoading(false);
      }
    }
    fetchSuggestions();
  }, []);

  return (
    <aside className={`max-w-xs hidden h-screen fixed right-0 top-0 z-40 border-l p-4 2xl:block`}>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search users..."
        className="mb-4 w-full rounded-lg border border-gray-300 p-2 text-black focus:outline-none focus:ring-2  focus:ring-blue-500"
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
      <section className="mt-4">
        <h2 className="mb-2 text-lg font-bold">Suggested for you</h2>
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
