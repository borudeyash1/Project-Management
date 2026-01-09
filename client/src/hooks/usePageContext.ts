import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';

export type PageType = 'workspace' | 'project' | 'other';

export type WorkspaceSubPage =
    | 'overview'
    | 'members'
    | 'attendance'
    | 'projects'
    | 'clients'
    | 'profile'
    | 'inbox';

export type ProjectSubPage =
    | 'overview'
    | 'info'
    | 'team'
    | 'tasks'
    | 'timeline'
    | 'progress'
    | 'workload'
    | 'reports'
    | 'documents';

export interface PageContext {
    pageType: PageType;
    pageId: string | null;
    subPage: WorkspaceSubPage | ProjectSubPage | null;
    isContextAware: boolean;
}

/**
 * Hook to detect current page context from URL
 * Parses URL to determine if user is on a workspace or project page
 */
export const usePageContext = (): PageContext => {
    const location = useLocation();

    const context = useMemo(() => {
        const path = location.pathname;

        // Match workspace pages: /workspace/:id/:subPage
        const workspaceMatch = path.match(/^\/workspace\/([^/]+)\/([^/]+)/);
        if (workspaceMatch) {
            const [, workspaceId, subPage] = workspaceMatch;
            return {
                pageType: 'workspace' as PageType,
                pageId: workspaceId,
                subPage: subPage as WorkspaceSubPage,
                isContextAware: true
            };
        }

        // Match project pages: /project/:id/:subPage
        const projectMatch = path.match(/^\/project\/([^/]+)\/([^/]+)/);
        if (projectMatch) {
            const [, projectId, subPage] = projectMatch;
            return {
                pageType: 'project' as PageType,
                pageId: projectId,
                subPage: subPage as ProjectSubPage,
                isContextAware: true
            };
        }

        // Match Global Pages (planner, notifications, etc.)
        const globalPages = ['home', 'projects', 'workspace', 'planner', 'notifications', 'reminders', 'goals', 'settings', 'profile', 'reports', 'calendar', 'notes'];
        const currentGlobal = globalPages.find(p => path.startsWith(`/${p}`));

        if (currentGlobal) {
            return {
                pageType: 'global' as any, // 'global' wasn't in original type definition, might need to update PageType export or cast
                pageId: 'global',
                subPage: currentGlobal as any,
                isContextAware: true
            };
        }

        // Not a context-aware page
        return {
            pageType: 'other' as PageType,
            pageId: null,
            subPage: null,
            isContextAware: false
        };
    }, [location.pathname]);

    return context;
};
