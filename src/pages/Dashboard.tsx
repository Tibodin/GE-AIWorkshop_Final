import React from 'react';
import { 
  Users, 
  Brain, 
  CheckCircle, 
  Clock, 
  UserPlus, 
  AlertTriangle, 
  TrendingUp, 
  AlertCircle,
  ChevronRight
} from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from '../components/Button';
import { Patient, AnalysisResult } from '../types';

interface DashboardProps {
  patients: Patient[];
  onNavigate: (page: string) => void;
  onSelectPatient?: (patient: Patient) => void;
}

export const Dashboard = ({ patients, onNavigate, onSelectPatient }: DashboardProps) => {
  const getSeverity = (patient: Patient) => {
    if (!patient.analysisResult) return { label: 'normal', dotColor: 'bg-green-500', textColor: 'text-green-600' };
    
    try {
      const results: AnalysisResult[] = JSON.parse(patient.analysisResult) || [];
      const critical = results.find(r => r.label === 'Critical / Tumor')?.confidence || 0;
      const severe = results.find(r => r.label === 'Severe Abnormality')?.confidence || 0;
      const moderate = results.find(r => r.label === 'Moderate Lesion')?.confidence || 0;

      if (critical > 30) return { label: 'critical', dotColor: 'bg-red-500', textColor: 'text-red-600' };
      if (severe > 50) return { label: 'severe', dotColor: 'bg-orange-500', textColor: 'text-orange-600' };
      if (moderate > 40) return { label: 'moderate', dotColor: 'bg-amber-500', textColor: 'text-amber-600' };
      if (moderate > 10 || severe > 10) return { label: 'mild', dotColor: 'bg-blue-500', textColor: 'text-blue-600' };
      return { label: 'normal', dotColor: 'bg-green-500', textColor: 'text-green-600' };
    } catch (e) {
      return { label: 'normal', dotColor: 'bg-green-500', textColor: 'text-green-600' };
    }
  };

  const highRiskPatients = patients.filter(p => {
    const sev = getSeverity(p).label;
    return sev === 'severe' || sev === 'critical';
  });

  const stats = [
    { 
      label: 'Total Patients', 
      value: patients.length, 
      icon: Users, 
      color: 'text-blue-600', 
      bg: 'bg-blue-50' 
    },
    { 
      label: 'MRI Uploads', 
      value: patients.filter(p => p.mriImage).length, 
      icon: Brain, 
      color: 'text-violet-600', 
      bg: 'bg-violet-50' 
    },
    { 
      label: 'Analysis Complete', 
      value: patients.filter(p => p.status === 'Analyzed' || p.status === 'Done').length, 
      icon: CheckCircle, 
      color: 'text-emerald-600', 
      bg: 'bg-emerald-50' 
    },
    { 
      label: 'Pending Analysis', 
      value: patients.filter(p => p.status === 'Pending').length, 
      icon: Clock, 
      color: 'text-amber-600', 
      bg: 'bg-amber-50' 
    },
  ];

  const quickActions = [
    { label: 'Register Patient', icon: UserPlus, color: 'bg-blue-600', page: 'register-patient' },
    { label: 'MRI Analysis', icon: Brain, color: 'bg-violet-600', page: 'analysis' },
    { label: 'Monitoring', icon: AlertTriangle, color: 'bg-amber-600', page: 'monitoring' },
    { label: 'AI Assistant', icon: TrendingUp, color: 'bg-emerald-600', page: 'ai-assistant' },
  ];

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr.replace(' ', 'T'));
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Page Title Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 mt-1">Overview of NeuroScan MRI management system</p>
        </div>

        {highRiskPatients.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-red-700"
          >
            <AlertCircle className="w-5 h-5" />
            <span className="text-sm font-semibold">{highRiskPatients.length} high-risk patient(s) require attention</span>
          </motion.div>
        )}
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm"
          >
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions Panel */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-900">Quick Actions</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, i) => (
            <button
              key={i}
              onClick={() => onNavigate(action.page)}
              className={`flex items-center gap-3 p-4 ${action.color} text-white rounded-xl hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-slate-200`}
            >
              <action.icon className="w-5 h-5" />
              <span className="font-semibold">{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Patient Activity Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900">Recent Patient Activity</h3>
          <button 
            onClick={() => onNavigate('records')}
            className="text-blue-600 text-sm font-semibold hover:underline flex items-center gap-1"
          >
            View all <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-semibold">Patient ID</th>
                <th className="px-6 py-4 font-semibold">Name</th>
                <th className="px-6 py-4 font-semibold">Phone</th>
                <th className="px-6 py-4 font-semibold">Severity</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {patients.length > 0 ? (
                patients.slice(0, 10).map((p) => {
                  const severity = getSeverity(p);
                  return (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-mono text-slate-500">{p.id}</td>
                      <td className="px-6 py-4 text-sm font-bold text-slate-900">{p.firstName} {p.lastName}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{p.phone}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${severity.dotColor}`} />
                          <span className={`text-xs font-bold uppercase ${severity.textColor}`}>{severity.label}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          p.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                          p.status === 'Analyzed' ? 'bg-blue-100 text-blue-700' :
                          'bg-emerald-100 text-emerald-700'
                        }`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">{formatDate(p.dateAdded)}</td>
                      <td className="px-6 py-4">
                        <Button 
                          variant="secondary" 
                          className="text-xs py-1.5"
                          onClick={() => {
                            if (onSelectPatient) onSelectPatient(p);
                            onNavigate('analysis');
                          }}
                        >
                          View
                        </Button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400 italic">
                    No patients registered yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
