
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { WatchedCourse, Section } from '@/types/course';
import { checkSectionsStatus } from '@/utils/api';
import { Trash } from 'lucide-react';

interface CourseCardProps {
  watchedCourse: WatchedCourse;
  onRemove: (id: string) => void;
  onUpdateSettings: (id: string, updates: Partial<WatchedCourse>) => void;
  refreshInterval: number;
}

const CourseCard = ({ 
  watchedCourse, 
  onRemove, 
  onUpdateSettings, 
  refreshInterval 
}: CourseCardProps) => {
  const [sectionsStatus, setSectionsStatus] = useState<Record<string, boolean>>({});
  const [lastChecked, setLastChecked] = useState<string>('Just now');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const checkStatus = async () => {
    setIsLoading(true);
    const indices = watchedCourse.sections.map(section => section.index);
    const status = await checkSectionsStatus(indices);
    setSectionsStatus(status);
    setLastChecked('Just now');
    setIsLoading(false);
    
    // Check if any sections are open and show notification if needed
    const openSections = Object.entries(status).filter(([_, isOpen]) => isOpen);
    
    if (openSections.length > 0 && watchedCourse.isNotificationEnabled) {
      toast({
        title: "Course sections available!",
        description: `${openSections.length} section(s) of ${watchedCourse.course.courseString} are now open!`,
        variant: "default",
      });
    }
  };

  useEffect(() => {
    // Check status immediately on mount
    checkStatus();
    
    // Set up interval for checking
    const interval = setInterval(() => {
      checkStatus();
    }, refreshInterval);
    
    // Update the "last checked" text
    const timeInterval = setInterval(() => {
      setLastChecked(getTimeAgo());
    }, 10000); // Update every 10 seconds
    
    return () => {
      clearInterval(interval);
      clearInterval(timeInterval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedCourse.sections, refreshInterval]);

  const getTimeAgo = () => {
    return 'Less than a minute ago';
  };

  const handleToggleNotification = () => {
    onUpdateSettings(watchedCourse.id, {
      isNotificationEnabled: !watchedCourse.isNotificationEnabled,
    });
  };

  const handleToggleAutoRegister = () => {
    onUpdateSettings(watchedCourse.id, {
      isAutomaticRegistration: !watchedCourse.isAutomaticRegistration,
    });
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">
            {watchedCourse.course.courseString}: {watchedCourse.course.title}
          </CardTitle>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => onRemove(watchedCourse.id)}
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          {isLoading ? 'Checking now...' : `Last checked: ${lastChecked}`}
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {watchedCourse.sections.map((section) => {
            const isOpen = sectionsStatus[section.index] || false;
            return (
              <div 
                key={section.index} 
                className="flex justify-between items-center py-1 border-b last:border-b-0"
              >
                <div className="text-sm">
                  <span className="font-medium">Section {section.number}</span>
                  <span className="text-gray-500 text-xs ml-1">(Index: {section.index})</span>
                </div>
                <div className={isOpen ? 'status-open' : 'status-closed'}>
                  {isOpen ? 'Open' : 'Closed'}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
      <CardFooter className="pt-2 flex flex-col items-start space-y-3">
        <div className="flex items-center space-x-2 w-full">
          <Switch 
            id={`notify-${watchedCourse.id}`} 
            checked={watchedCourse.isNotificationEnabled}
            onCheckedChange={handleToggleNotification}
          />
          <Label htmlFor={`notify-${watchedCourse.id}`} className="text-sm">
            Enable notifications
          </Label>
        </div>
        <div className="flex items-center space-x-2 w-full">
          <Switch 
            id={`auto-${watchedCourse.id}`} 
            checked={watchedCourse.isAutomaticRegistration}
            onCheckedChange={handleToggleAutoRegister}
          />
          <Label htmlFor={`auto-${watchedCourse.id}`} className="text-sm">
            Auto-register when open (Coming soon)
          </Label>
        </div>
      </CardFooter>
    </Card>
  );
};

export default CourseCard;
