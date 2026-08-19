import LoaderCircle from "@/components/LoaderCircle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import useAuth from "@/hooks/useAuth";
import { useMessages } from "@/hooks/useMessages";
import { ArrowLeft, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function MessagesPage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const chatId = userId ? Number(userId) : null;

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

  // ── Chat Room (URL-driven so refresh keeps you in the room) ──
  if (chatId) {
    const partner = currentChat;
    return (
      <main className="flex h-[calc(100vh-3rem)] flex-col p-4">
        {/* Header */}
        <div className="flex items-center gap-3 border-b pb-3">
          <Button variant="ghost" size="icon" onClick={goToList}>
            <ArrowLeft size={20} />
          </Button>
          <Avatar className="h-10 w-10">
            <AvatarImage src={partner?.avatar} />
            <AvatarFallback>
              {partner?.first_name?.[0]}
              {partner?.last_name?.[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold">
              {partner?.first_name} {partner?.last_name}
            </p>
            <p className="text-xs text-muted-foreground">@{partner?.username}</p>
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
        <form onSubmit={handleSend} className="flex gap-2 border-t pt-3">
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
      </main>
    );
  }

  // ── Conversations List ──
  return (
    <main className="mx-auto max-w-2xl p-4">
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
        <ul className="space-y-1">
          {conversations?.map((conv) => {
            const partner = getChatPartner(conv);
            if (!partner) return null;
            return (
              <li key={conv.id}>
                <button
                  onClick={() => navigate(`/messages/${partner.id}`)}
                  className="flex w-full items-center gap-3 rounded-lg p-3 text-left transition-colors hover:bg-muted"
                >
                  <Avatar className="h-12 w-12 shrink-0">
                    <AvatarImage src={partner?.avatar} />
                    <AvatarFallback>
                      {partner?.first_name?.[0]}
                      {partner?.last_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold">
                        {partner?.first_name} {partner?.last_name}
                      </p>
                      <span className="text-xs text-muted-foreground">
                        {conv.ago}
                      </span>
                    </div>
                    <p className="truncate text-sm text-muted-foreground">
                      {conv.content}
                    </p>
                  </div>
                </button>
                <Separator />
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}

export default MessagesPage;
