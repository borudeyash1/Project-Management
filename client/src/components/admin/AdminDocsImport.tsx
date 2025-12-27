import React, { useState } from 'react';
import { Upload, CheckCircle, XCircle, Loader } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import * as documentationService from '../../services/documentationService';

const AdminDocsImport: React.FC = () => {
  const { addToast } = useApp();
  const [importing, setImporting] = useState(false);
  const [results, setResults] = useState<{ title: string; success: boolean; error?: string }[]>([]);

  // All 15 articles from Docs.tsx
  const mockArticles = [
    {
      title: 'Getting Started with SARTTHI',
      slug: 'getting-started',
      category: 'getting-started',
      order: 1,
      isPublished: true,
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
- Check out the FAQ for common questions`
    },
    {
      title: 'Creating Your First Project',
      slug: 'first-project',
      category: 'getting-started',
      order: 2,
      isPublished: true,
      content: `# Creating Your First Project

Learn how to create and set up your first project in SARTTHI.

## Prerequisites

- Active SARTTHI account
- Workspace created
- Basic understanding of project management

## Step-by-Step Guide

### 1. Navigate to Projects
From your dashboard, click on the "Projects" tab or the "+ New Project" button.

### 2. Fill Project Details
- **Project Name**: Give your project a clear, descriptive name
- **Description**: Add details about project goals and scope
- **Deadline**: Set a target completion date
- **Visibility**: Choose who can see this project

### 3. Add Team Members
- Click "Add Members"
- Select team members from your workspace
- Assign roles (Admin, Member, Viewer)

### 4. Organize Tasks
- Create task lists
- Add individual tasks
- Set priorities and deadlines
- Assign tasks to team members

## Best Practices

- Keep project names clear and consistent
- Set realistic deadlines
- Assign clear ownership for tasks
- Regular check-ins with team

## Next Steps

- Learn about task management
- Explore different project views
- Set up project templates`
    },
    {
      title: 'Managing Tasks and Workflows',
      slug: 'managing-tasks',
      category: 'user-guide',
      order: 3,
      isPublished: true,
      content: `# Managing Tasks and Workflows

Master task management with SARTTHI's powerful features.

## Overview

Effective task management is crucial for project success. SARTTHI provides multiple tools and views to help you organize, prioritize, and track tasks efficiently.

## Creating Tasks

### Quick Task Creation
- Click "+ Add Task" in any project
- Enter task title and press Enter
- Add details later as needed

### Detailed Task Creation
- Click "+ Add Task" and select "Detailed"
- Fill in all task properties
- Set dependencies and subtasks

## Task Properties

### Priority Levels
- 🔴 High: Urgent and important
- 🟡 Medium: Important but not urgent
- 🟢 Low: Nice to have

### Status Tracking
- To Do
- In Progress
- In Review
- Done

## Workflow Automation

Set up automated workflows to save time and reduce manual work.

## Best Practices

- Break down large tasks into smaller subtasks
- Set realistic deadlines
- Use labels for categorization
- Regular status updates`
    },
    {
      title: 'Team Collaboration Tools',
      slug: 'team-collaboration',
      category: 'user-guide',
      order: 4,
      isPublished: true,
      content: `# Team Collaboration Tools

Collaborate effectively with your team using SARTTHI's collaboration features.

## Real-Time Collaboration

Work together seamlessly with real-time updates and notifications.

## Communication Features

### Comments
- Add comments to tasks and projects
- @mention team members
- Attach files and images

### Activity Feed
- See all team activity in one place
- Filter by project or member
- Stay updated on progress

## File Sharing

- Upload files to projects and tasks
- Version control
- Secure storage

## Best Practices

- Use @mentions for important updates
- Keep communication in context
- Regular team check-ins
- Document decisions`
    },
    {
      title: 'AI Assistant Features',
      slug: 'ai-assistant',
      category: 'user-guide',
      order: 5,
      isPublished: true,
      content: `# AI Assistant Features

Leverage AI to boost productivity and automate routine tasks.

## Overview

SARTTHI's AI Assistant helps you work smarter with intelligent suggestions, automation, and insights.

## Key Features

### Smart Suggestions
- Task recommendations
- Priority suggestions
- Deadline predictions

### Automation
- Automated task creation
- Smart scheduling
- Workflow automation

### Insights
- Project analytics
- Team performance
- Productivity trends

## Getting Started

1. Enable AI Assistant in settings
2. Configure preferences
3. Start using AI features

## Best Practices

- Review AI suggestions before accepting
- Provide feedback to improve accuracy
- Use AI for routine tasks
- Keep human oversight for critical decisions`
    },
    {
      title: 'API Authentication',
      slug: 'api-authentication',
      category: 'api-reference',
      order: 6,
      isPublished: true,
      content: `# API Authentication

Learn how to authenticate with the SARTTHI API.

## Overview

SARTTHI uses token-based authentication for API access.

## Getting API Keys

1. Go to Settings > API
2. Click "Generate API Key"
3. Copy and store securely

## Authentication Methods

### Bearer Token
\`\`\`
Authorization: Bearer YOUR_API_KEY
\`\`\`

### API Key Header
\`\`\`
X-API-Key: YOUR_API_KEY
\`\`\`

## Security Best Practices

- Never share API keys
- Rotate keys regularly
- Use environment variables
- Monitor API usage`
    },
    {
      title: 'Projects API',
      slug: 'projects-api',
      category: 'api-reference',
      order: 7,
      isPublished: true,
      content: `# Projects API

Manage projects programmatically using the SARTTHI API.

## Endpoints

### List Projects
\`\`\`
GET /api/projects
\`\`\`

### Create Project
\`\`\`
POST /api/projects
\`\`\`

### Get Project
\`\`\`
GET /api/projects/:id
\`\`\`

### Update Project
\`\`\`
PUT /api/projects/:id
\`\`\`

### Delete Project
\`\`\`
DELETE /api/projects/:id
\`\`\`

## Request Examples

See full documentation for request/response examples.`
    },
    {
      title: 'Building a Custom Integration',
      slug: 'custom-integration',
      category: 'tutorials',
      order: 8,
      isPublished: true,
      content: `# Building a Custom Integration

Create custom integrations with SARTTHI.

## Overview

Extend SARTTHI's functionality by building custom integrations.

## Prerequisites

- API access
- Development environment
- Basic programming knowledge

## Steps

1. Plan your integration
2. Set up authentication
3. Build the integration
4. Test thoroughly
5. Deploy and monitor

## Example Integrations

- Slack notifications
- GitHub sync
- Custom reporting
- External tool connections`
    },
    {
      title: 'Frequently Asked Questions',
      slug: 'faq',
      category: 'faq',
      order: 9,
      isPublished: true,
      content: `# Frequently Asked Questions

Common questions about SARTTHI.

## General Questions

### What is SARTTHI?
SARTTHI is a comprehensive project management platform.

### Is there a free plan?
Yes, we offer a free plan with basic features.

### Can I upgrade/downgrade?
Yes, you can change plans anytime.

## Technical Questions

### What browsers are supported?
All modern browsers (Chrome, Firefox, Safari, Edge).

### Is my data secure?
Yes, we use industry-standard encryption.

### Can I export my data?
Yes, you can export all your data anytime.

## Billing Questions

### How does billing work?
Monthly or annual billing options available.

### Can I get a refund?
Yes, within 30 days of purchase.`
    },
    {
      title: 'Workspace Management Guide',
      slug: 'workspace-management',
      category: 'user-guide',
      order: 10,
      isPublished: true,
      content: `# Workspace Management Guide

Complete guide to creating and managing workspaces.

## What is a Workspace?

A workspace is a container for your projects, teams, and resources.

## Creating a Workspace

1. Click "+ New Workspace"
2. Enter workspace name
3. Add description
4. Invite team members

## Workspace Settings

- General settings
- Member permissions
- Billing and plans
- Integrations

## Best Practices

- One workspace per team/department
- Clear naming conventions
- Regular permission audits
- Archive inactive workspaces`
    },
    {
      title: 'Calendar & Scheduling',
      slug: 'calendar-scheduling',
      category: 'user-guide',
      order: 11,
      isPublished: true,
      content: `# Calendar & Scheduling

Manage your schedule and deadlines with SARTTHI Calendar.

## Overview

The Calendar feature helps you visualize tasks, deadlines, and events.

## Features

### Task Calendar
- View all tasks by due date
- Drag and drop to reschedule
- Color-coded by project

### Event Scheduling
- Create meetings and events
- Send invitations
- Set reminders

### Integration
- Sync with Google Calendar
- Sync with Outlook
- Export to iCal

## Best Practices

- Set realistic deadlines
- Use recurring events
- Enable notifications
- Review weekly schedule`
    },
    {
      title: 'Vault & File Storage',
      slug: 'vault-file-storage',
      category: 'user-guide',
      order: 12,
      isPublished: true,
      content: `# Vault & File Storage

Secure file storage and management in SARTTHI.

## Overview

Vault provides secure storage for all your project files and documents.

## Features

### File Upload
- Drag and drop upload
- Multiple file types supported
- Automatic organization

### Version Control
- Track file versions
- Restore previous versions
- Compare changes

### Sharing
- Share with team members
- Set permissions
- Generate share links

## Security

- End-to-end encryption
- Access controls
- Audit logs

## Best Practices

- Organize with folders
- Use descriptive names
- Regular backups
- Clean up old files`
    },
    {
      title: 'Reports & Analytics',
      slug: 'reports-analytics',
      category: 'user-guide',
      order: 13,
      isPublished: true,
      content: `# Reports & Analytics

Generate insights with SARTTHI's reporting and analytics features.

## Overview

Track progress, measure performance, and make data-driven decisions.

## Report Types

### Project Reports
- Progress tracking
- Task completion rates
- Timeline analysis

### Team Reports
- Member productivity
- Workload distribution
- Collaboration metrics

### Custom Reports
- Build custom dashboards
- Export to PDF/Excel
- Schedule automated reports

## Analytics

### Key Metrics
- Project velocity
- Burn-down charts
- Resource utilization

## Best Practices

- Review reports weekly
- Share with stakeholders
- Track trends over time
- Act on insights`
    },
    {
      title: 'Attendance & Payroll Management',
      slug: 'attendance-payroll',
      category: 'user-guide',
      order: 14,
      isPublished: true,
      content: `# Attendance & Payroll Management

Manage team attendance and payroll efficiently.

## Attendance Tracking

### Clock In/Out
- Simple clock in/out system
- Location tracking (optional)
- Break time tracking

### Leave Management
- Request time off
- Approve/reject requests
- Leave balance tracking

## Payroll Features

### Salary Management
- Set salary structures
- Track hours worked
- Calculate overtime

### Payment Processing
- Generate payslips
- Track payments
- Tax calculations

## Reports

- Attendance reports
- Payroll summaries
- Export to accounting software

## Best Practices

- Regular attendance reviews
- Clear leave policies
- Automated reminders
- Secure data handling`
    },
    {
      title: 'Role-Based Access Control (RBAC)',
      slug: 'rbac',
      category: 'user-guide',
      order: 15,
      isPublished: true,
      content: `# Role-Based Access Control (RBAC)

Manage permissions and access control in SARTTHI.

## Overview

RBAC ensures team members have appropriate access to resources.

## Default Roles

### Owner
- Full system access
- Billing management
- User management

### Admin
- Project management
- Team management
- Settings access

### Member
- Create and edit tasks
- View projects
- Collaborate with team

### Viewer
- Read-only access
- View projects and tasks
- No editing permissions

## Custom Roles

Create custom roles with specific permissions:
- Project access
- Feature access
- Data access

## Best Practices

- Principle of least privilege
- Regular permission audits
- Document role definitions
- Review access quarterly

## Security

- Two-factor authentication
- Session management
- Activity logging`
    }
  ];

  const handleImport = async () => {
    setImporting(true);
    setResults([]);
    const importResults: { title: string; success: boolean; error?: string }[] = [];

    for (const article of mockArticles) {
      try {
        await documentationService.createDoc(article);
        importResults.push({ title: article.title, success: true });
      } catch (error: any) {
        importResults.push({
          title: article.title,
          success: false,
          error: error.response?.data?.message || error.message
        });
      }
    }

    setResults(importResults);
    setImporting(false);

    const successCount = importResults.filter(r => r.success).length;
    if (successCount === mockArticles.length) {
      addToast(`Successfully imported all ${successCount} articles!`, 'success');
    } else {
      addToast(`Imported ${successCount} of ${mockArticles.length} articles`, 'warning');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <Upload className="w-16 h-16 mx-auto mb-4 text-blue-600" />
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Import Documentation Articles
            </h2>
            <p className="text-gray-600">
              Import all {mockArticles.length} articles from the Docs page into the database
            </p>
          </div>

          <div className="mb-8 p-6 bg-blue-50 rounded-xl">
            <h3 className="font-semibold text-blue-900 mb-3">Articles to Import:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-blue-800">
              {mockArticles.map((article, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="text-blue-600">•</span>
                  <span>{article.title}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleImport}
            disabled={importing}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mb-6"
          >
            {importing ? (
              <>
                <Loader className="w-6 h-6 animate-spin" />
                Importing {mockArticles.length} Articles...
              </>
            ) : (
              <>
                <Upload className="w-6 h-6" />
                Import All {mockArticles.length} Articles
              </>
            )}
          </button>

          {results.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold text-lg mb-4">Import Results:</h3>
              <div className="max-h-96 overflow-y-auto space-y-2">
                {results.map((result, index) => (
                  <div
                    key={index}
                    className={`flex items-center gap-3 p-3 rounded-lg ${
                      result.success ? 'bg-green-50' : 'bg-red-50'
                    }`}
                  >
                    {result.success ? (
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <p className={`font-medium ${result.success ? 'text-green-900' : 'text-red-900'}`}>
                        {result.title}
                      </p>
                      {result.error && (
                        <p className="text-sm text-red-600 mt-1">{result.error}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 p-4 bg-amber-50 rounded-lg border border-amber-200">
            <h4 className="font-semibold text-amber-900 mb-2">📝 Note:</h4>
            <ul className="text-sm text-amber-800 space-y-1">
              <li>• This will create {mockArticles.length} documentation articles with basic content</li>
              <li>• You can edit and enhance each article after import</li>
              <li>• Existing articles with the same slug will not be duplicated</li>
              <li>• All articles will be published and visible immediately</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDocsImport;
