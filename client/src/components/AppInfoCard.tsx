import React from 'react';
import { Mail, Calendar, Shield, X } from 'lucide-react';

interface AppInfoCardProps {
  app: 'mail' | 'calendar' | 'vault';
  onClose: () => void;
  onOpen: () => void;
}

const AppInfoCard: React.FC<AppInfoCardProps> = ({ app, onClose, onOpen }) => {
  const appConfig = {
    mail: {
      icon: <Mail className="w-12 h-12" />,
      title: 'Sartthi Mail',
      description: 'Access your Gmail inbox with a beautiful, modern interface. Manage emails, compose messages, and stay organized.',
      features: [
        'Connect your Gmail account',
        'Modern email interface',
        'Real-time synchronization',
        'Compose and send emails',
        'Organize with folders and labels'
      ],
      color: 'from-blue-500 to-blue-600',
      bgGradient: 'from-blue-500/10 to-blue-600/10',
      borderColor: 'border-blue-500/20'
    },
    calendar: {
      icon: <Calendar className="w-12 h-12" />,
      title: 'Sartthi Calendar',
      description: 'Manage your Google Calendar events seamlessly. Create, edit, and organize your schedule with ease.',
      features: [
        'Connect your Google Calendar',
        'Create and manage events',
        'Multiple calendar views',
        'Task integration',
        'Real-time event sync'
      ],
      color: 'from-purple-500 to-purple-600',
      bgGradient: 'from-purple-500/10 to-purple-600/10',
      borderColor: 'border-purple-500/20'
    },
    vault: {
      icon: <Shield className="w-12 h-12" />,
      title: 'Sartthi Vault',
      description: 'Your secure file storage powered by Google Drive. Store files in a dedicated "Sartthi Vault" folder with complete privacy.',
      features: [
        'Dedicated Google Drive folder',
        'Your personal files stay private',
        'Upload and organize files',
        'Secure file management',
        'You control your data'
      ],
      color: 'from-green-500 to-emerald-600',
      bgGradient: 'from-green-500/10 to-emerald-600/10',
      borderColor: 'border-green-500/20'
    }
  };

  const config = appConfig[app];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4 animate-fadeIn">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Card */}
      <div className="relative w-full max-w-md bg-gradient-to-br from-gray-900 to-gray-800 rounded-t-3xl sm:rounded-3xl shadow-2xl border border-gray-700 overflow-hidden animate-slideUp">
        {/* Header with gradient */}
        <div className={`bg-gradient-to-r ${config.color} p-6 relative`}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors text-white"
          >
            <X size={20} />
          </button>

          <div className="flex items-center gap-4 text-white">
            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
              {config.icon}
            </div>
            <div>
              <h2 className="text-2xl font-bold">{config.title}</h2>
              <p className="text-white/90 text-sm mt-1">Not connected yet</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Description */}
          <p className="text-gray-300 leading-relaxed">
            {config.description}
          </p>

          {/* Features */}
          <div>
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <span className="w-1 h-4 bg-gradient-to-b ${config.color} rounded-full" />
              Features
            </h3>
            <ul className="space-y-2">
              {config.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-3 text-gray-300 text-sm">
                  <span className={`mt-1 w-1.5 h-1.5 rounded-full bg-gradient-to-r ${config.color} flex-shrink-0`} />
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          {/* Privacy Note for Vault */}
          {app === 'vault' && (
            <div className={`p-4 bg-gradient-to-r ${config.bgGradient} border ${config.borderColor} rounded-xl`}>
              <p className="text-sm text-gray-300">
                <span className="font-semibold text-green-400">🔒 Privacy First:</span> We only access files in your "Sartthi Vault" folder. Your personal files remain completely private.
              </p>
            </div>
          )}

          {/* Action Button */}
          <div className="pt-4">
            <button
              onClick={onOpen}
              className="w-full px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-medium transition-colors"
            >
              Open App
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppInfoCard;
