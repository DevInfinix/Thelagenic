import type { Vendor } from '../types/index';

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
};

export const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const getRiskColor = (score: number): string => {
  if (score >= 70) return '#22c55e'; // green
  if (score >= 50) return '#f59e0b'; // amber
  return '#ef4444'; // red
};

export const getRiskStatus = (score: number): string => {
  if (score >= 70) return 'Low Risk';
  if (score >= 50) return 'Medium Risk';
  return 'High Risk';
};

export const getHighRiskVendors = (vendors: Vendor[]): Vendor[] => {
  return vendors.filter(v => v.currentScore < 50).sort((a, b) => a.currentScore - b.currentScore);
};

export const getMediumRiskVendors = (vendors: Vendor[]): Vendor[] => {
  return vendors.filter(v => v.currentScore >= 50 && v.currentScore < 70).sort((a, b) => a.currentScore - b.currentScore);
};

export const getLowRiskVendors = (vendors: Vendor[]): Vendor[] => {
  return vendors.filter(v => v.currentScore >= 70).sort((a, b) => b.currentScore - a.currentScore);
};

export const filterVendorsByArea = (vendors: Vendor[], area: string): Vendor[] => {
  return vendors.filter(v => v.location.area === area);
};

export const filterVendorsByFoodType = (vendors: Vendor[], foodType: string): Vendor[] => {
  return vendors.filter(v => v.foodType === foodType);
};

export const filterVendorsByScoreRange = (vendors: Vendor[], min: number, max: number): Vendor[] => {
  return vendors.filter(v => v.currentScore >= min && v.currentScore <= max);
};

export const calculateAverageScore = (vendors: Vendor[]): number => {
  if (vendors.length === 0) return 0;
  const sum = vendors.reduce((acc, v) => acc + v.currentScore, 0);
  return Math.round(sum / vendors.length);
};

export const getScoreTrend = (current: number, previous?: number): { trend: string; percentage: number } => {
  if (!previous) return { trend: 'neutral', percentage: 0 };
  const change = current - previous;
  if (change > 0) return { trend: 'up', percentage: change };
  if (change < 0) return { trend: 'down', percentage: Math.abs(change) };
  return { trend: 'neutral', percentage: 0 };
};

export const generatePDF = (title: string, content: string): void => {
  // Simple PDF generation placeholder
  const element = document.createElement('div');
  element.innerHTML = `<h1>${title}</h1><div>${content}</div>`;
  console.log('PDF would be generated with:', element);
  // In real implementation, use jsPDF or similar library
};

export const exportToCSV = (data: any[], filename: string): void => {
  const csv = [
    Object.keys(data[0]).join(','),
    ...data.map(row => Object.values(row).join(','))
  ].join('\n');
  
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
};
