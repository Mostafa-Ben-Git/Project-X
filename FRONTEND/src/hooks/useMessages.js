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
    mutationFn: ({ content, imageFile, replyToId }) => {
      if (replyToId && activeRoom) return api.replyToMessage(activeRoom, replyToId, content, imageFile);
      if (replyToId && activeUserId) return api.sendMessage(activeUserId, content, imageFile); // fallback: treat as normal
      return activeRoom
        ? api.sendMessageToRoom(activeRoom, content, imageFile)
        : api.sendMessage(activeUserId, content, imageFile);
    },
    onSuccess: (newMsg) => {
      const key = activeRoom ? ["messages", "room", activeRoom] : ["messages", newMsg.receiver_id === activeUserId ? newMsg.receiver_id : newMsg.sender_id];
      qc.setQueryData(key, (old) => (old ? [...old, newMsg] : [newMsg]));
      qc.invalidateQueries({ queryKey: ["conversations"] });
      qc.invalidateQueries({ queryKey: ["messages", "unread"] });
    },
    onError: () => toast.error("Could not send message"),
  });

  const del = useMutation({
    mutationFn: (msgId) => api.deleteMessage(activeRoom, msgId),
    onSuccess: (_data, msgId) => {
      const key = activeRoom ? ["messages", "room", activeRoom] : ["messages", activeUserId];
      qc.setQueryData(key, (old) => (old ? old.filter((m) => m.id !== msgId) : old));
      qc.invalidateQueries({ queryKey: ["conversations"] });
      toast.success("Message deleted");
    },
    onError: () => toast.error("Could not delete message"),
  });

  const pin = useMutation({
    mutationFn: (msgId) => api.togglePin(activeRoom, msgId),
    onSuccess: (updated) => {
      const key = activeRoom ? ["messages", "room", activeRoom] : ["messages", activeUserId];
      qc.setQueryData(key, (old) => (old ? old.map((m) => (m.id === updated.id ? updated : m)) : old));
      qc.invalidateQueries({ queryKey: ["pinned", activeRoom] });
      toast.success(updated.is_pinned ? "Pinned" : "Unpinned");
    },
    onError: (e) => toast.error(e?.response?.data?.message || "Could not pin message"),
  });

  const pinned = useQuery({
    queryKey: ["pinned", activeRoom],
    queryFn: () => api.fetchPinned(activeRoom),
    enabled: !!activeRoom,
    staleTime: 10_000,
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
    async (content, imageFile = null, replyToId = null) => {
      await send.mutateAsync({ content, imageFile, replyToId });
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

  const deleteMessage = useCallback((msgId) => del.mutateAsync(msgId), [del]);
  const togglePin = useCallback((msgId) => pin.mutateAsync(msgId), [pin]);

  return {
    conversations: conversations.data ?? [],
    messages: chatMessages.data ?? [],
    pinned: pinned.data ?? [],
    currentChat,
    activeRoom,
    activeUserId: activeRoom ? resolvedPartner?.id : activeUserId,
    isLoading: conversations.isLoading,
    isChatLoading: chatMessages.isLoading,
    isError: conversations.isError,
    isSending: send.isPending,
    isDeleting: del.isPending,
    isPinning: pin.isPending,
    unreadCount: 0,
    messagesEndRef,
    fetchConversations: conversations.refetch,
    sendMessage,
    sendMessageLegacy,
    deleteMessage,
    togglePin,
    openChat,
    closeChat,
  };
}
