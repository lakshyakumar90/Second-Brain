import React, { useState, useEffect } from 'react';
import { X, Bell, CheckCircle, UserPlus, Users, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
// import { Separator } from '@/components/ui/separator';
import { notificationApi, type Notification } from '@/services/notificationApi';
import { workspaceApi } from '@/services/workspaceApi';
import { useToast } from '@/hooks/use-toast';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { cn } from '@/lib/utils';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { toast } = useToast();
  const { refreshWorkspaces } = useWorkspace();

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
      loadUnreadCount();
    }
  }, [isOpen]);

  const loadNotifications = async () => {
    try {
      setIsLoading(true);
      const response = await notificationApi.getNotifications({ limit: 50 });
      setNotifications(response.notifications);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load notifications",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const response = await notificationApi.getUnreadCount();
      setUnreadCount(response.count);
    } catch (error) {
      console.error('Failed to load unread count:', error);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationApi.markAsRead(notificationId);
      setNotifications(prev => 
        prev.map(n => n._id === notificationId ? { ...n, isRead: true, readAt: new Date().toISOString() } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to mark notification as read",
        variant: "destructive",
      });
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications(prev => 
        prev.map(n => ({ ...n, isRead: true, readAt: new Date().toISOString() }))
      );
      setUnreadCount(0);
      toast({
        title: "Success",
        description: "All notifications marked as read",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to mark all as read",
        variant: "destructive",
      });
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      await notificationApi.deleteNotification(notificationId);
      setNotifications(prev => prev.filter(n => n._id !== notificationId));
      if (!notifications.find(n => n._id === notificationId)?.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      toast({
        title: "Success",
        description: "Notification deleted",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete notification",
        variant: "destructive",
      });
    }
  };

  const handleAcceptInvite = async (workspaceId: string, notificationId: string) => {
    try {
      await workspaceApi.acceptInvite(workspaceId);
      await handleDeleteNotification(notificationId);
      await refreshWorkspaces();
      toast({
        title: "Success",
        description: "Workspace invitation accepted",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to accept invitation",
        variant: "destructive",
      });
    }
  };

  const handleRejectInvite = async (workspaceId: string, notificationId: string) => {
    try {
      await workspaceApi.rejectInvite(workspaceId);
      await handleDeleteNotification(notificationId);
      toast({
        title: "Success",
        description: "Workspace invitation rejected",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to reject invitation",
        variant: "destructive",
      });
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'collaboration':
        return <UserPlus className="h-4 w-4" />;
      case 'workspace':
        return <Users className="h-4 w-4" />;
      case 'reminder':
        return <Calendar className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  const isWorkspaceInvitation = (notification: Notification) => {
    return notification.type === 'collaboration' && 
           notification.title === 'Workspace Invitation' &&
           notification.relatedType === 'workspace';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-end z-50">
      <div className="w-96 h-full bg-background border-l flex flex-col">
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Notifications</h2>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="ml-1">
                {unreadCount}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                className="text-xs"
              >
                Mark all read
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Notifications List */}
        <ScrollArea className="flex-1">
          <div className="p-4">
            {isLoading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-muted rounded mb-2"></div>
                    <div className="h-3 bg-muted rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-8">
                <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No notifications yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.map((notification) => (
                  <div
                    key={notification._id}
                    className={cn(
                      "p-3 border rounded-lg hover:bg-accent/50 transition-colors",
                      !notification.isRead && "bg-blue-50/50 border-blue-200"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "mt-1 p-1 rounded-full",
                        notification.isRead ? "bg-muted" : "bg-blue-100"
                      )}>
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <h4 className="text-sm font-medium truncate">
                            {notification.title}
                          </h4>
                          <div className="flex items-center gap-1 ml-2">
                            {!notification.isRead && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-4 w-4 p-0 opacity-0 group-hover:opacity-100"
                              onClick={() => handleDeleteNotification(notification._id)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-muted-foreground">
                            {formatTimeAgo(notification.createdAt)}
                          </span>
                          <div className="flex items-center gap-1">
                            {!notification.isRead && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 text-xs"
                                onClick={() => handleMarkAsRead(notification._id)}
                              >
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Mark read
                              </Button>
                            )}
                          </div>
                        </div>

                        {/* Workspace Invitation Actions */}
                        {isWorkspaceInvitation(notification) && !notification.isRead && (
                          <div className="flex items-center gap-2 mt-3">
                            <Button
                              size="sm"
                              className="h-7 text-xs"
                              onClick={() => handleAcceptInvite(notification.relatedId!, notification._id)}
                            >
                              Accept
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs"
                              onClick={() => handleRejectInvite(notification.relatedId!, notification._id)}
                            >
                              Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default NotificationPanel;
