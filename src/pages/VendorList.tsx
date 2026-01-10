import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { RiskBadge } from '../components/RiskIndicator';
import { mockVendors } from '../data/mockData';
import { formatDate } from '../utils/helpers';

export const VendorList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRisk, setFilterRisk] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [filterArea, setFilterArea] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'score' | 'name' | 'recent'>('score');

  const areas = Array.from(new Set(mockVendors.map(v => v.location.area)));

  const filteredAndSortedVendors = useMemo(() => {
    let result = [...mockVendors];

    // Search filter
    if (searchTerm) {
      result = result.filter(v =>
        v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.contactPerson.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Risk filter
    if (filterRisk !== 'all') {
      result = result.filter(v => {
        if (filterRisk === 'high') return v.currentScore < 50;
        if (filterRisk === 'medium') return v.currentScore >= 50 && v.currentScore < 70;
        if (filterRisk === 'low') return v.currentScore >= 70;
        return true;
      });
    }

    // Area filter
    if (filterArea !== 'all') {
      result = result.filter(v => v.location.area === filterArea);
    }

    // Sort
    if (sortBy === 'score') {
      result.sort((a, b) => a.currentScore - b.currentScore);
    } else if (sortBy === 'name') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'recent') {
      result.sort((a, b) => {
        const dateA = new Date(b.lastInspectionDate || '').getTime();
        const dateB = new Date(a.lastInspectionDate || '').getTime();
        return dateA - dateB;
      });
    }

    return result;
  }, [searchTerm, filterRisk, filterArea, sortBy]);

  return (
    <div className="ml-80 min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 p-10 shadow-sm">
        <h1 className="text-4xl font-bold text-gray-900">Vendor Management</h1>
        <p className="text-lg text-gray-600 mt-2">Risk-based vendor monitoring and inspection prioritization</p>
      </header>

      <div className="p-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm space-y-6 mb-8">
          <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-4 py-3 border border-gray-300">
            <Search size={18} className="text-gray-500" />
            <input
              type="text"
              placeholder="Search vendors by name or contact..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 bg-transparent outline-none text-gray-900 placeholder-gray-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Risk Level</label>
              <select value={filterRisk} onChange={(e) => setFilterRisk(e.target.value as any)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                <option value="all">All Risks</option>
                <option value="high">High Risk</option>
                <option value="medium">Medium Risk</option>
                <option value="low">Low Risk</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Area</label>
              <select value={filterArea} onChange={(e) => setFilterArea(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                <option value="all">All Areas</option>
                {areas.map(area => (
                  <option key={area} value={area}>{area}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Sort By</label>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                <option value="score">Risk Score (Lowest First)</option>
                <option value="name">Name (A-Z)</option>
                <option value="recent">Recently Inspected</option>
              </select>
            </div>
          </div>
        </div>

        <div className="mb-4 text-gray-600">
          Showing <span className="font-bold text-gray-900">{filteredAndSortedVendors.length}</span> vendors
        </div>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-200">
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Vendor Name</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Food Type</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Hygiene Score</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Risk Level</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Last Inspection</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredAndSortedVendors.length > 0 ? (
                  filteredAndSortedVendors.map(vendor => (
                    <tr key={vendor.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-900">{vendor.name}</div>
                        <div className="text-xs text-gray-500">ID: {vendor.id}</div>
                      </td>
                      <td className="px-6 py-4 text-gray-700">{vendor.foodType}</td>
                      <td className="px-6 py-4 text-gray-700">{vendor.location.area}</td>
                      <td className="px-6 py-4">
                        <span className="inline-block bg-gray-100 px-3 py-1 rounded font-semibold text-gray-900">{vendor.currentScore}/100</span>
                      </td>
                      <td className="px-6 py-4">
                        <RiskBadge score={vendor.currentScore} />
                      </td>
                      <td className="px-6 py-4 text-gray-700">{vendor.lastInspectionDate ? formatDate(vendor.lastInspectionDate) : 'N/A'}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-2">
                          {vendor.isRepeatOffender && <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-semibold">Repeat</span>}
                          {vendor.alerts.length > 0 && <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs font-semibold">{vendor.alerts.length} Alert{vendor.alerts.length > 1 ? 's' : ''}</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Link to={`/vendor/${vendor.id}`} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors font-semibold text-sm">View</Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-gray-600">No vendors found matching your filters</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

