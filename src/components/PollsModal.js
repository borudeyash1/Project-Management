import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  X, 
  Plus, 
  BarChart3, 
  Users, 
  Clock, 
  CheckCircle,
  MessageSquare,
  TrendingUp,
  Calendar,
  Edit,
  Trash2,
  Send
} from 'lucide-react';

const PollsModal = () => {
  const { state, dispatch } = useApp();
  const [activeTab, setActiveTab] = useState('active');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [pollData, setPollData] = useState({
    question: '',
    options: ['', ''],
    type: 'single',
    duration: '24',
    anonymous: false
  });

  const showToast = (message, type = 'info') => {
    dispatch({ type: 'ADD_TOAST', payload: { message, type } });
  };

  const closeModal = () => {
    dispatch({ type: 'TOGGLE_MODAL', payload: 'polls' });
    setShowCreateForm(false);
    setPollData({
      question: '',
      options: ['', ''],
      type: 'single',
      duration: '24',
      anonymous: false
    });
  };

  const addOption = () => {
    setPollData(prev => ({
      ...prev,
      options: [...prev.options, '']
    }));
  };

  const updateOption = (index, value) => {
    setPollData(prev => ({
      ...prev,
      options: prev.options.map((option, i) => i === index ? value : option)
    }));
  };

  const removeOption = (index) => {
    if (pollData.options.length > 2) {
      setPollData(prev => ({
        ...prev,
        options: prev.options.filter((_, i) => i !== index)
      }));
    }
  };

  const createPoll = () => {
    if (!pollData.question.trim()) {
      showToast('Please enter a question', 'error');
      return;
    }
    
    if (pollData.options.filter(opt => opt.trim()).length < 2) {
      showToast('Please provide at least 2 options', 'error');
      return;
    }
    
    showToast('Poll created successfully', 'success');
    setShowCreateForm(false);
    setPollData({
      question: '',
      options: ['', ''],
      type: 'single',
      duration: '24',
      anonymous: false
    });
  };

  // Mock polls data
  const activePolls = [
    {
      id: 1,
      question: 'Which design direction should we pursue for the homepage?',
      options: [
        { text: 'Minimalist approach', votes: 8, percentage: 40 },
        { text: 'Bold and colorful', votes: 6, percentage: 30 },
        { text: 'Corporate professional', votes: 4, percentage: 20 },
        { text: 'Creative and artistic', votes: 2, percentage: 10 }
      ],
      totalVotes: 20,
      type: 'single',
      createdBy: 'Alex Johnson',
      createdAt: '2024-10-24T10:00:00Z',
      expiresAt: '2024-10-25T10:00:00Z',
      responses: 20,
      anonymous: false
    },
    {
      id: 2,
      question: 'How satisfied are you with the current project timeline?',
      options: [
        { text: 'Very satisfied', votes: 5, percentage: 25 },
        { text: 'Satisfied', votes: 8, percentage: 40 },
        { text: 'Neutral', votes: 4, percentage: 20 },
        { text: 'Dissatisfied', votes: 2, percentage: 10 },
        { text: 'Very dissatisfied', votes: 1, percentage: 5 }
      ],
      totalVotes: 20,
      type: 'single',
      createdBy: 'Priya Patel',
      createdAt: '2024-10-23T14:30:00Z',
      expiresAt: '2024-10-24T14:30:00Z',
      responses: 20,
      anonymous: true
    }
  ];

  const completedPolls = [
    {
      id: 3,
      question: 'What should be our next team building activity?',
      options: [
        { text: 'Virtual game night', votes: 12, percentage: 50 },
        { text: 'Online cooking class', votes: 6, percentage: 25 },
        { text: 'Team trivia', votes: 4, percentage: 17 },
        { text: 'Virtual escape room', votes: 2, percentage: 8 }
      ],
      totalVotes: 24,
      type: 'single',
      createdBy: 'Sam Wilson',
      createdAt: '2024-10-20T09:00:00Z',
      completedAt: '2024-10-21T09:00:00Z',
      responses: 24,
      anonymous: false
    }
  ];

  const getTimeRemaining = (expiresAt) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry - now;
    
    if (diff <= 0) return 'Expired';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'completed': return 'bg-slate-50 text-slate-700 border-slate-200';
      case 'expired': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  if (!state.modals.polls) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div>
            <h2 className="text-lg font-semibold">Team Polls & Feedback</h2>
            <p className="text-sm text-slate-500">Create polls and gather team feedback</p>
          </div>
          <div className="flex items-center gap-2">
            <button 
              className="px-3 py-2 rounded-lg text-white text-sm bg-yellow-500"
              onClick={() => setShowCreateForm(true)}
            >
              <Plus className="w-4 h-4 mr-1 inline-block" />
              Create Poll
            </button>
            <button 
              className="p-2 rounded-lg hover:bg-slate-100"
              onClick={closeModal}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-4 py-2 border-b border-border">
          <div className="flex items-center gap-2">
            <button 
              className={`px-3 py-1.5 rounded-md text-sm ${
                activeTab === 'active' 
                  ? 'bg-yellow-100' 
                  : 'hover:bg-slate-50 border border-border'
              }`}
              onClick={() => setActiveTab('active')}
            >
              Active Polls
            </button>
            <button 
              className={`px-3 py-1.5 rounded-md text-sm ${
                activeTab === 'completed' 
                  ? 'bg-yellow-100' 
                  : 'hover:bg-slate-50 border border-border'
              }`}
              onClick={() => setActiveTab('completed')}
            >
              Completed Polls
            </button>
          </div>
        </div>

        <div className="p-4 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Active Polls */}
          {activeTab === 'active' && (
            <div className="space-y-4">
              {activePolls.map((poll) => (
                <div key={poll.id} className="rounded-lg border border-border p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold mb-2">{poll.question}</h3>
                      <div className="flex items-center gap-4 text-sm text-slate-500">
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {poll.responses} responses
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {getTimeRemaining(poll.expiresAt)} remaining
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-4 h-4" />
                          {poll.anonymous ? 'Anonymous' : 'Public'}
                        </span>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full border ${getStatusColor('active')}`}>
                      Active
                    </span>
                  </div>

                  <div className="space-y-3">
                    {poll.options.map((option, index) => (
                      <div key={index} className="relative">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">{option.text}</span>
                          <span className="text-sm text-slate-500">{option.votes} votes ({option.percentage}%)</span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full">
                          <div 
                            className="h-2 rounded-full bg-yellow-500" 
                            style={{width: `${option.percentage}%`}}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 mt-4">
                    <button className="px-3 py-1.5 rounded-lg border border-border hover:bg-slate-50 text-sm">
                      Vote
                    </button>
                    <button className="px-3 py-1.5 rounded-lg border border-border hover:bg-slate-50 text-sm">
                      <BarChart3 className="w-4 h-4 mr-1 inline-block" />
                      View Results
                    </button>
                    <button className="px-3 py-1.5 rounded-lg border border-border hover:bg-slate-50 text-sm">
                      <Edit className="w-4 h-4 mr-1 inline-block" />
                      Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Completed Polls */}
          {activeTab === 'completed' && (
            <div className="space-y-4">
              {completedPolls.map((poll) => (
                <div key={poll.id} className="rounded-lg border border-border p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold mb-2">{poll.question}</h3>
                      <div className="flex items-center gap-4 text-sm text-slate-500">
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {poll.responses} responses
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Completed {new Date(poll.completedAt).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-4 h-4" />
                          {poll.anonymous ? 'Anonymous' : 'Public'}
                        </span>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full border ${getStatusColor('completed')}`}>
                      Completed
                    </span>
                  </div>

                  <div className="space-y-3">
                    {poll.options.map((option, index) => (
                      <div key={index} className="relative">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">{option.text}</span>
                          <span className="text-sm text-slate-500">{option.votes} votes ({option.percentage}%)</span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full">
                          <div 
                            className="h-2 rounded-full bg-yellow-500" 
                            style={{width: `${option.percentage}%`}}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 mt-4">
                    <button className="px-3 py-1.5 rounded-lg border border-border hover:bg-slate-50 text-sm">
                      <BarChart3 className="w-4 h-4 mr-1 inline-block" />
                      View Results
                    </button>
                    <button className="px-3 py-1.5 rounded-lg border border-border hover:bg-slate-50 text-sm">
                      <Trash2 className="w-4 h-4 mr-1 inline-block" />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Create Poll Form */}
        {showCreateForm && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Create New Poll</h3>
                <button 
                  className="p-1 rounded-lg hover:bg-slate-100"
                  onClick={() => setShowCreateForm(false)}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium block mb-1">Question</label>
                  <textarea 
                    rows="2" 
                    className="w-full rounded-lg border border-border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500"
                    placeholder="What would you like to ask your team?"
                    value={pollData.question}
                    onChange={(e) => setPollData(prev => ({ ...prev, question: e.target.value }))}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium block mb-1">Options</label>
                  <div className="space-y-2">
                    {pollData.options.map((option, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <input 
                          type="text" 
                          className="flex-1 rounded-lg border border-border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500"
                          placeholder={`Option ${index + 1}`}
                          value={option}
                          onChange={(e) => updateOption(index, e.target.value)}
                        />
                        {pollData.options.length > 2 && (
                          <button 
                            className="p-2 rounded-lg hover:bg-slate-100"
                            onClick={() => removeOption(index)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button 
                      className="w-full px-3 py-2 rounded-lg border border-dashed border-border hover:bg-slate-50 text-sm"
                      onClick={addOption}
                    >
                      <Plus className="w-4 h-4 mr-1 inline-block" />
                      Add Option
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium block mb-1">Duration</label>
                    <select 
                      className="w-full rounded-lg border border-border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500"
                      value={pollData.duration}
                      onChange={(e) => setPollData(prev => ({ ...prev, duration: e.target.value }))}
                    >
                      <option value="1">1 hour</option>
                      <option value="24">24 hours</option>
                      <option value="72">3 days</option>
                      <option value="168">1 week</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium block mb-1">Type</label>
                    <select 
                      className="w-full rounded-lg border border-border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500"
                      value={pollData.type}
                      onChange={(e) => setPollData(prev => ({ ...prev, type: e.target.value }))}
                    >
                      <option value="single">Single choice</option>
                      <option value="multiple">Multiple choice</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    id="anonymous"
                    className="rounded border-border"
                    checked={pollData.anonymous}
                    onChange={(e) => setPollData(prev => ({ ...prev, anonymous: e.target.checked }))}
                  />
                  <label htmlFor="anonymous" className="text-sm text-slate-600">
                    Make responses anonymous
                  </label>
                </div>
              </div>
              
              <div className="flex items-center gap-2 mt-4">
                <button 
                  className="px-3 py-2 rounded-lg border border-border hover:bg-slate-50 text-sm flex-1"
                  onClick={() => setShowCreateForm(false)}
                >
                  Cancel
                </button>
                <button 
                  className="px-3 py-2 rounded-lg text-white text-sm bg-yellow-500 flex-1"
                  onClick={createPoll}
                >
                  <Send className="w-4 h-4 mr-1 inline-block" />
                  Create Poll
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PollsModal;
