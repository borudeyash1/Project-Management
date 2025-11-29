import React from 'react';
import { cn } from "../../lib/utils";
import { Marquee } from "../magicui/Marquee";

const projects = [
  {
    name: "Grid View",
    description: "Visualize all projects in a clean grid layout",
    img: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=300&fit=crop",
  },
  {
    name: "List View",
    description: "Detailed list view with all project information",
    img: "https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d?w=400&h=300&fit=crop",
  },
  {
    name: "Kanban Board",
    description: "Drag and drop projects across stages",
    img: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=400&h=300&fit=crop",
  },
  {
    name: "Timeline",
    description: "Track project timelines and milestones",
    img: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400&h=300&fit=crop",
  },
  {
    name: "Team View",
    description: "See who's working on what",
    img: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=300&fit=crop",
  },
  {
    name: "Analytics",
    description: "Deep insights into project performance",
    img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop",
  },
];

const firstRow = projects.slice(0, projects.length / 2);
const secondRow = projects.slice(projects.length / 2);

const ProjectCard = ({
  img,
  name,
  description,
}: {
  img: string;
  name: string;
  description: string;
}) => {
  return (
    <figure
      className={cn(
        "relative h-full w-80 cursor-pointer overflow-hidden rounded-2xl border-2 p-0",
        // light styles
        "border-blue-500/20 bg-white hover:bg-gray-50",
        // dark styles
        "dark:border-gray-50/[.1] dark:bg-gray-50/[.10] dark:hover:bg-gray-50/[.15]",
        "transition-all duration-300 hover:scale-105 hover:shadow-2xl"
      )}
    >
      <img 
        className="w-full h-48 object-cover" 
        alt={name} 
        src={img}
        onError={(e) => {
          e.currentTarget.src = "https://via.placeholder.com/400x300?text=" + encodeURIComponent(name);
        }}
      />
      <div className="p-6">
        <figcaption className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          {name}
        </figcaption>
        <p className="text-sm text-gray-600 dark:text-gray-300">{description}</p>
      </div>
    </figure>
  );
};

export function ProjectsMarquee() {
  return (
    <div className="relative flex w-full flex-col items-center justify-center overflow-hidden bg-white py-20">
      <Marquee pauseOnHover className="[--duration:30s] mb-4">
        {firstRow.map((project) => (
          <ProjectCard key={project.name} {...project} />
        ))}
      </Marquee>
      <Marquee reverse pauseOnHover className="[--duration:30s]">
        {secondRow.map((project) => (
          <ProjectCard key={project.name} {...project} />
        ))}
      </Marquee>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-white"></div>
      <div className="pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-white"></div>
    </div>
  );
}
