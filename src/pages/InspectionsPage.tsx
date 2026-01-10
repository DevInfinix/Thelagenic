import React, { useState } from 'react';
import { mockInspections } from '../data/mockData';
import { formatDate } from '../utils/helpers';

export const InspectionsPage: React.FC = () => {
  const [filterOutcome, setFilterOutcome] = useState<'all' | 'warning' | 'guidance' | 'passed' | 'follow-up'>('all');

  const filteredInspections = mockInspections.filter(i =>
    filterOutcome === 'all' || i.outcome === filterOutcome
  );

  const handleLogInspection = () => alert('Opening inspection form...');
  const handleExportCSV = () => alert('Exporting inspections to CSV...');

  const outcomeColors = { passed: 'border-green-200 bg-green-50', warning: 'border-orange-200 bg-orange-50', guidance: 'border-blue-200 bg-blue-50', 'follow-up': 'border-red-200 bg-red-50' };
  const statusColors = { pass: 'bg-green-100 text-green-800', fail: 'bg-red-100 text-red-800', na: 'bg-gray-100 text-gray-800' };

  return (
    <div className="ml-80 min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 p-10 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Inspection Records</h1>
            <p className="text-lg text-gray-600 mt-2">Complete inspection history and outcomes</p>
          </div>
          <div className="flex gap-4">
            <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold" onClick={handleLogInspection}>
              + Log New Inspection
            </button>
            <button className="px-6 py-3 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-colors font-semibold" onClick={handleExportCSV}>
              📊 Export Data
            </button>
          </div>
        </div>
      </header>

      <div className="p-8 space-y-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Filter by Outcome</label>
          <select value={filterOutcome} onChange={(e) => setFilterOutcome(e.target.value as any)} className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
            <option value="all">All Outcomes</option>
            <option value="passed">Passed</option>
            <option value="warning">Warning</option>
            <option value="guidance">Guidance</option>
            <option value="follow-up">Follow-up</option>
          </select>
        </div>

        <div className="text-gray-600">
          Showing <span className="font-bold text-gray-900">{filteredInspections.length}</span> inspection records
        </div>

        <div className="space-y-6">
          {filteredInspections.length > 0 ? (
            filteredInspections.map(inspection => (
              <div key={inspection.id} className={`border-2 rounded-lg p-8 ${outcomeColors[inspection.outcome]}`}>
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{inspection.vendorName}</h3>
                    <p className="text-sm text-gray-600 mt-1">{formatDate(inspection.date)}</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-4 py-2 rounded font-bold text-sm ${inspection.outcome === 'passed' ? 'bg-green-200 text-green-900' : inspection.outcome === 'warning' ? 'bg-orange-200 text-orange-900' : inspection.outcome === 'guidance' ? 'bg-blue-200 text-blue-900' : 'bg-red-200 text-red-900'}`}>
                      {inspection.outcome.charAt(0).toUpperCase() + inspection.outcome.slice(1)}
                    </span>
                    <div className="text-3xl font-bold text-gray-900 mt-2">{inspection.score}/100</div>
                  </div>
                </div>

                <div className="mb-6 p-4 bg-white rounded border border-gray-300">
                  <strong className="text-gray-700">Inspector Notes:</strong>
                  <p className="text-gray-700 mt-2">{inspection.notes}</p>
                </div>

                <div className="mb-6">
                  <strong className="text-gray-700">Compliance Checklist:</strong>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
                    {inspection.checklist.map(item => (
                      <div key={item.id} className={`flex items-center justify-between p-3 rounded font-medium ${statusColors[item.status]}`}>
                        <span>{item.item}</span>
                        <span className="text-lg">{item.status === 'pass' ? '✓' : item.status === 'fail' ? '✗' : '-'}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-300">
                  <small className="text-gray-600">Inspector: {inspection.inspectorName}</small>
                  <button className="px-4 py-2 bg-gray-300 text-gray-900 rounded hover:bg-gray-400 transition-colors font-semibold text-sm">Edit Record</button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-16 text-gray-600">No inspection records found</div>
          )}
        </div>
      </div>
    </div>
  );
};

