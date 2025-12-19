export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  category: string;
  readTime: string;
  date: string;
  author: {
    name: string;
    avatar: string;
    role: string;
  };
}

export const blogPosts: BlogPost[] = [
  {
    id: "remote-team-management",
    title: "10 Project Management Tips for Remote Teams",
    excerpt: "Learn how to effectively manage remote teams with these proven strategies and best practices.",
    image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=500&fit=crop",
    category: "Best Practices",
    readTime: "5 min read",
    date: "Dec 15, 2024",
    author: {
      name: "Priya Sharma",
      avatar: "https://ui-avatars.com/api/?name=Priya+Sharma&background=006397&color=fff",
      role: "Project Manager"
    },
    content: `
# 10 Project Management Tips for Remote Teams

Managing remote teams has become essential in today's digital workplace. Here are 10 proven strategies to help you succeed:

## 1. Establish Clear Communication Channels

Set up dedicated channels for different types of communication. Use Sartthi's built-in chat for quick questions, video calls for important discussions, and project boards for task updates.

## 2. Set Clear Expectations

Define working hours, response times, and deliverables upfront. Make sure every team member knows what's expected of them.

## 3. Use the Right Tools

Leverage project management tools like Sartthi to keep everyone on the same page. Features like task assignment, progress tracking, and file sharing are essential.

## 4. Schedule Regular Check-ins

Daily stand-ups or weekly team meetings help maintain connection and alignment. Keep them short and focused.

## 5. Document Everything

Create a single source of truth for project information. Use Sartthi's documentation features to keep everything organized and accessible.

## 6. Foster Team Culture

Remote doesn't mean isolated. Organize virtual team building activities and celebrate wins together.

## 7. Track Progress, Not Hours

Focus on outcomes rather than time spent online. Use Sartthi's analytics to monitor project progress effectively.

## 8. Provide the Right Resources

Ensure your team has access to all necessary tools, training, and support to do their job effectively.

## 9. Be Flexible

Understand that remote team members may work in different time zones or have varying schedules. Build flexibility into your processes.

## 10. Prioritize Mental Health

Check in on team wellbeing regularly. Encourage breaks and maintain work-life boundaries.

## Conclusion

Managing remote teams successfully requires intentional effort and the right tools. With Sartthi's comprehensive project management features, you can keep your distributed team connected, productive, and engaged.

Ready to transform your remote team management? Start your free trial today!
    `
  },
  {
    id: "ai-project-management",
    title: "The Future of AI in Project Management",
    excerpt: "Discover how artificial intelligence is transforming project management and team collaboration.",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=500&fit=crop",
    category: "Technology",
    readTime: "7 min read",
    date: "Dec 12, 2024",
    author: {
      name: "Rahul Verma",
      avatar: "https://ui-avatars.com/api/?name=Rahul+Verma&background=006397&color=fff",
      role: "Tech Lead"
    },
    content: `
# The Future of AI in Project Management

Artificial Intelligence is revolutionizing how we manage projects. Let's explore the transformative impact of AI on project management.

## AI-Powered Task Scheduling

Sartthi's AI analyzes your team's working patterns, historical data, and project requirements to automatically suggest optimal task schedules. This ensures:

- **Better resource allocation** - AI identifies who's best suited for each task
- **Realistic timelines** - Based on actual team performance data
- **Proactive risk management** - Early warning of potential delays

## Intelligent Insights and Predictions

Our AI doesn't just track progress—it predicts outcomes:

### Predictive Analytics
- Forecast project completion dates with high accuracy
- Identify bottlenecks before they become problems
- Suggest corrective actions automatically

### Smart Recommendations
- AI suggests task priorities based on deadlines and dependencies
- Recommends team members for specific tasks based on skills and availability
- Identifies opportunities for process optimization

## Automated Workflow Optimization

AI continuously learns from your team's work patterns to:

1. **Streamline processes** - Eliminate redundant steps
2. **Optimize workload distribution** - Prevent burnout and underutilization
3. **Improve collaboration** - Suggest optimal team compositions

## Natural Language Processing

Sartthi's AI understands context and can:

- Extract action items from meeting notes
- Categorize and prioritize support tickets
- Generate project summaries automatically

## Real-Time Decision Support

Get AI-powered insights when you need them:

- **Risk assessment** - Real-time project health monitoring
- **Resource planning** - Intelligent capacity forecasting
- **Budget optimization** - Cost prediction and variance analysis

## The Human-AI Partnership

AI doesn't replace project managers—it empowers them:

- **More time for strategy** - Automate routine tasks
- **Data-driven decisions** - Access to actionable insights
- **Enhanced creativity** - Focus on problem-solving, not data crunching

## Getting Started with AI

Sartthi makes AI accessible to teams of all sizes:

1. **Start with basics** - AI-powered task suggestions
2. **Grow gradually** - Enable more AI features as your team adapts
3. **Customize** - Train AI on your specific workflows

## The Road Ahead

The future of project management is intelligent, adaptive, and human-centered. AI will continue to evolve, offering:

- More sophisticated predictive models
- Better natural language understanding
- Deeper integration with business intelligence

## Conclusion

AI in project management isn't science fiction—it's here now. Sartthi's AI features help teams work smarter, deliver faster, and achieve better outcomes.

Experience the future of project management. Try Sartthi's AI-powered features today!
    `
  },
  {
    id: "team-productivity-guide",
    title: "Boosting Team Productivity: A Complete Guide",
    excerpt: "Practical tips and tools to help your team work smarter and achieve more in less time.",
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=500&fit=crop",
    category: "Productivity",
    readTime: "6 min read",
    date: "Dec 10, 2024",
    author: {
      name: "Anjali Patel",
      avatar: "https://ui-avatars.com/api/?name=Anjali+Patel&background=006397&color=fff",
      role: "Productivity Coach"
    },
    content: `
# Boosting Team Productivity: A Complete Guide

Productivity isn't about working harder—it's about working smarter. Here's your complete guide to boosting team productivity.

## Understanding Productivity

True productivity means:
- **Quality over quantity** - Delivering value, not just completing tasks
- **Sustainable pace** - Avoiding burnout while maintaining performance
- **Continuous improvement** - Always looking for better ways to work

## 1. Set Clear Goals and Priorities

### Use the OKR Framework
- **Objectives** - What you want to achieve
- **Key Results** - How you'll measure success
- **Alignment** - Ensure everyone understands their role

### Prioritization Techniques
- **Eisenhower Matrix** - Urgent vs. Important
- **MoSCoW Method** - Must have, Should have, Could have, Won't have
- **Value vs. Effort** - Focus on high-value, low-effort wins first

## 2. Optimize Your Workflow

### Implement Kanban Boards
Sartthi's Kanban boards help visualize work:
- **To Do** - Backlog of tasks
- **In Progress** - Active work
- **Review** - Quality check
- **Done** - Completed work

### Reduce Context Switching
- Batch similar tasks together
- Set dedicated focus time
- Use Sartthi's focus mode to minimize distractions

## 3. Leverage Automation

Automate repetitive tasks:
- **Recurring tasks** - Set up templates
- **Status updates** - Automatic notifications
- **Report generation** - Scheduled analytics
- **Task assignment** - AI-powered suggestions

## 4. Improve Communication

### Best Practices
- **Async-first** - Respect different time zones
- **Clear documentation** - Reduce repeated questions
- **Regular updates** - Keep everyone informed
- **Feedback loops** - Continuous improvement

### Use Sartthi's Collaboration Features
- Real-time chat for quick questions
- Comments on tasks for context
- @mentions for specific attention
- File sharing for easy access

## 5. Track and Measure Performance

### Key Metrics to Monitor
- **Velocity** - Tasks completed per sprint
- **Cycle time** - Time from start to finish
- **Lead time** - Time from request to delivery
- **Quality** - Defect rates and rework

### Use Sartthi's Analytics
- Visual dashboards for quick insights
- Trend analysis for pattern recognition
- Team performance metrics
- Project health indicators

## 6. Manage Energy, Not Just Time

### Peak Performance Times
- Identify when team members are most productive
- Schedule complex tasks during peak hours
- Allow flexibility for personal rhythms

### Encourage Breaks
- Regular short breaks improve focus
- Longer breaks for recovery
- Respect time off for better long-term productivity

## 7. Invest in Skills Development

### Continuous Learning
- Regular training sessions
- Knowledge sharing within team
- Access to learning resources
- Mentorship programs

### Tool Mastery
- Ensure team knows Sartthi's features
- Share tips and tricks
- Create internal best practices

## 8. Eliminate Productivity Blockers

### Common Blockers
- **Unclear requirements** - Define acceptance criteria
- **Too many meetings** - Make them optional when possible
- **Waiting for approvals** - Streamline decision-making
- **Technical debt** - Allocate time for improvements

### Solutions
- Use Sartthi's dependency tracking
- Set up approval workflows
- Create clear escalation paths
- Regular retrospectives

## 9. Foster a Productive Culture

### Team Dynamics
- Psychological safety for innovation
- Recognition and celebration
- Constructive feedback
- Shared ownership

### Leadership Support
- Remove obstacles
- Provide resources
- Trust and autonomy
- Lead by example

## 10. Continuous Improvement

### Regular Retrospectives
- What went well?
- What could be better?
- Action items for next sprint
- Track improvements over time

### Experiment and Iterate
- Try new approaches
- Measure results
- Keep what works
- Discard what doesn't

## Productivity Tools in Sartthi

Sartthi provides everything you need:

### Task Management
- Kanban boards
- Gantt charts
- Calendar views
- Custom workflows

### Collaboration
- Real-time chat
- File sharing
- Comments and mentions
- Video integration

### Analytics
- Performance dashboards
- Custom reports
- Trend analysis
- Predictive insights

### Automation
- Recurring tasks
- Auto-assignments
- Smart notifications
- Workflow triggers

## Measuring Success

Track these indicators:
- **Team satisfaction** - Happy teams are productive teams
- **Delivery consistency** - Meeting commitments
- **Quality metrics** - Fewer defects and rework
- **Innovation rate** - New ideas and improvements

## Conclusion

Boosting team productivity is a journey, not a destination. With the right mindset, processes, and tools like Sartthi, your team can achieve remarkable results while maintaining work-life balance.

Start optimizing your team's productivity today with Sartthi's comprehensive project management platform!
    `
  }
];

export const getBlogPost = (id: string): BlogPost | undefined => {
  return blogPosts.find(post => post.id === id);
};

export const getRecentPosts = (limit: number = 3): BlogPost[] => {
  return blogPosts.slice(0, limit);
};
