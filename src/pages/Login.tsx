import React, { useState } from 'react';
import { BrainCircuit } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';

interface LoginProps {
  onLogin: (user: any) => void;
  onNavigate: (page: string) => void;
  key?: string;
}

export const Login = ({ onLogin, onNavigate }: LoginProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === 'doctor' && password === 'doc123') {
      onLogin({
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'doctor@neuroscan.ai'
      });
    } else {
      setError('Invalid username or password');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-md bg-white p-8 rounded-2xl border border-slate-100 shadow-xl transition-colors duration-200"
    >
      <div className="flex flex-col items-center mb-8">
        <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg shadow-blue-600/20">
          <BrainCircuit className="w-10 h-10" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">NeuroScan AI</h1>
        <p className="text-slate-500 text-sm mt-1">Hospital Management System</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Username" value={email} onChange={(e: any) => setEmail(e.target.value)} required placeholder="doctor" />
        <Input label="Password" type="password" value={password} onChange={(e: any) => setPassword(e.target.value)} required placeholder="doc123" />
        
        {error && <p className="text-red-500 text-sm">{error}</p>}

        <Button type="submit" className="w-full py-3 mt-2">Sign In</Button>
      </form>

      <div className="mt-6 text-center text-sm text-slate-400">
        <p>Use <span className="font-bold text-slate-600">doctor</span> / <span className="font-bold text-slate-600">doc123</span> to login</p>
      </div>
    </motion.div>
  );
};
