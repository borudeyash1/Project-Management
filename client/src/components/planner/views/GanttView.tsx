import React, { useState, useMemo } from 'react';
import { usePlanner } from '../../../context/PlannerContext';
import {
  GanttCreateMarkerTrigger,
  GanttFeatureItem,
  GanttFeatureList,
  GanttFeatureListGroup,
  GanttHeader,
  GanttMarker,
  GanttProvider,
  GanttSidebar,
  GanttSidebarGroup,
  GanttSidebarItem,
  GanttTimeline,
  GanttToday,
  GanttFeature,
  GanttStatus,
} from '../../ui/shadcn-io/gantt';
import groupBy from 'lodash.groupby';
import { EyeIcon, LinkIcon, TrashIcon } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../../ui/avatar';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '../../ui/context-menu';

interface GanttViewProps {
  searchQuery: string;
}

const GanttView: React.FC<GanttViewProps> = ({ searchQuery }) => {
  const { tasks, updateTask, deleteTask } = usePlanner();

  // Map task status to Gantt status with colors
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'pending': return '#8B5CF6'; // Purple
      case 'in-progress': return '#F59E0B'; // Orange
      case 'review': return '#3B82F6'; // Blue
      case 'completed': return '#9CA3AF'; // Gray
      default: return '#8B5CF6';
    }
  };

  // Convert tasks to Gantt features
  const features: GanttFeature[] = useMemo(() => {
    return tasks
      .filter(task => {
        const matchesSearch = !searchQuery || 
          task.title.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesSearch;
      })
      .map(task => {
        // Use startDate or dueDate, fallback to today
        const startAt = task.startDate 
          ? new Date(task.startDate) 
          : task.dueDate 
            ? new Date(task.dueDate)
            : new Date();
        
        const endAt = task.dueDate 
          ? new Date(task.dueDate)
          : task.startDate
            ? new Date(new Date(task.startDate).getTime() + 7 * 24 * 60 * 60 * 1000) // +7 days
            : new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000);

        const status: GanttStatus = {
          id: task.status,
          name: task.status,
          color: getStatusColor(task.status),
        };

        return {
          id: task._id,
          name: task.title,
          startAt,
          endAt,
          status,
          // Group by project or status
          group: task.project && typeof task.project === 'object' 
            ? task.project.name 
            : task.status,
          assignee: task.assignee,
          priority: task.priority,
        };
      });
  }, [tasks, searchQuery]);

  // Group features by project/status
  const groupedFeatures = useMemo(() => {
    const grouped = groupBy(features, (f: any) => f.group || 'Ungrouped');
    return Object.fromEntries(
      Object.entries(grouped).sort(([nameA], [nameB]) =>
        nameA.localeCompare(nameB)
      )
    );
  }, [features]);

  const handleViewFeature = (id: string) => {
    console.log(`Task selected: ${id}`);
    // You can open task detail modal here
  };

  const handleCopyLink = (id: string) => {
    console.log(`Copy link: ${id}`);
    // Copy task link to clipboard
  };

  const handleRemoveFeature = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      await deleteTask(id);
    }
  };

  const handleMoveFeature = async (id: string, startAt: Date, endAt: Date | null) => {
    if (!endAt) return;
    
    await updateTask(id, {
      startDate: startAt,
      dueDate: endAt,
    });
  };

  const handleAddFeature = (date: Date) => {
    console.log(`Add task at: ${date.toISOString()}`);
    // You can open create task modal with default date
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-300 dark:border-gray-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Gantt Chart</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {features.length} active tasks
          </p>
        </div>
      </div>

      {/* Gantt Chart */}
      <div className="flex-1 overflow-hidden">
        <GanttProvider
          className="border-0 h-full"
          onAddItem={handleAddFeature}
          range="monthly"
          zoom={100}
        >
          <GanttSidebar>
            {Object.entries(groupedFeatures).map(([group, groupFeatures]) => (
              <GanttSidebarGroup key={group} name={group}>
                {(groupFeatures as any[]).map((feature) => (
                  <GanttSidebarItem
                    feature={feature}
                    key={feature.id}
                    onSelectItem={handleViewFeature}
                  />
                ))}
              </GanttSidebarGroup>
            ))}
          </GanttSidebar>
          <GanttTimeline>
            <GanttHeader />
            <GanttFeatureList>
              {Object.entries(groupedFeatures).map(([group, groupFeatures]) => (
                <GanttFeatureListGroup key={group}>
                  {(groupFeatures as any[]).map((feature) => (
                    <div className="flex" key={feature.id}>
                      <ContextMenu>
                        <ContextMenuTrigger asChild>
                          <button
                            onClick={() => handleViewFeature(feature.id)}
                            type="button"
                          >
                            <GanttFeatureItem
                              onMove={handleMoveFeature}
                              {...feature}
                            >
                              <p className="flex-1 truncate text-xs">
                                {feature.name}
                              </p>
                              {feature.assignee && (
                                <Avatar className="h-4 w-4">
                                  <AvatarImage src={feature.assignee.avatarUrl} />
                                  <AvatarFallback>
                                    {feature.assignee.name?.slice(0, 2)}
                                  </AvatarFallback>
                                </Avatar>
                              )}
                            </GanttFeatureItem>
                          </button>
                        </ContextMenuTrigger>
                        <ContextMenuContent>
                          <ContextMenuItem
                            className="flex items-center gap-2"
                            onClick={() => handleViewFeature(feature.id)}
                          >
                            <EyeIcon className="text-muted-foreground" size={16} />
                            View task
                          </ContextMenuItem>
                          <ContextMenuItem
                            className="flex items-center gap-2"
                            onClick={() => handleCopyLink(feature.id)}
                          >
                            <LinkIcon className="text-muted-foreground" size={16} />
                            Copy link
                          </ContextMenuItem>
                          <ContextMenuItem
                            className="flex items-center gap-2 text-destructive"
                            onClick={() => handleRemoveFeature(feature.id)}
                          >
                            <TrashIcon size={16} />
                            Delete task
                          </ContextMenuItem>
                        </ContextMenuContent>
                      </ContextMenu>
                    </div>
                  ))}
                </GanttFeatureListGroup>
              ))}
            </GanttFeatureList>
            <GanttToday />
            <GanttCreateMarkerTrigger onCreateMarker={(date) => console.log('Create marker:', date)} />
          </GanttTimeline>
        </GanttProvider>
      </div>
    </div>
  );
};

export default GanttView;
