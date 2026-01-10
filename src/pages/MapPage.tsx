import React from 'react';
import { mockVendors } from '../data/mockData';
import { RiskBadge } from '../components/RiskIndicator';
import { MapPin } from 'lucide-react';

export const MapPage: React.FC = () => {
  return (
    <div className="ml-80 min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 p-10 shadow-sm">
        <h1 className="text-4xl font-bold text-gray-900">Geospatial Vendor Map</h1>
        <p className="text-lg text-gray-600 mt-2">Real-time location tracking and risk clustering</p>
      </header>

      <div className="p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Map area */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border border-gray-200 p-8 shadow-sm h-96 relative flex items-center justify-center">
              <div className="relative w-full h-full bg-gray-100 rounded border border-gray-300 flex items-center justify-center">
                {/* Mock map circles representing clusters */}
                <div className="absolute w-32 h-32 rounded-full bg-red-100 border-4 border-red-500 flex flex-col items-center justify-center" style={{ top: '20%', left: '25%' }}>
                  <div className="text-3xl font-bold text-red-700">12</div>
                  <div className="text-sm font-semibold text-red-700">High Risk</div>
                </div>

                <div className="absolute w-40 h-40 rounded-full bg-yellow-100 border-4 border-yellow-500 flex flex-col items-center justify-center" style={{ top: '40%', left: '55%' }}>
                  <div className="text-4xl font-bold text-yellow-700">45</div>
                </div>

                <div className="absolute w-28 h-28 rounded-full bg-green-100 border-4 border-green-500 flex flex-col items-center justify-center" style={{ top: '15%', left: '70%' }}>
                  <div className="text-2xl font-bold text-green-700">28</div>
                </div>

                {/* Individual points */}
                <div className="absolute w-4 h-4 rounded-full bg-red-600" style={{ top: '30%', left: '30%' }}></div>
                <div className="absolute w-4 h-4 rounded-full bg-red-600" style={{ top: '55%', left: '50%' }}></div>
                <div className="absolute w-4 h-4 rounded-full bg-yellow-600" style={{ top: '45%', left: '40%' }}></div>
                <div className="absolute w-4 h-4 rounded-full bg-green-600" style={{ top: '25%', left: '75%' }}></div>

                {/* Overlay text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-5 rounded">
                  <h3 className="text-2xl font-bold text-gray-800">GIS Map Visualization</h3>
                  <p className="text-gray-600 mt-2">Interactive map would be integrated here using Google Maps or Leaflet API.</p>
                  <div className="mt-6 flex gap-8">
                    <div className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full bg-red-600"></span>
                      <span className="font-semibold text-gray-700">High Risk</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full bg-yellow-600"></span>
                      <span className="font-semibold text-gray-700">Medium Risk</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full bg-green-600"></span>
                      <span className="font-semibold text-gray-700">Low Risk</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="bg-white rounded-lg border border-gray-200 p-8 shadow-sm h-96 overflow-y-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Nearby High Risk Vendors</h3>
            <div className="space-y-4">
              {mockVendors.filter(v => v.currentScore < 50).slice(0, 5).map(vendor => (
                <div key={vendor.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">{vendor.name}</h4>
                    <RiskBadge score={vendor.currentScore} compact />
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                    <MapPin size={14} />
                    <span>0.5 km away • {vendor.location.area}</span>
                  </div>
                  <button className="w-full px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors font-semibold text-sm">Navigate</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

