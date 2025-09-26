import { useState, useCallback, useEffect } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Bell } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';

export const NotificationBanner = () => {
  const { requestPermission } = useNotifications();
  const [status, setStatus] = useState<'unsupported' | 'default' | 'denied' | 'granted'>(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported';
    return Notification.permission as 'default' | 'denied' | 'granted';
  });

  // Keep status in sync when permission changes (after user action)
  const refreshStatus = useCallback(() => {
    if (!('Notification' in window)) return setStatus('unsupported');
    setStatus(Notification.permission as 'default' | 'denied' | 'granted');
  }, []);

  useEffect(() => {
    const id = setInterval(refreshStatus, 2000);
    return () => clearInterval(id);
  }, [refreshStatus]);

  if (status === 'granted') return null;

  if (status === 'unsupported') {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertTitle>Notifications not supported</AlertTitle>
        <AlertDescription>
          Your browser does not support notifications. You can still use all other features normally.
        </AlertDescription>
      </Alert>
    );
  }

  if (status === 'default') {
    return (
      <Alert className="mb-6">
        <AlertTitle>Enable reminders</AlertTitle>
        <AlertDescription className="flex items-center justify-between gap-4">
          Allow notifications to receive due-date reminders and timer updates.
          <Button size="sm" onClick={async () => {
            const ok = await requestPermission();
            if (ok) refreshStatus();
          }}>
            <Bell className="w-4 h-4 mr-2" /> Enable
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  // status === 'denied'
  return (
    <Alert variant="destructive" className="mb-6">
      <AlertTitle>Notifications blocked</AlertTitle>
      <AlertDescription>
        Notifications are blocked in your browser. To enable: click the lock icon in the address bar → Site settings → Notifications → Allow. Then reload this page.
      </AlertDescription>
    </Alert>
  );
};

export default NotificationBanner;
