"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

type TaskSection = {
  id: string;
  title: string;
  description: string;
};

type TaskView = {
  id: string;
  sectionId: string;
  title: string;
  description: string;
  image: string;
};

const taskSections: TaskSection[] = [
  {
    id: "kanban",
    title: "Kanban Board View",
    description:
      "Visualize your workflow with drag-and-drop cards across customizable columns. Perfect for agile teams managing sprints and backlogs.",
  },
  {
    id: "list",
    title: "List & Table View",
    description:
      "Get a detailed overview of all tasks in a sortable, filterable table format. Ideal for tracking multiple task attributes at once.",
  },
  {
    id: "calendar",
    title: "Calendar & Timeline",
    description:
      "Plan ahead with calendar and timeline views. See task schedules, deadlines, and dependencies in a visual timeline format.",
  },
];

const taskViews: TaskView[] = [
  // Kanban section
  {
    id: "kanban-board",
    sectionId: "kanban",
    title: "Kanban Board",
    description: "Drag and drop tasks across columns",
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&h=400&fit=crop",
  },
  {
    id: "kanban-custom",
    sectionId: "kanban",
    title: "Custom Columns",
    description: "Create and customize your workflow stages",
    image: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=600&h=400&fit=crop",
  },
  {
    id: "kanban-wip",
    sectionId: "kanban",
    title: "WIP Limits",
    description: "Set work-in-progress limits per column",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop",
  },

  // List section
  {
    id: "list-view",
    sectionId: "list",
    title: "List View",
    description: "Comprehensive task list with all details",
    image: "https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d?w=600&h=400&fit=crop",
  },
  {
    id: "table-view",
    sectionId: "list",
    title: "Table View",
    description: "Sortable and filterable task table",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop",
  },
  {
    id: "grid-view",
    sectionId: "list",
    title: "Grid View",
    description: "Card-based grid layout for tasks",
    image: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=600&h=400&fit=crop",
  },

  // Calendar section
  {
    id: "calendar-month",
    sectionId: "calendar",
    title: "Calendar View",
    description: "Monthly calendar with task deadlines",
    image: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=600&h=400&fit=crop",
  },
  {
    id: "timeline-gantt",
    sectionId: "calendar",
    title: "Gantt Timeline",
    description: "Project timeline with dependencies",
    image: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600&h=400&fit=crop",
  },
  {
    id: "timeline-roadmap",
    sectionId: "calendar",
    title: "Roadmap View",
    description: "Long-term planning and milestones",
    image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&h=400&fit=crop",
  },
];

interface TabsSwitcherProps {
  className?: string;
  accentColor?: string;
}

export function TabsSwitcher({
  className,
  accentColor = "#44a0d1",
}: TabsSwitcherProps) {
  const [activeSection, setActiveSection] = useState<string>("kanban");

  const filteredViews = taskViews.filter(
    (view) => view.sectionId === activeSection
  );

  const MotionDiv = motion.div as any;

  return (
    <div
      className={cn(
        "w-full rounded-3xl overflow-hidden",
        "bg-white text-zinc-900 border border-zinc-200",
        className
      )}
    >
      <div className="p-8 pb-4">
        <h1 className="text-4xl font-bold mb-8">
          Manage tasks your way.
        </h1>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left side - Task sections */}
          <div className="w-full lg:w-1/3 space-y-12">
            {taskSections.map((section) => (
              <MotionDiv
                key={section.id}
                className="relative cursor-pointer hover:bg-gray-50 lg:py-2 lg:px-4 rounded-lg"
                onHoverStart={() => setActiveSection(section.id)}
                onClick={() => setActiveSection(section.id)}
                initial={false}
              >
                {activeSection === section.id && (
                  <MotionDiv
                    layoutId="active-indicator"
                    className="absolute -left-8 top-0 bottom-0 w-1.5 rounded-full"
                    style={{ backgroundColor: accentColor }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}

                <h2 className="text-2xl font-bold mb-3">{section.title}</h2>
                <p className="text-base text-zinc-600">
                  {section.description}
                </p>
              </MotionDiv>
            ))}
          </div>

          {/* Right side - View cards */}
          <div className="w-full lg:w-2/3">
            <MotionDiv
              className="grid grid-cols-1 md:grid-cols-3 gap-4"
              layout="position"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {filteredViews.map((view) => (
                <MotionDiv
                  key={view.id}
                  layoutId={`view-${view.id}`}
                  className={cn(
                    "rounded-lg overflow-hidden",
                    "bg-zinc-50 hover:bg-zinc-100",
                    "transition-colors cursor-pointer"
                  )}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={view.image}
                      alt={view.title}
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-lg mb-1">{view.title}</h3>
                    <p className="text-sm text-zinc-600">
                      {view.description}
                    </p>
                  </div>
                </MotionDiv>
              ))}
            </MotionDiv>
          </div>
        </div>
      </div>
    </div>
  );
}
