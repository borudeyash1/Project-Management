import React, { useState } from 'react';
import { 
  X, Sparkles, Building, Users, Target, Calendar, DollarSign, 
  CheckCircle, ArrowRight, ArrowLeft, Loader, Bot, Lightbulb,
  Briefcase, Code, Palette, BarChart3, Globe, Shield, Zap
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../context/AppContext';
import apiService from '../services/api';

interface AIWorkspaceData {
  name: string;
  description: string;
  type: 'startup' | 'agency' | 'enterprise' | 'nonprofit' | 'education' | 'consulting';
  industry: string;
  teamSize: '1-5' | '6-20' | '21-50' | '51-200' | '200+';
  goals: string[];
  features: string[];
  budget: 'free' | 'basic' | 'premium' | 'enterprise';
  timeline: 'immediate' | '1-month' | '3-months' | '6-months';
  integrations: string[];
  customizations: {
    theme: string;
    branding: boolean;
    customFields: boolean;
    advancedAnalytics: boolean;
    apiAccess: boolean;
  };
}

interface CreateAIWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateAIWorkspaceModal: React.FC<CreateAIWorkspaceModalProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const { dispatch } = useApp();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [workspaceData, setWorkspaceData] = useState<AIWorkspaceData>({
    name: '',
    description: '',
    type: 'startup',
    industry: '',
    teamSize: '1-5',
    goals: [],
    features: [],
    budget: 'free',
    timeline: 'immediate',
    integrations: [],
    customizations: {
      theme: 'modern',
      branding: false,
      customFields: false,
      advancedAnalytics: false,
      apiAccess: false
    }
  });

  const industryOptions = [
    'Technology', 'Healthcare', 'Finance', 'Education', 'Retail', 'Manufacturing',
    'Consulting', 'Marketing', 'Real Estate', 'Legal', 'Non-profit', 'Government',
    'Entertainment', 'Sports', 'Food & Beverage', 'Travel', 'Other'
  ];

  const goalOptions = [
    'Project Management', 'Team Collaboration', 'Client Management', 'Task Tracking',
    'Time Management', 'Resource Planning', 'Budget Tracking', 'Reporting & Analytics',
    'Document Management', 'Communication', 'Workflow Automation', 'Performance Monitoring'
  ];

  const featureOptions = [
    'Kanban Boards', 'Gantt Charts', 'Time Tracking', 'File Sharing', 'Team Chat',
    'Calendar Integration', 'Mobile App', 'API Access', 'Custom Fields', 'Automation',
    'Reporting Dashboard', 'Client Portal', 'Invoice Management', 'Resource Management',
    'Risk Management', 'Quality Control', 'Version Control', 'Integration Hub'
  ];

  const integrationOptions = [
    'Google Workspace', 'Microsoft 365', 'Slack', 'Zoom', 'Salesforce', 'HubSpot',
    'QuickBooks', 'Stripe', 'GitHub', 'Jira', 'Trello', 'Asana', 'Dropbox', 'OneDrive',
    'Mailchimp', 'Zapier', 'Webhooks', 'REST API'
  ];

  const mapWorkspaceType = (aiType: string): 'team' | 'enterprise' => {
    switch (aiType) {
      case 'startup':
      case 'agency':
        return 'team';
      case 'enterprise':
        return 'enterprise';
      case 'nonprofit':
      case 'education':
      case 'consulting':
        return 'team';
      default:
        return 'team';
    }
  };

  const handleAIWorkspaceGeneration = async () => {
    try {
      setAiGenerating(true);
      
      // Simulate AI analysis and generation
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // AI-generated workspace suggestions
      const aiSuggestions = {
        name: `${workspaceData.industry} Workspace Pro`,
        description: `A comprehensive workspace designed for ${workspaceData.industry.toLowerCase()} teams to manage projects, collaborate effectively, and achieve their goals.`,
        type: workspaceData.type,
        industry: workspaceData.industry,
        teamSize: workspaceData.teamSize,
        goals: workspaceData.goals.length > 0 ? workspaceData.goals : ['Project Management', 'Team Collaboration'],
        features: workspaceData.features.length > 0 ? workspaceData.features : ['Kanban Boards', 'Time Tracking', 'Team Chat'],
        budget: workspaceData.budget,
        timeline: workspaceData.timeline,
        integrations: workspaceData.integrations.length > 0 ? workspaceData.integrations : ['Google Workspace', 'Slack'],
        customizations: {
          theme: 'modern',
          branding: workspaceData.budget !== 'free',
          customFields: workspaceData.teamSize !== '1-5',
          advancedAnalytics: workspaceData.budget === 'premium' || workspaceData.budget === 'enterprise',
          apiAccess: workspaceData.budget === 'enterprise'
        }
      };

      setWorkspaceData(aiSuggestions);
      setStep(3); // Move to review step
      
      dispatch({
        type: 'ADD_TOAST',
        payload: {
          id: Date.now().toString(),
          type: 'success',
          message: 'AI has generated your perfect workspace!',
          duration: 3000
        }
      });
    } catch (error) {
      console.error('AI generation failed:', error);
      dispatch({
        type: 'ADD_TOAST',
        payload: {
          id: Date.now().toString(),
          type: 'error',
          message: 'AI generation failed. Please try again.',
          duration: 3000
        }
      });
    } finally {
      setAiGenerating(false);
    }
  };

  const handleCreateWorkspace = async () => {
    try {
      setLoading(true);
      
      const workspacePayload = {
        name: workspaceData.name,
        description: workspaceData.description,
        type: mapWorkspaceType(workspaceData.type),
        industry: workspaceData.industry,
        teamSize: workspaceData.teamSize,
        goals: workspaceData.goals,
        features: workspaceData.features,
        budget: workspaceData.budget,
        timeline: workspaceData.timeline,
        integrations: workspaceData.integrations,
        customizations: workspaceData.customizations,
        createdBy: 'ai-assistant'
      };

      await apiService.createWorkspace(workspacePayload);
      
      dispatch({
        type: 'ADD_TOAST',
        payload: {
          id: Date.now().toString(),
          type: 'success',
          message: 'AI-powered workspace created successfully!',
          duration: 3000
        }
      });
      
      onClose();
    } catch (error) {
      console.error('Failed to create workspace:', error);
      dispatch({
        type: 'ADD_TOAST',
        payload: {
          id: Date.now().toString(),
          type: 'error',
          message: 'Failed to create workspace. Please try again.',
          duration: 3000
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-4">
          <Bot className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('workspace.aiWorkspaceCreation')}</h3>
        <p className="text-gray-600">{t('workspace.aiWorkspaceDesc')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{t('workspace.organizationType')}</label>
          <select
            value={workspaceData.type}
            onChange={(e) => setWorkspaceData(prev => ({ ...prev, type: e.target.value as any }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent"
          >
            <option value="startup">Startup</option>
            <option value="agency">Agency</option>
            <option value="enterprise">Enterprise</option>
            <option value="nonprofit">Non-profit</option>
            <option value="education">Education</option>
            <option value="consulting">Consulting</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{t('workspace.industry')}</label>
          <select
            value={workspaceData.industry}
            onChange={(e) => setWorkspaceData(prev => ({ ...prev, industry: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent"
          >
            <option value="">{t('workspace.selectIndustry')}</option>
            {industryOptions.map(industry => (
              <option key={industry} value={industry}>{industry}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{t('workspace.teamSize')}</label>
          <select
            value={workspaceData.teamSize}
            onChange={(e) => setWorkspaceData(prev => ({ ...prev, teamSize: e.target.value as any }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent"
          >
            <option value="1-5">1-5 people</option>
            <option value="6-20">6-20 people</option>
            <option value="21-50">21-50 people</option>
            <option value="51-200">51-200 people</option>
            <option value="200+">200+ people</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{t('workspace.budget')}</label>
          <select
            value={workspaceData.budget}
            onChange={(e) => setWorkspaceData(prev => ({ ...prev, budget: e.target.value as any }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent"
          >
            <option value="free">Free</option>
            <option value="basic">Basic ($10/month)</option>
            <option value="premium">Premium ($25/month)</option>
            <option value="enterprise">Enterprise ($50/month)</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{t('workspace.primaryGoals')}</label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {goalOptions.map(goal => (
            <label key={goal} className="flex items-center">
              <input
                type="checkbox"
                checked={workspaceData.goals.includes(goal)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setWorkspaceData(prev => ({ ...prev, goals: [...prev.goals, goal] }));
                  } else {
                    setWorkspaceData(prev => ({ ...prev, goals: prev.goals.filter(g => g !== goal) }));
                  }
                }}
                className="h-4 w-4 text-accent-dark focus:ring-accent border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">{goal}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mb-4">
          <Lightbulb className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('workspace.customizeWorkspace')}</h3>
        <p className="text-gray-600">{t('workspace.selectFeatures')}</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{t('workspace.essentialFeatures')}</label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {featureOptions.map(feature => (
            <label key={feature} className="flex items-center">
              <input
                type="checkbox"
                checked={workspaceData.features.includes(feature)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setWorkspaceData(prev => ({ ...prev, features: [...prev.features, feature] }));
                  } else {
                    setWorkspaceData(prev => ({ ...prev, features: prev.features.filter(f => f !== feature) }));
                  }
                }}
                className="h-4 w-4 text-accent-dark focus:ring-accent border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">{feature}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{t('workspace.integrations')}</label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {integrationOptions.map(integration => (
            <label key={integration} className="flex items-center">
              <input
                type="checkbox"
                checked={workspaceData.integrations.includes(integration)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setWorkspaceData(prev => ({ ...prev, integrations: [...prev.integrations, integration] }));
                  } else {
                    setWorkspaceData(prev => ({ ...prev, integrations: prev.integrations.filter(i => i !== integration) }));
                  }
                }}
                className="h-4 w-4 text-accent-dark focus:ring-accent border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">{integration}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{t('workspace.timeline')}</label>
        <select
          value={workspaceData.timeline}
          onChange={(e) => setWorkspaceData(prev => ({ ...prev, timeline: e.target.value as any }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent"
        >
          <option value="immediate">{t('workspace.immediate')}</option>
          <option value="1-month">Within 1 month</option>
          <option value="3-months">Within 3 months</option>
          <option value="6-months">Within 6 months</option>
        </select>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mb-4">
          <CheckCircle className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('workspace.aiGeneratedWorkspace')}</h3>
        <p className="text-gray-600">{t('workspace.reviewCustomize')}</p>
      </div>

      <div className="bg-gray-50 rounded-lg p-6 space-y-4">
        <div className="flex items-center gap-3">
          <Building className="w-6 h-6 text-accent-dark" />
          <div>
            <h4 className="font-semibold text-gray-900">{workspaceData.name}</h4>
            <p className="text-sm text-gray-600">{workspaceData.description}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-700">{t('workspace.type')}:</span>
            <span className="ml-2 text-gray-600 capitalize">{workspaceData.type}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">{t('workspace.industry')}:</span>
            <span className="ml-2 text-gray-600">{workspaceData.industry}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">{t('workspace.teamSize')}:</span>
            <span className="ml-2 text-gray-600">{workspaceData.teamSize} people</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">{t('workspace.budget')}:</span>
            <span className="ml-2 text-gray-600 capitalize">{workspaceData.budget}</span>
          </div>
        </div>

        <div>
          <span className="font-medium text-gray-700 text-sm">{t('workspace.goals')}:</span>
          <div className="flex flex-wrap gap-1 mt-1">
            {workspaceData.goals.map(goal => (
              <span key={goal} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                {goal}
              </span>
            ))}
          </div>
        </div>

        <div>
          <span className="font-medium text-gray-700 text-sm">{t('workspace.features')}:</span>
          <div className="flex flex-wrap gap-1 mt-1">
            {workspaceData.features.map(feature => (
              <span key={feature} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                {feature}
              </span>
            ))}
          </div>
        </div>

        <div>
          <span className="font-medium text-gray-700 text-sm">{t('workspace.integrations')}:</span>
          <div className="flex flex-wrap gap-1 mt-1">
            {workspaceData.integrations.map(integration => (
              <span key={integration} className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                {integration}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Zap className="w-5 h-5 text-accent-dark mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900">{t('workspace.aiRecommendations')}</h4>
            <p className="text-sm text-blue-700 mt-1">
              {t('workspace.aiOptimized')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {step === 1 && t('workspace.aiWorkspaceSetup')}
            {step === 2 && t('workspace.customizeFeatures')}
            {step === 3 && t('workspace.reviewCreate')}
          </h2>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>{t('workspace.stepOf', { current: step, total: 3 })}</span>
              <span>{t('workspace.percentComplete', { percent: Math.round((step / 3) * 100) })}</span>
            </div>
            <div className="w-full bg-gray-300 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(step / 3) * 100}%` }}
              />
            </div>
          </div>

          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
        </div>

        <div className="flex gap-3 p-6 border-t border-gray-200">
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 inline mr-2" />
              {t('workspace.back')}
            </button>
          )}
          
          {step < 3 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="flex-1 px-4 py-2 bg-accent text-gray-900 rounded-lg hover:bg-accent-hover transition-colors"
            >
              {t('workspace.next')}
              <ArrowRight className="w-4 h-4 inline ml-2" />
            </button>
          ) : step === 2 ? (
            <button
              onClick={handleAIWorkspaceGeneration}
              disabled={aiGenerating}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-colors disabled:opacity-50"
            >
              {aiGenerating ? (
                <>
                  <Loader className="w-4 h-4 inline mr-2 animate-spin" />
                  AI Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 inline mr-2" />
                  Generate with AI
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handleCreateWorkspace}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 inline mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 inline mr-2" />
                  {t('workspace.createWorkspace')}
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateAIWorkspaceModal;
