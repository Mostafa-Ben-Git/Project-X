import { useCallback, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import * as api from "@/api/messages";
import { getUserById } from "@/api/users";

export function useMessages({ userId = null, room = null } = {}) {
  const qc = useQueryClient();
  const messagesEndRef = useRef(null);

  // Support both legacy userId param and new encrypted room param
  const activeRoom = room || null;
  const [localChat, setLocalChat] = useState(null);
  const activeUserId = activeRoom ? null : (userId ?? localChat?.id ?? null);

  // Resolve encrypted room to partner profile
  const roomPartner = useQuery({
    queryKey: ["room-partner", activeRoom],
    queryFn: () => api.resolveRoom(activeRoom),
    enabled: !!activeRoom,
    staleTime: 10_000,
    refetchInterval: 15_000,
  });

  const partner = useQuery({
    queryKey: ["user", activeUserId],
    queryFn: () => getUserById(activeUserId),
    enabled: !!activeUserId && !activeRoom,
    staleTime: 10_000,
    refetchInterval: 15_000,
  });

  const resolvedPartner = activeRoom ? roomPartner.data : partner.data;
  const currentChat = activeRoom
    ? (resolvedPartner ?? { id: null })
    : activeUserId
      ? (partner.data ?? { id: activeUserId })
      : localChat;

  const conversations = useQuery({
    queryKey: ["conversations"],
    queryFn: api.fetchConversations,
    staleTime: 20_000,
  });

  const chatMessages = useQuery({
    queryKey: activeRoom ? ["messages", "room", activeRoom] : ["messages", activeUserId],
    queryFn: () => activeRoom ? api.fetchMessagesByRoom(activeRoom) : api.fetchMessagesWith(activeUserId),
    enabled: !!(activeRoom || activeUserId),
    staleTime: 10_000,
  });

  const send = useMutation({
    mutationFn: ({ content, imageFile }) =>
      activeRoom
        ? api.sendMessageToRoom(activeRoom, content, imageFile)
        : api.sendMessage(activeUserId, content, imageFile),
    onSuccess: (newMsg) => {
      const key = activeRoom ? ["messages", "room", activeRoom] : ["messages", newMsg.receiver_id === activeUserId ? newMsg.receiver_id : newMsg.sender_id];
      qc.setQueryData(key, (old) => (old ? [...old, newMsg] : [newMsg]));
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
    async (content, imageFile = null) => {
      await send.mutateAsync({ content, imageFile });
    },
    [send],
  );

  const sendMessageLegacy = useCallback(
    async (uid, content, imageFile = null) => {
      // Backward compat helper when caller provides explicit userId
      await api.sendMessage(uid, content, imageFile);
      qc.invalidateQueries({ queryKey: ["conversations"] });
    },
    [qc],
  );

  return {
    conversations: conversations.data ?? [],
    messages: chatMessages.data ?? [],
    currentChat,
    activeRoom,
    activeUserId: activeRoom ? resolvedPartner?.id : activeUserId,
    isLoading: conversations.isLoading,
    isChatLoading: chatMessages.isLoading,
    isError: conversations.isError,
    isSending: send.isPending,
    unreadCount: 0,
    messagesEndRef,
    fetchConversations: conversations.refetch,
    sendMessage,
    sendMessageLegacy,
    openChat,
    closeChat,
  };
}
