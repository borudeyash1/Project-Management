import React from 'react';
import { HardDrive } from 'lucide-react';

interface StorageMeterProps {
  usedGB: number;
  totalGB: number;
  isCollapsed?: boolean;
}

const StorageMeter: React.FC<StorageMeterProps> = ({ usedGB, totalGB, isCollapsed = false }) => {
  const percentage = (usedGB / totalGB) * 100;
  
  const getColor = () => {
    if (percentage < 70) return '#10B981'; // Green
    if (percentage < 90) return '#F59E0B'; // Yellow
    return '#EF4444'; // Red
  };

  if (isCollapsed) {
    return (
      <div className="flex flex-col items-center gap-2">
        <HardDrive className="w-5 h-5 text-text-muted" />
        <div className="w-full h-2 bg-[#2C2C2C] rounded-full overflow-hidden">
          <div
            className="h-full transition-all duration-300"
            style={{
              width: `${percentage}%`,
              backgroundColor: getColor(),
            }}
          />
        </div>
        <span className="text-[10px] font-medium" style={{ color: getColor() }}>
          {usedGB.toFixed(0)}GB
        </span>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <HardDrive className="w-4 h-4 text-text-muted" />
        <span className="text-sm font-medium text-text-primary">Storage</span>
      </div>
      
      {/* Progress Bar */}
      <div className="w-full h-2 bg-[#2C2C2C] rounded-full overflow-hidden mb-2">
        <div
          className="h-full transition-all duration-300"
          style={{
            width: `${percentage}%`,
            backgroundColor: getColor(),
          }}
        />
      </div>
      
      {/* Storage Text */}
      <div className="text-xs text-text-muted">
        <span className="font-medium" style={{ color: getColor() }}>
          {usedGB.toFixed(1)} GB
        </span>
        {' '}of {totalGB} GB used
      </div>
    </div>
  );
};

export default StorageMeter;
