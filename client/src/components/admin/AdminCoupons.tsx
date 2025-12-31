import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Ticket,
  Plus,
  Edit,
  Trash2,
  Search,
  ArrowLeft,
  Save,
  X,
  Copy,
  Check,
  Play,
  Pause,
  Ban
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useApp } from '../../context/AppContext';
import api from '../../services/api';

interface Coupon {
  _id?: string;
  name: string;
  note?: string;
  code: string;
  durationType: 'count' | 'days';
  usageCount?: number;
  usedCount: number;
  startDate?: string;
  endDate?: string;
  status: 'active' | 'paused' | 'inactive';
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minPurchase?: number;
  maxDiscount?: number;
  applicablePlans: string[];
  createdAt?: string;
  updatedAt?: string;
}

const AdminCoupons: React.FC = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const { addToast } = useApp();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentCoupon, setCurrentCoupon] = useState<Partial<Coupon> | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    loadCoupons();
  }, []);

  const loadCoupons = async () => {
    try {
      setLoading(true);
      const response = await api.get('/coupons/admin/all');
      if (response.success) {
        setCoupons(response.data);
      }
    } catch (error) {
      console.error('Failed to load coupons:', error);
      addToast('Failed to load coupons', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    setCurrentCoupon({
      name: '',
      note: '',
      code: '',
      durationType: 'count',
      usageCount: 1,
      usedCount: 0,
      status: 'inactive',
      discountType: 'percentage',
      discountValue: 0,
      minPurchase: 0,
      applicablePlans: []
    });
    setIsEditing(true);
  };

  const handleEdit = (coupon: Coupon) => {
    setCurrentCoupon(coupon);
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!currentCoupon || !currentCoupon.name || !currentCoupon.code) {
      addToast('Please fill in coupon name and code', 'error');
      return;
    }

    // Validate based on duration type
    if (currentCoupon.durationType === 'count' && !currentCoupon.usageCount) {
      addToast('Please enter usage count for count-based duration', 'error');
      return;
    }

    if (currentCoupon.durationType === 'days' && (!currentCoupon.startDate || !currentCoupon.endDate)) {
      addToast('Please enter start and end dates for date-based duration', 'error');
      return;
    }

    try {
      setSaving(true);
      if (currentCoupon._id) {
        await api.put(`/coupons/admin/${currentCoupon._id}`, currentCoupon);
        addToast('Coupon updated successfully', 'success');
      } else {
        await api.post('/coupons/admin/create', currentCoupon);
        addToast('Coupon created successfully', 'success');
      }

      await loadCoupons();
      setIsEditing(false);
      setCurrentCoupon(null);
    } catch (error: any) {
      console.error('Failed to save coupon:', error);
      addToast(error.response?.data?.message || 'Failed to save coupon', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (id: string, status: 'active' | 'paused' | 'inactive') => {
    try {
      await api.patch(`/coupons/admin/${id}/status`, { status });
      addToast(`Coupon ${status === 'active' ? 'activated' : status === 'paused' ? 'paused' : 'deactivated'} successfully`, 'success');
      await loadCoupons();
    } catch (error: any) {
      console.error('Failed to update status:', error);
      addToast(error.response?.data?.message || 'Failed to update status', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this coupon?')) {
      return;
    }

    try {
      await api.delete(`/coupons/admin/${id}`);
      addToast('Coupon deleted successfully', 'success');
      await loadCoupons();
    } catch (error: any) {
      console.error('Failed to delete coupon:', error);
      addToast(error.response?.data?.message || 'Failed to delete coupon', 'error');
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    addToast('Coupon code copied!', 'success');
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const filteredCoupons = coupons.filter(coupon =>
    coupon.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    coupon.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <header className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b sticky top-0 z-10`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/admin/dashboard')}
                className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Coupon Management
                </h1>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Create and manage discount coupons
                </p>
              </div>
            </div>
            {!isEditing && (
              <button
                onClick={handleCreateNew}
                className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover text-gray-900 rounded-lg font-medium transition-colors"
              >
                <Plus className="w-5 h-5" />
                New Coupon
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isEditing ? (
          /* Edit/Create Form */
          <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-2xl p-8`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {currentCoupon?._id ? 'Edit Coupon' : 'Create New Coupon'}
              </h2>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setCurrentCoupon(null);
                }}
                className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Coupon Name */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                  Coupon Name *
                </label>
                <input
                  type="text"
                  value={currentCoupon?.name || ''}
                  onChange={(e) => setCurrentCoupon(prev => ({ ...prev, name: e.target.value }))}
                  className={`w-full px-4 py-3 rounded-lg border ${isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-accent`}
                  placeholder="Summer Sale 2025"
                />
              </div>

              {/* Coupon Note */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                  Coupon Note (Optional)
                </label>
                <textarea
                  value={currentCoupon?.note || ''}
                  onChange={(e) => setCurrentCoupon(prev => ({ ...prev, note: e.target.value }))}
                  className={`w-full px-4 py-3 rounded-lg border ${isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-accent`}
                  rows={2}
                  placeholder="Internal notes about this coupon..."
                />
              </div>

              {/* Coupon Code */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                  Coupon Code *
                </label>
                <input
                  type="text"
                  value={currentCoupon?.code || ''}
                  onChange={(e) => setCurrentCoupon(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                  className={`w-full px-4 py-3 rounded-lg border ${isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-accent uppercase font-mono`}
                  placeholder="SUMMER2025"
                />
              </div>

              {/* Duration Type */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                  Duration Type *
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setCurrentCoupon(prev => ({ ...prev, durationType: 'count', startDate: undefined, endDate: undefined }))}
                    className={`px-4 py-3 rounded-lg border-2 font-medium transition-colors ${currentCoupon?.durationType === 'count'
                      ? 'border-accent bg-accent/10 text-accent'
                      : isDarkMode ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-50'
                      }`}
                  >
                    Count-Based
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentCoupon(prev => ({ ...prev, durationType: 'days', usageCount: undefined }))}
                    className={`px-4 py-3 rounded-lg border-2 font-medium transition-colors ${currentCoupon?.durationType === 'days'
                      ? 'border-accent bg-accent/10 text-accent'
                      : isDarkMode ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-50'
                      }`}
                  >
                    Date-Based
                  </button>
                </div>
              </div>

              {/* Count-Based Fields */}
              {currentCoupon?.durationType === 'count' && (
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                    Usage Count *
                  </label>
                  <input
                    type="number"
                    value={currentCoupon?.usageCount || ''}
                    onChange={(e) => setCurrentCoupon(prev => ({ ...prev, usageCount: Number(e.target.value) }))}
                    className={`w-full px-4 py-3 rounded-lg border ${isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-accent`}
                    min="1"
                    placeholder="100"
                  />
                  <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Number of times this coupon can be used
                  </p>
                </div>
              )}

              {/* Date-Based Fields */}
              {currentCoupon?.durationType === 'days' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                      Start Date *
                    </label>
                    <input
                      type="date"
                      value={currentCoupon?.startDate || ''}
                      onChange={(e) => setCurrentCoupon(prev => ({ ...prev, startDate: e.target.value }))}
                      className={`w-full px-4 py-3 rounded-lg border ${isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-accent`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                      End Date *
                    </label>
                    <input
                      type="date"
                      value={currentCoupon?.endDate || ''}
                      onChange={(e) => setCurrentCoupon(prev => ({ ...prev, endDate: e.target.value }))}
                      className={`w-full px-4 py-3 rounded-lg border ${isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-accent`}
                    />
                  </div>
                  <p className={`text-xs col-span-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Coupon can be used unlimited times within this date range
                  </p>
                </div>
              )}

              {/* Discount Type & Value */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                    Discount Type *
                  </label>
                  <select
                    value={currentCoupon?.discountType || 'percentage'}
                    onChange={(e) => setCurrentCoupon(prev => ({ ...prev, discountType: e.target.value as 'percentage' | 'fixed' }))}
                    className={`w-full px-4 py-3 rounded-lg border ${isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-accent`}
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                    Discount Value *
                  </label>
                  <input
                    type="number"
                    value={currentCoupon?.discountValue || 0}
                    onChange={(e) => setCurrentCoupon(prev => ({ ...prev, discountValue: Number(e.target.value) }))}
                    className={`w-full px-4 py-3 rounded-lg border ${isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-accent`}
                    min="0"
                    max={currentCoupon?.discountType === 'percentage' ? 100 : undefined}
                  />
                </div>
              </div>

              {/* Min Purchase & Max Discount */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                    Minimum Purchase (₹)
                  </label>
                  <input
                    type="number"
                    value={currentCoupon?.minPurchase || 0}
                    onChange={(e) => setCurrentCoupon(prev => ({ ...prev, minPurchase: Number(e.target.value) }))}
                    className={`w-full px-4 py-3 rounded-lg border ${isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-accent`}
                    min="0"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                    Maximum Discount (₹)
                  </label>
                  <input
                    type="number"
                    value={currentCoupon?.maxDiscount || ''}
                    onChange={(e) => setCurrentCoupon(prev => ({ ...prev, maxDiscount: e.target.value ? Number(e.target.value) : undefined }))}
                    className={`w-full px-4 py-3 rounded-lg border ${isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-accent`}
                    min="0"
                    placeholder="No limit"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-accent hover:bg-accent-hover text-gray-900 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-5 h-5" />
                  {saving ? 'Saving...' : 'Save Coupon'}
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setCurrentCoupon(null);
                  }}
                  className={`px-6 py-3 rounded-lg border-2 ${isDarkMode ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-50'} font-semibold transition-colors`}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Coupons List */
          <>
            {/* Search */}
            <div className="mb-6">
              <div className="relative">
                <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search coupons..."
                  className={`w-full pl-12 pr-4 py-3 rounded-lg border ${isDarkMode
                    ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:outline-none focus:ring-2 focus:ring-accent`}
                />
              </div>
            </div>

            {/* Coupons Grid */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
              </div>
            ) : filteredCoupons.length === 0 ? (
              <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-2xl p-12 text-center`}>
                <Ticket className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  No coupons found
                </h3>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {searchQuery ? 'Try a different search term' : 'Create your first coupon to get started'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCoupons.map((coupon) => (
                  <div
                    key={coupon._id}
                    className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-6 hover:shadow-lg transition-shadow`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className={`font-bold text-lg mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {coupon.name}
                        </h3>
                        <div className="flex items-center gap-2 mb-2">
                          <code className={`px-3 py-1 rounded-lg font-mono font-bold text-sm ${isDarkMode ? 'bg-accent/20 text-accent' : 'bg-accent/10 text-accent-dark'}`}>
                            {coupon.code}
                          </code>
                          <button
                            onClick={() => handleCopyCode(coupon.code)}
                            className={`p-1.5 rounded-lg ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
                            title="Copy code"
                          >
                            {copiedCode === coupon.code ? (
                              <Check className="w-4 h-4 text-green-500" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                        {coupon.note && (
                          <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
                            {coupon.note}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Discount:</span>
                        <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Duration:</span>
                        <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {coupon.durationType === 'count' 
                            ? `${coupon.usedCount}/${coupon.usageCount} used`
                            : `${new Date(coupon.startDate!).toLocaleDateString()} - ${new Date(coupon.endDate!).toLocaleDateString()}`
                          }
                        </span>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="mb-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        coupon.status === 'active'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : coupon.status === 'paused'
                          ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                          : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
                      }`}>
                        {coupon.status ? coupon.status.charAt(0).toUpperCase() + coupon.status.slice(1) : 'Inactive'}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                      {/* Status Control Buttons */}
                      <button
                        onClick={() => handleStatusChange(coupon._id!, 'active')}
                        disabled={coupon.status === 'active'}
                        className={`flex-1 p-2 rounded-lg transition-colors ${
                          coupon.status === 'active'
                            ? 'opacity-50 cursor-not-allowed'
                            : isDarkMode ? 'hover:bg-green-900/30 text-green-400' : 'hover:bg-green-50 text-green-600'
                        }`}
                        title="Activate"
                      >
                        <Play className="w-4 h-4 mx-auto" />
                      </button>
                      <button
                        onClick={() => handleStatusChange(coupon._id!, 'paused')}
                        disabled={coupon.status === 'paused'}
                        className={`flex-1 p-2 rounded-lg transition-colors ${
                          coupon.status === 'paused'
                            ? 'opacity-50 cursor-not-allowed'
                            : isDarkMode ? 'hover:bg-yellow-900/30 text-yellow-400' : 'hover:bg-yellow-50 text-yellow-600'
                        }`}
                        title="Pause"
                      >
                        <Pause className="w-4 h-4 mx-auto" />
                      </button>
                      <button
                        onClick={() => handleStatusChange(coupon._id!, 'inactive')}
                        disabled={coupon.status === 'inactive'}
                        className={`flex-1 p-2 rounded-lg transition-colors ${
                          coupon.status === 'inactive'
                            ? 'opacity-50 cursor-not-allowed'
                            : isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                        }`}
                        title="Deactivate"
                      >
                        <Ban className="w-4 h-4 mx-auto" />
                      </button>
                      
                      {/* Edit & Delete */}
                      <button
                        onClick={() => handleEdit(coupon)}
                        className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(coupon._id!)}
                        className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-red-900/30 text-red-400' : 'hover:bg-red-50 text-red-600'} transition-colors`}
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default AdminCoupons;
