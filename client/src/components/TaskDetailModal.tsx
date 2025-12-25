import React, { useState, useEffect } from 'react';
import { X, Edit2, Save, Upload, Link as LinkIcon, Calendar, Clock, Flag, User, Tag, FileText, Check, MessageSquare, Download, Trash2, Plus, GitPullRequest, Github } from 'lucide-react';
import axios from 'axios';

interface Task {
  _id: string;
  title: string;
  description: string;
  assignee: any;
  priority: string;
  status: string;
  dueDate: Date;
  estimatedHours: number;
  actualHours: number;
  progress: number;
  tags: string[];
  subtasks: any[];
  comments: any[];
  attachments: any[];
  links: string[];
  createdAt: Date;
  updatedAt: Date;
  rating?: number;
  reviewComments?: string;
  githubPr?: {
    id: number;
    number: number;
    title: string;
    url: string;
    state: string;
  };
}

interface TaskDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  onUpdateTask: (taskId: string, updates: any) => void;
  onDeleteTask: (taskId: string) => void;
  currentUserRole: string; // 'manager' | 'employee'
  currentUserId: string;
  workspaceId?: string;
}

const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  isOpen,
  onClose,
  task,
  onUpdateTask,
  onDeleteTask,
  currentUserRole,
  currentUserId,
  workspaceId
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState<any>(null);
  const [newComment, setNewComment] = useState('');
  const [newSubtask, setNewSubtask] = useState('');
  const [newLink, setNewLink] = useState('');

  // GitHub Integration State
  const [showGithubLink, setShowGithubLink] = useState(false);
  const [githubAccounts, setGithubAccounts] = useState<any[]>([]);
  const [selectedGithubAccount, setSelectedGithubAccount] = useState<string | null>(null);
  const [repos, setRepos] = useState<any[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<any>(null);
  const [pullRequests, setPullRequests] = useState<any[]>([]);
  const [loadingGithub, setLoadingGithub] = useState(false);

  // Dropbox Integration State
  const [showDropboxPicker, setShowDropboxPicker] = useState(false);
  const [dropboxFiles, setDropboxFiles] = useState<any[]>([]);
  const [dropboxPath, setDropboxPath] = useState('');
  const [loadingDropbox, setLoadingDropbox] = useState(false);
  const [dropboxAccounts, setDropboxAccounts] = useState<any[]>([]);
  const [selectedDropboxAccount, setSelectedDropboxAccount] = useState<string | null>(null);

  // OneDrive Integration State
  const [showOnedrivePicker, setShowOnedrivePicker] = useState(false);
  const [onedriveFiles, setOnedriveFiles] = useState<any[]>([]);
  const [onedriveFolderId, setOnedriveFolderId] = useState('root');
  const [onedriveFolderStack, setOnedriveFolderStack] = useState<string[]>([]);
  const [loadingOnedrive, setLoadingOnedrive] = useState(false);
  const [onedriveAccounts, setOnedriveAccounts] = useState<any[]>([]);
  const [selectedOnedriveAccount, setSelectedOnedriveAccount] = useState<string | null>(null);

  // Figma State
  const [showFigmaPicker, setShowFigmaPicker] = useState(false);
  const [figmaFiles, setFigmaFiles] = useState<any[]>([]);
  const [loadingFigma, setLoadingFigma] = useState(false);
  const [figmaAccounts, setFigmaAccounts] = useState<any[]>([]);
  const [selectedFigmaAccount, setSelectedFigmaAccount] = useState<string | null>(null);

  // Notion State
  const [showNotionPicker, setShowNotionPicker] = useState(false);
  const [notionPages, setNotionPages] = useState<any[]>([]);
  const [loadingNotion, setLoadingNotion] = useState(false);
  const [notionAccounts, setNotionAccounts] = useState<any[]>([]);
  const [selectedNotionAccount, setSelectedNotionAccount] = useState<string | null>(null);
  const [notionQuery, setNotionQuery] = useState('');

  // Zoom State
  const [showZoomPicker, setShowZoomPicker] = useState(false);
  const [loadingZoom, setLoadingZoom] = useState(false);
  const [zoomAccounts, setZoomAccounts] = useState<any[]>([]);
  const [selectedZoomAccount, setSelectedZoomAccount] = useState<string | null>(null);
  const [zoomMeetingTopic, setZoomMeetingTopic] = useState('');
  const [zoomMeetingTime, setZoomMeetingTime] = useState('');

  // Vercel State
  const [showVercelPicker, setShowVercelPicker] = useState(false);
  const [vercelProjects, setVercelProjects] = useState<any[]>([]);
  const [loadingVercel, setLoadingVercel] = useState(false);
  const [vercelAccounts, setVercelAccounts] = useState<any[]>([]);
  const [selectedVercelAccount, setSelectedVercelAccount] = useState<string | null>(null);

  // Spotify State
  const [showSpotifyPicker, setShowSpotifyPicker] = useState(false);
  const [spotifyTracks, setSpotifyTracks] = useState<any[]>([]);
  const [loadingSpotify, setLoadingSpotify] = useState(false);
  const [spotifyAccounts, setSpotifyAccounts] = useState<any[]>([]);
  const [selectedSpotifyAccount, setSelectedSpotifyAccount] = useState<string | null>(null);
  const [spotifyQuery, setSpotifyQuery] = useState('');

  const fetchOnedriveAccounts = async () => {
    try {
      const response = await axios.get('/api/sartthi-accounts/onedrive');
      if (response.data.success && response.data.data.accounts) {
        setOnedriveAccounts(response.data.data.accounts);
        const active = response.data.data.activeAccount;
        if (active) setSelectedOnedriveAccount(active._id);
        else if (response.data.data.accounts.length > 0) setSelectedOnedriveAccount(response.data.data.accounts[0]._id);
      }
    } catch (error) {
      console.error('Failed to fetch OneDrive accounts', error);
    }
  };

  const fetchOnedriveFiles = async (folderId: string = 'root', accountId?: string) => {
    try {
      setLoadingOnedrive(true);
      const targetAccount = accountId || selectedOnedriveAccount;
      let url = `/api/onedrive/files?folderId=${folderId}`;
      if (targetAccount) url += `&accountId=${targetAccount}`;

      const response = await axios.get(url);
      if (response.data.success) {
        setOnedriveFiles(response.data.data);
        setOnedriveFolderId(folderId);

        // Stack management for navigation handled by UI
      }
    } catch (error) {
      console.error('Failed to fetch OneDrive files', error);
    } finally {
      setLoadingOnedrive(false);
    }
  };

  const handleAttachOnedriveFile = async (file: any) => {
    try {
      setLoadingOnedrive(true);
      const response = await axios.post('/api/onedrive/link', {
        itemId: file.id,
        accountId: selectedOnedriveAccount
      });
      if (response.data.success) {
        const linkData = response.data.data;
        const newAttachment = {
          _id: `onedrive_${file.id}`,
          name: file.name,
          url: linkData.link,
          type: 'onedrive',
          size: file.size,
          uploadedBy: { name: 'Current User' },
          uploadedAt: new Date()
        };
        const updatedAttachments = [...editedTask.attachments, newAttachment];
        if (!task) return;
        onUpdateTask(task._id, { attachments: updatedAttachments });
        setEditedTask({ ...editedTask, attachments: updatedAttachments });
        setShowOnedrivePicker(false);
      }
    } catch (error) {
      console.error('Failed to link OneDrive file', error);
    } finally {
      setLoadingOnedrive(false);
    }
  };

  // --- FIGMA INTEGRATION ---
  const fetchFigmaAccounts = async () => {
    try {
      const response = await axios.get('/api/sartthi-accounts/figma');
      if (response.data.success && response.data.data.accounts) {
        setFigmaAccounts(response.data.data.accounts);
        const active = response.data.data.activeAccount;
        if (active) setSelectedFigmaAccount(active._id);
        else if (response.data.data.accounts.length > 0) setSelectedFigmaAccount(response.data.data.accounts[0]._id);
      }
    } catch (error) {
      console.error('Failed to fetch Figma accounts', error);
    }
  };

  const fetchFigmaFiles = async (accountId?: string) => {
    try {
      setLoadingFigma(true);
      const targetAccount = accountId || selectedFigmaAccount;
      // Fetch projects as a proxy for items to attach
      const projectsResponse = await axios.get(targetAccount ? `/api/figma/projects?accountId=${targetAccount}` : `/api/figma/projects`);
      if (projectsResponse.data.success) {
        setFigmaFiles(projectsResponse.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch Figma items', error);
    } finally {
      setLoadingFigma(false);
    }
  };

  const handleAttachFigmaItem = async (item: any) => {
    const newAttachment = {
      _id: `figma_${item.id}`,
      name: item.name,
      url: `https://www.figma.com/file/${item.id}`,
      type: 'figma',
      size: 0,
      uploadedBy: { name: 'Current User' },
      uploadedAt: new Date()
    };

    const updatedAttachments = [...editedTask.attachments, newAttachment];
    if (!task) return;
    onUpdateTask(task._id, { attachments: updatedAttachments });
    setEditedTask({ ...editedTask, attachments: updatedAttachments });
    setShowFigmaPicker(false);
  };


  // --- NOTION INTEGRATION ---
  const fetchNotionAccounts = async () => {
    try {
      const response = await axios.get('/api/sartthi-accounts/notion');
      if (response.data.success && response.data.data.accounts) {
        setNotionAccounts(response.data.data.accounts);
        if (response.data.data.activeAccount) setSelectedNotionAccount(response.data.data.activeAccount._id);
        else if (response.data.data.accounts.length > 0) setSelectedNotionAccount(response.data.data.accounts[0]._id);
      }
    } catch (error) { console.error(error); }
  };

  const searchNotionPages = async (query: string, accountId?: string) => {
    try {
      setLoadingNotion(true);
      const targetAccount = accountId || selectedNotionAccount;
      const response = await axios.post('/api/notion/search', {
        query,
        accountId: targetAccount
      });
      if (response.data.success) {
        setNotionPages(response.data.data.results);
      }
    } catch (error) { console.error(error); }
    finally { setLoadingNotion(false); }
  };

  const handleAttachNotionPage = (page: any) => {
    const newAttachment = {
      _id: `notion_${page.id}`,
      name: page.properties?.title?.title?.[0]?.plain_text || 'Untitled Notion Page',
      url: page.url,
      type: 'notion',
      size: 0,
      uploadedBy: { name: 'Current User' },
      uploadedAt: new Date()
    };
    const updatedAttachments = [...editedTask.attachments, newAttachment];
    if (!task) return;
    onUpdateTask(task._id, { attachments: updatedAttachments });
    setEditedTask({ ...editedTask, attachments: updatedAttachments });
    setShowNotionPicker(false);
  };

  // --- ZOOM INTEGRATION ---
  const fetchZoomAccounts = async () => {
    try {
      const response = await axios.get('/api/sartthi-accounts/zoom');
      if (response.data.success && response.data.data.accounts) {
        setZoomAccounts(response.data.data.accounts);
        if (response.data.data.activeAccount) setSelectedZoomAccount(response.data.data.activeAccount._id);
        else if (response.data.data.accounts.length > 0) setSelectedZoomAccount(response.data.data.accounts[0]._id);
      }
    } catch (error) { console.error(error); }
  };

  const handleCreateZoomMeeting = async () => {
    try {
      setLoadingZoom(true);
      if (!task) return;
      const response = await axios.post('/api/zoom/meetings', {
        topic: zoomMeetingTopic || task.title,
        startTime: zoomMeetingTime || new Date().toISOString(),
        accountId: selectedZoomAccount
      });

      if (response.data.success) {
        const meeting = response.data.data;
        const newAttachment = {
          _id: `zoom_${meeting.id}`,
          name: `Zoom: ${meeting.topic}`,
          url: meeting.join_url,
          type: 'zoom',
          size: 0,
          uploadedBy: { name: 'Current User' },
          uploadedAt: new Date()
        };
        const updatedAttachments = [...editedTask.attachments, newAttachment];
        if (!task) return;
        onUpdateTask(task._id, { attachments: updatedAttachments });
        setEditedTask({ ...editedTask, attachments: updatedAttachments });
        setShowZoomPicker(false);
        setZoomMeetingTopic('');
        setZoomMeetingTime('');
      }
    } catch (error) {
      console.error("Zoom Create Error", error);
      alert("Failed to create zoom meeting");
    } finally {
      setLoadingZoom(false);
    }
  };

  // --- VERCEL INTEGRATION ---
  const fetchVercelAccounts = async () => {
    try {
      const response = await axios.get('/api/sartthi-accounts/vercel');
      if (response.data.success && response.data.data.accounts) {
        setVercelAccounts(response.data.data.accounts);
        if (response.data.data.activeAccount) setSelectedVercelAccount(response.data.data.activeAccount._id);
        else if (response.data.data.accounts.length > 0) setSelectedVercelAccount(response.data.data.accounts[0]._id);
      }
    } catch (error) { console.error(error); }
  };

  const fetchVercelProjects = async (accountId?: string) => {
    try {
      setLoadingVercel(true);
      const targetAccount = accountId || selectedVercelAccount;
      let url = '/api/vercel/projects';
      if (targetAccount) url += `?accountId=${targetAccount}`;
      const response = await axios.get(url);
      if (response.data.success) {
        setVercelProjects(response.data.data.projects);
      }
    } catch (error) { console.error(error); }
    finally { setLoadingVercel(false); }
  };

  const handleAttachVercelProject = (project: any) => {
    const newAttachment = {
      _id: `vercel_${project.id}`,
      name: project.name,
      url: `https://${project.name}.vercel.app`,
      type: 'vercel',
      size: 0,
      uploadedBy: { name: 'Current User' },
      uploadedAt: new Date()
    };
    const updatedAttachments = [...editedTask.attachments, newAttachment];
    if (!task) return;
    onUpdateTask(task._id, { attachments: updatedAttachments });
    setEditedTask({ ...editedTask, attachments: updatedAttachments });
    setShowVercelPicker(false);
  };

  // --- SPOTIFY INTEGRATION ---
  const fetchSpotifyAccounts = async () => {
    try {
      const response = await axios.get('/api/sartthi-accounts/spotify');
      if (response.data.success && response.data.data.accounts) {
        setSpotifyAccounts(response.data.data.accounts);
        if (response.data.data.activeAccount) setSelectedSpotifyAccount(response.data.data.activeAccount._id);
        else if (response.data.data.accounts.length > 0) setSelectedSpotifyAccount(response.data.data.accounts[0]._id);
      }
    } catch (error) { console.error(error); }
  };

  const searchSpotify = async (query: string, accountId?: string) => {
    try {
      setLoadingSpotify(true);
      const targetAccount = accountId || selectedSpotifyAccount;
      const response = await axios.post('/api/spotify/search', {
        query,
        type: 'track',
        accountId: targetAccount
      });
      if (response.data.success) {
        setSpotifyTracks(response.data.data.tracks.items);
      }
    } catch (error) { console.error(error); }
    finally { setLoadingSpotify(false); }
  };

  const handleAttachSpotifyTrack = (track: any) => {
    const newAttachment = {
      _id: `spotify_${track.id}`,
      name: `${track.name} - ${track.artists[0].name}`,
      url: track.external_urls.spotify,
      type: 'spotify',
      size: 0,
      uploadedBy: { name: 'Current User' },
      uploadedAt: new Date()
    };
    const updatedAttachments = [...editedTask.attachments, newAttachment];
    if (!task) return;
    onUpdateTask(task._id, { attachments: updatedAttachments });
    setEditedTask({ ...editedTask, attachments: updatedAttachments });
    setShowSpotifyPicker(false);
  };

  const fetchDropboxAccounts = async () => {
    try {
      const response = await axios.get('/api/sartthi-accounts/dropbox');
      if (response.data.success && response.data.data.accounts) {
        setDropboxAccounts(response.data.data.accounts);
        const active = response.data.data.activeAccount;
        if (active) setSelectedDropboxAccount(active._id);
        else if (response.data.data.accounts.length > 0) setSelectedDropboxAccount(response.data.data.accounts[0]._id);
      }
    } catch (error) {
      console.error('Failed to fetch Dropbox accounts', error);
    }
  };

  const fetchDropboxFiles = async (path: string = '', accountId?: string) => {
    try {
      setLoadingDropbox(true);
      const targetAccount = accountId || selectedDropboxAccount;
      let url = `/api/dropbox/files?path=${path}`;
      if (targetAccount) url += `&accountId=${targetAccount}`;

      const response = await axios.get(url);
      if (response.data.success) {
        setDropboxFiles(response.data.data);
        setDropboxPath(path);
      }
    } catch (error) {
      console.error('Failed to fetch Dropbox files', error);
    } finally {
      setLoadingDropbox(false);
    }
  };

  const handleAttachDropboxFile = async (file: any) => {
    try {
      setLoadingDropbox(true);
      const response = await axios.post('/api/dropbox/link', {
        path: file.path,
        accountId: selectedDropboxAccount
      });
      if (response.data.success) {
        const linkData = response.data.data;
        const newAttachment = {
          _id: `dropbox_${file.id}`,
          name: file.name,
          url: linkData.link,
          type: 'dropbox',
          size: linkData.metadata.size,
          uploadedBy: { name: 'Current User' },
          uploadedAt: new Date()
        };
        const updatedAttachments = [...editedTask.attachments, newAttachment];
        if (!task) return;
        onUpdateTask(task._id, { attachments: updatedAttachments });
        setEditedTask({ ...editedTask, attachments: updatedAttachments });
        setShowDropboxPicker(false);
      }
    } catch (error) {
      console.error('Failed to link Dropbox file', error);
    } finally {
      setLoadingDropbox(false);
    }
  };

  const fetchGithubAccounts = async () => {
    try {
      const response = await axios.get('/api/sartthi-accounts/github');
      if (response.data.success && response.data.data.accounts) {
        setGithubAccounts(response.data.data.accounts);
        // Default to active account or first one
        const active = response.data.data.activeAccount;
        if (active) setSelectedGithubAccount(active._id);
        else if (response.data.data.accounts.length > 0) setSelectedGithubAccount(response.data.data.accounts[0]._id);
      }
    } catch (error) {
      console.error('Failed to fetch GitHub accounts', error);
    }
  };

  const fetchRepos = async (accountId?: string) => {
    try {
      setLoadingGithub(true);
      const targetAccount = accountId || selectedGithubAccount;
      // Pass accountId query param if present
      const url = targetAccount ? `/api/github/repos?accountId=${targetAccount}` : '/api/github/repos';

      const response = await axios.get(url);
      if (response.data.success) {
        setRepos(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch repos', error);
      alert('Failed to fetch repositories. Ensure an account is connected.');
    } finally {
      setLoadingGithub(false);
    }
  };

  const fetchPRs = async (owner: string, repo: string) => {
    try {
      setLoadingGithub(true);
      const targetAccount = selectedGithubAccount;
      const url = targetAccount
        ? `/api/github/repos/${owner}/${repo}/pulls?accountId=${targetAccount}`
        : `/api/github/repos/${owner}/${repo}/pulls`;
      const response = await axios.get(url);
      if (response.data.success) {
        setPullRequests(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch PRs', error);
    } finally {
      setLoadingGithub(false);
    }
  };

  const handleLinkPR = (pr: any) => {
    if (!task) return;
    const prData = {
      githubPr: {
        id: pr.id,
        number: pr.number,
        title: pr.title,
        url: pr.html_url,
        state: pr.state
      }
    };
    onUpdateTask(task._id, prData);
    setEditedTask({ ...editedTask, ...prData });
    setShowGithubLink(false);
  };

  const handleUnlinkPR = () => {
    if (!task) return;
    if (window.confirm('Are you sure you want to unlink this Pull Request?')) {
      onUpdateTask(task._id, { githubPr: null });
      setEditedTask({ ...editedTask, githubPr: null });
    }
  };

  useEffect(() => {
    if (task) {
      setEditedTask({ ...task });
    }
  }, [task]);

  if (!isOpen || !task || !editedTask) return null;

  const isManager = currentUserRole === 'manager' || currentUserRole === 'owner';
  const isAssignee = task.assignee?._id === currentUserId;
  const canEdit = isManager || isAssignee;

  const handleSave = () => {
    onUpdateTask(task._id, editedTask);
    setIsEditing(false);
  };

  const handleStatusChange = (newStatus: string) => {
    const updates = { status: newStatus };

    // If employee marks as completed, change to review
    if (newStatus === 'completed' && !isManager) {
      updates.status = 'review';
    }

    onUpdateTask(task._id, updates);
    setEditedTask({ ...editedTask, ...updates });
  };

  const handleSubtaskToggle = (subtaskId: string) => {
    const updatedSubtasks = editedTask.subtasks.map((st: any) =>
      st.id === subtaskId ? { ...st, completed: !st.completed } : st
    );

    // Calculate progress based on completed subtasks
    const completedCount = updatedSubtasks.filter((st: any) => st.completed).length;
    const progress = updatedSubtasks.length > 0
      ? Math.round((completedCount / updatedSubtasks.length) * 100)
      : 0;

    const updates = {
      subtasks: updatedSubtasks,
      progress: progress
    };

    onUpdateTask(task._id, updates);
    setEditedTask({ ...editedTask, ...updates });
  };

  const handleAddSubtask = () => {
    if (newSubtask.trim()) {
      const newSubtaskObj = {
        id: `subtask_${Date.now()}`,
        title: newSubtask.trim(),
        completed: false
      };

      const updatedSubtasks = [...editedTask.subtasks, newSubtaskObj];
      onUpdateTask(task._id, { subtasks: updatedSubtasks });
      setEditedTask({ ...editedTask, subtasks: updatedSubtasks });
      setNewSubtask('');
    }
  };

  const handleRemoveSubtask = (subtaskId: string) => {
    const updatedSubtasks = editedTask.subtasks.filter((st: any) => st.id !== subtaskId);
    onUpdateTask(task._id, { subtasks: updatedSubtasks });
    setEditedTask({ ...editedTask, subtasks: updatedSubtasks });
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      const comment = {
        _id: `comment_${Date.now()}`,
        content: newComment.trim(),
        author: {
          _id: currentUserId,
          name: 'Current User' // Would be actual user name
        },
        createdAt: new Date(),
        replies: []
      };

      const updatedComments = [...editedTask.comments, comment];
      onUpdateTask(task._id, { comments: updatedComments });
      setEditedTask({ ...editedTask, comments: updatedComments });
      setNewComment('');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      const newAttachments: any[] = [];

      for (const file of filesArray) {
        // Optimistic UI update (placeholder)
        const tempId = `temp_${Date.now()}`;

        try {
          const formData = new FormData();
          formData.append('file', file);
          // Use passed prop workspaceId or fallback to task property
          const targetWorkspaceId = workspaceId || (task as any).workspace?._id || (task as any).workspace;

          if (!targetWorkspaceId) {
            console.error("Workspace ID missing for upload");
            alert("Cannot upload file: Workspace context missing.");
            continue;
          }

          const response = await axios.post(`/api/vault-workspace/upload/${targetWorkspaceId}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });

          const uploadedDoc = response.data.document;

          // Map Vault Document to Task Attachment
          newAttachments.push({
            _id: uploadedDoc._id,
            name: uploadedDoc.name,
            url: uploadedDoc.url || uploadedDoc.webViewLink, // Use Google Drive Link
            type: uploadedDoc.type,
            size: uploadedDoc.size,
            uploadedBy: { name: 'Current User' }, // Should be real user
            uploadedAt: new Date()
          });

        } catch (error) {
          console.error("Failed to upload file", error);
          alert(`Failed to upload ${file.name}`);
        }
      }

      const updatedAttachments = [...editedTask.attachments, ...newAttachments];
      onUpdateTask(task._id, { attachments: updatedAttachments });
      setEditedTask({ ...editedTask, attachments: updatedAttachments });
    }
  };

  const handleAddLink = () => {
    if (newLink.trim()) {
      const updatedLinks = [...editedTask.links, newLink.trim()];
      onUpdateTask(task._id, { links: updatedLinks });
      setEditedTask({ ...editedTask, links: updatedLinks });
      setNewLink('');
    }
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this task? This action cannot be undone.')) {
      onDeleteTask(task._id);
      onClose();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'review': return 'bg-purple-100 text-purple-800';
      case 'blocked': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-200 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-300 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              {isEditing ? (
                <input
                  type="text"
                  value={editedTask.title}
                  onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
                  className="text-xl font-semibold text-gray-900 border-b-2 border-accent focus:outline-none w-full"
                />
              ) : (
                <h2 className="text-xl font-semibold text-gray-900">{task.title}</h2>
              )}
              <div className="flex items-center gap-2 mt-2">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(editedTask.status)}`}>
                  {editedTask.status}
                </span>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(editedTask.priority)}`}>
                  {editedTask.priority}
                </span>
                {task.rating && (
                  <span className="flex items-center gap-1 text-sm text-yellow-600">
                    ⭐ {task.rating.toFixed(1)}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {canEdit && !isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Edit2 className="w-5 h-5 text-gray-600" />
                </button>
              )}
              {isEditing && (
                <button
                  onClick={handleSave}
                  className="p-2 hover:bg-green-100 rounded-lg transition-colors"
                >
                  <Save className="w-5 h-5 text-green-600" />
                </button>
              )}
              {isManager && (
                <button
                  onClick={handleDelete}
                  className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                >
                  <Trash2 className="w-5 h-5 text-red-600" />
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Description */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Description</h3>
                {isEditing ? (
                  <textarea
                    value={editedTask.description}
                    onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-700">{task.description || 'No description provided'}</p>
                )}
              </div>

              {/* Status Update (for employees) */}
              {canEdit && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">Update Status</h3>
                  <select
                    value={editedTask.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                    disabled={task.status === 'completed' && !isManager}
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="blocked">Blocked</option>
                    {isAssignee && <option value="completed">Mark as Completed</option>}
                    {isManager && <option value="review">In Review</option>}
                    {isManager && <option value="completed">Completed (Final)</option>}
                  </select>
                  {!isManager && editedTask.status === 'review' && (
                    <p className="text-sm text-purple-600 mt-2">
                      ⏳ Waiting for manager review...
                    </p>
                  )}
                </div>
              )}

              {/* Subtasks/Milestones */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-gray-900">
                    Subtasks ({editedTask.subtasks.filter((st: any) => st.completed).length}/{editedTask.subtasks.length})
                  </h3>
                  <span className="text-sm text-gray-600">{editedTask.progress}% Complete</span>
                </div>

                <div className="space-y-2">
                  {editedTask.subtasks.map((subtask: any) => (
                    <div key={subtask.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <input
                        type="checkbox"
                        checked={subtask.completed}
                        onChange={() => handleSubtaskToggle(subtask.id)}
                        className="w-5 h-5 rounded"
                        disabled={!canEdit}
                      />
                      <span className={`flex-1 ${subtask.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                        {subtask.title}
                      </span>
                      {isManager && (
                        <button
                          onClick={() => handleRemoveSubtask(subtask.id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}

                  {isManager && (
                    <div className="flex gap-2 mt-2">
                      <input
                        type="text"
                        value={newSubtask}
                        onChange={(e) => setNewSubtask(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddSubtask()}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                        placeholder="Add new subtask..."
                      />
                      <button
                        onClick={handleAddSubtask}
                        className="px-4 py-2 bg-accent text-gray-900 rounded-lg hover:bg-accent-hover"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* File Attachments */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Attachments</h3>
                <div className="space-y-2">
                  {canEdit && (
                    <div className="flex gap-2">
                      <label className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-accent cursor-pointer transition-colors">
                        <Upload className="w-5 h-5 text-gray-600" />
                        <span className="text-sm text-gray-600">Upload files</span>
                        <input
                          type="file"
                          multiple
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </label>
                      <button
                        onClick={() => {
                          setShowDropboxPicker(!showDropboxPicker);
                          if (!showDropboxPicker) {
                            if (dropboxAccounts.length === 0) fetchDropboxAccounts().then(() => fetchDropboxFiles(''));
                            else fetchDropboxFiles('');
                          }
                        }}
                        className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 text-sm text-gray-700"
                      >
                        <svg className="w-5 h-5 text-blue-600" viewBox="0 0 24 24" fill="currentColor"><path d="M6 3l-6 5 6 5 6-5-6-5zm-6 13l6 5 6-5-6-5-6 5zm12 5l6 5 6-5-6-5-6 5zm6-13l6 5-6 5-6-5-6-5z" /></svg>
                        Dropbox
                      </button>
                    </div>
                  )}

                  <button
                    onClick={() => {
                      setShowOnedrivePicker(!showOnedrivePicker);
                      setShowDropboxPicker(false); // Close other pickers
                      if (!showOnedrivePicker) {
                        if (onedriveAccounts.length === 0) fetchOnedriveAccounts().then(() => fetchOnedriveFiles('root'));
                        else fetchOnedriveFiles('root');
                      }
                    }}
                    className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 text-sm text-gray-700"
                  >
                    <svg className="w-5 h-5 text-blue-700" viewBox="0 0 24 24" fill="currentColor"><path d="M5.5 15.5c-.8 0-1.5-.7-1.5-1.5s.7-1.5 1.5-1.5 1.5.7 1.5 1.5-.7 1.5-1.5 1.5zm6.5 0c-.8 0-1.5-.7-1.5-1.5s.7-1.5 1.5-1.5 1.5.7 1.5 1.5-.7 1.5-1.5 1.5zm6.5 0c-.8 0-1.5-.7-1.5-1.5s.7-1.5 1.5-1.5 1.5.7 1.5 1.5-.7 1.5-1.5 1.5z M19.9 8.6c-.3-2.5-2.5-4.5-5.1-4.5-2.2 0-4.1 1.4-4.8 3.4-.3 0-.5-.1-.8-.1-2.9 0-5.3 2.1-5.7 4.9C1.5 13.1 0 15 0 17.3c0 2.6 2.1 4.7 4.7 4.7h14.8c2.5 0 4.5-2 4.5-4.5.1-2.2-1.5-4.1-3.6-4.5l-.5-.4z" /></svg>
                    OneDrive
                  </button>
                  {/* FIGMA BUTTON */}
                  <button onClick={() => { setShowFigmaPicker(!showFigmaPicker); if (!showFigmaPicker) fetchFigmaAccounts().then(() => fetchFigmaFiles()); }} className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 text-sm text-gray-700">
                    <span className="text-pink-500 font-bold">F</span> Figma
                  </button>
                  <button onClick={() => { setShowNotionPicker(!showNotionPicker); if (!showNotionPicker) fetchNotionAccounts(); }} className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 text-sm text-gray-700">
                    <span className="text-black font-bold">N</span> Notion
                  </button>
                  <button onClick={() => { setShowZoomPicker(!showZoomPicker); if (!showZoomPicker) fetchZoomAccounts(); }} className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 text-sm text-gray-700">
                    <span className="text-blue-500 font-bold">Z</span> Zoom
                  </button>
                  <button onClick={() => { setShowVercelPicker(!showVercelPicker); if (!showVercelPicker) fetchVercelAccounts().then(() => fetchVercelProjects()); }} className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 text-sm text-gray-700">
                    <span className="text-black font-bold">▲</span> Vercel
                  </button>
                  <button onClick={() => { setShowSpotifyPicker(!showSpotifyPicker); if (!showSpotifyPicker) fetchSpotifyAccounts(); }} className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 text-sm text-gray-700">
                    <span className="text-green-500 font-bold">S</span> Spotify
                  </button>
                </div>



                {showOnedrivePicker && (
                  <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 mt-2">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-semibold text-sm">Select File from OneDrive</h4>
                      <button onClick={() => setShowOnedrivePicker(false)}><X className="w-4 h-4 text-gray-500" /></button>
                    </div>

                    {/* Account Selector */}
                    {onedriveAccounts.length > 1 && (
                      <div className="mb-2">
                        <select
                          className="w-full text-sm border-gray-300 rounded-lg"
                          value={selectedOnedriveAccount || ''}
                          onChange={(e) => {
                            setSelectedOnedriveAccount(e.target.value);
                            setOnedriveFolderStack([]);
                            fetchOnedriveFiles('root', e.target.value);
                          }}
                        >
                          {onedriveAccounts.map(acc => (
                            <option key={acc._id} value={acc._id}>{acc.providerName} ({acc.providerEmail})</option>
                          ))}
                        </select>
                      </div>
                    )}

                    {loadingOnedrive ? (
                      <div className="text-center py-4 text-sm text-gray-500">Loading OneDrive...</div>
                    ) : (
                      <div className="space-y-1 max-h-40 overflow-y-auto">
                        {onedriveFolderStack.length > 0 && (
                          <button
                            onClick={() => {
                              const newStack = [...onedriveFolderStack];
                              newStack.pop(); // Remove current
                              const parentId = newStack.length > 0 ? newStack[newStack.length - 1] : 'root';
                              setOnedriveFolderStack(newStack);
                              fetchOnedriveFiles(parentId);
                            }}
                            className="w-full text-left px-2 py-1 hover:bg-gray-200 rounded text-sm font-medium text-gray-700"
                          >
                            .. (Up)
                          </button>
                        )}
                        {onedriveFiles.map((file: any) => (
                          <button
                            key={file.id}
                            onClick={() => {
                              if (file.type === 'folder') {
                                const newStack = [...onedriveFolderStack, file.id];
                                setOnedriveFolderStack(newStack);
                                fetchOnedriveFiles(file.id);
                              }
                              else handleAttachOnedriveFile(file);
                            }}
                            className="w-full text-left px-2 py-1 hover:bg-white rounded text-sm flex items-center gap-2"
                          >
                            {file.type === 'folder' ? (
                              <span className="text-yellow-500">📁</span>
                            ) : (
                              <span className="text-blue-700">☁️</span>
                            )}
                            <span className="truncate">{file.name}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {showDropboxPicker && (
                  <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 mt-2">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-semibold text-sm">Select File from Dropbox</h4>
                      <button onClick={() => setShowDropboxPicker(false)}><X className="w-4 h-4 text-gray-500" /></button>
                    </div>

                    {/* Account Selector */}
                    {dropboxAccounts.length > 1 && (
                      <div className="mb-2">
                        <select
                          className="w-full text-sm border-gray-300 rounded-lg"
                          value={selectedDropboxAccount || ''}
                          onChange={(e) => {
                            setSelectedDropboxAccount(e.target.value);
                            fetchDropboxFiles('', e.target.value);
                          }}
                        >
                          {dropboxAccounts.map(acc => (
                            <option key={acc._id} value={acc._id}>{acc.providerName} ({acc.providerEmail})</option>
                          ))}
                        </select>
                      </div>
                    )}

                    {loadingDropbox ? (
                      <div className="text-center py-4 text-sm text-gray-500">Loading Dropbox...</div>
                    ) : (
                      <div className="space-y-1 max-h-40 overflow-y-auto">
                        {dropboxPath && (
                          <button
                            onClick={() => {
                              const parentPath = dropboxPath.substring(0, dropboxPath.lastIndexOf('/'));
                              fetchDropboxFiles(parentPath);
                            }}
                            className="w-full text-left px-2 py-1 hover:bg-gray-200 rounded text-sm font-medium text-gray-700"
                          >
                            .. (Up)
                          </button>
                        )}
                        {dropboxFiles.map((file: any) => (
                          <button
                            key={file.id}
                            onClick={() => {
                              if (file.type === 'folder') fetchDropboxFiles(file.path);
                              else handleAttachDropboxFile(file);
                            }}
                            className="w-full text-left px-2 py-1 hover:bg-white rounded text-sm flex items-center gap-2"
                          >
                            {file.type === 'folder' ? (
                              <span className="text-yellow-500">📁</span>
                            ) : (
                              <span className="text-blue-500">📄</span>
                            )}
                            <span className="truncate">{file.name}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* FIGMA PICKER */}
                {showFigmaPicker && (
                  <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 mt-2">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-semibold text-sm">Select Figma file</h4>
                      <button onClick={() => setShowFigmaPicker(false)}><X className="w-4 h-4 text-gray-500" /></button>
                    </div>
                    {figmaAccounts.length > 1 && (
                      <select className="w-full text-sm border-gray-300 rounded-lg mb-2" value={selectedFigmaAccount || ''} onChange={(e) => { setSelectedFigmaAccount(e.target.value); fetchFigmaFiles(e.target.value); }}>
                        {figmaAccounts.map(acc => <option key={acc._id} value={acc._id}>{acc.providerName}</option>)}
                      </select>
                    )}
                    {loadingFigma ? <div className="text-center text-sm py-4">Loading Figma...</div> : (
                      <div className="space-y-1 max-h-40 overflow-y-auto">
                        {figmaFiles.map((file: any) => (
                          <button key={file.id || file.key} onClick={() => handleAttachFigmaItem(file)} className="w-full text-left px-2 py-1 hover:bg-white rounded text-sm flex items-center gap-2">
                            <span className="text-pink-500 font-bold">F</span> {file.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                {/* NOTION PICKER */}
                {showNotionPicker && (
                  <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 mt-2">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-semibold text-sm">Search Notion Page</h4>
                      <button onClick={() => setShowNotionPicker(false)}><X className="w-4 h-4 text-gray-500" /></button>
                    </div>
                    <input type="text" value={notionQuery} onChange={(e) => { setNotionQuery(e.target.value); if (e.target.value.length > 2) searchNotionPages(e.target.value); }} placeholder="Search pages..." className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2 text-sm" />
                    {loadingNotion ? <div className="text-center text-sm py-4">Searching Notion...</div> : (
                      <div className="space-y-1 max-h-40 overflow-y-auto">
                        {notionPages.map((page: any) => (
                          <button key={page.id} onClick={() => handleAttachNotionPage(page)} className="w-full text-left px-2 py-1 hover:bg-white rounded text-sm flex items-center gap-2">
                            <span className="text-black font-bold">N</span> {page.properties?.title?.title?.[0]?.plain_text || 'Untitled'}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                {/* ZOOM PICKER */}
                {showZoomPicker && (
                  <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 mt-2">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-semibold text-sm">Create Zoom Meeting</h4>
                      <button onClick={() => setShowZoomPicker(false)}><X className="w-4 h-4 text-gray-500" /></button>
                    </div>
                    <input type="text" placeholder="Meeting Topic" value={zoomMeetingTopic} onChange={(e) => setZoomMeetingTopic(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2 text-sm" />
                    <input type="datetime-local" value={zoomMeetingTime} onChange={(e) => setZoomMeetingTime(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2 text-sm" />
                    <button onClick={handleCreateZoomMeeting} disabled={loadingZoom} className="w-full py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50">
                      {loadingZoom ? 'Creating...' : 'Create Meeting'}
                    </button>
                  </div>
                )}
                {/* VERCEL PICKER */}
                {showVercelPicker && (
                  <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 mt-2">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-semibold text-sm">Select Vercel Project</h4>
                      <button onClick={() => setShowVercelPicker(false)}><X className="w-4 h-4 text-gray-500" /></button>
                    </div>
                    {loadingVercel ? <div className="text-center text-sm py-4">Loading Projects...</div> : (
                      <div className="space-y-1 max-h-40 overflow-y-auto">
                        {vercelProjects.map((proj: any) => (
                          <button key={proj.id} onClick={() => handleAttachVercelProject(proj)} className="w-full text-left px-2 py-1 hover:bg-white rounded text-sm flex items-center gap-2">
                            <span className="text-black font-bold">▲</span> {proj.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                {/* SPOTIFY PICKER */}
                {showSpotifyPicker && (
                  <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 mt-2">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-semibold text-sm">Search Spotify Track</h4>
                      <button onClick={() => setShowSpotifyPicker(false)}><X className="w-4 h-4 text-gray-500" /></button>
                    </div>
                    <input type="text" value={spotifyQuery} onChange={(e) => { setSpotifyQuery(e.target.value); if (e.target.value.length > 2) searchSpotify(e.target.value); }} placeholder="Search tracks..." className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2 text-sm" />
                    {loadingSpotify ? <div className="text-center text-sm py-4">Searching Spotify...</div> : (
                      <div className="space-y-1 max-h-40 overflow-y-auto">
                        {spotifyTracks.map((track: any) => (
                          <button key={track.id} onClick={() => handleAttachSpotifyTrack(track)} className="w-full text-left px-2 py-1 hover:bg-white rounded text-sm flex items-center gap-2">
                            <span className="text-green-500 font-bold">S</span> {track.name} - {track.artists[0].name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {editedTask.attachments.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {editedTask.attachments.map((file: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          {file.type === 'dropbox' ? (
                            <svg className="w-4 h-4 text-blue-600 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M6 3l-6 5 6 5 6-5-6-5zm-6 13l6 5 6-5-6-5-6 5zm12 5l6 5 6-5-6-5-6 5zm6-13l6 5-6 5-6-5-6-5z" /></svg>
                          ) : (
                            <FileText className="w-4 h-4 text-gray-600 flex-shrink-0" />
                          )}
                          <span className="text-sm text-gray-700 truncate">{file.name}</span>
                        </div>
                        <a
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 text-accent-dark hover:bg-blue-50 rounded ml-2"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Links */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Links</h3>
                <div className="space-y-2">
                  {canEdit && (
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={newLink}
                        onChange={(e) => setNewLink(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddLink()}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                        placeholder="https://example.com"
                      />
                      <button
                        onClick={handleAddLink}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {editedTask.links.length > 0 && (
                    <div className="space-y-2">
                      {editedTask.links.map((link: string, index: number) => (
                        <a
                          key={index}
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <LinkIcon className="w-4 h-4 text-accent-dark" />
                          <span className="text-sm text-accent-dark hover:underline truncate">{link}</span>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* GitHub Integration */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <Github className="w-4 h-4" />
                  GitHub Integration
                </h3>

                {editedTask.githubPr ? (
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <GitPullRequest className={`w-5 h-5 ${editedTask.githubPr.state === 'open' ? 'text-green-600' : 'text-purple-600'}`} />
                      <div>
                        <a href={editedTask.githubPr.url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-blue-600 hover:underline">
                          #{editedTask.githubPr.number} {editedTask.githubPr.title}
                        </a>
                        <p className="text-xs text-gray-500 capitalize">State: {editedTask.githubPr.state}</p>
                      </div>
                    </div>
                    {canEdit && (
                      <button onClick={handleUnlinkPR} className="p-1 hover:bg-red-50 text-red-500 rounded">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ) : (
                  canEdit && (
                    <div className="space-y-3">
                      {!showGithubLink ? (
                        <button
                          onClick={() => {
                            setShowGithubLink(true);
                            if (githubAccounts.length === 0) {
                              fetchGithubAccounts().then(() => fetchRepos());
                            } else if (repos.length === 0) {
                              fetchRepos();
                            }
                          }}
                          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg px-3 py-2 w-full justify-center hover:bg-gray-50 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                          Link Pull Request
                        </button>
                      ) : (
                        <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                          <div className="flex justify-between items-center mb-3">
                            <h4 className="text-xs font-semibold uppercase text-gray-500">Select Pull Request</h4>
                            <button onClick={() => setShowGithubLink(false)}><X className="w-4 h-4 text-gray-400" /></button>
                          </div>

                          {loadingGithub ? (
                            <div className="text-center py-4 text-sm text-gray-500">Loading...</div>
                          ) : (
                            <div className="space-y-3">
                              {/* Account Selector if multiple accounts exist */}
                              {githubAccounts.length > 1 && !selectedRepo && (
                                <select
                                  className="w-full text-sm border-gray-300 rounded-lg mb-2"
                                  value={selectedGithubAccount || ''}
                                  onChange={(e) => {
                                    setSelectedGithubAccount(e.target.value);
                                    fetchRepos(e.target.value);
                                  }}
                                >
                                  {githubAccounts.map(acc => (
                                    <option key={acc._id} value={acc._id}>
                                      {acc.providerName} ({acc.providerEmail})
                                    </option>
                                  ))}
                                </select>
                              )}

                              {!selectedRepo ? (
                                <select
                                  className="w-full text-sm border-gray-300 rounded-md"
                                  onChange={(e) => {
                                    const repo = repos.find(r => r.full_name === e.target.value);
                                    if (repo) {
                                      setSelectedRepo(repo);
                                      fetchPRs(repo.owner.login, repo.name);
                                    }
                                  }}
                                  defaultValue=""
                                >
                                  <option value="" disabled>Select Repository</option>
                                  {repos.map(repo => (
                                    <option key={repo.id} value={repo.full_name}>{repo.full_name}</option>
                                  ))}
                                </select>
                              ) : (
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                                    <button onClick={() => { setSelectedRepo(null); setPullRequests([]); }} className="hover:underline text-blue-600">&larr; Back</button>
                                    <span className="font-medium text-gray-900">{selectedRepo.full_name}</span>
                                  </div>

                                  {pullRequests.length === 0 ? (
                                    <p className="text-xs text-gray-500 italic">No open pull requests found.</p>
                                  ) : (
                                    <ul className="max-h-40 overflow-y-auto space-y-1">
                                      {pullRequests.map(pr => (
                                        <li key={pr.id}>
                                          <button
                                            onClick={() => handleLinkPR(pr)}
                                            className="w-full text-left p-2 hover:bg-white rounded border border-transparent hover:border-gray-200 text-sm flex items-start gap-2"
                                          >
                                            <GitPullRequest className="w-4 h-4 text-green-600 mt-0.5" />
                                            <span className="truncate">#{pr.number} {pr.title}</span>
                                          </button>
                                        </li>
                                      ))}
                                    </ul>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                )}
              </div>

              {/* Comments */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">
                  <MessageSquare className="w-4 h-4 inline mr-1" />
                  Comments ({editedTask.comments.length})
                </h3>
                <div className="space-y-3">
                  {editedTask.comments.map((comment: any) => (
                    <div key={comment._id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm text-gray-900">{comment.author.name}</span>
                        <span className="text-xs text-gray-600">
                          {new Date(comment.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{comment.content}</p>
                    </div>
                  ))}

                  {canEdit && (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                        placeholder="Add a comment..."
                      />
                      <button
                        onClick={handleAddComment}
                        className="px-4 py-2 bg-accent text-gray-900 rounded-lg hover:bg-accent-hover"
                      >
                        Send
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Task Info */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <h3 className="text-sm font-semibold text-gray-900">Task Details</h3>

                <div>
                  <p className="text-xs text-gray-600 mb-1">Assigned To</p>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-900">
                      {task.assignee?.name || 'Unassigned'}
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-gray-600 mb-1">Due Date</p>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-900">
                      {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-gray-600 mb-1">Estimated Hours</p>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-900">{task.estimatedHours}h</span>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-gray-600 mb-1">Priority</p>
                  <div className="flex items-center gap-2">
                    <Flag className="w-4 h-4 text-gray-600" />
                    <span className={`text-sm font-medium capitalize ${task.priority === 'critical' ? 'text-red-600' :
                      task.priority === 'high' ? 'text-orange-600' :
                        task.priority === 'medium' ? 'text-yellow-600' :
                          'text-gray-600'
                      }`}>
                      {task.priority}
                    </span>
                  </div>
                </div>

                {task.tags.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-600 mb-2">Tags</p>
                    <div className="flex flex-wrap gap-1">
                      {task.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Progress */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Progress</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Completion</span>
                    <span className="font-medium text-gray-900">{editedTask.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-300 rounded-full h-2">
                    <div
                      className="bg-accent h-2 rounded-full transition-all duration-300"
                      style={{ width: `${editedTask.progress}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Review Status */}
              {task.reviewComments && (
                <div className="bg-purple-50 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-purple-900 mb-2">Manager Review</h3>
                  <p className="text-sm text-purple-800">{task.reviewComments}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div >
  );
};

export default TaskDetailModal;
