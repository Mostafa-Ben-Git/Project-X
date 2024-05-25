import apiService from "@/api/apiService";
import { useState } from "react";

export function useFollow() {
  const [loading, setLoading] = useState(false);

  async function handleFollow(user_id) {
    setLoading(true);
    try {
      await apiService.post(`api/users/${user_id}/changeFollowStatus`);
    } catch (error) {
      const responseData = error.response;
      console.error("Error changing follow status", responseData);
    } finally {
      setLoading(false);
    }
  }

  return { loading, handleFollow };
}
