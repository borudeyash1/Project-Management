import { PageContext, WorkspaceSubPage, ProjectSubPage, UserRole, GlobalPage } from './contextAnalyzerService';

/**
 * AI Prompt Templates Service
 * Generates role-based, context-aware prompts for AI analysis
 */

interface PromptTemplate {
    systemPrompt: string;
    userPrompt: string;
    focusAreas: string[];
}

class AIPromptTemplatesService {
    /**
     * Generate prompt for context analysis
     */
    generateContextPrompt(context: PageContext, data: any): PromptTemplate {
        if (context.pageType === 'workspace') {
            return this.generateWorkspacePrompt(
                context.subPage as WorkspaceSubPage,
                context.userRole,
                data
            );
        } else if (context.pageType === 'project') {
            return this.generateProjectPrompt(
                context.subPage as ProjectSubPage,
                context.userRole,
                data
            );
        } else {
            return this.generateGlobalPrompt(
                context.subPage as any,
                data
            );
        }
    }

    /**
     * Generate workspace-specific prompts
     */
    private generateWorkspacePrompt(
        subPage: WorkspaceSubPage,
        role: UserRole,
        data: any
    ): PromptTemplate {
        const baseSystem = `You are an AI assistant for a project management workspace. Provide concise, actionable insights.`;

        switch (subPage) {
            case 'overview':
                return this.workspaceOverviewPrompt(role, data);
            case 'members':
                return this.workspaceMembersPrompt(role, data);
            case 'attendance':
                return this.workspaceAttendancePrompt(role, data);
            case 'projects':
                return this.workspaceProjectsPrompt(role, data);
            case 'profile':
                return this.workspaceProfilePrompt(role, data);
            case 'inbox':
                return this.workspaceInboxPrompt(role, data);
            default:
                return {
                    systemPrompt: baseSystem,
                    userPrompt: `Analyze this workspace data: ${JSON.stringify(data)}`,
                    focusAreas: ['general insights']
                };
        }
    }

    /**
     * Generate project-specific prompts
     */
    private generateProjectPrompt(
        subPage: ProjectSubPage,
        role: UserRole,
        data: any
    ): PromptTemplate {
        const baseSystem = `You are an AI assistant for project management. Provide concise, actionable insights.`;

        switch (subPage) {
            case 'overview':
                return this.projectOverviewPrompt(role, data);
            case 'info':
                return this.projectInfoPrompt(role, data);
            case 'team':
                return this.projectTeamPrompt(role, data);
            case 'tasks':
                return this.projectTasksPrompt(role, data);
            case 'workload':
                return this.projectWorkloadPrompt(role, data);
            case 'progress':
                return this.projectProgressPrompt(role, data);
            case 'timeline':
                return this.projectTimelinePrompt(role, data);
            case 'reports':
                return this.projectReportsPrompt(role, data);
            default:
                return {
                    systemPrompt: baseSystem,
                    userPrompt: `Analyze this project data: ${JSON.stringify(data)}`,
                    focusAreas: ['general insights']
                };
        }
    }


    /**
     * Generate global/app-wide prompts
     */
    private generateGlobalPrompt(
        subPage: GlobalPage,
        data: any
    ): PromptTemplate {
        const baseSystem = `You are an AI assistant for personal productivity. Provide concise, actionable insights.`;

        switch (subPage) {
            case 'planner':
                return this.globalPlannerPrompt(data);
            case 'notifications':
                return this.globalNotificationsPrompt(data);
            case 'reminders':
                return this.globalRemindersPrompt(data);
            case 'goals':
                return this.globalGoalsPrompt(data);
            case 'settings':
            case 'profile':
                return this.globalProfilePrompt(data);
            case 'reports':
                return this.globalReportsPrompt(data);
            case 'calendar':
                return this.globalCalendarPrompt(data);
            case 'home':
                return this.globalHomePrompt(data);
            case 'projects':
                return this.globalProjectsPrompt(data);
            case 'workspace':
                return this.globalWorkspacePrompt(data);
            case 'notes':
                return this.globalNotesPrompt(data);
            default:
                return {
                    systemPrompt: baseSystem,
                    userPrompt: `Analyze this data: ${JSON.stringify(data)}`,
                    focusAreas: ['general insights']
                };
        }
    }

    // ==================== WORKSPACE PROMPTS ====================

    private workspaceOverviewPrompt(role: UserRole, data: any): PromptTemplate {
        const roleContext = this.getRoleContext(role);

        // Serialize detailed data for the prompt context
        const membersList = data.detailedMembers
            ? data.detailedMembers.map((m: any) => `- ${m.name} (${m.role}): Currently ${m.attendance}`).join('\n')
            : 'Detailed member data not available';

        const currentUserInfo = data.currentUser
            ? `You are talking to: ${data.currentUser.name} (Role: ${data.currentUser.role}, Designation: ${data.currentUser.designation})`
            : 'User profile not identified';

        const projectsList = data.projects
            ? data.projects.map((p: any) => `- ${p.name}: Status ${p.status}, Lead: ${p.lead}, Due: ${p.dueDate}, Progress: ${p.progress}%`).join('\n')
            : 'Active project data not available';

        return {
            systemPrompt: `You are an intelligent AI assistant for a project management workspace.
${roleContext}

**TRAINING INSTRUCTIONS**:
1. **Deep Context Awareness**: You have complete access to the specific Member List and Attendance data below. USE IT.
   - If asked "Who is absent?", look at the list and name them.
   - If asked "What is my role?", look at the "You are talking to" section.
2. **Chain of Thought**: Before answering, scan the provided data explicitly.
3. **Format**: Provide clean, direct text. **DO NOT** use markdown bolding (**text**) or italics (*text*) in your output.
4. **Tone**: Professional, helpful, and concise.

**FEW-SHOT EXAMPLES**:
- User: "Who is absent today?"
  AI: John Doe and Jane Smith are absent today.
- User: "What is my role?"
  AI: You are the Workspace Owner.
- User: "How are the projects doing?"
  AI: We have 3 active projects. The 'Website Redesign' is 60% done but currently 'planning'.
- User: "Give me a summary."
  AI: The workspace is active with 85% attendance. 3 members are working from home. There are 5 active projects.

**DATA CONTEXT**:
${currentUserInfo}

**MEMBER LIST & ATTENDANCE STATUS**:
${membersList}

**ACTIVE PROJECTS SUMMARY**:
${projectsList}
`,
            userPrompt: `
Analyze the following Workspace Overview data:
- Workspace Name: ${data.workspaceName}
- Total Members: ${data.stats?.totalMembers || data.memberCount}
- Active Projects: ${data.stats?.activeProjects || data.activeProjects || 0}
- Attendance Rate: ${data.stats?.attendanceRate || data.attendanceRate || 0}%
- Present Today: ${data.stats?.presentCount || 'N/A'}
- WFH Today: ${data.stats?.wfhCount || 'N/A'}
- Absent Today: ${data.stats?.absentCount || 'N/A'}

Provide a smart, context-aware summary (3-4 sentences) highlighting:
1. Real-time Attendance (mention specific numbers of who is present/absent)
2. Project Activity overview
3. A strategic insight based on your role as ${role}.
`,
            focusAreas: ['attendance analysis', 'team tracking', 'strategic insights']
        };
    }

    private workspaceMembersPrompt(role: UserRole, data: any): PromptTemplate {
        const canManage = ['owner', 'admin', 'manager'].includes(role);

        return {
            systemPrompt: `You are analyzing workspace team members. ${canManage ? 'Focus on team optimization.' : 'Focus on collaboration opportunities.'}`,
            userPrompt: `
Total Members: ${data.totalMembers}
Role Distribution: ${JSON.stringify(data.roleDistribution || {})}
Active Members: ${data.activeMembers}

${canManage ?
                    'Suggest: 1) Team structure optimization 2) Role balance 3) Potential gaps' :
                    'Suggest: 1) Collaboration opportunities 2) Team dynamics 3) Communication tips'}
`,
            focusAreas: canManage ? ['team structure', 'role balance'] : ['collaboration', 'communication']
        };
    }

    private workspaceAttendancePrompt(role: UserRole, data: any): PromptTemplate {
        const canManage = ['owner', 'admin', 'manager'].includes(role);

        return {
            systemPrompt: `You are analyzing workspace attendance. ${canManage ? 'Identify patterns and issues.' : 'Provide personal insights.'}`,
            userPrompt: `
Attendance Rate: ${data.attendanceRate}%
Present Today: ${data.presentToday}
Absent Members: ${data.absentMembers?.length || 0}
Trend: ${data.trends || 'stable'}

${canManage ?
                    'Analyze: 1) Attendance patterns 2) Potential issues 3) Improvement suggestions' :
                    'Provide: 1) Team availability 2) Collaboration timing 3) Personal attendance tips'}
`,
            focusAreas: canManage ? ['attendance patterns', 'issues'] : ['team availability']
        };
    }

    private workspaceProjectsPrompt(role: UserRole, data: any): PromptTemplate {
        const canManage = ['owner', 'admin', 'manager'].includes(role);

        return {
            systemPrompt: `You are analyzing workspace projects. ${canManage ? 'Focus on portfolio health.' : 'Focus on project opportunities.'}`,
            userPrompt: `
Total Projects: ${data.totalProjects}
Status Distribution: ${JSON.stringify(data.statusDistribution || {})}
At-Risk Projects: ${data.atRiskProjects?.length || 0}

${canManage ?
                    'Provide: 1) Portfolio health assessment 2) At-risk project analysis 3) Resource allocation suggestions' :
                    'Provide: 1) Project opportunities 2) Collaboration possibilities 3) Skill development areas'}
`,
            focusAreas: canManage ? ['portfolio health', 'risk analysis'] : ['opportunities']
        };
    }

    private workspaceProfilePrompt(role: UserRole, data: any): PromptTemplate {
        return {
            systemPrompt: `You are analyzing workspace settings and configuration.`,
            userPrompt: `
Workspace: ${data.workspaceName}
Subscription: ${data.subscription}
Members: ${data.memberCount}

Suggest: 1) Configuration optimizations 2) Feature utilization 3) Upgrade recommendations (if applicable)
`,
            focusAreas: ['configuration', 'optimization']
        };
    }

    private workspaceInboxPrompt(role: UserRole, data: any): PromptTemplate {
        return {
            systemPrompt: `You are analyzing workspace communication and inbox.`,
            userPrompt: `
Unread Messages: ${data.unreadCount}
Active Threads: ${data.activeThreads}

Suggest: 1) Communication priorities 2) Response recommendations 3) Collaboration opportunities
`,
            focusAreas: ['communication', 'priorities']
        };
    }

    // ==================== PROJECT PROMPTS ====================

    private projectOverviewPrompt(role: UserRole, data: any): PromptTemplate {
        const isManager = ['owner', 'manager', 'project-manager'].includes(role);

        return {
            systemPrompt: `You are analyzing a project overview. ${isManager ? 'Focus on project health and team performance.' : 'Focus on task completion and collaboration.'}`,
            userPrompt: `
Project: ${data.projectName}
Status: ${data.status}
Progress: ${data.progress}%
Team Size: ${data.teamSize}

${isManager ?
                    'Provide: 1) Project health assessment 2) Progress analysis 3) Risk identification 4) Team performance insights' :
                    'Provide: 1) Your task priorities 2) Collaboration opportunities 3) Contribution suggestions'}
`,
            focusAreas: isManager ? ['project health', 'team performance'] : ['task priorities', 'collaboration']
        };
    }

    private projectInfoPrompt(role: UserRole, data: any): PromptTemplate {
        return {
            systemPrompt: `You are analyzing project information and configuration.`,
            userPrompt: `
Project: ${data.projectName}
Status: ${data.status}
Priority: ${data.priority}
Budget: ${data.budget?.amount || 'N/A'} ${data.budget?.currency || ''}
Due Date: ${data.dueDate || 'Not set'}
Progress: ${data.progress}%

Analyze: 1) Project setup quality 2) Budget vs progress alignment 3) Timeline feasibility 4) Recommendations
`,
            focusAreas: ['project setup', 'budget alignment', 'timeline']
        };
    }

    private projectTeamPrompt(role: UserRole, data: any): PromptTemplate {
        const isManager = ['owner', 'manager', 'project-manager'].includes(role);

        return {
            systemPrompt: `You are analyzing project team composition. ${isManager ? 'Focus on team optimization.' : 'Focus on collaboration.'}`,
            userPrompt: `
Team Size: ${data.teamSize}
Role Distribution: ${JSON.stringify(data.roleDistribution || {})}

${isManager ?
                    'Suggest: 1) Team structure optimization 2) Skill gap analysis 3) Role balance recommendations' :
                    'Suggest: 1) Collaboration opportunities 2) Skill sharing 3) Team dynamics'}
`,
            focusAreas: isManager ? ['team optimization', 'skill gaps'] : ['collaboration']
        };
    }

    private projectTasksPrompt(role: UserRole, data: any): PromptTemplate {
        const isManager = ['owner', 'manager', 'project-manager'].includes(role);

        return {
            systemPrompt: `You are analyzing project tasks. ${isManager ? 'Focus on task distribution and blockers.' : 'Focus on personal task management.'}`,
            userPrompt: `
Total Tasks: ${data.totalTasks}
Status Distribution: ${JSON.stringify(data.statusDistribution || {})}
Blocked Tasks: ${data.blockedTasks?.length || 0}
Upcoming Deadlines: ${data.upcomingDeadlines?.length || 0}

${isManager ?
                    'Analyze: 1) Task distribution efficiency 2) Blocker resolution 3) Deadline risks 4) Sprint health' :
                    'Suggest: 1) Your next task priority 2) Collaboration needs 3) Deadline management'}
`,
            focusAreas: isManager ? ['task distribution', 'blockers'] : ['personal priorities']
        };
    }

    private projectWorkloadPrompt(role: UserRole, data: any): PromptTemplate {
        const isManager = ['owner', 'manager', 'project-manager'].includes(role);

        if (!isManager) {
            // Members see their own workload
            return {
                systemPrompt: `You are analyzing your personal workload.`,
                userPrompt: `
Your Workload: ${JSON.stringify(data.teamWorkload?.find((w: any) => w.isCurrentUser) || {})}

Suggest: 1) Task prioritization 2) Time management 3) Help requests
`,
                focusAreas: ['personal workload', 'time management']
            };
        }

        // Managers see team workload - CRITICAL FEATURE
        return {
            systemPrompt: `You are a project manager analyzing team workload distribution. Provide actionable recommendations for workload balancing.`,
            userPrompt: `
Team Workload Distribution:
${data.teamWorkload?.map((w: any) =>
                `- ${w.name} (${w.role}): ${w.assignedTasks} tasks (capacity: ${w.capacity}, utilization: ${w.utilizationRate}%)`
            ).join('\n') || 'No data'}

Overloaded Members:
${data.overloadedMembers?.map((w: any) =>
                `- ${w.name}: ${w.assignedTasks} tasks (${w.excess} over capacity)`
            ).join('\n') || 'None'}

Available Capacity:
${data.availableCapacity?.map((w: any) =>
                `- ${w.name}: ${w.available} tasks available`
            ).join('\n') || 'None'}

As a project manager, provide:
1. **Workload Balance Assessment**: Is the team balanced? Who is overloaded/underutilized?
2. **Task Redistribution Suggestions**: Specific tasks to move from overloaded to available members
3. **Capacity Optimization**: How to better utilize team capacity
4. **Risk Identification**: Burnout risks, bottlenecks, or capacity issues
5. **Action Plan**: 3-5 specific actions to improve workload distribution

Be specific with names and numbers.
`,
            focusAreas: ['workload balance', 'task redistribution', 'capacity optimization', 'risk identification']
        };
    }

    private projectProgressPrompt(role: UserRole, data: any): PromptTemplate {
        return {
            systemPrompt: `You are analyzing project progress and velocity.`,
            userPrompt: `
Completion Rate: ${data.completionRate}%
Velocity: ${data.velocity}
Milestones: ${data.milestones?.length || 0}
Trend: ${data.trends || 'stable'}

Analyze: 1) Progress health 2) Velocity trends 3) Milestone status 4) Acceleration opportunities
`,
            focusAreas: ['progress health', 'velocity', 'milestones']
        };
    }

    private projectTimelinePrompt(role: UserRole, data: any): PromptTemplate {
        return {
            systemPrompt: `You are analyzing project timeline and deadlines.`,
            userPrompt: `
Total Milestones: ${data.milestones}
Upcoming Deadlines: ${data.upcomingDeadlines?.length || 0}
Delays: ${data.delays?.length || 0}

Analyze: 1) Timeline health 2) Deadline risks 3) Delay impact 4) Schedule optimization
`,
            focusAreas: ['timeline health', 'deadline risks']
        };
    }

    private projectReportsPrompt(role: UserRole, data: any): PromptTemplate {
        return {
            systemPrompt: `You are analyzing project performance metrics and reports.`,
            userPrompt: `
Performance Metrics: ${JSON.stringify(data.performanceMetrics || {})}
Trends: ${JSON.stringify(data.trends || {})}

Provide: 1) Performance summary 2) Trend analysis 3) Improvement areas 4) Success factors
`,
            focusAreas: ['performance', 'trends', 'improvements']
        };
    }

    // ==================== GLOBAL PROMPTS ====================

    private globalPlannerPrompt(data: any): PromptTemplate {
        const tasks = data.tasks || {};
        const events = data.events || {};
        const reminders = data.reminders || {};
        const goals = data.goals || {};
        const timeAnalysis = data.timeAnalysis || {};
        const integrations = data.integrations || {};

        return {
            systemPrompt: `You are an intelligent personal planner assistant. Analyze the user's schedule, tasks (local & external), events, reminders, and goals. Provide actionable daily planning insights, unifying work from Jira, Linear, Slack, and Sartthi.`,
            userPrompt: `
**Today's Schedule:**
- Tasks Due: ${tasks.today?.length || 0} (${tasks.today?.map((t: any) => `${t.title} at ${t.due}`).join(', ') || 'None'})
- Events: ${events.today?.length || 0} (${events.today?.map((e: any) => `${e.title} at ${e.start}`).join(', ') || 'None'})
- Reminders: ${reminders.active?.length || 0} active

**External Workload (Integrations):**
- Jira: ${integrations.jira?.total || 0} active issues (${integrations.jira?.issues?.map((i: any) => `${i.key}`).join(', ') || 'None'})
- Linear: ${integrations.linear?.total || 0} active issues (${integrations.linear?.issues?.map((i: any) => `${i.id}`).join(', ') || 'None'})
- Slack: ${integrations.slack?.total || 0} tasks from Slack

**This Week:**
- Tasks: ${tasks.thisWeek?.length || 0} pending
- Events: ${events.thisWeek?.length || 0} scheduled
- Overdue Items: ${timeAnalysis.overdueCount || 0} tasks${reminders.overdue?.length ? ` + ${reminders.overdue.length} reminders` : ''}

**Your Goals:**
- Short-term: ${goals.shortTerm?.join(', ') || 'None set'}
- Long-term: ${goals.longTerm?.join(', ') || 'None set'}

**Busy Hours Today:** ${timeAnalysis.busyHours?.join(', ') || 'No events scheduled'}

Provide:
1. **Unified Morning Briefing**: Summary of work across ALL platforms (Sartthi, Jira, Linear, Slack).
2. **Time Blocking**: Suggest when to work on tasks (prioritize urgent integration issues + local tasks).
3. **Goal Check**: Which tasks align with my goals?
4. **Energy Management**: High-focus vs low-energy suggestions.
`,
            focusAreas: ['unified planning', 'cross-platform prioritization', 'time management']
        };
    }

    private globalNotificationsPrompt(data: any): PromptTemplate {
        return {
            systemPrompt: `You are an intelligent notification assistant. Help the user prioritize their attention.`,
            userPrompt: `
Unread Notifications (${data.unreadCount}):
${data.latest?.map((n: any) => `- [${n.type}] ${n.message} (${n.time})`).join('\n') || 'No unread notifications.'}

Provide:
1. **Urgent Action**: Is there anything requiring immediate response? (Look for 'alert', 'error', 'urgent').
2. **Summary**: A one-sentence summary of the activity found.
`,
            focusAreas: ['urgent items', 'notification summary']
        };
    }

    private globalRemindersPrompt(data: any): PromptTemplate {
        return {
            systemPrompt: `You are a deadline assistant. ensure the user is one step ahead.`,
            userPrompt: `
Upcoming Deadlines:
${data.upcomingDeadlines?.map((t: any) => `- ${t.title} (${t.date}, Priority: ${t.priority})`).join('\n') || 'No upcoming deadlines.'}

Provide:
1. **Critical Deadlines**: Any high priority items due soon?
2. **Next Action**: What should be started today to meet these?
`,
            focusAreas: ['deadlines', 'preparation']
        };
    }

    private globalGoalsPrompt(data: any): PromptTemplate {
        return {
            systemPrompt: `You are a career and goal coach. Monitor progress and keep the user on track.`,
            userPrompt: `
Short Term Goals: ${JSON.stringify(data.shortTerm)}
Long Term Goals: ${JSON.stringify(data.longTerm)}

Provide:
1. **Focus Check**: Are current activities aligned with these goals?
2. **Motivation**: A brief encouraging insight based on these aspirations.
`,
            focusAreas: ['goal progress', 'motivation']
        };
    }

    private globalProfilePrompt(data: any): PromptTemplate {
        return {
            systemPrompt: `You are an account settings assistant.`,
            userPrompt: `
User: ${data.name} (${data.email})
Plan: ${data.plan}
Preferences: ${JSON.stringify(data.preferences)}

Suggest: 1) Account security 2) Plan utilization 3) Preference optimization
`,
            focusAreas: ['account settings', 'preferences']
        };
    }

    private globalReportsPrompt(data: any): PromptTemplate {
        return {
            systemPrompt: `You are a personal productivity analyst. Analyze real performance metrics.`,
            userPrompt: `
Performance Data:
- tasks Completed (Last 7 Days): ${data.completedCount}
- Pending Tasks: ${data.pendingCount}
- Productivity Score: ${data.productivityScore}
- Summary: ${data.summary}

Provide:
1. **Performance Check**: Is the user's velocity (completed count) healthy?
2. **Backlog Analysis**: Is the pending count growing too large?
3. **Recommendation**: One improvement for next week.
`,
            focusAreas: ['productivity analysis', 'performance']
        };
    }

    private globalHomePrompt(data: any): PromptTemplate {
        const dashboard = data.dashboard || {};
        const tasks = dashboard.taskSummary || {};
        const projects = dashboard.projectSummary || {};
        const notifications = dashboard.notifications || {};
        const workspaces = dashboard.workspaces || {};
        const team = dashboard.team || {};
        const goals = dashboard.goals || {};

        return {
            systemPrompt: `You are an intelligent personal productivity dashboard assistant. Analyze the user's complete dashboard state and provide actionable insights to help them start their day efficiently.`,
            userPrompt: `
**Dashboard Overview:**

**Tasks:**
- Pending: ${tasks.totalPending || 0} tasks
- Recent: ${tasks.myTasks?.slice(0, 3).map((t: any) => `${t.title} (${t.priority})`).join(', ') || 'None'}

**Projects:**
- Active: ${projects.projects?.length || 0} projects
- Top Projects: ${projects.projects?.slice(0, 3).map((p: any) => `${p.name} (${p.progress}%)`).join(', ') || 'None'}

**Notifications:**
- Unread: ${notifications.unreadCount || 0}

**Workspaces:**
- Total: ${workspaces.total || 0}
- Active: ${workspaces.list?.map((w: any) => `${w.name} (${w.members} members)`).join(', ') || 'None'}

**Team:**
- Total Collaborators: ${team.totalMembers || 0}

**Goals:**
- Short-term: ${goals.shortTerm?.length || 0} goals
- Long-term: ${goals.longTerm?.length || 0} goals

Provide:
1. **Daily Focus**: What should I prioritize today based on pending tasks and project progress?
2. **Critical Updates**: Any urgent notifications or deadlines I should address?
3. **Quick Wins**: Low-hanging fruit I can complete quickly?
4. **Goal Alignment**: Are my current activities aligned with my goals?
`,
            focusAreas: ['daily focus', 'prioritization', 'goal alignment']
        };
    }

    private globalProjectsPrompt(data: any): PromptTemplate {
        return {
            systemPrompt: `You are a project portfolio manager. Summarize the status of active projects.`,
            userPrompt: `
Active Projects:
${data.projects?.map((p: any) => `- ${p.name}: ${p.status} (${p.progress}%) - Workspace: ${p.workspace || 'N/A'}`).join('\n') || 'None'}

Provide:
1. **Portfolio Status**: A 2-sentence summary of overall progress.
2. **Attention Needed**: Identify any projects with low progress or 'active' status but no movement.
3. **Next Step**: A general recommendation for the portfolio.
`,
            focusAreas: ['portfolio health', 'project oversight']
        };
    }

    private globalWorkspacePrompt(data: any): PromptTemplate {
        return {
            systemPrompt: `You are a workspace manager. specific details about the user's workspaces.`,
            userPrompt: `
Workspaces:
${data.workspaces?.map((w: any) => `- ${w.name}: ${w.memberCount} members (${w.plan} Plan)`).join('\n') || 'None'}

Provide:
1. **Workspace Summary**: Brief overview of the active workspaces.
2. **Membership Insight**: Any large teams or solo workspaces?
3. **Quick Action**: A suggestion for managing these workspaces.
`,
            focusAreas: ['workspace management', 'organization']
        };
    }

    private globalNotesPrompt(data: any): PromptTemplate {
        return {
            systemPrompt: `You are an intelligent knowledge assistant. Summarize the content of the user's recent notes.`,
            userPrompt: `
User's Recent Notes (Title - Date - Content Preview):
${data.recentNotes?.map((n: any) => `* **${n.title}** (${n.date}): "${n.preview}"`).join('\n') || 'No recent notes found.'}

Please provide a **Content Summary**:
1. **Key Topics**: What is the user working on or thinking about? (Summarize the themes found in the previews).
2. **Recent Insights**: specific details mentioned (names, tools, ideas).
3. **Consolidated View**: Synthesize these notes into a single cohesive paragraph.

Do NOT give generic "organization tips". Analyze the ACTUAL TEXT provided above.
`,
            focusAreas: ['knowledge summarization', 'key topics']
        };
    }

    private globalCalendarPrompt(data: any): PromptTemplate {
        return {
            systemPrompt: `You are a scheduling assistant. Help the user manage their time effectively.`,
            userPrompt: `
Upcoming Events (Next 7 Days):
${data.upcomingEvents?.map((e: any) => `- ${e.title} (${e.start} - ${e.end})`).join('\n') || 'No upcoming events.'}

Provide:
1. **Schedule Summary**: A quick overview of the week's load.
2. **Conflict Check**: Any overlapping or tight schedules?
3. **Preparation**: Suggestions to prepare for upcoming meetings.
`,
            focusAreas: ['schedule', 'time management']
        };
    }

    // ==================== HELPER METHODS ====================

    private getRoleContext(role: UserRole): string {
        const contexts: Record<string, string> = {
            'owner': 'You are advising the workspace owner. Focus on strategic insights, overall health, and growth opportunities.',
            'admin': 'You are advising an administrator. Focus on operational efficiency and team management.',
            'manager': 'You are advising a manager. Focus on team performance and resource optimization.',
            'project-manager': 'You are advising a project manager. Focus on project delivery and team coordination.',
            'member': 'You are advising a team member. Focus on personal productivity and collaboration.',
            'viewer': 'You are advising a viewer. Provide observational insights.',
            'developer': 'You are advising a developer. Focus on technical tasks and code quality.',
            'designer': 'You are advising a designer. Focus on design tasks and creative collaboration.',
            'tester': 'You are advising a tester. Focus on quality assurance and bug tracking.',
            'analyst': 'You are advising an analyst. Focus on data insights and reporting.',
            'qa-engineer': 'You are advising a QA engineer. Focus on testing and quality metrics.',
            'devops': 'You are advising a DevOps engineer. Focus on deployment and infrastructure.'
        };

        return contexts[role] || 'Provide helpful insights based on the data.';
    }

    /**
     * Generate quick question suggestions based on context
     */
    generateQuickQuestions(context: PageContext): string[] {
        const { pageType, subPage, userRole } = context;

        if (pageType === 'workspace') {
            return this.getWorkspaceQuestions(subPage as WorkspaceSubPage, userRole);
        } else if (pageType === 'project') {
            return this.getProjectQuestions(subPage as ProjectSubPage, userRole);
        } else {
            return this.getGlobalQuestions(subPage as GlobalPage);
        }
    }

    private getWorkspaceQuestions(subPage: WorkspaceSubPage, role: UserRole): string[] {
        const isManager = ['owner', 'admin', 'manager'].includes(role);

        const questions: Record<WorkspaceSubPage, string[]> = {
            overview: isManager ?
                ['How is my team performing?', 'What are the key risks?', 'Which projects need attention?'] :
                ['What should I focus on today?', 'Who can I collaborate with?', 'What are the priorities?'],
            members: isManager ?
                ['Is my team balanced?', 'Do we have skill gaps?', 'Who is underutilized?'] :
                ['Who can help me with X?', 'What are the team strengths?', 'How can I contribute more?'],
            attendance: isManager ?
                ['What are the attendance patterns?', 'Are there any issues?', 'How can we improve?'] :
                ['When is the best time to collaborate?', 'Who is available today?', 'What is the team schedule?'],
            projects: isManager ?
                ['Which projects are at risk?', 'How is the portfolio health?', 'Where should we allocate resources?'] :
                ['Which projects can I join?', 'What are the active projects?', 'Where is my expertise needed?'],
            profile: ['How can we optimize settings?', 'What features are underutilized?', 'Should we upgrade?'],
            clients: ['What are the client priorities?', 'Are there any issues?', 'How is client satisfaction?'],
            inbox: ['What needs immediate response?', 'Who should I follow up with?', 'What are the priorities?'],
            design: ['What are the latest designs?', 'Any feedback on mockups?', 'Design system updates?'],
            jira: ['What are the Jira ticket updates?', 'Any blockers in Jira?', 'Sync status?'],
            notion: ['What are the Notion docs?', 'Any new pages?', 'Workspace updates?'],
            zendesk: ['What are the open tickets?', 'Customer feedback?', 'Support metrics?'],
            slack: ['Any urgent messages?', 'Channel updates?', 'Team announcements?'],
            linear: ['What are the Linear issues?', 'Cycle progress?', 'Bug tracking?']
        };

        return questions[subPage] || ['What insights can you provide?'];
    }

    private getProjectQuestions(subPage: ProjectSubPage, role: UserRole): string[] {
        const isManager = ['owner', 'manager', 'project-manager'].includes(role);

        const questions: Record<ProjectSubPage, string[]> = {
            overview: isManager ?
                ['Is the project on track?', 'What are the risks?', 'How is the team performing?'] :
                ['What should I work on next?', 'Am I on track?', 'Who can I collaborate with?'],
            info: ['Is the project setup optimal?', 'Are we within budget?', 'Is the timeline realistic?'],
            team: isManager ?
                ['Is the team balanced?', 'Do we have skill gaps?', 'How can we optimize?'] :
                ['Who can help me?', 'What are the team strengths?', 'How can I contribute?'],
            tasks: isManager ?
                ['What are the blockers?', 'How is task distribution?', 'What are the deadline risks?'] :
                ['What should I do next?', 'Am I blocked?', 'How can I help others?'],
            workload: isManager ?
                ['Who is overloaded?', 'How can I balance the workload?', 'Who has capacity?'] :
                ['Am I overloaded?', 'Can I take on more?', 'How can I manage my time?'],
            progress: ['Are we on track?', 'What is our velocity?', 'What are the trends?'],
            timeline: ['Are we meeting deadlines?', 'What are the risks?', 'How can we accelerate?'],
            reports: ['What are the key insights?', 'How are we performing?', 'What should we improve?'],
            documents: ['What documents are missing?', 'What needs review?', 'How is documentation quality?'],
            inbox: ['Any project messages?', 'Team updates?', 'Communication status?'],
            design: ['Design progress?', 'Prototype status?', 'Feedback needed?']
        };

        return questions[subPage] || ['What insights can you provide?'];
    }

    private getGlobalQuestions(subPage: GlobalPage): string[] {
        const questions: Record<GlobalPage, string[]> = {
            home: ['What tasks should I focus on today?', 'Are there any urgent deadlines?', 'Summarize my updates.'],
            projects: ['Which projects need attention?', 'What is the overall progress?', 'Show me at-risk projects.'],
            workspace: ['How many active workspaces?', 'Show me invitations.', 'Summarize workspace health.'],
            planner: ['What is my schedule for today?', 'Prioritize my tasks.', 'Do I have conflicts?'],
            notifications: ['What is urgent?', 'Summarize recent notifications.', 'Clear non-urgent items.'],
            reminders: ['What is due soon?', 'Show overdue items.', 'Create a reminder.'],
            goals: ['How am I progressing on goals?', 'What is the next milestone?', 'Suggest a new goal.'],
            settings: ['How can I secure my account?', 'Optimize my preferences.', 'Check subscription status.'],
            profile: ['Update my profile info.', 'Check my activity stats.', 'Improve my profile.'],
            reports: ['Summarize my productivity.', 'What are my peak hours?', 'Show performance trends.'],
            calendar: ['What meetings do I have?', 'Schedule a focus block.', 'Show weekly overview.'],
            notes: ['Summarize my recent notes.', 'Find notes about "Meeting".', 'Organize my ideas.']
        };

        return questions[subPage] || ['What insights can you provide?'];
    }
}

export const aiPromptTemplatesService = new AIPromptTemplatesService();
export default aiPromptTemplatesService;
