import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import {
  BookOpen,
  ChevronRight,
  ChevronDown,
  Search,
  Menu,
  X,
  Home,
  PlayCircle
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import SharedNavbar from './SharedNavbar';
import SharedFooter from './SharedFooter';
import SEO from './SEO';
import * as documentationService from '../services/documentationService';
import InteractiveMockup from './docs/InteractiveMockup';

interface DocArticle {
  _id: string;
  title: string;
  slug: string;
  content: string;
  category: string;
  subcategory?: string;
  videoUrl?: string;
  order: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  // New fields for enhanced documentation
  featuredImage?: string;
  shortDescription?: string;
  overviewPoints?: string[];
  additionalDetails?: string;
  relatedItems?: Array<{
    id: string;
    title: string;
    badge?: string;
    description: string;
  }>;
  mockups?: Array<{
    title: string;
    description: string;
    imageUrl?: string;
    interactive?: boolean;
    interactiveType?: 'dashboard' | 'create-project' | 'kanban' | 'task-form' | 'calendar' | 'team-invite' | 'file-upload' | 'analytics';
  }>;
}

interface DocCategory {
  name: string;
  slug: string;
  icon: string;
  articles: DocArticle[];
  expanded: boolean;
}

const Docs: React.FC = () => {
  const { slug } = useParams<{ slug?: string }>();
  const navigate = useNavigate();
  useTheme();
  const { t } = useTranslation();
  const [categories, setCategories] = useState<DocCategory[]>([]);
  const [currentArticle, setCurrentArticle] = useState<DocArticle | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Filter states
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [tagDropdownOpen, setTagDropdownOpen] = useState(false);
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);

  // Category metadata
  const categoryMetadata: Record<string, { name: string; icon: string }> = {
    'getting-started': { name: 'Getting Started', icon: '🚀' },
    'user-guide': { name: 'User Guide', icon: '📖' },
    'api-reference': { name: 'API Reference', icon: '⚙️' },
    'tutorials': { name: 'Tutorials', icon: '🎓' },
    'faq': { name: 'FAQ', icon: '❓' }
  };

  // Load articles from API
  const loadDocs = async () => {
    try {
      setLoading(true);
      let articles = await documentationService.getAllDocs();
      
      // If no articles from API, use mock data
      if (!articles || articles.length === 0) {
        articles = getMockDocumentation();
      }
      
      // Group articles by category
      const grouped: Record<string, DocArticle[]> = {};
      articles.forEach(article => {
        if (!grouped[article.category]) {
          grouped[article.category] = [];
        }
        grouped[article.category].push(article);
      });

      // Convert to category array
      const categoriesArray: DocCategory[] = Object.keys(grouped).map(categorySlug => {
        const meta = categoryMetadata[categorySlug] || { name: categorySlug, icon: '📄' };
        return {
          name: meta.name,
          slug: categorySlug,
          icon: meta.icon,
          articles: grouped[categorySlug].sort((a, b) => a.order - b.order),
          expanded: true
        };
      });

      setCategories(categoriesArray);
    } catch (error) {
      console.error('Failed to load documentation:', error);
      // Use mock data on error
      const mockArticles = getMockDocumentation();
      const grouped: Record<string, DocArticle[]> = {};
      mockArticles.forEach(article => {
        if (!grouped[article.category]) {
          grouped[article.category] = [];
        }
        grouped[article.category].push(article);
      });

      const categoriesArray: DocCategory[] = Object.keys(grouped).map(categorySlug => {
        const meta = categoryMetadata[categorySlug] || { name: categorySlug, icon: '📄' };
        return {
          name: meta.name,
          slug: categorySlug,
          icon: meta.icon,
          articles: grouped[categorySlug].sort((a, b) => a.order - b.order),
          expanded: true
        };
      });

      setCategories(categoriesArray);
    } finally {
      setLoading(false);
    }
  };

  // Mock documentation data
  const getMockDocumentation = (): DocArticle[] => {
    return [
      {
        _id: '1',
        title: 'Getting Started with SARTTHI',
        slug: 'getting-started',
        featuredImage: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=1200&h=400&fit=crop',
        shortDescription: 'A comprehensive guide to help you get started with SARTTHI. Learn the basics and start managing your projects effectively.',
        overviewPoints: [
          'Customizable workspace for teams and individuals',
          'Works for projects, tasks, events, and more',
          'Supports real-time collaboration and file sharing',
          'Displays team activity and project progress',
          'Can include AI-powered insights and automation'
        ],
        additionalDetails: 'Use this guide to understand the core features of SARTTHI and how to set up your workspace. It is designed to give you a complete overview of the platform and help you get started quickly with your first project.',
        relatedItems: [
          {
            id: '2',
            title: 'Creating Your First Project',
            badge: 'Popular',
            description: 'Learn how to set up and manage your first project in SARTTHI.'
          },
          {
            id: '3',
            title: 'Managing Tasks and Workflows',
            badge: 'New',
            description: 'Master task management with SARTTHI\'s powerful features.'
          },
          {
            id: '10',
            title: 'Workspace Management Guide',
            badge: 'Verified',
            description: 'Complete guide to creating and managing workspaces.'
          }
        ],
        mockups: [
          {
            title: 'Step 1: Explore the Dashboard',
            description: 'After logging in, you\'ll see your workspace dashboard with project cards, statistics, and activity feed. Click around to explore!',
            interactive: true,
            interactiveType: 'dashboard'
          },
          {
            title: 'Step 2: Create Your First Project',
            description: 'Click the "+ New Project" button to open the project creation modal. Fill in the details and invite team members.',
            interactive: true,
            interactiveType: 'create-project'
          },
          {
            title: 'Step 3: Organize with Kanban Board',
            description: 'Use the Kanban board to organize tasks visually. Drag and drop tasks between columns to update their status.',
            interactive: true,
            interactiveType: 'kanban'
          },
          {
            title: 'Step 4: Invite Team Members',
            description: 'Add your team members by entering their email addresses. Assign roles and permissions to each member.',
            imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=500&fit=crop'
          }
        ],
        content: `# Getting Started with SARTTHI

Welcome to SARTTHI - your comprehensive project management and collaboration platform!

## What is SARTTHI?

SARTTHI is an all-in-one project management suite designed to help teams collaborate effectively, manage projects efficiently, and boost productivity.

## Key Features

- **Project Management**: Create and manage multiple projects with ease
- **Team Collaboration**: Work together with real-time updates
- **Task Management**: Organize tasks with boards, kanban, and timeline views
- **AI Assistant**: Get intelligent suggestions and automation
- **Meetings**: Conduct meetings with live transcripts and AI summaries
- **Calendar Integration**: Keep track of all your events
- **Vault**: Secure document storage
- **Mail**: Integrated email communication

## Quick Start Guide

1. **Create an Account**: Sign up for free or choose a plan that fits your needs
2. **Create a Workspace**: Set up your first workspace
3. **Invite Team Members**: Add your team to collaborate
4. **Create Projects**: Start organizing your work
5. **Add Tasks**: Break down projects into manageable tasks

## Next Steps

- Explore the User Guide for detailed instructions
- Watch our tutorial videos
- Check out the FAQ for common questions`,
        category: 'getting-started',
        order: 1,
        isPublished: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        _id: '2',
        title: 'Creating Your First Project',
        slug: 'first-project',
        featuredImage: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&h=400&fit=crop',
        shortDescription: 'Learn how to set up and manage your first project in SARTTHI. This guide covers project creation, team assignment, and task organization.',
        overviewPoints: [
          'Step-by-step project creation process',
          'Team member assignment and role management',
          'Multiple project views (Board, Timeline, Calendar)',
          'Task organization with priorities and deadlines',
          'Best practices for project success'
        ],
        additionalDetails: 'This comprehensive guide walks you through creating your first project in SARTTHI. You\'ll learn how to structure your project, add team members, create tasks, and use different views to manage your work effectively. Follow these steps to get your project up and running quickly.',
        relatedItems: [
          {
            id: '1',
            title: 'Getting Started with SARTTHI',
            badge: 'New',
            description: 'Complete introduction to SARTTHI platform and features.'
          },
          {
            id: '3',
            title: 'Managing Tasks and Workflows',
            badge: 'Popular',
            description: 'Master task management with powerful workflow features.'
          },
          {
            id: '10',
            title: 'Workspace Management Guide',
            badge: 'Verified',
            description: 'Learn to organize and manage your workspaces.'
          }
        ],
        mockups: [
          {
            title: 'Navigate to Projects Tab',
            description: 'Click on the "Projects" tab in your workspace dashboard to access the projects section.',
            interactive: true,
            interactiveType: 'dashboard'
          },
          {
            title: 'Create New Project',
            description: 'Click "+ New Project" button and fill in project details including name, description, deadline, and visibility settings.',
            interactive: true,
            interactiveType: 'create-project'
          },
          {
            title: 'Organize Tasks with Kanban',
            description: 'Add tasks to your project, set priorities, assign team members, and organize using Board, Timeline, or Calendar views.',
            interactive: true,
            interactiveType: 'kanban'
          },
          {
            title: 'Add Team Members',
            description: 'Select team members from your workspace and assign appropriate roles (Admin, Member, or Viewer).',
            imageUrl: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&h=500&fit=crop'
          }
        ],
        content: `# Creating Your First Project

Learn how to create and set up your first project in SARTTHI.

## Overview

Projects are the core organizational unit in SARTTHI. They help you group related tasks, assign team members, track progress, and meet deadlines. This guide will walk you through creating your first project from start to finish.

## Prerequisites

Before creating a project, ensure you have:
- A SARTTHI account (free or paid)
- A workspace set up
- Team members invited (optional but recommended)

## Step 1: Navigate to Projects

1. Log in to your SARTTHI account
2. Select your workspace from the dropdown
3. Click on the **"Projects"** tab in the main navigation
4. You'll see your projects dashboard

## Step 2: Create New Project

### Click the Create Button
1. Click the **"+ New Project"** button in the top-right corner
2. A project creation modal will appear

### Enter Project Details

**Project Name** (Required)
- Choose a clear, descriptive name
- Example: "Website Redesign Q1 2024"
- Keep it concise but informative

**Project Description** (Optional but Recommended)
- Add a detailed description of project goals
- Include key objectives and deliverables
- Mention any important context

**Project Deadline** (Optional)
- Set a target completion date
- Helps with timeline planning
- Can be adjusted later if needed

**Project Visibility**
- **Private**: Only you can see it
- **Team**: All workspace members can view
- **Public**: Visible to everyone (Enterprise only)

### Choose Project Template (Optional)
- Select from pre-built templates
- Options: Software Development, Marketing Campaign, Event Planning
- Or start from scratch

## Step 3: Add Team Members

### Invite Team Members
1. Click the **"Add Members"** button
2. Select members from your workspace
3. Or invite new members via email

### Assign Roles

**Project Admin**
- Full control over the project
- Can delete project and manage all settings
- Assign to project leads

**Project Member**
- Can create and edit tasks
- View all project data
- Standard role for team members

**Viewer**
- Read-only access
- Can view tasks and progress
- Good for stakeholders

## Step 4: Create Tasks

### Add Your First Task
1. Click **"+ Add Task"** in your project
2. Enter task title
3. Add description and details
4. Set due date

### Organize with Sections
- Create sections like "To Do", "In Progress", "Done"
- Or use custom sections for your workflow
- Drag and drop tasks between sections

### Set Task Properties

**Priority Levels**
- 🔴 High: Urgent and important
- 🟡 Medium: Important but not urgent  
- 🟢 Low: Nice to have

**Assign Tasks**
- Assign to specific team members
- Set multiple assignees if needed
- Unassigned tasks go to backlog

**Add Labels/Tags**
- Categorize tasks (bug, feature, urgent)
- Filter and search by labels
- Create custom labels

## Project Views

SARTTHI offers multiple ways to visualize your project:

### Board View (Kanban)
- Visual task organization
- Drag and drop between columns
- Perfect for agile workflows
- See task status at a glance

### Timeline View (Gantt Chart)
- Visualize project schedule
- See task dependencies
- Identify bottlenecks
- Plan resources effectively

### Calendar View
- See tasks by due date
- Monthly/weekly views
- Integrate with your calendar
- Never miss a deadline

### List View
- Traditional task list
- Sort and filter easily
- Bulk edit tasks
- Export to CSV

## Best Practices

### 1. Break Down Large Projects
- Divide into smaller milestones
- Create sub-tasks for complex items
- Makes progress tracking easier
- Reduces overwhelm

### 2. Clear Ownership
- Assign every task to someone
- Avoid "everyone's responsibility"
- Accountability drives completion
- Regular check-ins with assignees

### 3. Use Labels Effectively
- Create consistent labeling system
- Use for priorities, categories, teams
- Makes filtering powerful
- Helps with reporting

### 4. Regular Updates
- Daily standups or weekly reviews
- Update task status promptly
- Comment on progress
- Keep team aligned

### 5. Set Realistic Deadlines
- Buffer time for unexpected issues
- Consult with team on estimates
- Review and adjust as needed
- Track actual vs estimated time

## Next Steps

Now that you've created your first project:
1. Explore different project views
2. Set up project automation
3. Integrate with other tools
4. Generate your first project report

## Tips for Success

- **Start Small**: Don't overcomplicate your first project
- **Iterate**: Refine your process as you learn
- **Communicate**: Keep your team informed
- **Review**: Regular retrospectives improve future projects

## Need Help?

- Check our video tutorials
- Join the community forum
- Contact support for personalized assistance
- Book a demo with our team`,
        category: 'getting-started',
        order: 2,
        isPublished: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        _id: '3',
        title: 'Managing Tasks and Workflows',
        slug: 'task-management',
        featuredImage: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=1200&h=400&fit=crop',
        shortDescription: 'Master task management with SARTTHI\'s powerful features. Learn to create, organize, and automate tasks for maximum productivity.',
        overviewPoints: [
          'Quick and detailed task creation methods',
          'Status management and priority levels',
          'Workflow automation and templates',
          'Real-time collaboration features',
          'Keyboard shortcuts and efficiency tips'
        ],
        additionalDetails: 'This guide provides comprehensive instructions on managing tasks and workflows in SARTTHI. Learn how to leverage automation, templates, and collaboration features to streamline your team\'s work and boost productivity.',
        relatedItems: [
          {
            id: '2',
            title: 'Creating Your First Project',
            badge: 'Verified',
            description: 'Learn the basics of project setup and management.'
          },
          {
            id: '4',
            title: 'Team Collaboration Tools',
            badge: 'Recommended',
            description: 'Enhance teamwork with collaboration features.'
          },
          {
            id: '5',
            title: 'AI Assistant Features',
            badge: 'Featured',
            description: 'Leverage AI to automate and optimize tasks.'
          }
        ],
        mockups: [
          {
            title: 'Quick Task Creation',
            description: 'Use the quick add (+) button to create tasks instantly. Fill in title, assignee, and due date for rapid task entry.',
            interactive: true,
            interactiveType: 'kanban'
          },
          {
            title: 'Task Status Board',
            description: 'Organize tasks using the Kanban board with columns for To Do, In Progress, Review, and Done statuses. Drag and drop to update status.',
            interactive: true,
            interactiveType: 'kanban'
          },
          {
            title: 'Set Task Priorities',
            description: 'Assign priority levels (High, Medium, Low) to tasks and use color coding for quick visual identification.',
            imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=500&fit=crop'
          },
          {
            title: 'Workflow Automation',
            description: 'Create automated workflows with task templates, recurring tasks, and automatic assignments.',
            imageUrl: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=500&fit=crop'
          }
        ],
        content: `# Managing Tasks and Workflows

Master task management with SARTTHI's powerful features and boost your team's productivity.

## Overview

Effective task management is the cornerstone of successful project execution. SARTTHI provides a comprehensive suite of tools to help you create, organize, track, and complete tasks efficiently. Whether you're managing a small team or coordinating complex projects, our task management system adapts to your workflow.

## Prerequisites

Before diving into task management:
- Have a project created in your workspace
- Understand basic project navigation
- Know your team members and their roles
- Familiarize yourself with the project dashboard

## Task Creation

### Quick Add Method

The fastest way to create tasks when you're in the flow:

1. **Locate the Quick Add Button**
   - Look for the **"+"** button in your project view
   - Available in all views (Board, Timeline, Calendar)
   - Keyboard shortcut: Ctrl/Cmd + N

2. **Fill Essential Details**
   - **Task Title**: Clear, action-oriented name
   - **Assignee**: Who will complete this task
   - **Due Date**: When it needs to be done
   - Click "Create" or press Enter

**Example**: "Design homepage mockup" assigned to John, due Friday

### Detailed Task Form

For complex tasks requiring more information:

1. **Access Detailed Form**
   - Click "+ Add Task" button
   - Select "Detailed Task" option
   - Or click existing task to edit

2. **Complete All Fields**

**Task Title** (Required)
- Use action verbs (Create, Design, Implement, Review)
- Be specific and measurable
- Example: "Implement user authentication with OAuth"

**Description** (Recommended)
- Explain the task's purpose and context
- Include acceptance criteria
- Add relevant links or references
- Use markdown for formatting

**Assignee** (Required)
- Select from team members
- Can assign multiple people
- Unassigned tasks go to backlog

**Due Date** (Optional but Recommended)
- Set realistic deadlines
- Consider dependencies
- Add buffer time for reviews

**Priority Level** (Required)
- 🔴 **High**: Urgent and important (do first)
- 🟡 **Medium**: Important but not urgent (schedule)
- 🟢 **Low**: Nice to have (do when time permits)

**Labels/Tags** (Optional)
- Categorize by type (bug, feature, enhancement)
- Add department tags (design, dev, marketing)
- Use for filtering and reporting

**Attachments** (Optional)
- Upload relevant files
- Link to external documents
- Add screenshots or mockups

**Dependencies** (Optional)
- Link tasks that must be completed first
- System prevents completion until dependencies are done
- Visualize on Timeline view

## Task Organization

### Status Management

SARTTHI uses a flexible status system:

**To Do** (Backlog)
- Tasks not yet started
- Awaiting resources or information
- Planned for future sprints

**In Progress** (Active Work)
- Currently being worked on
- Limit work-in-progress for focus
- Update regularly with progress

**Review** (Quality Check)
- Awaiting peer review
- Testing or QA phase
- Client approval needed

**Done** (Completed)
- Task fully completed
- Meets acceptance criteria
- Archived after project completion

### Custom Statuses

Create custom statuses for your workflow:
1. Go to Project Settings > Statuses
2. Click "+ Add Status"
3. Name it and choose a color
4. Define when tasks move to this status

**Examples**: "Blocked", "On Hold", "Deployed", "Approved"

### Priority Levels Explained

**🔴 High Priority**
- Urgent deadlines (within 24-48 hours)
- Blocking other team members
- Critical bugs or issues
- Client-facing problems

**🟡 Medium Priority**
- Important but not urgent
- Scheduled work
- Standard features
- Planned improvements

**🟢 Low Priority**
- Nice-to-have features
- Future enhancements
- Documentation updates
- Minor improvements

### Task Filtering and Sorting

**Filter Options:**
- By assignee (My tasks, Unassigned, Specific person)
- By priority (High, Medium, Low)
- By status (To Do, In Progress, etc.)
- By due date (Overdue, This week, This month)
- By labels/tags

**Sort Options:**
- Due date (ascending/descending)
- Priority (high to low)
- Created date
- Alphabetically
- Custom order (drag and drop)

## Workflow Automation

### Automatic Task Assignments

Set up rules to auto-assign tasks:

1. **Go to Project Settings > Automation**
2. **Create New Rule**
   - When: Task is created with label "bug"
   - Then: Assign to QA team lead
   - And: Set priority to High

3. **Common Automation Rules**
   - New design tasks → Assign to design team
   - High priority tasks → Notify project manager
   - Tasks moved to Review → Notify reviewer
   - Overdue tasks → Send reminder

### Recurring Tasks

For tasks that repeat regularly:

1. **Create Task as Normal**
2. **Click "Make Recurring"**
3. **Set Recurrence Pattern**
   - Daily (every weekday, every N days)
   - Weekly (specific days of week)
   - Monthly (specific date or day)
   - Custom pattern

4. **Set End Condition**
   - Never (continues indefinitely)
   - After N occurrences
   - On specific date

**Examples:**
- Daily standup notes (every weekday)
- Weekly status report (every Friday)
- Monthly review meeting (first Monday)

### Task Templates

Save time with reusable templates:

1. **Create Template**
   - Complete a task with all details
   - Click "Save as Template"
   - Name it descriptively

2. **Use Template**
   - Click "+ Add Task"
   - Select "From Template"
   - Choose your template
   - Customize as needed

**Common Templates:**
- Bug report template
- Feature request template
- Code review checklist
- Design review template

## Collaboration Features

### Task Comments

Communicate within tasks:

**Add Comments**
- Click on task to open details
- Type in comment box
- Use markdown for formatting
- Attach files if needed

**@Mentions**
- Type @ followed by name
- Person gets notified
- Brings attention to specific people
- Example: "@John can you review this?"

**Comment Features**
- Edit your comments
- Delete if needed
- React with emojis
- Mark as resolved

### File Attachments

Share files directly in tasks:

- Drag and drop files
- Click attach button
- Link from Vault
- Maximum 10MB per file
- Supports: PDF, DOC, XLS, PNG, JPG, ZIP

### Time Tracking

Track time spent on tasks:

1. **Start Timer**
   - Click timer icon on task
   - Timer runs in background
   - Can pause/resume

2. **Manual Entry**
   - Click "Log Time"
   - Enter hours and minutes
   - Add description of work

3. **View Time Reports**
   - See time per task
   - Time per person
   - Project time totals
   - Export timesheets

### Activity History

Every task maintains a complete history:
- Who created it and when
- All status changes
- Assignment changes
- Comments added
- Files attached
- Time logged

## Best Practices

### 1. Write Clear Task Titles

**Good Examples:**
- ✅ "Design login page mockup"
- ✅ "Implement password reset API"
- ✅ "Review Q1 marketing report"

**Bad Examples:**
- ❌ "Login stuff"
- ❌ "Fix bug"
- ❌ "Meeting"

### 2. Break Down Large Tasks

**Instead of:**
- "Build entire website"

**Do This:**
- "Design homepage layout"
- "Develop homepage HTML/CSS"
- "Implement homepage interactivity"
- "Test homepage on all browsers"

### 3. Set Realistic Deadlines

- Add buffer time (20-30%)
- Consider team capacity
- Account for dependencies
- Review and adjust as needed

### 4. Use Labels Consistently

Create a labeling system:
- **Type**: bug, feature, enhancement, docs
- **Priority**: critical, high, medium, low
- **Status**: blocked, waiting, ready
- **Team**: frontend, backend, design, qa

### 5. Keep Tasks Updated

- Update status regularly
- Add progress comments
- Log time spent
- Attach relevant files
- Close completed tasks promptly

### 6. Limit Work in Progress

- Don't start too many tasks
- Finish before starting new ones
- Typical limit: 2-3 tasks per person
- Reduces context switching

## Common Use Cases

### Agile/Scrum Workflow

1. Create sprint backlog
2. Move tasks to "In Progress" during sprint
3. Daily standup updates in comments
4. Move to "Review" when code complete
5. Move to "Done" after review

### Bug Tracking

1. Create task with "bug" label
2. Set priority based on severity
3. Assign to developer
4. Link to related feature
5. Track fix in comments
6. Verify and close

### Feature Development

1. Create feature task
2. Break into sub-tasks
3. Assign to team members
4. Track progress on Timeline
5. Review when complete
6. Deploy and mark done

## Keyboard Shortcuts

Speed up your workflow:

- Ctrl/Cmd + N - New task
- Ctrl/Cmd + Enter - Save task
- Esc - Close task detail
- Ctrl/Cmd + F - Search tasks
- Ctrl/Cmd + K - Quick command
- Space - Mark task complete
- E - Edit task
- C - Add comment

## Troubleshooting

### Can't Find a Task

**Solutions:**
- Check all status columns
- Clear filters
- Use search function
- Check if archived
- Verify project selection

### Task Won't Save

**Solutions:**
- Check required fields filled
- Verify internet connection
- Try refreshing page
- Check browser console for errors
- Contact support if persists

### Notifications Not Working

**Solutions:**
- Check notification settings
- Enable browser notifications
- Check email spam folder
- Verify you're @mentioned correctly
- Update notification preferences

## Next Steps

Now that you understand task management:

1. **Create Your First Tasks**
   - Start with 3-5 tasks
   - Practice different methods
   - Experiment with features

2. **Set Up Automation**
   - Create one automation rule
   - Set up a recurring task
   - Build a task template

3. **Explore Views**
   - Try Board view for visual management
   - Use Timeline for scheduling
   - Check Calendar for deadlines

4. **Integrate with Team**
   - Share best practices
   - Establish team conventions
   - Regular review and improvement

## Tips for Success

- **Start Simple**: Don't overcomplicate initially
- **Be Consistent**: Use same naming conventions
- **Communicate**: Use comments liberally
- **Review Regularly**: Weekly task cleanup
- **Measure Progress**: Track completion rates
- **Iterate**: Improve your process continuously

## Need Help?

- Check video tutorials
- Join community forum
- Contact support team
- Book a training session
- Read advanced guides`,
        category: 'user-guide',
        order: 1,
        isPublished: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        _id: '4',
        title: 'Team Collaboration Tools',
        slug: 'team-collaboration',
        featuredImage: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&h=400&fit=crop',
        shortDescription: 'Enhance team productivity with SARTTHI\'s collaboration features. Real-time updates, communication channels, and meeting management.',
        overviewPoints: [
          'Real-time collaboration and live updates',
          'Project chat and direct messaging',
          'Secure file sharing with Vault integration',
          'Meeting management with AI transcription',
          'Team insights and performance analytics'
        ],
        additionalDetails: 'Discover how SARTTHI\'s collaboration tools can transform your team\'s productivity. From real-time updates to AI-powered meeting summaries, learn to leverage every feature for seamless teamwork.',
        relatedItems: [
          { id: '3', title: 'Managing Tasks and Workflows', badge: 'Popular', description: 'Master task management and automation.' },
          { id: '12', title: 'Vault & File Storage', badge: 'Verified', description: 'Secure document management and sharing.' },
          { id: '11', title: 'Calendar & Scheduling', badge: 'New', description: 'Manage meetings and events efficiently.' }
        ],
        mockups: [
          { title: 'Real-Time Collaboration', description: 'See team members working in real-time with live cursor tracking and instant notifications.', imageUrl: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&h=500&fit=crop' },
          { title: 'Project Chat', description: 'Dedicated chat channels for each project with file sharing and threaded discussions.', imageUrl: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&h=500&fit=crop' },
          { title: 'Meeting Management', description: 'Schedule meetings with calendar integration, live transcription, and AI-generated summaries.', imageUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&h=500&fit=crop' }
        ],
        content: `# Team Collaboration Tools

Enhance team productivity with SARTTHI's powerful collaboration features designed for modern distributed teams.

## Overview

Effective collaboration is the foundation of successful teamwork. SARTTHI provides a comprehensive suite of collaboration tools that enable seamless communication, real-time updates, secure file sharing, and productive meetings. Whether your team is in the same office or distributed across the globe, SARTTHI keeps everyone connected and aligned.

## Prerequisites

Before using collaboration features:
- Have a workspace with team members
- Understand basic project navigation
- Set up your notification preferences
- Configure your profile and availability status

## Real-Time Collaboration

### Live Presence Indicators

**See Who's Online**
- Green dot indicates active users
- Yellow for away status
- Gray for offline
- Last seen timestamps

**Activity Tracking**
- See who's viewing which projects
- Real-time cursor tracking in documents
- Live editing indicators
- Current task assignments

### Instant Notifications

**Notification Types:**
- @mentions in comments
- Task assignments
- Project updates
- File uploads
- Meeting invitations
- Deadline reminders

**Notification Settings:**
- Desktop notifications
- Email digests (daily/weekly)
- Mobile push notifications
- In-app notification center
- Custom notification rules

### Live Updates

**Real-Time Sync:**
- Changes appear instantly
- No need to refresh
- Conflict resolution
- Offline mode with sync

**What Updates in Real-Time:**
- Task status changes
- New comments
- File uploads
- Project modifications
- Team member actions

## Communication Channels

### Project Chat

**Dedicated Chat Rooms**
- One chat per project
- Organized by topics
- Searchable history
- File attachments

**Chat Features:**
- @mention team members
- Reply to specific messages
- React with emojis
- Pin important messages
- Search conversation history

**Best Practices:**
- Use threads for discussions
- Pin important announcements
- Set chat guidelines
- Archive old conversations

### Direct Messages

**One-on-One Communication**
- Private conversations
- Instant messaging
- File sharing
- Video call integration

**Group Chats**
- Create custom groups
- Add/remove members
- Group naming
- Shared files

**Message Features:**
- Edit sent messages
- Delete messages
- Mark as unread
- Mute conversations
- Set status messages

### Video Calls

**Start Video Meetings:**
- One-click video calls
- Screen sharing
- Virtual backgrounds
- Recording capability

**Meeting Controls:**
- Mute/unmute
- Camera on/off
- Raise hand
- Chat sidebar
- Participant list

## File Sharing & Vault Integration

### Secure File Storage

**Upload Files:**
- Drag and drop interface
- Multiple file upload
- Folder organization
- File preview

**Supported File Types:**
- Documents: PDF, DOC, XLS, PPT
- Images: PNG, JPG, GIF, SVG
- Videos: MP4, MOV, AVI
- Archives: ZIP, RAR
- Code: All text formats

**Storage Limits:**
- Free: 5GB per workspace
- Pro: 100GB per workspace
- Enterprise: Unlimited

### Version Control

**Automatic Versioning:**
- Every save creates version
- View version history
- Compare versions
- Restore previous versions

**Version Management:**
- Version numbering (v1, v2, etc.)
- Version comments
- Who made changes
- When changes occurred

### Access Permissions

**Permission Levels:**
- **Owner**: Full control
- **Editor**: Can edit and share
- **Commenter**: Can comment only
- **Viewer**: Read-only access

**Sharing Options:**
- Share with workspace members
- Share with specific people
- Generate public links
- Set expiration dates
- Require password
- Track who accessed

### File Organization

**Folder Structure:**
- Create nested folders
- Move files between folders
- Bulk operations
- Favorites/starred files

**Search & Filter:**
- Search by filename
- Filter by type
- Filter by date
- Filter by owner
- Advanced search

## Meeting Management

### Schedule Meetings

**Create Meetings:**
1. Click "New Meeting" button
2. Set title and description
3. Choose date and time
4. Add participants
5. Set meeting link
6. Send invitations

**Meeting Types:**
- One-time meetings
- Recurring meetings (daily, weekly, monthly)
- All-hands meetings
- Team standups
- Client meetings

**Calendar Integration:**
- Sync with Google Calendar
- Sync with Outlook
- iCal export
- Timezone support

### During Meetings

**Live Features:**
- **Transcription**: Real-time speech-to-text
- **Recording**: Auto-save to Vault
- **Screen Share**: Present your screen
- **Whiteboard**: Collaborative drawing
- **Polls**: Quick team votes

**Meeting Roles:**
- **Host**: Full control
- **Co-host**: Can manage participants
- **Presenter**: Can share screen
- **Participant**: Standard access

### After Meetings

**AI-Generated Summaries:**
- Key discussion points
- Decisions made
- Action items assigned
- Next steps
- Meeting transcript

**Action Item Tracking:**
- Automatically create tasks
- Assign to team members
- Set due dates
- Track completion

**Meeting Archive:**
- Recordings stored in Vault
- Transcripts searchable
- Summary accessible
- Share with non-attendees

## Team Insights & Analytics

### Activity Dashboard

**Team Activity View:**
- Who's working on what
- Recent updates
- Upcoming deadlines
- Blocked tasks

**Activity Timeline:**
- Chronological feed
- Filter by person
- Filter by project
- Filter by date range

### Contribution Metrics

**Individual Metrics:**
- Tasks completed
- Comments posted
- Files uploaded
- Time logged
- Meetings attended

**Team Metrics:**
- Total tasks completed
- Average completion time
- Collaboration score
- Response time

### Workload Distribution

**Workload View:**
- Tasks per person
- Hours allocated
- Capacity planning
- Overload alerts

**Balance Team:**
- Identify overloaded members
- Redistribute tasks
- Adjust deadlines
- Add resources

### Performance Analytics

**Project Performance:**
- Completion rate
- On-time delivery
- Quality metrics
- Team velocity

**Trend Analysis:**
- Week-over-week progress
- Month-over-month growth
- Seasonal patterns
- Productivity trends

## Best Practices

### 1. Establish Communication Norms

**Guidelines:**
- Response time expectations
- When to use chat vs. email
- Meeting etiquette
- Notification preferences

### 2. Organize Files Systematically

**Structure:**
- Consistent naming conventions
- Logical folder hierarchy
- Regular cleanup
- Archive old files

### 3. Use @Mentions Wisely

**When to @Mention:**
- Need immediate attention
- Assign responsibility
- Request feedback
- Share important updates

**Avoid:**
- Overusing @mentions
- @mentioning entire team unnecessarily
- Using for non-urgent matters

### 4. Keep Meetings Productive

**Before Meeting:**
- Set clear agenda
- Share materials in advance
- Define objectives
- Invite only necessary people

**During Meeting:**
- Start on time
- Stick to agenda
- Take notes
- Assign action items

**After Meeting:**
- Share summary
- Follow up on action items
- Archive recording
- Gather feedback

### 5. Leverage AI Features

**Use AI For:**
- Meeting summaries
- Action item extraction
- Smart task suggestions
- Workload recommendations

## Common Use Cases

### Remote Team Collaboration

**Setup:**
- Daily standup meetings
- Async updates in chat
- Shared project boards
- Regular video check-ins

**Tools:**
- Video calls for face-to-face
- Chat for quick questions
- Vault for file sharing
- Calendar for scheduling

### Client Collaboration

**External Sharing:**
- Guest access for clients
- Public file links
- Client-specific projects
- Meeting recordings

**Communication:**
- Dedicated client chat
- Regular status meetings
- Progress reports
- Feedback collection

### Cross-Functional Projects

**Coordination:**
- Multi-team chat channels
- Shared calendars
- Unified task boards
- Cross-project insights

## Troubleshooting

### Can't See Team Members Online

**Solutions:**
- Check internet connection
- Refresh the page
- Verify workspace membership
- Check privacy settings

### Notifications Not Working

**Solutions:**
- Enable browser notifications
- Check notification settings
- Verify email settings
- Update notification preferences

### File Upload Failing

**Solutions:**
- Check file size (max 10MB)
- Verify file type supported
- Check storage quota
- Try smaller batch

### Video Call Issues

**Solutions:**
- Check camera/mic permissions
- Test internet speed
- Close other applications
- Update browser
- Try different browser

## Tips for Success

- **Communicate Asynchronously**: Respect time zones
- **Document Everything**: Keep searchable records
- **Use Video Wisely**: Not every meeting needs video
- **Set Boundaries**: Define work hours
- **Regular Check-ins**: Stay connected with team
- **Celebrate Wins**: Recognize team achievements

## Next Steps

1. **Set Up Your Profile**: Add photo and status
2. **Join Project Chats**: Introduce yourself
3. **Schedule First Meeting**: Test video features
4. **Upload Files**: Organize in Vault
5. **Explore Analytics**: Review team insights

## Need Help?

- Watch collaboration tutorials
- Join community discussions
- Contact support team
- Request team training
- Read advanced guides`,
        category: 'user-guide',
        order: 2,
        isPublished: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        _id: '5',
        title: 'AI Assistant Features',
        slug: 'ai-assistant',
        featuredImage: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&h=400&fit=crop',
        shortDescription: 'Leverage AI to automate tasks, generate insights, and boost productivity. Smart suggestions, automated workflows, and intelligent analysis.',
        overviewPoints: [
          'AI-powered task suggestions and automation',
          'Smart scheduling and workload optimization',
          'Automated meeting summaries and transcripts',
          'Intelligent data analysis and insights',
          'Natural language processing for commands'
        ],
        additionalDetails: 'SARTTHI\'s AI Assistant uses advanced machine learning to help you work smarter. From automating repetitive tasks to providing intelligent insights, discover how AI can transform your workflow.',
        relatedItems: [
          { id: '3', title: 'Managing Tasks and Workflows', badge: 'Featured', description: 'Combine AI with task management for maximum efficiency.' },
          { id: '13', title: 'Reports & Analytics', badge: 'Recommended', description: 'AI-powered insights and predictive analytics.' },
          { id: '4', title: 'Team Collaboration Tools', badge: 'Popular', description: 'AI-enhanced collaboration features.' }
        ],
        mockups: [
          { title: 'AI Task Suggestions', description: 'Get intelligent task recommendations based on project context and team workload.', imageUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=500&fit=crop' },
          { title: 'Smart Scheduling', description: 'AI automatically finds optimal meeting times based on team availability and preferences.', imageUrl: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=800&h=500&fit=crop' },
          { title: 'Automated Summaries', description: 'AI generates meeting summaries, action items, and key insights automatically.', imageUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&h=500&fit=crop' }
        ],
        content: `# AI Assistant Features

Leverage AI to boost your productivity and make smarter decisions.

## Smart Suggestions

### Task Recommendations
- AI suggests task priorities
- Optimal task assignments
- Deadline predictions
- Resource allocation

### Content Generation
- Meeting summaries
- Email drafts
- Report generation
- Documentation assistance

## Automation

### Workflow Automation
- Auto-assign tasks based on skills
- Smart scheduling
- Dependency management
- Status updates

### Intelligent Reminders
- Context-aware notifications
- Priority-based alerts
- Deadline warnings
- Follow-up suggestions

## Analytics & Insights

### Project Insights
- Progress predictions
- Risk identification
- Bottleneck detection
- Resource optimization

### Team Analytics
- Productivity trends
- Workload balance
- Skill gap analysis
- Performance metrics

## Natural Language Processing

- Ask questions in plain English
- Get instant answers
- Search across all content
- Smart filters and queries

## AI-Powered Features

1. **Smart Search**: Find anything instantly
2. **Auto-categorization**: Organize automatically
3. **Sentiment Analysis**: Understand team morale
4. **Predictive Analytics**: Forecast outcomes`,
        category: 'user-guide',
        order: 3,
        isPublished: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        _id: '6',
        title: 'API Authentication',
        slug: 'api-auth',
        featuredImage: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&h=400&fit=crop',
        shortDescription: 'Learn how to authenticate with the SARTTHI API. Secure your integrations with API keys, OAuth 2.0, and best security practices.',
        overviewPoints: [
          'Multiple authentication methods (API Keys, OAuth 2.0)',
          'Secure token generation and management',
          'Rate limiting and usage quotas',
          'Best practices for API security',
          'Code examples in multiple languages'
        ],
        additionalDetails: 'This guide covers all authentication methods for the SARTTHI API. Learn how to generate API keys, implement OAuth 2.0, handle tokens securely, and follow best practices for API integration.',
        relatedItems: [
          { id: '7', title: 'Projects API', badge: 'Popular', description: 'Complete reference for managing projects via API.' },
          { id: '8', title: 'Building a Custom Integration', badge: 'Recommended', description: 'Step-by-step guide to building integrations.' },
          { id: '1', title: 'Getting Started with SARTTHI', badge: 'New', description: 'Introduction to SARTTHI platform.' }
        ],
        mockups: [
          { title: 'Generate API Key', description: 'Navigate to Settings > API Keys and click "Generate New Key". Copy and store your key securely.', imageUrl: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=800&h=500&fit=crop' },
          { title: 'API Request Example', description: 'Use your API key in the Authorization header for all API requests. Include proper error handling.', imageUrl: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=500&fit=crop' },
          { title: 'OAuth 2.0 Flow', description: 'Implement OAuth 2.0 for user authentication with authorization code flow and token refresh.', imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=500&fit=crop' }
        ],
        content: `# API Authentication

Learn how to authenticate with the SARTTHI API.

## Authentication Methods

### API Keys
\`\`\`javascript
const headers = {
  'Authorization': 'Bearer YOUR_API_KEY',
  'Content-Type': 'application/json'
};
\`\`\`

### OAuth 2.0
- More secure for third-party integrations
- User consent required
- Token refresh mechanism

## Getting Your API Key

1. Go to Settings > API Keys
2. Click "Generate New Key"
3. Copy and store securely
4. Never commit to version control

## Rate Limiting

- Free: 100 requests/hour
- Pro: 1000 requests/hour
- Premium: 10000 requests/hour
- Enterprise: Unlimited

## Best Practices

- Use environment variables
- Rotate keys regularly
- Implement retry logic
- Handle errors gracefully`,
        category: 'api-reference',
        order: 1,
        isPublished: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        _id: '7',
        title: 'Projects API',
        slug: 'api-projects',
        featuredImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&h=400&fit=crop',
        shortDescription: 'Complete reference for managing projects via API. Create, read, update, and delete projects programmatically with REST endpoints.',
        overviewPoints: [
          'RESTful API endpoints for project management',
          'CRUD operations (Create, Read, Update, Delete)',
          'JSON request and response formats',
          'Error handling and status codes',
          'Code examples and best practices'
        ],
        additionalDetails: 'The Projects API provides programmatic access to all project management features. Use these endpoints to integrate SARTTHI with your existing tools and workflows.',
        relatedItems: [
          { id: '6', title: 'API Authentication', badge: 'Verified', description: 'Learn how to authenticate API requests.' },
          { id: '8', title: 'Building a Custom Integration', badge: 'Popular', description: 'Build custom integrations with SARTTHI.' },
          { id: '2', title: 'Creating Your First Project', badge: 'New', description: 'UI guide for creating projects.' }
        ],
        mockups: [
          { title: 'API Endpoint Structure', description: 'All project endpoints follow REST conventions: GET /api/projects, POST /api/projects, PUT /api/projects/:id', imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=500&fit=crop' },
          { title: 'Request/Response Format', description: 'Send JSON payloads and receive structured responses with success status and data objects.', imageUrl: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=800&h=500&fit=crop' },
          { title: 'Error Handling', description: 'Handle HTTP status codes: 400 (Bad Request), 401 (Unauthorized), 404 (Not Found), 500 (Server Error).', imageUrl: 'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=800&h=500&fit=crop' }
        ],
        content: `# Projects API

Complete reference for managing projects via API.

## Endpoints

### List Projects
\`\`\`http
GET /api/projects
\`\`\`

### Create Project
\`\`\`http
POST /api/projects
Content-Type: application/json

{
  "name": "New Project",
  "description": "Project description",
  "deadline": "2024-12-31"
}
\`\`\`

### Get Project
\`\`\`http
GET /api/projects/:id
\`\`\`

### Update Project
\`\`\`http
PUT /api/projects/:id
\`\`\`

### Delete Project
\`\`\`http
DELETE /api/projects/:id
\`\`\`

## Response Format

\`\`\`json
{
  "success": true,
  "data": {
    "_id": "123",
    "name": "Project Name",
    "status": "active"
  }
}
\`\`\`

## Error Handling

- 400: Bad Request
- 401: Unauthorized
- 404: Not Found
- 500: Server Error`,
        category: 'api-reference',
        order: 2,
        isPublished: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        _id: '8',
        title: 'Building a Custom Integration',
        slug: 'custom-integration',
        featuredImage: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&h=400&fit=crop',
        shortDescription: 'Step-by-step guide to integrate SARTTHI with your tools. Learn to build custom integrations using our API and webhooks.',
        overviewPoints: [
          'Complete integration setup guide',
          'API authentication and configuration',
          'Webhook implementation for real-time updates',
          'Common use cases and examples',
          'Testing and deployment best practices'
        ],
        additionalDetails: 'This tutorial walks you through building a complete integration with SARTTHI. From initial setup to production deployment, learn how to connect your tools and automate workflows.',
        relatedItems: [
          { id: '6', title: 'API Authentication', badge: 'Recommended', description: 'Secure your integration with proper authentication.' },
          { id: '7', title: 'Projects API', badge: 'Popular', description: 'API reference for project management.' },
          { id: '5', title: 'AI Assistant Features', badge: 'Featured', description: 'Leverage AI in your integrations.' }
        ],
        mockups: [
          { title: 'Setup Environment', description: 'Install dependencies, configure API keys, and set up your development environment.', imageUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=500&fit=crop' },
          { title: 'Make API Requests', description: 'Use fetch or axios to make authenticated requests to SARTTHI API endpoints.', imageUrl: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&h=500&fit=crop' },
          { title: 'Handle Webhooks', description: 'Set up webhook endpoints to receive real-time updates from SARTTHI.', imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=500&fit=crop' }
        ],
        content: `# Building a Custom Integration

Step-by-step guide to integrate SARTTHI with your tools.

## Prerequisites

- API key from SARTTHI
- Basic programming knowledge
- Development environment

## Step 1: Setup

\`\`\`javascript
const SARTTHI_API = 'https://api.sartthi.com/v1';
const API_KEY = process.env.SARTTHI_API_KEY;
\`\`\`

## Step 2: Make Your First Request

\`\`\`javascript
async function getProjects() {
  const response = await fetch(\`\${SARTTHI_API}/projects\`, {
    headers: {
      'Authorization': \`Bearer \${API_KEY}\`
    }
  });
  return response.json();
}
\`\`\`

## Step 3: Handle Webhooks

\`\`\`javascript
app.post('/webhook', (req, res) => {
  const event = req.body;
  // Process webhook event
  res.status(200).send('OK');
});
\`\`\`

## Common Use Cases

1. Sync with external tools
2. Automate workflows
3. Custom reporting
4. Data migration

## Testing

- Use sandbox environment
- Test error scenarios
- Validate data formats
- Monitor rate limits`,
        category: 'tutorials',
        order: 1,
        isPublished: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        _id: '9',
        title: 'Frequently Asked Questions',
        slug: 'faq',
        featuredImage: 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=1200&h=400&fit=crop',
        shortDescription: 'Find answers to common questions about SARTTHI. Get help with account management, billing, features, and technical issues.',
        overviewPoints: [
          'General platform questions and answers',
          'Account and billing information',
          'Feature availability by plan',
          'Technical support and troubleshooting',
          'Security and compliance details'
        ],
        additionalDetails: 'Browse our comprehensive FAQ to find quick answers to common questions. If you can\'t find what you\'re looking for, contact our support team for personalized assistance.',
        relatedItems: [
          { id: '1', title: 'Getting Started with SARTTHI', badge: 'New', description: 'Complete introduction to the platform.' },
          { id: '10', title: 'Workspace Management Guide', badge: 'Popular', description: 'Learn to manage workspaces effectively.' },
          { id: '15', title: 'Role-Based Access Control', badge: 'Verified', description: 'Understand permissions and roles.' }
        ],
        mockups: [
          { title: 'Account Setup', description: 'Create your account, verify email, and choose the right plan for your needs.', imageUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&h=500&fit=crop' },
          { title: 'Billing Dashboard', description: 'Manage subscriptions, view invoices, and update payment methods in the billing section.', imageUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&h=500&fit=crop' },
          { title: 'Support Center', description: 'Access help documentation, submit tickets, and chat with support team.', imageUrl: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&h=500&fit=crop' }
        ],
        content: `# Frequently Asked Questions

Find answers to common questions about SARTTHI.

## General Questions

### What is SARTTHI?
SARTTHI is a comprehensive project management and collaboration platform designed for modern teams.

### Is there a free plan?
Yes! We offer a free plan with essential features. Upgrade anytime for advanced capabilities.

### Can I cancel anytime?
Absolutely. No long-term contracts. Cancel your subscription anytime.

## Account & Billing

### How do I upgrade my plan?
Go to Settings > Billing > Upgrade Plan

### What payment methods do you accept?
We accept all major credit cards, debit cards, and UPI payments.

### Do you offer refunds?
Yes, we have a 30-day money-back guarantee.

## Technical Questions

### Is my data secure?
Yes, we use bank-level encryption and follow industry best practices.

### Can I export my data?
Yes, you can export all your data anytime in multiple formats.

### Do you have a mobile app?
Yes, available on iOS and Android.

## Support

### How can I get help?
- Email: support@sartthi.com
- Live chat (Pro and above)
- Help center
- Community forum`,
        category: 'faq',
        order: 1,
        isPublished: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        _id: '10',
        title: 'Workspace Management Guide',
        slug: 'workspace-management',
        featuredImage: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&h=400&fit=crop',
        shortDescription: 'Master workspace creation and management in SARTTHI. Organize teams, projects, and resources in isolated environments.',
        overviewPoints: [
          'Create and configure workspaces',
          'Manage members and permissions',
          'Workspace settings and customization',
          'Billing and subscription management',
          'Integration and API access'
        ],
        additionalDetails: 'Workspaces are the foundation of your SARTTHI experience. Learn how to create, configure, and manage workspaces effectively for maximum team productivity.',
        relatedItems: [
          { id: '1', title: 'Getting Started with SARTTHI', badge: 'New', description: 'Platform introduction and basics.' },
          { id: '15', title: 'Role-Based Access Control', badge: 'Verified', description: 'Manage permissions and roles.' },
          { id: '4', title: 'Team Collaboration Tools', badge: 'Popular', description: 'Enhance team productivity.' }
        ],
        mockups: [
          { title: 'Create Workspace', description: 'Click profile icon > Workspaces > Create Workspace. Enter name, description, and select workspace type.', imageUrl: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800&h=500&fit=crop' },
          { title: 'Invite Members', description: 'Navigate to Settings > Members > Invite. Enter emails and assign roles (Owner, Admin, Member, Guest).', imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=500&fit=crop' },
          { title: 'Workspace Settings', description: 'Configure general settings, billing, integrations, and API access from the workspace settings panel.', imageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=500&fit=crop' }
        ],
        content: `# Workspace Management Guide

Master workspace creation and management in SARTTHI.

## Overview

Workspaces are the foundation of your SARTTHI experience. They allow you to organize teams, projects, and resources in isolated environments. Each workspace can have its own members, projects, and settings.

## Creating a Workspace

### Step 1: Access Workspace Menu
1. Click on your profile icon in the top-right corner
2. Select "Workspaces" from the dropdown menu
3. Click the "+ Create Workspace" button

### Step 2: Configure Workspace Details
1. **Workspace Name**: Enter a descriptive name (e.g., "Marketing Team", "Product Development")
2. **Description**: Add a brief description of the workspace purpose
3. **Workspace Type**: Choose between:
   - **Personal**: For individual use
   - **Team**: For collaborative work
   - **Enterprise**: For large organizations

### Step 3: Set Workspace Icon
1. Click on the default icon
2. Choose from preset icons or upload a custom image
3. Recommended size: 256x256 pixels

### Step 4: Configure Privacy Settings
- **Private**: Only invited members can see and join
- **Internal**: Anyone in your organization can discover
- **Public**: Visible to everyone (Enterprise only)

## Managing Workspace Members

### Adding Members
1. Navigate to Workspace Settings > Members
2. Click "Invite Members"
3. Enter email addresses (comma-separated for multiple)
4. Select member role:
   - **Owner**: Full control over workspace
   - **Admin**: Can manage members and settings
   - **Member**: Can create and manage projects
   - **Guest**: Limited access to specific projects

### Setting Member Permissions
- **Project Creation**: Allow/restrict project creation
- **Member Invitation**: Control who can invite new members
- **Settings Access**: Define who can modify workspace settings

## Workspace Settings

### General Settings
- Workspace name and description
- Default language and timezone
- Working hours configuration

### Billing & Subscription
- View current plan
- Upgrade/downgrade subscription
- Payment method management
- Invoice history

### Integrations
- Connect third-party tools
- Configure API access
- Manage webhooks

## Best Practices

1. **Clear Naming**: Use descriptive workspace names
2. **Regular Audits**: Review member access quarterly
3. **Organized Structure**: Create separate workspaces for different teams
4. **Documentation**: Maintain workspace guidelines
5. **Security**: Enable two-factor authentication

## Related Items
- Creating Your First Project
- Team Collaboration Tools
- Role-Based Access Control`,
        category: 'user-guide',
        order: 4,
        isPublished: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        _id: '11',
        title: 'Calendar & Scheduling',
        slug: 'calendar-scheduling',
        featuredImage: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=1200&h=400&fit=crop',
        shortDescription: 'Complete guide to managing your schedule and events in SARTTHI. Sync calendars, schedule meetings, and get AI-powered suggestions.',
        overviewPoints: ['Multiple calendar views (Day, Week, Month, Agenda)', 'Event creation and recurring events', 'External calendar sync (Google, Outlook, Apple)', 'AI scheduling assistant', 'Meeting integration with transcription'],
        additionalDetails: 'SARTTHI\'s calendar helps you manage meetings, deadlines, and events efficiently. Learn to leverage AI scheduling, sync external calendars, and optimize your time.',
        relatedItems: [{ id: '4', title: 'Team Collaboration Tools', badge: 'Popular', description: 'Meeting management features.' }, { id: '5', title: 'AI Assistant Features', badge: 'Featured', description: 'AI-powered scheduling.' }, { id: '10', title: 'Workspace Management Guide', badge: 'Verified', description: 'Workspace calendar settings.' }],
        mockups: [{ title: 'Calendar Views', description: 'Switch between Day, Week, Month, and Agenda views. Click any time slot to create events quickly.', imageUrl: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800&h=500&fit=crop' }, { title: 'Create Event', description: 'Click + New Event, fill details, add attendees, set reminders, and choose recurrence pattern.', imageUrl: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800&h=500&fit=crop' }, { title: 'Sync External Calendars', description: 'Go to Settings > Integrations > Calendar. Connect Google, Outlook, or Apple Calendar with two-way sync.', imageUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&h=500&fit=crop' }],
        content: `# Calendar & Scheduling

Complete guide to managing your schedule and events in SARTTHI.

## Overview

SARTTHI's integrated calendar helps you manage meetings, deadlines, and events. Sync with external calendars and get AI-powered scheduling suggestions.

## Accessing the Calendar

### Navigation
1. Click "Calendar" in the main navigation menu
2. Or use keyboard shortcut: \`Ctrl + K\` → Type "Calendar"

### Calendar Views
- **Day View**: Hourly breakdown of your day
- **Week View**: 7-day overview
- **Month View**: Full month at a glance
- **Agenda View**: List of upcoming events

## Creating Events

### Quick Event Creation
1. Click on any time slot in the calendar
2. Enter event title
3. Press Enter to create

### Detailed Event Creation
1. Click "+ New Event" button
2. Fill in event details:
   - **Title**: Event name
   - **Date & Time**: Start and end times
   - **Location**: Physical or virtual location
   - **Description**: Event details and agenda
   - **Attendees**: Add team members
   - **Reminders**: Set notification preferences

### Recurring Events
1. Enable "Repeat" option
2. Choose frequency:
   - Daily
   - Weekly (select days)
   - Monthly (by date or day)
   - Custom pattern
3. Set end date or occurrence count

## Meeting Integration

### Video Conference Links
- Automatically generate Google Meet links
- Integrate with Zoom (Pro plan)
- Microsoft Teams integration (Premium plan)

### Meeting Preparation
1. Add agenda items
2. Attach relevant documents
3. Set pre-meeting reminders
4. Share meeting notes template

## Calendar Sync

### External Calendar Integration
1. Go to Settings > Integrations > Calendar
2. Choose calendar service:
   - Google Calendar
   - Outlook Calendar
   - Apple Calendar
3. Authorize access
4. Select sync direction:
   - One-way (SARTTHI → External)
   - Two-way (Bidirectional sync)

### Sync Settings
- Sync frequency: Real-time, Hourly, Daily
- Event visibility: All events or work events only
- Conflict resolution: Manual or automatic

## Smart Scheduling

### AI Scheduling Assistant
1. Click "Smart Schedule" button
2. Enter meeting requirements:
   - Duration
   - Attendees
   - Preferred time range
3. AI suggests optimal time slots based on:
   - Attendee availability
   - Working hours
   - Meeting patterns
   - Focus time preferences

### Focus Time Blocks
1. Enable "Focus Time" in settings
2. AI automatically blocks time for deep work
3. Customize focus time preferences
4. Notifications are muted during focus blocks

## Event Reminders

### Notification Types
- **Email**: Sent to registered email
- **In-App**: Browser/desktop notifications
- **Mobile Push**: Mobile app notifications
- **SMS**: For critical events (Enterprise)

### Reminder Timing
- 1 week before
- 1 day before
- 1 hour before
- 15 minutes before
- Custom timing

## Calendar Sharing

### Share Your Calendar
1. Click "Share Calendar" button
2. Choose sharing level:
   - **View Only**: See event titles and times
   - **View Details**: See full event information
   - **Edit**: Modify events
3. Generate shareable link or invite specific users

## Best Practices

1. **Color Coding**: Use different colors for event types
2. **Buffer Time**: Add 5-10 minutes between meetings
3. **Regular Reviews**: Weekly calendar review sessions
4. **Time Blocking**: Schedule focused work time
5. **Sync Regularly**: Keep external calendars updated

## Related Items
- Meeting Management
- Team Collaboration Tools
- AI Assistant Features`,
        category: 'user-guide',
        order: 5,
        isPublished: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        _id: '12',
        title: 'Vault & File Storage',
        slug: 'vault-file-storage',
        featuredImage: 'https://images.unsplash.com/photo-1544396821-4dd40b938ad3?w=1200&h=400&fit=crop',
        shortDescription: 'Secure document management and file storage in SARTTHI. Upload, organize, share files with version control and advanced security.',
        overviewPoints: ['Secure file storage with encryption', 'Version control and history', 'File sharing with permissions', 'Preview support for multiple formats', 'Storage analytics and management'],
        additionalDetails: 'The Vault provides enterprise-grade file storage with version control, sharing, and security features. Learn to manage documents efficiently and securely.',
        relatedItems: [{ id: '4', title: 'Team Collaboration Tools', badge: 'Recommended', description: 'File sharing in collaboration.' }, { id: '15', title: 'Role-Based Access Control', badge: 'Verified', description: 'File permissions and access.' }, { id: '10', title: 'Workspace Management Guide', badge: 'Popular', description: 'Workspace file management.' }],
        mockups: [{ title: 'Upload Files', description: 'Click + Upload button or drag & drop files. Choose destination folder and add tags for organization.', imageUrl: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&h=500&fit=crop' }, { title: 'Share Files', description: 'Right-click file > Share. Set permissions (View, Download, Edit), add password, and set expiration.', imageUrl: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&h=500&fit=crop' }, { title: 'Version History', description: 'Right-click file > Version History. View all versions, compare changes, and restore previous versions.', imageUrl: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=500&fit=crop' }],
        content: `# Vault & File Storage

Secure document management and file storage in SARTTHI.

## Overview

The Vault is your secure file storage system within SARTTHI. Store, organize, and share files with advanced security features and version control.

## Accessing the Vault

### Navigation
1. Click "Vault" in the main menu
2. Or use quick access: \`Ctrl + K\` → "Vault"

### Vault Structure
- **My Files**: Personal file storage
- **Shared with Me**: Files others have shared
- **Team Folders**: Workspace-shared folders
- **Recent**: Recently accessed files
- **Starred**: Favorited files

## Uploading Files

### Single File Upload
1. Click "+ Upload" button
2. Select file from your computer
3. Choose destination folder
4. Add optional description and tags

### Bulk Upload
1. Click "+ Upload" → "Upload Folder"
2. Select entire folder
3. Maintains folder structure
4. Progress indicator for large uploads

### Drag & Drop
1. Open destination folder
2. Drag files from your computer
3. Drop into the Vault window
4. Files upload automatically

## File Organization

### Creating Folders
1. Click "+ New Folder"
2. Enter folder name
3. Set folder permissions
4. Add folder description (optional)

### Moving Files
1. Select files (Ctrl+Click for multiple)
2. Click "Move" button
3. Choose destination folder
4. Confirm move

### File Tagging
1. Right-click on file
2. Select "Add Tags"
3. Create or select existing tags
4. Use tags for quick filtering

## File Sharing

### Share with Team Members
1. Right-click on file
2. Select "Share"
3. Choose recipients
4. Set permissions:
   - **View Only**: Can view but not download
   - **Download**: Can view and download
   - **Edit**: Can modify the file
   - **Full Access**: Can share and delete

### Generate Public Links
1. Right-click on file
2. Select "Get Link"
3. Configure link settings:
   - **Expiration**: Set link expiry date
   - **Password**: Add password protection
   - **Download Limit**: Limit number of downloads
4. Copy and share link

### Link Analytics
- View count
- Download count
- Last accessed time
- Geographic location (Enterprise)

## Version Control

### Automatic Versioning
- Every file edit creates a new version
- Up to 30 versions stored (Pro)
- Unlimited versions (Premium/Enterprise)

### Version Management
1. Right-click on file
2. Select "Version History"
3. View all versions with:
   - Timestamp
   - Editor name
   - File size
   - Change summary

### Restore Previous Version
1. Open Version History
2. Select version to restore
3. Click "Restore"
4. Current version becomes new version

## File Preview

### Supported Formats
- **Documents**: PDF, DOCX, TXT, MD
- **Spreadsheets**: XLSX, CSV
- **Presentations**: PPTX
- **Images**: JPG, PNG, GIF, SVG
- **Videos**: MP4, WebM (Premium)
- **Code**: All major programming languages

### Preview Features
- Full-screen mode
- Zoom in/out
- Page navigation
- Download option
- Share directly from preview

## Security Features

### Encryption
- AES-256 encryption at rest
- TLS 1.3 for data in transit
- End-to-end encryption (Enterprise)

### Access Control
- Role-based permissions
- IP whitelist (Enterprise)
- Device restrictions
- Audit logs

### Compliance
- GDPR compliant
- SOC 2 Type II certified
- HIPAA available (Enterprise)

## Storage Management

### Storage Limits
- **Free**: 5 GB
- **Pro**: 100 GB
- **Premium**: 1 TB
- **Enterprise**: Unlimited

### Storage Analytics
1. Go to Vault Settings
2. View storage breakdown:
   - Used space
   - Available space
   - Largest files
   - File type distribution

### Cleanup Tools
- Duplicate file finder
- Large file identifier
- Unused file detection
- Bulk delete options

## Best Practices

1. **Organized Structure**: Use clear folder hierarchy
2. **Consistent Naming**: Follow naming conventions
3. **Regular Cleanup**: Remove unused files monthly
4. **Version Control**: Review and clean old versions
5. **Security**: Use password protection for sensitive files
6. **Backup**: Download critical files regularly

## Related Items
- Team Collaboration Tools
- File Sharing Best Practices
- Security & Compliance`,
        category: 'user-guide',
        order: 6,
        isPublished: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        _id: '13',
        title: 'Reports & Analytics',
        slug: 'reports-analytics',
        featuredImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=400&fit=crop',
        shortDescription: 'Comprehensive guide to data insights and reporting in SARTTHI. Generate custom reports, export data, and get AI-powered insights.',
        overviewPoints: ['Real-time analytics dashboards', 'Custom report builder', 'AI-powered insights and predictions', 'Export in multiple formats', 'Scheduled report delivery'],
        additionalDetails: 'SARTTHI\'s analytics provide deep insights into team performance and project progress. Learn to create custom reports and leverage AI for predictive analytics.',
        relatedItems: [{ id: '5', title: 'AI Assistant Features', badge: 'Featured', description: 'AI-powered analytics and insights.' }, { id: '3', title: 'Managing Tasks and Workflows', badge: 'Popular', description: 'Task analytics and metrics.' }, { id: '2', title: 'Creating Your First Project', badge: 'Verified', description: 'Project analytics dashboard.' }],
        mockups: [{ title: 'Analytics Dashboard', description: 'View key metrics: active projects, completion rate, team utilization, and productivity score.', imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=500&fit=crop' }, { title: 'Custom Report Builder', description: 'Click + New Report. Select data source, apply filters, choose metrics, and customize visualization.', imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=500&fit=crop' }, { title: 'Export Reports', description: 'Generate reports in PDF, Excel, CSV, or PowerPoint. Schedule automatic delivery via email or Slack.', imageUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&h=500&fit=crop' }],
        content: `# Reports & Analytics

Comprehensive guide to data insights and reporting in SARTTHI.

## Overview

SARTTHI's analytics dashboard provides real-time insights into team performance, project progress, and productivity metrics. Generate custom reports and export data for further analysis.

## Accessing Analytics

### Navigation
1. Click "Reports" in the main menu
2. Select dashboard type:
   - **Overview**: High-level metrics
   - **Projects**: Project-specific analytics
   - **Team**: Team performance metrics
   - **Personal**: Individual productivity

## Dashboard Overview

### Key Metrics
- **Active Projects**: Currently running projects
- **Completion Rate**: % of tasks completed on time
- **Team Utilization**: Resource allocation efficiency
- **Productivity Score**: AI-calculated team productivity

### Visual Representations
- Line charts for trends
- Pie charts for distribution
- Bar graphs for comparisons
- Heat maps for activity patterns

## Project Analytics

### Project Health Score
Calculated based on:
1. **Timeline Adherence**: On-time vs delayed tasks
2. **Budget Tracking**: Spent vs allocated resources
3. **Team Engagement**: Activity levels
4. **Risk Factors**: Identified bottlenecks

### Project Metrics
- **Tasks Completed**: Total and by status
- **Time Tracking**: Estimated vs actual time
- **Milestone Progress**: Completion percentage
- **Resource Allocation**: Team member workload

### Generating Project Reports
1. Select project from dropdown
2. Choose date range
3. Select metrics to include
4. Click "Generate Report"
5. Export as PDF, Excel, or CSV

## Team Analytics

### Team Performance Metrics
- **Productivity Trends**: Daily/weekly/monthly
- **Task Completion Rate**: Individual and team
- **Response Time**: Average time to complete tasks
- **Collaboration Score**: Team interaction metrics

### Individual Performance
1. Select team member
2. View personal metrics:
   - Tasks completed
   - Average completion time
   - Quality score
   - Contribution level

### Workload Distribution
- Visual representation of task allocation
- Identify overloaded team members
- Balance workload recommendations
- Capacity planning insights

## Custom Reports

### Creating Custom Reports
1. Click "+ New Report"
2. Select report type:
   - **Task Report**: Task-based analytics
   - **Time Report**: Time tracking data
   - **Resource Report**: Resource utilization
   - **Custom**: Build from scratch

### Report Builder
1. **Data Source**: Choose data to analyze
2. **Filters**: Apply date range, team, project filters
3. **Metrics**: Select KPIs to include
4. **Visualization**: Choose chart types
5. **Layout**: Arrange report sections

### Saving Report Templates
1. Configure report settings
2. Click "Save as Template"
3. Name your template
4. Reuse for future reports

## AI-Powered Insights

### Predictive Analytics
- **Project Completion**: Estimated completion dates
- **Risk Detection**: Potential delays or issues
- **Resource Needs**: Future resource requirements
- **Budget Forecasting**: Projected costs

### Recommendations
- Task prioritization suggestions
- Team reallocation recommendations
- Process improvement opportunities
- Automation possibilities

## Exporting Data

### Export Formats
- **PDF**: Formatted reports
- **Excel**: Raw data with charts
- **CSV**: Data only
- **PowerPoint**: Presentation-ready slides

### Scheduled Reports
1. Create or select report
2. Click "Schedule"
3. Set frequency:
   - Daily
   - Weekly
   - Monthly
   - Custom
4. Choose recipients
5. Select delivery method (Email/Slack)

## Real-Time Dashboards

### Live Metrics
- Auto-refresh every 5 minutes
- Real-time task updates
- Live team activity feed
- Instant notifications for milestones

### Dashboard Customization
1. Click "Customize Dashboard"
2. Add/remove widgets
3. Resize and rearrange
4. Save custom layout
5. Create multiple dashboard views

## Comparative Analysis

### Time Period Comparison
- Compare current vs previous period
- Year-over-year analysis
- Quarter-over-quarter trends
- Custom date range comparison

### Team Comparison
- Compare team performance
- Benchmark against averages
- Identify top performers
- Spot improvement areas

## Best Practices

1. **Regular Reviews**: Weekly analytics check-ins
2. **Data-Driven Decisions**: Base decisions on metrics
3. **Share Insights**: Distribute reports to stakeholders
4. **Track Trends**: Monitor long-term patterns
5. **Act on Insights**: Implement recommended changes
6. **Custom Dashboards**: Create role-specific views

## Related Items
- AI Assistant Features
- Team Collaboration Tools
- Project Management Guide`,
        category: 'user-guide',
        order: 7,
        isPublished: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        _id: '14',
        title: 'Attendance & Payroll Management',
        slug: 'attendance-payroll',
        featuredImage: 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=1200&h=400&fit=crop',
        shortDescription: 'Complete guide to tracking attendance and managing payroll in SARTTHI. Clock in/out, leave management, and automated payroll processing.',
        overviewPoints: ['Clock in/out system with GPS verification', 'Leave management and approval workflow', 'Shift scheduling and overtime tracking', 'Automated payroll calculation', 'Statutory compliance and reporting'],
        additionalDetails: 'SARTTHI\'s integrated attendance and payroll system streamlines HR operations. Learn to track employee hours, manage leaves, and process payroll efficiently.',
        relatedItems: [{ id: '10', title: 'Workspace Management Guide', badge: 'Popular', description: 'Workspace HR settings.' }, { id: '13', title: 'Reports & Analytics', badge: 'Recommended', description: 'Attendance and payroll reports.' }, { id: '15', title: 'Role-Based Access Control', badge: 'Verified', description: 'HR permissions and roles.' }],
        mockups: [{ title: 'Clock In/Out', description: 'Click Clock In button on dashboard. System records timestamp, location, and device information.', imageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&h=500&fit=crop' }, { title: 'Leave Request', description: 'Click Request Leave. Select leave type, dates, add reason, attach documents, and submit for approval.', imageUrl: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800&h=500&fit=crop' }, { title: 'Generate Payslips', description: 'Navigate to Payroll > Generate Payslips. Select month, review calculations, and generate all payslips.', imageUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&h=500&fit=crop' }],
        content: `# Attendance & Payroll Management

Complete guide to tracking attendance and managing payroll in SARTTHI.

## Overview

SARTTHI's integrated attendance and payroll system helps you track employee hours, manage leaves, and process payroll efficiently. Available for Pro plan and above.

## Attendance Tracking

### Clock In/Out System

#### For Employees
1. Navigate to Dashboard
2. Click "Clock In" button
3. System records:
   - Timestamp
   - Location (if enabled)
   - Device information
4. Click "Clock Out" when leaving

#### Mobile App
- One-tap clock in/out
- GPS verification
- Photo capture (optional)
- Offline mode support

### Manual Attendance Entry

#### For Managers
1. Go to Attendance > Manual Entry
2. Select employee
3. Choose date
4. Enter times:
   - Clock in time
   - Clock out time
   - Break duration
5. Add notes (optional)
6. Submit for approval

### Attendance Reports

#### Daily Attendance
- View real-time attendance status
- See who's present, absent, or late
- Export daily attendance sheet

#### Monthly Summary
1. Select month and year
2. View employee-wise summary:
   - Total working days
   - Present days
   - Absent days
   - Late arrivals
   - Early departures
3. Export as Excel or PDF

## Leave Management

### Leave Types
- **Casual Leave**: Short-term personal leave
- **Sick Leave**: Medical-related absence
- **Paid Leave**: Annual paid time off
- **Unpaid Leave**: Leave without pay
- **Work From Home**: Remote work days

### Applying for Leave

#### Employee Process
1. Click "Request Leave"
2. Fill leave application:
   - Leave type
   - Start date
   - End date
   - Reason
   - Attach documents (if sick leave)
3. Submit for approval

#### Manager Approval
1. Receive leave request notification
2. Review request details
3. Check team calendar
4. Approve or reject with comments
5. Employee receives notification

### Leave Balance
- View available leave balance
- Track used leaves
- See upcoming leaves
- Download leave history

## Shift Management

### Creating Shifts
1. Go to Settings > Shifts
2. Click "+ Add Shift"
3. Configure shift details:
   - Shift name
   - Start time
   - End time
   - Break duration
   - Working days
4. Assign employees

### Shift Scheduling
- Weekly shift roster
- Rotating shifts support
- Shift swap requests
- Overtime tracking

## Payroll Processing

### Salary Components

#### Earnings
- Basic salary
- House Rent Allowance (HRA)
- Dearness Allowance (DA)
- Special Allowance
- Performance bonus
- Overtime pay

#### Deductions
- Professional Tax
- Provident Fund (PF)
- Employee State Insurance (ESI)
- Tax Deducted at Source (TDS)
- Loan repayments

### Payroll Calculation

#### Automated Calculation
1. System automatically calculates:
   - Gross salary
   - Total deductions
   - Net salary
2. Based on:
   - Attendance data
   - Leave records
   - Overtime hours
   - Bonuses/penalties

#### Manual Adjustments
1. Go to Payroll > Adjustments
2. Select employee
3. Add adjustment:
   - Type (bonus/deduction)
   - Amount
   - Reason
4. Save changes

### Generating Payslips

#### Monthly Payslips
1. Navigate to Payroll > Generate Payslips
2. Select month
3. Review calculations
4. Click "Generate All"
5. Payslips created automatically

#### Payslip Distribution
- Email to employees
- Available in employee portal
- Download as PDF
- Print option

### Salary Disbursement

#### Payment Methods
- Bank transfer (recommended)
- Check payment
- Cash payment
- UPI transfer

#### Processing Payments
1. Review payroll summary
2. Verify bank details
3. Generate payment file
4. Upload to bank portal
5. Mark as paid in system

## Compliance & Reporting

### Statutory Compliance
- PF return generation
- ESI return generation
- TDS calculation and filing
- Form 16 generation
- Bonus calculation

### Payroll Reports
1. **Salary Register**: Complete salary breakdown
2. **Bank Statement**: Payment summary
3. **Tax Reports**: TDS and other taxes
4. **Attendance Summary**: Monthly attendance
5. **Leave Report**: Leave utilization

## Employee Self-Service

### Employee Portal Access
1. Login to employee portal
2. View personal dashboard:
   - Attendance summary
   - Leave balance
   - Payslips
   - Tax documents

### Update Personal Information
- Contact details
- Bank account
- Tax declarations
- Emergency contacts

## Best Practices

1. **Regular Monitoring**: Daily attendance checks
2. **Timely Processing**: Process payroll on schedule
3. **Accurate Records**: Maintain detailed documentation
4. **Compliance**: Stay updated with labor laws
5. **Employee Communication**: Clear payroll policies
6. **Data Security**: Protect sensitive information

## Related Items
- Workspace Management Guide
- Team Collaboration Tools
- Reports & Analytics`,
        category: 'user-guide',
        order: 8,
        isPublished: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        _id: '15',
        title: 'Role-Based Access Control (RBAC)',
        slug: 'role-based-access',
        featuredImage: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=1200&h=400&fit=crop',
        shortDescription: 'Comprehensive guide to managing permissions and access control in SARTTHI. Define roles, assign permissions, and maintain security.',
        overviewPoints: ['Default and custom role creation', 'Granular permission management', 'Permission inheritance hierarchy', 'Access request and approval workflow', 'Audit logs and compliance reporting'],
        additionalDetails: 'RBAC allows you to control who can access what within your SARTTHI workspace. Learn to define roles, manage permissions, and maintain security across your organization.',
        relatedItems: [{ id: '10', title: 'Workspace Management Guide', badge: 'Verified', description: 'Workspace-level permissions.' }, { id: '14', title: 'Attendance & Payroll Management', badge: 'Popular', description: 'HR role permissions.' }, { id: '12', title: 'Vault & File Storage', badge: 'Recommended', description: 'File access control.' }],
        mockups: [{ title: 'Create Custom Role', description: 'Go to Settings > Roles & Permissions > Create Role. Define role name, description, and assign permissions.', imageUrl: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&h=500&fit=crop' }, { title: 'Assign Permissions', description: 'Select role and configure permissions for workspace, projects, tasks, files, and advanced features.', imageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=500&fit=crop' }, { title: 'Audit Logs', description: 'View access history in Settings > Audit Logs. Track who accessed what, when, and from which device.', imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=500&fit=crop' }],
        content: `# Role-Based Access Control (RBAC)

Comprehensive guide to managing permissions and access control in SARTTHI.

## Overview

RBAC allows you to control who can access what within your SARTTHI workspace. Define roles, assign permissions, and maintain security across your organization.

## Understanding Roles

### Default Roles

#### Workspace Level
1. **Owner**
   - Full control over workspace
   - Can delete workspace
   - Manage billing
   - Cannot be removed

2. **Admin**
   - Manage members and projects
   - Configure workspace settings
   - Cannot access billing
   - Can be removed by Owner

3. **Member**
   - Create and manage own projects
   - Collaborate on assigned projects
   - Limited settings access

4. **Guest**
   - Access to specific projects only
   - Cannot create projects
   - Limited collaboration features

#### Project Level
1. **Project Admin**
   - Full project control
   - Manage project members
   - Delete project

2. **Project Member**
   - Create and edit tasks
   - Comment and collaborate
   - View project data

3. **Viewer**
   - Read-only access
   - Cannot edit or create
   - Can comment (if enabled)

## Creating Custom Roles

### Step-by-Step Process
1. Go to Settings > Roles & Permissions
2. Click "+ Create Custom Role"
3. Enter role details:
   - Role name
   - Description
   - Role color (for visual identification)

### Defining Permissions

#### Workspace Permissions
- **Members**: View, Add, Edit, Remove
- **Projects**: View, Create, Edit, Delete
- **Settings**: View, Edit
- **Billing**: View, Manage
- **Integrations**: View, Configure
- **Reports**: View, Export

#### Project Permissions
- **Tasks**: View, Create, Edit, Delete, Assign
- **Files**: View, Upload, Download, Delete
- **Comments**: View, Add, Edit, Delete
- **Timeline**: View, Edit
- **Budget**: View, Edit

#### Advanced Permissions
- **API Access**: Enable/Disable
- **Export Data**: Allow/Restrict
- **Invite Members**: Allow/Restrict
- **Delete Content**: Allow/Restrict

## Assigning Roles

### Assign to Individual Users
1. Go to Workspace > Members
2. Click on member name
3. Select "Change Role"
4. Choose role from dropdown
5. Save changes

### Bulk Role Assignment
1. Select multiple members (checkbox)
2. Click "Bulk Actions"
3. Select "Assign Role"
4. Choose role
5. Confirm assignment

## Permission Inheritance

### Hierarchy Structure
\`\`\`
Workspace Level
  ↓
Project Level
  ↓
Task Level
\`\`\`

### Inheritance Rules
- Lower-level permissions cannot exceed higher-level
- Project permissions inherit from workspace
- Task permissions inherit from project
- Explicit permissions override inherited ones

## Managing Access

### Granting Access
1. Navigate to resource (workspace/project)
2. Click "Share" or "Manage Access"
3. Enter user email
4. Select role
5. Set expiration (optional)
6. Send invitation

### Revoking Access
1. Go to Members list
2. Find user
3. Click "..." menu
4. Select "Remove Access"
5. Confirm removal

### Temporary Access
1. Grant access with expiration date
2. System automatically revokes after expiry
3. User receives notification before expiry
4. Can be extended if needed

## Access Requests

### Request Process
1. User requests access to resource
2. Owner/Admin receives notification
3. Review request details
4. Approve with appropriate role
5. User gets access immediately

### Auto-Approval Rules
1. Set up approval rules
2. Define criteria:
   - Email domain
   - Department
   - Job title
3. Matching requests auto-approved
4. Non-matching require manual review

## Audit & Compliance

### Access Logs
1. Go to Settings > Audit Logs
2. View access history:
   - Who accessed what
   - When they accessed
   - What actions were performed
   - IP address and device

### Compliance Reports
- Generate access reports
- Export for compliance audits
- Track permission changes
- Monitor suspicious activity

## Security Best Practices

### Principle of Least Privilege
- Grant minimum necessary permissions
- Review permissions regularly
- Remove unused access
- Use temporary access when possible

### Regular Audits
1. **Monthly Reviews**: Check active users
2. **Quarterly Audits**: Review all permissions
3. **Annual Cleanup**: Remove inactive accounts
4. **Access Recertification**: Managers verify team access

### Multi-Factor Authentication
1. Enable MFA for all users
2. Require for sensitive roles
3. Configure MFA policies
4. Monitor MFA compliance

## Advanced Features

### Conditional Access
- IP-based restrictions
- Device-based access
- Time-based access
- Location-based rules

### Permission Templates
1. Create permission sets
2. Save as templates
3. Quick apply to new users
4. Maintain consistency

## Troubleshooting

### Common Issues

#### User Can't Access Resource
1. Check user role
2. Verify permissions
3. Check inheritance
4. Review explicit denials

#### Permission Conflicts
1. Identify conflicting rules
2. Check inheritance chain
3. Resolve with explicit permissions
4. Document resolution

## Related Items
- Workspace Management Guide
- Team Collaboration Tools
- Security & Compliance`,
        category: 'user-guide',
        order: 9,
        isPublished: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
  };

  useEffect(() => {
    loadDocs();
  }, []);

  useEffect(() => {
    // Load article based on slug
    if (slug) {
      // Only fetch if the slug doesn't match the current article
      if (currentArticle?.slug !== slug) {
        documentationService.getDocBySlug(slug).then(article => {
          if (article && article.isPublished) {
            setCurrentArticle(article);
          } else {
            setCurrentArticle(null);
          }
        });
      }
    } else {
      // Show listing view by default
      setCurrentArticle(null);
    }
  }, [slug]);

  const toggleCategory = (categorySlug: string) => {
    setCategories(prev =>
      prev.map(cat =>
        cat.slug === categorySlug ? { ...cat, expanded: !cat.expanded } : cat
      )
    );
  };

  const selectArticle = (article: DocArticle) => {
    setCurrentArticle(article);
    navigate(`/docs/${article.slug}`);
    setSidebarOpen(false);
  };

  // Filter and sort articles
  const getFilteredArticles = () => {
    let allArticles: Array<DocArticle & { categoryData: DocCategory }> = [];
    
    categories.forEach(category => {
      category.articles.forEach(article => {
        allArticles.push({ ...article, categoryData: category });
      });
    });

    // Apply tag filter
    if (selectedTag !== 'all') {
      allArticles = allArticles.filter(article => article.categoryData.slug === selectedTag);
    }

    // Apply badge filter
    if (selectedFilter !== 'all') {
      const badges = ['New', 'Verified', 'Popular', 'Recommended', 'Featured'];
      allArticles = allArticles.filter((article, idx) => {
        const badge = badges[idx % badges.length];
        return badge.toLowerCase() === selectedFilter.toLowerCase();
      });
    }

    // Apply sorting
    switch (sortBy) {
      case 'newest':
        allArticles.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'oldest':
        allArticles.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case 'a-z':
        allArticles.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'z-a':
        allArticles.sort((a, b) => b.title.localeCompare(a.title));
        break;
    }

    return allArticles;
  };

  // Reset filters
  const resetFilters = () => {
    setSelectedTag('all');
    setSelectedFilter('all');
    setSortBy('newest');
  };

  // Helper function to convert YouTube/Vimeo URLs to embed URLs
  const getVideoEmbedUrl = (url: string): string | null => {
    if (!url) return null;

    // YouTube patterns
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/;
    const youtubeMatch = url.match(youtubeRegex);
    if (youtubeMatch && youtubeMatch[1]) {
      return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
    }

    // Vimeo patterns
    const vimeoRegex = /(?:vimeo\.com\/)([0-9]+)/;
    const vimeoMatch = url.match(vimeoRegex);
    if (vimeoMatch && vimeoMatch[1]) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    }

    // If already an embed URL, return as is
    if (url.includes('youtube.com/embed/') || url.includes('player.vimeo.com/video/')) {
      return url;
    }

    return null;
  };

  const Sidebar = () => (
    <div className="bg-white border-gray-200 border-r h-full overflow-y-auto">
      {/* Categories */}
      <div className="p-4">
        {categories.map((category) => (
          <div key={category.slug} className="mb-4">
            <button
              onClick={() => toggleCategory(category.slug)}
              className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">{category.icon}</span>
                <span className="font-semibold text-gray-900">
                  {category.name}
                </span>
              </div>
              {category.expanded ? (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-400" />
              )}
            </button>

            {category.expanded && (
              <div className="ml-8 mt-2 space-y-1">
                {category.articles.map((article) => (
                  <button
                    key={article._id}
                    onClick={() => selectArticle(article)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors break-words ${
                      currentArticle?._id === article._id
                        ? 'bg-blue-50 text-[#006397] font-medium'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {article.title}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen relative" style={{ background: 'linear-gradient(to bottom, #D7E8FE, #FEFFFF)' }}>
      <SEO
        title="Documentation"
        description="Complete documentation for Sartthi - Learn how to use our project management and payroll suite effectively"
        keywords="documentation, user guide, help, tutorial, sartthi docs"
        url="/docs"
      />

      <SharedNavbar />

      {/* Hero Section */}
      <div className="relative pt-16 pb-20 overflow-hidden" style={{ backgroundColor: '#F1F4F9' }}>
        {/* Hero Content */}
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-20">
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-50 border border-blue-200 mb-6">
            <span className="text-sm font-semibold" style={{ color: '#006397' }}>Documentation</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Get Started with Sartthi
          </h1>

          {/* Description */}
          <p className="text-lg text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
            Everything you need to know about Sartthi - from getting started guides to advanced features. Learn how to manage projects, collaborate with your team, and boost productivity.
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search documentation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-14 pr-6 py-4 rounded-2xl bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent shadow-lg hover:shadow-xl transition-shadow"
                onFocus={(e) => {
                  e.target.style.boxShadow = '0 0 0 3px rgba(0, 99, 151, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.boxShadow = '';
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="min-h-screen relative z-10 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Mobile Header */}
          <div className="lg:hidden mb-4 flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={`p-2 rounded-lg bg-white text-gray-900 border border-gray-200`}
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <h1 className={`text-xl font-bold text-gray-900`}>
              {t('docs.title')}
            </h1>
          </div>

          <div className="flex gap-8">
            {/* Sidebar - Desktop */}
            <div className="hidden lg:block w-64 flex-shrink-0">
              <div className="sticky top-20">
                <Sidebar />
              </div>
            </div>

            {/* Sidebar - Mobile Drawer */}
            {sidebarOpen && (
              <div className="lg:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setSidebarOpen(false)}>
                <div
                  className={`w-80 h-full bg-white`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Sidebar />
                </div>
              </div>
            )}

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              {!currentArticle ? (
                // Card Listing View
                <div>
                  {/* Filters */}
                  <div className="flex flex-wrap gap-4 mb-8">
                    {/* Tag Filter - Custom Dropdown */}
                    <div className="relative group">
                      <div className="bg-white border border-gray-200 rounded-lg px-4 py-2 cursor-pointer flex items-center justify-between gap-3 min-w-[180px] hover:border-[#006397] transition-all">
                        <span className="text-sm text-gray-700">
                          {selectedTag === 'all' ? 'All Categories' : 
                           selectedTag === 'getting-started' ? 'Getting Started' :
                           selectedTag === 'user-guide' ? 'User Guide' :
                           selectedTag === 'api-reference' ? 'API Reference' :
                           selectedTag === 'tutorials' ? 'Tutorials' : 'FAQ'}
                        </span>
                        <svg 
                          className="w-4 h-4 text-gray-500 transform group-hover:rotate-180 transition-transform duration-300" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                      <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top scale-y-0 group-hover:scale-y-100 z-50">
                        <div className="py-1">
                          <button onClick={() => setSelectedTag('all')} className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${selectedTag === 'all' ? 'bg-blue-50 text-[#006397]' : 'text-gray-700'}`}>All Categories</button>
                          <button onClick={() => setSelectedTag('getting-started')} className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${selectedTag === 'getting-started' ? 'bg-blue-50 text-[#006397]' : 'text-gray-700'}`}>Getting Started</button>
                          <button onClick={() => setSelectedTag('user-guide')} className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${selectedTag === 'user-guide' ? 'bg-blue-50 text-[#006397]' : 'text-gray-700'}`}>User Guide</button>
                          <button onClick={() => setSelectedTag('api-reference')} className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${selectedTag === 'api-reference' ? 'bg-blue-50 text-[#006397]' : 'text-gray-700'}`}>API Reference</button>
                          <button onClick={() => setSelectedTag('tutorials')} className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${selectedTag === 'tutorials' ? 'bg-blue-50 text-[#006397]' : 'text-gray-700'}`}>Tutorials</button>
                          <button onClick={() => setSelectedTag('faq')} className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${selectedTag === 'faq' ? 'bg-blue-50 text-[#006397]' : 'text-gray-700'}`}>FAQ</button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Badge Filter - Custom Dropdown */}
                    <div className="relative group">
                      <div className="bg-white border border-gray-200 rounded-lg px-4 py-2 cursor-pointer flex items-center justify-between gap-3 min-w-[150px] hover:border-[#006397] transition-all">
                        <span className="text-sm text-gray-700">
                          {selectedFilter === 'all' ? 'All' :
                           selectedFilter.charAt(0).toUpperCase() + selectedFilter.slice(1)}
                        </span>
                        <svg 
                          className="w-4 h-4 text-gray-500 transform group-hover:rotate-180 transition-transform duration-300" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                      <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top scale-y-0 group-hover:scale-y-100 z-50">
                        <div className="py-1">
                          <button onClick={() => setSelectedFilter('all')} className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${selectedFilter === 'all' ? 'bg-blue-50 text-[#006397]' : 'text-gray-700'}`}>All</button>
                          <button onClick={() => setSelectedFilter('new')} className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${selectedFilter === 'new' ? 'bg-blue-50 text-[#006397]' : 'text-gray-700'}`}>New</button>
                          <button onClick={() => setSelectedFilter('verified')} className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${selectedFilter === 'verified' ? 'bg-blue-50 text-[#006397]' : 'text-gray-700'}`}>Verified</button>
                          <button onClick={() => setSelectedFilter('popular')} className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${selectedFilter === 'popular' ? 'bg-blue-50 text-[#006397]' : 'text-gray-700'}`}>Popular</button>
                          <button onClick={() => setSelectedFilter('recommended')} className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${selectedFilter === 'recommended' ? 'bg-blue-50 text-[#006397]' : 'text-gray-700'}`}>Recommended</button>
                          <button onClick={() => setSelectedFilter('featured')} className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${selectedFilter === 'featured' ? 'bg-blue-50 text-[#006397]' : 'text-gray-700'}`}>Featured</button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Sort Filter - Custom Dropdown */}
                    <div className="relative group">
                      <div className="bg-white border border-gray-200 rounded-lg px-4 py-2 cursor-pointer flex items-center justify-between gap-3 min-w-[150px] hover:border-[#006397] transition-all">
                        <span className="text-sm text-gray-700">
                          {sortBy === 'newest' ? 'Newest First' :
                           sortBy === 'oldest' ? 'Oldest First' :
                           sortBy === 'a-z' ? 'A-Z' : 'Z-A'}
                        </span>
                        <svg 
                          className="w-4 h-4 text-gray-500 transform group-hover:rotate-180 transition-transform duration-300" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                      <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top scale-y-0 group-hover:scale-y-100 z-50">
                        <div className="py-1">
                          <button onClick={() => setSortBy('newest')} className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${sortBy === 'newest' ? 'bg-blue-50 text-[#006397]' : 'text-gray-700'}`}>Newest First</button>
                          <button onClick={() => setSortBy('oldest')} className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${sortBy === 'oldest' ? 'bg-blue-50 text-[#006397]' : 'text-gray-700'}`}>Oldest First</button>
                          <button onClick={() => setSortBy('a-z')} className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${sortBy === 'a-z' ? 'bg-blue-50 text-[#006397]' : 'text-gray-700'}`}>A-Z</button>
                          <button onClick={() => setSortBy('z-a')} className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${sortBy === 'z-a' ? 'bg-blue-50 text-[#006397]' : 'text-gray-700'}`}>Z-A</button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Reset Button */}
                    <button 
                      onClick={resetFilters}
                      className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 text-sm hover:bg-gray-50 hover:border-[#006397] transition-all"
                    >
                      Reset
                    </button>
                  </div>

                  {/* Cards Grid */}
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {getFilteredArticles().map((article, idx) => {
                        // Assign badges and icons based on index for variety
                        const badges = ['New', 'Verified', 'Popular', 'Recommended', 'Featured'];
                        const badgeColors = {
                          'New': 'bg-red-50 text-red-600',
                          'Verified': 'bg-blue-50 text-blue-600',
                          'Popular': 'bg-purple-50 text-purple-600',
                          'Recommended': 'bg-orange-50 text-orange-600',
                          'Featured': 'bg-green-50 text-green-600'
                        };
                        const badge = badges[idx % badges.length];
                        const iconColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DFE6E9'];
                        const iconBg = iconColors[idx % iconColors.length];

                        return (
                          <div
                            key={article._id}
                            className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                          >
                            {/* Icon */}
                            <div 
                              className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                              style={{ backgroundColor: `${iconBg}20` }}
                            >
                              <span className="text-2xl">{article.categoryData.icon}</span>
                            </div>

                            {/* Title */}
                            <h3 className="text-lg font-semibold text-gray-900 mb-2 break-words">
                              {article.title}
                            </h3>

                            {/* Badge */}
                            <div className="mb-3">
                              <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${badgeColors[badge as keyof typeof badgeColors]}`}>
                                {badge}
                              </span>
                            </div>

                            {/* Description */}
                            <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                              {article.content.substring(0, 100).replace(/[#*`]/g, '')}...
                            </p>

                            {/* View Details Button */}
                            <button
                              onClick={() => selectArticle(article)}
                              className="text-sm text-[#006397] font-medium hover:underline flex items-center gap-1"
                            >
                              View Details
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </button>
                          </div>
                        );
                      })}
                  </div>

                  {/* Empty State */}
                  {categories.length === 0 && !loading && (
                    <div className="text-center py-20">
                      <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">No Documentation Found</h3>
                      <p className="text-gray-600">Check back later for helpful guides and tutorials.</p>
                    </div>
                  )}

                  {/* Loading State */}
                  {loading && (
                    <div className="text-center py-20">
                      <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#006397]"></div>
                      <p className="mt-4 text-gray-600">Loading documentation...</p>
                    </div>
                  )}
                </div>
              ) : (
                // Article Detail View
                <div className="max-w-5xl mx-auto">
                  {/* Back Button */}
                  <button
                    onClick={() => {
                      setCurrentArticle(null);
                      navigate('/docs');
                    }}
                    className="mb-6 flex items-center gap-2 text-sm text-gray-600 hover:text-[#006397] transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Documentation
                  </button>

                  {/* Featured Image & Title Section */}
                  <div className="bg-white rounded-2xl overflow-hidden shadow-lg mb-8">
                    <div className="grid md:grid-cols-2 gap-0">
                      {/* Featured Image */}
                      <div className="relative h-64 md:h-auto">
                        {currentArticle.featuredImage ? (
                          <img 
                            src={currentArticle.featuredImage} 
                            alt={currentArticle.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-purple-500 via-pink-500 to-red-500"></div>
                        )}
                      </div>

                      {/* Title & Description */}
                      <div className="p-8 flex flex-col justify-center">
                        <h1 className="text-3xl font-bold text-gray-900 mb-4">
                          {currentArticle.title}
                        </h1>
                        <p className="text-gray-600 mb-6">
                          {currentArticle.shortDescription || 'Comprehensive guide and documentation'}
                        </p>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                              <BookOpen className="w-4 h-4 text-[#006397]" />
                            </div>
                            <span className="text-sm font-medium text-gray-700">SARTTHI</span>
                          </div>
                          <button className="ml-auto px-6 py-2 bg-[#006397] text-white rounded-lg hover:bg-[#005280] transition-colors flex items-center gap-2">
                            Learn More
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Overview Section */}
                  {currentArticle.overviewPoints && currentArticle.overviewPoints.length > 0 && (
                    <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
                      <h2 className="text-2xl font-bold text-gray-900 mb-6">Overview</h2>
                      <p className="text-gray-600 mb-6">
                        {currentArticle.shortDescription}
                      </p>
                      <ul className="space-y-3">
                        {currentArticle.overviewPoints.map((point, idx) => (
                          <li key={idx} className="flex items-start gap-3">
                            <svg className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-gray-700">{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Main Content */}
                  <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
                    {/* Video */}
                    {currentArticle.videoUrl && (() => {
                      const embedUrl = getVideoEmbedUrl(currentArticle.videoUrl);
                      return embedUrl ? (
                        <div className="mb-8 rounded-lg overflow-hidden">
                          <div className="aspect-video">
                            <iframe
                              src={embedUrl}
                              title={currentArticle.title}
                              className="w-full h-full"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          </div>
                        </div>
                      ) : null;
                    })()}

                    {/* Markdown Content */}
                    <div className="prose max-w-none">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          code({ className, children }) {
                            const match = /language-(\w+)/.exec(className || '');
                            if (match) {
                              return (
                                <SyntaxHighlighter
                                  style={vscDarkPlus as any}
                                  language={match[1]}
                                  PreTag="div"
                                >
                                  {String(children).replace(/\n$/, '')}
                                </SyntaxHighlighter>
                              );
                            }
                            return (
                              <code className={className}>
                                {children}
                              </code>
                            );
                          }
                        }}
                      >
                        {currentArticle.content}
                      </ReactMarkdown>
                    </div>
                  </div>

                  {/* Mockups/Screenshots Section */}
                  {currentArticle.mockups && currentArticle.mockups.length > 0 && (
                    <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
                      <h2 className="text-2xl font-bold text-gray-900 mb-6">Step-by-Step Visual Guide</h2>
                      <div className="space-y-8">
                        {currentArticle.mockups.map((mockup, idx) => (
                          <div key={idx}>
                            {mockup.interactive && mockup.interactiveType ? (
                              // Render Interactive Component
                              <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">{mockup.title}</h3>
                                <p className="text-gray-600 mb-4">{mockup.description}</p>
                                <InteractiveMockup type={mockup.interactiveType} />
                              </div>
                            ) : (
                              // Render Static Image
                              <div className="border border-gray-200 rounded-xl overflow-hidden">
                                {mockup.imageUrl && (
                                  <img 
                                    src={mockup.imageUrl} 
                                    alt={mockup.title}
                                    className="w-full h-auto object-cover"
                                  />
                                )}
                                <div className="p-6">
                                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    {mockup.title}
                                  </h3>
                                  <p className="text-gray-600">
                                    {mockup.description}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Additional Details Section */}
                  {currentArticle.additionalDetails && (
                    <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
                      <h2 className="text-2xl font-bold text-gray-900 mb-4">Additional Details</h2>
                      <p className="text-gray-700 leading-relaxed">
                        {currentArticle.additionalDetails}
                      </p>
                    </div>
                  )}

                  {/* Related Items Section */}
                  {currentArticle.relatedItems && currentArticle.relatedItems.length > 0 && (
                    <div className="bg-white rounded-2xl p-8 shadow-lg">
                      <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Items</h2>
                      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {currentArticle.relatedItems.map((item) => {
                          const badgeColors: Record<string, string> = {
                            'New': 'bg-red-50 text-red-600',
                            'Verified': 'bg-blue-50 text-blue-600',
                            'Popular': 'bg-purple-50 text-purple-600',
                            'Recommended': 'bg-orange-50 text-orange-600',
                            'Featured': 'bg-green-50 text-green-600'
                          };
                          const iconColors = ['#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'];
                          const iconBg = iconColors[parseInt(item.id) % iconColors.length];

                          return (
                            <div key={item.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all">
                              <div 
                                className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                                style={{ backgroundColor: `${iconBg}20` }}
                              >
                                <BookOpen className="w-6 h-6" style={{ color: iconBg }} />
                              </div>
                              <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                              {item.badge && (
                                <div className="mb-3">
                                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${badgeColors[item.badge] || 'bg-gray-50 text-gray-600'}`}>
                                    {item.badge}
                                  </span>
                                </div>
                              )}
                              <p className="text-sm text-gray-600 mb-4">{item.description}</p>
                              <button
                                onClick={() => {
                                  const article = categories
                                    .flatMap(cat => cat.articles)
                                    .find(a => a._id === item.id);
                                  if (article) selectArticle(article);
                                }}
                                className="text-sm text-[#006397] font-medium hover:underline flex items-center gap-1"
                              >
                                View Details
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Large Gradient Text Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <p className="text-center text-5xl md:text-9xl lg:text-[18rem] font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 dark:from-neutral-950 to-neutral-200 dark:to-neutral-800 inset-x-0">
            SARTTHI
          </p>
        </div>
      </section>

      <SharedFooter />
    </div>
  );
};

export default Docs;
