import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceDot } from 'recharts';

// Define the data type for the chart
interface DataPoint {
  name: string;
  uv: number;
  anomaly: boolean;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<any>;
  label?: string;
}

// Custom tooltip component
const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const isAnomaly = payload[0].payload.anomaly;
    
    return (
      <div className="bg-white p-3 border border-slate-200 shadow-md rounded-md">
        <p className="text-sm text-slate-600">{`Time: ${label}`}</p>
        <p className="text-sm font-semibold text-blue-600">{`Value: ${payload[0].value}`}</p>
        {isAnomaly && (
          <p className="text-xs mt-1 font-semibold text-red-500">Anomaly Detected!</p>
        )}
      </div>
    );
  }

  return null;
};

interface LineChartComponentProps {
  data: DataPoint[];
}

const LineChartComponent: React.FC<LineChartComponentProps> = ({ data }) => {
  // Find min and max for better axis display
  const values = data.map(item => item.uv);
  const min = parseFloat(Math.min(...values).toPrecision(2));
  const max = parseFloat(Math.max(...values).toPrecision(2));
  const padding = (max - min) * 0.1; // 10% padding

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={data}
        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis 
          dataKey="name" 
          tick={{ fontSize: 12 }}
          stroke="#94a3b8"
          tickLine={false}
        />
        <YAxis 
          domain={[min - padding, max + padding]} 
          tick={{ fontSize: 12 }}
          stroke="#94a3b8"
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <Line 
          type="monotone" 
          dataKey="uv" 
          stroke="#3b82f6" 
          strokeWidth={2}
          dot={{ r: 4, fill: "#3b82f6", strokeWidth: 0 }}
          activeDot={{ r: 6, fill: "#2563eb", stroke: "#dbeafe", strokeWidth: 2 }}
        />
        
        {/* Add reference dots for anomalies */}
        {data.filter(item => item.anomaly).map((point, index) => (
          <ReferenceDot
            key={index}
            x={point.name}
            y={point.uv}
            r={6}
            fill="#ef4444"
            stroke="#fee2e2"
            strokeWidth={2}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
};

export default LineChartComponent;