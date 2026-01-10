import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BarChart3, FileText, AlertCircle, Home, Menu } from 'lucide-react';

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = React.useState(true);

  const navItems = [
    { path: '/', label: 'Dashboard', icon: Home },
    { path: '/vendors', label: 'Vendors', icon: FileText },
    { path: '/alerts', label: 'Alerts', icon: AlertCircle },
    { path: '/inspections', label: 'Inspections', icon: BarChart3 },
    { path: '/analytics', label: 'Analytics', icon: BarChart3 }
  ];

  return (
    <aside className={`fixed h-screen w-${isOpen ? '80' : '32'} bg-slate-900 text-white transition-all duration-300 flex flex-col border-r border-slate-700`}>
      <div className="p-4 border-b border-slate-700 flex items-center gap-3">
        <button
          className="p-2 hover:bg-slate-800 rounded-md transition-colors"
          onClick={() => setIsOpen(!isOpen)}
        >
          <Menu size={20} />
        </button>
        {isOpen && <h1 className="text-lg font-bold whitespace-nowrap">FSSAI Officer</h1>}
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800'
                }`}
              title={item.label}
            >
              <Icon size={20} className="flex-shrink-0" />
              {isOpen && <span className="text-sm font-medium">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className={`border-t border-slate-700 p-4 ${isOpen ? 'block' : 'hidden'}`}>
        <div className="space-y-2">
          <div className="inline-block bg-blue-600 px-3 py-1 rounded-full text-xs font-semibold">Officer</div>
          <p className="text-xs text-slate-400 mt-2">Jurisdiction: 3,250 vendors</p>
        </div>
      </div>
    </aside>
  );
};
