import { TourStep } from '../components/OnboardingTour';

export const mailTourSteps: TourStep[] = [
    {
        target: '[data-tour="mail-compose"]',
        title: 'Compose New Emails',
        description: 'Click here to compose a new email. You can send emails directly from your connected Gmail account.',
        position: 'bottom',
        action: 'Try clicking the Compose button'
    },
    {
        target: '[data-tour="mail-inbox"]',
        title: 'Your Inbox',
        description: 'All your emails are synced in real-time from your Gmail account. Click on any email to read it.',
        position: 'right',
        action: 'Select an email to view its contents'
    },
    {
        target: '[data-tour="mail-folders"]',
        title: 'Organize with Folders',
        description: 'Navigate between Inbox, Sent, Drafts, and other folders. Your Gmail labels appear here too!',
        position: 'right'
    },
    {
        target: '[data-tour="mail-search"]',
        title: 'Search Your Emails',
        description: 'Quickly find any email using the search bar. Search by sender, subject, or content.',
        position: 'bottom'
    },
    {
        target: '[data-tour="mail-settings"]',
        title: 'Email Settings',
        description: 'Customize your email experience, manage signatures, and configure notifications.',
        position: 'left'
    }
];

export const calendarTourSteps: TourStep[] = [
    {
        target: '[data-tour="calendar-create"]',
        title: 'Create Events',
        description: 'Click here to create a new calendar event. It syncs instantly with your Google Calendar!',
        position: 'bottom',
        action: 'Try creating a new event'
    },
    {
        target: '[data-tour="calendar-view"]',
        title: 'Calendar Views',
        description: 'Switch between Day, Week, and Month views to see your schedule the way you prefer.',
        position: 'bottom'
    },
    {
        target: '[data-tour="calendar-grid"]',
        title: 'Your Schedule',
        description: 'All your events from Google Calendar are displayed here. Click on any event to view or edit details.',
        position: 'top',
        action: 'Click on an event to see more'
    },
    {
        target: '[data-tour="calendar-sidebar"]',
        title: 'Upcoming Events',
        description: 'See your upcoming events at a glance. The sidebar shows what\'s next on your schedule.',
        position: 'left'
    },
    {
        target: '[data-tour="calendar-settings"]',
        title: 'Calendar Settings',
        description: 'Customize your calendar view, set work hours, and manage event preferences.',
        position: 'left'
    }
];

export const vaultTourSteps: TourStep[] = [
    {
        target: '[data-tour="vault-sidebar"]',
        title: 'Navigate Your Vault',
        description: 'Access different sections: My Vault, Shared files, Recent files, Starred items, and Trash.',
        position: 'right'
    },
    {
        target: '[data-tour="vault-upload"]',
        title: 'Upload Files',
        description: 'Click here to upload files to your Sartthi Vault. Files are stored securely in your Google Drive.',
        position: 'bottom',
        action: 'Try uploading a file'
    },
    {
        target: '[data-tour="vault-search"]',
        title: 'Search Files',
        description: 'Quickly find any file in your vault using the search bar. Search by name or file type.',
        position: 'bottom'
    },
    {
        target: '[data-tour="vault-view-toggle"]',
        title: 'Switch Views',
        description: 'Toggle between grid and list view to see your files the way you prefer.',
        position: 'bottom'
    },
    {
        target: '[data-tour="vault-files"]',
        title: 'Your Files',
        description: 'All files are stored in a dedicated "Sartthi Vault" folder in your Google Drive. Double-click to open, right-click for more options.',
        position: 'top',
        action: 'Try right-clicking on a file'
    },
    {
        target: '[data-tour="vault-storage"]',
        title: 'Storage Usage',
        description: 'Monitor your Google Drive storage usage. Your Sartthi Vault uses your Google Drive storage.',
        position: 'top'
    }
];

export const homeTourSteps: TourStep[] = [
    {
        target: '[data-tour="dock"]',
        title: 'Welcome to Sartthi! 🎉',
        description: 'This is your command center. Access Mail, Calendar, and Vault from the dock at the bottom.',
        position: 'top'
    },
    {
        target: '[data-tour="dock-mail"]',
        title: 'Sartthi Mail',
        description: 'Access your Gmail inbox with a beautiful, modern interface. Click to open Mail.',
        position: 'top',
        action: 'Click to explore Mail'
    },
    {
        target: '[data-tour="dock-calendar"]',
        title: 'Sartthi Calendar',
        description: 'Manage your Google Calendar events and stay organized. Click to open Calendar.',
        position: 'top',
        action: 'Click to explore Calendar'
    },
    {
        target: '[data-tour="dock-vault"]',
        title: 'Sartthi Vault',
        description: 'Your secure file storage powered by Google Drive. Click to open Vault.',
        position: 'top',
        action: 'Click to explore Vault'
    },
    {
        target: '[data-tour="user-menu"]',
        title: 'Your Profile',
        description: 'Access your account settings, preferences, and logout from here.',
        position: 'bottom'
    }
];
