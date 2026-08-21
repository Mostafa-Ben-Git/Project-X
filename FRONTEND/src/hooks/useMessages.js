import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import * as api from "@/api/messages";
import { getUserById } from "@/api/users";
import useAuth from "@/hooks/useAuth";

export function useMessages({ userId = null, room = null } = {}) {
  const qc = useQueryClient();
  const messagesEndRef = useRef(null);
  const { user: currentUser } = useAuth();
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((c) => (c > 0 ? c - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

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

  const chatMessages = useInfiniteQuery({
    queryKey: activeRoom ? ["messages", "room", activeRoom] : ["messages", activeUserId],
    queryFn: ({ pageParam = 1 }) => activeRoom ? api.fetchMessagesByRoom(activeRoom, { pageParam }) : api.fetchMessagesWith(activeUserId, { pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.meta.current_page < lastPage.meta.last_page ? lastPage.meta.current_page + 1 : undefined,
    enabled: !!(activeRoom || activeUserId),
    staleTime: 10_000,
  });

  // Flatten pages (backend latest-first) and reverse for asc display (oldest top, newest bottom)
  const messages = useMemo(() => {
    const pages = chatMessages.data?.pages ?? [];
    if (!pages.length) return [];
    return pages.flatMap((p) => p.data).reverse();
  }, [chatMessages.data]);

  const pinned = useQuery({
    queryKey: ["pinned", activeRoom],
    queryFn: () => api.fetchPinned(activeRoom),
    enabled: !!activeRoom,
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
    onMutate: async ({ content, imageFile, replyToId, replyTo }) => {
      const key = activeRoom ? ["messages", "room", activeRoom] : ["messages", activeUserId];
      if (!key[1]) return { previous: null, optimisticId: null };
      await qc.cancelQueries({ queryKey: key });
      const previous = qc.getQueryData(key);
      const optimisticId = `optimistic-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const partnerId = activeRoom ? (resolvedPartner?.id || currentChat?.id) : activeUserId;
      const optimisticImageUrl = imageFile ? URL.createObjectURL(imageFile) : null;
      const optimisticMsg = {
        id: optimisticId,
        content: content || null,
        image_url: optimisticImageUrl,
        type: imageFile ? (content ? "mixed" : "image") : "text",
        sender_id: currentUser?.id,
        receiver_id: partnerId,
        reply_to_id: replyToId || null,
        reply_to: replyTo
          ? {
              id: replyTo.id,
              content: replyTo.content ? (replyTo.content.length > 80 ? replyTo.content.slice(0, 80) + "…" : replyTo.content) : null,
              image_url: replyTo.image_url || null,
              sender_id: replyTo.sender_id,
            }
          : null,
        is_pinned: false,
        pinned_at: null,
        is_mine: true,
        can_delete: true,
        read_at: null,
        created_at: new Date().toISOString(),
        ago: "just now",
        unread_count: 0,
        room: activeRoom || null,
        sender: currentUser
          ? {
              id: currentUser.id,
              first_name: currentUser.first_name,
              last_name: currentUser.last_name,
              username: currentUser.username,
              avatar: currentUser.avatar,
              status: currentUser.status,
              last_active_at: currentUser.last_active_at,
            }
          : null,
        receiver: resolvedPartner || currentChat || null,
        _optimistic: true,
      };

      qc.setQueryData(key, (old) => {
        if (!old) {
          return {
            pages: [{ data: [optimisticMsg], meta: { current_page: 1, last_page: 1 } }],
            pageParams: [1],
          };
        }
        // pages[0] is newest page (desc). Prepend optimistic there.
        const newPages = [...old.pages];
        if (newPages.length === 0) {
          newPages.push({ data: [optimisticMsg], meta: { current_page: 1, last_page: 1 } });
        } else {
          newPages[0] = { ...newPages[0], data: [optimisticMsg, ...newPages[0].data] };
        }
        return { ...old, pages: newPages };
      });

      // Optimistically bump conversation preview
      qc.setQueryData(["conversations"], (old) => {
        if (!Array.isArray(old) || !partnerId) return old;
        const preview = content || (imageFile ? "📷 Image" : "");
        return old.map((c) => {
          const pid = c.sender_id === currentUser?.id ? c.receiver_id : c.sender_id;
          if (pid === partnerId) return { ...c, content: preview, image_url: optimisticImageUrl, ago: "just now" };
          return c;
        });
      });

      return { previous, optimisticId, optimisticImageUrl };
    },
    onError: (err, _vars, ctx) => {
      if (ctx?.previous) {
        const key = activeRoom ? ["messages", "room", activeRoom] : ["messages", activeUserId];
        qc.setQueryData(key, ctx.previous);
      }
      if (ctx?.optimisticImageUrl) URL.revokeObjectURL(ctx.optimisticImageUrl);
      const status = err?.response?.status;
      if (status === 429) {
        const retry = parseInt(err?.response?.data?.retry_after || err?.response?.headers?.["retry-after"] || "5", 10);
        const secs = Number.isFinite(retry) ? retry : 5;
        setCooldown(secs);
        toast.error(err?.response?.data?.message || `Too many messages — please wait ${secs}s`, { duration: secs * 1000 });
      } else {
        toast.error(err?.response?.data?.message || "Could not send message");
      }
    },
    onSuccess: (realMsg, _vars, ctx) => {
      const key = activeRoom ? ["messages", "room", activeRoom] : ["messages", activeUserId];
      // Replace optimistic with real
      if (ctx?.optimisticId) {
        qc.setQueryData(key, (old) => {
          if (!old) return old;
          const newPages = old.pages.map((p) => ({
            ...p,
            data: p.data.map((m) => (m.id === ctx.optimisticId ? realMsg : m)),
          }));
          return { ...old, pages: newPages };
        });
        if (ctx.optimisticImageUrl) URL.revokeObjectURL(ctx.optimisticImageUrl);
      }
      qc.invalidateQueries({ queryKey: ["conversations"] });
      qc.invalidateQueries({ queryKey: ["messages", "unread"] });
    },
    onSettled: () => {
      // Reconcile with server in background without blocking UI
      qc.invalidateQueries({ queryKey: activeRoom ? ["messages", "room", activeRoom] : ["messages", activeUserId] });
    },
  });

  const del = useMutation({
    mutationFn: (msgId) => api.deleteMessage(activeRoom, msgId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: activeRoom ? ["messages", "room", activeRoom] : ["messages", activeUserId] });
      qc.invalidateQueries({ queryKey: ["conversations"] });
      toast.success("Message deleted");
    },
    onError: () => toast.error("Could not delete message"),
  });

  const pin = useMutation({
    mutationFn: (msgId) => api.togglePin(activeRoom, msgId),
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: activeRoom ? ["messages", "room", activeRoom] : ["messages", activeUserId] });
      qc.invalidateQueries({ queryKey: ["pinned", activeRoom] });
      toast.success(updated.is_pinned ? "Pinned" : "Unpinned");
    },
    onError: (e) => toast.error(e?.response?.data?.message || "Could not pin message"),
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
    async (content, imageFile = null, replyToId = null, replyTo = null) => {
      await send.mutateAsync({ content, imageFile, replyToId, replyTo });
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
    messages,
    pinned: pinned.data ?? [],
    currentChat,
    activeRoom,
    activeUserId: activeRoom ? resolvedPartner?.id : activeUserId,
    isLoading: conversations.isLoading,
    isChatLoading: chatMessages.isLoading,
    isFetchingNextPage: chatMessages.isFetchingNextPage,
    hasNextPage: chatMessages.hasNextPage,
    fetchNextPage: chatMessages.fetchNextPage,
    isError: conversations.isError,
    isSending: send.isPending,
    isDeleting: del.isPending,
    isPinning: pin.isPending,
    cooldown,
    isRateLimited: cooldown > 0,
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
