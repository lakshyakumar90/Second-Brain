import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { notificationApi } from '@/services/notificationApi';
import NotificationPanel from './NotificationPanel';

const NotificationButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadUnreadCount();
    
    // Poll for unread count every 30 seconds
    const interval = setInterval(loadUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadUnreadCount = async () => {
    try {
      const response = await notificationApi.getUnreadCount();
      setUnreadCount(response.count);
    } catch (error) {
      console.error('Failed to load unread count:', error);
    }
  };

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleClose = () => {
    setIsOpen(false);
    // Refresh unread count when closing
    loadUnreadCount();
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="relative p-2"
        onClick={handleToggle}
        title="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>

      <NotificationPanel isOpen={isOpen} onClose={handleClose} />
    </>
  );
};

export default NotificationButton;
