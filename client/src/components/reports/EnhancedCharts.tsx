import React from 'react';
import {
    LineChart as RechartsLineChart,
    BarChart as RechartsBarChart,
    PieChart as RechartsPieChart,
    AreaChart,
    Line,
    Bar,
    Pie,
    Cell,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import { Clock, Users, Target, TrendingUp } from 'lucide-react';
import GlassmorphicCard from '../ui/GlassmorphicCard';

interface EnhancedChartsProps {
    timeTrackingData: any[];
    teamPerformance: any[];
    projectMetrics: any[];
    isDarkMode: boolean;
}

const EnhancedCharts: React.FC<EnhancedChartsProps> = ({
    timeTrackingData,
    teamPerformance,
    projectMetrics,
    isDarkMode
}) => {
    // Get accent color from CSS variables
    const accentColor = isDarkMode ? '#6366f1' : '#2563EB';
    const accentHover = isDarkMode ? '#4f46e5' : '#1D4ED8';
    const accentLight = isDarkMode ? '#818cf8' : '#3B82F6';

    return (
        <>
            {/* Analytics Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                {/* Time Tracking Chart */}
                <GlassmorphicCard className="p-6 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">Time Tracking</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Hours logged over time</p>
                            </div>
                            <div className="p-3 bg-gradient-to-br from-accent to-blue-500 rounded-xl shadow-lg">
                                <Clock className="w-5 h-5 text-white" />
                            </div>
                        </div>
                        <ResponsiveContainer width="100%" height={300}>
                            <RechartsLineChart data={timeTrackingData}>
                                <defs>
                                    <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={accentColor} stopOpacity={0.3} />
                                        <stop offset="95%" stopColor={accentColor} stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorBillable" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={accentLight} stopOpacity={0.3} />
                                        <stop offset="95%" stopColor={accentLight} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#e5e7eb'} strokeOpacity={0.5} />
                                <XAxis
                                    dataKey="date"
                                    stroke={isDarkMode ? '#9ca3af' : '#6b7280'}
                                    tick={{ fill: isDarkMode ? '#9ca3af' : '#6b7280', fontSize: 12 }}
                                    tickLine={false}
                                    axisLine={{ stroke: isDarkMode ? '#4b5563' : '#d1d5db' }}
                                />
                                <YAxis
                                    stroke={isDarkMode ? '#9ca3af' : '#6b7280'}
                                    tick={{ fill: isDarkMode ? '#9ca3af' : '#6b7280', fontSize: 12 }}
                                    tickLine={false}
                                    axisLine={{ stroke: isDarkMode ? '#4b5563' : '#d1d5db' }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                                        border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
                                        borderRadius: '12px',
                                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                                        padding: '12px'
                                    }}
                                    labelStyle={{ color: isDarkMode ? '#f3f4f6' : '#111827', fontWeight: 600, marginBottom: '4px' }}
                                />
                                <Legend
                                    wrapperStyle={{ paddingTop: '20px' }}
                                    iconType="circle"
                                />
                                <Line
                                    type="monotone"
                                    dataKey="hours"
                                    stroke={accentColor}
                                    strokeWidth={3}
                                    name="Total Hours"
                                    dot={{ fill: accentColor, r: 5, strokeWidth: 2, stroke: '#fff' }}
                                    activeDot={{ r: 7, strokeWidth: 2 }}
                                    fill="url(#colorHours)"
                                />
                                <Line
                                    type="monotone"
                                    dataKey="billableHours"
                                    stroke={accentLight}
                                    strokeWidth={3}
                                    name="Billable Hours"
                                    dot={{ fill: accentLight, r: 5, strokeWidth: 2, stroke: '#fff' }}
                                    activeDot={{ r: 7, strokeWidth: 2 }}
                                    fill="url(#colorBillable)"
                                />
                            </RechartsLineChart>
                        </ResponsiveContainer>
                    </div>
                </GlassmorphicCard>

                {/* Team Performance Chart */}
                <GlassmorphicCard className="p-6 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">Team Performance</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Top performers this month</p>
                            </div>
                            <div className="p-3 bg-gradient-to-br from-accent to-blue-500 rounded-xl shadow-lg">
                                <Users className="w-5 h-5 text-white" />
                            </div>
                        </div>
                        <ResponsiveContainer width="100%" height={300}>
                            <RechartsBarChart data={teamPerformance.slice(0, 5)}>
                                <defs>
                                    <linearGradient id="colorProductivity" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={accentColor} stopOpacity={0.9} />
                                        <stop offset="95%" stopColor={accentColor} stopOpacity={0.6} />
                                    </linearGradient>
                                    <linearGradient id="colorCompletion" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={accentLight} stopOpacity={0.9} />
                                        <stop offset="95%" stopColor={accentLight} stopOpacity={0.6} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#e5e7eb'} strokeOpacity={0.5} />
                                <XAxis
                                    dataKey="name"
                                    stroke={isDarkMode ? '#9ca3af' : '#6b7280'}
                                    tick={{ fill: isDarkMode ? '#9ca3af' : '#6b7280', fontSize: 11 }}
                                    angle={-45}
                                    textAnchor="end"
                                    height={90}
                                    tickLine={false}
                                    axisLine={{ stroke: isDarkMode ? '#4b5563' : '#d1d5db' }}
                                />
                                <YAxis
                                    stroke={isDarkMode ? '#9ca3af' : '#6b7280'}
                                    tick={{ fill: isDarkMode ? '#9ca3af' : '#6b7280', fontSize: 12 }}
                                    tickLine={false}
                                    axisLine={{ stroke: isDarkMode ? '#4b5563' : '#d1d5db' }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                                        border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
                                        borderRadius: '12px',
                                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                                        padding: '12px'
                                    }}
                                    labelStyle={{ color: isDarkMode ? '#f3f4f6' : '#111827', fontWeight: 600, marginBottom: '4px' }}
                                    cursor={{ fill: isDarkMode ? 'rgba(75, 85, 99, 0.1)' : 'rgba(229, 231, 235, 0.3)' }}
                                />
                                <Legend
                                    wrapperStyle={{ paddingTop: '20px' }}
                                    iconType="circle"
                                />
                                <Bar
                                    dataKey="productivityScore"
                                    fill="url(#colorProductivity)"
                                    name="Productivity Score"
                                    radius={[8, 8, 0, 0]}
                                    maxBarSize={60}
                                />
                                <Bar
                                    dataKey="completionRate"
                                    fill="url(#colorCompletion)"
                                    name="Completion Rate %"
                                    radius={[8, 8, 0, 0]}
                                    maxBarSize={60}
                                />
                            </RechartsBarChart>
                        </ResponsiveContainer>
                    </div>
                </GlassmorphicCard>
            </div>

            {/* Project Progress & Productivity Trend */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                {/* Project Progress Pie Chart */}
                <GlassmorphicCard className="p-6 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">Project Distribution</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Status breakdown</p>
                            </div>
                            <div className="p-3 bg-gradient-to-br from-accent to-blue-500 rounded-xl shadow-lg">
                                <Target className="w-5 h-5 text-white" />
                            </div>
                        </div>
                        <ResponsiveContainer width="100%" height={300}>
                            <RechartsPieChart>
                                <Pie
                                    data={[
                                        { name: 'Active', value: projectMetrics.filter(p => p.status === 'active').length, color: accentColor },
                                        { name: 'Completed', value: projectMetrics.filter(p => p.status === 'completed').length, color: accentLight },
                                        { name: 'Paused', value: projectMetrics.filter(p => p.status === 'paused').length, color: '#FBBF24' },
                                        { name: 'Cancelled', value: projectMetrics.filter(p => p.status === 'cancelled').length, color: '#ef4444' }
                                    ].filter(item => item.value > 0)}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name}: ${percent ? (percent * 100).toFixed(0) : 0}%`}
                                    outerRadius={90}
                                    innerRadius={50}
                                    fill="#8884d8"
                                    dataKey="value"
                                    paddingAngle={3}
                                >
                                    {[
                                        { name: 'Active', value: projectMetrics.filter(p => p.status === 'active').length, color: accentColor },
                                        { name: 'Completed', value: projectMetrics.filter(p => p.status === 'completed').length, color: accentLight },
                                        { name: 'Paused', value: projectMetrics.filter(p => p.status === 'paused').length, color: '#FBBF24' },
                                        { name: 'Cancelled', value: projectMetrics.filter(p => p.status === 'cancelled').length, color: '#ef4444' }
                                    ].filter(item => item.value > 0).map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={entry.color}
                                            stroke={isDarkMode ? '#1f2937' : '#ffffff'}
                                            strokeWidth={2}
                                        />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                                        border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
                                        borderRadius: '12px',
                                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                                        padding: '12px'
                                    }}
                                />
                            </RechartsPieChart>
                        </ResponsiveContainer>
                        {/* Legend */}
                        <div className="grid grid-cols-2 gap-3 mt-4">
                            {[
                                { name: 'Active', value: projectMetrics.filter(p => p.status === 'active').length, color: accentColor },
                                { name: 'Completed', value: projectMetrics.filter(p => p.status === 'completed').length, color: accentLight },
                                { name: 'Paused', value: projectMetrics.filter(p => p.status === 'paused').length, color: '#FBBF24' },
                                { name: 'Cancelled', value: projectMetrics.filter(p => p.status === 'cancelled').length, color: '#ef4444' }
                            ].filter(item => item.value > 0).map((item, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                                    <span className="text-sm text-gray-600 dark:text-gray-400">{item.name} ({item.value})</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </GlassmorphicCard>

                {/* Productivity Trend Area Chart */}
                <GlassmorphicCard className="p-6 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">Productivity Trend</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Hours worked over time</p>
                            </div>
                            <div className="p-3 bg-gradient-to-br from-accent to-blue-500 rounded-xl shadow-lg">
                                <TrendingUp className="w-5 h-5 text-white" />
                            </div>
                        </div>
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={timeTrackingData}>
                                <defs>
                                    <linearGradient id="colorProductivityArea" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={accentColor} stopOpacity={0.8} />
                                        <stop offset="50%" stopColor={accentColor} stopOpacity={0.4} />
                                        <stop offset="95%" stopColor={accentColor} stopOpacity={0.1} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#e5e7eb'} strokeOpacity={0.5} />
                                <XAxis
                                    dataKey="date"
                                    stroke={isDarkMode ? '#9ca3af' : '#6b7280'}
                                    tick={{ fill: isDarkMode ? '#9ca3af' : '#6b7280', fontSize: 12 }}
                                    tickLine={false}
                                    axisLine={{ stroke: isDarkMode ? '#4b5563' : '#d1d5db' }}
                                />
                                <YAxis
                                    stroke={isDarkMode ? '#9ca3af' : '#6b7280'}
                                    tick={{ fill: isDarkMode ? '#9ca3af' : '#6b7280', fontSize: 12 }}
                                    tickLine={false}
                                    axisLine={{ stroke: isDarkMode ? '#4b5563' : '#d1d5db' }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                                        border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
                                        borderRadius: '12px',
                                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                                        padding: '12px'
                                    }}
                                    labelStyle={{ color: isDarkMode ? '#f3f4f6' : '#111827', fontWeight: 600, marginBottom: '4px' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="hours"
                                    stroke={accentColor}
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorProductivityArea)"
                                    name="Hours Worked"
                                    dot={{ fill: accentColor, r: 4, strokeWidth: 2, stroke: '#fff' }}
                                    activeDot={{ r: 6, strokeWidth: 2 }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </GlassmorphicCard>
            </div>
        </>
    );
};

export default EnhancedCharts;
