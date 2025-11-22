import React from 'react';
import { Building, Briefcase, GraduationCap, Edit, Plus, Trash2, Target, Trophy, Clock, Globe } from 'lucide-react';

interface ProfileTabsProps {
  profileData: any;
  setEditingField: (field: string) => void;
  setEditValue: (value: string) => void;
  handleSaveProfile: (field: string, value: any) => void;
  isDarkMode: boolean;
}

// Professional Tab Component
export const renderProfessional = ({ profileData, setEditingField, setEditValue, isDarkMode }: ProfileTabsProps) => (
  <div className="space-y-6">
    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Professional Information</h3>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Job Title */}
      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="flex items-center gap-3">
          <Briefcase className="w-5 h-5 text-gray-600 dark:text-gray-200" />
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-200">Job Title</p>
            <p className="font-medium text-gray-900 dark:text-gray-100">
              {profileData?.profile?.jobTitle || 'Not specified'}
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            setEditingField('profile.jobTitle');
            setEditValue(profileData?.profile?.jobTitle || '');
          }}
          className="text-accent hover:opacity-80"
        >
          <Edit className="w-4 h-4" />
        </button>
      </div>

      {/* Company */}
      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="flex items-center gap-3">
          <Building className="w-5 h-5 text-gray-600 dark:text-gray-200" />
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-200">Company</p>
            <p className="font-medium text-gray-900 dark:text-gray-100">
              {profileData?.profile?.company || 'Not specified'}
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            setEditingField('profile.company');
            setEditValue(profileData?.profile?.company || '');
          }}
          className="text-accent hover:opacity-80"
        >
          <Edit className="w-4 h-4" />
        </button>
      </div>

      {/* Industry */}
      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="flex items-center gap-3">
          <Globe className="w-5 h-5 text-gray-600 dark:text-gray-200" />
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-200">Industry</p>
            <p className="font-medium text-gray-900 dark:text-gray-100 capitalize">
              {profileData?.profile?.industry || 'Not specified'}
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            setEditingField('profile.industry');
            setEditValue(profileData?.profile?.industry || '');
          }}
          className="text-accent hover:opacity-80"
        >
          <Edit className="w-4 h-4" />
        </button>
      </div>

      {/* Experience Level */}
      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="flex items-center gap-3">
          <Target className="w-5 h-5 text-gray-600 dark:text-gray-200" />
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-200">Experience Level</p>
            <p className="font-medium text-gray-900 dark:text-gray-100 capitalize">
              {profileData?.profile?.experience || 'Not specified'}
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            setEditingField('profile.experience');
            setEditValue(profileData?.profile?.experience || '');
          }}
          className="text-accent hover:opacity-80"
        >
          <Edit className="w-4 h-4" />
        </button>
      </div>
    </div>
  </div>
);

// Skills & Learning Tab Component  
export const renderSkillsLearning = ({ profileData, isDarkMode }: ProfileTabsProps) => (
  <div className="space-y-6">
    {/* Skills Section */}
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Skills</h3>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:opacity-90">
          <Plus className="w-4 h-4" />
          Add Skill
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {profileData?.profile?.skills?.map((skill: any, index: number) => (
          <div key={index} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-gray-900 dark:text-gray-100">{skill.name}</h4>
              <button className="text-red-600 hover:text-red-700">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className={`px-2 py-1 rounded-full ${
                skill.level === 'expert' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                skill.level === 'advanced' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                skill.level === 'intermediate' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
              }`}>
                {skill.level}
              </span>
              <span className="text-gray-600 dark:text-gray-400 capitalize">{skill.category}</span>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Learning Interests */}
    <div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Learning Interests</h3>
      <div className="flex flex-wrap gap-2">
        {profileData?.profile?.learning?.interests?.map((interest: string, index: number) => (
          <span key={index} className="px-3 py-1 bg-accent/10 text-accent rounded-full text-sm">
            {interest}
          </span>
        ))}
      </div>
    </div>

    {/* Current Learning */}
    <div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Currently Learning</h3>
      <div className="space-y-4">
        {profileData?.profile?.learning?.currentLearning?.map((item: any, index: number) => (
          <div key={index} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-gray-900 dark:text-gray-100">{item.topic}</h4>
              <span className="text-sm text-gray-600 dark:text-gray-400">{item.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-accent h-2 rounded-full transition-all" 
                style={{ width: `${item.progress}%` }}
              />
            </div>
            {item.targetCompletion && (
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                Target: {new Date(item.targetCompletion).toLocaleDateString()}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>

    {/* Certifications */}
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Certifications</h3>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:opacity-90">
          <Plus className="w-4 h-4" />
          Add Certification
        </button>
      </div>
      <div className="space-y-3">
        {profileData?.profile?.learning?.certifications?.map((cert: any, index: number) => (
          <div key={index} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <GraduationCap className="w-5 h-5 text-accent" />
              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100">{cert.name}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">{cert.issuer}</p>
                {cert.dateEarned && (
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    Earned: {new Date(cert.dateEarned).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Work Preferences Tab Component
export const renderWorkPreferences = ({ profileData, setEditingField, setEditValue, isDarkMode }: ProfileTabsProps) => (
  <div className="space-y-6">
    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Work Preferences</h3>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Work Style */}
      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm text-gray-600 dark:text-gray-200">Work Style</p>
          <button
            onClick={() => {
              setEditingField('profile.workPreferences.workStyle');
              setEditValue(profileData?.profile?.workPreferences?.workStyle || '');
            }}
            className="text-accent hover:opacity-80"
          >
            <Edit className="w-4 h-4" />
          </button>
        </div>
        <p className="font-medium text-gray-900 dark:text-gray-100 capitalize">
          {profileData?.profile?.workPreferences?.workStyle || 'Not specified'}
        </p>
      </div>

      {/* Communication Style */}
      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm text-gray-600 dark:text-gray-200">Communication Style</p>
          <button
            onClick={() => {
              setEditingField('profile.workPreferences.communicationStyle');
              setEditValue(profileData?.profile?.workPreferences?.communicationStyle || '');
            }}
            className="text-accent hover:opacity-80"
          >
            <Edit className="w-4 h-4" />
          </button>
        </div>
        <p className="font-medium text-gray-900 dark:text-gray-100 capitalize">
          {profileData?.profile?.workPreferences?.communicationStyle || 'Not specified'}
        </p>
      </div>

      {/* Time Management */}
      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm text-gray-600 dark:text-gray-200">Time Management</p>
          <button
            onClick={() => {
              setEditingField('profile.workPreferences.timeManagement');
              setEditValue(profileData?.profile?.workPreferences?.timeManagement || '');
            }}
            className="text-accent hover:opacity-80"
          >
            <Edit className="w-4 h-4" />
          </button>
        </div>
        <p className="font-medium text-gray-900 dark:text-gray-100 capitalize">
          {profileData?.profile?.workPreferences?.timeManagement || 'Not specified'}
        </p>
      </div>

      {/* Timezone */}
      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm text-gray-600 dark:text-gray-200">Timezone</p>
          <button
            onClick={() => {
              setEditingField('profile.workPreferences.timezone');
              setEditValue(profileData?.profile?.workPreferences?.timezone || '');
            }}
            className="text-accent hover:opacity-80"
          >
            <Edit className="w-4 h-4" />
          </button>
        </div>
        <p className="font-medium text-gray-900 dark:text-gray-100">
          {profileData?.profile?.workPreferences?.timezone || 'Not specified'}
        </p>
      </div>
    </div>

    {/* Working Hours */}
    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Preferred Working Hours</h4>
      <div className="flex items-center gap-4">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Start</p>
          <p className="font-medium text-gray-900 dark:text-gray-100">
            {profileData?.profile?.workPreferences?.preferredWorkingHours?.start || '09:00'}
          </p>
        </div>
        <span className="text-gray-400">-</span>
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">End</p>
          <p className="font-medium text-gray-900 dark:text-gray-100">
            {profileData?.profile?.workPreferences?.preferredWorkingHours?.end || '17:00'}
          </p>
        </div>
      </div>
    </div>

    {/* Personality */}
    <div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Personality & Work Style</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-200 mb-2">Working Style</p>
          <p className="font-medium text-gray-900 dark:text-gray-100 capitalize">
            {profileData?.profile?.personality?.workingStyle || 'Not specified'}
          </p>
        </div>
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-200 mb-2">Stress Level</p>
          <p className="font-medium text-gray-900 dark:text-gray-100 capitalize">
            {profileData?.profile?.personality?.stressLevel || 'Not specified'}
          </p>
        </div>
      </div>

      {/* Motivation Factors */}
      {profileData?.profile?.personality?.motivationFactors && profileData.profile.personality.motivationFactors.length > 0 && (
        <div className="mt-4">
          <p className="text-sm text-gray-600 dark:text-gray-200 mb-2">Motivation Factors</p>
          <div className="flex flex-wrap gap-2">
            {profileData.profile.personality.motivationFactors.map((factor: string, index: number) => (
              <span key={index} className="px-3 py-1 bg-accent/10 text-accent rounded-full text-sm capitalize">
                {factor}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  </div>
);

// Goals Tab Component
export const renderGoals = ({ profileData, isDarkMode }: ProfileTabsProps) => (
  <div className="space-y-6">
    {/* Short-term Goals */}
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Short-term Goals</h3>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:opacity-90">
          <Plus className="w-4 h-4" />
          Add Goal
        </button>
      </div>
      <div className="space-y-3">
        {profileData?.profile?.goals?.shortTerm?.map((goal: any, index: number) => (
          <div key={index} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border-l-4 border-accent">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-gray-100">{goal.description}</p>
                {goal.targetDate && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Target: {new Date(goal.targetDate).toLocaleDateString()}
                  </p>
                )}
              </div>
              <span className={`px-2 py-1 rounded-full text-xs ${
                goal.priority === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                goal.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
              }`}>
                {goal.priority}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Long-term Goals */}
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Long-term Goals</h3>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:opacity-90">
          <Plus className="w-4 h-4" />
          Add Goal
        </button>
      </div>
      <div className="space-y-3">
        {profileData?.profile?.goals?.longTerm?.map((goal: any, index: number) => (
          <div key={index} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border-l-4 border-purple-500">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-gray-100">{goal.description}</p>
                {goal.targetDate && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Target: {new Date(goal.targetDate).toLocaleDateString()}
                  </p>
                )}
              </div>
              <span className={`px-2 py-1 rounded-full text-xs ${
                goal.priority === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                goal.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
              }`}>
                {goal.priority}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Career Aspirations */}
    {profileData?.profile?.goals?.careerAspirations && (
      <div className="p-4 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <Trophy className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">Career Aspirations</h3>
        </div>
        <p className="text-gray-700 dark:text-gray-300">
          {profileData.profile.goals.careerAspirations}
        </p>
      </div>
    )}
  </div>
);
