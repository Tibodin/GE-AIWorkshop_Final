import React from 'react';
import { Moon, Sun, Type, Key, Save } from 'lucide-react';
import { Button } from '../components/Button';

interface SettingsProps {
  fontSize: 'sm' | 'base' | 'lg' | 'xl';
  setFontSize: (size: 'sm' | 'base' | 'lg' | 'xl') => void;
}

export const Settings = ({ fontSize, setFontSize }: SettingsProps) => {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm transition-colors duration-200">
        <h2 className="text-2xl font-bold text-slate-900 mb-8">System Settings</h2>
        
        <div className="space-y-8">
          {/* Font Size Setting */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-slate-900 font-semibold">
              <Type className="w-5 h-5" />
              <h3>Font Size</h3>
            </div>
            <div className="flex flex-wrap gap-3">
              {(['sm', 'base', 'lg', 'xl'] as const).map((size) => (
                <button
                  key={size}
                  onClick={() => setFontSize(size)}
                  className={`px-6 py-3 rounded-xl border-2 font-medium transition-all ${
                    fontSize === size 
                      ? 'border-blue-500 bg-blue-50 text-blue-600' 
                      : 'border-slate-100 hover:border-slate-200 text-slate-500'
                  }`}
                >
                  {size.toUpperCase()}
                </button>
              ))}
            </div>
            <p className="text-sm text-slate-500 italic">
              Preview: The quick brown fox jumps over the lazy dog.
            </p>
          </section>

          {/* API Configuration Placeholder */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-slate-900 font-semibold">
              <Key className="w-5 h-5" />
              <h3>API & Model Configuration</h3>
            </div>
            <div className="p-6 bg-white rounded-2xl border border-slate-100 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Gemini API Key</label>
                <input 
                  type="password" 
                  placeholder="Enter your Gemini API Key here..."
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-blue-500/20 outline-none"
                  defaultValue="••••••••••••••••"
                  readOnly
                />
                <p className="text-xs text-slate-500 mt-2">
                  * This key is used for the AI Assistant Chatbot. You can configure this in your environment variables.
                </p>
              </div>
              
              <div className="pt-4 border-t border-slate-200">
                <h4 className="text-sm font-bold text-slate-900 mb-2">PyTorch Model (.pt) Integration</h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Your custom model <code>efficientnetb0_alzheimer.pt</code> is ready for integration. 
                  The backend has a placeholder in <code>server.ts</code> under the <code>/api/patients/:id/analyze</code> route 
                  where you can insert your model inference code.
                </p>
              </div>
            </div>
          </section>

          <div className="pt-4">
            <Button className="w-full flex items-center justify-center gap-2 py-4">
              <Save className="w-5 h-5" />
              Save All Settings
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
