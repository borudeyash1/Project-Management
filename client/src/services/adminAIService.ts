import api from './api';

interface AIResponse {
  content: string;
  suggestions?: string[];
  severity?: 'info' | 'warning' | 'critical';
}

class AdminAIService {
  async getAdminAIResponse(
    message: string,
    page: string,
    context?: any
  ): Promise<AIResponse> {
    try {
      const response = await api.post('/admin/ai-assistant', {
        message,
        page,
        context
      });

      if (response?.success && response?.data) {
        return {
          content: response.data.content,
          suggestions: response.data.suggestions,
          severity: response.data.severity
        };
      }

      return this.getLocalAIResponse(message, page, context);
    } catch (error) {
      console.error('Admin AI Service Error:', error);
      return this.getLocalAIResponse(message, page, context);
    }
  }

  private getLocalAIResponse(message: string, page: string, context?: any): AIResponse {
    const lowerMessage = message.toLowerCase();

    if (page === 'dashboard') {
      return this.getDashboardResponse(lowerMessage, context);
    } else if (page === 'users') {
      return this.getUsersResponse(lowerMessage, context);
    } else if (page === 'analytics') {
      return this.getAnalyticsResponse(lowerMessage, context);
    } else if (page === 'devices') {
      return this.getDevicesResponse(lowerMessage, context);
    } else if (page === 'releases') {
      return this.getReleasesResponse(lowerMessage, context);
    }

    return {
      content: 'I can help you analyze admin data. Please ask me about users, security, analytics, or system performance.',
      suggestions: ['System health', 'User insights', 'Security status', 'Performance metrics']
    };
  }

  private getDashboardResponse(message: string, context?: any): AIResponse {
    if (message.includes('health') || message.includes('status')) {
      return {
        content: `**System Health Analysis**\n\nBased on current metrics:\n\n✅ **Overall Status:** ${context?.systemStatus || 'Healthy'}\n📊 **Active Sessions:** ${context?.activeSessions || 'N/A'}\n👥 **Total Users:** ${context?.totalUsers || 'N/A'}\n\n**Recommendations:**\n• Monitor active sessions for unusual spikes\n• Review user growth trends\n• Check system resource usage`,
        suggestions: ['Show security threats', 'Analyze user activity', 'Performance tips'],
        severity: 'info'
      };
    }

    if (message.includes('security') || message.includes('threat')) {
      return {
        content: `**Security Threat Analysis**\n\n🔍 **Scanning for threats...**\n\n${context?.threats?.length > 0 ? '⚠️ **Detected Issues:**\n' + context.threats.map((t: any) => `• ${t}`).join('\n') : '✅ No immediate threats detected'}\n\n**Security Recommendations:**\n• Enable 2FA for all admin accounts\n• Review failed login attempts\n• Monitor suspicious IP addresses\n• Update security policies regularly`,
        suggestions: ['Check failed logins', 'Review IP blacklist', 'Audit admin access'],
        severity: context?.threats?.length > 0 ? 'warning' : 'info'
      };
    }

    return {
      content: `**Dashboard Overview**\n\nI can provide insights on:\n• System health and performance\n• Security threat detection\n• User activity patterns\n• Resource utilization\n\nWhat would you like to analyze?`,
      suggestions: ['System health check', 'Security scan', 'User activity', 'Performance metrics']
    };
  }

  private getUsersResponse(message: string, context?: any): AIResponse {
    if (message.includes('inactive') || message.includes('dormant')) {
      return {
        content: `**Inactive User Analysis**\n\n📊 **Findings:**\n• ${context?.inactiveCount || 'N/A'} users haven't logged in for 30+ days\n• ${context?.dormantCount || 'N/A'} users haven't logged in for 90+ days\n\n**Recommendations:**\n• Send re-engagement emails\n• Offer special promotions\n• Consider account cleanup policy\n• Analyze reasons for inactivity`,
        suggestions: ['Show dormant users', 'Engagement strategies', 'Cleanup recommendations'],
        severity: 'info'
      };
    }

    if (message.includes('suspicious') || message.includes('fraud')) {
      return {
        content: `**Suspicious Account Detection**\n\n🔍 **Security Analysis:**\n\n${context?.suspiciousAccounts?.length > 0 ? '⚠️ **Flagged Accounts:**\n' + context.suspiciousAccounts.map((a: any) => `• ${a.email} - ${a.reason}`).join('\n') : '✅ No suspicious accounts detected'}\n\n**Detection Criteria:**\n• Multiple failed login attempts\n• Unusual access patterns\n• VPN/Proxy usage\n• Rapid account creation\n• Payment fraud indicators`,
        suggestions: ['Review flagged accounts', 'Check login patterns', 'IP analysis'],
        severity: context?.suspiciousAccounts?.length > 0 ? 'warning' : 'info'
      };
    }

    if (message.includes('growth') || message.includes('trend')) {
      return {
        content: `**User Growth Analysis**\n\n📈 **Trends:**\n• This month: +${context?.growthThisMonth || 'N/A'} users\n• Last month: +${context?.growthLastMonth || 'N/A'} users\n• Growth rate: ${context?.growthRate || 'N/A'}%\n\n**Insights:**\n• ${context?.growthRate > 10 ? '🚀 Strong growth momentum' : '📊 Steady growth pattern'}\n• Peak registration: ${context?.peakDay || 'N/A'}\n• Top source: ${context?.topSource || 'N/A'}`,
        suggestions: ['Predict next month', 'Source analysis', 'Retention metrics'],
        severity: 'info'
      };
    }

    return {
      content: `**User Management Insights**\n\nI can analyze:\n• User activity and engagement\n• Suspicious account detection\n• Growth trends and predictions\n• Subscription health\n• Churn risk assessment\n\nWhat would you like to explore?`,
      suggestions: ['Find inactive users', 'Detect suspicious activity', 'Growth analysis', 'Subscription insights']
    };
  }

  private getAnalyticsResponse(message: string, context?: any): AIResponse {
    if (message.includes('revenue') || message.includes('predict')) {
      return {
        content: `**Revenue Prediction**\n\n💰 **Forecast Analysis:**\n• Current MRR: $${context?.currentMRR || 'N/A'}\n• Predicted next month: $${context?.predictedMRR || 'N/A'}\n• Growth projection: ${context?.projectedGrowth || 'N/A'}%\n\n**Key Factors:**\n• New subscriptions: ${context?.newSubs || 'N/A'}\n• Churn rate: ${context?.churnRate || 'N/A'}%\n• Upgrade rate: ${context?.upgradeRate || 'N/A'}%\n\n**Recommendations:**\n• Focus on reducing churn\n• Promote annual plans\n• Upsell premium features`,
        suggestions: ['Churn analysis', 'Upsell opportunities', 'Pricing optimization'],
        severity: 'info'
      };
    }

    if (message.includes('retention') || message.includes('churn')) {
      return {
        content: `**User Retention Analysis**\n\n📊 **Retention Metrics:**\n• 30-day retention: ${context?.retention30 || 'N/A'}%\n• 90-day retention: ${context?.retention90 || 'N/A'}%\n• Churn rate: ${context?.churnRate || 'N/A'}%\n\n**At-Risk Users:**\n• ${context?.atRiskCount || 'N/A'} users showing churn signals\n\n**Improvement Strategies:**\n• Implement onboarding improvements\n• Add engagement features\n• Personalized communication\n• Value demonstration`,
        suggestions: ['Show at-risk users', 'Engagement tactics', 'Onboarding optimization'],
        severity: context?.churnRate > 5 ? 'warning' : 'info'
      };
    }

    return {
      content: `**Analytics Insights**\n\nI can provide:\n• Revenue forecasting\n• Retention analysis\n• Growth opportunities\n• Performance benchmarking\n• Trend predictions\n\nWhat metrics would you like to analyze?`,
      suggestions: ['Revenue forecast', 'Retention metrics', 'Growth opportunities', 'Benchmark performance']
    };
  }

  private getDevicesResponse(message: string, context?: any): AIResponse {
    if (message.includes('vulnerability') || message.includes('scan')) {
      return {
        content: `**Security Vulnerability Scan**\n\n🔒 **Scan Results:**\n\n${context?.vulnerabilities?.length > 0 ? '⚠️ **Detected Vulnerabilities:**\n' + context.vulnerabilities.map((v: any) => `• ${v.type}: ${v.description} (${v.severity})`).join('\n') : '✅ No vulnerabilities detected'}\n\n**Security Score:** ${context?.securityScore || 'N/A'}/100\n\n**Recommendations:**\n• Review flagged devices immediately\n• Update security policies\n• Enable device verification\n• Monitor suspicious IPs`,
        suggestions: ['Show vulnerable devices', 'IP blacklist', 'Security policies'],
        severity: context?.vulnerabilities?.length > 0 ? 'critical' : 'info'
      };
    }

    if (message.includes('suspicious') || message.includes('threat')) {
      return {
        content: `**Suspicious Device Detection**\n\n🚨 **Threat Analysis:**\n\n${context?.suspiciousDevices?.length > 0 ? '⚠️ **Flagged Devices:**\n' + context.suspiciousDevices.map((d: any) => `• Device: ${d.id}\n  IP: ${d.ip}\n  Reason: ${d.reason}\n  Risk: ${d.riskLevel}`).join('\n\n') : '✅ No suspicious devices detected'}\n\n**Detection Criteria:**\n• Multiple failed login attempts\n• Unusual location changes\n• Known malicious IPs\n• Suspicious user agents\n• Rapid device switching`,
        suggestions: ['Block suspicious IPs', 'Review access logs', 'Update blacklist'],
        severity: context?.suspiciousDevices?.length > 0 ? 'warning' : 'info'
      };
    }

    if (message.includes('pattern') || message.includes('login')) {
      return {
        content: `**Login Pattern Analysis**\n\n📊 **Access Patterns:**\n• Total devices: ${context?.totalDevices || 'N/A'}\n• Active today: ${context?.activeToday || 'N/A'}\n• Failed logins: ${context?.failedLogins || 'N/A'}\n• Unique IPs: ${context?.uniqueIPs || 'N/A'}\n\n**Anomalies Detected:**\n${context?.anomalies?.length > 0 ? context.anomalies.map((a: any) => `• ${a}`).join('\n') : '• No anomalies detected'}\n\n**Insights:**\n• Peak access time: ${context?.peakTime || 'N/A'}\n• Most common location: ${context?.topLocation || 'N/A'}`,
        suggestions: ['Show anomalies', 'Geographic analysis', 'Time-based patterns'],
        severity: context?.anomalies?.length > 0 ? 'warning' : 'info'
      };
    }

    return {
      content: `**Device Security Insights**\n\nI can analyze:\n• Security vulnerabilities\n• Suspicious device detection\n• Access pattern analysis\n• IP reputation checking\n• Device fingerprint validation\n\nWhat would you like to investigate?`,
      suggestions: ['Scan vulnerabilities', 'Check suspicious devices', 'Analyze patterns', 'IP assessment']
    };
  }

  private getReleasesResponse(message: string, context?: any): AIResponse {
    if (message.includes('download') || message.includes('trend')) {
      return {
        content: `**Download Trend Analysis**\n\n📊 **Statistics:**\n• Total downloads: ${context?.totalDownloads || 'N/A'}\n• This week: ${context?.downloadsThisWeek || 'N/A'}\n• Growth: ${context?.downloadGrowth || 'N/A'}%\n\n**Platform Distribution:**\n• Windows: ${context?.windowsPercent || 'N/A'}%\n• macOS: ${context?.macosPercent || 'N/A'}%\n• Linux: ${context?.linuxPercent || 'N/A'}%\n\n**Insights:**\n• Most popular version: ${context?.popularVersion || 'N/A'}\n• Peak download time: ${context?.peakTime || 'N/A'}`,
        suggestions: ['Version adoption', 'Platform insights', 'Release recommendations'],
        severity: 'info'
      };
    }

    if (message.includes('adoption') || message.includes('version')) {
      return {
        content: `**Version Adoption Analysis**\n\n📈 **Adoption Rates:**\n• Latest version: ${context?.latestAdoption || 'N/A'}%\n• Previous version: ${context?.previousAdoption || 'N/A'}%\n• Legacy versions: ${context?.legacyAdoption || 'N/A'}%\n\n**Update Velocity:**\n• Fast adopters: ${context?.fastAdopters || 'N/A'}%\n• Slow adopters: ${context?.slowAdopters || 'N/A'}%\n\n**Recommendations:**\n• ${context?.latestAdoption < 50 ? 'Promote latest version more aggressively' : 'Good adoption rate'}\n• Consider deprecating old versions\n• Highlight new features`,
        suggestions: ['Promote updates', 'Deprecation plan', 'Feature highlights'],
        severity: context?.latestAdoption < 30 ? 'warning' : 'info'
      };
    }

    return {
      content: `**Release Management Insights**\n\nI can analyze:\n• Download trends and patterns\n• Version adoption rates\n• Platform distribution\n• Release impact assessment\n• Update recommendations\n\nWhat would you like to know?`,
      suggestions: ['Download trends', 'Version adoption', 'Platform analysis', 'Release impact']
    };
  }
}

export const adminAIService = new AdminAIService();
