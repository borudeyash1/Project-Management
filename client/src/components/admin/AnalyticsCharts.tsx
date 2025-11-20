import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface ChartData {
  date: string;
  value: number;
}

interface AnalyticsChartsProps {
  isDarkMode: boolean;
  userGrowthTrend: ChartData[];
  deviceActivityTrend: ChartData[];
  userDistribution: {
    veryActive: number;
    active: number;
    inactive: number;
    dormant: number;
  };
  devicesByRisk: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
}

const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({
  isDarkMode,
  userGrowthTrend,
  deviceActivityTrend,
  userDistribution,
  devicesByRisk
}) => {
  // Line Chart Component
  const LineChart: React.FC<{ data: ChartData[]; title: string; color: string }> = ({ data, title, color }) => {
    if (!data || data.length === 0) return null;

    const maxValue = Math.max(...data.map(d => d.value), 1);
    const width = 100;
    const height = 60;
    const padding = 5;

    const points = data.map((d, i) => {
      const x = (i / (data.length - 1)) * (width - 2 * padding) + padding;
      const y = height - padding - ((d.value / maxValue) * (height - 2 * padding));
      return `${x},${y}`;
    }).join(' ');

    const areaPoints = `${padding},${height - padding} ${points} ${width - padding},${height - padding}`;

    return (
      <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-4`}>
        <h3 className={`text-sm font-semibold ${isDarkMode ? 'text-gray-700' : 'text-gray-700'} mb-3`}>
          {title}
        </h3>
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-32">
          {/* Grid lines */}
          <line x1={padding} y1={padding} x2={padding} y2={height - padding} 
                stroke={isDarkMode ? '#374151' : '#E5E7EB'} strokeWidth="0.5" />
          <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} 
                stroke={isDarkMode ? '#374151' : '#E5E7EB'} strokeWidth="0.5" />
          
          {/* Area under curve */}
          <polygon points={areaPoints} fill={color} opacity="0.1" />
          
          {/* Line */}
          <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          
          {/* Data points */}
          {data.map((d, i) => {
            const x = (i / (data.length - 1)) * (width - 2 * padding) + padding;
            const y = height - padding - ((d.value / maxValue) * (height - 2 * padding));
            return (
              <circle key={i} cx={x} cy={y} r="1.5" fill={color}>
                <title>{`${d.date}: ${d.value}`}</title>
              </circle>
            );
          })}
        </svg>
        <div className="flex justify-between mt-2 text-xs">
          <span className={isDarkMode ? 'text-gray-600' : 'text-gray-600'}>
            {data[0]?.date}
          </span>
          <span className={isDarkMode ? 'text-gray-600' : 'text-gray-600'}>
            {data[data.length - 1]?.date}
          </span>
        </div>
      </div>
    );
  };

  // Donut Chart Component
  const DonutChart: React.FC<{ 
    data: { label: string; value: number; color: string }[]; 
    title: string;
  }> = ({ data, title }) => {
    const total = data.reduce((sum, d) => sum + d.value, 0);
    if (total === 0) return null;

    let currentAngle = -90;
    const radius = 40;
    const centerX = 50;
    const centerY = 50;
    const strokeWidth = 12;

    const segments = data.map(item => {
      const percentage = (item.value / total) * 100;
      const angle = (percentage / 100) * 360;
      const startAngle = currentAngle;
      const endAngle = currentAngle + angle;
      
      currentAngle = endAngle;

      const startRad = (startAngle * Math.PI) / 180;
      const endRad = (endAngle * Math.PI) / 180;

      const x1 = centerX + radius * Math.cos(startRad);
      const y1 = centerY + radius * Math.sin(startRad);
      const x2 = centerX + radius * Math.cos(endRad);
      const y2 = centerY + radius * Math.sin(endRad);

      const largeArc = angle > 180 ? 1 : 0;

      return {
        ...item,
        percentage: percentage.toFixed(1),
        path: `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`
      };
    });

    return (
      <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-4`}>
        <h3 className={`text-sm font-semibold ${isDarkMode ? 'text-gray-700' : 'text-gray-700'} mb-3`}>
          {title}
        </h3>
        <div className="flex items-center gap-4">
          <svg viewBox="0 0 100 100" className="w-32 h-32">
            {segments.map((segment, i) => (
              <path
                key={i}
                d={segment.path}
                fill={segment.color}
                opacity="0.8"
              >
                <title>{`${segment.label}: ${segment.value} (${segment.percentage}%)`}</title>
              </path>
            ))}
            {/* Center hole */}
            <circle cx={centerX} cy={centerY} r={radius - strokeWidth} fill={isDarkMode ? '#1F2937' : '#FFFFFF'} />
            <text x={centerX} y={centerY} textAnchor="middle" dy="0.3em" 
                  className={`text-xs font-bold ${isDarkMode ? 'fill-gray-300' : 'fill-gray-700'}`}>
              {total}
            </text>
          </svg>
          <div className="flex-1 space-y-2">
            {segments.map((segment, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: segment.color }}></div>
                  <span className={isDarkMode ? 'text-gray-600' : 'text-gray-600'}>{segment.label}</span>
                </div>
                <span className={`font-semibold ${isDarkMode ? 'text-gray-700' : 'text-gray-700'}`}>
                  {segment.percentage}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Bar Chart Component
  const BarChart: React.FC<{ 
    data: { label: string; value: number; color: string }[]; 
    title: string;
  }> = ({ data, title }) => {
    const maxValue = Math.max(...data.map(d => d.value), 1);

    return (
      <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-4`}>
        <h3 className={`text-sm font-semibold ${isDarkMode ? 'text-gray-700' : 'text-gray-700'} mb-3`}>
          {title}
        </h3>
        <div className="space-y-3">
          {data.map((item, i) => (
            <div key={i}>
              <div className="flex justify-between text-xs mb-1">
                <span className={isDarkMode ? 'text-gray-600' : 'text-gray-600'}>{item.label}</span>
                <span className={`font-semibold ${isDarkMode ? 'text-gray-700' : 'text-gray-700'}`}>
                  {item.value}
                </span>
              </div>
              <div className={`h-2 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'} rounded-full overflow-hidden`}>
                <div 
                  className="h-full rounded-full transition-all duration-500"
                  style={{ 
                    width: `${(item.value / maxValue) * 100}%`,
                    backgroundColor: item.color
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Prepare data for charts
  const userDistributionData = [
    { label: 'Very Active', value: userDistribution.veryActive, color: '#10B981' },
    { label: 'Active', value: userDistribution.active, color: '#3B82F6' },
    { label: 'Inactive', value: userDistribution.inactive, color: '#F59E0B' },
    { label: 'Dormant', value: userDistribution.dormant, color: '#EF4444' }
  ];

  const deviceRiskData = [
    { label: 'Low Risk', value: devicesByRisk.low, color: '#10B981' },
    { label: 'Medium Risk', value: devicesByRisk.medium, color: '#F59E0B' },
    { label: 'High Risk', value: devicesByRisk.high, color: '#F97316' },
    { label: 'Critical', value: devicesByRisk.critical, color: '#EF4444' }
  ];

  return (
    <div className="space-y-6">
      {/* Line Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LineChart 
          data={userGrowthTrend} 
          title="User Growth (Last 30 Days)" 
          color="#3B82F6" 
        />
        <LineChart 
          data={deviceActivityTrend} 
          title="Device Activity (Last 7 Days)" 
          color="#10B981" 
        />
      </div>

      {/* Donut and Bar Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DonutChart 
          data={userDistributionData} 
          title="User Distribution by Activity" 
        />
        <BarChart 
          data={deviceRiskData} 
          title="Devices by Risk Level" 
        />
      </div>
    </div>
  );
};

export default AnalyticsCharts;
