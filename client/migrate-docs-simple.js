// Documentation Migration Script
// This script extracts articles from Docs.tsx and creates them in the database

const axios = require('axios');

const API_URL = 'http://localhost:5000/api/documentation';

// Get admin token (you'll need to set this)
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'YOUR_ADMIN_TOKEN_HERE';

const articles = [
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

Learn how to set up and manage your first project in SARTTHI.

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

### 3. Assign Team Members

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
  }
];

async function migrateArticles() {
  console.log('🚀 Starting documentation migration...\n');
  
  for (const article of articles) {
    try {
      console.log(`📝 Creating: ${article.title}...`);
      
      const response = await axios.post(API_URL, article, {
        headers: {
          'Authorization': `Bearer ${ADMIN_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`✅ Created: ${article.title}`);
    } catch (error) {
      console.error(`❌ Failed to create ${article.title}:`, error.response?.data || error.message);
    }
  }
  
  console.log('\n✨ Migration complete!');
}

// Run migration
migrateArticles();
