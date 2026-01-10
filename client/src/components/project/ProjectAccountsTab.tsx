import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { apiService } from '../../services/api';
import { Expense } from '../../types';
import {
    DollarSign,
    Plus,
    Filter,
    Download,
    CheckCircle,
    XCircle,
    Clock,
    Edit2,
    Trash2,
    Calendar as CalendarIcon
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

const ProjectAccountsTab: React.FC = () => {
    const { t } = useTranslation();
    const { projectId } = useParams();
    const { state, addToast } = useApp();
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [filterCategory, setFilterCategory] = useState<string>('all');
    const [totals, setTotals] = useState({
        total: 0,
        approved: 0,
        pending: 0,
        rejected: 0
    });

    const project = state.projects.find(p => p._id === projectId);
    const isDarkMode = state.userProfile?.settings?.darkMode;

    // Check if user can manage expenses (project manager or creator)
    const canManage = project && state.userProfile && (
        project.createdBy === state.userProfile._id ||
        project.teamMembers?.some((m: any) =>
            m.user === state.userProfile._id &&
            (m.role === 'project-manager' || m.permissions?.canManageProject)
        )
    );

    useEffect(() => {
        fetchExpenses();
    }, [projectId]);

    const fetchExpenses = async () => {
        try {
            setLoading(true);
            const response = await apiService.get(`/expenses/project/${projectId}`);
            if (response.success) {
                setExpenses(response.data || []);
                setTotals((response as any).totals || { total: 0, approved: 0, pending: 0, rejected: 0 });
            }
        } catch (error: any) {
            console.error('Error fetching expenses:', error);
            addToast('Failed to load expenses', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteExpense = async (expenseId: string) => {
        if (!window.confirm('Are you sure you want to delete this expense?')) return;

        try {
            const response = await apiService.delete(`/expenses/${expenseId}`);
            if (response.success) {
                addToast('Expense deleted successfully', 'success');
                fetchExpenses();
            }
        } catch (error: any) {
            addToast(error.message || 'Failed to delete expense', 'error');
        }
    };

    const handleApproveExpense = async (expenseId: string) => {
        try {
            const response = await apiService.put(`/expenses/${expenseId}/approve`, {});
            if (response.success) {
                addToast('Expense approved successfully', 'success');
                fetchExpenses();
            }
        } catch (error: any) {
            addToast(error.message || 'Failed to approve expense', 'error');
        }
    };

    const handleRejectExpense = async (expenseId: string) => {
        const reason = window.prompt('Reason for rejection (optional):');

        try {
            const response = await apiService.put(`/expenses/${expenseId}/reject`, { reason });
            if (response.success) {
                addToast('Expense rejected successfully', 'success');
                fetchExpenses();
            }
        } catch (error: any) {
            addToast(error.message || 'Failed to reject expense', 'error');
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const filteredExpenses = expenses.filter(expense => {
        if (filterStatus !== 'all' && expense.status !== filterStatus) return false;
        if (filterCategory !== 'all' && expense.category !== filterCategory) return false;
        return true;
    });

    const budgetAmount = typeof project?.budget === 'object' && project?.budget
        ? (project.budget as any).amount || 0
        : (typeof project?.budget === 'number' ? project.budget : 0);

    const budgetSpent = totals.approved;
    const budgetRemaining = budgetAmount - budgetSpent;
    const budgetUtilization = budgetAmount > 0 ? (budgetSpent / budgetAmount) * 100 : 0;

    const categories = ['Labor', 'Materials', 'Equipment', 'Software', 'Travel', 'Marketing', 'Utilities', 'Other'];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-dark"></div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Budget Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className={`rounded-lg border p-5 ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'}`}>
                    <div className="flex items-center justify-between mb-2">
                        <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Budget</span>
                        <DollarSign className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {formatCurrency(budgetAmount)}
                    </div>
                </div>

                <div className={`rounded-lg border p-5 ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'}`}>
                    <div className="flex items-center justify-between mb-2">
                        <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Spent</span>
                        <CheckCircle className="w-5 h-5 text-red-600" />
                    </div>
                    <div className="text-2xl font-bold text-red-600">
                        {formatCurrency(budgetSpent)}
                    </div>
                </div>

                <div className={`rounded-lg border p-5 ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'}`}>
                    <div className="flex items-center justify-between mb-2">
                        <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Remaining</span>
                        <DollarSign className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="text-2xl font-bold text-green-600">
                        {formatCurrency(budgetRemaining)}
                    </div>
                </div>

                <div className={`rounded-lg border p-5 ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'}`}>
                    <div className="flex items-center justify-between mb-2">
                        <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Utilization</span>
                        <Clock className="w-5 h-5 text-orange-600" />
                    </div>
                    <div className="text-2xl font-bold text-orange-600">
                        {budgetUtilization.toFixed(1)}%
                    </div>
                </div>
            </div>

            {/* Info Alert about Budget Editing */}
            <div className={`rounded-lg border p-4 ${isDarkMode ? 'bg-blue-900/20 border-blue-700' : 'bg-blue-50 border-blue-200'}`}>
                <div className="flex items-start gap-3">
                    <DollarSign className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                        <h4 className={`font-medium mb-1 ${isDarkMode ? 'text-blue-300' : 'text-blue-900'}`}>
                            Budget Management
                        </h4>
                        <p className={`text-sm ${isDarkMode ? 'text-blue-200' : 'text-blue-800'}`}>
                            • <strong>Spent</strong> is automatically calculated from <strong>approved expenses only</strong>
                            <br />
                            • To increase the Total Budget, {canManage ? 'edit it from the' : 'ask your project manager to edit it from the'} <a href={`/project/${projectId}/info`} className="underline font-medium hover:text-blue-600">Project Info</a> page
                            <br />
                            • Pending and rejected expenses do not count toward "Spent"
                        </p>
                    </div>
                </div>
            </div>

            {/* Budget Progress Bar */}
            <div className={`rounded-lg border p-5 ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'}`}>
                <div className="flex items-center justify-between mb-3">
                    <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Budget Progress</h3>
                    <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {formatCurrency(budgetSpent)} of {formatCurrency(budgetAmount)}
                    </span>
                </div>
                <div className="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                        className={`h-full transition-all duration-500 ${budgetUtilization > 90 ? 'bg-red-600' :
                            budgetUtilization > 75 ? 'bg-orange-600' :
                                'bg-green-600'
                            }`}
                        style={{ width: `${Math.min(budgetUtilization, 100)}%` }}
                    />
                </div>
            </div>

            {/* Filters and Actions */}
            <div className={`rounded-lg border p-4 ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'}`}>
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Filter className="w-5 h-5 text-gray-500" />
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className={`px-3 py-2 rounded-md border ${isDarkMode
                                ? 'bg-gray-700 border-gray-600 text-white'
                                : 'bg-white border-gray-300 text-gray-900'
                                }`}
                        >
                            <option value="all">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                        </select>

                        <select
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                            className={`px-3 py-2 rounded-md border ${isDarkMode
                                ? 'bg-gray-700 border-gray-600 text-white'
                                : 'bg-white border-gray-300 text-gray-900'
                                }`}
                        >
                            <option value="all">All Categories</option>
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-accent-dark text-white rounded-md hover:bg-accent-dark/90 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Add Expense
                    </button>
                </div>
            </div>

            {/* Expenses List */}
            <div className={`rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'}`}>
                <div className="p-4 border-b border-gray-300 dark:border-gray-600">
                    <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        Expenses ({filteredExpenses.length})
                    </h2>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                            <tr>
                                <th className={`px-4 py-3 text-left text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Title
                                </th>
                                <th className={`px-4 py-3 text-left text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Category
                                </th>
                                <th className={`px-4 py-3 text-left text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Amount
                                </th>
                                <th className={`px-4 py-3 text-left text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Date
                                </th>
                                <th className={`px-4 py-3 text-left text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Status
                                </th>
                                <th className={`px-4 py-3 text-left text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Created By
                                </th>
                                <th className={`px-4 py-3 text-right text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {filteredExpenses.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-8 text-center">
                                        <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                            No expenses found. Add your first expense to get started.
                                        </p>
                                    </td>
                                </tr>
                            ) : (
                                filteredExpenses.map((expense) => (
                                    <tr key={expense._id} className={isDarkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'}>
                                        <td className={`px-4 py-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                            <div className="font-medium">{expense.title}</div>
                                            {expense.description && (
                                                <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                                    {expense.description.substring(0, 50)}{expense.description.length > 50 ? '...' : ''}
                                                </div>
                                            )}
                                        </td>
                                        <td className={`px-4 py-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                            <span className={`px-2 py-1 text-xs rounded-full ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                                                }`}>
                                                {expense.category}
                                            </span>
                                        </td>
                                        <td className={`px-4 py-3 font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                            {formatCurrency(expense.amount)}
                                        </td>
                                        <td className={`px-4 py-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                            {formatDate(expense.date)}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 text-xs rounded-full ${expense.status === 'approved'
                                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                : expense.status === 'rejected'
                                                    ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                    : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                                }`}>
                                                {expense.status.charAt(0).toUpperCase() + expense.status.slice(1)}
                                            </span>
                                        </td>
                                        <td className={`px-4 py-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                            {expense.createdBy?.fullName || 'Unknown'}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-end gap-2">
                                                {canManage && expense.status === 'pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleApproveExpense(expense._id)}
                                                            className="p-1 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 rounded"
                                                            title="Approve"
                                                        >
                                                            <CheckCircle className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleRejectExpense(expense._id)}
                                                            className="p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                                                            title="Reject"
                                                        >
                                                            <XCircle className="w-4 h-4" />
                                                        </button>
                                                    </>
                                                )}
                                                {expense.createdBy?._id === state.userProfile._id && expense.status === 'pending' && (
                                                    <button
                                                        onClick={() => handleDeleteExpense(expense._id)}
                                                        className="p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Expense Modal */}
            {showAddModal && (
                <ExpenseModal
                    projectId={projectId!}
                    onClose={() => setShowAddModal(false)}
                    onSuccess={() => {
                        setShowAddModal(false);
                        fetchExpenses();
                    }}
                />
            )}
        </div>
    );
};

// Expense Modal Component
const ExpenseModal: React.FC<{
    projectId: string;
    onClose: () => void;
    onSuccess: () => void;
}> = ({ projectId, onClose, onSuccess }) => {
    const { addToast, state } = useApp();
    const [formData, setFormData] = useState({
        title: '',
        amount: '',
        category: 'Other',
        date: new Date().toISOString().split('T')[0],
        description: ''
    });
    const [submitting, setSubmitting] = useState(false);

    const isDarkMode = state.userProfile?.settings?.darkMode;
    const categories = ['Labor', 'Materials', 'Equipment', 'Software', 'Travel', 'Marketing', 'Utilities', 'Other'];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.title || !formData.amount) {
            addToast('Please fill in all required fields', 'error');
            return;
        }

        try {
            setSubmitting(true);
            const response = await apiService.post('/expenses', {
                project: projectId,
                ...formData,
                amount: parseFloat(formData.amount)
            });

            if (response.success) {
                addToast('Expense added successfully', 'success');
                onSuccess();
            }
        } catch (error: any) {
            addToast(error.message || 'Failed to add expense', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className={`rounded-xl shadow-xl w-full max-w-md ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <div className={`flex items-center justify-between p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        Add Expense
                    </h3>
                    <button
                        onClick={onClose}
                        className={`text-gray-500 hover:text-gray-700 ${isDarkMode ? 'hover:text-gray-300' : ''}`}
                    >
                        ×
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    <div>
                        <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Title *
                        </label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className={`w-full px-3 py-2 rounded-md border ${isDarkMode
                                ? 'bg-gray-700 border-gray-600 text-white'
                                : 'bg-white border-gray-300 text-gray-900'
                                }`}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                Amount (₹) *
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                className={`w-full px-3 py-2 rounded-md border ${isDarkMode
                                    ? 'bg-gray-700 border-gray-600 text-white'
                                    : 'bg-white border-gray-300 text-gray-900'
                                    }`}
                                required
                            />
                        </div>

                        <div>
                            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                Category *
                            </label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className={`w-full px-3 py-2 rounded-md border ${isDarkMode
                                    ? 'bg-gray-700 border-gray-600 text-white'
                                    : 'bg-white border-gray-300 text-gray-900'
                                    }`}
                                required
                            >
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Date *
                        </label>
                        <input
                            type="date"
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            className={`w-full px-3 py-2 rounded-md border ${isDarkMode
                                ? 'bg-gray-700 border-gray-600 text-white'
                                : 'bg-white border-gray-300 text-gray-900'
                                }`}
                            required
                        />
                    </div>

                    <div>
                        <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Description
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={3}
                            className={`w-full px-3 py-2 rounded-md border ${isDarkMode
                                ? 'bg-gray-700 border-gray-600 text-white'
                                : 'bg-white border-gray-300 text-gray-900'
                                }`}
                        />
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className={`px-4 py-2 rounded-md ${isDarkMode
                                ? 'bg-gray-700 text-white hover:bg-gray-600'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="px-4 py-2 bg-accent-dark text-white rounded-md hover:bg-accent-dark/90 disabled:opacity-50"
                        >
                            {submitting ? 'Adding...' : 'Add Expense'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProjectAccountsTab;
