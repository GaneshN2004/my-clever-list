import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { TaskCategory } from '@/types/task';
import { Plus, Briefcase, GraduationCap, Coffee, Bell, Calendar } from 'lucide-react';

interface TaskFormProps {
  onAddTask: (title: string, description: string, category: TaskCategory, dueDate?: Date, notificationsEnabled?: boolean) => void;
}

const categoryConfig = {
  work: { icon: Briefcase, label: 'Work', color: 'work' },
  study: { icon: GraduationCap, label: 'Study', color: 'study' },
  leisure: { icon: Coffee, label: 'Leisure', color: 'leisure' },
};

export const TaskForm = ({ onAddTask }: TaskFormProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TaskCategory>('work');
  const [dueDate, setDueDate] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    const taskDueDate = dueDate ? new Date(dueDate) : undefined;
    onAddTask(title.trim(), description.trim(), category, taskDueDate, notificationsEnabled);
    setTitle('');
    setDescription('');
    setCategory('work');
    setDueDate('');
    setNotificationsEnabled(true);
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <Button 
        onClick={() => setIsOpen(true)}
        className="w-full bg-gradient-primary hover:opacity-90 transition-smooth shadow-soft hover:shadow-medium"
        size="lg"
      >
        <Plus className="w-5 h-5 mr-2" />
        Add New Task
      </Button>
    );
  }

  return (
    <Card className="border-border/50 shadow-soft">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold">Create New Task</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Task Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What do you need to do?"
              className="transition-smooth focus:shadow-glow"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add more details about this task..."
              className="transition-smooth focus:shadow-glow min-h-[80px]"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={(value: TaskCategory) => setCategory(value)}>
              <SelectTrigger className="transition-smooth focus:shadow-glow">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(categoryConfig).map(([key, config]) => {
                  const Icon = config.icon;
                  return (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center">
                        <Icon className="w-4 h-4 mr-2" />
                        {config.label}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="dueDate">
              <Calendar className="w-4 h-4 inline mr-1" />
              Due Date (Optional)
            </Label>
            <Input
              id="dueDate"
              type="datetime-local"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="transition-smooth focus:shadow-glow"
              min={new Date().toISOString().slice(0, 16)}
            />
          </div>
          
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center space-x-2">
              <Bell className="w-4 h-4 text-primary" />
              <Label htmlFor="notifications" className="text-sm font-medium">
                Enable Reminders
              </Label>
            </div>
            <Switch
              id="notifications"
              checked={notificationsEnabled}
              onCheckedChange={setNotificationsEnabled}
            />
          </div>
          
          <div className="flex gap-2 pt-2">
            <Button 
              type="submit" 
              className="flex-1 bg-gradient-primary hover:opacity-90 transition-smooth"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Task
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsOpen(false)}
              className="transition-smooth"
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};