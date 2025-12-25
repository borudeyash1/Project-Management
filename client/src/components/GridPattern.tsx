import React from 'react';

interface GridPatternProps {
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  squares?: number[][];
  strokeDasharray?: string;
  className?: string;
}

export const GridPattern: React.FC<GridPatternProps> = ({
  width = 40,
  height = 40,
  x = -1,
  y = -1,
  squares = [],
  strokeDasharray = "0",
  className = "",
  ...props
}) => {
  const id = React.useId();

  return (
    <svg
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 h-full w-full fill-gray-400/30 stroke-gray-400/30 ${className}`}
      {...props}
    >
      <defs>
        <pattern
          id={id}
          width={width}
          height={height}
          patternUnits="userSpaceOnUse"
          x={x}
          y={y}
        >
          <path
            d={`M.5 ${height}V.5H${width}`}
            fill="none"
            strokeDasharray={strokeDasharray}
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" strokeWidth={0} fill={`url(#${id})`} />
      {squares && squares.map(([x, y], index) => (
        <rect
          key={`${x}-${y}-${index}`}
          width={width - 1}
          height={height - 1}
          x={x * width + 1}
          y={y * height + 1}
          strokeWidth="0"
          className="fill-gray-400/50"
        />
      ))}
    </svg>
  );
};

export default GridPattern;
