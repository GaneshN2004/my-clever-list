import { Task } from '@/types/task';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Play, 
  Pause, 
  Trash2, 
  Clock, 
  Briefcase, 
  GraduationCap, 
  Coffee,
  CheckCircle2,
  Calendar,
  Bell,
  BellOff
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TaskItemProps {
  task: Task;
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onStartTimer: (id: string) => void;
  onStopTimer: () => void;
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  isActiveTimer: boolean;
}

const categoryConfig = {
  work: { 
    icon: Briefcase, 
    label: 'Work', 
    bgClass: 'bg-gradient-work',
    badgeClass: 'bg-work text-work-foreground'
  },
  study: { 
    icon: GraduationCap, 
    label: 'Study', 
    bgClass: 'bg-gradient-study',
    badgeClass: 'bg-study text-study-foreground'
  },
  leisure: { 
    icon: Coffee, 
    label: 'Leisure', 
    bgClass: 'bg-gradient-leisure',
    badgeClass: 'bg-leisure text-leisure-foreground'
  },
};

const formatTime = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
};

const formatDueDate = (dueDate: Date): string => {
  const now = new Date();
  const diffMs = dueDate.getTime() - now.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffMs < 0) {
    return 'Overdue';
  } else if (diffHours < 1) {
    return 'Due soon';
  } else if (diffHours < 24) {
    return `Due in ${diffHours}h`;
  } else if (diffDays === 1) {
    return 'Due tomorrow';
  } else {
    return `Due in ${diffDays} days`;
  }
};

export const TaskItem = ({ 
  task, 
  onToggleComplete, 
  onDelete, 
  onStartTimer, 
  onStopTimer, 
  onUpdateTask,
  isActiveTimer 
}: TaskItemProps) => {
  const categoryInfo = categoryConfig[task.category];
  const Icon = categoryInfo.icon;

  return (
    <Card className={cn(
      "transition-spring hover:shadow-medium border-border/50 group",
      task.completed && "opacity-75 bg-muted/50",
      isActiveTimer && "ring-2 ring-primary shadow-glow"
    )}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="pt-1">
            <Checkbox
              checked={task.completed}
              onCheckedChange={() => onToggleComplete(task.id)}
              className="transition-smooth"
            />
          </div>
          
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <h3 className={cn(
                "font-semibold transition-smooth",
                task.completed && "line-through text-muted-foreground"
              )}>
                {task.title}
              </h3>
              {task.completed && (
                <CheckCircle2 className="w-4 h-4 text-success" />
              )}
            </div>
            
            {task.description && (
              <p className={cn(
                "text-sm text-muted-foreground",
                task.completed && "line-through"
              )}>
                {task.description}
              </p>
            )}
            
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className={categoryInfo.badgeClass}>
                <Icon className="w-3 h-3 mr-1" />
                {categoryInfo.label}
              </Badge>
              
              <div className="flex items-center text-xs text-muted-foreground">
                <Clock className="w-3 h-3 mr-1" />
                {formatTime(task.timeSpent)}
              </div>
              
              {task.dueDate && (
                <div className={cn(
                  "flex items-center text-xs",
                  task.dueDate.getTime() < new Date().getTime() 
                    ? "text-destructive" 
                    : task.dueDate.getTime() - new Date().getTime() < 2 * 60 * 60 * 1000 
                      ? "text-orange-500" 
                      : "text-muted-foreground"
                )}>
                  <Calendar className="w-3 h-3 mr-1" />
                  {formatDueDate(task.dueDate)}
                </div>
              )}
              
              {task.dueDate && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onUpdateTask(task.id, { 
                    notificationsEnabled: !task.notificationsEnabled,
                    reminderSent: false // Reset reminder when toggling
                  })}
                  className="h-6 w-6 p-0 text-xs"
                >
                  {task.notificationsEnabled ? (
                    <Bell className="w-3 h-3 text-primary" />
                  ) : (
                    <BellOff className="w-3 h-3 text-muted-foreground" />
                  )}
                </Button>
              )}
              
              {isActiveTimer && (
                <Badge className="bg-primary text-primary-foreground animate-pulse">
                  Tracking...
                </Badge>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-smooth">
            {!task.completed && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => isActiveTimer ? onStopTimer() : onStartTimer(task.id)}
                className={cn(
                  "h-8 w-8 p-0 transition-smooth",
                  isActiveTimer && "text-primary"
                )}
              >
                {isActiveTimer ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
              </Button>
            )}
            
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onDelete(task.id)}
              className="h-8 w-8 p-0 text-destructive hover:text-destructive transition-smooth"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};