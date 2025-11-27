export type EmailSource =
    // Development & Collaboration
    | 'linkedin'
    | 'github'
    | 'jira'
    | 'slack'
    | 'figma'
    | 'notion'
    | 'vercel'
    | 'netlify'

    // Finance & Payments
    | 'stripe'
    | 'paypal'
    | 'quickbooks'
    | 'expensify'

    // Marketing & CRM
    | 'hubspot'
    | 'salesforce'
    | 'mailchimp'
    | 'typeform'

    // DevOps & Monitoring
    | 'sentry'
    | 'datadog'
    | 'pagerduty'
    | 'aws'
    | 'azure'

    // Customer Support
    | 'intercom'
    | 'zendesk'

    // HR & Admin
    | 'docusign'
    | 'bamboohr'
    | 'calendly'

    // Design & Creative
    | 'miro'
    | 'canva'
    | 'invision'

    // Google Services
    | 'google'
    | 'twitter'
    | 'amazon'
    | 'banking'
    | 'generic';

export type EmailCategory =
    | 'development'
    | 'finance'
    | 'marketing'
    | 'devops'
    | 'support'
    | 'hr'
    | 'creative'
    | 'productivity'
    | 'generic';

export const detectEmailSource = (from: string, subject: string): EmailSource => {
    const fromLower = from.toLowerCase();
    const subjectLower = subject.toLowerCase();

    // Development & Collaboration
    if (fromLower.includes('linkedin.com') || fromLower.includes('linkedin')) return 'linkedin';
    if (fromLower.includes('github.com') || fromLower.includes('github')) return 'github';
    if (fromLower.includes('atlassian.com') || fromLower.includes('jira')) return 'jira';
    if (fromLower.includes('slack.com') || fromLower.includes('slack')) return 'slack';
    if (fromLower.includes('figma.com') || fromLower.includes('figma')) return 'figma';
    if (fromLower.includes('notion.so') || fromLower.includes('notion')) return 'notion';
    if (fromLower.includes('vercel.com') || fromLower.includes('vercel')) return 'vercel';
    if (fromLower.includes('netlify.com') || fromLower.includes('netlify')) return 'netlify';

    // Finance & Payments
    if (fromLower.includes('stripe.com') || fromLower.includes('stripe')) return 'stripe';
    if (fromLower.includes('paypal.com') || fromLower.includes('paypal')) return 'paypal';
    if (fromLower.includes('quickbooks.com') || fromLower.includes('quickbooks')) return 'quickbooks';
    if (fromLower.includes('expensify.com') || fromLower.includes('expensify')) return 'expensify';

    // Marketing & CRM
    if (fromLower.includes('hubspot.com') || fromLower.includes('hubspot')) return 'hubspot';
    if (fromLower.includes('salesforce.com') || fromLower.includes('salesforce')) return 'salesforce';
    if (fromLower.includes('mailchimp.com') || fromLower.includes('mailchimp')) return 'mailchimp';
    if (fromLower.includes('typeform.com') || fromLower.includes('typeform')) return 'typeform';

    // DevOps & Monitoring
    if (fromLower.includes('sentry.io') || fromLower.includes('sentry')) return 'sentry';
    if (fromLower.includes('datadog') || fromLower.includes('datadoghq.com')) return 'datadog';
    if (fromLower.includes('pagerduty.com') || fromLower.includes('pagerduty')) return 'pagerduty';
    if (fromLower.includes('aws.amazon.com') || fromLower.includes('amazonaws.com')) return 'aws';
    if (fromLower.includes('azure.com') || fromLower.includes('microsoft.com')) return 'azure';

    // Customer Support
    if (fromLower.includes('intercom.com') || fromLower.includes('intercom')) return 'intercom';
    if (fromLower.includes('zendesk.com') || fromLower.includes('zendesk')) return 'zendesk';

    // HR & Admin
    if (fromLower.includes('docusign.com') || fromLower.includes('docusign')) return 'docusign';
    if (fromLower.includes('bamboohr.com') || fromLower.includes('bamboohr')) return 'bamboohr';
    if (fromLower.includes('calendly.com') || fromLower.includes('calendly')) return 'calendly';

    // Design & Creative
    if (fromLower.includes('miro.com') || fromLower.includes('miro')) return 'miro';
    if (fromLower.includes('canva.com') || fromLower.includes('canva')) return 'canva';
    if (fromLower.includes('invision') || fromLower.includes('invisionapp.com')) return 'invision';

    // Google Services
    if (fromLower.includes('google.com') || fromLower.includes('calendar') || fromLower.includes('drive')) return 'google';
    if (fromLower.includes('twitter.com') || fromLower.includes('x.com') || fromLower.includes('twitter')) return 'twitter';
    if (fromLower.includes('amazon.com') || fromLower.includes('amazon')) return 'amazon';

    // Banking (generic patterns)
    if (fromLower.includes('bank') || fromLower.includes('payment') || subjectLower.includes('transaction')) return 'banking';

    return 'generic';
};

export const getEmailCategory = (source: EmailSource): EmailCategory => {
    const categoryMap: Record<EmailSource, EmailCategory> = {
        // Development
        linkedin: 'development',
        github: 'development',
        jira: 'development',
        slack: 'development',

        // Finance
        stripe: 'finance',
        paypal: 'finance',
        quickbooks: 'finance',
        expensify: 'finance',
        banking: 'finance',

        // Marketing
        hubspot: 'marketing',
        salesforce: 'marketing',
        mailchimp: 'marketing',
        typeform: 'marketing',

        // DevOps
        sentry: 'devops',
        datadog: 'devops',
        pagerduty: 'devops',
        aws: 'devops',
        azure: 'devops',
        vercel: 'devops',
        netlify: 'devops',

        // Support
        intercom: 'support',
        zendesk: 'support',

        // HR
        docusign: 'hr',
        bamboohr: 'hr',
        calendly: 'hr',

        // Creative
        figma: 'creative',
        miro: 'creative',
        canva: 'creative',
        invision: 'creative',

        // Productivity
        notion: 'productivity',
        google: 'productivity',

        // Others
        twitter: 'generic',
        amazon: 'generic',
        generic: 'generic'
    };

    return categoryMap[source] || 'generic';
};

export const getSourceInfo = (source: EmailSource) => {
    const sourceMap: Record<EmailSource, { name: string; color: string; icon: string; bgGradient: string; category: EmailCategory }> = {
        // Development & Collaboration
        linkedin: {
            name: 'LinkedIn',
            color: '#0A66C2',
            icon: '💼',
            bgGradient: 'linear-gradient(135deg, #0A66C2 0%, #004182 100%)',
            category: 'development'
        },
        github: {
            name: 'GitHub',
            color: '#24292e',
            icon: '🐙',
            bgGradient: 'linear-gradient(135deg, #24292e 0%, #000000 100%)',
            category: 'development'
        },
        jira: {
            name: 'Jira',
            color: '#0052CC',
            icon: '📋',
            bgGradient: 'linear-gradient(135deg, #0052CC 0%, #2684FF 100%)',
            category: 'development'
        },
        slack: {
            name: 'Slack',
            color: '#4A154B',
            icon: '💬',
            bgGradient: 'linear-gradient(135deg, #4A154B 0%, #36C5F0 100%)',
            category: 'development'
        },

        // Finance & Payments
        stripe: {
            name: 'Stripe',
            color: '#635BFF',
            icon: '💳',
            bgGradient: 'linear-gradient(135deg, #635BFF 0%, #0A2540 100%)',
            category: 'finance'
        },
        paypal: {
            name: 'PayPal',
            color: '#003087',
            icon: '💰',
            bgGradient: 'linear-gradient(135deg, #003087 0%, #009CDE 100%)',
            category: 'finance'
        },
        quickbooks: {
            name: 'QuickBooks',
            color: '#2CA01C',
            icon: '📊',
            bgGradient: 'linear-gradient(135deg, #2CA01C 0%, #1A7A0F 100%)',
            category: 'finance'
        },
        expensify: {
            name: 'Expensify',
            color: '#03D47C',
            icon: '💵',
            bgGradient: 'linear-gradient(135deg, #03D47C 0%, #02A35F 100%)',
            category: 'finance'
        },

        // Marketing & CRM
        hubspot: {
            name: 'HubSpot',
            color: '#FF7A59',
            icon: '🎯',
            bgGradient: 'linear-gradient(135deg, #FF7A59 0%, #FF5C35 100%)',
            category: 'marketing'
        },
        salesforce: {
            name: 'Salesforce',
            color: '#00A1E0',
            icon: '☁️',
            bgGradient: 'linear-gradient(135deg, #00A1E0 0%, #0070D2 100%)',
            category: 'marketing'
        },
        mailchimp: {
            name: 'Mailchimp',
            color: '#FFE01B',
            icon: '📧',
            bgGradient: 'linear-gradient(135deg, #FFE01B 0%, #FFC700 100%)',
            category: 'marketing'
        },
        typeform: {
            name: 'Typeform',
            color: '#262627',
            icon: '📝',
            bgGradient: 'linear-gradient(135deg, #262627 0%, #000000 100%)',
            category: 'marketing'
        },

        // DevOps & Monitoring
        sentry: {
            name: 'Sentry',
            color: '#362D59',
            icon: '🚨',
            bgGradient: 'linear-gradient(135deg, #362D59 0%, #1C1633 100%)',
            category: 'devops'
        },
        datadog: {
            name: 'Datadog',
            color: '#632CA6',
            icon: '📈',
            bgGradient: 'linear-gradient(135deg, #632CA6 0%, #4A1F7D 100%)',
            category: 'devops'
        },
        pagerduty: {
            name: 'PagerDuty',
            color: '#06AC38',
            icon: '🔔',
            bgGradient: 'linear-gradient(135deg, #06AC38 0%, #048A2C 100%)',
            category: 'devops'
        },
        aws: {
            name: 'AWS',
            color: '#FF9900',
            icon: '☁️',
            bgGradient: 'linear-gradient(135deg, #FF9900 0%, #EC7211 100%)',
            category: 'devops'
        },
        azure: {
            name: 'Azure',
            color: '#0078D4',
            icon: '☁️',
            bgGradient: 'linear-gradient(135deg, #0078D4 0%, #005A9E 100%)',
            category: 'devops'
        },

        // Customer Support
        intercom: {
            name: 'Intercom',
            color: '#1F8DED',
            icon: '💬',
            bgGradient: 'linear-gradient(135deg, #1F8DED 0%, #0B6BC9 100%)',
            category: 'support'
        },
        zendesk: {
            name: 'Zendesk',
            color: '#03363D',
            icon: '🎫',
            bgGradient: 'linear-gradient(135deg, #03363D 0%, #001F24 100%)',
            category: 'support'
        },

        // HR & Admin
        docusign: {
            name: 'DocuSign',
            color: '#FFCC00',
            icon: '✍️',
            bgGradient: 'linear-gradient(135deg, #FFCC00 0%, #E6B800 100%)',
            category: 'hr'
        },
        bamboohr: {
            name: 'BambooHR',
            color: '#73C41D',
            icon: '🌿',
            bgGradient: 'linear-gradient(135deg, #73C41D 0%, #5FA315 100%)',
            category: 'hr'
        },
        calendly: {
            name: 'Calendly',
            color: '#006BFF',
            icon: '📅',
            bgGradient: 'linear-gradient(135deg, #006BFF 0%, #0052CC 100%)',
            category: 'hr'
        },

        // Design & Creative
        figma: {
            name: 'Figma',
            color: '#F24E1E',
            icon: '🎨',
            bgGradient: 'linear-gradient(135deg, #F24E1E 0%, #A259FF 50%, #1ABCFE 100%)',
            category: 'creative'
        },
        miro: {
            name: 'Miro',
            color: '#FFD02F',
            icon: '🖼️',
            bgGradient: 'linear-gradient(135deg, #FFD02F 0%, #F2C200 100%)',
            category: 'creative'
        },
        canva: {
            name: 'Canva',
            color: '#00C4CC',
            icon: '🎨',
            bgGradient: 'linear-gradient(135deg, #00C4CC 0%, #7D2AE8 100%)',
            category: 'creative'
        },
        invision: {
            name: 'InVision',
            color: '#FF3366',
            icon: '🖌️',
            bgGradient: 'linear-gradient(135deg, #FF3366 0%, #DC1F52 100%)',
            category: 'creative'
        },

        // Productivity
        notion: {
            name: 'Notion',
            color: '#000000',
            icon: '📝',
            bgGradient: 'linear-gradient(135deg, #000000 0%, #FFFFFF 100%)',
            category: 'productivity'
        },
        vercel: {
            name: 'Vercel',
            color: '#000000',
            icon: '▲',
            bgGradient: 'linear-gradient(135deg, #000000 0%, #FFFFFF 100%)',
            category: 'devops'
        },
        netlify: {
            name: 'Netlify',
            color: '#00C7B7',
            icon: '🌐',
            bgGradient: 'linear-gradient(135deg, #00C7B7 0%, #014847 100%)',
            category: 'devops'
        },
        google: {
            name: 'Google',
            color: '#4285F4',
            icon: '📅',
            bgGradient: 'linear-gradient(135deg, #4285F4 0%, #34A853 50%, #FBBC05 75%, #EA4335 100%)',
            category: 'productivity'
        },
        twitter: {
            name: 'X (Twitter)',
            color: '#000000',
            icon: '🐦',
            bgGradient: 'linear-gradient(135deg, #000000 0%, #1DA1F2 100%)',
            category: 'generic'
        },
        amazon: {
            name: 'Amazon',
            color: '#FF9900',
            icon: '📦',
            bgGradient: 'linear-gradient(135deg, #FF9900 0%, #146EB4 100%)',
            category: 'generic'
        },
        banking: {
            name: 'Banking',
            color: '#2E7D32',
            icon: '🏦',
            bgGradient: 'linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%)',
            category: 'finance'
        },
        generic: {
            name: 'Email',
            color: '#6366f1',
            icon: '📧',
            bgGradient: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
            category: 'generic'
        }
    };

    return sourceMap[source] || sourceMap.generic;
};
