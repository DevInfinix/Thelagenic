import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BarChart3, FileText, AlertCircle, Home } from 'lucide-react';

export const Sidebar: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: Home },
    { path: '/vendors', label: 'Vendors', icon: FileText },
    { path: '/alerts', label: 'Alerts', icon: AlertCircle },
    { path: '/inspections', label: 'Inspections', icon: BarChart3 },
    { path: '/analytics', label: 'Analytics', icon: BarChart3 }
  ];

  return (
    <aside className="fixed h-screen w-72 bg-gradient-to-b from-emerald-700 via-emerald-600 to-teal-700 text-white flex flex-col border-r border-emerald-800 shadow-lg">
      <div className="p-6 border-b border-emerald-800 flex items-center gap-3">
        <h1 className="text-2xl font-bold whitespace-nowrap">FSSAI Officer</h1>
      </div>

      <nav className="flex-1 p-6 space-y-3 overflow-y-auto">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-4 px-5 py-4 rounded-lg transition-all ${isActive
                ? 'bg-gradient-to-r from-lime-300 to-green-300 text-emerald-900 font-semibold shadow-lg'
                : 'text-emerald-100 hover:bg-emerald-700 hover:text-white'
                }`}
            >
              <Icon size={24} className="flex-shrink-0" />
              <span className="text-base font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-emerald-800 p-6">
        <div className="space-y-3">
          <div className="inline-block bg-gradient-to-r from-lime-300 to-green-300 text-emerald-900 px-4 py-2 rounded-full text-sm font-bold">Officer</div>
          <p className="text-sm text-emerald-200 mt-3">Jurisdiction: 3,250 vendors</p>
        </div>
      </div>
    </aside>
  );
};
