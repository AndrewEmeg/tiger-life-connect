
import { format, formatDistanceToNow } from "date-fns";
import { Bell, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useNotifications } from "@/hooks/useNotifications";

export function NotificationsDropdown() {
  const { notifications, markAsRead, unreadCount } = useNotifications();
  const navigate = useNavigate();

  const handleNotificationClick = (notification: any) => {
    // Mark this notification as read
    markAsRead.mutate([notification.id]);
    // Navigate to the messages page with the sender's ID
    navigate(`/messages?to=${notification.sender_id}`);
  };

  const handleMarkAllAsRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    const unreadIds = notifications
      .filter(n => !n.is_read)
      .map(n => n.id);
    if (unreadIds.length > 0) {
      markAsRead.mutate(unreadIds);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between px-4 py-2">
          <h3 className="font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs"
              onClick={handleMarkAllAsRead}
            >
              <Check className="mr-1 h-4 w-4" />
              Mark all as read
            </Button>
          )}
        </div>
        <Separator />
        <div className="max-h-[300px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No notifications
            </div>
          ) : (
            notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className="flex cursor-pointer gap-4 p-4"
                onClick={() => handleNotificationClick(notification)}
              >
                <Avatar className="h-10 w-10">
                  <AvatarImage src={notification.sender?.profile_image} />
                  <AvatarFallback>
                    {notification.sender?.full_name?.charAt(0) ?? "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <p className={`text-sm ${notification.is_read ? 'text-muted-foreground' : 'font-medium'}`}>
                    <span className="font-semibold">{notification.sender?.full_name}</span>
                    {" sent you a message"}
                  </p>
                  <p className="text-sm text-muted-foreground line-clamp-1">
                    {notification.message_preview}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                  </p>
                </div>
                {!notification.is_read && (
                  <div className="h-2 w-2 rounded-full bg-blue-500" />
                )}
              </DropdownMenuItem>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
