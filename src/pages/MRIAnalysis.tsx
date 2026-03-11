import React, { useState } from 'react';
import { BrainCircuit, Search, AlertCircle, CheckCircle2, Activity } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from '../components/Button';
import { Patient, AnalysisResult } from '../types';

interface MRIAnalysisProps {
  patient: Patient | null;
  onAnalyze: (patientId: string) => Promise<void>;
  onConfirm: (patientId: string) => Promise<void>;
}

export const MRIAnalysis = ({ patient, onAnalyze, onConfirm }: MRIAnalysisProps) => {
  const [analyzing, setAnalyzing] = useState(false);
  const results: AnalysisResult[] = patient?.analysisResult ? (JSON.parse(patient.analysisResult) || []) : [];
  const maxConfidence = results.length > 0 ? Math.max(...results.map(r => r.confidence)) : 0;

  const handleAnalyze = async () => {
    if (!patient) return;
    setAnalyzing(true);
    await onAnalyze(patient.id);
    setAnalyzing(false);
  };

  if (!patient) return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400">
      <BrainCircuit className="w-16 h-16 mb-4 opacity-20" />
      <p>Select a patient from records to begin MRI analysis</p>
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Patient MRI Scan</h3>
          <div className="aspect-square rounded-xl overflow-hidden bg-slate-900 relative group">
            <img src={patient.mriImage} alt="MRI Scan" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Button variant="secondary" className="bg-white/20 backdrop-blur text-white border-white/30">
                <Search className="w-4 h-4" /> Full View
              </Button>
            </div>
          </div>
          <div className="mt-4 p-4 bg-slate-50 rounded-xl">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Doctor Notes</p>
            <p className="text-sm text-slate-700">{patient.notes || 'No notes provided.'}</p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm min-h-[400px] flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-slate-900">AI Analysis Results</h3>
            {patient.status === 'Pending' && (
              <Button onClick={handleAnalyze} disabled={analyzing}>
                {analyzing ? 'Analyzing...' : 'Run AI Analysis'}
              </Button>
            )}
          </div>

          {(analyzing || results.length > 0) ? (
            <div className="space-y-6">
              {(analyzing && results.length === 0 ? [
                { label: 'Tumor Detection', confidence: 0 },
                { label: 'Tissue Density', confidence: 0 },
                { label: 'Structural Integrity', confidence: 0 },
                { label: 'Vascular Pattern', confidence: 0 }
              ] : results).map((res, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className={`font-medium ${res.confidence === maxConfidence && !analyzing ? 'text-blue-700' : 'text-slate-600'}`}>
                      {res.label}
                    </span>
                    <span className="text-slate-500">{analyzing ? 'Analyzing...' : `${res.confidence}%`}</span>
                  </div>
                  <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: analyzing ? '100%' : `${res.confidence}%` }}
                      transition={analyzing ? { 
                        duration: 2, 
                        repeat: Infinity, 
                        ease: "linear" 
                      } : { 
                        duration: 1, 
                        delay: i * 0.1 
                      }}
                      className={`h-full rounded-full ${
                        analyzing ? 'bg-blue-400/50' : (res.confidence === maxConfidence ? 'bg-blue-600' : 'bg-slate-300')
                      }`}
                    />
                  </div>
                </div>
              ))}
              
              {analyzing && (
                <div className="flex items-center justify-center gap-3 py-4 text-blue-600">
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm font-medium animate-pulse">Running AI Inference Engine...</span>
                </div>
              )}

              {results.length > 0 && !analyzing && (
                <>
                  <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-100">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="text-blue-600 w-5 h-5 mt-0.5" />
                      <div>
                        <p className="text-sm font-bold text-blue-900">AI Summary</p>
                        <p className="text-sm text-blue-700 leading-relaxed">
                          Based on the analysis, the highest probability is <span className="font-bold">{results.find(r => r.confidence === maxConfidence)?.label}</span>. 
                          Please review the MRI scan manually to confirm these findings.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {patient.status === 'Analyzed' && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex flex-col gap-4 mt-8 pt-8 border-t border-slate-100"
                    >
                      <div className="flex items-center gap-2 text-emerald-600 mb-2">
                        <CheckCircle2 className="w-5 h-5" />
                        <span className="font-semibold">Analysis Complete</span>
                      </div>
                      <Button onClick={() => onConfirm(patient.id)} variant="primary" className="bg-emerald-600 hover:bg-emerald-700 py-4 text-lg shadow-lg shadow-emerald-600/20">
                        Confirm & Save Result
                      </Button>
                      <p className="text-center text-xs text-slate-400">Confirming will mark this patient record as "Done" and finalize the report.</p>
                    </motion.div>
                  )}
                </>
              )}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
              <Activity className="w-12 h-12 mb-4 opacity-20" />
              <p>Click "Run AI Analysis" to process MRI</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
