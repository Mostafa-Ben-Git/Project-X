import React, { useState } from 'react';
import useAuth from "@/hooks/useAuth";

function RightBar({ className }) {
  const [query, setQuery] = useState('');
  const { searchUsers, searchResults, isLoading } = useAuth();
  
  const handleSearch = async (e) => {
    setQuery(e.target.value);
    if (e.target.value.length > 2) {
      console.log("Query:", e.target.value); // Ajout du console.log()
      searchUsers(e.target.value);
    }
  };

  return (
    <aside className={`p-4 rounded-lg shadow-md ${className}`}>
      <input
        type="text"
        value={query}
        onChange={handleSearch}
        placeholder="Search users..."
        className="w-full p-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500  text-black"
      />
      {isLoading ? (
        <p className="text-gray-500">Loading...</p>
      ) : (
        <ul className="space-y-2">
          {searchResults.map(user => (
            <li key={user.id} className="p-2 bg-white rounded-lg shadow-sm text-black">
              {user.username}
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}

export default RightBar;
