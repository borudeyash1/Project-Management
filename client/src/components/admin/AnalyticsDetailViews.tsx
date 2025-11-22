import React from 'react';
import {
    TrendingUp, Users, Activity, Shield, AlertTriangle,
    Smartphone, Monitor, Tablet, Clock, Calendar, CheckCircle, XCircle
} from 'lucide-react';

interface DetailViewProps {
    data: any;
    isDarkMode: boolean;
}

// 1. User Growth Detail View
export const UserGrowthDetail: React.FC<DetailViewProps> = ({ data, isDarkMode }) => {
    if (!data) return null;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total Users</p>
                    <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{data.totalUsers?.toLocaleString()}</p>
                </div>
                <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>New Users (90d)</p>
                    <p className={`text-2xl font-bold text-green-500`}>+{data.usersLast90Days?.toLocaleString()}</p>
                </div>
                <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Avg Daily Growth</p>
                    <p className={`text-2xl font-bold text-blue-500`}>{data.avgDailyGrowth}</p>
                </div>
            </div>

            <div className={`p-6 rounded-xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>90-Day Growth Trend</h3>
                <div className="h-64 flex items-end gap-1">
                    {data.growthTrend?.map((item: any, i: number) => {
                        const max = Math.max(...data.growthTrend.map((d: any) => d.users));
                        const height = (item.users / max) * 100;
                        return (
                            <div key={i} className="flex-1 flex flex-col justify-end group relative">
                                <div
                                    className="w-full bg-blue-500/20 hover:bg-blue-500 transition-all rounded-t-sm"
                                    style={{ height: `${height}%` }}
                                ></div>
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                                    <div className={`text-xs p-2 rounded shadow-lg whitespace-nowrap ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'}`}>
                                        {item.date}: {item.users} users
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

// 2. Device Activity Detail View
export const DeviceActivityDetail: React.FC<DetailViewProps> = ({ data, isDarkMode }) => {
    if (!data) return null;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total Devices</p>
                    <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{data.totalDevices}</p>
                </div>
                <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Active Now</p>
                    <p className={`text-2xl font-bold text-green-500`}>{data.activeDevices}</p>
                </div>
                <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Recently Active</p>
                    <p className={`text-2xl font-bold text-blue-500`}>{data.recentlyActive}</p>
                </div>
                <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Device Types</p>
                    <div className="flex gap-2 mt-1">
                        {Object.entries(data.deviceTypes || {}).map(([type, count]: [string, any]) => (
                            <span key={type} className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700">
                                {type}: {count}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            <div className={`p-6 rounded-xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>30-Day Activity Trend</h3>
                <div className="h-64 flex items-end gap-1">
                    {data.activityTrend?.map((item: any, i: number) => {
                        const max = Math.max(...data.activityTrend.map((d: any) => d.active), 1);
                        const height = (item.active / max) * 100;
                        return (
                            <div key={i} className="flex-1 flex flex-col justify-end group relative">
                                <div
                                    className="w-full bg-green-500/20 hover:bg-green-500 transition-all rounded-t-sm"
                                    style={{ height: `${height}%` }}
                                ></div>
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                                    <div className={`text-xs p-2 rounded shadow-lg whitespace-nowrap ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'}`}>
                                        {item.date}: {item.active} active
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

// 3. User Distribution Detail View
export const UserDistributionDetail: React.FC<DetailViewProps> = ({ data, isDarkMode }) => {
    if (!data) return null;

    const categories = [
        { key: 'veryActive', label: 'Very Active', color: 'bg-green-500', users: data.veryActiveUsers },
        { key: 'active', label: 'Active', color: 'bg-blue-500', users: data.activeUsers },
        { key: 'inactive', label: 'Inactive', color: 'bg-yellow-500', users: data.inactiveUsers },
        { key: 'dormant', label: 'Dormant', color: 'bg-red-500', users: data.dormantUsers }
    ];

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {categories.map(cat => (
                    <div key={cat.key} className={`p-4 rounded-xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                        <div className="flex items-center gap-2 mb-2">
                            <div className={`w-3 h-3 rounded-full ${cat.color}`}></div>
                            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{cat.label}</p>
                        </div>
                        <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {data.counts?.[cat.key]?.toLocaleString()}
                        </p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {categories.map(cat => (
                    <div key={cat.key} className={`p-4 rounded-xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                        <h3 className={`text-sm font-semibold mb-3 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            <div className={`w-2 h-2 rounded-full ${cat.color}`}></div>
                            Recent {cat.label} Users
                        </h3>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                            {cat.users?.map((user: any, i: number) => (
                                <div key={i} className={`flex justify-between items-center p-2 rounded ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                                    <div>
                                        <p className={`text-xs font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{user.username}</p>
                                        <p className={`text-[10px] ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{user.email}</p>
                                    </div>
                                    <span className={`text-[10px] ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                        {new Date(user.lastLogin).toLocaleDateString()}
                                    </span>
                                </div>
                            ))}
                            {(!cat.users || cat.users.length === 0) && (
                                <p className={`text-xs text-center py-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>No users found</p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// 4. Device Risk Detail View
export const DeviceRiskDetail: React.FC<DetailViewProps> = ({ data, isDarkMode }) => {
    if (!data) return null;

    const riskLevels = [
        { key: 'low', label: 'Low Risk', color: 'text-green-500', bg: 'bg-green-500/10' },
        { key: 'medium', label: 'Medium Risk', color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
        { key: 'high', label: 'High Risk', color: 'text-orange-500', bg: 'bg-orange-500/10' },
        { key: 'critical', label: 'Critical', color: 'text-red-500', bg: 'bg-red-500/10' }
    ];

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {riskLevels.map(risk => (
                    <div key={risk.key} className={`p-4 rounded-xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{risk.label}</p>
                        <p className={`text-2xl font-bold ${risk.color}`}>
                            {data.counts?.[risk.key]?.toLocaleString()}
                        </p>
                    </div>
                ))}
            </div>

            <div className={`rounded-xl border overflow-hidden ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <div className={`p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Top Risky Devices</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className={`text-xs uppercase ${isDarkMode ? 'bg-gray-700/50 text-gray-400' : 'bg-gray-50 text-gray-500'}`}>
                            <tr>
                                <th className="px-4 py-3">Device</th>
                                <th className="px-4 py-3">User</th>
                                <th className="px-4 py-3">Risk Level</th>
                                <th className="px-4 py-3">Failed Attempts</th>
                                <th className="px-4 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {data.riskyDevices?.map((device: any, i: number) => (
                                <tr key={i} className={isDarkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'}>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <Monitor className="w-4 h-4 opacity-50" />
                                            <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                                                {device.deviceInfo?.type || 'Unknown'}
                                            </span>
                                        </div>
                                        <div className="text-xs opacity-50 font-mono mt-1">{device.deviceId?.substring(0, 8)}...</div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className={isDarkMode ? 'text-white' : 'text-gray-900'}>{device.user?.username || 'Unknown'}</div>
                                        <div className="text-xs opacity-50">{device.user?.email}</div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium 
                      ${device.riskLevel === 'critical' ? 'bg-red-500/10 text-red-500' :
                                                device.riskLevel === 'high' ? 'bg-orange-500/10 text-orange-500' :
                                                    device.riskLevel === 'medium' ? 'bg-yellow-500/10 text-yellow-500' :
                                                        'bg-green-500/10 text-green-500'}`}>
                                            {device.riskLevel?.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`font-mono ${device.failedAttempts > 0 ? 'text-red-500' : 'text-gray-500'}`}>
                                            {device.failedAttempts}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        {device.isBlacklisted ? (
                                            <span className="flex items-center gap-1 text-red-500 text-xs">
                                                <XCircle className="w-3 h-3" /> Blacklisted
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1 text-green-500 text-xs">
                                                <CheckCircle className="w-3 h-3" /> Allowed
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {(!data.riskyDevices || data.riskyDevices.length === 0) && (
                                <tr>
                                    <td colSpan={5} className="px-4 py-8 text-center opacity-50">No risky devices found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

// 5. Growth Metrics Detail View
export const GrowthMetricsDetail: React.FC<DetailViewProps> = ({ data, isDarkMode }) => {
    if (!data) return null;

    return (
        <div className="space-y-6">
            {/* Current Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Daily Growth</p>
                    <div className="flex items-end gap-2 mt-1">
                        <p className={`text-2xl font-bold ${Number(data.growthRates?.daily) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {data.growthRates?.daily}%
                        </p>
                        <span className="text-xs opacity-50 mb-1">vs yesterday</span>
                    </div>
                </div>
                <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Weekly Growth</p>
                    <div className="flex items-end gap-2 mt-1">
                        <p className={`text-2xl font-bold ${Number(data.growthRates?.weekly) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {data.growthRates?.weekly}%
                        </p>
                        <span className="text-xs opacity-50 mb-1">vs last week</span>
                    </div>
                </div>
                <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Monthly Growth</p>
                    <div className="flex items-end gap-2 mt-1">
                        <p className={`text-2xl font-bold ${Number(data.growthRates?.monthly) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {data.growthRates?.monthly}%
                        </p>
                        <span className="text-xs opacity-50 mb-1">vs last month</span>
                    </div>
                </div>
            </div>

            {/* Projections */}
            <div className={`p-6 rounded-xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    <TrendingUp className="w-5 h-5 text-blue-500" />
                    Growth Projections
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="relative pt-4">
                        <div className="absolute top-0 left-0 text-xs font-semibold text-blue-500">Next Week</div>
                        <div className={`text-3xl font-bold mt-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {data.projections?.nextWeek?.toLocaleString()}
                        </div>
                        <div className="text-xs opacity-50 mt-1">Expected users</div>
                    </div>
                    <div className="relative pt-4">
                        <div className="absolute top-0 left-0 text-xs font-semibold text-purple-500">Next Month</div>
                        <div className={`text-3xl font-bold mt-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {data.projections?.nextMonth?.toLocaleString()}
                        </div>
                        <div className="text-xs opacity-50 mt-1">Expected users</div>
                    </div>
                    <div className="relative pt-4">
                        <div className="absolute top-0 left-0 text-xs font-semibold text-green-500">Next 90 Days</div>
                        <div className={`text-3xl font-bold mt-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {data.projections?.next90Days?.toLocaleString()}
                        </div>
                        <div className="text-xs opacity-50 mt-1">Expected users</div>
                    </div>
                </div>
                <div className={`mt-6 p-4 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <p className="text-sm opacity-75">
                        Based on current average daily growth of <strong>{data.projections?.avgDailyGrowth} users/day</strong>.
                        These are estimates and actual growth may vary.
                    </p>
                </div>
            </div>
        </div>
    );
};

// 6. Device Security Detail View
export const DeviceSecurityDetail: React.FC<DetailViewProps> = ({ data, isDarkMode }) => {
    if (!data) return null;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total Devices</p>
                    <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{data.summary?.totalDevices}</p>
                </div>
                <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Suspicious</p>
                    <p className={`text-2xl font-bold text-orange-500`}>{data.summary?.suspiciousDevices}</p>
                </div>
                <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Blacklisted</p>
                    <p className={`text-2xl font-bold text-red-500`}>{data.summary?.blacklistedDevices}</p>
                </div>
                <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Critical Risk</p>
                    <p className={`text-2xl font-bold text-red-600`}>{data.riskDistribution?.critical}</p>
                </div>
            </div>

            <div className={`rounded-xl border overflow-hidden ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <div className={`p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <h3 className={`font-semibold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        <AlertTriangle className="w-4 h-4 text-orange-500" />
                        Recent Security Events
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className={`text-xs uppercase ${isDarkMode ? 'bg-gray-700/50 text-gray-400' : 'bg-gray-50 text-gray-500'}`}>
                            <tr>
                                <th className="px-4 py-3">Device</th>
                                <th className="px-4 py-3">User</th>
                                <th className="px-4 py-3">Event</th>
                                <th className="px-4 py-3">Risk</th>
                                <th className="px-4 py-3">Time</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {data.securityEvents?.map((event: any, i: number) => (
                                <tr key={i} className={isDarkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'}>
                                    <td className="px-4 py-3">
                                        <div className="font-mono text-xs opacity-75">{event.deviceId?.substring(0, 8)}...</div>
                                        <div className="text-xs opacity-50">{event.deviceInfo?.type || 'Unknown'}</div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className={isDarkMode ? 'text-white' : 'text-gray-900'}>{event.user?.username || 'Unknown'}</div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="text-red-500 font-medium">{event.failedAttempts} failed attempts</span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium 
                      ${event.riskLevel === 'critical' ? 'bg-red-500/10 text-red-500' :
                                                event.riskLevel === 'high' ? 'bg-orange-500/10 text-orange-500' :
                                                    'bg-yellow-500/10 text-yellow-500'}`}>
                                            {event.riskLevel?.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-xs opacity-50">
                                        {new Date(event.lastAccess).toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                            {(!data.securityEvents || data.securityEvents.length === 0) && (
                                <tr>
                                    <td colSpan={5} className="px-4 py-8 text-center opacity-50">No security events found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
