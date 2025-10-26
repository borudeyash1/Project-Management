import React, { useState, useEffect } from 'react';
import { 
  Users, Search, Filter, Edit, Trash2, Power, PowerOff, 
  Mail, Shield, CreditCard, Calendar, Eye, ChevronLeft, ChevronRight,
  CheckCircle, XCircle, Award, TrendingUp
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useApp } from '../../context/AppContext';
import api from '../../services/api';

interface User {
  _id: string;
  fullName: string;
  email: string;
  username: string;
  contactNumber?: string;
  designation?: string;
  department?: string;
  isActive: boolean;
  isEmailVerified: boolean;
  subscription: {
    plan: 'free' | 'pro' | 'ultra';
    status: string;
    endDate?: string;
    features: any;
  };
  createdAt: string;
  lastLogin?: string;
}

const UserManagement: React.FC = () => {
  const { isDarkMode } = useTheme();
  const { addToast } = useApp();
  
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [stats, setStats] = useState<any>(null);
  
  // Filters and pagination
  const [search, setSearch] = useState('');
  const [subscriptionFilter, setSubscriptionFilter] = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  useEffect(() => {
    // Check if admin is logged in
    const adminToken = localStorage.getItem('adminToken');
    console.log('🔍 [USER MANAGEMENT] Admin token exists:', !!adminToken);
    
    if (!adminToken) {
      console.error('❌ [USER MANAGEMENT] No admin token found');
      // Redirect without showing toast to avoid loops
      window.location.href = '/my-admin/login';
      return;
    }
    
    // Set admin token for API requests
    localStorage.setItem('accessToken', adminToken);
    
    fetchUsers();
    fetchStats();
    
    // Cleanup function to prevent memory leaks
    return () => {
      // Optional: cleanup if needed
    };
  }, [page, search, subscriptionFilter, activeFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      console.log('🔍 [USER MANAGEMENT] Fetching users...');
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
        ...(subscriptionFilter && { subscription: subscriptionFilter }),
        ...(activeFilter && { isActive: activeFilter })
      });

      console.log('🔍 [USER MANAGEMENT] Request params:', Object.fromEntries(params));
      
      const response = await api.get(`/user-management?${params}`);
      
      console.log('🔍 [USER MANAGEMENT] Response:', response);
      
      if (response?.success) {
        console.log('✅ [USER MANAGEMENT] Fetched', response.data.users.length, 'users');
        setUsers(response.data.users);
        setTotalPages(response.data.pagination.pages);
      }
    } catch (error: any) {
      console.error('❌ [USER MANAGEMENT] Failed to fetch users:', error);
      console.error('❌ [USER MANAGEMENT] Error details:', error?.message);
      addToast(error?.message || 'Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      console.log('🔍 [USER MANAGEMENT] Fetching stats...');
      
      const response = await api.get('/user-management/stats');
      
      console.log('🔍 [USER MANAGEMENT] Stats response:', response);
      
      if (response?.success) {
        console.log('✅ [USER MANAGEMENT] Stats fetched:', response.data);
        setStats(response.data);
      }
    } catch (error: any) {
      console.error('❌ [USER MANAGEMENT] Failed to fetch stats:', error);
      console.error('❌ [USER MANAGEMENT] Error details:', error?.message);
      // Don't show toast for stats error, just log it
    }
  };

  const handleToggleStatus = async (userId: string) => {
    try {
      console.log('🔍 [USER MANAGEMENT] Toggling status for user:', userId);
      const response = await api.patch(`/user-management/${userId}/toggle-status`);
      console.log('🔍 [USER MANAGEMENT] Toggle status response:', response);
      
      if (response?.success) {
        console.log('✅ [USER MANAGEMENT] Status toggled successfully');
        addToast('User status updated', 'success');
        fetchUsers();
        fetchStats();
      }
    } catch (error: any) {
      console.error('❌ [USER MANAGEMENT] Failed to toggle status:', error);
      addToast(error?.message || 'Failed to update status', 'error');
    }
  };

  const handleVerifyEmail = async (userId: string) => {
    try {
      console.log('🔍 [USER MANAGEMENT] Verifying email for user:', userId);
      const response = await api.patch(`/user-management/${userId}/verify-email`);
      console.log('🔍 [USER MANAGEMENT] Verify email response:', response);
      
      if (response?.success) {
        console.log('✅ [USER MANAGEMENT] Email verified successfully');
        addToast('Email verified successfully', 'success');
        fetchUsers();
      }
    } catch (error: any) {
      console.error('❌ [USER MANAGEMENT] Failed to verify email:', error);
      addToast(error?.message || 'Failed to verify email', 'error');
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!window.confirm(`Are you sure you want to delete ${userName}? This action cannot be undone.`)) return;

    try {
      console.log('🔍 [USER MANAGEMENT] Deleting user:', userId);
      const response = await api.delete(`/user-management/${userId}`);
      console.log('🔍 [USER MANAGEMENT] Delete user response:', response);
      
      if (response?.success) {
        console.log('✅ [USER MANAGEMENT] User deleted successfully');
        addToast('User deleted successfully', 'success');
        fetchUsers();
        fetchStats();
      }
    } catch (error: any) {
      console.error('❌ [USER MANAGEMENT] Failed to delete user:', error);
      addToast(error?.message || 'Failed to delete user', 'error');
    }
  };

  const handleUpdateSubscription = async (userId: string, plan: string) => {
    try {
      console.log('🔍 [USER MANAGEMENT] Updating subscription for user:', userId, 'to plan:', plan);
      
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1); // 1 month from now

      const payload = {
        plan,
        status: 'active',
        endDate: endDate.toISOString(),
        autoRenew: false,
        billingCycle: 'monthly'
      };
      
      console.log('🔍 [USER MANAGEMENT] Subscription payload:', payload);

      const response = await api.put(`/user-management/${userId}/subscription`, payload);
      
      console.log('🔍 [USER MANAGEMENT] Update subscription response:', response);

      if (response?.success) {
        console.log('✅ [USER MANAGEMENT] Subscription updated successfully');
        addToast(`Subscription updated to ${plan}`, 'success');
        setShowSubscriptionModal(false);
        fetchUsers();
        fetchStats();
      }
    } catch (error: any) {
      console.error('❌ [USER MANAGEMENT] Failed to update subscription:', error);
      addToast(error?.message || 'Failed to update subscription', 'error');
    }
  };

  const getPlanBadgeColor = (plan: string) => {
    switch (plan) {
      case 'free': return 'bg-gray-500/10 text-gray-500';
      case 'pro': return 'bg-blue-500/10 text-blue-500';
      case 'ultra': return 'bg-purple-500/10 text-purple-500';
      default: return 'bg-gray-500/10 text-gray-500';
    }
  };

  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  return (
    <div className={`p-6 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} min-h-screen`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            User Management
          </h1>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
            Manage all users, subscriptions, and permissions
          </p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-4`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Users</p>
                  <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mt-1`}>
                    {stats.totalUsers}
                  </p>
                </div>
                <Users className="w-8 h-8 text-blue-500" />
              </div>
            </div>

            <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-4`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Active Users</p>
                  <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mt-1`}>
                    {stats.activeUsers}
                  </p>
                </div>
                <Power className="w-8 h-8 text-green-500" />
              </div>
            </div>

            <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-4`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Pro Users</p>
                  <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mt-1`}>
                    {stats.subscriptions.pro}
                  </p>
                </div>
                <Award className="w-8 h-8 text-blue-500" />
              </div>
            </div>

            <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-4`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Ultra Users</p>
                  <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mt-1`}>
                    {stats.subscriptions.ultra}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-500" />
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-4 mb-6`}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              <input
                type="text"
                placeholder="Search users..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className={`w-full pl-10 pr-4 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-yellow-500`}
              />
            </div>

            {/* Subscription Filter */}
            <select
              value={subscriptionFilter}
              onChange={(e) => {
                setSubscriptionFilter(e.target.value);
                setPage(1);
              }}
              className={`px-4 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-yellow-500`}
            >
              <option value="">All Plans</option>
              <option value="free">Free</option>
              <option value="pro">Pro</option>
              <option value="ultra">Ultra</option>
            </select>

            {/* Active Filter */}
            <select
              value={activeFilter}
              onChange={(e) => {
                setActiveFilter(e.target.value);
                setPage(1);
              }}
              className={`px-4 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-yellow-500`}
            >
              <option value="">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>

            {/* Reset Filters */}
            <button
              onClick={() => {
                setSearch('');
                setSubscriptionFilter('');
                setActiveFilter('');
                setPage(1);
              }}
              className={`px-4 py-2 rounded-lg border ${isDarkMode ? 'border-gray-600 hover:bg-gray-700 text-white' : 'border-gray-300 hover:bg-gray-50 text-gray-900'} transition-colors`}
            >
              Reset Filters
            </button>
          </div>
        </div>

        {/* Users Table */}
        <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <tr>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                    User
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                    Contact
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                    Subscription
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                    Status
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                    Joined
                  </th>
                  <th className={`px-6 py-3 text-right text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className={`${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'} divide-y`}>
                {users.map((user) => (
                  <tr key={user._id} className={`${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition-colors`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                          {user.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {user.fullName}
                          </div>
                          <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            @{user.username}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                        {user.email}
                      </div>
                      {user.contactNumber && (
                        <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {user.contactNumber}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPlanBadgeColor(user.subscription.plan)}`}>
                        {user.subscription.plan.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {user.isActive ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-500" />
                        )}
                        <div title={user.isEmailVerified ? "Email Verified" : "Email Not Verified"}>
                          <Mail className={`w-5 h-5 ${user.isEmailVerified ? 'text-blue-500' : 'text-gray-400'}`} />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                        {new Date(user.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        {/* Change Subscription */}
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowSubscriptionModal(true);
                          }}
                          className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'} transition-colors`}
                          title="Change Subscription"
                        >
                          <CreditCard className="w-5 h-5 text-blue-500" />
                        </button>

                        {/* Verify Email */}
                        {!user.isEmailVerified && (
                          <button
                            onClick={() => handleVerifyEmail(user._id)}
                            className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'} transition-colors`}
                            title="Verify Email"
                          >
                            <Mail className="w-5 h-5 text-green-500" />
                          </button>
                        )}

                        {/* Toggle Status */}
                        <button
                          onClick={() => handleToggleStatus(user._id)}
                          className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'} transition-colors`}
                          title={user.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {user.isActive ? (
                            <PowerOff className="w-5 h-5 text-orange-500" />
                          ) : (
                            <Power className="w-5 h-5 text-green-500" />
                          )}
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => handleDeleteUser(user._id, user.fullName)}
                          className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'} transition-colors`}
                          title="Delete User"
                        >
                          <Trash2 className="w-5 h-5 text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className={`px-6 py-4 flex items-center justify-between border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-700'}`}>
              Page {page} of {totalPages}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className={`p-2 rounded-lg ${page === 1 ? 'opacity-50 cursor-not-allowed' : ''} ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className={`p-2 rounded-lg ${page === totalPages ? 'opacity-50 cursor-not-allowed' : ''} ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Subscription Modal */}
        {showSubscriptionModal && selectedUser && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-2xl p-6 max-w-md w-full`}>
              <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>
                Change Subscription
              </h3>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-6`}>
                Change subscription plan for {selectedUser.fullName}
              </p>

              <div className="space-y-3">
                <button
                  onClick={() => handleUpdateSubscription(selectedUser._id, 'free')}
                  className={`w-full p-4 rounded-xl border-2 ${selectedUser.subscription.plan === 'free' ? 'border-gray-500 bg-gray-500/10' : isDarkMode ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-50'} transition-colors text-left`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Free Plan</p>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Basic features</p>
                    </div>
                    {selectedUser.subscription.plan === 'free' && (
                      <CheckCircle className="w-6 h-6 text-gray-500" />
                    )}
                  </div>
                </button>

                <button
                  onClick={() => handleUpdateSubscription(selectedUser._id, 'pro')}
                  className={`w-full p-4 rounded-xl border-2 ${selectedUser.subscription.plan === 'pro' ? 'border-blue-500 bg-blue-500/10' : isDarkMode ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-50'} transition-colors text-left`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Pro Plan</p>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Advanced features</p>
                    </div>
                    {selectedUser.subscription.plan === 'pro' && (
                      <CheckCircle className="w-6 h-6 text-blue-500" />
                    )}
                  </div>
                </button>

                <button
                  onClick={() => handleUpdateSubscription(selectedUser._id, 'ultra')}
                  className={`w-full p-4 rounded-xl border-2 ${selectedUser.subscription.plan === 'ultra' ? 'border-purple-500 bg-purple-500/10' : isDarkMode ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-50'} transition-colors text-left`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Ultra Plan</p>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>All features</p>
                    </div>
                    {selectedUser.subscription.plan === 'ultra' && (
                      <CheckCircle className="w-6 h-6 text-purple-500" />
                    )}
                  </div>
                </button>
              </div>

              <button
                onClick={() => {
                  setShowSubscriptionModal(false);
                  setSelectedUser(null);
                }}
                className={`w-full mt-6 px-4 py-3 rounded-xl border-2 ${isDarkMode ? 'border-gray-600 hover:bg-gray-700 text-white' : 'border-gray-300 hover:bg-gray-50 text-gray-900'} font-semibold transition-colors`}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;
