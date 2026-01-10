import React, { useState } from 'react';
import { mockVendors } from '../data/mockData';
import { formatDate } from '../utils/helpers';

export const AlertsPage: React.FC = () => {
  const [filterSeverity, setFilterSeverity] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [filterResolved, setFilterResolved] = useState<'all' | 'active' | 'resolved'>('active');

  const allAlerts = mockVendors
    .flatMap(v => v.alerts.map(a => ({
      ...a,
      vendorId: v.id,
      vendorName: v.name,
      vendorScore: v.currentScore
    })))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const filteredAlerts = allAlerts.filter(alert => {
    if (filterSeverity !== 'all' && alert.severity !== filterSeverity) return false;
    if (filterResolved === 'active' && alert.resolved) return false;
    if (filterResolved === 'resolved' && !alert.resolved) return false;
    return true;
  });

  const severityColors = { high: 'border-red-200 bg-red-50', medium: 'border-yellow-200 bg-yellow-50', low: 'border-blue-200 bg-blue-50' };
  const severityBadges = { high: 'bg-red-100 text-red-800', medium: 'bg-yellow-100 text-yellow-800', low: 'bg-blue-100 text-blue-800' };

  return (
    <div className="ml-80 min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 p-10 shadow-sm">
        <h1 className="text-4xl font-bold text-gray-900">Alerts & Notifications</h1>
        <p className="text-lg text-gray-600 mt-2">Active alerts and notifications for vendor hygiene violations</p>
      </header>

      <div className="p-8 space-y-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Severity</label>
            <select value={filterSeverity} onChange={(e) => setFilterSeverity(e.target.value as any)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
              <option value="all">All Severities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
            <select value={filterResolved} onChange={(e) => setFilterResolved(e.target.value as any)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
              <option value="active">Active Only</option>
              <option value="resolved">Resolved Only</option>
              <option value="all">All</option>
            </select>
          </div>
        </div>

        <div className="text-gray-600">
          Showing <span className="font-bold text-gray-900">{filteredAlerts.length}</span> alerts
        </div>

        <div className="space-y-4">
          {filteredAlerts.length > 0 ? (
            filteredAlerts.map(alert => (
              <div key={alert.id} className={`border-2 rounded-lg p-6 flex items-start justify-between ${severityColors[alert.severity]} ${alert.resolved ? 'opacity-60' : ''}`}>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-gray-900">{alert.vendorName}</h3>
                    <span className={`px-3 py-1 rounded text-xs font-bold uppercase ${severityBadges[alert.severity]}`}>{alert.severity}</span>
                  </div>
                  <div className="font-semibold text-gray-700 mb-2">{alert.type.replace(/_/g, ' ').toUpperCase()}</div>
                  <p className="text-gray-700 mb-3">{alert.message}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{formatDate(alert.createdAt)}</span>
                    <span className={`px-3 py-1 rounded text-xs font-semibold ${alert.resolved ? 'bg-gray-300 text-gray-800' : 'bg-orange-300 text-orange-900'}`}>
                      {alert.resolved ? 'Resolved' : 'Active'}
                    </span>
                  </div>
                </div>
                {!alert.resolved && <button className="ml-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors font-semibold text-sm">Resolve</button>}
              </div>
            ))
          ) : (
            <div className="text-center py-16 text-gray-600">No alerts matching your filters</div>
          )}
        </div>
      </div>
    </div>
  );
};

