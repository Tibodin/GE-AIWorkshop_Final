import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { RegisterPatient } from './pages/RegisterPatient';
import { PatientRecords } from './pages/PatientRecords';
import { MRIAnalysis } from './pages/MRIAnalysis';
import { MonitoringSystem } from './pages/MonitoringSystem';
import { PatientTimeline } from './pages/PatientTimeline';
import { Settings } from './pages/Settings';
import { AIAssistant } from './pages/AIAssistant';
import { ContactDoctor } from './components/ContactDoctor';
import { User, Patient } from './types';

const App = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [currentPage, setCurrentPage] = useState('login');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg' | 'xl'>('base');

  useEffect(() => {
    const savedFontSize = localStorage.getItem('fontSize') as 'sm' | 'base' | 'lg' | 'xl';
    if (savedFontSize) setFontSize(savedFontSize);
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add('light');
    
    root.classList.remove('font-size-sm', 'font-size-base', 'font-size-lg', 'font-size-xl');
    root.classList.add(`font-size-${fontSize}`);
    localStorage.setItem('fontSize', fontSize);
  }, [fontSize]);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setCurrentPage('dashboard');
    }
    setIsAuthReady(true);
  }, []);

  useEffect(() => {
    if (user) {
      fetchPatients();
    }
  }, [user]);

  const fetchPatients = async () => {
    try {
      const response = await fetch('/api/patients');
      const data = await response.json();
      setPatients(data);
      
      // Update selected patient if it exists in the new data
      if (selectedPatient) {
        const updated = data.find((p: Patient) => p.id === selectedPatient.id);
        if (updated) setSelectedPatient(updated);
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };

  const handleLogin = (userData: User) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    setCurrentPage('login');
  };

  const handleAnalyze = async (patientId: string) => {
    try {
      const response = await fetch(`/api/patients/${patientId}/analyze`, { method: 'POST' });
      if (response.ok) {
        await fetchPatients();
      }
    } catch (error) {
      console.error('Error analyzing patient:', error);
    }
  };

  const handleConfirm = async (patientId: string) => {
    try {
      const response = await fetch(`/api/patients/${patientId}/confirm`, { method: 'POST' });
      if (response.ok) {
        await fetchPatients();
      }
    } catch (error) {
      console.error('Error confirming patient:', error);
    }
  };

  const handleDelete = async (patientId: string) => {
    if (!patientId || patientId === 'null') {
      console.error('Invalid patient ID for deletion');
      return;
    }
    console.log('Deleting patient:', patientId);
    try {
      const response = await fetch(`/api/patients/${patientId}`, { method: 'DELETE' });
      if (response.ok) {
        console.log('Delete successful, fetching patients...');
        await fetchPatients();
      } else {
        const errorText = await response.text();
        console.error('Delete failed:', errorText);
        throw new Error(errorText || 'Server error during deletion');
      }
    } catch (error) {
      console.error('Error deleting patient:', error);
      throw error;
    }
  };

  if (!isAuthReady) return null;

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4 transition-colors duration-200">
        <Login onLogin={handleLogin} onNavigate={setCurrentPage} />
      </div>
    );
  }

  return (
    <Layout 
      user={user} 
      currentPage={currentPage} 
      onNavigate={setCurrentPage} 
      onLogout={handleLogout}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPage}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {currentPage === 'dashboard' && (
            <Dashboard 
              patients={patients} 
              onNavigate={setCurrentPage} 
              onSelectPatient={setSelectedPatient}
            />
          )}
          {currentPage === 'register-patient' && <RegisterPatient onComplete={() => { fetchPatients(); setCurrentPage('records'); }} />}
          {currentPage === 'records' && (
            <PatientRecords 
              patients={patients} 
              onSelectPatient={(p: Patient) => { 
                setSelectedPatient(p); 
                setCurrentPage('analysis'); 
              }} 
              onDelete={handleDelete}
              onRefresh={fetchPatients}
            />
          )}
          {currentPage === 'analysis' && (
            <MRIAnalysis 
              patient={selectedPatient} 
              onAnalyze={handleAnalyze} 
              onConfirm={handleConfirm} 
            />
          )}
          {currentPage === 'monitoring' && <MonitoringSystem patients={patients} />}
          {currentPage === 'patient-timeline' && (
            <PatientTimeline 
              patients={patients} 
              onNavigate={setCurrentPage} 
              onSelectPatient={setSelectedPatient}
            />
          )}
          {currentPage === 'ai-assistant' && <AIAssistant patients={patients} />}
          {currentPage === 'settings' && (
            <Settings 
              fontSize={fontSize} 
              setFontSize={setFontSize} 
            />
          )}
        </motion.div>
      </AnimatePresence>
      <ContactDoctor patients={patients} />
    </Layout>
  );
};

export default App;
