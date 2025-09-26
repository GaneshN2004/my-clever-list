import { useState, useEffect, useCallback } from 'react';
import { Task, TaskCategory, ProductivityStats, DailyProductivity } from '@/types/task';
import { toast } from '@/hooks/use-toast';
import { useNotifications } from '@/hooks/useNotifications';

const STORAGE_KEY = 'smart-todo-tasks';
const DAILY_STATS_KEY = 'smart-todo-daily-stats';

export const useProductivity = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTimer, setActiveTimer] = useState<string | null>(null);
  const { requestPermission, showTimerComplete, checkDueTasks } = useNotifications();

  // Load tasks from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsedTasks = JSON.parse(stored).map((task: any) => ({
        ...task,
        createdAt: new Date(task.createdAt),
        completedAt: task.completedAt ? new Date(task.completedAt) : undefined,
        startTime: task.startTime ? new Date(task.startTime) : undefined,
        dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
        notificationsEnabled: task.notificationsEnabled ?? true,
        reminderSent: task.reminderSent ?? false,
      }));
      setTasks(parsedTasks);
    }
  }, []);

  // Save tasks to localStorage whenever tasks change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  // Timer effect - update time spent for active task
  useEffect(() => {
    if (!activeTimer) return;

    const interval = setInterval(() => {
      setTasks(prevTasks => 
        prevTasks.map(task => {
          if (task.id === activeTimer && task.isActive && task.startTime) {
            const now = new Date();
            const elapsed = Math.floor((now.getTime() - task.startTime.getTime()) / 60000); // minutes
            return { ...task, timeSpent: task.timeSpent + 1 };
          }
          return task;
        })
      );
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [activeTimer]);

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(task => 
      task.id === id ? { ...task, ...updates } : task
    ));
  }, []);

  // Check for due tasks every 5 minutes
  useEffect(() => {
    checkDueTasks(tasks, updateTask);
    const interval = setInterval(() => {
      checkDueTasks(tasks, updateTask);
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [tasks, checkDueTasks, updateTask]);

  // Request notification permission on first load
  useEffect(() => {
    requestPermission();
  }, [requestPermission]);

  const addTask = useCallback((title: string, description: string, category: TaskCategory, dueDate?: Date, notificationsEnabled: boolean = true) => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      title,
      description,
      category,
      completed: false,
      createdAt: new Date(),
      timeSpent: 0,
      isActive: false,
      dueDate,
      notificationsEnabled,
      reminderSent: false,
    };

    setTasks(prev => [newTask, ...prev]);
    toast({
      title: "Task Added",
      description: `${title} has been added to your ${category} tasks.`,
    });
  }, []);

  const toggleTask = useCallback((id: string) => {
    setTasks(prev => prev.map(task => {
      if (task.id === id) {
        const updatedTask = {
          ...task,
          completed: !task.completed,
          completedAt: !task.completed ? new Date() : undefined,
          isActive: false,
          startTime: undefined,
        };
        
        if (activeTimer === id) {
          setActiveTimer(null);
        }

        toast({
          title: updatedTask.completed ? "Task Completed!" : "Task Reopened",
          description: updatedTask.completed ? 
            `Great job completing "${task.title}"! 🎉` : 
            `"${task.title}" has been reopened.`,
        });

        return updatedTask;
      }
      return task;
    }));
  }, [activeTimer]);

  const startTimer = useCallback((id: string) => {
    // Stop any existing timer
    if (activeTimer) {
      setTasks(prev => prev.map(task => ({
        ...task,
        isActive: false,
        startTime: undefined,
      })));
    }

    setTasks(prev => prev.map(task => {
      if (task.id === id && !task.completed) {
        return {
          ...task,
          isActive: true,
          startTime: new Date(),
        };
      }
      return { ...task, isActive: false, startTime: undefined };
    }));

    setActiveTimer(id);
    const task = tasks.find(t => t.id === id);
    toast({
      title: "Timer Started",
      description: `Started tracking time for "${task?.title}"`,
    });
  }, [activeTimer, tasks]);

  const stopTimer = useCallback(() => {
    if (!activeTimer) return;

    let completedTask: Task | undefined;
    let sessionTime = 0;

    setTasks(prev => prev.map(task => {
      if (task.id === activeTimer && task.isActive && task.startTime) {
        const now = new Date();
        sessionTime = Math.floor((now.getTime() - task.startTime.getTime()) / 60000);
        completedTask = task;
        return {
          ...task,
          isActive: false,
          startTime: undefined,
          timeSpent: task.timeSpent + sessionTime,
        };
      }
      return task;
    }));

    setActiveTimer(null);
    
    if (completedTask && sessionTime > 0) {
      showTimerComplete(completedTask.title, sessionTime);
    }
    
    toast({
      title: "Timer Stopped",
      description: `Stopped tracking time for "${completedTask?.title}"`,
    });
  }, [activeTimer, tasks, showTimerComplete]);

  const deleteTask = useCallback((id: string) => {
    if (activeTimer === id) {
      setActiveTimer(null);
    }
    
    const task = tasks.find(t => t.id === id);
    setTasks(prev => prev.filter(task => task.id !== id));
    
    toast({
      title: "Task Deleted",
      description: `"${task?.title}" has been removed.`,
      variant: "destructive",
    });
  }, [activeTimer, tasks]);

  const getProductivityStats = useCallback((): ProductivityStats => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.completed).length;
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    const totalTimeSpent = tasks.reduce((sum, task) => sum + task.timeSpent, 0);
    const averageTimePerTask = completedTasks > 0 ? totalTimeSpent / completedTasks : 0;

    const categoryBreakdown: Record<TaskCategory, any> = {
      work: { total: 0, completed: 0, timeSpent: 0 },
      study: { total: 0, completed: 0, timeSpent: 0 },
      leisure: { total: 0, completed: 0, timeSpent: 0 },
    };

    tasks.forEach(task => {
      categoryBreakdown[task.category].total += 1;
      categoryBreakdown[task.category].timeSpent += task.timeSpent;
      if (task.completed) {
        categoryBreakdown[task.category].completed += 1;
      }
    });

    return {
      totalTasks,
      completedTasks,
      completionRate,
      totalTimeSpent,
      averageTimePerTask,
      categoryBreakdown,
    };
  }, [tasks]);

  const getProductivityTips = useCallback(() => {
    const stats = getProductivityStats();
    const tips: string[] = [];

    if (stats.completionRate < 50) {
      tips.push("Try breaking down large tasks into smaller, manageable chunks.");
    }

    if (stats.averageTimePerTask > 120) { // 2 hours
      tips.push("Consider setting shorter time blocks to maintain focus and prevent burnout.");
    }

    if (stats.categoryBreakdown.work.total > stats.categoryBreakdown.study.total + stats.categoryBreakdown.leisure.total) {
      tips.push("Remember to balance work with study and leisure activities for better well-being.");
    }

    const activeTasks = tasks.filter(t => !t.completed).length;
    if (activeTasks > 10) {
      tips.push("You have many open tasks. Try focusing on completing existing ones before adding new ones.");
    }

    if (tips.length === 0) {
      tips.push("Great job! Keep maintaining your productive habits. 🎉");
    }

    return tips;
  }, [tasks, getProductivityStats]);

  return {
    tasks,
    activeTimer,
    addTask,
    toggleTask,
    deleteTask,
    startTimer,
    stopTimer,
    updateTask,
    getProductivityStats,
    getProductivityTips,
  };
};