import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number | string;
  trend?: { direction: 'up' | 'down'; percentage: number };
  icon?: React.ReactNode;
  color?: 'blue' | 'green' | 'orange' | 'red';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  trend,
  icon,
  color = 'blue'
}) => {
  const colorClasses = {
    blue: 'border-blue-200 bg-blue-50',
    green: 'border-green-200 bg-green-50',
    orange: 'border-orange-200 bg-orange-50',
    red: 'border-red-200 bg-red-50'
  };

  const trendClasses = {
    up: 'text-green-600',
    down: 'text-red-600'
  };

  return (
    <div className={`p-7 rounded-lg border ${colorClasses[color]} shadow-sm hover:shadow-md transition-shadow`}>
      <div className="flex items-start justify-between mb-4">
        {icon && <div className="text-2xl">{icon}</div>}
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
      </div>
      <div className="text-4xl font-bold text-gray-900 mb-3">{value}</div>
      {trend && (
        <div className={`flex items-center gap-1 text-sm font-semibold ${trendClasses[trend.direction]}`}>
          {trend.direction === 'up' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          <span>{trend.percentage}%</span>
        </div>
      )}
    </div>
  );
};
