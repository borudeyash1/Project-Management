import apiService from './api';

export interface NotionSyncResult {
    success: boolean;
    pageId?: string;
    url?: string;
    message?: string;
}

export interface NotionDatabase {
    id: string;
    title: string;
    url: string;
}

// Helper to convert task to Notion blocks
const taskToNotionBlocks = (task: any): any[] => {
    const blocks: any[] = [];

    // Description
    if (task.description) {
        blocks.push({
            object: 'block',
            type: 'paragraph',
            paragraph: {
                rich_text: [{ type: 'text', text: { content: task.description } }]
            }
        });
    }

    // Add metadata section
    blocks.push({
        object: 'block',
        type: 'heading_3',
        heading_3: {
            rich_text: [{ type: 'text', text: { content: 'Task Details' } }]
        }
    });

    // Task metadata as bulleted list
    const metadata = [
        `Status: ${task.status || 'pending'}`,
        `Priority: ${task.priority || 'medium'}`,
        `Type: ${task.type || 'task'}`,
    ];

    if (task.dueDate) {
        metadata.push(`Due Date: ${new Date(task.dueDate).toLocaleDateString()}`);
    }

    if (task.assignee?.fullName) {
        metadata.push(`Assignee: ${task.assignee.fullName}`);
    }

    metadata.forEach(item => {
        blocks.push({
            object: 'block',
            type: 'bulleted_list_item',
            bulleted_list_item: {
                rich_text: [{ type: 'text', text: { content: item } }]
            }
        });
    });

    // Subtasks
    if (task.subtasks && task.subtasks.length > 0) {
        blocks.push({
            object: 'block',
            type: 'heading_3',
            heading_3: {
                rich_text: [{ type: 'text', text: { content: 'Subtasks' } }]
            }
        });

        task.subtasks.forEach((subtask: any) => {
            blocks.push({
                object: 'block',
                type: 'to_do',
                to_do: {
                    rich_text: [{ type: 'text', text: { content: subtask.title } }],
                    checked: subtask.status === 'completed'
                }
            });
        });
    }

    // Link back to Sartthi
    blocks.push({
        object: 'block',
        type: 'divider',
        divider: {}
    });

    blocks.push({
        object: 'block',
        type: 'paragraph',
        paragraph: {
            rich_text: [
                { type: 'text', text: { content: '🔗 ' } },
                {
                    type: 'text',
                    text: { content: 'View in Sartthi', link: { url: `${window.location.origin}/tasks` } }
                }
            ]
        }
    });

    return blocks;
};

// Task sync properties for Notion database
const getTaskProperties = (task: any, databaseId?: string) => {
    const properties: Record<string, any> = {
        Name: {
            title: [{ text: { content: task.title } }]
        }
    };

    // Only add these if we're creating in a database
    if (databaseId) {
        properties.Status = {
            select: { name: task.status || 'pending' }
        };

        properties.Priority = {
            select: { name: task.priority || 'medium' }
        };

        if (task.dueDate) {
            properties['Due Date'] = {
                date: { start: new Date(task.dueDate).toISOString().split('T')[0] }
            };
        }

        if (task.assignee?.email) {
            properties.Assignee = {
                email: task.assignee.email
            };
        }

        properties['Sartthi Link'] = {
            url: `${window.location.origin}/tasks`
        };
    }

    return properties;
};

export const notionSyncService = {
    // Sync task to Notion
    syncTask: async (taskId: string, task: any, databaseId?: string): Promise<NotionSyncResult> => {
        try {
            const content = taskToNotionBlocks(task);
            const properties = getTaskProperties(task, databaseId);

            const response = await apiService.post('/sartthi/notion/pages', {
                title: task.title,
                content,
                properties,
                parentDatabase: databaseId
            });

            if (response.data?.success) {
                return {
                    success: true,
                    pageId: response.data.data.pageId,
                    url: response.data.data.url
                };
            }

            return {
                success: false,
                message: response.data?.message || 'Failed to sync task'
            };
        } catch (error: any) {
            console.error('Task sync error:', error);
            return {
                success: false,
                message: error.response?.data?.message || error.message || 'Failed to sync task to Notion'
            };
        }
    },

    // Update task in Notion
    updateTaskInNotion: async (pageId: string, task: any): Promise<NotionSyncResult> => {
        try {
            const properties: Record<string, any> = {
                Name: {
                    title: [{ text: { content: task.title } }]
                },
                Status: {
                    select: { name: task.status || 'pending' }
                },
                Priority: {
                    select: { name: task.priority || 'medium' }
                }
            };

            if (task.dueDate) {
                properties['Due Date'] = {
                    date: { start: new Date(task.dueDate).toISOString().split('T')[0] }
                };
            }

            const response = await apiService.patch(`/sartthi/notion/pages/${pageId}`, {
                properties
            });

            if (response.data?.success) {
                return { success: true };
            }

            return {
                success: false,
                message: response.data?.message || 'Failed to update task'
            };
        } catch (error: any) {
            console.error('Task update error:', error);
            return {
                success: false,
                message: error.response?.data?.message || error.message || 'Failed to update task in Notion'
            };
        }
    },

    // Sync note to Notion
    syncNote: async (noteId: string, note: any): Promise<NotionSyncResult> => {
        try {
            const content = [
                {
                    object: 'block',
                    type: 'paragraph',
                    paragraph: {
                        rich_text: [{ type: 'text', text: { content: note.content || '' } }]
                    }
                }
            ];

            const response = await apiService.post('/sartthi/notion/pages', {
                title: note.title,
                content
            });

            if (response.data?.success) {
                return {
                    success: true,
                    pageId: response.data.data.pageId,
                    url: response.data.data.url
                };
            }

            return {
                success: false,
                message: response.data?.message || 'Failed to sync note'
            };
        } catch (error: any) {
            console.error('Note sync error:', error);
            return {
                success: false,
                message: error.response?.data?.message || error.message || 'Failed to sync note to Notion'
            };
        }
    },

    // Sync meeting notes to Notion
    syncMeeting: async (meetingId: string, meeting: any): Promise<NotionSyncResult> => {
        try {
            const blocks: any[] = [];

            // Meeting details
            blocks.push({
                object: 'block',
                type: 'heading_2',
                heading_2: {
                    rich_text: [{ type: 'text', text: { content: 'Meeting Details' } }]
                }
            });

            if (meeting.date) {
                blocks.push({
                    object: 'block',
                    type: 'paragraph',
                    paragraph: {
                        rich_text: [
                            { type: 'text', text: { content: '📅 Date: ', annotations: { bold: true } } },
                            { type: 'text', text: { content: new Date(meeting.date).toLocaleString() } }
                        ]
                    }
                });
            }

            if (meeting.attendees && meeting.attendees.length > 0) {
                blocks.push({
                    object: 'block',
                    type: 'paragraph',
                    paragraph: {
                        rich_text: [
                            { type: 'text', text: { content: '👥 Attendees: ', annotations: { bold: true } } },
                            { type: 'text', text: { content: meeting.attendees.join(', ') } }
                        ]
                    }
                });
            }

            // Agenda
            if (meeting.agenda) {
                blocks.push({
                    object: 'block',
                    type: 'heading_3',
                    heading_3: {
                        rich_text: [{ type: 'text', text: { content: 'Agenda' } }]
                    }
                });

                blocks.push({
                    object: 'block',
                    type: 'paragraph',
                    paragraph: {
                        rich_text: [{ type: 'text', text: { content: meeting.agenda } }]
                    }
                });
            }

            // Notes
            if (meeting.notes) {
                blocks.push({
                    object: 'block',
                    type: 'heading_3',
                    heading_3: {
                        rich_text: [{ type: 'text', text: { content: 'Notes' } }]
                    }
                });

                blocks.push({
                    object: 'block',
                    type: 'paragraph',
                    paragraph: {
                        rich_text: [{ type: 'text', text: { content: meeting.notes } }]
                    }
                });
            }

            // Action items
            if (meeting.actionItems && meeting.actionItems.length > 0) {
                blocks.push({
                    object: 'block',
                    type: 'heading_3',
                    heading_3: {
                        rich_text: [{ type: 'text', text: { content: 'Action Items' } }]
                    }
                });

                meeting.actionItems.forEach((item: string) => {
                    blocks.push({
                        object: 'block',
                        type: 'to_do',
                        to_do: {
                            rich_text: [{ type: 'text', text: { content: item } }],
                            checked: false
                        }
                    });
                });
            }

            const response = await apiService.post('/sartthi/notion/pages', {
                title: meeting.title,
                content: blocks
            });

            if (response.data?.success) {
                return {
                    success: true,
                    pageId: response.data.data.pageId,
                    url: response.data.data.url
                };
            }

            return {
                success: false,
                message: response.data?.message || 'Failed to sync meeting'
            };
        } catch (error: any) {
            console.error('Meeting sync error:', error);
            return {
                success: false,
                message: error.response?.data?.message || error.message || 'Failed to sync meeting to Notion'
            };
        }
    },

    // List available databases
    listDatabases: async (): Promise<NotionDatabase[]> => {
        try {
            const response = await apiService.get('/sartthi/notion/databases');
            if (response.data?.success) {
                return response.data.data;
            }
            return [];
        } catch (error) {
            console.error('List databases error:', error);
            return [];
        }
    },

    // Create a new database
    createDatabase: async (title: string, properties: any): Promise<NotionSyncResult> => {
        try {
            const response = await apiService.post('/sartthi/notion/databases', {
                title,
                properties
            });

            if (response.data?.success) {
                return {
                    success: true,
                    pageId: response.data.data.databaseId,
                    url: response.data.data.url
                };
            }

            return {
                success: false,
                message: response.data?.message || 'Failed to create database'
            };
        } catch (error: any) {
            console.error('Create database error:', error);
            return {
                success: false,
                message: error.response?.data?.message || error.message || 'Failed to create database'
            };
        }
    }
};
