import axios, { AxiosInstance } from 'axios';

interface EmailMessage {
    to: string[];
    cc?: string[];
    bcc?: string[];
    subject: string;
    body: string; // HTML content
    attachments?: {
        filename: string;
        content: string; // Base64 or URL
        contentType: string;
    }[];
}

interface SarttHiMailConfig {
    baseUrl: string;
    apiKey: string;
    fromAddress: string;
}

class SarttHiMailService {
    private client: AxiosInstance;
    private config: SarttHiMailConfig;

    constructor(config: SarttHiMailConfig) {
        this.config = config;
        this.client = axios.create({
            baseURL: config.baseUrl,
            headers: {
                'Authorization': `Bearer ${config.apiKey}`,
                'Content-Type': 'application/json'
            }
        });
    }

    /**
     * Send an email
     */
    async sendEmail(message: EmailMessage): Promise<boolean> {
        try {
            const payload = {
                from: this.config.fromAddress,
                ...message
            };

            // TODO: Replace with actual Sartthi Mail API endpoint
            // await this.client.post('/send', payload);

            console.log('[Sartthi Mail] Would send email:', {
                to: message.to,
                subject: message.subject,
                from: this.config.fromAddress
            });

            return true;
        } catch (error) {
            console.error('[Sartthi Mail] Error sending email:', error);
            return false;
        }
    }

    /**
     * Send task assignment notification
     */
    async sendTaskAssignmentNotification(task: any, assigneeEmail: string): Promise<boolean> {
        const subject = `New Task Assigned: ${task.title}`;
        const body = `
      <h1>New Task Assigned</h1>
      <p>You have been assigned to the task: <strong>${task.title}</strong></p>
      <p>Description: ${task.description || 'No description provided'}</p>
      <p>Due Date: ${task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}</p>
      <p>Priority: ${task.priority}</p>
      <br>
      <a href="${process.env.CLIENT_URL}/tasks/${task._id}">View Task</a>
    `;

        return this.sendEmail({
            to: [assigneeEmail],
            subject,
            body
        });
    }

    /**
     * Send workspace invitation
     */
    async sendWorkspaceInvitation(workspace: any, inviteeEmail: string, inviteLink: string): Promise<boolean> {
        const subject = `Invitation to join workspace: ${workspace.name}`;
        const body = `
      <h1>Workspace Invitation</h1>
      <p>You have been invited to join the workspace <strong>${workspace.name}</strong> on Sartthi.</p>
      <br>
      <a href="${inviteLink}">Accept Invitation</a>
    `;

        return this.sendEmail({
            to: [inviteeEmail],
            subject,
            body
        });
    }

    /**
     * Send project creation notification
     */
    async sendProjectCreationNotification(project: any, teamEmails: string[]): Promise<boolean> {
        if (!teamEmails.length) return true;

        const subject = `New Project Created: ${project.name}`;
        const body = `
      <h1>New Project Created</h1>
      <p>A new project <strong>${project.name}</strong> has been created.</p>
      <p>Description: ${project.description || 'No description provided'}</p>
      <p>Start Date: ${project.startDate ? new Date(project.startDate).toLocaleDateString() : 'Not set'}</p>
      <br>
      <a href="${process.env.CLIENT_URL}/projects/${project._id}">View Project</a>
    `;

        return this.sendEmail({
            to: teamEmails,
            subject,
            body
        });
    }
    /**
     * Get user's emails
     */
    async getEmails(folder: string = 'inbox', limit: number = 20): Promise<any[]> {
        try {
            // TODO: Replace with actual API call
            // const response = await this.client.get('/messages', {
            //   params: { folder, limit }
            // });
            // return response.data;

            console.log('[Sartthi Mail] Would fetch emails for folder:', folder);
            return [];
        } catch (error) {
            console.error('[Sartthi Mail] Error fetching emails:', error);
            return [];
        }
    }
}

// Singleton instance
let mailServiceInstance: SarttHiMailService | null = null;

export const initializeMailService = (config: SarttHiMailConfig) => {
    mailServiceInstance = new SarttHiMailService(config);
    return mailServiceInstance;
};

export const getMailService = (): SarttHiMailService | null => {
    return mailServiceInstance;
};

export default SarttHiMailService;
