import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ChevronDown, ChevronRight } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import SharedNavbar from './SharedNavbar';
import SharedFooter from './SharedFooter';

const UserGuide: React.FC = () => {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const { isDarkMode } = useTheme();

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const sections = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      content: (
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900">1. Create Your Account</h4>
          <p className="text-gray-600">Sign up for a free account to get started with Proxima.</p>
          
          <h4 className="font-semibold text-gray-900">2. Set Up Your Workspace</h4>
          <p className="text-gray-600">Create your first workspace and invite team members.</p>
          
          <h4 className="font-semibold text-gray-900">3. Create Your First Project</h4>
          <p className="text-gray-600">Start by creating a project and adding tasks.</p>
        </div>
      )
    },
    {
      id: 'projects',
      title: 'Managing Projects',
      content: (
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900">Creating Projects</h4>
          <p className="text-gray-600">Click the "Create Project" button to start a new project. Fill in the project details including name, description, and timeline.</p>
          
          <h4 className="font-semibold text-gray-900">Project Settings</h4>
          <p className="text-gray-600">Configure project settings, team permissions, and notification preferences.</p>
          
          <h4 className="font-semibold text-gray-900">Project Analytics</h4>
          <p className="text-gray-600">Track project progress with built-in analytics and reporting tools.</p>
        </div>
      )
    },
    {
      id: 'tasks',
      title: 'Task Management',
      content: (
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900">Creating Tasks</h4>
          <p className="text-gray-600">Add tasks to your projects with detailed descriptions, due dates, and assignees.</p>
          
          <h4 className="font-semibold text-gray-900">Task Status</h4>
          <p className="text-gray-600">Update task status: Todo, In Progress, Completed, or On Hold.</p>
          
          <h4 className="font-semibold text-gray-900">Task Dependencies</h4>
          <p className="text-gray-600">Set up task dependencies to ensure proper workflow order.</p>
        </div>
      )
    },
    {
      id: 'team-collaboration',
      title: 'Team Collaboration',
      content: (
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900">Inviting Team Members</h4>
          <p className="text-gray-600">Invite team members to your workspace and assign them to projects.</p>
          
          <h4 className="font-semibold text-gray-900">Role Management</h4>
          <p className="text-gray-600">Assign different roles and permissions to team members.</p>
          
          <h4 className="font-semibold text-gray-900">Communication</h4>
          <p className="text-gray-600">Use comments and mentions to communicate within tasks and projects.</p>
        </div>
      )
    },
    {
      id: 'analytics',
      title: 'Analytics & Reports',
      content: (
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900">Project Analytics</h4>
          <p className="text-gray-600">View detailed analytics on project progress, team performance, and time tracking.</p>
          
          <h4 className="font-semibold text-gray-900">Custom Reports</h4>
          <p className="text-gray-600">Generate custom reports for stakeholders and team members.</p>
          
          <h4 className="font-semibold text-gray-900">Export Data</h4>
          <p className="text-gray-600">Export project data in various formats for external analysis.</p>
        </div>
      )
    },
    {
      id: 'troubleshooting',
      title: 'Troubleshooting',
      content: (
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900">Common Issues</h4>
          <p className="text-gray-600">Find solutions to common problems and frequently asked questions.</p>
          
          <h4 className="font-semibold text-gray-900">Performance Tips</h4>
          <p className="text-gray-600">Optimize your Proxima experience with these performance tips.</p>
          
          <h4 className="font-semibold text-gray-900">Contact Support</h4>
          <p className="text-gray-600">Get help from our support team when you need it.</p>
        </div>
      )
    }
  ];

  return (
    <div className={`min-h-screen flex flex-col ${isDarkMode ? 'bg-gradient-to-br from-gray-900 via-yellow-900 to-orange-900' : 'bg-gradient-to-br from-yellow-50 via-orange-50 to-amber-50'}`}>
      <SharedNavbar />

      {/* Content */}
      <div className="pt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          {/* Back Button */}
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-8 transition-colors duration-200"
          >
            <ArrowLeft size={16} />
            Back to Home
          </Link>

          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              User <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Guide</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to know to get the most out of Proxima.
            </p>
          </div>

          {/* Quick Start */}
          <div className="bg-white/50 backdrop-blur-sm rounded-xl p-8 border border-white/20 shadow-lg mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Quick Start</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-blue-600 font-bold text-lg">1</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Sign Up</h3>
                <p className="text-gray-600 text-sm">Create your free account</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-purple-600 font-bold text-lg">2</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Create Workspace</h3>
                <p className="text-gray-600 text-sm">Set up your team workspace</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-green-600 font-bold text-lg">3</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Start Managing</h3>
                <p className="text-gray-600 text-sm">Create projects and tasks</p>
              </div>
            </div>
          </div>

          {/* Guide Sections */}
          <div className="space-y-4">
            {sections.map((section) => (
              <div key={section.id} className="bg-white/50 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg">
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full px-8 py-6 text-left flex items-center justify-between hover:bg-white/30 transition-colors duration-200"
                >
                  <h3 className="text-xl font-semibold text-gray-900">{section.title}</h3>
                  {expandedSection === section.id ? (
                    <ChevronDown size={20} className="text-gray-600" />
                  ) : (
                    <ChevronRight size={20} className="text-gray-600" />
                  )}
                </button>
                {expandedSection === section.id && (
                  <div className="px-8 pb-6">
                    {section.content}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Support Section */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-center mt-12">
            <h2 className="text-2xl font-bold text-white mb-4">Need More Help?</h2>
            <p className="text-blue-100 mb-6">
              Our support team is here to help you succeed.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:support@proxima.com"
                className="bg-white text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-all duration-200"
              >
                Contact Support
              </a>
              <Link
                to="/register"
                className="border-2 border-white text-white px-6 py-3 rounded-lg font-medium hover:bg-white hover:text-blue-600 transition-all duration-200"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </div>
      <SharedFooter />
    </div>
  );
};

export default UserGuide;
