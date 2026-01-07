import React, { useState } from 'react';
import { 
  X, Sparkles, FolderPlus, Target, Calendar, Users, Clock, 
  CheckCircle, ArrowRight, ArrowLeft, Loader, Bot, Lightbulb,
  BarChart3, FileText, Zap, Settings, Globe, Shield, Award
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import apiService from '../services/api';

interface AIProjectData {
  name: string;
  description: string;
  type: 'web-development' | 'mobile-app' | 'marketing-campaign' | 'product-launch' | 'research' | 'event' | 'content-creation' | 'consulting';
  category: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  startDate: string;
  endDate: string;
  budget: number;
  teamSize: number;
  goals: string[];
  deliverables: string[];
  phases: Array<{
    name: string;
    duration: number;
    tasks: string[];
    dependencies: string[];
  }>;
  resources: string[];
  risks: string[];
  successMetrics: string[];
  customizations: {
    methodology: 'agile' | 'waterfall' | 'scrum' | 'kanban' | 'hybrid';
    reporting: boolean;
    timeTracking: boolean;
    budgetTracking: boolean;
    riskManagement: boolean;
    qualityControl: boolean;
  };
}

interface CreateAIProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceId?: string;
}

const CreateAIProjectModal: React.FC<CreateAIProjectModalProps> = ({ isOpen, onClose, workspaceId }) => {
  const { dispatch } = useApp();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [projectData, setProjectData] = useState<AIProjectData>({
    name: '',
    description: '',
    type: 'web-development',
    category: '',
    priority: 'medium',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    budget: 0,
    teamSize: 1,
    goals: [],
    deliverables: [],
    phases: [],
    resources: [],
    risks: [],
    successMetrics: [],
    customizations: {
      methodology: 'agile',
      reporting: true,
      timeTracking: true,
      budgetTracking: false,
      riskManagement: false,
      qualityControl: false
    }
  });

  const projectTypes = [
    { value: 'web-development', label: 'Web Development', icon: Globe },
    { value: 'mobile-app', label: 'Mobile App', icon: FileText },
    { value: 'marketing-campaign', label: 'Marketing Campaign', icon: Target },
    { value: 'product-launch', label: 'Product Launch', icon: Zap },
    { value: 'research', label: 'Research Project', icon: BarChart3 },
    { value: 'event', label: 'Event Planning', icon: Calendar },
    { value: 'content-creation', label: 'Content Creation', icon: FileText },
    { value: 'consulting', label: 'Consulting Project', icon: Users }
  ];

  const categoryOptions = [
    'Technology', 'Marketing', 'Sales', 'Operations', 'HR', 'Finance',
    'Product Development', 'Customer Service', 'Research', 'Training',
    'Compliance', 'Quality Assurance', 'Business Development', 'Other'
  ];

  const goalOptions = [
    'Increase Revenue', 'Improve Efficiency', 'Enhance User Experience', 'Reduce Costs',
    'Expand Market Reach', 'Improve Quality', 'Increase Productivity', 'Enhance Security',
    'Streamline Processes', 'Boost Customer Satisfaction', 'Innovate Products', 'Optimize Performance'
  ];

  const deliverableOptions = [
    'Website/Application', 'Mobile App', 'Marketing Materials', 'Documentation',
    'Reports', 'Training Materials', 'Process Documentation', 'User Guides',
    'API Documentation', 'Test Results', 'Design Assets', 'Analytics Dashboard'
  ];

  const resourceOptions = [
    'Development Team', 'Design Team', 'Marketing Team', 'Project Manager',
    'Quality Assurance', 'DevOps Engineer', 'Content Writer', 'UX Designer',
    'Data Analyst', 'Business Analyst', 'External Consultants', 'Third-party Tools'
  ];

  const riskOptions = [
    'Budget Overrun', 'Timeline Delays', 'Resource Constraints', 'Technical Challenges',
    'Scope Creep', 'Team Availability', 'External Dependencies', 'Market Changes',
    'Competition', 'Regulatory Changes', 'Technology Changes', 'Client Requirements'
  ];

  const handleAIProjectGeneration = async () => {
    try {
      setAiGenerating(true);
      
      // Simulate AI analysis and generation
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // AI-generated project suggestions
      const aiSuggestions = {
        name: `${projectData.type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())} Project`,
        description: `A comprehensive ${projectData.type.replace('-', ' ')} project designed to achieve your business objectives with optimal resource allocation and timeline management.`,
        type: projectData.type,
        category: projectData.category || 'Technology',
        priority: projectData.priority,
        startDate: projectData.startDate,
        endDate: projectData.endDate,
        budget: projectData.budget || 10000,
        teamSize: projectData.teamSize || 5,
        goals: projectData.goals.length > 0 ? projectData.goals : ['Improve Efficiency', 'Enhance User Experience'],
        deliverables: projectData.deliverables.length > 0 ? projectData.deliverables : ['Website/Application', 'Documentation'],
        phases: generateAIProjectPhases(projectData.type),
        resources: projectData.resources.length > 0 ? projectData.resources : ['Development Team', 'Project Manager'],
        risks: projectData.risks.length > 0 ? projectData.risks : ['Timeline Delays', 'Technical Challenges'],
        successMetrics: ['On-time Delivery', 'Budget Adherence', 'Quality Standards', 'User Satisfaction'],
        customizations: {
          methodology: projectData.customizations.methodology,
          reporting: true,
          timeTracking: true,
          budgetTracking: projectData.budget > 5000,
          riskManagement: projectData.teamSize > 3,
          qualityControl: true
        }
      };

      setProjectData(aiSuggestions);
      setStep(3); // Move to review step
      
      dispatch({
        type: 'ADD_TOAST',
        payload: {
          id: Date.now().toString(),
          type: 'success',
          message: 'AI has generated your perfect project plan!',
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

  const generateAIProjectPhases = (type: string) => {
    const phaseTemplates = {
      'web-development': [
        { name: 'Planning & Analysis', duration: 7, tasks: ['Requirements gathering', 'Technical analysis', 'Architecture design'], dependencies: [] },
        { name: 'Design & Prototyping', duration: 10, tasks: ['UI/UX design', 'Prototype creation', 'Design review'], dependencies: ['Planning & Analysis'] },
        { name: 'Development', duration: 21, tasks: ['Frontend development', 'Backend development', 'API integration'], dependencies: ['Design & Prototyping'] },
        { name: 'Testing & QA', duration: 7, tasks: ['Unit testing', 'Integration testing', 'User acceptance testing'], dependencies: ['Development'] },
        { name: 'Deployment & Launch', duration: 3, tasks: ['Production deployment', 'Performance monitoring', 'Launch support'], dependencies: ['Testing & QA'] }
      ],
      'mobile-app': [
        { name: 'Research & Planning', duration: 5, tasks: ['Market research', 'User personas', 'Feature specification'], dependencies: [] },
        { name: 'Design & Wireframing', duration: 8, tasks: ['App wireframes', 'UI design', 'User flow design'], dependencies: ['Research & Planning'] },
        { name: 'Development', duration: 28, tasks: ['iOS development', 'Android development', 'Backend integration'], dependencies: ['Design & Wireframing'] },
        { name: 'Testing', duration: 10, tasks: ['Device testing', 'Performance testing', 'Beta testing'], dependencies: ['Development'] },
        { name: 'App Store Launch', duration: 5, tasks: ['App store submission', 'Marketing preparation', 'Launch'], dependencies: ['Testing'] }
      ],
      'marketing-campaign': [
        { name: 'Strategy Development', duration: 5, tasks: ['Target audience analysis', 'Campaign strategy', 'Budget planning'], dependencies: [] },
        { name: 'Creative Development', duration: 7, tasks: ['Content creation', 'Design assets', 'Campaign materials'], dependencies: ['Strategy Development'] },
        { name: 'Campaign Launch', duration: 14, tasks: ['Channel setup', 'Campaign execution', 'Initial monitoring'], dependencies: ['Creative Development'] },
        { name: 'Optimization', duration: 7, tasks: ['Performance analysis', 'A/B testing', 'Campaign adjustments'], dependencies: ['Campaign Launch'] },
        { name: 'Analysis & Reporting', duration: 3, tasks: ['Results analysis', 'ROI calculation', 'Final report'], dependencies: ['Optimization'] }
      ]
    };

    return phaseTemplates[type as keyof typeof phaseTemplates] || phaseTemplates['web-development'];
  };

  const handleCreateProject = async () => {
    try {
      setLoading(true);
      
      const projectPayload = {
        name: projectData.name,
        description: projectData.description,
        type: projectData.type,
        category: projectData.category,
        priority: projectData.priority,
        startDate: new Date(projectData.startDate),
        endDate: new Date(projectData.endDate),
        budget: {
          estimated: projectData.budget,
          actual: 0,
          currency: 'INR'
        },
        teamSize: projectData.teamSize,
        goals: projectData.goals,
        deliverables: projectData.deliverables,
        phases: projectData.phases,
        resources: projectData.resources,
        risks: projectData.risks,
        successMetrics: projectData.successMetrics,
        customizations: projectData.customizations,
        workspaceId: workspaceId,
        createdBy: 'ai-assistant'
      };

      await apiService.createProject(projectPayload);
      
      dispatch({
        type: 'ADD_TOAST',
        payload: {
          id: Date.now().toString(),
          type: 'success',
          message: 'AI-powered project created successfully!',
          duration: 3000
        }
      });
      
      onClose();
    } catch (error) {
      console.error('Failed to create project:', error);
      dispatch({
        type: 'ADD_TOAST',
        payload: {
          id: Date.now().toString(),
          type: 'error',
          message: 'Failed to create project. Please try again.',
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
        <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mb-4">
          <Bot className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">AI-Powered Project Creation</h3>
        <p className="text-gray-600">Describe your project and let AI create the perfect plan for you</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Project Type</label>
          <div className="grid grid-cols-2 gap-2">
            {projectTypes.map(type => {
              const Icon = type.icon;
              return (
                <button
                  key={type.value}
                  onClick={() => setProjectData(prev => ({ ...prev, type: type.value as any }))}
                  className={`p-3 rounded-lg border text-left transition-colors ${
                    projectData.type === type.value
                      ? 'border-accent bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4 mb-1" />
                  <div className="text-xs font-medium">{type.label}</div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={projectData.category}
              onChange={(e) => setProjectData(prev => ({ ...prev, category: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent"
            >
              <option value="">Select Category</option>
              {categoryOptions.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
            <select
              value={projectData.priority}
              onChange={(e) => setProjectData(prev => ({ ...prev, priority: e.target.value as any }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Team Size</label>
            <input
              type="number"
              min="1"
              value={projectData.teamSize}
              onChange={(e) => setProjectData(prev => ({ ...prev, teamSize: parseInt(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Budget (₹)</label>
            <input
              type="number"
              min="0"
              value={projectData.budget}
              onChange={(e) => setProjectData(prev => ({ ...prev, budget: parseInt(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
          <input
            type="date"
            value={projectData.startDate}
            onChange={(e) => setProjectData(prev => ({ ...prev, startDate: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
          <input
            type="date"
            value={projectData.endDate}
            onChange={(e) => setProjectData(prev => ({ ...prev, endDate: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Project Goals</label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {goalOptions.map(goal => (
            <label key={goal} className="flex items-center">
              <input
                type="checkbox"
                checked={projectData.goals.includes(goal)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setProjectData(prev => ({ ...prev, goals: [...prev.goals, goal] }));
                  } else {
                    setProjectData(prev => ({ ...prev, goals: prev.goals.filter(g => g !== goal) }));
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
        <div className="mx-auto w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mb-4">
          <Lightbulb className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Define Project Details</h3>
        <p className="text-gray-600">Specify deliverables, resources, and potential risks</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Expected Deliverables</label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {deliverableOptions.map(deliverable => (
            <label key={deliverable} className="flex items-center">
              <input
                type="checkbox"
                checked={projectData.deliverables.includes(deliverable)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setProjectData(prev => ({ ...prev, deliverables: [...prev.deliverables, deliverable] }));
                  } else {
                    setProjectData(prev => ({ ...prev, deliverables: prev.deliverables.filter(d => d !== deliverable) }));
                  }
                }}
                className="h-4 w-4 text-accent-dark focus:ring-accent border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">{deliverable}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Required Resources</label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {resourceOptions.map(resource => (
            <label key={resource} className="flex items-center">
              <input
                type="checkbox"
                checked={projectData.resources.includes(resource)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setProjectData(prev => ({ ...prev, resources: [...prev.resources, resource] }));
                  } else {
                    setProjectData(prev => ({ ...prev, resources: prev.resources.filter(r => r !== resource) }));
                  }
                }}
                className="h-4 w-4 text-accent-dark focus:ring-accent border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">{resource}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Potential Risks</label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {riskOptions.map(risk => (
            <label key={risk} className="flex items-center">
              <input
                type="checkbox"
                checked={projectData.risks.includes(risk)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setProjectData(prev => ({ ...prev, risks: [...prev.risks, risk] }));
                  } else {
                    setProjectData(prev => ({ ...prev, risks: prev.risks.filter(r => r !== risk) }));
                  }
                }}
                className="h-4 w-4 text-accent-dark focus:ring-accent border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">{risk}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Project Methodology</label>
        <select
          value={projectData.customizations.methodology}
          onChange={(e) => setProjectData(prev => ({ 
            ...prev, 
            customizations: { ...prev.customizations, methodology: e.target.value as any }
          }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent"
        >
          <option value="agile">Agile</option>
          <option value="waterfall">Waterfall</option>
          <option value="scrum">Scrum</option>
          <option value="kanban">Kanban</option>
          <option value="hybrid">Hybrid</option>
        </select>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mb-4">
          <CheckCircle className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">AI-Generated Project Plan</h3>
        <p className="text-gray-600">Review and customize your AI-created project</p>
      </div>

      <div className="bg-gray-50 rounded-lg p-6 space-y-4">
        <div className="flex items-center gap-3">
          <FolderPlus className="w-6 h-6 text-accent-dark" />
          <div>
            <h4 className="font-semibold text-gray-900">{projectData.name}</h4>
            <p className="text-sm text-gray-600">{projectData.description}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-700">Type:</span>
            <span className="ml-2 text-gray-600 capitalize">{projectData.type.replace('-', ' ')}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Priority:</span>
            <span className="ml-2 text-gray-600 capitalize">{projectData.priority}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Team Size:</span>
            <span className="ml-2 text-gray-600">{projectData.teamSize} people</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Budget:</span>
            <span className="ml-2 text-gray-600">₹{projectData.budget.toLocaleString()}</span>
          </div>
        </div>

        <div>
          <span className="font-medium text-gray-700 text-sm">Project Phases:</span>
          <div className="mt-2 space-y-2">
            {projectData.phases.map((phase, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                <div>
                  <span className="font-medium text-sm">{phase.name}</span>
                  <span className="ml-2 text-xs text-gray-600">{phase.duration} days</span>
                </div>
                <div className="text-xs text-gray-600">
                  {phase.tasks.length} tasks
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <span className="font-medium text-gray-700 text-sm">Success Metrics:</span>
          <div className="flex flex-wrap gap-1 mt-1">
            {projectData.successMetrics.map(metric => (
              <span key={metric} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                {metric}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Zap className="w-5 h-5 text-accent-dark mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900">AI Project Optimization</h4>
            <p className="text-sm text-blue-700 mt-1">
              AI has analyzed your requirements and created an optimized project plan with realistic timelines, 
              resource allocation, and risk mitigation strategies.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {step === 1 && 'AI Project Setup'}
            {step === 2 && 'Project Details'}
            {step === 3 && 'Review & Create'}
          </h2>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>Step {step} of 3</span>
              <span>{Math.round((step / 3) * 100)}% Complete</span>
            </div>
            <div className="w-full bg-gray-300 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
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
              Back
            </button>
          )}
          
          {step < 3 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="flex-1 px-4 py-2 bg-accent text-gray-900 rounded-lg hover:bg-accent-hover transition-colors"
            >
              Next
              <ArrowRight className="w-4 h-4 inline ml-2" />
            </button>
          ) : step === 2 ? (
            <button
              onClick={handleAIProjectGeneration}
              disabled={aiGenerating}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-colors disabled:opacity-50"
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
              onClick={handleCreateProject}
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
                  Create Project
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateAIProjectModal;
