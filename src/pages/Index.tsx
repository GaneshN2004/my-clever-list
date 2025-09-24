import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TaskForm } from '@/components/TaskForm';
import { TaskItem } from '@/components/TaskItem';
import { ProductivityStatsComponent } from '@/components/ProductivityStats';
import { useProductivity } from '@/hooks/useProductivity';
import { TaskCategory } from '@/types/task';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  Clock, 
  Target, 
  TrendingUp,
  Briefcase,
  GraduationCap,
  Coffee,
  BarChart3
} from 'lucide-react';

const Index = () => {
  const {
    tasks,
    activeTimer,
    addTask,
    toggleTask,
    deleteTask,
    startTimer,
    stopTimer,
    getProductivityStats,
    getProductivityTips,
  } = useProductivity();

  const [selectedCategory, setSelectedCategory] = useState<TaskCategory | 'all'>('all');
  
  const filteredTasks = selectedCategory === 'all' 
    ? tasks 
    : tasks.filter(task => task.category === selectedCategory);

  const stats = getProductivityStats();
  const tips = getProductivityTips();

  const categoryFilters = [
    { key: 'all', label: 'All Tasks', icon: Target, count: tasks.length },
    { key: 'work', label: 'Work', icon: Briefcase, count: tasks.filter(t => t.category === 'work').length },
    { key: 'study', label: 'Study', icon: GraduationCap, count: tasks.filter(t => t.category === 'study').length },
    { key: 'leisure', label: 'Leisure', icon: Coffee, count: tasks.filter(t => t.category === 'leisure').length },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4">
            Smart To-Do Tracker
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Manage your tasks intelligently with built-in productivity tracking and personalized insights
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="flex items-center gap-3 p-4 bg-card rounded-lg border border-border/50 shadow-soft">
            <Target className="w-8 h-8 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Total Tasks</p>
              <p className="text-xl font-bold">{stats.totalTasks}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-4 bg-card rounded-lg border border-border/50 shadow-soft">
            <CheckCircle className="w-8 h-8 text-success" />
            <div>
              <p className="text-sm text-muted-foreground">Completed</p>
              <p className="text-xl font-bold text-success">{stats.completedTasks}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-4 bg-card rounded-lg border border-border/50 shadow-soft">
            <TrendingUp className="w-8 h-8 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Completion Rate</p>
              <p className="text-xl font-bold">{stats.completionRate.toFixed(0)}%</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-4 bg-card rounded-lg border border-border/50 shadow-soft">
            <Clock className="w-8 h-8 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Time Tracked</p>
              <p className="text-xl font-bold">
                {stats.totalTimeSpent < 60 
                  ? `${stats.totalTimeSpent}m` 
                  : `${Math.floor(stats.totalTimeSpent / 60)}h`}
              </p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="tasks" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:w-[400px] mx-auto">
            <TabsTrigger value="tasks" className="transition-smooth">
              <Target className="w-4 h-4 mr-2" />
              Tasks
            </TabsTrigger>
            <TabsTrigger value="analytics" className="transition-smooth">
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tasks" className="space-y-6">
            {/* Add Task Form */}
            <div className="max-w-2xl mx-auto">
              <TaskForm onAddTask={addTask} />
            </div>

            {/* Category Filters */}
            {tasks.length > 0 && (
              <div className="flex flex-wrap gap-2 justify-center">
                {categoryFilters.map(filter => {
                  const Icon = filter.icon;
                  return (
                    <Badge
                      key={filter.key}
                      variant={selectedCategory === filter.key ? "default" : "outline"}
                      className="cursor-pointer transition-smooth hover:scale-105"
                      onClick={() => setSelectedCategory(filter.key as TaskCategory | 'all')}
                    >
                      <Icon className="w-3 h-3 mr-1" />
                      {filter.label} ({filter.count})
                    </Badge>
                  );
                })}
              </div>
            )}

            {/* Tasks List */}
            <div className="max-w-4xl mx-auto space-y-4">
              {filteredTasks.length === 0 ? (
                <div className="text-center py-12">
                  <Target className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                    {selectedCategory === 'all' ? 'No tasks yet' : `No ${selectedCategory} tasks`}
                  </h3>
                  <p className="text-muted-foreground">
                    {selectedCategory === 'all' 
                      ? 'Add your first task to get started with productivity tracking!' 
                      : `Add some ${selectedCategory} tasks to see them here.`}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredTasks.map(task => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      onToggleComplete={toggleTask}
                      onDelete={deleteTask}
                      onStartTimer={startTimer}
                      onStopTimer={stopTimer}
                      isActiveTimer={activeTimer === task.id}
                    />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="max-w-6xl mx-auto">
              {tasks.length === 0 ? (
                <div className="text-center py-12">
                  <BarChart3 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                    No data available yet
                  </h3>
                  <p className="text-muted-foreground">
                    Complete some tasks to see your productivity analytics and get personalized tips!
                  </p>
                </div>
              ) : (
                <ProductivityStatsComponent stats={stats} tips={tips} />
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
