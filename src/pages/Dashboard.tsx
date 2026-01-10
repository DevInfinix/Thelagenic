import React from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, AlertCircle, Check, TrendingDown } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { StatCard } from '../components/StatCard';
import { RiskBadge } from '../components/RiskIndicator';
import { mockVendors, mockAnalytics } from '../data/mockData';
import { calculateAverageScore, getHighRiskVendors, getMediumRiskVendors, getLowRiskVendors } from '../utils/helpers';

export const Dashboard: React.FC = () => {
  const highRiskVendors = getHighRiskVendors(mockVendors);
  const mediumRiskVendors = getMediumRiskVendors(mockVendors);
  const lowRiskVendors = getLowRiskVendors(mockVendors);
  const avgScore = calculateAverageScore(mockVendors);

  const totalVendorsUnderJurisdiction = 3250;
  const inspectedThisMonth = 156;

  const recentAlerts = mockVendors
    .flatMap(v => v.alerts.map(a => ({ ...a, vendorId: v.id, vendorName: v.name })))
    .filter(a => !a.resolved)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const topHighRiskVendors = highRiskVendors.slice(0, 5);

  return (
    <div className="min-h-screen bg-green-50">
      <header className="bg-white border-b border-gray-200 p-10 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Food Safety Dashboard</h1>
            <p className="text-lg text-gray-600 mt-2">Real-time vendor monitoring and risk assessment</p>
          </div>
          <div className="text-right text-gray-600">
            {new Date().toLocaleDateString('en-IN', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </div>
        </div>
      </header>

      <div className="p-8 space-y-8 max-w-7xl mx-auto">
        {/* KPI Statistics */}
        <section>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Vendors"
              value={totalVendorsUnderJurisdiction}
              icon="🏪"
              color="blue"
            />
            <StatCard
              title="High-Risk Vendors"
              value={highRiskVendors.length}
              icon="⚠️"
              color="red"
              trend={{ direction: 'up', percentage: 5 }}
            />
            <StatCard
              title="Inspected This Month"
              value={inspectedThisMonth}
              icon="✓"
              color="green"
              trend={{ direction: 'up', percentage: 8 }}
            />
            <StatCard
              title="Average Hygiene Score"
              value={avgScore}
              icon="📊"
              color="orange"
              trend={{ direction: 'down', percentage: 3 }}
            />
          </div>
        </section>

        {/* Risk Distribution */}
        <section className="bg-white rounded-lg border border-gray-200 p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Vendor Risk Distribution</h2>
          <div className="grid grid-cols-3 gap-6">
            <div className="p-6 rounded-lg bg-red-50 border-2 border-red-200">
              <div className="text-4xl font-bold text-red-600">{highRiskVendors.length}</div>
              <div className="text-lg text-gray-700 font-semibold mt-2">High Risk</div>
              <div className="text-sm text-gray-600 mt-1">{((highRiskVendors.length / mockVendors.length) * 100).toFixed(1)}%</div>
            </div>
            <div className="p-6 rounded-lg bg-yellow-50 border-2 border-yellow-200">
              <div className="text-4xl font-bold text-yellow-600">{mediumRiskVendors.length}</div>
              <div className="text-lg text-gray-700 font-semibold mt-2">Medium Risk</div>
              <div className="text-sm text-gray-600 mt-1">{((mediumRiskVendors.length / mockVendors.length) * 100).toFixed(1)}%</div>
            </div>
            <div className="p-6 rounded-lg bg-green-50 border-2 border-green-200">
              <div className="text-4xl font-bold text-green-600">{lowRiskVendors.length}</div>
              <div className="text-lg text-gray-700 font-semibold mt-2">Low Risk</div>
              <div className="text-sm text-gray-600 mt-1">{((lowRiskVendors.length / mockVendors.length) * 100).toFixed(1)}%</div>
            </div>
          </div>
        </section>

        {/* Hygiene Trend Chart */}
        <section className="bg-white rounded-lg border border-gray-200 p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Hygiene Score Trend (Last 30 Days)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={mockAnalytics}>
              <defs>
                <linearGradient id="colorAvg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" stroke="#6b7280" />
              <YAxis stroke="#6b7280" domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              />
              <Area
                type="monotone"
                dataKey="averageScore"
                stroke="#3b82f6"
                fillOpacity={1}
                fill="url(#colorAvg)"
                name="Average Score"
              />
            </AreaChart>
          </ResponsiveContainer>
        </section>

        {/* High-Risk Vendors Alert */}
        <section className="bg-white rounded-lg border border-gray-200 p-8 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
              <AlertCircle size={24} />
              High-Risk Vendors Requiring Immediate Attention
            </h2>
            <Link to="/vendors" className="text-blue-600 hover:text-blue-700 font-semibold">View All →</Link>
          </div>
          <div className="space-y-3">
            {topHighRiskVendors.map(vendor => (
              <Link key={vendor.id} to={`/vendor/${vendor.id}`} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div>
                  <div className="font-semibold text-gray-900">{vendor.name}</div>
                  <div className="flex items-center gap-3 mt-1 text-sm text-gray-600">
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded">{vendor.foodType}</span>
                    <span>{vendor.location.area}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <RiskBadge score={vendor.currentScore} />
                  <span className="font-bold text-lg text-gray-900">{vendor.currentScore}/100</span>
                  {vendor.isRepeatOffender && (
                    <span className="bg-red-100 text-red-800 px-3 py-1 rounded text-sm font-semibold">Repeat Offender</span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Active Alerts */}
        <section className="bg-white rounded-lg border border-gray-200 p-8 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
              <AlertCircle size={24} />
              Active Alerts
            </h2>
            <Link to="/alerts" className="text-blue-600 hover:text-blue-700 font-semibold">View All →</Link>
          </div>
          <div className="space-y-3">
            {recentAlerts.length > 0 ? (
              recentAlerts.map(alert => {
                const severityClasses = {
                  high: 'border-red-200 bg-red-50',
                  medium: 'border-yellow-200 bg-yellow-50',
                  low: 'border-blue-200 bg-blue-50'
                };
                return (
                  <div key={alert.id} className={`flex items-start gap-4 p-4 border rounded-lg ${severityClasses[alert.severity]}`}>
                    <div className="text-2xl">⚠️</div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">{alert.vendorName}</div>
                      <div className="text-gray-700">{alert.message}</div>
                    </div>
                    <div className="text-sm text-gray-600">{new Date(alert.createdAt).toLocaleDateString()}</div>
                  </div>
                );
              })
            ) : (
              <div className="p-4 text-center text-gray-600">No active alerts</div>
            )}
          </div>
        </section>

        {/* Quick Actions */}
        <section className="bg-white rounded-lg border border-gray-200 p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Link to="/vendors" className="flex flex-col items-center justify-center gap-3 p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg hover:shadow-md transition-shadow border border-blue-200">
              <BarChart3 size={32} className="text-blue-600" />
              <span className="font-semibold text-blue-900">View Vendor List</span>
            </Link>
            <Link to="/inspections" className="flex flex-col items-center justify-center gap-3 p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-lg hover:shadow-md transition-shadow border border-green-200">
              <Check size={32} className="text-green-600" />
              <span className="font-semibold text-green-900">Log Inspection</span>
            </Link>
            <Link to="/analytics" className="flex flex-col items-center justify-center gap-3 p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg hover:shadow-md transition-shadow border border-orange-200">
              <TrendingDown size={32} className="text-orange-600" />
              <span className="font-semibold text-orange-900">View Reports</span>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};
