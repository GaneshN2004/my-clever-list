export type TaskCategory = 'work' | 'study' | 'leisure';

export interface Task {
  id: string;
  title: string;
  description?: string;
  category: TaskCategory;
  completed: boolean;
  createdAt: Date;
  completedAt?: Date;
  timeSpent: number; // in minutes
  isActive: boolean; // currently being timed
  startTime?: Date;
}

export interface ProductivityStats {
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  totalTimeSpent: number;
  averageTimePerTask: number;
  categoryBreakdown: Record<TaskCategory, {
    total: number;
    completed: number;
    timeSpent: number;
  }>;
}

export interface DailyProductivity {
  date: string;
  tasksCompleted: number;
  timeSpent: number;
  completionRate: number;
}