"use client";

import React from 'react';
import { ExpandingCards } from "../ui/expanding-cards";

export function ExpandingCardsDemo() {
  const trackerCards = [
    {
      title: "Team Dashboard",
      description: "Real-time team performance metrics",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop",
    },
    {
      title: "Recent Activity",
      description: "Track all team activities in real-time",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop",
    },
    {
      title: "Time Entries",
      description: "Log and manage time entries",
      image: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800&h=600&fit=crop",
    },
    {
      title: "Running Timer",
      description: "Active timers and current tasks",
      image: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=800&h=600&fit=crop",
    },
    {
      title: "Task Reports",
      description: "Comprehensive task analytics",
      image: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&h=600&fit=crop",
    },
    {
      title: "SLA Monitor",
      description: "Track service level agreements",
      image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=600&fit=crop",
    },
    {
      title: "Team Performance",
      description: "Analyze team productivity trends",
      image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=600&fit=crop",
    },
  ];

  return (
    <div className="w-full">
      <ExpandingCards
        cards={trackerCards}
        gap="gap-3 md:gap-4"
        height="h-[400px] md:h-[500px] lg:h-[550px]"
        classNames={{
          container: "rounded-xl",
          card: "rounded-xl",
          title: "font-extrabold tracking-wide truncate",
          description: "font-medium text-gray-200",
          button: "bg-black/40 hover:bg-black/60",
          buttonIcon: "text-white",
        }}
        breakpoints={[
          {
            maxWidth: 640,
            activeWidth: 280,
            inactiveWidth: 60,
            titleActive: "20px",
            titleInactive: "0px",
          },
          {
            maxWidth: 768,
            activeWidth: 350,
            inactiveWidth: 80,
            titleActive: "24px",
            titleInactive: "0px",
          },
          {
            maxWidth: 1024,
            activeWidth: 450,
            inactiveWidth: 100,
            titleActive: "28px",
            titleInactive: "16px",
          },
          {
            maxWidth: 1920,
            activeWidth: 550,
            inactiveWidth: 120,
            titleActive: "32px",
            titleInactive: "18px",
          },
        ]}
        transitionDuration={0.5}
      />
    </div>
  );
}
