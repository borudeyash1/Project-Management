import React, { useState } from 'react';
import { X, Mail, UserPlus, Copy, Check } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvite: (email: string, role: string, message?: string) => void;
}

const InviteMemberModal: React.FC<InviteMemberModalProps> = ({
  isOpen,
  onClose,
  onInvite
}) => {
  const { isDarkMode } = useTheme();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('member');
  const [customRole, setCustomRole] = useState('');
  const [message, setMessage] = useState('');
  const [inviteLink, setInviteLink] = useState('');
  const [linkCopied, setLinkCopied] = useState(false);
  const [inviteMethod, setInviteMethod] = useState<'email' | 'link'>('email');

  // Predefined roles
  const roles = [
    { value: 'owner', label: t('team.roleOwner'), description: t('team.roleOwnerDesc') },
    { value: 'admin', label: t('team.roleAdmin'), description: t('team.roleAdminDesc') },
    { value: 'manager', label: t('team.roleManager'), description: t('team.roleManagerDesc') },
    { value: 'member', label: t('team.roleMember'), description: t('team.roleMemberDesc') },
    { value: 'viewer', label: t('team.roleViewer'), description: t('team.roleViewerDesc') },
    { value: 'custom', label: t('team.roleCustom'), description: t('team.roleCustomDesc') }
  ];

  const handleGenerateLink = () => {
    // Generate a mock invite link (replace with actual API call)
    const mockLink = `https://yourapp.com/invite/${Math.random().toString(36).substr(2, 9)}`;
    setInviteLink(mockLink);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const handleInvite = () => {
    if (inviteMethod === 'email' && !email.trim()) {
      alert(t('team.pleaseEnterEmail'));
      return;
    }

    const finalRole = role === 'custom' ? customRole : role;
    
    if (!finalRole.trim()) {
      alert(t('team.pleaseSelectRole'));
      return;
    }

    onInvite(email, finalRole, message);
    
    // Reset form
    setEmail('');
    setRole('member');
    setCustomRole('');
    setMessage('');
    setInviteLink('');
  };

  const handleClose = () => {
    setEmail('');
    setRole('member');
    setCustomRole('');
    setMessage('');
    setInviteLink('');
    setLinkCopied(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
      <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div>
            <h2 className={`text-2xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {t('team.inviteTitle')}
            </h2>
            <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-600' : 'text-gray-600'}`}>
              {t('team.inviteDesc')}
            </p>
          </div>
          <button
            onClick={handleClose}
            className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
          >
            <X className={`w-5 h-5 ${isDarkMode ? 'text-gray-600' : 'text-gray-600'}`} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Invite Method Selection */}
            <div>
              <label className={`block text-sm font-medium mb-3 ${isDarkMode ? 'text-gray-700' : 'text-gray-700'}`}>
                {t('team.inviteMethod')}
              </label>
              <div className="flex gap-4">
                <button
                  onClick={() => setInviteMethod('email')}
                  className={`flex-1 p-4 rounded-lg border-2 transition-colors ${
                    inviteMethod === 'email'
                      ? isDarkMode
                        ? 'border-accent bg-blue-900/30'
                        : 'border-accent bg-blue-50'
                      : isDarkMode
                      ? 'border-gray-700 hover:bg-gray-700'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <Mail className={`w-6 h-6 mx-auto mb-2 ${inviteMethod === 'email' ? 'text-accent-dark' : isDarkMode ? 'text-gray-600' : 'text-gray-600'}`} />
                  <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{t('team.emailInvite')}</div>
                  <div className={`text-sm ${isDarkMode ? 'text-gray-600' : 'text-gray-600'}`}>{t('team.emailInviteDesc')}</div>
                </button>
                <button
                  onClick={() => setInviteMethod('link')}
                  className={`flex-1 p-4 rounded-lg border-2 transition-colors ${
                    inviteMethod === 'link'
                      ? isDarkMode
                        ? 'border-accent bg-blue-900/30'
                        : 'border-accent bg-blue-50'
                      : isDarkMode
                      ? 'border-gray-700 hover:bg-gray-700'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <Copy className={`w-6 h-6 mx-auto mb-2 ${inviteMethod === 'link' ? 'text-accent-dark' : isDarkMode ? 'text-gray-600' : 'text-gray-600'}`} />
                  <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{t('team.linkInvite')}</div>
                  <div className={`text-sm ${isDarkMode ? 'text-gray-600' : 'text-gray-600'}`}>{t('team.linkInviteDesc')}</div>
                </button>
              </div>
            </div>

            {/* Email Invite Form */}
            {inviteMethod === 'email' && (
              <>
                {/* Email Input */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-700' : 'text-gray-700'}`}>
                    {t('team.emailAddress')} *
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="colleague@company.com"
                    className={`w-full px-4 py-3 rounded-lg border ${
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:ring-2 focus:ring-accent focus:border-accent`}
                  />
                </div>

                {/* Personal Message */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-700' : 'text-gray-700'}`}>
                    {t('team.personalMessage')}
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={t('team.personalMessagePlaceholder')}
                    rows={3}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:ring-2 focus:ring-accent focus:border-accent`}
                  />
                </div>
              </>
            )}

            {/* Link Generation */}
            {inviteMethod === 'link' && (
              <div>
                {!inviteLink ? (
                  <button
                    onClick={handleGenerateLink}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-accent text-gray-900 rounded-lg hover:bg-accent-hover"
                  >
                    <Copy className="w-5 h-5" />
                    {t('team.generateLink')}
                  </button>
                ) : (
                  <div className={`p-4 rounded-lg border ${isDarkMode ? 'border-gray-700 bg-gray-700/50' : 'border-gray-300 bg-gray-50'}`}>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-700' : 'text-gray-700'}`}>
                      {t('team.linkInvite')}
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={inviteLink}
                        readOnly
                        className={`flex-1 px-4 py-2 rounded-lg border ${
                          isDarkMode
                            ? 'bg-gray-800 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      />
                      <button
                        onClick={handleCopyLink}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                          linkCopied
                            ? 'bg-green-600 text-white'
                            : 'bg-accent text-gray-900 hover:bg-accent-hover'
                        }`}
                      >
                        {linkCopied ? (
                          <>
                            <Check className="w-4 h-4" />
                            {t('team.copied')}
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            {t('team.copy')}
                          </>
                        )}
                      </button>
                    </div>
                    <p className={`text-sm mt-2 ${isDarkMode ? 'text-gray-600' : 'text-gray-600'}`}>
                      {t('team.linkDesc')}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Role Selection */}
            <div>
              <label className={`block text-sm font-medium mb-3 ${isDarkMode ? 'text-gray-700' : 'text-gray-700'}`}>
                {t('team.assignRole')} *
              </label>
              <div className="space-y-2">
                {roles.map((roleOption) => (
                  <label
                    key={roleOption.value}
                    className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                      role === roleOption.value
                        ? isDarkMode
                          ? 'bg-blue-900/30 border-2 border-accent'
                          : 'bg-blue-50 border-2 border-accent'
                        : isDarkMode
                        ? 'bg-gray-700/50 border-2 border-gray-700 hover:bg-gray-700'
                        : 'bg-gray-50 border-2 border-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={roleOption.value}
                      checked={role === roleOption.value}
                      onChange={(e) => setRole(e.target.value)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {roleOption.label}
                      </div>
                      <div className={`text-sm ${isDarkMode ? 'text-gray-600' : 'text-gray-600'}`}>
                        {roleOption.description}
                      </div>
                    </div>
                  </label>
                ))}
              </div>

              {/* Custom Role Input */}
              {role === 'custom' && (
                <div className="mt-4">
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-700' : 'text-gray-700'}`}>
                    {t('team.enterCustomRole')}
                  </label>
                  <input
                    type="text"
                    value={customRole}
                    onChange={(e) => setCustomRole(e.target.value)}
                    placeholder={t('team.customRolePlaceholder')}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:ring-2 focus:ring-accent focus:border-accent`}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={`flex items-center justify-end gap-3 p-6 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <button
            onClick={handleClose}
            className={`px-4 py-2 rounded-lg font-medium ${
              isDarkMode
                ? 'bg-gray-700 text-gray-700 hover:bg-gray-600'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {t('common.cancel')}
          </button>
          {inviteMethod === 'email' && (
            <button
              onClick={handleInvite}
              disabled={!email.trim() || (role === 'custom' && !customRole.trim())}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium ${
                !email.trim() || (role === 'custom' && !customRole.trim())
                  ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                  : 'bg-accent text-gray-900 hover:bg-accent-hover'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              {t('team.sendInvitation')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default InviteMemberModal;
