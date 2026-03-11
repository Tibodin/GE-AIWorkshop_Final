import React, { useState } from "react";
import {
  Search, UserCircle2, Brain, CheckCircle2,
  TrendingUp, Calendar, ChevronRight
} from "lucide-react";
import { Patient, AnalysisResult } from "../types";
import { Button } from "../components/Button";

const severityColors = {
  normal: { bg: "bg-emerald-500", ring: "ring-emerald-200", text: "text-emerald-700" },
  mild: { bg: "bg-blue-500", ring: "ring-blue-200", text: "text-blue-700" },
  moderate: { bg: "bg-amber-500", ring: "ring-amber-200", text: "text-amber-700" },
  severe: { bg: "bg-orange-500", ring: "ring-orange-200", text: "text-orange-700" },
  critical: { bg: "bg-red-600", ring: "ring-red-200", text: "text-red-700" },
};

interface TimelineItemProps {
  icon: React.ElementType;
  title: string;
  description?: string;
  date?: string;
  color: string;
}

function TimelineItem({ icon: Icon, title, description, date, color }: TimelineItemProps) {
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr.replace(' ', 'T'));
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + 
           " • " + 
           d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  return (
    <div className="flex gap-4">
      <div className={`shrink-0 w-8 h-8 rounded-full ${color} flex items-center justify-center ring-4 ring-white z-10`}>
        <Icon className="w-3.5 h-3.5 text-white" />
      </div>
      <div className="pb-6 border-l border-gray-200 pl-4 -ml-4 flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800">{title}</p>
        {description && <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{description}</p>}
        {date && <p className="text-[10px] text-gray-400 mt-1">{formatDate(date)}</p>}
      </div>
    </div>
  );
}

interface PatientCardProps {
  patient: Patient;
  onNavigate: (page: string) => void;
  onSelectPatient?: (patient: Patient) => void;
}

const PatientCard = ({ patient, onNavigate, onSelectPatient }: PatientCardProps) => {
  const getSeverityKey = (p: Patient): keyof typeof severityColors => {
    if (!p.analysisResult) return 'normal';
    try {
      const results: AnalysisResult[] = JSON.parse(p.analysisResult) || [];
      const critical = results.find(r => r.label === 'Critical / Tumor')?.confidence || 0;
      const severe = results.find(r => r.label === 'Severe Abnormality')?.confidence || 0;
      const moderate = results.find(r => r.label === 'Moderate Lesion')?.confidence || 0;

      if (critical > 30) return 'critical';
      if (severe > 50) return 'severe';
      if (moderate > 40) return 'moderate';
      if (moderate > 10 || severe > 10) return 'mild';
      return 'normal';
    } catch (e) {
      return 'normal';
    }
  };

  const severityKey = getSeverityKey(patient);
  const sev = severityColors[severityKey];
  
  const statusConfig = {
    'Pending': { label: "Pending", className: "bg-amber-100 text-amber-700 border-amber-200" },
    'Analyzed': { label: "Analyzed", className: "bg-blue-100 text-blue-700 border-blue-200" },
    'Done': { label: "Done", className: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  };
  const status = statusConfig[patient.status as keyof typeof statusConfig] || statusConfig['Pending'];

  const events = [];
  events.push({
    icon: UserCircle2,
    title: "Patient Registered",
    description: "Patient added to system",
    date: patient.dateAdded,
    color: "bg-blue-600",
  });
  
  if (patient.mriImage) {
    events.push({
      icon: Brain,
      title: "MRI Image Uploaded",
      description: "Brain MRI scan uploaded for analysis",
      date: patient.dateAdded, // Using dateAdded as proxy if no specific upload date
      color: "bg-violet-600",
    });
  }
  
  if (patient.status === 'Analyzed' || patient.status === 'Done') {
    events.push({
      icon: TrendingUp,
      title: "AI Analysis Completed",
      description: "Automated scan analysis finished",
      date: patient.dateAdded, // Using dateAdded as proxy
      color: sev?.bg || "bg-gray-400",
    });
  }
  
  if (patient.status === 'Done') {
    events.push({
      icon: CheckCircle2,
      title: "Result Confirmed by Doctor",
      description: "Diagnosis confirmed and recorded",
      date: patient.dateAdded, // Using dateAdded as proxy
      color: "bg-emerald-600",
    });
  }

  const confidenceScores: Record<string, number> = {};
  if (patient.analysisResult) {
    try {
      const results: AnalysisResult[] = JSON.parse(patient.analysisResult) || [];
      results.forEach(r => {
        if (r.label === 'Critical / Tumor') confidenceScores['critical'] = r.confidence;
        if (r.label === 'Severe Abnormality') confidenceScores['severe'] = r.confidence;
        if (r.label === 'Moderate Lesion') confidenceScores['moderate'] = r.confidence;
        if (r.label === 'Mild Abnormality') confidenceScores['mild'] = r.confidence;
        if (r.label === 'Normal') confidenceScores['normal'] = r.confidence;
      });
    } catch (e) {}
  }

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr.replace(' ', 'T'));
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 hover:shadow-md transition-shadow overflow-hidden flex flex-col">
      <div className="p-5 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full ${sev?.bg || "bg-gray-300"} flex items-center justify-center ring-4 ${sev?.ring || "ring-gray-100"}`}>
              <span className="text-white text-xs font-bold">
                {patient.firstName?.[0]}{patient.lastName?.[0]}
              </span>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">{patient.firstName} {patient.lastName}</p>
              <p className="text-[11px] text-gray-400 font-mono uppercase">{patient.id}</p>
            </div>
          </div>
          <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold uppercase tracking-wider ${status.className}`}>
            {status.label}
          </span>
        </div>
      </div>
      
      <div className="p-5 pt-0 flex-1">
        {/* MRI thumbnail */}
        {patient.mriImage && (
          <div className="w-full h-28 bg-gray-900 rounded-lg overflow-hidden mb-4">
            <img src={patient.mriImage} alt="MRI" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
          </div>
        )}

        {/* Timeline */}
        <div className="space-y-0 mt-2">
          {events.map((e, i) => (
            <TimelineItem key={i} {...e} />
          ))}
        </div>

        {/* Confidence mini bars */}
        {Object.keys(confidenceScores).length > 0 && (
          <div className="mt-3 space-y-1.5 border-t border-gray-50 pt-3">
            {[
              { key: "normal", label: "Normal", color: "bg-emerald-500" },
              { key: "mild", label: "Mild", color: "bg-blue-500" },
              { key: "moderate", label: "Moderate", color: "bg-amber-500" },
              { key: "severe", label: "Severe", color: "bg-orange-500" },
              { key: "critical", label: "Critical", color: "bg-red-600" },
            ].map(c => (
              <div key={c.key} className="flex items-center gap-2">
                <span className="text-[10px] text-gray-400 w-16 shrink-0">{c.label}</span>
                <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${c.color}`}
                    style={{ width: `${confidenceScores[c.key] || 0}%` }}
                  />
                </div>
                <span className="text-[10px] text-gray-500 w-8 text-right">
                  {(confidenceScores[c.key] || 0).toFixed(0)}%
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="mt-3 pt-3 border-t border-gray-50 flex justify-between items-center">
          <span className="text-[10px] text-gray-400 flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {formatDate(patient.dateAdded)}
          </span>
          <button
            onClick={() => {
              if (onSelectPatient) onSelectPatient(patient);
              onNavigate('analysis');
            }}
            className="text-xs text-blue-600 hover:underline font-medium flex items-center gap-1"
          >
            Open Analysis <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}

interface PatientTimelineProps {
  patients: Patient[];
  onNavigate: (page: string) => void;
  onSelectPatient?: (patient: Patient) => void;
}

export const PatientTimeline = ({ patients, onNavigate, onSelectPatient }: PatientTimelineProps) => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = patients.filter(p => {
    const q = search.toLowerCase();
    const matchSearch =
      p.firstName?.toLowerCase().includes(q) ||
      p.lastName?.toLowerCase().includes(q) ||
      p.id?.toLowerCase().includes(q);
    const matchStatus = statusFilter === "all" || p.status.toLowerCase() === statusFilter.toLowerCase();
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6 w-full pb-20">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Patient Timeline</h1>
        <p className="text-sm text-gray-400 mt-0.5">Full journey of each patient from registration to diagnosis</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search patients..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
          />
        </div>
        <select 
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-40 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all appearance-none cursor-pointer"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="analyzed">Analyzed</option>
          <option value="done">Done</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="p-12 text-center border-2 border-dashed border-gray-100 rounded-2xl">
          <UserCircle2 className="w-10 h-10 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-400">No patients found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map(p => (
            <div key={p.id}>
              <PatientCard 
                patient={p} 
                onNavigate={onNavigate} 
                onSelectPatient={onSelectPatient}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
