import React, { useState } from 'react';
import { X, Plus, Check, Calendar, Users, Tag, MoreVertical } from 'lucide-react';

interface InteractiveMockupProps {
  type: 'dashboard' | 'create-project' | 'kanban' | 'task-form' | 'calendar' | 'team-invite' | 'file-upload' | 'analytics';
  title?: string;
}

export const InteractiveMockup: React.FC<InteractiveMockupProps> = ({ type, title }) => {
  const [activeTab, setActiveTab] = useState('board');
  const [tasks, setTasks] = useState([
    { id: 1, title: 'Design homepage', status: 'todo', priority: 'high' },
    { id: 2, title: 'Setup database', status: 'inprogress', priority: 'medium' },
    { id: 3, title: 'Write documentation', status: 'done', priority: 'low' }
  ]);
  const [showModal, setShowModal] = useState(false);
  const [projectName, setProjectName] = useState('');

  const renderDashboard = () => (
    <div className="bg-gray-50 rounded-lg border-2 border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">My Workspace</h3>
          <button className="px-4 py-2 bg-[#006397] text-white rounded-lg text-sm hover:bg-[#005280] transition-colors">
            + New Project
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 grid md:grid-cols-3 gap-4">
        {/* Project Cards */}
        <div className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <span className="text-xl">📊</span>
            </div>
            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">Active</span>
          </div>
          <h4 className="font-semibold text-gray-900 mb-2">Website Redesign</h4>
          <p className="text-sm text-gray-600 mb-3">Q1 2024 Project</p>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">12/20 tasks</span>
            <div className="flex -space-x-2">
              <div className="w-6 h-6 rounded-full bg-purple-500 border-2 border-white"></div>
              <div className="w-6 h-6 rounded-full bg-blue-500 border-2 border-white"></div>
              <div className="w-6 h-6 rounded-full bg-green-500 border-2 border-white"></div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <span className="text-xl">🚀</span>
            </div>
            <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">In Progress</span>
          </div>
          <h4 className="font-semibold text-gray-900 mb-2">Mobile App Launch</h4>
          <p className="text-sm text-gray-600 mb-3">Marketing Campaign</p>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">8/15 tasks</span>
            <div className="flex -space-x-2">
              <div className="w-6 h-6 rounded-full bg-red-500 border-2 border-white"></div>
              <div className="w-6 h-6 rounded-full bg-yellow-500 border-2 border-white"></div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <span className="text-xl">📱</span>
            </div>
            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">Planning</span>
          </div>
          <h4 className="font-semibold text-gray-900 mb-2">API Integration</h4>
          <p className="text-sm text-gray-600 mb-3">Backend Development</p>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">0/10 tasks</span>
            <div className="flex -space-x-2">
              <div className="w-6 h-6 rounded-full bg-indigo-500 border-2 border-white"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCreateProject = () => (
    <div className="bg-gray-50 rounded-lg border-2 border-gray-200 p-6">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Create New Project</h3>
          <button className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Project Name *</label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="Enter project name..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006397] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              rows={3}
              placeholder="What is this project about?"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006397] focus:border-transparent"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Deadline</label>
              <div className="relative">
                <input
                  type="date"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006397] focus:border-transparent"
                />
                <Calendar className="absolute right-3 top-2.5 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Visibility</label>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006397] focus:border-transparent">
                <option>Team</option>
                <option>Private</option>
                <option>Public</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Team Members</label>
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full bg-purple-500 border-2 border-white flex items-center justify-center text-white text-xs">JD</div>
                <div className="w-8 h-8 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center text-white text-xs">SM</div>
                <div className="w-8 h-8 rounded-full bg-green-500 border-2 border-white flex items-center justify-center text-white text-xs">AK</div>
              </div>
              <button className="w-8 h-8 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:border-[#006397] hover:text-[#006397]">
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
          <button className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            Cancel
          </button>
          <button className="px-6 py-2 bg-[#006397] text-white rounded-lg hover:bg-[#005280] transition-colors">
            Create Project
          </button>
        </div>
      </div>
    </div>
  );

  const renderKanban = () => (
    <div className="bg-gray-50 rounded-lg border-2 border-gray-200 p-6 overflow-x-auto">
      <div className="flex gap-4 min-w-max">
        {/* To Do Column */}
        <div className="w-80 bg-gray-100 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-gray-900">To Do</h4>
            <span className="px-2 py-1 bg-gray-200 text-gray-600 text-xs rounded-full">3</span>
          </div>
          <div className="space-y-3">
            <div className="bg-white rounded-lg p-3 border border-gray-200 cursor-move hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-2">
                <h5 className="font-medium text-gray-900 text-sm">Design homepage mockup</h5>
                <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded">High</span>
              </div>
              <p className="text-xs text-gray-600 mb-3">Create wireframes and high-fidelity designs</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Calendar className="w-3 h-3" />
                  <span>Dec 28</span>
                </div>
                <div className="w-6 h-6 rounded-full bg-purple-500 text-white text-xs flex items-center justify-center">JD</div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-3 border border-gray-200 cursor-move hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-2">
                <h5 className="font-medium text-gray-900 text-sm">Setup CI/CD pipeline</h5>
                <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded">Med</span>
              </div>
              <p className="text-xs text-gray-600 mb-3">Configure GitHub Actions</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Calendar className="w-3 h-3" />
                  <span>Dec 30</span>
                </div>
                <div className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center">SM</div>
              </div>
            </div>
          </div>
          <button className="w-full mt-3 py-2 text-sm text-gray-600 hover:bg-gray-200 rounded-lg transition-colors flex items-center justify-center gap-2">
            <Plus className="w-4 h-4" />
            Add Task
          </button>
        </div>

        {/* In Progress Column */}
        <div className="w-80 bg-blue-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-gray-900">In Progress</h4>
            <span className="px-2 py-1 bg-blue-200 text-blue-700 text-xs rounded-full">2</span>
          </div>
          <div className="space-y-3">
            <div className="bg-white rounded-lg p-3 border border-blue-200 cursor-move hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-2">
                <h5 className="font-medium text-gray-900 text-sm">Implement authentication</h5>
                <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded">High</span>
              </div>
              <p className="text-xs text-gray-600 mb-3">JWT tokens and OAuth integration</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Calendar className="w-3 h-3" />
                  <span>Dec 27</span>
                </div>
                <div className="w-6 h-6 rounded-full bg-green-500 text-white text-xs flex items-center justify-center">AK</div>
              </div>
            </div>
          </div>
          <button className="w-full mt-3 py-2 text-sm text-gray-600 hover:bg-blue-100 rounded-lg transition-colors flex items-center justify-center gap-2">
            <Plus className="w-4 h-4" />
            Add Task
          </button>
        </div>

        {/* Done Column */}
        <div className="w-80 bg-green-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-gray-900">Done</h4>
            <span className="px-2 py-1 bg-green-200 text-green-700 text-xs rounded-full">4</span>
          </div>
          <div className="space-y-3">
            <div className="bg-white rounded-lg p-3 border border-green-200 cursor-move hover:shadow-md transition-shadow opacity-75">
              <div className="flex items-start justify-between mb-2">
                <h5 className="font-medium text-gray-900 text-sm line-through">Project kickoff meeting</h5>
                <Check className="w-4 h-4 text-green-600" />
              </div>
              <p className="text-xs text-gray-600 mb-3">Align team on goals and timeline</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Calendar className="w-3 h-3" />
                  <span>Dec 20</span>
                </div>
                <div className="w-6 h-6 rounded-full bg-purple-500 text-white text-xs flex items-center justify-center">JD</div>
              </div>
            </div>
          </div>
          <button className="w-full mt-3 py-2 text-sm text-gray-600 hover:bg-green-100 rounded-lg transition-colors flex items-center justify-center gap-2">
            <Plus className="w-4 h-4" />
            Add Task
          </button>
        </div>
      </div>
    </div>
  );

  const renderCalendar = () => (
    <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">December 2024</h3>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">Today</button>
          <button className="px-3 py-1 text-sm bg-[#006397] text-white rounded-lg hover:bg-[#005280]">+ New Event</button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-sm font-semibold text-gray-600 py-2">{day}</div>
        ))}
        {Array.from({ length: 35 }, (_, i) => {
          const day = i - 2;
          const isToday = day === 26;
          const hasEvent = [15, 20, 26, 28].includes(day);
          return (
            <div key={i} className={`aspect-square border rounded-lg p-2 ${isToday ? 'bg-blue-50 border-[#006397]' : 'border-gray-200'} ${day < 1 || day > 31 ? 'bg-gray-50' : 'hover:bg-gray-50 cursor-pointer'}`}>
              {day > 0 && day <= 31 && (
                <>
                  <div className={`text-sm ${isToday ? 'font-bold text-[#006397]' : 'text-gray-700'}`}>{day}</div>
                  {hasEvent && <div className="mt-1 h-1 w-1 rounded-full bg-[#006397] mx-auto"></div>}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderTeamInvite = () => (
    <div className="bg-gray-50 rounded-lg border-2 border-gray-200 p-6">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Invite Team Members</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Addresses</label>
            <input
              type="text"
              placeholder="Enter email addresses (comma separated)"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006397] focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006397] focus:border-transparent">
              <option>Member</option>
              <option>Admin</option>
              <option>Viewer</option>
              <option>Guest</option>
            </select>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2">Current Team (5 members)</h4>
            <div className="space-y-2">
              {['John Doe (Owner)', 'Sarah Miller (Admin)', 'Alex Kumar (Member)', 'Emma Wilson (Member)', 'Mike Brown (Viewer)'].map((member, idx) => (
                <div key={idx} className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full ${['bg-purple-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500'][idx]} text-white text-xs flex items-center justify-center`}>
                      {member.split(' ').map(n => n[0]).join('')}
                    </div>
                    <span className="text-sm text-gray-700">{member}</span>
                  </div>
                  {idx > 0 && <button className="text-xs text-red-600 hover:underline">Remove</button>}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 mt-6">
          <button className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">Cancel</button>
          <button className="px-6 py-2 bg-[#006397] text-white rounded-lg hover:bg-[#005280]">Send Invites</button>
        </div>
      </div>
    </div>
  );

  const renderFileUpload = () => (
    <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
      <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-[#006397] hover:bg-blue-50 transition-all cursor-pointer">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-[#006397]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </div>
        <h4 className="text-lg font-semibold text-gray-900 mb-2">Drop files here or click to upload</h4>
        <p className="text-sm text-gray-600 mb-4">Supports: PDF, DOC, XLS, PNG, JPG (Max 10MB)</p>
        <button className="px-6 py-2 bg-[#006397] text-white rounded-lg hover:bg-[#005280]">Browse Files</button>
      </div>
      <div className="mt-6 space-y-3">
        <h4 className="font-semibold text-gray-900">Recent Files</h4>
        {['Project Proposal.pdf', 'Design Mockups.fig', 'Budget Sheet.xlsx'].map((file, idx) => (
          <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-xl">📄</span>
              </div>
              <div>
                <div className="font-medium text-gray-900 text-sm">{file}</div>
                <div className="text-xs text-gray-500">2.4 MB • Uploaded 2 hours ago</div>
              </div>
            </div>
            <button className="text-gray-400 hover:text-gray-600">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-6">Project Analytics Dashboard</h3>
      <div className="grid md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Tasks', value: '48', change: '+12%', color: 'blue' },
          { label: 'Completed', value: '32', change: '+8%', color: 'green' },
          { label: 'In Progress', value: '12', change: '+4%', color: 'yellow' },
          { label: 'Overdue', value: '4', change: '-2%', color: 'red' }
        ].map((stat, idx) => (
          <div key={idx} className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">{stat.label}</div>
            <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
            <div className={`text-xs ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>{stat.change} this week</div>
          </div>
        ))}
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-4">Task Distribution</h4>
          <div className="space-y-3">
            {[
              { name: 'Development', count: 18, color: 'bg-blue-500', width: '60%' },
              { name: 'Design', count: 12, color: 'bg-purple-500', width: '40%' },
              { name: 'Marketing', count: 10, color: 'bg-green-500', width: '33%' },
              { name: 'Testing', count: 8, color: 'bg-yellow-500', width: '27%' }
            ].map((item, idx) => (
              <div key={idx}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-700">{item.name}</span>
                  <span className="text-gray-600">{item.count} tasks</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className={`${item.color} h-2 rounded-full`} style={{ width: item.width }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-4">Team Performance</h4>
          <div className="space-y-3">
            {['John Doe', 'Sarah Miller', 'Alex Kumar', 'Emma Wilson'].map((name, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full ${['bg-purple-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500'][idx]} text-white text-xs flex items-center justify-center`}>
                    {name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <span className="text-sm text-gray-700">{name}</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">{[12, 10, 8, 6][idx]} tasks</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const mockups = {
    dashboard: renderDashboard(),
    'create-project': renderCreateProject(),
    kanban: renderKanban(),
    calendar: renderCalendar(),
    'team-invite': renderTeamInvite(),
    'file-upload': renderFileUpload(),
    analytics: renderAnalytics(),
    'task-form': renderDashboard() // Placeholder
  };

  return (
    <div className="my-8">
      {title && <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>}
      <div className="relative">
        <div className="absolute top-4 left-4 z-10 bg-white px-3 py-1 rounded-full shadow-md text-xs font-medium text-gray-600">
          Interactive Demo
        </div>
        {mockups[type]}
      </div>
      <p className="text-sm text-gray-500 mt-3 text-center italic">
        ✨ This is an interactive mockup - try clicking around!
      </p>
    </div>
  );
};

export default InteractiveMockup;
