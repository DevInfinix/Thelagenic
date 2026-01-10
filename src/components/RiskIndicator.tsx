import React from 'react';

interface RiskIndicatorProps {
  score: number;
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
}

export const RiskIndicator: React.FC<RiskIndicatorProps> = ({
  score,
  size = 'medium',
  showLabel = true
}) => {
  let status: 'high' | 'medium' | 'low';
  let label: string;
  let bgColor: string;

  if (score >= 70) {
    status = 'low';
    label = 'Low Risk';
    bgColor = 'bg-green-50 border-green-200';
  } else if (score >= 50) {
    status = 'medium';
    label = 'Medium Risk';
    bgColor = 'bg-yellow-50 border-yellow-200';
  } else {
    status = 'high';
    label = 'High Risk';
    bgColor = 'bg-red-50 border-red-200';
  }

  const sizeClasses = {
    small: 'w-6 h-6',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  };

  const dotColors = {
    high: 'bg-red-500 animate-pulse',
    medium: 'bg-yellow-500',
    low: 'bg-green-500'
  };

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border ${bgColor}`}>
      <div className={`rounded-full ${sizeClasses[size]} ${dotColors[status]}`}></div>
      {showLabel && <span className="text-sm font-medium">{label}</span>}
    </div>
  );
};

interface RiskBadgeProps {
  score: number;
  compact?: boolean;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ score, compact = false }) => {
  let label: string;
  let badgeClass: string;

  if (score >= 70) {
    label = 'Low';
    badgeClass = 'bg-green-100 text-green-800';
  } else if (score >= 50) {
    label = 'Medium';
    badgeClass = 'bg-yellow-100 text-yellow-800';
  } else {
    label = 'High';
    badgeClass = 'bg-red-100 text-red-800';
  }

  return (
    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${badgeClass}`}>
      {compact ? score : label}
    </span>
  );
};
