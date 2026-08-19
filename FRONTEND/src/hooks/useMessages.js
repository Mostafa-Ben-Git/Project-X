import { useCallback, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import * as api from "@/api/messages";
import { getUserById } from "@/api/users";

export function useMessages(chatId = null) {
  const qc = useQueryClient();
  const messagesEndRef = useRef(null);

  // Derive the active conversation partner from a URL param (message room).
  // Falls back to local state driven by openChat/closeChat in the list view.
  const [localChat, setLocalChat] = useState(null);
  const activeUserId = chatId ?? localChat?.id ?? null;

  // When a chat is driven by the URL (refreshed room), fetch the partner profile.
  const partner = useQuery({
    queryKey: ["user", activeUserId],
    queryFn: () => getUserById(activeUserId),
    enabled: !!chatId && !!activeUserId,
    staleTime: 60_000,
  });

  const currentChat = chatId
    ? (partner.data ?? { id: activeUserId })
    : localChat;

  const conversations = useQuery({
    queryKey: ["conversations"],
    queryFn: api.fetchConversations,
    staleTime: 20_000,
  });

  const chatMessages = useQuery({
    queryKey: ["messages", activeUserId],
    queryFn: () => api.fetchMessagesWith(activeUserId),
    enabled: !!activeUserId,
    staleTime: 10_000,
  });

  const send = useMutation({
    mutationFn: ({ userId, content }) => api.sendMessage(userId, content),
    onSuccess: (newMsg) => {
      const partnerId =
        newMsg.receiver_id === activeUserId ? newMsg.receiver_id : newMsg.sender_id;
      qc.setQueryData(["messages", partnerId], (old) =>
        old ? [...old, newMsg] : [newMsg],
      );
      qc.invalidateQueries({ queryKey: ["conversations"] });
      qc.invalidateQueries({ queryKey: ["messages", "unread"] });
    },
    onError: () => toast.error("Could not send message"),
  });

  const openChat = useCallback((user) => {
    setLocalChat(user);
  }, []);

  const closeChat = useCallback(() => {
    setLocalChat(null);
    qc.invalidateQueries({ queryKey: ["messages"] });
    qc.invalidateQueries({ queryKey: ["conversations"] });
  }, [qc]);

  const sendMessage = useCallback(
    async (userId, content) => {
      await send.mutateAsync({ userId, content });
    },
    [send],
  );

  return {
    conversations: conversations.data ?? [],
    messages: chatMessages.data ?? [],
    currentChat,
    isLoading: conversations.isLoading,
    isChatLoading: chatMessages.isLoading,
    isError: conversations.isError,
    isSending: send.isPending,
    unreadCount: 0,
    messagesEndRef,
    fetchConversations: conversations.refetch,
    sendMessage,
    openChat,
    closeChat,
  };
}
