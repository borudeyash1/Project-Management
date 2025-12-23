import { PageContext, WorkspaceSubPage, ProjectSubPage, UserRole } from './contextAnalyzerService';

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
        } else {
            return this.generateProjectPrompt(
                context.subPage as ProjectSubPage,
                context.userRole,
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

    // ==================== WORKSPACE PROMPTS ====================

    private workspaceOverviewPrompt(role: UserRole, data: any): PromptTemplate {
        const roleContext = this.getRoleContext(role);

        return {
            systemPrompt: `You are analyzing a workspace overview page. ${roleContext}`,
            userPrompt: `
Workspace: ${data.workspaceName}
Members: ${data.memberCount}
Active Projects: ${data.activeProjects || 0}
Attendance Rate: ${data.attendanceRate || 0}%

Provide a brief summary (2-3 sentences) highlighting:
1. Overall workspace health
2. Key metrics and trends
3. ${role === 'owner' || role === 'admin' ? 'Strategic recommendations' : 'Team collaboration status'}
`,
            focusAreas: ['workspace health', 'team metrics', 'recommendations']
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
        } else {
            return this.getProjectQuestions(subPage as ProjectSubPage, userRole);
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
            inbox: ['What needs immediate response?', 'Who should I follow up with?', 'What are the priorities?']
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
            documents: ['What documents are missing?', 'What needs review?', 'How is documentation quality?']
        };

        return questions[subPage] || ['What insights can you provide?'];
    }
}

export const aiPromptTemplatesService = new AIPromptTemplatesService();
export default aiPromptTemplatesService;
