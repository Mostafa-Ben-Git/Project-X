import { useCallback, useRef, useState } from "react";
import apiService from "@/api/apiService";

export default function useMessages() {
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef(null);

  const fetchConversations = async () => {
    setIsLoading(true);
    try {
      const { data } = await apiService.get("/api/conversations");
      setConversations(data.data);
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMessages = useCallback(async (userId) => {
    setIsLoading(true);
    try {
      const { data } = await apiService.get(`/api/messages/${userId}`);
      setMessages(data.data);
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const sendMessage = async (userId, content) => {
    setIsSending(true);
    try {
      const { data } = await apiService.post(`/api/messages/${userId}`, {
        content,
      });
      setMessages((prev) => [...prev, data]);
      // Update conversations list
      setConversations((prev) => {
        const existing = prev.find(
          (c) =>
            c.sender_id === data.sender_id || c.receiver_id === data.sender_id
        );
        if (existing) {
          return prev.map((c) =>
            c.sender_id === data.sender_id ||
            c.receiver_id === data.sender_id
              ? data
              : c
          );
        }
        return [data, ...prev];
      });
      return data;
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    } finally {
      setIsSending(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const { data } = await apiService.get("/api/messages/unread-count");
      setUnreadCount(data.count);
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  };

  const openChat = useCallback(
    (user) => {
      setCurrentChat(user);
      fetchMessages(user.id);
    },
    [fetchMessages]
  );

  const closeChat = useCallback(() => {
    setCurrentChat(null);
    setMessages([]);
  }, []);

  return {
    conversations,
    messages,
    currentChat,
    isLoading,
    isSending,
    unreadCount,
    messagesEndRef,
    fetchConversations,
    fetchMessages,
    sendMessage,
    fetchUnreadCount,
    openChat,
    closeChat,
  };
}
