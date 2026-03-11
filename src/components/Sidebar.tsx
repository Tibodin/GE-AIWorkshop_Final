import React from 'react';
import { LayoutDashboard, UserPlus, ClipboardList, BrainCircuit, Activity, Settings, LogOut, Clock } from 'lucide-react';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

export const Sidebar = ({ currentPage, onNavigate, onLogout }: SidebarProps) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'register-patient', label: 'Register Patient', icon: UserPlus },
    { id: 'records', label: 'Patient Records', icon: ClipboardList },
    { id: 'analysis', label: 'MRI Analysis', icon: BrainCircuit },
    { id: 'patient-timeline', label: 'Patient Timeline', icon: Clock },
    { id: 'monitoring', label: 'Monitoring System', icon: Activity },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-100 flex flex-col h-screen sticky top-0 transition-colors duration-200">
      <div className="p-6">
        <div className="flex items-center gap-3 text-blue-600 mb-8">
          <BrainCircuit className="w-8 h-8" />
          <span className="font-bold text-xl tracking-tight text-slate-900">NeuroScan</span>
        </div>

        <nav className="space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                currentPage === item.id 
                  ? 'bg-blue-50 text-blue-600 shadow-sm' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <item.icon className={`w-5 h-5 ${currentPage === item.id ? 'text-blue-600' : 'text-slate-400'}`} />
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-auto p-6 border-t border-slate-50">
        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all"
        >
          <LogOut className="w-5 h-5" />
          Logout System
        </button>
      </div>
    </aside>
  );
};
