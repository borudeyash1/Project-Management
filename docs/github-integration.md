# GitHub Integration Guide

This guide explains how to set up and use the GitHub integration for the Project Management Suite.

## 1. Setup

### 1.1 Create GitHub App
1. Go to **GitHub Developer Settings** > **GitHub Apps** > **New GitHub App**.
2. **Name**: `Sartthi Project Manager` (or similar).
3. **Homepage URL**: `https://sartthi.com`
4. **Callback URL**: `https://sartthi.com/api/sartthi-accounts/github/callback` (and `http://localhost:5000/...` for local dev).
5. **Webhook URL**: `https://api.sartthi.com/api/github/webhooks`
   - **Webhook Secret**: Generate a strong secret (e.g., using `openssl rand -hex 32`) and save it.
6. **Permissions**:
   - **Repository contents**: Read & Write (for code access if needed, mostly Read).
   - **Issues**: Read & Write.
   - **Pull requests**: Read & Write.
   - **Webhooks**: Read & Write.
7. **Subscribe to events**:
   - `Pull request`, `Push`, `Issue comment`, `Issues`.

### 1.2 Environment Variables
Add the following to your `server/.env`:

```env
GITHUB_APP_ID=your_app_id
GITHUB_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY----- ... "
GITHUB_WEBHOOK_SECRET=your_webhook_secret
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret
```

## 2. Features

### 2.1 Link Repositories
- Go to **Project Overview** > **Linked GitHub Repositories**.
- Click **Manage Repos**.
- Select repositories to link.
- **Auto-create Tasks**: If enabled, new Pull Requests will automatically create tasks in the project.

### 2.2 Task Sync
- **PR to Task**: A new PR labeled with project keywords or linked via UI will create/update a task.
- **Task to Issue**: Create a GitHub Issue directly from a Task card.
- **Bi-directional Sync**:
  - Closing a Task -> Closes Issue (optional).
  - Merging PR -> Completes Task.

## 3. Testing & Verification

### 3.1 Webhooks
- Use the **Recent Deliveries** tab in GitHub App settings to redeliver payloads.
- Check Server Logs for `[GitHub Webhook]` messages.

### 3.2 Manual Sync
- Use the **Sync** button in the Repository list to force an update.

## 4. Troubleshooting
- **Signature verification failed**: Check `GITHUB_WEBHOOK_SECRET`.
- **404 Not Found**: Ensure the GitHub App is installed on the target repository/organization.
