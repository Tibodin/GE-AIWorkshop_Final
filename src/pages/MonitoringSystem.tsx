import React, { useState, useEffect } from 'react';
import { Activity, ShieldCheck, Server, Globe, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import { motion } from 'motion/react';
import { Patient, SystemEvent, AnalysisResult } from '../types';

interface MonitoringSystemProps {
  patients: Patient[];
}

export const MonitoringSystem = ({ patients }: MonitoringSystemProps) => {
  const [events, setEvents] = useState<SystemEvent[]>([]);

  useEffect(() => {
    fetchEvents();
    const interval = setInterval(fetchEvents, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events');
      const data = await response.json();
      setEvents(data);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Monitor System</h1>
        <p className="text-sm text-slate-400 mt-0.5">Real-time system health and event tracking</p>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 mb-6">System Event Logs</h3>
        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
          {events.length > 0 ? (
            events.map((event) => (
              <div key={event.id} className="flex items-start justify-between p-4 bg-slate-50 rounded-xl border border-slate-100/50">
                <div className="flex gap-4">
                  <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${
                    event.status === 'Success' ? 'bg-emerald-500' : 
                    event.status === 'Error' ? 'bg-red-500' : 'bg-blue-500'
                  }`} />
                  <div className="flex flex-col gap-1">
                    <p className="text-sm text-slate-700 font-medium">{event.message}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">{event.type}</span>
                      <span className="text-[10px] text-slate-400">•</span>
                      <span className="text-[10px] text-slate-400">{new Date((event.timestamp || '').replace(' ', 'T')).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                <span className={`text-[9px] font-bold uppercase tracking-tighter px-2 py-0.5 rounded border ${
                  event.status === 'Success' ? 'bg-emerald-50/50 text-emerald-600 border-emerald-100' : 
                  'bg-blue-50/50 text-blue-600 border-blue-100'
                }`}>
                  {event.status}
                </span>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-slate-400 text-sm">
              No system events recorded yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
