import { useEffect, useCallback } from 'react';
import { Task } from '@/types/task';
import { toast } from '@/hooks/use-toast';

export const useNotifications = () => {
  // Request notification permission on first use
  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      toast({
        title: "Notifications not supported",
        description: "Your browser doesn't support notifications.",
        variant: "destructive",
      });
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      toast({
        title: "Notifications blocked",
        description: "Please enable notifications in your browser settings.",
        variant: "destructive",
      });
      return false;
    }

    const permission = await window.Notification.requestPermission();
    if (permission === 'granted') {
      toast({
        title: "Notifications enabled",
        description: "You'll receive reminders for your tasks.",
      });
      return true;
    } else {
      toast({
        title: "Notifications disabled",
        description: "You won't receive task reminders.",
        variant: "destructive",
      });
      return false;
    }
  }, []);

  // Show notification
  const showNotification = useCallback((title: string, body: string, icon?: string) => {
    if (Notification.permission === 'granted') {
      const notification = new Notification(title, {
        body,
        icon: icon || '/favicon.ico',
        badge: '/favicon.ico',
      });

      // Auto close after 10 seconds
      setTimeout(() => notification.close(), 10000);
      
      return notification;
    }
    return null;
  }, []);

  // Show task reminder
  const showTaskReminder = useCallback((task: Task) => {
    if (!task.notificationsEnabled) return;
    
    const now = new Date();
    const dueDate = task.dueDate;
    
    if (!dueDate) return;
    
    const timeUntilDue = dueDate.getTime() - now.getTime();
    const hoursUntilDue = Math.floor(timeUntilDue / (1000 * 60 * 60));
    
    let reminderText = '';
    if (hoursUntilDue < 0) {
      reminderText = `Task "${task.title}" is overdue!`;
    } else if (hoursUntilDue === 0) {
      reminderText = `Task "${task.title}" is due now!`;
    } else if (hoursUntilDue <= 2) {
      reminderText = `Task "${task.title}" is due in ${hoursUntilDue} hour${hoursUntilDue === 1 ? '' : 's'}!`;
    }
    
    if (reminderText) {
      showNotification('Task Reminder', reminderText);
    }
  }, [showNotification]);

  // Show timer completion notification
  const showTimerComplete = useCallback((taskTitle: string, timeSpent: number) => {
    const hours = Math.floor(timeSpent / 60);
    const minutes = timeSpent % 60;
    const timeText = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
    
    showNotification(
      'Timer Completed',
      `You worked on "${taskTitle}" for ${timeText}. Great job!`
    );
  }, [showNotification]);

  // Check for due tasks (called periodically)
  const checkDueTasks = useCallback((tasks: Task[], updateTask?: (taskId: string, updates: Partial<Task>) => void) => {
    const now = new Date();
    
    tasks.forEach(task => {
      if (task.completed || !task.notificationsEnabled || !task.dueDate || task.reminderSent) {
        return;
      }
      
      const timeUntilDue = task.dueDate.getTime() - now.getTime();
      const hoursUntilDue = Math.floor(timeUntilDue / (1000 * 60 * 60));
      
      // Send reminder if due within 2 hours or overdue
      if (hoursUntilDue <= 2) {
        showTaskReminder(task);
        // Mark reminder as sent to avoid duplicates
        if (updateTask) {
          updateTask(task.id, { reminderSent: true });
        }
      }
    });
  }, [showTaskReminder]);

  return {
    requestPermission,
    showNotification,
    showTaskReminder,
    showTimerComplete,
    checkDueTasks,
  };
};