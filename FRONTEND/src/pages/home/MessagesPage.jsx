import LoaderCircle from "@/components/LoaderCircle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsMobile } from "@/hooks/use-mobile";
import useAuth from "@/hooks/useAuth";
import { useMessages } from "@/hooks/useMessages";
import { getRoomForUser } from "@/api/messages";
import { ArrowDown, ArrowLeft, Clock, Copy, Image as ImageIcon, MoreVertical, Pin, Reply, Search, Send, SmilePlus, Trash2, UsersRound, X, MessageSquare } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { formatLastActive, statusDotClass } from "@/lib/status";
import ImageLightbox from "@/components/ImageLightbox";
import { cn } from "@/lib/utils";

const EmojiPicker = lazy(() => import("emoji-picker-react"));

function MessagesPage() {
  const { userId, roomId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isMobile = useIsMobile();

  const room = roomId || null;
  const legacyUserId = !room && userId ? userId : null;

  const {
    conversations,
    messages,
    pinned,
    currentChat,
    isLoading,
    isChatLoading,
    isSending,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    messagesEndRef,
    fetchConversations,
    sendMessage,
    deleteMessage,
    togglePin,
    openChat,
    cooldown,
    isRateLimited,
  } = useMessages({ userId: legacyUserId, room });

  const [newMessage, setNewMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [isNearBottom, setIsNearBottom] = useState(true);
  const [unreadBelow, setUnreadBelow] = useState(0);
  const [search, setSearch] = useState("");
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const scrollViewportRef = useRef(null);
  const prevMessagesCountRef = useRef(0);
  const prevFirstIdRef = useRef(null);
  const prevLastIdRef = useRef(null);
  const anchorRef = useRef(null);

  const draftPreviewUrl = useMemo(() => (selectedImage ? URL.createObjectURL(selectedImage) : null), [selectedImage]);
  const messageImages = useMemo(() => messages?.filter((m) => m.image_url).map((m) => m.image_url) ?? [], [messages]);

  const filteredConversations = useMemo(() => {
    if (!search.trim()) return conversations;
    const q = search.toLowerCase();
    return conversations.filter((c) => {
      const p = c.sender_id === user?.id ? c.receiver : c.sender;
      if (!p) return false;
      return `${p.first_name} ${p.last_name} ${p.username}`.toLowerCase().includes(q) || (c.content || "").toLowerCase().includes(q);
    });
  }, [conversations, search, user?.id]);

  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, [newMessage]);

  useEffect(() => {
    if (replyingTo) inputRef.current?.focus();
  }, [replyingTo]);

  useEffect(() => {
    prevMessagesCountRef.current = 0;
    prevFirstIdRef.current = null;
    prevLastIdRef.current = null;
    anchorRef.current = null;
    setUnreadBelow(0);
    setIsNearBottom(true);
    if (scrollViewportRef.current) scrollViewportRef.current.scrollTop = 0;
  }, [room, legacyUserId]);

  const captureAnchor = () => {
    const vp = scrollViewportRef.current;
    if (vp) anchorRef.current = { scrollTop: vp.scrollTop, scrollHeight: vp.scrollHeight };
  };

  useEffect(() => {
    if (legacyUserId) {
      getRoomForUser(legacyUserId)
        .then((securedRoom) => navigate(`/messages/room/${encodeURIComponent(securedRoom)}`, { replace: true }))
        .catch(() => {});
    }
  }, [legacyUserId, navigate]);

  useEffect(() => {
    fetchConversations();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const vp = scrollViewportRef.current;
    if (!vp) return;
    let loadingOlder = false;
    const updateNearBottom = () => {
      const distFromBottom = vp.scrollHeight - vp.scrollTop - vp.clientHeight;
      setIsNearBottom(distFromBottom < 120);
      if (distFromBottom < 120) setUnreadBelow(0);
      if (vp.scrollTop < 80 && hasNextPage && !isFetchingNextPage && !loadingOlder) {
        loadingOlder = true;
        captureAnchor();
        const prevHeight = anchorRef.current.scrollHeight;
        const prevTop = anchorRef.current.scrollTop;
        fetchNextPage().then(() => {
          requestAnimationFrame(() => {
            const newHeight = vp.scrollHeight;
            vp.scrollTop = prevTop + (newHeight - prevHeight);
            loadingOlder = false;
          });
        });
      }
    };
    vp.addEventListener("scroll", updateNearBottom, { passive: true });
    updateNearBottom();
    return () => vp.removeEventListener("scroll", updateNearBottom);
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  useEffect(() => {
    const vp = scrollViewportRef.current;
    if (!vp || messages.length === 0) return;
    const prevCount = prevMessagesCountRef.current;
    const prevFirstId = prevFirstIdRef.current;
    const prevLastId = prevLastIdRef.current;
    const firstId = messages[0]?.id ?? null;
    const lastId = messages[messages.length - 1]?.id ?? null;
    prevMessagesCountRef.current = messages.length;
    prevFirstIdRef.current = firstId;
    prevLastIdRef.current = lastId;
    if (prevCount === 0 || prevFirstId === null || prevLastId === null) {
      requestAnimationFrame(() => {
        vp.scrollTop = vp.scrollHeight;
        setIsNearBottom(true);
      });
      return;
    }
    const grewBy = messages.length - prevCount;
    if (grewBy <= 0) return;
    if (firstId !== prevFirstId) return;
    const newTail = messages.slice(-grewBy);
    const incomingCount = newTail.filter((m) => m.sender_id !== user?.id && !m._optimistic).length;
    const hasOwnNew = newTail.some((m) => m.sender_id === user?.id);
    const distFromBottom = vp.scrollHeight - vp.scrollTop - vp.clientHeight;
    const nearBottom = distFromBottom < 120;
    if (nearBottom || hasOwnNew) {
      requestAnimationFrame(() => {
        vp.scrollTop = vp.scrollHeight;
      });
      if (nearBottom) setUnreadBelow(0);
    } else if (incomingCount > 0) {
      setUnreadBelow((u) => u + incomingCount);
    }
  }, [messages, user?.id]);

  const scrollToBottom = () => {
    const vp = scrollViewportRef.current;
    if (!vp) return;
    vp.scrollTo({ top: vp.scrollHeight, behavior: "smooth" });
    setUnreadBelow(0);
  };

  const handleEmojiClick = ({ emoji }) => {
    const el = inputRef.current;
    if (!el) {
      setNewMessage((prev) => prev + emoji);
      return;
    }
    const start = el.selectionStart ?? newMessage.length;
    const end = el.selectionEnd ?? newMessage.length;
    const next = newMessage.slice(0, start) + emoji + newMessage.slice(end);
    setNewMessage(next);
    requestAnimationFrame(() => {
      el.focus();
      const pos = start + emoji.length;
      el.setSelectionRange(pos, pos);
    });
  };

  const handlePickImage = (e) => {
    const file = e.target.files?.[0];
    if (file) setSelectedImage(file);
    e.target.value = "";
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (isRateLimited) return;
    const hasText = newMessage.trim().length > 0;
    const hasImage = !!selectedImage;
    if ((!hasText && !hasImage) || (!room && !legacyUserId)) return;
    const content = newMessage.trim() || null;
    const replyTo = replyingTo;
    const image = selectedImage;
    setNewMessage("");
    setSelectedImage(null);
    setReplyingTo(null);
    requestAnimationFrame(() => inputRef.current?.focus());
    try {
      await sendMessage(content, image, replyTo?.id || null, replyTo);
    } catch (err) {
      setNewMessage(content || "");
      if (image) setSelectedImage(image);
      if (replyTo) setReplyingTo(replyTo);
      if (import.meta.env.DEV) console.error("Message send failed:", err);
    } finally {
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  };

  const handleCopy = async (text) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      const { toast } = await import("sonner");
      toast.success("Copied to clipboard");
    } catch {
      const { toast } = await import("sonner");
      toast.error("Copy failed");
    }
  };

  const getChatPartner = (conversation) => {
    return conversation.sender_id === user?.id ? conversation.receiver : conversation.sender;
  };

  const goToRoom = async (partnerId, fallbackRoom) => {
    if (fallbackRoom) {
      navigate(`/messages/room/${encodeURIComponent(fallbackRoom)}`);
      return;
    }
    try {
      const securedRoom = await getRoomForUser(partnerId);
      navigate(`/messages/room/${encodeURIComponent(securedRoom)}`);
    } catch {
      navigate(`/messages/${partnerId}`);
    }
  };

  const goToList = () => {
    openChat(null);
    navigate("/messages");
  };

  // ── Conversation list ──
  const renderConversationList = () => (
    <div className="flex h-full flex-col">
      <div className="shrink-0 border-b bg-background p-4">
        <div className="flex items-center justify-between gap-2">
          <h1 className="text-xl font-bold tracking-tight">Messages</h1>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => navigate("/friends")}>
            <UsersRound size={18} />
          </Button>
        </div>
        <div className="relative mt-3">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search conversations"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 bg-muted/60 pl-9 pr-9 focus-visible:bg-background"
          />
          {search && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2"
              onClick={() => setSearch("")}
            >
              <X size={14} />
            </Button>
          )}
        </div>
      </div>

      <ScrollArea className="flex-1 overflow-hidden">
        <div className="min-w-0 overflow-hidden p-2">
          {isLoading && conversations.length === 0 ? (
            <div className="flex justify-center py-10">
              <LoaderCircle />
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center px-6 py-16 text-center">
              <div className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-muted">
                {search ? <Search size={22} className="text-muted-foreground" /> : <MessageSquare size={22} className="text-muted-foreground" />}
              </div>
              <p className="font-medium">{search ? `No results for "${search}"` : "No conversations yet"}</p>
              <p className="mt-1 max-w-[260px] text-sm text-muted-foreground">
                {search ? "Try a different name or username." : "Visit a profile and say hi — your chats will appear here."}
              </p>
              {!search && (
                <Button variant="outline" size="sm" className="mt-4" onClick={() => navigate("/friends")}>
                  Find people
                </Button>
              )}
            </div>
          ) : (
            <ul className="min-w-0 space-y-1 overflow-hidden">
              {filteredConversations.map((conv) => {
                const partner = getChatPartner(conv);
                if (!partner) return null;
                const isActive = currentChat?.id === partner.id;
                const hasUnread = conv.unread_count > 0;
                return (
                  <li key={conv.id} className="min-w-0">
                    <button
                      onClick={() => goToRoom(partner.id, conv.room)}
                      className={cn(
                        "group flex w-full min-w-0 items-center gap-3 overflow-hidden rounded-xl p-3 text-left transition-all",
                        isActive ? "bg-primary text-primary-foreground shadow-sm" : "hover:bg-muted",
                        hasUnread && !isActive && "bg-accent/60 hover:bg-accent"
                      )}
                    >
                      <div className="relative shrink-0">
                        <Avatar className={cn("h-11 w-11 border", isActive && "border-primary-foreground/20")}>
                          <AvatarImage src={partner?.avatar} />
                          <AvatarFallback className={cn(isActive ? "bg-primary-foreground text-primary" : "bg-muted")}>
                            {partner?.first_name?.[0]}
                            {partner?.last_name?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        {partner?.status !== "hidden" && (
                          <span
                            className={cn(
                              "absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2",
                              isActive ? "border-primary" : "border-background",
                              statusDotClass(partner?.status) || "bg-gray-400"
                            )}
                          />
                        )}
                      </div>
                      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
                        <div className="flex min-w-0 items-center justify-between gap-2">
                          <p className={cn("min-w-0 flex-1 truncate text-sm", hasUnread || isActive ? "font-semibold" : "font-medium")}>
                            {partner?.first_name} {partner?.last_name}
                          </p>
                          <span className={cn("max-w-[78px] shrink-0 truncate whitespace-nowrap text-right text-[11px]", isActive ? "text-primary-foreground/70" : hasUnread ? "font-medium text-foreground" : "text-muted-foreground")}>
                            {conv.ago}
                          </span>
                        </div>
                        <p className={cn("block truncate text-xs", isActive ? "text-primary-foreground/80" : hasUnread ? "font-medium text-foreground" : "text-muted-foreground")}>
                          {conv.content || (conv.image_url ? "📷 Image" : "No messages yet")}
                        </p>
                      </div>
                      {hasUnread && (
                        <span
                          className={cn(
                            "grid h-6 min-w-6 shrink-0 place-items-center rounded-full px-1.5 text-xs font-bold",
                            isActive ? "bg-primary-foreground text-primary" : "bg-primary text-primary-foreground"
                          )}
                        >
                          {conv.unread_count > 99 ? "99+" : conv.unread_count}
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </ScrollArea>
    </div>
  );

  // ── Chat ──
  const renderChat = (showBack) => {
    const partner = currentChat;
    const isSelf = partner?.id === user?.id;
    return (
      <div className="flex h-full min-h-0 flex-col bg-background">
        {/* Header */}
        <div className="flex h-[64px] shrink-0 items-center gap-3 border-b bg-background px-3 md:px-4">
          {showBack && (
            <Button variant="ghost" size="icon" onClick={goToList} className="-ml-2 md:hidden">
              <ArrowLeft size={20} />
            </Button>
          )}
          <Link to={isSelf ? "/profile" : `/profile/${partner?.username}`} className="relative shrink-0">
            <Avatar className="h-9 w-9 md:h-10 md:w-10">
              <AvatarImage src={partner?.avatar} />
              <AvatarFallback>
                {partner?.first_name?.[0]}
                {partner?.last_name?.[0]}
              </AvatarFallback>
            </Avatar>
            {partner?.status !== "hidden" && (
              <span className={cn("absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background", statusDotClass(partner?.status) || "bg-gray-400")} />
            )}
          </Link>
          <div className="min-w-0 flex-1">
            <Link to={isSelf ? "/profile" : `/profile/${partner?.username}`} className="block">
              <p className="truncate text-sm font-semibold md:text-[15px]">
                {partner?.first_name} {partner?.last_name}
              </p>
            </Link>
            <p className="truncate text-xs text-muted-foreground">
              {partner?.status === "online" && <span className="font-medium text-emerald-600">Online</span>}
              {partner?.status === "away" && <span className="font-medium text-amber-600">Away</span>}
              {partner?.status === "dnd" && <span className="font-medium text-red-600">Do not disturb</span>}
              {(!partner?.status || partner?.status === "offline" || partner?.status === "hidden") && (
                <span>{formatLastActive(partner?.last_active_at) ? `Active ${formatLastActive(partner?.last_active_at)}` : "Offline"}</span>
              )}
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical size={18} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => navigate(isSelf ? "/profile" : `/profile/${partner?.username}`)}>View profile</DropdownMenuItem>
              <DropdownMenuItem onClick={() => partner && handleCopy(`@${partner.username}`)}>Copy username</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Pinned */}
        {pinned?.length > 0 && (
          <div className="shrink-0 border-b bg-amber-50 px-3 py-2 dark:bg-amber-950/20 md:px-4">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 dark:text-amber-300">
              <Pin size={14} /> Pinned • {pinned.length}/3
            </div>
            <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
              {pinned.map((p) => (
                <div key={p.id} className="flex max-w-[260px] shrink-0 items-center gap-2 rounded-full border bg-background px-3 py-1.5 text-xs shadow-sm">
                  <span className="truncate">{p.content || (p.image_url ? "📷 Image" : "—")}</span>
                  <Button variant="ghost" size="sm" className="h-6 shrink-0 rounded-full px-2 text-[11px]" onClick={() => document.getElementById(`msg-${p.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" })}>
                    Jump
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="relative flex min-h-0 flex-1 flex-col bg-muted/20">
          <ScrollArea viewportRef={scrollViewportRef} className="flex-1">
            <div className="flex flex-col gap-1 px-3 py-4 md:px-4">
              {hasNextPage && (
                <div className="flex justify-center py-2">
                  <Button variant="outline" size="sm" className="rounded-full" onClick={() => { captureAnchor(); fetchNextPage(); }} disabled={isFetchingNextPage}>
                    {isFetchingNextPage ? <LoaderCircle size={14} className="mr-2" /> : null}
                    Load older
                  </Button>
                </div>
              )}
              {isChatLoading ? (
                <div className="flex justify-center py-10">
                  <LoaderCircle />
                </div>
              ) : messages?.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-background shadow-sm">
                    <MessageSquare size={20} className="text-muted-foreground" />
                  </div>
                  <p className="font-medium">No messages yet</p>
                  <p className="mt-1 max-w-[280px] text-sm text-muted-foreground">Send a message to {partner?.first_name || "them"} — it will appear here.</p>
                </div>
              ) : (
                messages?.map((msg) => {
                  const isMine = msg.sender_id === user?.id;
                  return (
                    <div key={msg.id} id={`msg-${msg.id}`} className={cn("group flex items-end gap-1 px-1 py-0.5", isMine ? "justify-end" : "justify-start")}>
                      {isMine && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 opacity-0 transition-opacity group-hover:opacity-100">
                              <MoreVertical size={14} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem onClick={() => setReplyingTo(msg)}>
                              <Reply size={14} className="mr-2" />Reply
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleCopy(msg.content)} disabled={!msg.content}>
                              <Copy size={14} className="mr-2" />Copy
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => togglePin(msg.id)}>
                              <Pin size={14} className="mr-2" />
                              {msg.is_pinned ? "Unpin" : "Pin"}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive">
                                  <Trash2 size={14} className="mr-2" />Delete
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete message?</AlertDialogTitle>
                                  <AlertDialogDescription>This will delete the message for everyone.</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => deleteMessage(msg.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                      <div
                        className={cn(
                          "relative max-w-[78%] md:max-w-[68%] overflow-hidden rounded-2xl px-3.5 py-2 shadow-sm md:px-4",
                          msg.is_pinned && "ring-1 ring-amber-400",
                          isMine ? "rounded-br-md bg-primary text-primary-foreground" : "rounded-bl-md bg-background border",
                          msg._optimistic && "opacity-60"
                        )}
                      >
                        {msg.is_pinned && (
                          <span className={cn("mb-1 flex items-center gap-1 text-[10px] font-semibold", isMine ? "text-primary-foreground/80" : "text-amber-600")}>
                            <Pin size={10} /> Pinned
                          </span>
                        )}
                        {msg.reply_to && (
                          <div className={cn("mb-2 rounded-lg border-l-2 px-2.5 py-1.5 text-xs", isMine ? "border-primary-foreground/40 bg-primary-foreground/10" : "border-border bg-muted/60")}>
                            <p className="truncate text-[11px] font-medium opacity-70">Replying to</p>
                            {msg.reply_to.image_url && <span className="text-[11px]">📷 Image</span>}
                            {msg.reply_to.content && <p className="truncate opacity-80">{msg.reply_to.content}</p>}
                          </div>
                        )}
                        {msg.image_url && (
                          <button
                            type="button"
                            onClick={() => {
                              const idx = messageImages.indexOf(msg.image_url);
                              setLightboxIndex(idx >= 0 ? idx : 0);
                            }}
                            className={cn("block w-full overflow-hidden rounded-xl focus-visible:outline-none focus-visible:ring-2", isMine ? "focus-visible:ring-primary-foreground/40" : "focus-visible:ring-ring", msg.content ? "mb-2" : "")}
                            aria-label="Preview image"
                          >
                            <img
                              src={msg.image_url}
                              alt="attachment"
                              className={cn("h-auto w-full rounded-xl object-cover transition-opacity hover:opacity-90", msg.content ? "max-h-48 sm:max-h-56" : "max-h-72 sm:max-h-80")}
                              loading="lazy"
                            />
                          </button>
                        )}
                        {msg.content && <p className="whitespace-pre-wrap break-words text-[14px] leading-[1.4] [overflow-wrap:anywhere] md:text-[15px]">{msg.content}</p>}
                        <p className={cn("mt-1 flex items-center gap-1 text-[10px]", isMine ? "justify-end text-primary-foreground/60" : "text-muted-foreground")}>
                          {msg.ago}
                          {msg.is_pinned && <Pin size={10} className="opacity-60" />}
                        </p>
                      </div>
                      {!isMine && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 opacity-0 transition-opacity group-hover:opacity-100">
                              <MoreVertical size={14} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start" className="w-40">
                            <DropdownMenuItem onClick={() => setReplyingTo(msg)}>
                              <Reply size={14} className="mr-2" />Reply
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleCopy(msg.content)} disabled={!msg.content}>
                              <Copy size={14} className="mr-2" />Copy
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => togglePin(msg.id)}>
                              <Pin size={14} className="mr-2" />
                              {msg.is_pinned ? "Unpin" : "Pin"}
                            </DropdownMenuItem>
                            {msg.can_delete && (
                              <>
                                <DropdownMenuSeparator />
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive">
                                      <Trash2 size={14} className="mr-2" />Delete
                                    </DropdownMenuItem>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Delete message?</AlertDialogTitle>
                                      <AlertDialogDescription>This will delete the message for everyone.</AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => deleteMessage(msg.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {unreadBelow > 0 && (
            <button type="button" onClick={scrollToBottom} className="absolute bottom-4 right-4 z-20 flex h-9 items-center gap-1.5 rounded-full bg-primary px-3 text-sm font-medium text-primary-foreground shadow-lg transition hover:bg-primary/90">
              <ArrowDown size={16} /> {unreadBelow > 99 ? "99+" : unreadBelow} new
            </button>
          )}
          {unreadBelow === 0 && !isNearBottom && (
            <button type="button" onClick={scrollToBottom} className="absolute bottom-4 right-4 z-20 grid h-9 w-9 place-items-center rounded-full border bg-background shadow-lg hover:bg-accent">
              <ArrowDown size={16} />
            </button>
          )}
        </div>

        {replyingTo && (
          <div className="flex items-center gap-2 border-t bg-muted/40 px-3 py-2 md:px-4">
            <Reply size={16} className="shrink-0 text-muted-foreground" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium">Replying to {replyingTo.sender_id === user?.id ? "yourself" : currentChat?.first_name || "message"}</p>
              <p className="truncate text-xs text-muted-foreground">{replyingTo.content || (replyingTo.image_url ? "📷 Image" : "")}</p>
            </div>
            <Button type="button" variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => setReplyingTo(null)}>
              <X size={14} />
            </Button>
          </div>
        )}

        {isRateLimited && (
          <div className="flex items-center gap-2 border-t border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
            <Clock size={14} className="shrink-0" /> Too many messages — wait {cooldown}s.
          </div>
        )}

        {selectedImage && draftPreviewUrl && (
          <div className="flex items-center gap-3 border-t bg-muted/40 p-3">
            <button type="button" onClick={() => setPreviewImage(draftPreviewUrl)} className="h-14 w-14 overflow-hidden rounded-lg border bg-background">
              <img src={draftPreviewUrl} alt="preview" className="h-full w-full object-cover" />
            </button>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{selectedImage.name}</p>
              <p className="text-xs text-muted-foreground">{(selectedImage.size / 1024).toFixed(1)} KB • tap to preview</p>
            </div>
            <Button type="button" variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => setSelectedImage(null)}>
              <X size={14} />
            </Button>
          </div>
        )}

        <form onSubmit={handleSend} className="flex shrink-0 items-end gap-2 border-t bg-background p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] md:p-4">
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePickImage} />
          <Button type="button" variant="ghost" size="icon" className="h-10 w-10 shrink-0 rounded-full" onClick={() => fileInputRef.current?.click()} disabled={isSending} aria-label="Attach image">
            <ImageIcon size={18} />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="ghost" size="icon" className="h-10 w-10 shrink-0 rounded-full" aria-label="Add emoji">
                <SmilePlus size={18} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="start" className="p-0">
              <Suspense fallback={<div className="w-64 p-3 text-sm">Loading…</div>}>
                <EmojiPicker theme="dark" emojiStyle="native" onEmojiClick={handleEmojiClick} rows={3} perRow={7} emojiSize={28} />
              </Suspense>
            </DropdownMenuContent>
          </DropdownMenu>
          <div className="relative flex min-h-10 flex-1 items-end rounded-2xl border bg-muted/40 px-3 py-2 focus-within:bg-background focus-within:ring-1 focus-within:ring-ring">
            <textarea
              ref={inputRef}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message…"
              rows={1}
              className="max-h-[120px] min-h-[24px] w-full resize-none bg-transparent py-1 text-[15px] leading-5 placeholder:text-muted-foreground focus:outline-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(e);
                }
              }}
            />
          </div>
          <Button type="submit" size="icon" disabled={(!newMessage.trim() && !selectedImage) || isSending || isRateLimited} className="h-10 w-10 shrink-0 rounded-full" title={isRateLimited ? `Wait ${cooldown}s` : undefined}>
            {isRateLimited ? (
              <span className="flex items-center gap-1 text-xs">
                <Clock size={14} />
                {cooldown}
              </span>
            ) : isSending ? (
              <LoaderCircle size={16} className="animate-spin" />
            ) : (
              <Send size={18} />
            )}
          </Button>
        </form>

        {previewImage && <ImageLightbox src={previewImage} images={[previewImage]} index={0} onClose={() => setPreviewImage(null)} />}
        {lightboxIndex !== null && messageImages.length > 0 && (
          <ImageLightbox
            src={messageImages[lightboxIndex]}
            images={messageImages}
            index={lightboxIndex}
            onClose={() => setLightboxIndex(null)}
            onNavigate={(dir) => setLightboxIndex((prev) => (dir === "next" ? (prev + 1) % messageImages.length : (prev - 1 + messageImages.length) % messageImages.length))}
          />
        )}
      </div>
    );
  };

  const hasActiveChat = !!(room || legacyUserId);

  if (isMobile) {
    if (hasActiveChat) {
      return <div className="flex h-[calc(100dvh-3rem)] flex-col overflow-hidden md:h-full">{renderChat(true)}</div>;
    }
    return (
      <div className="flex h-[calc(100dvh-3rem)] flex-col overflow-hidden bg-background md:h-full">
        {renderConversationList()}
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100dvh-3rem)] w-full overflow-hidden rounded-xl border bg-background shadow-sm md:h-[calc(100dvh-4rem)]">
      <aside className="flex w-[360px] min-w-0 shrink-0 flex-col overflow-hidden border-r bg-muted/10 lg:w-[380px]">
        {renderConversationList()}
      </aside>
      <section className="flex min-w-0 flex-1 flex-col bg-background">
        {hasActiveChat ? (
          renderChat(false)
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
            <div className="mb-5 grid h-16 w-16 place-items-center rounded-2xl bg-muted">
              <MessageSquare size={26} className="text-muted-foreground" />
            </div>
            <h2 className="text-lg font-semibold">Your messages</h2>
            <p className="mt-2 max-w-[340px] text-sm text-muted-foreground">Select a conversation to start chatting, or find someone new.</p>
            <Button className="mt-5 rounded-full" onClick={() => navigate("/friends")}>
              <UsersRound size={16} className="mr-2" /> Browse people
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}

export default MessagesPage;
