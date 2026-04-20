import React from 'react';

export const AnalyticsChart = ({ data = [], type = 'bar', color = '#0f172a', height = 200 }) => {
  if (!data || data.length === 0) return <div className="h-[200px] flex items-center justify-center text-gray-400 italic text-xs">No trend data available</div>;

  const maxValue = Math.max(...data.map(d => d.count || d.total || 0), 1);
  const chartWidth = 400;
  const barWidth = (chartWidth / data.length) * 0.8;
  const gap = (chartWidth / data.length) * 0.2;

  return (
    <div className="w-full" style={{ height }}>
      <svg viewBox={`0 0 ${chartWidth} ${height}`} className="w-full h-full overflow-visible">
        {data.map((d, i) => {
          const val = d.count || d.total || 0;
          const barHeight = (val / maxValue) * (height - 40);
          const x = i * (barWidth + gap);
          
          return (
            <g key={i} className="group cursor-help">
              <rect
                x={x}
                y={height - barHeight - 20}
                width={barWidth}
                height={barHeight}
                fill={color}
                opacity="0.8"
                className="transition-all hover:opacity-100"
                rx="2"
              />
              <text 
                x={x + barWidth/2} 
                y={height - 5} 
                textAnchor="middle" 
                className="text-[8px] fill-gray-400 font-bold"
              >
                {d._id.split('-').slice(-1)}
              </text>
              <title>{d._id}: {val.toLocaleString()}</title>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default AnalyticsChart;
