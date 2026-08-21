import LoaderCircle from "@/components/LoaderCircle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useIsMobile } from "@/hooks/use-mobile";
import useAuth from "@/hooks/useAuth";
import { useMessages } from "@/hooks/useMessages";
import { getRoomForUser } from "@/api/messages";
import { ArrowLeft, Image as ImageIcon, Send, SmilePlus, X } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { formatLastActive, statusDotClass } from "@/lib/status";

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
    currentChat,
    isLoading,
    isChatLoading,
    isSending,
    messagesEndRef,
    fetchConversations,
    sendMessage,
    openChat,
  } = useMessages({ userId: legacyUserId, room });

  const [newMessage, setNewMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);

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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, messagesEndRef]);

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
    try {
      const content = newMessage.trim() || null;
      await sendMessage(content, selectedImage);
      setNewMessage("");
      setSelectedImage(null);
      inputRef.current?.focus();
    } catch {
      // error handled in hook
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
        {/* Header */}
        <div className="flex items-center gap-2 md:gap-3 border-b pb-2 md:pb-3">
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

        {/* Messages */}
        <div className="flex-1 overflow-y-auto py-3 md:py-4 space-y-2 md:space-y-3">
          {isChatLoading ? (
            <LoaderCircle />
          ) : messages?.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No messages yet. Say hi 👋</p>
          ) : (
            messages?.map((msg) => {
              const isMine = msg.sender_id === user?.id;
              return (
                <div
                  key={msg.id}
                  className={`flex ${isMine ? "justify-end" : "justify-start"} px-1`}
                >
                  <div
                    className={`max-w-[75%] md:max-w-[70%] overflow-hidden rounded-xl px-3 py-1.5 md:px-4 md:py-2 ${
                      isMine
                        ? "bg-blue-600 text-white"
                        : "bg-muted text-foreground"
                    }`}
                  >
                    {msg.image_url && (
                      <img
                        src={msg.image_url}
                        alt="attachment"
                        className="mb-1.5 max-h-64 w-full rounded-lg object-cover"
                        loading="lazy"
                      />
                    )}
                    {msg.content && <p className="text-sm md:text-base break-words whitespace-pre-wrap">{msg.content}</p>}
                    <p
                      className={`mt-0.5 md:mt-1 text-[8px] md:text-[10px] ${
                        isMine ? "text-blue-200" : "text-muted-foreground"
                      }`}
                    >
                      {msg.ago}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Image preview */}
        {selectedImage && (
          <div className="relative mb-2 flex items-center gap-2 rounded-lg border bg-muted p-2">
            <img
              src={URL.createObjectURL(selectedImage)}
              alt="preview"
              className="h-16 w-16 rounded-md object-cover"
            />
            <div className="flex-1 truncate text-xs text-muted-foreground">{selectedImage.name}</div>
            <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => setSelectedImage(null)}>
              <X size={14} />
            </Button>
          </div>
        )}

        {/* Input — emoji + image + text */}
        <form onSubmit={handleSend} className="flex items-end gap-1.5 md:gap-2 border-t pt-2 md:pt-3 pb-20 md:pb-3">
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
            className="max-h-24 min-h-9 flex-1 resize-none rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring md:min-h-10 md:text-base"
            disabled={isSending}
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
      <main className="h-full overflow-y-auto p-3 md:p-4">
        {renderListBody()}
      </main>
    );
  }

  // ── DESKTOP: side-by-side split view ──
  return (
    <main className="mx-auto flex h-full w-full max-w-[1200px] overflow-hidden">
      <aside className="flex w-[280px] md:w-[320px] lg:w-[350px] shrink-0 flex-col overflow-hidden border-r">
        <div className="flex-1 overflow-y-auto p-3 md:p-4">{renderListBody()}</div>
      </aside>
      <section className="flex flex-1 flex-col overflow-hidden p-3 md:p-4">
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