import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ChevronDown, ChevronRight, BookOpen, Rocket, CheckCircle2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import SharedNavbar from './SharedNavbar';
import SharedFooter from './SharedFooter';
import ContentBanner from './ContentBanner';

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
          <p className="text-gray-600">Sign up for a free account to get started with Sartthi.</p>
          
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
          <p className="text-gray-600">Optimize your Sartthi experience with these performance tips.</p>
          
          <h4 className="font-semibold text-gray-900">Contact Support</h4>
          <p className="text-gray-600">Get help from our support team when you need it.</p>
        </div>
      )
    }
  ];

  return (
    <div className={`min-h-screen flex flex-col ${isDarkMode ? 'bg-gradient-to-b from-gray-900 via-gray-900 to-gray-950' : 'bg-gradient-to-b from-amber-50 via-white to-white'} relative overflow-hidden`}>
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-32 left-16 w-80 h-80 ${isDarkMode ? 'bg-yellow-500/10' : 'bg-yellow-200/20'} rounded-full blur-3xl animate-pulse`}></div>
        <div className={`absolute bottom-32 right-16 w-80 h-80 ${isDarkMode ? 'bg-orange-500/10' : 'bg-orange-200/20'} rounded-full blur-3xl animate-pulse delay-1000`}></div>
      </div>
      <SharedNavbar />
      <ContentBanner route="/user-guide" />

      {/* Content */}
      <div className="pt-16 relative z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          {/* Back Button */}
          <Link
            to="/"
            className={`inline-flex items-center gap-2 ${isDarkMode ? 'text-yellow-600 hover:text-yellow-700' : 'text-yellow-600 hover:text-yellow-700'} mb-8 transition-colors duration-200 font-medium`}
          >
            <ArrowLeft size={18} />
            Back to Home
          </Link>

          {/* Header */}
          <div className="text-center mb-20">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 shadow-lg ${isDarkMode ? 'bg-gray-800 text-amber-300' : 'bg-amber-100 text-amber-700'}`}>
              <BookOpen className="w-4 h-4" />
              <span className="text-sm font-medium">Complete Documentation</span>
            </div>
            <h1 className={`text-5xl md:text-6xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-6`}>
              User <span className="text-accent">Guide</span>
            </h1>
            <p className={`text-xl md:text-2xl ${isDarkMode ? 'text-gray-700' : 'text-gray-600'} max-w-3xl mx-auto leading-relaxed`}>
              Everything you need to know to get the most out of Sartthi.
            </p>
          </div>

          {/* Quick Start */}
          <div className={`${isDarkMode ? 'bg-gray-800/60 backdrop-blur-sm border-gray-700/30' : 'bg-white/70 backdrop-blur-sm border-white/40'} rounded-2xl p-10 border shadow-2xl mb-16`}>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center shadow-lg">
                <Rocket className="w-6 h-6 text-white" />
              </div>
              <h2 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Quick Start</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center group">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl group-hover:scale-110 transition-transform duration-300">
                  <span className="text-white font-bold text-2xl">1</span>
                </div>
                <h3 className={`font-bold text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>Sign Up</h3>
                <p className={`${isDarkMode ? 'text-gray-600' : 'text-gray-600'} text-sm leading-relaxed`}>Create your free account in seconds</p>
              </div>
              <div className="text-center group">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl group-hover:scale-110 transition-transform duration-300">
                  <span className="text-white font-bold text-2xl">2</span>
                </div>
                <h3 className={`font-bold text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>Create Workspace</h3>
                <p className={`${isDarkMode ? 'text-gray-600' : 'text-gray-600'} text-sm leading-relaxed`}>Set up your team workspace</p>
              </div>
              <div className="text-center group">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl group-hover:scale-110 transition-transform duration-300">
                  <span className="text-white font-bold text-2xl">3</span>
                </div>
                <h3 className={`font-bold text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>Start Managing</h3>
                <p className={`${isDarkMode ? 'text-gray-600' : 'text-gray-600'} text-sm leading-relaxed`}>Create projects and tasks</p>
              </div>
            </div>
          </div>

          {/* Guide Sections */}
          <div className="space-y-4">
            {sections.map((section, index) => (
              <div key={section.id} className={`group ${isDarkMode ? 'bg-gray-800/60 backdrop-blur-sm border-gray-700/30' : 'bg-white/70 backdrop-blur-sm border-white/40'} rounded-2xl border shadow-xl hover:shadow-2xl transition-all duration-300`}>
                <button
                  onClick={() => toggleSection(section.id)}
                  className={`w-full px-8 py-6 text-left flex items-center justify-between ${isDarkMode ? 'hover:bg-gray-800/80' : 'hover:bg-white/90'} transition-colors duration-200 rounded-2xl`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center shadow-lg">
                      <span className="text-white font-bold">{index + 1}</span>
                    </div>
                    <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{section.title}</h3>
                  </div>
                  <div className={`${expandedSection === section.id ? 'rotate-180' : ''} transition-transform duration-300`}>
                    <ChevronDown size={24} className={`${isDarkMode ? 'text-yellow-600' : 'text-yellow-600'}`} />
                  </div>
                </button>
                {expandedSection === section.id && (
                  <div className="px-8 pb-6 animate-fade-in">
                    {section.content}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Support Section */}
          <div className={`relative bg-gradient-to-r ${isDarkMode ? 'from-yellow-600 via-orange-600 to-red-600' : 'from-yellow-500 via-orange-500 to-red-500'} rounded-2xl p-12 text-center mt-16 overflow-hidden shadow-2xl`}>
            {/* Decorative Elements */}
            <div className="absolute inset-0 bg-grid-white/10 bg-[size:20px_20px]"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
                <CheckCircle2 className="text-white" size={18} />
                <span className="text-white text-sm font-semibold">24/7 Support Available</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Need More Help?</h2>
              <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                Our support team is here to help you succeed.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="mailto:support@sartthi.com"
                  className="group bg-white text-orange-600 px-8 py-4 rounded-xl font-bold hover:bg-gray-50 transition-all duration-300 shadow-xl hover:scale-105 transform inline-flex items-center justify-center gap-2"
                >
                  Contact Support
                  <ArrowLeft size={18} className="rotate-180 group-hover:translate-x-1 transition-transform" />
                </a>
                <Link
                  to="/register"
                  className="border-2 border-white text-white px-8 py-4 rounded-xl font-bold hover:bg-white hover:text-orange-600 transition-all duration-300 shadow-xl hover:scale-105 transform"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      <SharedFooter />
    </div>
  );
};

export default UserGuide;
