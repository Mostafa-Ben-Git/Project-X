import LoaderCircle from "@/components/LoaderCircle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useIsMobile } from "@/hooks/use-mobile";
import useAuth from "@/hooks/useAuth";
import { useMessages } from "@/hooks/useMessages";
import { ArrowLeft, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { formatLastActive, statusDotClass } from "@/lib/status";

function MessagesPage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const chatId = userId ? Number(userId) : null;
  const isMobile = useIsMobile();

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
  } = useMessages(chatId);

  const [newMessage, setNewMessage] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    fetchConversations();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, messagesEndRef]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !chatId) return;
    try {
      await sendMessage(chatId, newMessage.trim());
      setNewMessage("");
      inputRef.current?.focus();
    } catch (error) {
      // error handled in hook
    }
  };

  const getChatPartner = (conversation) => {
    return conversation.sender_id === user?.id
      ? conversation.receiver
      : conversation.sender;
  };

  const goToList = () => {
    openChat(null);
    navigate("/messages");
  };

  // ── Conversation list body (shared by mobile + desktop) ──
  const renderListBody = () => (
    <>
      <h1 className="mb-6 text-2xl font-bold">Messages</h1>

      {isLoading && conversations.length === 0 ? (
        <LoaderCircle />
      ) : conversations.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-muted-foreground">
          <Send size={48} className="mb-4 opacity-50" />
          <p>No conversations yet</p>
          <p className="text-sm">Visit a user&apos;s profile to start chatting</p>
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
                  onClick={() => navigate(`/messages/${partner.id}`)}
                  className={`flex w-full items-center gap-3 rounded-lg p-3 text-left transition-colors hover:bg-muted ${
                    hasUnread ? "bg-accent/50" : ""
                  }`}
                >
                  <div className="relative shrink-0">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={partner?.avatar} />
                      <AvatarFallback>
                        {partner?.first_name?.[0]}
                        {partner?.last_name?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    {partner?.status !== "hidden" && (
                      <span className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background ${statusDotClass(partner?.status) || "bg-gray-400"}`} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className={hasUnread ? "font-bold" : "font-semibold"}>
                        {partner?.first_name} {partner?.last_name}
                      </p>
                      <span className={`text-xs ${hasUnread ? "font-medium text-foreground" : "text-muted-foreground"}`}>
                        {conv.ago}
                      </span>
                    </div>
                    <p className={`truncate text-sm ${hasUnread ? "font-medium text-foreground" : "text-muted-foreground"}`}>
                      {conv.content}
                    </p>
                  </div>
                  {hasUnread && (
                    <span className="flex h-6 min-w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
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

  // ── Chat room body (shared by mobile + desktop). showBack = mobile only ──
  const renderChatBody = (showBack) => {
    const partner = currentChat;
    return (
      <>
        {/* Header */}
        <div className="flex items-center gap-3 border-b pb-3">
          {showBack && (
            <Button variant="ghost" size="icon" onClick={goToList} className="md:hidden">
              <ArrowLeft size={20} />
            </Button>
          )}
          <Link to={`/profile/${partner?.username}`} className="relative cursor-pointer">
            <Avatar className="h-10 w-10">
              <AvatarImage src={partner?.avatar} />
              <AvatarFallback>
                {partner?.first_name?.[0]}
                {partner?.last_name?.[0]}
              </AvatarFallback>
            </Avatar>
            {partner?.status !== "hidden" && (
              <span className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background ${statusDotClass(partner?.status) || "bg-gray-400"}`} />
            )}
          </Link>
          <div>
            <Link to={`/profile/${partner?.username}`} className="cursor-pointer">
              <p className="font-semibold">
                {partner?.first_name} {partner?.last_name}
              </p>
            </Link>
            <p className="text-xs text-muted-foreground">
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
        <div className="flex-1 overflow-y-auto py-4 space-y-3">
          {isChatLoading ? (
            <LoaderCircle />
          ) : (
            messages?.map((msg) => {
              const isMine = msg.sender_id === user?.id;
              return (
                <div
                  key={msg.id}
                  className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[70%] rounded-xl px-4 py-2 ${
                      isMine
                        ? "bg-blue-600 text-white"
                        : "bg-muted text-foreground"
                    }`}
                  >
                    <p className="text-sm">{msg.content}</p>
                    <p
                      className={`mt-1 text-[10px] ${
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

        {/* Input */}
        <form onSubmit={handleSend} className="flex gap-2 border-t pt-3 pb-2 md:pb-3">
          <Input
            ref={inputRef}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1"
            disabled={isSending}
          />
          <Button type="submit" disabled={!newMessage.trim() || isSending}>
            {isSending ? (
              <LoaderCircle size={16} />
            ) : (
              <Send size={18} />
            )}
          </Button>
        </form>
      </>
    );
  };

  // ── MOBILE: show one panel at a time ──
  if (isMobile) {
    if (chatId) {
      return (
        <main className="flex h-full flex-col overflow-hidden p-4">
          {renderChatBody(true)}
        </main>
      );
    }
    return (
      <main className="h-full overflow-y-auto p-4">
        {renderListBody()}
      </main>
    );
  }

  // ── DESKTOP: side-by-side split view ──
  return (
    <main className="mx-auto flex h-full w-full max-w-[1000px] overflow-hidden">
      <aside className="flex w-[350px] shrink-0 flex-col overflow-hidden border-r">
        <div className="flex-1 overflow-y-auto p-4">{renderListBody()}</div>
      </aside>
      <section className="flex flex-1 flex-col overflow-hidden">
        {chatId ? (
          renderChatBody(false)
        ) : (
          <div className="flex flex-1 items-center justify-center text-muted-foreground">
            Select a conversation to start messaging
          </div>
        )}
      </section>
    </main>
  );
}

export default MessagesPage;
