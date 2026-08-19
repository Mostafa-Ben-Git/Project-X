import { useCallback, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import * as api from "@/api/messages";

export function useMessages() {
  const qc = useQueryClient();
  const [currentChat, setCurrentChat] = useState(null);
  const messagesEndRef = useRef(null);

  const conversations = useQuery({
    queryKey: ["conversations"],
    queryFn: api.fetchConversations,
    staleTime: 20_000,
  });

  const chatMessages = useQuery({
    queryKey: ["messages", currentChat?.id],
    queryFn: () => api.fetchMessagesWith(currentChat.id),
    enabled: !!currentChat,
    staleTime: 10_000,
  });

  const send = useMutation({
    mutationFn: ({ userId, content }) => api.sendMessage(userId, content),
    onSuccess: (newMsg) => {
      qc.setQueryData(["messages", newMsg.receiver_id === currentChat?.id ? newMsg.receiver_id : newMsg.sender_id], (old) =>
        old ? [...old, newMsg] : [newMsg],
      );
      qc.invalidateQueries({ queryKey: ["conversations"] });
    },
    onError: () => toast.error("Could not send message"),
  });

  const openChat = useCallback(
    (user) => {
      setCurrentChat(user);
    },
    [],
  );

  const closeChat = useCallback(() => {
    setCurrentChat(null);
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
