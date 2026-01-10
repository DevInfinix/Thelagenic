import React, { useState } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { mockAnalytics, mockVendors } from '../data/mockData';
import { getHighRiskVendors, getMediumRiskVendors, getLowRiskVendors } from '../utils/helpers';

export const AnalyticsPage: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  const highRisk = getHighRiskVendors(mockVendors).length;
  const mediumRisk = getMediumRiskVendors(mockVendors).length;
  const lowRisk = getLowRiskVendors(mockVendors).length;

  const riskDistribution = [
    { name: 'High Risk', value: highRisk, color: '#ef4444' },
    { name: 'Medium Risk', value: mediumRisk, color: '#f59e0b' },
    { name: 'Low Risk', value: lowRisk, color: '#22c55e' }
  ];

  const areaData = [
    { area: 'Connaught Place', vendors: 850, avgScore: 65, highRisk: 120 },
    { area: 'Karol Bagh', vendors: 420, avgScore: 58, highRisk: 95 },
    { area: 'South Delhi', vendors: 680, avgScore: 62, highRisk: 142 },
    { area: 'East Delhi', vendors: 500, avgScore: 55, highRisk: 115 },
    { area: 'West Delhi', vendors: 620, avgScore: 61, highRisk: 108 }
  ];

  const foodTypeData = [
    { type: 'Chaat', vendors: 450, avgScore: 58 },
    { type: 'North Indian', vendors: 380, avgScore: 62 },
    { type: 'Beverages', vendors: 320, avgScore: 70 },
    { type: 'Sweets', vendors: 210, avgScore: 55 },
    { type: 'Chinese', vendors: 180, avgScore: 61 }
  ];

  const complianceData = [
    { month: 'Nov', improvements: 45, violations: 58, followUps: 23 },
    { month: 'Dec', improvements: 52, violations: 48, followUps: 28 }
  ];

  const handleExportPDF = () => alert('Exporting report to PDF...');

  return (
    <div className="min-h-screen bg-green-50">
      <header className="bg-white border-b border-gray-200 p-10 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Analytics & Reports</h1>
            <p className="text-lg text-gray-600 mt-2">Compliance trends and vendor performance metrics</p>
          </div>
          <button className="px-6 py-3 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-colors font-semibold" onClick={handleExportPDF}>📊 Download Report</button>
        </div>
      </header>

      <div className="p-8 space-y-8 max-w-7xl mx-auto">
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm flex items-center gap-4">
          <label className="font-semibold text-gray-700">Time Period:</label>
          <div className="flex gap-2">
            <button className={`px-4 py-2 rounded transition-colors font-semibold ${timeRange === '7d' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-900 hover:bg-gray-300'}`} onClick={() => setTimeRange('7d')}>Last 7 Days</button>
            <button className={`px-4 py-2 rounded transition-colors font-semibold ${timeRange === '30d' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-900 hover:bg-gray-300'}`} onClick={() => setTimeRange('30d')}>Last 30 Days</button>
            <button className={`px-4 py-2 rounded transition-colors font-semibold ${timeRange === '90d' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-900 hover:bg-gray-300'}`} onClick={() => setTimeRange('90d')}>Last 90 Days</button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Risk Distribution */}
          <section className="bg-white rounded-lg border border-gray-200 p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Vendor Risk Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={riskDistribution} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => `${name}: ${value}`} outerRadius={80} fill="#8884d8" dataKey="value">
                  {riskDistribution.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </section>

          {/* Food Type Analysis */}
          <section className="bg-white rounded-lg border border-gray-200 p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Food Type Analysis</h2>
            <div className="space-y-4">
              {foodTypeData.map(item => (
                <div key={item.type}>
                  <div className="flex justify-between mb-2">
                    <span className="font-semibold text-gray-900">{item.type}</span>
                    <span className="text-gray-600 text-sm">{item.vendors} vendors | Avg: {item.avgScore}</span>
                  </div>
                  <div className="w-full bg-gray-300 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${item.avgScore}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Hygiene Trend */}
        <section className="bg-white rounded-lg border border-gray-200 p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Average Hygiene Score Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={mockAnalytics}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" stroke="#6b7280" />
              <YAxis stroke="#6b7280" domain={[0, 100]} />
              <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
              <Legend />
              <Line type="monotone" dataKey="averageScore" stroke="#3b82f6" dot={{ fill: '#3b82f6' }} name="Avg Score" />
              <Line type="monotone" dataKey="highRiskCount" stroke="#ef4444" dot={{ fill: '#ef4444' }} yAxisId="right" name="High Risk Vendors" />
            </LineChart>
          </ResponsiveContainer>
        </section>

        {/* Area-wise Performance */}
        <section className="bg-white rounded-lg border border-gray-200 p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Area-Wise Performance</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={areaData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="area" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
              <Legend />
              <Bar dataKey="avgScore" fill="#3b82f6" name="Avg Score" />
              <Bar dataKey="highRisk" fill="#ef4444" name="High Risk Count" />
            </BarChart>
          </ResponsiveContainer>
        </section>

        {/* Compliance Status */}
        <section className="bg-white rounded-lg border border-gray-200 p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Monthly Compliance Status</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={complianceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
              <Legend />
              <Bar dataKey="improvements" fill="#22c55e" name="Improvements" />
              <Bar dataKey="violations" fill="#ef4444" name="Violations" />
              <Bar dataKey="followUps" fill="#f59e0b" name="Follow-ups" />
            </BarChart>
          </ResponsiveContainer>
        </section>

        {/* Key Metrics */}
        <section className="bg-white rounded-lg border border-gray-200 p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Key Metrics Summary</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-sm font-semibold text-gray-600">Total Vendors Monitored</div>
              <div className="text-4xl font-bold text-blue-600 mt-2">3,250</div>
              <div className="text-xs text-gray-600 mt-2">Across 8 areas</div>
            </div>
            <div className="p-6 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="text-sm font-semibold text-gray-600">Avg Hygiene Score</div>
              <div className="text-4xl font-bold text-orange-600 mt-2">62</div>
              <div className="text-xs text-gray-600 mt-2">↓ 3 points vs last month</div>
            </div>
            <div className="p-6 bg-green-50 border border-green-200 rounded-lg">
              <div className="text-sm font-semibold text-gray-600">Compliance Rate</div>
              <div className="text-4xl font-bold text-green-600 mt-2">76%</div>
              <div className="text-xs text-gray-600 mt-2">↑ 2% improvement</div>
            </div>
            <div className="p-6 bg-purple-50 border border-purple-200 rounded-lg">
              <div className="text-sm font-semibold text-gray-600">Inspections This Month</div>
              <div className="text-4xl font-bold text-purple-600 mt-2">156</div>
              <div className="text-xs text-gray-600 mt-2">12 issues found</div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

