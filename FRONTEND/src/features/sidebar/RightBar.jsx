import React, { useEffect, useState } from "react";
import useAuth from "@/hooks/useAuth";
import apiService from "@/api/apiService";

function RightBar({ className }) {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [users, setUsers] = useState([]);

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
          console.log(data);
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

  return (
    <aside
      className={`overflow-y-scroll rounded-lg p-4 shadow-md ${className}`}
    >
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search users..."
        className="mb-4 w-full rounded-lg border border-gray-300 p-2 text-black focus:outline-none focus:ring-2  focus:ring-blue-500"
      />
      {isLoading ? (
        <p className="text-gray-500">Loading...</p>
      ) : (
        <ul className="space-y-2">
          {users.map((user) => (
            <li
              key={user.id}
              className="mx-auto max-w-sm space-y-1 rounded-xl border p-4 shadow-lg sm:flex sm:items-center sm:space-x-6 sm:space-y-0 sm:py-4"
            >
              <img
                className="mx-auto block h-20 rounded-full sm:mx-0 sm:shrink-0"
                src={user.avatar}
                alt="Woman's Face"
              />
              <div className="space-y-2 text-center sm:text-left">
                <div className="space-y-0.5">
                  <p className="text-lg ">
                    {user.first_name} {user.last_name}
                  </p>
                  <p className=" text-md text-gray-500">{user.username}</p>
                </div>
                <button className="rounded-full border border-purple-200 px-4 py-1 text-sm font-semibold hover:border-transparent hover:bg-purple-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-2">
                  Follow
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}

export default RightBar;
