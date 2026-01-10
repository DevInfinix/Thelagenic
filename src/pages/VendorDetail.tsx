import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, AlertCircle, FileText } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { mockVendors, mockInspections } from '../data/mockData';
import { RiskBadge } from '../components/RiskIndicator';
import { formatDate } from '../utils/helpers';

export const VendorDetail: React.FC = () => {
  const { vendorId } = useParams<{ vendorId: string }>();
  const navigate = useNavigate();
  const vendor = mockVendors.find(v => v.id === vendorId);
  const inspections = mockInspections.filter(i => i.vendorId === vendorId);

  if (!vendor) {
    return (
      <div className="ml-80 min-h-screen bg-gray-50 p-8">
        <div className="text-center py-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Vendor not found</h2>
          <Link to="/vendors" className="text-blue-600 hover:text-blue-700 font-semibold">Back to Vendors</Link>
        </div>
      </div>
    );
  }

  const severityClasses = { high: 'bg-red-50 border-red-200', medium: 'bg-yellow-50 border-yellow-200', low: 'bg-blue-50 border-blue-200' };
  const outcomeClasses = { warning: 'border-orange-200 bg-orange-50', guidance: 'border-blue-200 bg-blue-50', passed: 'border-green-200 bg-green-50', 'follow-up': 'border-red-200 bg-red-50' };
  const statusClasses = { 'pass': 'text-green-700 bg-green-100', 'fail': 'text-red-700 bg-red-100', 'na': 'text-gray-700 bg-gray-100' };

  return (
    <div className="ml-80 min-h-screen bg-gray-50">
      <button className="m-8 mb-4 flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold" onClick={() => navigate(-1)}>
        <ArrowLeft size={18} />
        Back
      </button>

      <header className="bg-white border-b border-gray-200 p-10 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">{vendor.name}</h1>
            <div className="flex items-center gap-4 mt-3">
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded text-sm font-semibold">{vendor.foodType}</span>
              <span className="flex items-center gap-1 text-gray-600"><MapPin size={14} /> {vendor.location.area}</span>
            </div>
          </div>
          <div className="text-right">
            <RiskBadge score={vendor.currentScore} />
            <div className="text-4xl font-bold text-gray-900 mt-2">{vendor.currentScore}/100</div>
          </div>
        </div>
      </header>

      <div className="p-8 space-y-8">
        {/* Contact & Registration Info */}
        <section className="bg-white rounded-lg border border-gray-200 p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact & Registration</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            <div>
              <label className="text-sm font-semibold text-gray-600">Contact Person</label>
              <div className="text-gray-900 font-semibold mt-1">{vendor.contactPerson}</div>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-600">Phone</label>
              <div className="text-gray-900 font-semibold mt-1"><a href={`tel:${vendor.phone}`} className="text-blue-600 hover:underline">{vendor.phone}</a></div>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-600">Registration Number</label>
              <div className="text-gray-900 font-semibold mt-1">{vendor.registrationNumber}</div>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-600">Registration Status</label>
              <div className={`mt-1 inline-block px-3 py-1 rounded text-sm font-semibold ${vendor.registrationStatus === 'approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                {vendor.registrationStatus.charAt(0).toUpperCase() + vendor.registrationStatus.slice(1)}
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-600">Training Status</label>
              <div className={`mt-1 inline-block px-3 py-1 rounded text-sm font-semibold ${vendor.trainingStatus === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                {vendor.trainingStatus.charAt(0).toUpperCase() + vendor.trainingStatus.slice(1)}
              </div>
            </div>
          </div>
        </section>

        {/* Hygiene Score Trend */}
        <section className="bg-white rounded-lg border border-gray-200 p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Hygiene Score Trend (Last 30 Days)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={vendor.scoreHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" stroke="#6b7280" />
              <YAxis stroke="#6b7280" domain={[0, 100]} />
              <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
              <Legend />
              <Line type="monotone" dataKey="score" stroke="#3b82f6" dot={{ fill: '#3b82f6' }} activeDot={{ r: 6 }} name="Score" />
            </LineChart>
          </ResponsiveContainer>
        </section>

        {/* Alerts & Flags */}
        {vendor.alerts.length > 0 && (
          <section className="bg-white rounded-lg border border-gray-200 p-8 shadow-sm">
            <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-900 mb-6"><AlertCircle size={24} /> Active Alerts</h2>
            <div className="space-y-4">
              {vendor.alerts.map(alert => (
                <div key={alert.id} className={`border-2 rounded-lg p-4 ${severityClasses[alert.severity]}`}>
                  <div className="font-bold text-gray-900">{alert.type.replace(/_/g, ' ').toUpperCase()}</div>
                  <div className="text-gray-700 mt-1">{alert.message}</div>
                  <div className="text-sm text-gray-600 mt-2">{formatDate(alert.createdAt)}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Inspection History */}
        <section className="bg-white rounded-lg border border-gray-200 p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Inspection History</h2>
          {inspections.length > 0 ? (
            <div className="space-y-6">
              {inspections.map(inspection => (
                <div key={inspection.id} className={`border-2 rounded-lg p-6 ${outcomeClasses[inspection.outcome]}`}>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{inspection.outcome.charAt(0).toUpperCase() + inspection.outcome.slice(1)}</h3>
                      <p className="text-sm text-gray-600 mt-1">{formatDate(inspection.date)}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-gray-900">{inspection.score}/100</div>
                      <div className="text-sm text-gray-600 mt-1">By: {inspection.inspectorName}</div>
                    </div>
                  </div>
                  {inspection.notes && (
                    <div className="mb-4 p-3 bg-white rounded border border-gray-300">
                      <strong className="text-gray-700">Notes:</strong> <span className="text-gray-700">{inspection.notes}</span>
                    </div>
                  )}
                  <div>
                    <strong className="text-gray-700">Checklist:</strong>
                    <div className="grid grid-cols-2 gap-3 mt-3">
                      {inspection.checklist.map(item => (
                        <div key={item.id} className={`flex items-center justify-between p-3 rounded border ${statusClasses[item.status]}`}>
                          <span className="font-medium">{item.item}</span>
                          <span className="text-xs font-bold uppercase">{item.status}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-gray-600 bg-gray-50 rounded-lg">No inspection records yet</div>
          )}
        </section>

        {/* Documents */}
        <section className="bg-white rounded-lg border border-gray-200 p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Documents</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 border border-gray-300 rounded-lg">
              <div className="flex items-center gap-3">
                <FileText size={20} className="text-blue-600" />
                <span className="font-semibold text-gray-900">FSSAI Registration</span>
              </div>
              {vendor.documents.fssaiRegistration ? (
                <a href="#" className="text-blue-600 hover:text-blue-700 font-semibold">Download</a>
              ) : (
                <span className="bg-red-100 text-red-800 px-3 py-1 rounded text-sm font-semibold">Missing</span>
              )}
            </div>
            <div className="flex items-center justify-between p-4 border border-gray-300 rounded-lg">
              <div className="flex items-center gap-3">
                <FileText size={20} className="text-blue-600" />
                <span className="font-semibold text-gray-900">Training Certificate</span>
              </div>
              {vendor.documents.trainingCertificate ? (
                <a href="#" className="text-blue-600 hover:text-blue-700 font-semibold">Download</a>
              ) : (
                <span className="bg-red-100 text-red-800 px-3 py-1 rounded text-sm font-semibold">Missing</span>
              )}
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="bg-white rounded-lg border border-gray-200 p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
          <div className="flex flex-wrap gap-4">
            <Link to={`/inspections`} className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold">Log Inspection</Link>
            <button className="px-6 py-3 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-colors font-semibold">Send Alert to Vendor</button>
            <button className="px-6 py-3 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-colors font-semibold">Schedule Follow-up</button>
          </div>
        </section>
      </div>
    </div>
  );
};

