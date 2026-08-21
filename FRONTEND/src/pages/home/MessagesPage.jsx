import LoaderCircle from "@/components/LoaderCircle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsMobile } from "@/hooks/use-mobile";
import useAuth from "@/hooks/useAuth";
import { useMessages } from "@/hooks/useMessages";
import { getRoomForUser } from "@/api/messages";
import { ArrowLeft, Copy, Image as ImageIcon, MoreHorizontal, Pin, Reply, Send, SmilePlus, Trash2, X } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { formatLastActive, statusDotClass } from "@/lib/status";
import ImageLightbox from "@/components/ImageLightbox";

const EmojiPicker = lazy(() => import("emoji-picker-react"));

function MessagesPage() {
  const { userId, roomId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isMobile = useIsMobile();

  const room = roomId || null;
  // Legacy support: /messages/:userId will be converted to secure room
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
  } = useMessages({ userId: legacyUserId, room });

  const [newMessage, setNewMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const scrollViewportRef = useRef(null);

  const draftPreviewUrl = useMemo(() => (selectedImage ? URL.createObjectURL(selectedImage) : null), [selectedImage]);
  const messageImages = useMemo(() => messages?.filter((m) => m.image_url).map((m) => m.image_url) ?? [], [messages]);

  // Auto-resize textarea like PostBox (grows with content up to max height)
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, [newMessage]);

  // Keep focus when replying
  useEffect(() => {
    if (replyingTo) inputRef.current?.focus();
  }, [replyingTo]);

  // If legacy URL is hit, redirect to secure encrypted room
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

  // Scroll to bottom on initial load / new messages (reverse infinite shows latest at bottom)
  useEffect(() => {
    const vp = scrollViewportRef.current;
    if (!vp) return;
    // On first load, jump to bottom; on new messages, smooth scroll if near bottom
    const isNearBottom = vp.scrollHeight - vp.scrollTop - vp.clientHeight < 120;
    if (messages.length > 0 && (isNearBottom || vp.scrollTop === 0)) {
      // Use rAF to ensure DOM updated
      requestAnimationFrame(() => {
        vp.scrollTop = vp.scrollHeight;
      });
    }
  }, [messages]);

  // Initial scroll to bottom after chat loads
  useEffect(() => {
    if (!isChatLoading && messages.length > 0 && scrollViewportRef.current) {
      scrollViewportRef.current.scrollTop = scrollViewportRef.current.scrollHeight;
    }
  }, [isChatLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reverse infinite scroll: when scrolled near top, load older messages and preserve position
  useEffect(() => {
    const vp = scrollViewportRef.current;
    if (!vp) return;
    const onScroll = () => {
      if (vp.scrollTop < 80 && hasNextPage && !isFetchingNextPage) {
        const prevHeight = vp.scrollHeight;
        const prevTop = vp.scrollTop;
        fetchNextPage().then(() => {
          requestAnimationFrame(() => {
            const newHeight = vp.scrollHeight;
            vp.scrollTop = newHeight - prevHeight + prevTop;
          });
        });
      }
    };
    vp.addEventListener("scroll", onScroll, { passive: true });
    return () => vp.removeEventListener("scroll", onScroll);
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

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
    const hasText = newMessage.trim().length > 0;
    const hasImage = !!selectedImage;
    if ((!hasText && !hasImage) || (!room && !legacyUserId)) return;
    const content = newMessage.trim() || null;
    const replyTo = replyingTo;
    const image = selectedImage;
    // Optimistic: clear composer instantly and keep focus for rapid typing
    setNewMessage("");
    setSelectedImage(null);
    setReplyingTo(null);
    // Keep focus before and after async send
    requestAnimationFrame(() => inputRef.current?.focus());
    try {
      await sendMessage(content, image, replyTo?.id || null, replyTo);
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
    return conversation.sender_id === user?.id
      ? conversation.receiver
      : conversation.sender;
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

  // ── Conversation list body (shared by mobile + desktop) ──
  const renderListBody = () => (
    <>
      <h1 className="mb-4 md:mb-6 text-xl md:text-2xl font-bold">Messages</h1>

      {isLoading && conversations.length === 0 ? (
        <LoaderCircle />
      ) : conversations.length === 0 ? (
        <div className="flex flex-col items-center py-12 md:py-16 text-muted-foreground">
          <Send size={40} className="mb-4 opacity-50" />
          <p>No conversations yet</p>
          <p className="text-sm text-center">Visit a user&apos;s profile to start chatting</p>
        </div>
      ) : (
        <ul className="space-y-px">
          {conversations?.map((conv) => {
            const partner = getChatPartner(conv);
            if (!partner) return null;
            const hasUnread = conv.unread_count > 0;
            return (
              <li key={conv.id}>
                <button
                  onClick={() => goToRoom(partner.id, conv.room)}
                  className={`flex w-full items-center gap-2 md:gap-3 rounded-lg p-2 md:p-3 text-left transition-colors hover:bg-muted ${
                    hasUnread ? "bg-accent/50" : ""
                  }`}
                >
                  <div className="relative shrink-0">
                    <Avatar className="h-10 w-10 md:h-12 md:w-12">
                      <AvatarImage src={partner?.avatar} />
                      <AvatarFallback className="text-xs md:text-sm">
                        {partner?.first_name?.[0]}
                        {partner?.last_name?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    {partner?.status !== "hidden" && (
                      <span className={`absolute bottom-0 right-0 h-2.5 w-2.5 md:h-3 md:w-3 rounded-full border-2 border-background ${statusDotClass(partner?.status) || "bg-gray-400"}`} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className={`truncate ${hasUnread ? "font-bold" : "font-semibold"} text-sm md:text-base`}>
                        {partner?.first_name} {partner?.last_name}
                      </p>
                      <span className={`text-[10px] md:text-xs whitespace-nowrap ${hasUnread ? "font-medium text-foreground" : "text-muted-foreground"}`}>
                        {conv.ago}
                      </span>
                    </div>
                    <p className={`text-xs md:text-sm ${hasUnread ? "font-medium text-foreground" : "text-muted-foreground"}`}>
                      {conv.content}
                    </p>
                  </div>
                  {hasUnread && (
                    <span className="flex h-5 w-5 md:h-6 md:w-6 min-w-[20px] md:min-w-[24px] shrink-0 items-center justify-center rounded-full bg-primary text-[10px] md:text-xs font-bold text-primary-foreground">
                      {conv.unread_count > 99 ? "99+" : conv.unread_count}
                    </span>
                  )}
                </button>
                <Separator />
              </li>
            );
          })}
        </ul>
      )}
    </>
  );

  // ── Chat room body (shared by mobile + desktop) ──
  const renderChatBody = (showBack) => {
    const partner = currentChat;
    return (
      <>
        {/* Header — fixed at top of room, stays visible while messages scroll */}
        <div className="sticky top-0 z-10 -mx-3 -mt-3 flex shrink-0 items-center gap-2 border-b bg-background px-3 pb-2 pt-3 md:-mx-4 md:-mt-4 md:px-4 md:pb-3 md:pt-4">
          {showBack && (
            <Button variant="ghost" size="icon" onClick={goToList} className="md:hidden -ml-2">
              <ArrowLeft size={20} />
            </Button>
          )}
          <Link to={`/profile/${partner?.username}`} className="relative cursor-pointer shrink-0">
            <Avatar className="h-8 w-8 md:h-10 md:w-10">
              <AvatarImage src={partner?.avatar} />
              <AvatarFallback className="text-xs md:text-sm">
                {partner?.first_name?.[0]}
                {partner?.last_name?.[0]}
              </AvatarFallback>
            </Avatar>
            {partner?.status !== "hidden" && (
              <span className={`absolute bottom-0 right-0 h-2.5 w-2.5 md:h-3 md:w-3 rounded-full border-2 border-background ${statusDotClass(partner?.status) || "bg-gray-400"}`} />
            )}
          </Link>
          <div className="min-w-0 flex-1">
            <Link to={`/profile/${partner?.username}`} className="cursor-pointer">
              <p className="font-semibold text-sm md:text-base truncate">
                {partner?.first_name} {partner?.last_name}
              </p>
            </Link>
            <p className="text-[10px] md:text-xs text-muted-foreground truncate">
              {partner?.status === "online" && <span className="text-green-500">Online</span>}
              {partner?.status === "away" && <span className="text-yellow-500">Away</span>}
              {partner?.status === "dnd" && <span className="text-red-500">Do not disturb</span>}
              {(!partner?.status || partner?.status === "offline" || partner?.status === "hidden") && (
                <span>Last seen {formatLastActive(partner?.last_active_at) || "recently"}</span>
              )}
            </p>
          </div>
        </div>

        {/* Pinned strip */}
        {pinned?.length > 0 && (
          <div className="mb-2 rounded-lg border bg-amber-50 p-2 dark:bg-amber-950/30">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 dark:text-amber-300">
              <Pin size={14} /> Pinned ({pinned.length}/3)
            </div>
            <ul className="mt-1.5 space-y-1">
              {pinned.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-2 rounded bg-background px-2 py-1 text-xs">
                  <span className="truncate">{p.content || (p.image_url ? "📷 Image" : "—")}</span>
                  <Button variant="ghost" size="sm" className="h-6 shrink-0 px-2 text-xs" onClick={() => document.getElementById(`msg-${p.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" })}>
                    Jump
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Messages — ScrollArea with reverse infinite scroll (latest at bottom, scroll up for older) */}
        <ScrollArea viewportRef={scrollViewportRef} className="flex-1 py-3 md:py-4">
          <div className="space-y-2 md:space-y-3 pr-2">
            {hasNextPage && (
              <div className="flex justify-center py-2">
                <Button variant="ghost" size="sm" onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
                  {isFetchingNextPage ? <LoaderCircle size={14} className="mr-2" /> : null}
                  Load older messages
                </Button>
              </div>
            )}
            {isFetchingNextPage && !hasNextPage ? null : null}
            {isChatLoading ? (
              <div className="flex justify-center py-8"><LoaderCircle /></div>
            ) : messages?.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">No messages yet. Say hi 👋</p>
            ) : (
              messages?.map((msg) => {
              const isMine = msg.sender_id === user?.id;
              return (
                <div
                  key={msg.id}
                  id={`msg-${msg.id}`}
                  className={`group flex items-end gap-1 ${isMine ? "justify-end" : "justify-start"} px-1`}
                >
                  {isMine && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 opacity-0 transition-opacity group-hover:opacity-100">
                          <MoreHorizontal size={14} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem onClick={() => setReplyingTo(msg)}><Reply size={14} className="mr-2" />Reply</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleCopy(msg.content)} disabled={!msg.content}><Copy size={14} className="mr-2" />Copy</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => togglePin(msg.id)}><Pin size={14} className="mr-2" />{msg.is_pinned ? "Unpin" : "Pin"}</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive"><Trash2 size={14} className="mr-2" />Delete</DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete message?</AlertDialogTitle>
                              <AlertDialogDescription>This will delete the message for everyone.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteMessage(msg.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                  <div
                    className={`relative max-w-[75%] md:max-w-[70%] overflow-hidden rounded-xl px-3 py-1.5 md:px-4 md:py-2 ${
                      msg.is_pinned ? "ring-1 ring-amber-400" : ""
                    } ${isMine ? "bg-blue-600 text-white" : "bg-muted text-foreground"} ${msg._optimistic ? "opacity-60" : ""}`}
                  >
                    {msg.is_pinned && <span className="mb-1 flex items-center gap-1 text-[10px] font-semibold text-amber-300"><Pin size={10} /> Pinned</span>}
                    {msg.reply_to && (
                      <div className={`mb-1.5 rounded border-l-2 px-2 py-1 text-xs ${isMine ? "border-white/50 bg-white/10" : "border-border bg-background/60"}`}>
                        <p className="truncate font-medium opacity-80">Replying to</p>
                        {msg.reply_to.image_url && <span className="text-[11px]">📷 Image</span>}
                        {msg.reply_to.content && <p className="truncate opacity-70">{msg.reply_to.content}</p>}
                      </div>
                    )}
                    {msg.image_url && (
                      <button
                        type="button"
                        onClick={() => {
                          const idx = messageImages.indexOf(msg.image_url);
                          setLightboxIndex(idx >= 0 ? idx : 0);
                        }}
                        className={`block w-full overflow-hidden rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 ${msg.content ? "mb-1.5" : ""}`}
                        aria-label="Preview image"
                      >
                        <img
                          src={msg.image_url}
                          alt="attachment"
                          className={`w-full h-auto max-w-full rounded-lg object-cover transition-opacity hover:opacity-90 ${msg.content ? "max-h-40 sm:max-h-48" : "max-h-64 sm:max-h-72"}`}
                          loading="lazy"
                        />
                      </button>
                    )}
                    {msg.content && <p className="text-sm md:text-base break-all whitespace-pre-wrap break-words [overflow-wrap:anywhere]">{msg.content}</p>}
                    <p className={`mt-0.5 md:mt-1 text-[8px] md:text-[10px] ${isMine ? "text-blue-200" : "text-muted-foreground"}`}>{msg.ago}</p>
                  </div>
                  {!isMine && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 opacity-0 transition-opacity group-hover:opacity-100">
                          <MoreHorizontal size={14} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-40">
                        <DropdownMenuItem onClick={() => setReplyingTo(msg)}><Reply size={14} className="mr-2" />Reply</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleCopy(msg.content)} disabled={!msg.content}><Copy size={14} className="mr-2" />Copy</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => togglePin(msg.id)}><Pin size={14} className="mr-2" />{msg.is_pinned ? "Unpin" : "Pin"}</DropdownMenuItem>
                        {msg.can_delete && (
                          <>
                            <DropdownMenuSeparator />
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive"><Trash2 size={14} className="mr-2" />Delete</DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete message?</AlertDialogTitle>
                                  <AlertDialogDescription>This will delete the message for everyone.</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => deleteMessage(msg.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
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

        {/* Reply banner */}
        {replyingTo && (
          <div className="mb-2 flex items-center gap-2 rounded-lg border bg-muted p-2">
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

        {/* Draft image preview — tappable for full preview */}
        {selectedImage && draftPreviewUrl && (
          <div className="relative mb-2 flex items-center gap-2 rounded-lg border bg-muted p-2">
            <button type="button" onClick={() => setPreviewImage(draftPreviewUrl)} className="shrink-0 overflow-hidden rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label="Preview selected image">
              <img src={draftPreviewUrl} alt="preview" className="h-16 w-16 rounded-md object-cover transition-opacity hover:opacity-90" />
            </button>
            <div className="flex-1 truncate text-xs text-muted-foreground">{selectedImage.name}</div>
            <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => setSelectedImage(null)}>
              <X size={14} />
            </Button>
          </div>
        )}

        {/* Input — fixed at bottom of room, stays visible while messages scroll, offset for mobile bottom nav */}
        <form onSubmit={handleSend} className="sticky bottom-0 z-10 -mx-3 -mb-3 flex shrink-0 items-end gap-1.5 border-t bg-background px-3 pb-[calc(4rem+env(safe-area-inset-bottom))] pt-2 md:-mx-4 md:-mb-4 md:px-4 md:pb-4 md:pt-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePickImage}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9 shrink-0 md:h-10 md:w-10"
            onClick={() => fileInputRef.current?.click()}
            disabled={isSending}
            aria-label="Attach image"
          >
            <ImageIcon size={18} />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="ghost" size="icon" className="h-9 w-9 shrink-0 md:h-10 md:w-10" aria-label="Add emoji">
                <SmilePlus size={18} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="start" className="p-0">
              <Suspense fallback={<div className="w-64 p-3 text-sm">Loading…</div>}>
                <EmojiPicker theme="dark" emojiStyle="native" onEmojiClick={handleEmojiClick} rows={3} perRow={7} emojiSize={28} />
              </Suspense>
            </DropdownMenuContent>
          </DropdownMenu>

          <textarea
            ref={inputRef}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            rows={1}
            className="max-h-[120px] min-h-9 flex-1 resize-none overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring md:min-h-10 md:text-base"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend(e);
              }
            }}
          />
          <Button
            type="submit"
            disabled={(!newMessage.trim() && !selectedImage) || isSending}
            className="h-9 md:h-10 px-3 md:px-4"
          >
            {isSending ? <LoaderCircle size={16} /> : <Send size={16} className="md:w-[18px] md:h-[18px]" />}
          </Button>
        </form>

        {/* Lightbox for draft preview */}
        {previewImage && (
          <ImageLightbox src={previewImage} images={[previewImage]} index={0} onClose={() => setPreviewImage(null)} />
        )}

        {/* Lightbox for message history images */}
        {lightboxIndex !== null && messageImages.length > 0 && (
          <ImageLightbox
            src={messageImages[lightboxIndex]}
            images={messageImages}
            index={lightboxIndex}
            onClose={() => setLightboxIndex(null)}
            onNavigate={(dir) =>
              setLightboxIndex((prev) =>
                dir === "next" ? (prev + 1) % messageImages.length : (prev - 1 + messageImages.length) % messageImages.length
              )
            }
          />
        )}
      </>
    );
  };

  const hasActiveChat = !!(room || legacyUserId);

  // ── MOBILE: show one panel at a time ──
  if (isMobile) {
    if (hasActiveChat) {
      return (
        <main className="flex h-full flex-col overflow-hidden p-3 md:p-4">
          {renderChatBody(true)}
        </main>
      );
    }
    return (
      <main className="flex h-full flex-col overflow-hidden p-0">
        <ScrollArea className="flex-1">
          <div className="p-3 md:p-4">{renderListBody()}</div>
        </ScrollArea>
      </main>
    );
  }

  // ── DESKTOP: side-by-side split view ──
  return (
    <main className="mx-auto flex h-full w-full max-w-[1200px] overflow-hidden">
      <aside className="flex w-[280px] md:w-[320px] lg:w-[350px] shrink-0 flex-col overflow-hidden border-r">
        <ScrollArea className="flex-1">
          <div className="p-3 md:p-4">{renderListBody()}</div>
        </ScrollArea>
      </aside>
      <section className="flex min-h-0 flex-1 flex-col overflow-hidden p-3 md:p-4">
        {hasActiveChat ? (
          renderChatBody(false)
        ) : (
          <div className="flex flex-1 items-center justify-center text-muted-foreground text-sm md:text-base">
            Select a conversation to start messaging
          </div>
        )}
      </section>
    </main>
  );
}

export default MessagesPage;