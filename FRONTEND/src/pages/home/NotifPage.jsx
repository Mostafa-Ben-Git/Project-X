import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { EmptyState } from "@/components/empty-state";
import { ErrorState } from "@/components/error-state";
import { useNotifications } from "@/hooks/useNotifications";
import { useNavigate } from "react-router-dom";
import { Bell, CheckCheck, Heart, MessageSquare, UserPlus } from "lucide-react";

const notificationIcons = {
  follow: <UserPlus size={18} className="text-blue-500" />,
  like: <Heart size={18} className="text-red-500" />,
  comment: <MessageSquare size={18} className="text-green-500" />,
  message: <MessageSquare size={18} className="text-purple-500" />,
};

const iconBg = {
  follow: "bg-blue-500/10",
  like: "bg-red-500/10",
  comment: "bg-green-500/10",
  message: "bg-purple-500/10",
};

function NotificationsPage() {
  const {
    notifications,
    unreadCount,
    isLoading,
    isError,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    markRead,
    markAllRead,
  } = useNotifications();
  const navigate = useNavigate();

  const handleClick = async (n) => {
    if (!n.read_at) markRead(n.id);
    if (n.type === "message" && n.from_user?.id) {
      try {
        const mod = await import("@/api/messages");
        const room = await mod.getRoomForUser(n.from_user.id);
        navigate(`/messages/room/${room}`);
      } catch {
        navigate(`/messages/${n.from_user.id}`);
      }
    } else if (n.post_id) {
      navigate("/home");
    }
  };

  return (
    <main className="mx-auto max-w-2xl p-3 sm:p-4">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-xl font-bold sm:text-2xl">Notifications</h1>
        {unreadCount > 0 && (
          <Button variant="ghost" size="sm" onClick={markAllRead}>
            <CheckCheck size={18} className="mr-1" />
            Mark all as read ({unreadCount})
          </Button>
        )}
      </div>

      {isError ? (
        <ErrorState title="Could not load notifications" />
      ) : notifications.length === 0 && !isLoading ? (
        <EmptyState
          icon={Bell}
          title="No notifications yet"
          message="When someone follows, likes, or messages you, it'll show up here."
        />
      ) : (
        <ul className="space-y-px">
          {notifications.map((n) => (
            <li key={n.id}>
              <button
                onClick={() => handleClick(n)}
                className={`flex w-full items-center gap-3 rounded-lg p-3 text-left transition-colors hover:bg-accent ${
                  !n.read_at ? "bg-accent/40" : ""
                }`}
              >
                 <span className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${iconBg[n.type] || "bg-muted"}`}>
                   {notificationIcons[n.type] || <Bell size={18} />}
                   {n.type === "message" && n.count > 1 && (
                     <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold leading-none text-primary-foreground">
                       {n.count > 99 ? "99+" : n.count}
                     </span>
                   )}
                 </span>
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarImage src={n.from_user?.avatar} />
                  <AvatarFallback>
                    {n.from_user?.first_name?.[0]}
                    {n.from_user?.last_name?.[0]}
                  </AvatarFallback>
                </Avatar>
                 <span className="min-w-0 flex-1">
                   <span className="block truncate text-sm">
                     <span className="font-semibold">
                       {n.from_user?.first_name} {n.from_user?.last_name}
                     </span>{" "}
                     <span className="text-muted-foreground">{n.content}</span>
                   </span>
                   <span className="text-xs text-muted-foreground">{n.ago}</span>
                 </span>
                {!n.read_at && <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-primary" />}
              </button>
              <Separator />
            </li>
          ))}
        </ul>
      )}

      {hasNextPage && (
        <div className="mt-4 text-center">
          <Button variant="outline" onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
            {isFetchingNextPage ? "Loading..." : "Load more"}
          </Button>
        </div>
      )}

      {!hasNextPage && notifications.length > 0 && (
        <p className="mt-4 text-center text-sm text-muted-foreground">You&apos;re all caught up</p>
      )}
    </main>
  );
}

export default NotificationsPage;
