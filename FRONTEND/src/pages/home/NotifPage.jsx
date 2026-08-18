import LoaderCircle from "@/components/LoaderCircle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import useNotifications from "@/hooks/useNotifications";
import { Bell, Check, CheckCheck, Heart, MessageSquare, UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";

const notificationIcons = {
  follow: <UserPlus size={18} className="text-blue-500" />,
  like: <Heart size={18} className="text-red-500" />,
  comment: <MessageSquare size={18} className="text-green-500" />,
  message: <MessageSquare size={18} className="text-purple-500" />,
  };

function NotificationsPage() {
  const {
    notifications,
    unreadCount,
    isLoading,
    hasMore,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  } = useNotifications();
  const navigate = useNavigate();

  const handleClick = (notification) => {
    if (!notification.read_at) {
      markAsRead(notification.id);
    }
    if (notification.post_id) {
      navigate(`/home`);
    }
  };

  return (
    <main className="mx-auto max-w-2xl p-4">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Notifications</h1>
        {unreadCount > 0 && (
          <Button variant="ghost" size="sm" onClick={markAllAsRead}>
            <CheckCheck size={18} className="mr-1" />
            Mark all as read ({unreadCount})
          </Button>
        )}
      </div>

      {isLoading && notifications.length === 0 ? (
        <LoaderCircle />
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-muted-foreground">
          <Bell size={48} className="mb-4 opacity-50" />
          <p>No notifications yet</p>
        </div>
      ) : (
        <>
          <ul className="space-y-1">
            {notifications?.map((n) => (
              <li key={n.id}>
                <button
                  onClick={() => handleClick(n)}
                  className={`flex w-full items-center gap-3 rounded-lg p-3 text-left transition-colors hover:bg-muted ${
                    !n.read_at ? "bg-muted/50" : ""
                  }`}
                >
                  <Avatar className="h-10 w-10 shrink-0">
                    <AvatarImage src={n.from_user?.avatar} />
                    <AvatarFallback>
                      {n.from_user?.first_name?.[0]}
                      {n.from_user?.last_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      <span className="font-semibold">
                        {n.from_user?.first_name} {n.from_user?.last_name}
                      </span>{" "}
                      <span className="text-muted-foreground">{n.content}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">{n.ago}</p>
                  </div>
                  <div className="shrink-0">
                    {!n.read_at ? (
                      <div className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                    ) : (
                      <Check size={14} className="text-muted-foreground" />
                    )}
                  </div>
                </button>
                <Separator />
              </li>
            ))}
          </ul>

          {hasMore && (
            <div className="mt-4 text-center">
              <Button
                variant="outline"
                onClick={() => fetchNotifications()}
                disabled={isLoading}
              >
                {isLoading ? <LoaderCircle size={16} /> : "Load more"}
              </Button>
            </div>
          )}
        </>
      )}
    </main>
  );
}

export default NotificationsPage;
