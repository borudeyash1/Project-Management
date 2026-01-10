import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../../context/AppContext';
import { useDock } from '../../context/DockContext';
import {
  Mail, Phone, Shield, User as UserIcon, BarChart3, MessageSquare, Bot,
  Calendar, Building2, Clock, AlertCircle, TrendingUp, Users, CheckSquare,
  Bell, Search, Plus, Filter, Eye, ArrowRight
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import apiService from '../../services/api';

const WorkspaceProfile: React.FC = () => {
  const { t } = useTranslation();
  const { state, addToast } = useApp();
  const { dockPosition } = useDock();
  const navigate = useNavigate();
  const location = useLocation();
  const currentWorkspace = state.workspaces.find((ws) => ws._id === state.currentWorkspace);
  const isOwner = currentWorkspace?.owner === state.userProfile._id;

  const [activeTab, setActiveTab] = useState('profile');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [userSubscription, setUserSubscription] = useState<any>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [facePreview, setFacePreview] = useState<string | null>(null);
  const [faceStatus, setFaceStatus] = useState<string | null>(null);
  const [faceSaving, setFaceSaving] = useState(false);
  const [autoScanTriggered, setAutoScanTriggered] = useState(false);
  const [workspaceMembers, setWorkspaceMembers] = useState<any[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [profileData, setProfileData] = useState({
    fullName: state.userProfile.fullName || '',
    email: state.userProfile.email || '',
    contactNumber: state.userProfile.contactNumber || '',
    about: state.userProfile.about || ''
  });

  const memberRecord = currentWorkspace?.members?.find((member) => member.user === state.userProfile._id);
  const derivedRole = memberRecord?.role || (isOwner ? 'owner' : 'member');
  const displayRole = derivedRole === 'owner' ? t('workspace.profile.role.owner') : t('workspace.profile.role.member');

  // Fetch user's active subscription
  useEffect(() => {
    const fetchUserSubscription = async () => {
      try {
        const response = await apiService.get('/subscriptions/active');
        if (response.data.success && response.data.data) {
          setUserSubscription(response.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch user subscription:', error);
      }
    };

    fetchUserSubscription();
  }, []);

  // Fetch workspace members for inbox
  useEffect(() => {
    const fetchWorkspaceMembers = async () => {
      if (!state.currentWorkspace) return;

      try {
        const response = await apiService.get(`/messages/workspace/${state.currentWorkspace}/members`);
        if (response.data.success && response.data.data) {
          setWorkspaceMembers(response.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch workspace members:', error);
      }
    };

    fetchWorkspaceMembers();
  }, [state.currentWorkspace]);

  // Auto face scan trigger
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const shouldAutoScan = params.get('autoFaceScan') === '1';

    if (!shouldAutoScan || autoScanTriggered) {
      return;
    }

    if (activeTab !== 'profile') {
      setActiveTab('profile');
      return;
    }

    if (videoRef.current) {
      handleCaptureFaceScan();
      setAutoScanTriggered(true);
    }
  }, [location.search, autoScanTriggered, activeTab]);

  const handleCaptureFaceScan = async () => {
    setFaceStatus(null);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setFaceStatus('Camera access is not supported in this browser.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        const videoEl = videoRef.current;
        videoEl.srcObject = stream as any;
        await new Promise((resolve) => {
          const handler = () => {
            videoEl.removeEventListener('loadedmetadata', handler);
            resolve(null);
          };
          videoEl.addEventListener('loadedmetadata', handler);
        });
      }

      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas) {
        stream.getTracks().forEach((t) => t.stop());
        setFaceStatus('Unable to access camera elements.');
        return;
      }

      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        stream.getTracks().forEach((t) => t.stop());
        setFaceStatus('Unable to capture from camera.');
        return;
      }

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setFacePreview(dataUrl);

      stream.getTracks().forEach((t) => t.stop());
      if (videoRef.current) {
        (videoRef.current.srcObject as any) = null;
      }

      setFaceSaving(true);
      try {
        await apiService.post('/users/face-scan', { imageData: dataUrl });
        setFaceStatus('Face scan saved successfully. This will be used for attendance verification.');
      } catch (err: any) {
        console.error('Failed to save face scan', err);
        setFaceStatus(err?.message || 'Failed to save face scan.');
      } finally {
        setFaceSaving(false);
      }
    } catch (err: any) {
      console.error('Camera error', err);
      setFaceStatus('Could not access camera. Please allow camera permissions.');
    }
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      await apiService.put('/users/profile', profileData);

      // Update context with new data
      const updatedUser = { ...state.userProfile, ...profileData };
      // Dispatch update to context (you may need to add this action to your reducer)

      addToast?.('Profile updated successfully', 'success');
      setIsEditMode(false);
    } catch (error: any) {
      console.error('Failed to save profile:', error);
      addToast?.('Failed to update profile', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setProfileData({
      fullName: state.userProfile.fullName || '',
      email: state.userProfile.email || '',
      contactNumber: state.userProfile.contactNumber || '',
      about: state.userProfile.about || ''
    });
    setIsEditMode(false);
  };

  if (!currentWorkspace) {
    return (
      <div className="p-6">
        <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl p-6 text-center">
          <p className="text-gray-600 dark:text-gray-700">{t('workspace.profile.selectWorkspace')}</p>
        </div>
      </div>
    );
  }

  const handleInviteClick = () => {
    sessionStorage.setItem('workspaceMembersOpenInvite', 'true');
    window.dispatchEvent(new Event('workspace:open-invite'));
    navigate(`/workspace/${currentWorkspace._id}/members`);
  };

  const tabs = [
    { id: 'profile', label: t('workspace.profile.tabs.profile'), icon: UserIcon },
    // Hidden - Not fully implemented yet
    // { id: 'inbox', label: 'Inbox', icon: MessageSquare },
    // { id: 'chatbot', label: 'Chatbot', icon: Bot },
    // { id: 'planner', label: 'Personal Planner', icon: Calendar },
    // { id: 'projects', label: 'Projects', icon: Building2 }
  ];

  const renderProfileTab = () => (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm uppercase text-gray-600 dark:text-gray-300 tracking-wide">{t('workspace.profile.workspaceLabel')}</p>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{currentWorkspace.name}</h2>
              <p className="text-sm text-gray-600 dark:text-gray-200">{currentWorkspace.description || t('workspace.profile.noDescription')}</p>
            </div>
            {!isEditMode ? (
              <button
                onClick={() => setIsEditMode(true)}
                className="px-4 py-2 bg-accent text-gray-900 rounded-lg hover:bg-accent-hover transition-colors text-sm font-medium"
              >
                {t('workspace.profile.editProfile')}
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium disabled:opacity-50"
                >
                  {isSaving ? t('workspace.profile.saving') : t('workspace.profile.save')}
                </button>
                <button
                  onClick={handleCancelEdit}
                  disabled={isSaving}
                  className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-gray-100 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors text-sm font-medium disabled:opacity-50"
                >
                  {t('workspace.profile.cancel')}
                </button>
              </div>
            )}
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <UserIcon className="w-5 h-5 text-accent" />
              <div className="flex-1">
                <p className="text-sm text-gray-600 dark:text-gray-200">{t('workspace.profile.nameLabel')}</p>
                {isEditMode ? (
                  <input
                    type="text"
                    value={profileData.fullName}
                    onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                ) : (
                  <p className="font-medium text-gray-900 dark:text-gray-100">{state.userProfile.fullName || t('workspace.profile.unnamedUser')}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-accent" />
              <div className="flex-1">
                <p className="text-sm text-gray-600 dark:text-gray-200">{t('workspace.profile.emailLabel')}</p>
                {isEditMode ? (
                  <div className="relative">
                    <input
                      type="email"
                      value={profileData.email}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                      title="Email cannot be changed"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('workspace.profile.emailCannotBeChanged')}</p>
                  </div>
                ) : (
                  <p className="font-medium text-gray-900 dark:text-gray-100">{state.userProfile.email || t('workspace.profile.notAvailable')}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-accent" />
              <div className="flex-1">
                <p className="text-sm text-gray-600 dark:text-gray-200">{t('workspace.profile.mobileLabel')}</p>
                {isEditMode ? (
                  <input
                    type="tel"
                    value={profileData.contactNumber}
                    onChange={(e) => setProfileData({ ...profileData, contactNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                ) : (
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {state.userProfile.contactNumber || t('workspace.profile.notProvided')}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-accent" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-200">{t('workspace.profile.currentRole')}</p>
                <p className="font-medium capitalize text-gray-900 dark:text-gray-100">{displayRole}</p>
              </div>
            </div>
          </div>

          {/* Bio Section */}
          {isEditMode && (
            <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-200 mb-2">{t('workspace.profile.bioLabel')}</label>
              <textarea
                value={profileData.about}
                onChange={(e) => setProfileData({ ...profileData, about: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder={t('workspace.profile.bioPlaceholder')}
              />
            </div>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-2xl p-6">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">{t('workspace.profile.insights.title')}</h4>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900">
            <p className="text-sm text-gray-600 dark:text-gray-200">{t('workspace.profile.insights.members')}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{currentWorkspace.memberCount || 0}</p>
          </div>
          <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900">
            <p className="text-sm text-gray-600 dark:text-gray-200">{t('workspace.profile.insights.type')}</p>
            <p className="text-2xl font-bold capitalize text-gray-900 dark:text-gray-100">{currentWorkspace.type}</p>
          </div>
          <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-200">{t('workspace.profile.insights.subscription')}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 capitalize">
                {userSubscription?.planKey || currentWorkspace.subscription?.plan || 'free'}
              </p>
            </div>
            <button
              onClick={() => navigate('/pricing')}
              className="px-4 py-2 text-sm font-medium text-orange-600 hover:text-orange-700 dark:text-orange-500 dark:hover:text-orange-400 transition-colors"
            >
              Upgrade
            </button>
          </div>
        </div>
      </div>

      {/* Performance Ratings Section */}
      {state.userProfile.performanceRatings && (state.userProfile.performanceRatings.totalTasks ?? 0) > 0 && (
        <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Performance Ratings</h4>
              <p className="text-sm text-gray-600 dark:text-gray-200 mt-1">
                Based on {state.userProfile.performanceRatings.totalTasks} verified {state.userProfile.performanceRatings.totalTasks === 1 ? 'task' : 'tasks'}
              </p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-accent-dark dark:text-accent-light">
                {state.userProfile.performanceRatings.overallAverage?.toFixed(1) || '0.0'}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-200">Overall Average</div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {[
              { key: 'timeliness', label: 'Timeliness & Reliability', icon: Clock },
              { key: 'quality', label: 'Quality & Accuracy', icon: CheckSquare },
              { key: 'effort', label: 'Effort & Complexity', icon: TrendingUp },
              { key: 'collaboration', label: 'Collaboration & Communication', icon: Users },
              { key: 'initiative', label: 'Initiative & Problem Solving', icon: AlertCircle },
              { key: 'learning', label: 'Learning & Improvement', icon: BarChart3 },
              { key: 'compliance', label: 'Compliance & Security', icon: Shield }
            ].map(({ key, label, icon: Icon }) => {
              const rating = (state.userProfile.performanceRatings as any)?.[key];
              const average = rating?.average || 0;
              const count = rating?.count || 0;

              return (
                <div key={key} className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-accent" />
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{label}</span>
                    </div>
                    <span className="text-sm font-bold text-accent-dark dark:text-accent-light">
                      {average.toFixed(1)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        className={`w-4 h-4 ${star <= Math.round(average) ? 'text-yellow-400 fill-current' : 'text-gray-300 dark:text-gray-600'}`}
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                    <span className="text-xs text-gray-600 dark:text-gray-300 ml-2">({count})</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Face Scan Section - Pending Implementation */}
      {/* <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">{t('workspace.profile.faceScan.title')}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-200 mb-4">
          {t('workspace.profile.faceScan.description')}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          <div className="space-y-3">
            <video
              ref={videoRef}
              autoPlay
              muted
              className="w-full rounded-lg border border-gray-300 bg-gray-100"
            />
            <canvas ref={canvasRef} className="hidden" />
            {facePreview && (
              <img
                src={facePreview}
                alt="Face scan preview"
                className="w-full rounded-lg border border-gray-200"
              />
            )}
          </div>
          <div className="md:col-span-2 space-y-3 text-sm">
            <p className="text-gray-600 dark:text-gray-200">
              {t('workspace.profile.faceScan.instructions')}
            </p>
            <button
              type="button"
              onClick={handleCaptureFaceScan}
              disabled={faceSaving}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-gray-900 hover:bg-accent-hover disabled:opacity-60"
            >
              {faceSaving ? t('workspace.profile.faceScan.buttonSaving') : t('workspace.profile.faceScan.button')}
            </button>
            {faceStatus && (
              <p className="text-xs text-gray-600 dark:text-gray-200 mt-2 max-w-md">{faceStatus}</p>
            )}
          </div>
        </div>
      </div> */}
    </div>
  );

  const renderInbox = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Team Inbox</h3>
          <p className="text-sm text-gray-600 dark:text-gray-200">Chat with your workspace members</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600" />
            <input
              type="text"
              placeholder="Search members..."
              className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-gray-900 rounded-lg hover:bg-accent-hover transition-colors">
            <Plus className="w-4 h-4" />
            New Chat
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg">
            <div className="p-4 border-b border-gray-200 dark:border-gray-600">
              <h4 className="font-medium text-gray-900 dark:text-gray-100">Workspace Members</h4>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-600 max-h-96 overflow-y-auto">
              {workspaceMembers.length === 0 ? (
                <div className="p-4 text-center text-gray-600 dark:text-gray-300">
                  <p className="text-sm">No members found</p>
                </div>
              ) : (
                workspaceMembers.map((member) => (
                  <div key={member._id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                        <UserIcon className="w-5 h-5 text-accent-dark" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{member.fullName || member.name || 'Unknown'}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-300">{member.role || 'Member'}</p>
                      </div>
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg h-96 flex flex-col">
            <div className="p-4 border-b border-gray-200 dark:border-gray-600">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <UserIcon className="w-4 h-4 text-accent-dark" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">Select a member to start chatting</p>
                  <p className="text-xs text-gray-600 dark:text-gray-300">Click on a member from the list</p>
                </div>
              </div>
            </div>

            <div className="flex-1 p-4 overflow-y-auto bg-gray-50 dark:bg-gray-900">
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-gray-600 dark:text-gray-300">
                  <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p className="text-sm">No conversation selected</p>
                  <p className="text-xs mt-1">Choose a workspace member to start chatting</p>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-gray-200 dark:border-gray-600">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Type a message..."
                  disabled
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent disabled:bg-gray-100 dark:disabled:bg-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
                <button disabled className="px-4 py-2 bg-gray-300 text-gray-600 rounded-lg cursor-not-allowed">
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderChatbot = () => (
    <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
          <Bot className="w-6 h-6 text-accent-dark" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">AI Assistant</h3>
          <p className="text-sm text-gray-600 dark:text-gray-200">Get help with your tasks and deadlines</p>
        </div>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-200">AI Assistant coming soon...</p>
    </div>
  );

  const renderPlanner = () => (
    <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Personal Planner</h3>
      <p className="text-sm text-gray-600 dark:text-gray-200">Personal planner coming soon...</p>
    </div>
  );

  const renderProjects = () => (
    <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">My Projects</h3>
      <p className="text-sm text-gray-600 dark:text-gray-200">Projects view coming soon...</p>
    </div>
  );

  return (
    <div className={`transition-all duration-300 ${dockPosition === 'left' ? 'pl-[71px] pr-6 py-6' :
      dockPosition === 'right' ? 'pr-[71px] pl-6 py-6' :
        'p-6'
      }`}>
      <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl">
        {/* Header */}
        <div className="p-6 border-b border-gray-300 dark:border-gray-600">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{t('workspace.profile.title')}</h1>
          <p className="text-sm text-gray-600 dark:text-gray-200 mt-1">
            {t('workspace.profile.subtitle')}
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-300 dark:border-gray-600">
          <nav className="flex space-x-8 px-6 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${activeTab === tab.id
                    ? 'border-accent text-accent-dark'
                    : 'border-transparent text-gray-600 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300'
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'profile' && renderProfileTab()}
          {activeTab === 'inbox' && renderInbox()}
          {activeTab === 'chatbot' && renderChatbot()}
          {activeTab === 'planner' && renderPlanner()}
          {activeTab === 'projects' && renderProjects()}
        </div>
      </div>
    </div>
  );
};

export default WorkspaceProfile;
