# Database Schema Analysis - Project Management System

## Overview
This document provides a comprehensive analysis of the MongoDB database schema for the Project Management System. The database consists of **44 collections** with complex relationships and extensive features.

---

## Core Collections

### 1. **Users Collection**
**Purpose**: Stores user account information, profiles, preferences, and authentication data.

**Key Fields**:
- `fullName`, `email`, `username`, `password` (hashed)
- `contactNumber`, `designation`, `department`, `location`, `about`
- `dateOfBirth`, `avatarUrl`, `faceScanImage`
- **Profile** (Enhanced AI-powered insights):
  - Professional: `jobTitle`, `company`, `industry`, `experience`, `skills[]`
  - Work Preferences: `workStyle`, `communicationStyle`, `timeManagement`, `preferredWorkingHours`, `timezone`
  - Personality: `traits[]`, `workingStyle`, `stressLevel`, `motivationFactors[]`
  - Goals: `shortTerm[]`, `longTerm[]`, `careerAspirations`
  - Learning: `interests[]`, `currentLearning[]`, `certifications[]`
  - Productivity: `peakHours[]`, `taskPreferences`, `workEnvironment`
  - AI Preferences: `assistanceLevel`, `preferredSuggestions[]`, `communicationStyle`, `notificationPreferences`
- **Authentication**:
  - `isEmailVerified`, `emailVerificationOTP`, `loginOtp`
  - `passwordResetToken`, `refreshTokens[]`
  - `loginHistory[]` (with device info, IP, location)
- **Subscription**:
  - `plan` (free/pro/ultra), `status`, `features`, `billingCycle`
- **Connected Accounts**: Multi-account support for Mail, Calendar, Vault, Slack, GitHub, Dropbox, OneDrive, Spotify, Jira, Trello, Monday
- **Settings & Preferences**: Theme, notifications, calendar sync, privacy

**Indexes**:
- `email` (unique)
- `username` (unique)
- `refreshTokens.token`

---

### 2. **Workspaces Collection**
**Purpose**: Organizational units that contain projects, teams, and members.

**Key Fields**:
- `name`, `description`, `type` (team/enterprise), `region`
- `owner` (user ID)
- **Members**:
  - `user`, `role` (owner/admin/manager/member)
  - `permissions` (canManageMembers, canManageProjects, canManageClients, etc.)
  - `joinedAt`, `status` (active/pending/suspended)
- **Settings**:
  - `isPublic`, `allowMemberInvites`, `requireApprovalForJoining`
  - `defaultProjectPermissions`
- **Subscription**:
  - `plan` (free/pro/enterprise)
  - `maxMembers`, `maxProjects`
  - `features` (advancedAnalytics, customFields, apiAccess, prioritySupport)
- **Document Management**:
  - `vaultFolderId`, `quickAccessDocs[]`
  - `documentSettings` (autoSync, allowedFileTypes, maxStorageGB)

**Indexes**:
- `owner`
- `members.user`
- `name`

---

### 3. **Projects Collection**
**Purpose**: Individual projects within workspaces.

**Key Fields**:
- `name`, `description`, `workspace`, `tier` (free/pro/ultra/enterprise)
- `createdBy`
- **Team Members**:
  - `user`, `role` (flexible custom roles)
  - `permissions` (canEdit, canDelete, canManageMembers, canViewReports)
  - `joinedAt`
- **Status & Priority**:
  - `status` (planning/active/on-hold/completed/cancelled)
  - `priority` (low/medium/high/urgent)
- `category`, `tags[]`
- **Dates**: `startDate`, `dueDate`, `completedDate`
- **Budget**:
  - `amount`, `currency`, `spent`
- `progress` (0-100%)
- **Integrations**:
  - **Slack**: `channels[]`
  - **GitHub**: `repos[]` (with webhook support, auto-sync)
  - **Dropbox**: `folderId`, `folderPath`
  - **Notion**: `pageIds[]`
  - **Spotify**: `playlistId`, `playlistName`
- **Settings**: `isPublic`, `allowMemberInvites`, `requireApprovalForTasks`, `enableTimeTracking`, `enableFileSharing`
- `officeLocation` (latitude, longitude)

**Indexes**:
- `workspace`
- `createdBy`
- `teamMembers.user`
- `status`, `priority`, `dueDate`

---

### 4. **Tasks Collection**
**Purpose**: Individual work items within projects.

**Key Fields**:
- `title`, `description`
- `project`, `workspace`
- `assignee`, `reporter`
- **Status & Type**:
  - `status` (pending/todo/in-progress/review/in-review/completed/done/blocked/verified)
  - `priority` (low/medium/high/critical)
  - `type` (task/bug/feature/story/epic)
  - `taskType` (general/submission/task)
- **Requirements**:
  - `requiresFile`, `requiresLink`
  - `links[]`, `files[]`
- `category`, `tags[]`
- **Dates**: `startDate`, `dueDate`, `completedDate`
- **Time Tracking**:
  - `estimatedHours`, `actualHours`, `progress`
  - `timeEntries[]` (user, description, startTime, endTime, duration, isActive)
- **Dependencies**: `dependencies[]` (blocks/blocked-by/relates-to)
- **Subtasks**: `subtasks[]` (title, completed, completedAt)
- **GitHub Integration**:
  - `githubPr` (id, number, title, url, state, repo, author)
  - `githubIssue` (id, number, title, url, state, repo)
  - `commits[]` (sha, message, author, url, timestamp, repo, autoLinked)
  - `autoCreated`, `autoCreatedFrom` (github-pr/github-issue/slack)
- **Attachments**: `attachments[]` (filename, size, mimeType, url, uploadedBy)
- **Comments**: `comments[]` (content, author, createdAt, isEdited)
- **Performance Rating**:
  - `rating` (0-5)
  - `ratingDetails` (9 dimensions: timeliness, quality, effort, accuracy, collaboration, initiative, reliability, learning, compliance)
  - `verifiedBy`, `verifiedAt`
- **Notion Sync**: `notionSync` (pageId, url, lastSyncedAt, syncEnabled)
- **Custom Fields**: `customFields[]` (name, value, type)

**Indexes**:
- `project`, `workspace`
- `assignee`, `reporter`
- `status`, `priority`, `dueDate`, `type`

---

### 5. **Teams Collection**
**Purpose**: Groups of users within workspaces.

**Key Fields**:
- `name`, `description`
- `workspace`, `leader`
- **Members**:
  - `user`, `role` (leader/senior/member/intern)
  - `joinedAt`, `status` (active/inactive/on-leave)
- `skills[]`

**Indexes**:
- `workspace`, `leader`, `members.user`

---

### 6. **Clients Collection**
**Purpose**: Client/customer information for workspace projects.

**Key Fields**:
- `name`, `email`, `phone`, `company`, `industry`, `website`
- `address`, `contactPerson`
- `status` (active/inactive)
- `projectsCount`, `totalRevenue`, `notes`
- `workspaceId`

**Indexes**:
- `workspaceId`
- `workspaceId + name`

---

## Communication & Collaboration

### 7. **Messages Collection**
**Purpose**: Direct messages between users within workspaces.

**Key Fields**:
- `workspace`, `sender`, `recipient`
- `content`, `read`, `createdAt`

**Indexes**:
- `workspace`, `sender`, `recipient`
- `workspace + sender + recipient + createdAt`

---

### 8. **Notifications Collection**
**Purpose**: User notifications for various events.

**Key Fields**:
- `type` (task/project/workspace/system)
- `title`, `message`
- `read`, `userId`, `relatedId`
- `metadata`, `actionStatus` (accepted/declined/pending)

**Indexes**:
- `userId`
- `userId + createdAt`

---

### 9. **WorkspaceInvitations Collection**
**Purpose**: Pending invitations to join workspaces.

**Key Fields**:
- `workspace`, `inviter`, `invitee`
- `status` (pending/accepted/rejected)
- `role`, `expiresAt`

**Indexes**:
- `workspace + invitee`
- `inviter`, `invitee`, `status`

---

### 10. **JoinRequests Collection**
**Purpose**: User requests to join workspaces.

**Key Fields**:
- `workspace`, `user`
- `status` (pending/approved/rejected)
- `message`

**Indexes**:
- `workspace`, `user`

---

## Tracking & Analytics

### 11. **TimeEntries Collection**
**Purpose**: Detailed time tracking for tasks and projects.

**Key Fields**:
- `userId`, `projectId`, `taskId`
- `description`, `tags[]`
- `startTime`, `endTime`, `duration`
- `isRunning`, `isBillable`

**Indexes**:
- `userId + startTime`
- `userId + projectId`
- `userId + taskId`
- `userId + isRunning`
- Full-text search on `description + tags`

---

### 12. **DailyWorkspaceAttendances Collection**
**Purpose**: Daily attendance records for workspaces.

**Key Fields**:
- `workspace`, `date`
- `records[]` (userId, checkIn, checkOut, status, location, device)

**Indexes**:
- `workspace`
- `date`
- `workspace + date` (unique)

---

### 13. **WorkspaceAttendanceConfigs Collection**
**Purpose**: Attendance configuration for workspaces.

**Key Fields**:
- `workspace` (unique)
- `enabled`, `workingDays[]`, `workingHours`
- `checkInRadius`, `officeLocation`
- `faceRecognitionRequired`

**Indexes**:
- `workspace` (unique)

---

### 14. **Reports Collection**
**Purpose**: Custom reports and analytics.

**Key Fields**:
- `name`, `description`, `type`, `tags[]`
- `createdBy`, `isPublic`
- `filters`, `data`, `chartConfig`

**Indexes**:
- `createdBy + type`
- `createdBy + isPublic`
- Full-text search on `name + description + tags`

---

## Goals & Planning

### 15. **Goals Collection**
**Purpose**: User goals and objectives.

**Key Fields**:
- `title`, `description`, `tags[]`
- `createdBy`, `type`, `category`
- `status`, `priority`
- `targetDate`, `completedDate`
- `progress`, `metrics[]`

**Indexes**:
- `createdBy + status`
- `createdBy + type`
- `createdBy + category`
- `createdBy + targetDate`
- Full-text search on `title + description + tags`

---

### 16. **Milestones Collection**
**Purpose**: Project milestones and key deliverables.

**Key Fields**:
- `project`, `workspace`
- `name`, `description`
- `dueDate`, `completedDate`
- `status`, `progress`

**Indexes**:
- `project`
- `workspace`
- `project + dueDate`
- `workspace + status`
- `dueDate`

---

### 17. **Reminders Collection**
**Purpose**: Task and event reminders.

**Key Fields**:
- `title`, `description`, `tags[]`
- `createdBy`, `type`, `priority`
- `dueDate`, `completed`
- `repeatConfig`, `expiresAt`

**Indexes**:
- `createdBy + completed`
- `createdBy + type`
- `createdBy + priority`
- `createdBy + dueDate`
- `expiresAt` (TTL index)
- Full-text search on `title + description + tags`

---

### 18. **ReminderTriggers Collection**
**Purpose**: Scheduled reminder triggers.

**Key Fields**:
- `entityType`, `entityId`
- `userIds[]`, `triggerType`, `triggerTime`
- `payload`, `status`, `processedAt`

**Indexes**:
- `entityType + entityId`
- `triggerTime + status`

---

### 19. **PlannerEvents Collection**
**Purpose**: Calendar events and planning.

**Key Fields**:
- `title`, `description`
- `userId`, `workspaceId`
- `startDate`, `endDate`
- `type`, `priority`, `location`

**Indexes**:
- `userId`, `workspaceId`

---

## Integrations & External Services

### 20. **ConnectedAccounts Collection**
**Purpose**: OAuth and external service connections.

**Key Fields**:
- `userId`, `service`, `provider`
- `providerAccountId`, `accessToken`, `refreshToken`
- `expiresAt`, `isActive`
- `metadata` (email, name, profilePicture, etc.)

**Indexes**:
- `userId`
- `service`
- `userId + service`
- `userId + service + isActive`
- `providerAccountId + provider`

---

### 21. **FigmaFiles Collection**
**Purpose**: Figma design file integrations.

**Key Fields**:
- `workspaceId`, `clientId`, `projectId`
- `fileId`, `fileName`, `fileUrl`
- `status`, `createdBy`
- `thumbnailUrl`, `lastModified`

**Indexes**:
- `workspaceId`, `clientId`, `projectId`
- `fileId` (unique)
- `workspaceId + status`
- `projectId + status`
- `clientId + status`
- `createdBy`

---

### 22. **JiraIssues Collection**
**Purpose**: Jira issue synchronization.

**Key Fields**:
- `issueKey` (unique), `issueId`, `summary`
- `status`, `priority`, `issueType`
- `workspaceId`, `projectId`, `jiraProjectKey`
- `assignee`, `reporter`
- `description`, `labels[]`

**Indexes**:
- `issueKey` (unique)
- `status`, `priority`, `issueType`
- `workspaceId`
- `jiraProjectKey`
- `workspaceId + jiraProjectKey`
- `workspaceId + status`
- `workspaceId + assignee`
- `projectId`

---

### 23. **NotionTasks Collection**
**Purpose**: Notion task synchronization.

**Key Fields**:
- `notionPageId`, `title`, `status`
- `userId`, `workspaceId`
- `properties`, `lastSyncedAt`

**Indexes**:
- `notionPageId`
- `userId`, `workspaceId`

---

## AI & Automation

### 24. **AIUsages Collection**
**Purpose**: Track AI feature usage per user per day.

**Key Fields**:
- `userId`, `date`
- `requestCount`, `tokensUsed`
- `features` (object tracking usage by feature)

**Indexes**:
- `userId`
- `date`
- `userId + date` (unique)

---

### 25. **AICaches Collection**
**Purpose**: Cache AI responses to reduce API calls.

**Key Fields**:
- `userId`, `feature`, `requestHash`
- `response`, `expiresAt`

**Indexes**:
- `userId`, `feature`, `requestHash`
- `expiresAt`
- `userId + feature + requestHash` (unique)

---

## Administration

### 26. **Admins Collection**
**Purpose**: System administrator accounts.

**Key Fields**:
- `email` (unique), `password`, `fullName`
- `googleId` (unique, sparse)
- `isActive`, `role`, `permissions[]`

**Indexes**:
- `email` (unique)
- `googleId` (unique, sparse)
- `email + isActive`

---

### 27. **AllowedDevices Collection**
**Purpose**: Device authorization for admin access.

**Key Fields**:
- `adminId`, `deviceId`, `deviceName`
- `deviceType`, `browser`, `os`
- `ipAddress`, `isActive`
- `lastUsedAt`

**Indexes**:
- `adminId`, `deviceId`

---

### 28. **PricingPlans Collection**
**Purpose**: Available subscription plans.

**Key Fields**:
- `planKey` (unique), `name`, `description`
- `price`, `currency`, `billingCycle`
- `features[]`, `limits`

**Indexes**:
- `planKey` (unique)

---

### 29. **SubscriptionPlans Collection**
**Purpose**: User subscription details.

**Key Fields**:
- `planKey` (unique), `name`, `price`
- `features`, `limits`

**Indexes**:
- `planKey` (unique)

---

### 30. **Coupons Collection**
**Purpose**: Discount coupons and promotions.

**Key Fields**:
- `code`, `discountType`, `discountValue`
- `validFrom`, `validUntil`
- `usageLimit`, `usedCount`
- `applicablePlans[]`

**Indexes**:
- `code`

---

### 31. **ContentBanners Collection**
**Purpose**: Marketing banners and announcements.

**Key Fields**:
- `title`, `message`, `type`
- `targetAudience`, `priority`
- `startDate`, `endDate`
- `isActive`

**Indexes**:
- `isActive`, `startDate`, `endDate`

---

## Documentation & Knowledge

### 32. **Documentations Collection**
**Purpose**: Help documentation and guides.

**Key Fields**:
- `title`, `content`, `category`
- `tags[]`, `order`
- `isPublished`

**Indexes**:
- `category`, `order`

---

### 33. **Notes Collection**
**Purpose**: User personal notes.

**Key Fields**:
- `title`, `content`
- `userId`, `workspaceId`
- `tags[]`, `isPinned`

**Indexes**:
- `userId`, `workspaceId`

---

## Desktop & Mobile

### 34. **DesktopReleases Collection**
**Purpose**: Desktop application version management.

**Key Fields**:
- `version`, `releaseNotes`
- `downloadUrl`, `platform`
- `isLatest`, `isMandatory`
- `publishedAt`

**Indexes**:
- `version`, `platform`, `isLatest`

---

### 35. **DesktopSessionTokens Collection**
**Purpose**: Desktop app session management.

**Key Fields**:
- `userId`, `token`
- `deviceId`, `expiresAt`

**Indexes**:
- `userId`, `token`

---

## Financial & HR

### 36. **Payrolls Collection**
**Purpose**: Employee payroll management.

**Key Fields**:
- `userId`, `workspaceId`
- `period`, `salary`, `deductions[]`
- `bonuses[]`, `netPay`
- `status`, `paidAt`

**Indexes**:
- `userId`, `workspaceId`, `period`

---

### 37. **Requests Collection**
**Purpose**: Employee requests (leave, expense, etc.).

**Key Fields**:
- `userId`, `workspaceId`
- `type`, `description`
- `status`, `approvedBy`
- `requestDate`, `approvedDate`

**Indexes**:
- `userId`, `workspaceId`, `status`

---

## Other Collections

### 38. **Activities Collection**
**Purpose**: Activity logs and audit trail.

**Key Fields**:
- `userId`, `workspaceId`, `projectId`
- `action`, `entityType`, `entityId`
- `metadata`, `timestamp`

---

### 39. **EmailUsages Collection**
**Purpose**: Track email sending usage.

**Key Fields**:
- `userId`, `date`, `count`

---

### 40. **ChatServers Collection**
**Purpose**: Chat server configurations.

**Key Fields**:
- `name`, `workspaceId`
- `channels[]`, `members[]`

---

### 41. **ChatChannels Collection**
**Purpose**: Chat channels within servers.

**Key Fields**:
- `name`, `serverId`
- `type`, `members[]`

---

### 42. **ChatMessages Collection**
**Purpose**: Chat messages.

**Key Fields**:
- `channelId`, `userId`
- `content`, `attachments[]`
- `timestamp`

---

### 43. **DirectMessages Collection**
**Purpose**: Direct messages between users.

**Key Fields**:
- `senderId`, `recipientId`
- `content`, `read`

---

### 44. **LinearIssues Collection**
**Purpose**: Linear project management integration.

**Key Fields**:
- `issueId`, `title`, `status`
- `workspaceId`, `projectId`
- `assigneeId`, `priority`

---

## Relationships Summary

### Primary Relationships:
1. **User → Workspace** (owner/member)
2. **Workspace → Project** (contains)
3. **Project → Task** (contains)
4. **User → Task** (assignee/reporter)
5. **Workspace → Team** (contains)
6. **Team → User** (members)
7. **User → ConnectedAccount** (OAuth integrations)
8. **Project → Integration** (GitHub, Slack, Notion, etc.)
9. **Task → GitHub** (PR, Issue, Commits)
10. **User → Notification** (receives)
11. **User → TimeEntry** (logs time)
12. **Workspace → Client** (manages)
13. **User → Goal/Reminder** (creates)
14. **Project → Milestone** (has)

---

## Key Features

### 🔐 Authentication & Security
- Email/password with OTP verification
- Refresh token rotation
- Login history tracking
- Device authorization (for admins)
- Face recognition support

### 👥 Collaboration
- Multi-workspace support
- Role-based permissions (granular)
- Team management
- Direct messaging
- Notifications system

### 📊 Project Management
- Kanban-style task management
- Time tracking
- Dependencies & subtasks
- Custom fields
- Progress tracking
- Performance ratings

### 🔗 Integrations
- GitHub (webhooks, auto-sync)
- Slack
- Jira, Linear, Trello, Monday
- Notion
- Figma
- Dropbox, OneDrive
- Spotify
- OAuth multi-account support

### 🤖 AI Features
- Usage tracking
- Response caching
- AI-powered insights
- Personalized recommendations

### 📈 Analytics & Reporting
- Custom reports
- Time analytics
- Performance metrics
- Attendance tracking

### 💰 Subscription & Billing
- Tiered plans (Free/Pro/Ultra/Enterprise)
- Feature flags
- Coupon system
- Usage limits

---

## Database Statistics (from REFERENCE_FOLDER)

Based on the BSON file sizes:
- **Largest Collections**:
  - `users.bson`: 83,728 bytes (largest user base)
  - `connectedaccounts.bson`: 23,745 bytes
  - `documentations.bson`: 14,691 bytes
  - `notifications.bson`: 10,046 bytes
  - `pricingplans.bson`: 9,197 bytes

- **Active Features**:
  - Multiple users with connected accounts
  - Active notification system
  - Comprehensive documentation
  - Pricing plans configured

---

## Next Steps

You can now ask me to:
1. **Generate sample data insertion queries** for specific collections
2. **Create test data** for specific scenarios (e.g., workspace with projects and tasks)
3. **Generate MongoDB queries** for common operations
4. **Create seed scripts** for development/testing
5. **Analyze specific relationships** or data patterns

Just let me know what you need!
