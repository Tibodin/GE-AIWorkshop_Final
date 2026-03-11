import React, { useState } from 'react';
import { Upload, X } from 'lucide-react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';

interface RegisterPatientProps {
  onComplete: () => void;
}

export const RegisterPatient = ({ onComplete }: RegisterPatientProps) => {
  const [loading, setLoading] = useState(false);
  const [mriImage, setMriImage] = useState<string | null>(null);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    notes: ''
  });

  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setMriImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mriImage) return;

    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, mriImage })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        onComplete();
      } else {
        setError(data.message || 'Failed to register patient');
      }
    } catch (err) {
      console.error('Error registering patient:', err);
      setError('A network error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-900 mb-8">Register New Patient</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm">
              {error}
            </div>
          )}
          <div className="grid grid-cols-2 gap-6">
            <Input label="First Name" value={form.firstName} onChange={(e: any) => setForm({...form, firstName: e.target.value})} required />
            <Input label="Last Name" value={form.lastName} onChange={(e: any) => setForm({...form, lastName: e.target.value})} required />
          </div>
          <Input label="Phone Number" value={form.phone} onChange={(e: any) => setForm({...form, phone: e.target.value})} required />
          
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">MRI Brain Image Upload</label>
            <div 
              className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-all ${
                mriImage ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-blue-400'
              }`}
            >
              {mriImage ? (
                <div className="relative w-full aspect-video rounded-lg overflow-hidden">
                  <img src={mriImage} alt="MRI Preview" className="w-full h-full object-cover" />
                  <button 
                    type="button"
                    onClick={() => setMriImage(null)}
                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  <Upload className="w-12 h-12 text-slate-300 mb-4" />
                  <p className="text-slate-500 text-sm mb-4">Drag and drop or click to upload MRI scan</p>
                  <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" id="mri-upload" />
                  <label 
                    htmlFor="mri-upload"
                    className="px-6 py-2 bg-slate-900 text-white rounded-lg cursor-pointer hover:bg-black transition-colors text-sm font-medium"
                  >
                    Choose File
                  </label>
                </>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Notes / Description</label>
            <textarea 
              value={form.notes}
              onChange={(e) => setForm({...form, notes: e.target.value})}
              className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all min-h-[120px]"
              placeholder="Enter patient medical history or specific concerns..."
            />
          </div>

          <Button type="submit" className="w-full py-4 text-lg" disabled={loading || !mriImage}>
            {loading ? 'Registering...' : 'Register Patient'}
          </Button>
        </form>
      </div>
    </div>
  );
};
