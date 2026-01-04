import React, { useEffect, useState } from 'react';
import { 
  Wallet, 
  TrendingUp, 
  Users, 
  DollarSign, 
  CheckCircle, 
  XCircle, 
  Clock,
  Download,
  Search,
  Filter,
  Calendar,
  RefreshCw
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import api from '../../services/api';
import { useApp } from '../../context/AppContext';
import AdminDockNavigation from './AdminDockNavigation';

interface PaymentTransaction {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  amount: number;
  currency: string;
  status: 'created' | 'pending' | 'success' | 'failed' | 'refunded';
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  planKey: string;
  planName: string;
  billingCycle: 'monthly' | 'yearly';
  createdAt: string;
  updatedAt: string;
}

interface PaymentStats {
  totalRevenue: number;
  pendingRevenue: number;
  totalTransactions: number;
  successfulPayments: number;
  failedPayments: number;
  pendingPayments: number;
  activeSubscriptions: number;
}

const AdminPayments: React.FC = () => {
  const { isDarkMode } = useTheme();
  const { addToast } = useApp();
  const [payments, setPayments] = useState<PaymentTransaction[]>([]);
  const [stats, setStats] = useState<PaymentStats>({
    totalRevenue: 0,
    pendingRevenue: 0,
    totalTransactions: 0,
    successfulPayments: 0,
    failedPayments: 0,
    pendingPayments: 0,
    activeSubscriptions: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      setLoading(true);
      // Fetch all payment transactions
      const response = await api.get('/admin/payments/all');
      
      if (response.success && response.data) {
        setPayments(response.data.transactions || []);
        calculateStats(response.data.transactions || []);
      }
    } catch (error: any) {
      console.error('Failed to load payments:', error);
      addToast('Failed to load payment data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (transactions: PaymentTransaction[]) => {
    const stats: PaymentStats = {
      totalRevenue: 0,
      pendingRevenue: 0,
      totalTransactions: transactions.length,
      successfulPayments: 0,
      failedPayments: 0,
      pendingPayments: 0,
      activeSubscriptions: 0
    };

    transactions.forEach(txn => {
      // Count successful payments and calculate revenue
      if (txn.status === 'success') {
        stats.totalRevenue += txn.amount;
        stats.successfulPayments++;
      } 
      // Count failed payments
      else if (txn.status === 'failed') {
        stats.failedPayments++;
      } 
      // Count pending and created as pending
      else if (txn.status === 'pending' || txn.status === 'created') {
        stats.pendingPayments++;
        // Add to pending revenue (potential revenue)
        stats.pendingRevenue += txn.amount;
      }
      // Count refunded separately
      else if (txn.status === 'refunded') {
        // Refunded transactions reduce revenue
        stats.totalRevenue -= txn.amount;
      }
    });

    // Ensure revenue is never negative
    stats.totalRevenue = Math.max(0, stats.totalRevenue);

    setStats(stats);
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      success: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
      failed: { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle },
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock },
      created: { bg: 'bg-blue-100', text: 'text-blue-800', icon: Clock },
      refunded: { bg: 'bg-gray-100', text: 'text-gray-800', icon: RefreshCw }
    };

    const badge = badges[status as keyof typeof badges] || badges.pending;
    const Icon = badge.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
        <Icon className="w-3 h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const formatCurrency = (amount: number, currency: string = 'INR') => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = 
      payment.userId?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.razorpayOrderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.planName?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;

    let matchesDate = true;
    if (dateFilter !== 'all') {
      const paymentDate = new Date(payment.createdAt);
      const now = new Date();
      
      if (dateFilter === 'today') {
        matchesDate = paymentDate.toDateString() === now.toDateString();
      } else if (dateFilter === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        matchesDate = paymentDate >= weekAgo;
      } else if (dateFilter === 'month') {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        matchesDate = paymentDate >= monthAgo;
      }
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-orange-600 border-gray-200"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-slate-900'}`}>
      <div className="max-w-7xl mx-auto py-12 px-4 space-y-8">
        {/* Header */}
        <header className="space-y-2">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Wallet className="w-8 h-8 text-orange-600" />
            Payment Management
          </h1>
          <p className="text-sm text-gray-600">View and manage all payment transactions and revenue</p>
        </header>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className={`rounded-2xl p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Revenue</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalRevenue)}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className={`rounded-2xl p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Transactions</p>
                <p className="text-2xl font-bold">{stats.totalTransactions}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className={`rounded-2xl p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Successful</p>
                <p className="text-2xl font-bold text-green-600">{stats.successfulPayments}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className={`rounded-2xl p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Pending Revenue</p>
                <p className="text-2xl font-bold text-yellow-600">{formatCurrency(stats.pendingRevenue)}</p>
                <p className="text-xs text-gray-400 mt-1">{stats.pendingPayments} pending</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className={`rounded-2xl p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
          <div className="grid gap-4 md:grid-cols-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by email, name, order ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                  isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-300'
                }`}
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                  isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-300'
                }`}
              >
                <option value="all">All Status</option>
                <option value="success">Success</option>
                <option value="failed">Failed</option>
                <option value="pending">Pending</option>
                <option value="created">Created</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>

            {/* Date Filter */}
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                  isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-300'
                }`}
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
              </select>
            </div>
          </div>
        </div>

        {/* Payments Table */}
        <div className={`rounded-2xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Plan
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredPayments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      No payments found
                    </td>
                  </tr>
                ) : (
                  filteredPayments.map((payment) => (
                    <tr key={payment._id} className={isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium">{payment.userId?.name || 'N/A'}</div>
                          <div className="text-sm text-gray-500">{payment.userId?.email || 'N/A'}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium">{payment.planName}</div>
                          <div className="text-sm text-gray-500 capitalize">{payment.billingCycle}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold">{formatCurrency(payment.amount, payment.currency)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(payment.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-mono text-gray-500">{payment.razorpayOrderId}</div>
                        {payment.razorpayPaymentId && (
                          <div className="text-xs font-mono text-gray-400">{payment.razorpayPaymentId}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(payment.createdAt)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary */}
        <div className="text-center text-sm text-gray-500">
          Showing {filteredPayments.length} of {payments.length} transactions
        </div>
      </div>

      {/* Admin Dock Navigation */}
      <AdminDockNavigation />
    </div>
  );
};

export default AdminPayments;
