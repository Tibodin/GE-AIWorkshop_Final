import React, { useState } from 'react';
import { Search, Trash2, AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { Patient } from '../types';

interface PatientRecordsProps {
  patients: Patient[];
  onSelectPatient: (patient: Patient) => void;
  onDelete: (patientId: string) => void;
  onRefresh: () => void;
}

export const PatientRecords = ({ patients, onSelectPatient, onDelete, onRefresh }: PatientRecordsProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await onRefresh();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const filteredPatients = patients.filter((p: Patient) => 
    `${p.firstName || ''} ${p.lastName || ''}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.id || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async () => {
    if (patientToDelete) {
      setIsDeleting(true);
      setDeleteError(null);
      try {
        await onDelete(patientToDelete.id);
        setPatientToDelete(null);
      } catch (err: any) {
        setDeleteError(err.message || 'Failed to delete patient. Please try again.');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-900">Patient Records</h3>
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            className={`p-2 rounded-full hover:bg-slate-100 transition-all ${isRefreshing ? 'animate-spin' : ''}`}
            onClick={handleRefresh}
            title="Refresh list"
          >
            <RefreshCw className="w-4 h-4 text-slate-500" />
          </Button>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input 
              placeholder="Search patients by name or ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-slate-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 outline-none w-64"
            />
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4 font-semibold">Patient ID</th>
              <th className="px-6 py-4 font-semibold">Name</th>
              <th className="px-6 py-4 font-semibold">Phone</th>
              <th className="px-6 py-4 font-semibold">MRI Image</th>
              <th className="px-6 py-4 font-semibold">Date Added</th>
              <th className="px-6 py-4 font-semibold">Status</th>
              <th className="px-6 py-4 font-semibold">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredPatients.length > 0 ? (
              filteredPatients.map((p: Patient) => (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-mono text-slate-600">
                    {(!p.id || p.id === 'null') ? (
                      <span className="text-red-400 italic flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Invalid ID
                      </span>
                    ) : p.id}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">{p.firstName} {p.lastName}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{p.phone}</td>
                  <td className="px-6 py-4">
                    <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden">
                      <img src={p.mriImage} alt="MRI" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">{new Date((p.dateAdded || '').replace(' ', 'T')).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      p.status === 'Pending' ? 'bg-amber-50 text-amber-700' :
                      p.status === 'Analyzed' ? 'bg-blue-50 text-blue-700' :
                      'bg-emerald-50 text-emerald-700'
                    }`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Button 
                        variant="secondary" 
                        className="text-blue-600 border-blue-100 hover:bg-blue-50 text-xs py-1.5" 
                        onClick={() => onSelectPatient(p)}
                      >
                        View / Edit
                      </Button>
                      <button 
                        type="button"
                        title="Delete Patient"
                        className="p-2 text-red-500 hover:text-white hover:bg-red-600 rounded-lg transition-all duration-200 border border-transparent hover:border-red-700 active:scale-95" 
                        onClick={() => setPatientToDelete(p)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                  No patients found matching "{searchTerm}"
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal 
        isOpen={!!patientToDelete} 
        onClose={() => !isDeleting && setPatientToDelete(null)}
        title="Confirm Deletion"
      >
        <div className="space-y-4">
          {deleteError && (
            <div className="p-3 bg-red-100 border border-red-200 text-red-700 rounded-xl text-xs font-medium">
              {deleteError}
            </div>
          )}
          <div className="flex items-center gap-3 p-3 bg-red-50 rounded-xl text-red-700">
            <AlertTriangle className="w-6 h-6 flex-shrink-0" />
            <p className="text-sm font-medium">
              This action cannot be undone. All records for this patient will be permanently removed.
            </p>
          </div>
          <div className="p-4 border border-slate-100 rounded-xl bg-slate-50">
            <p className="text-xs text-slate-500 uppercase font-bold mb-1">Patient to delete</p>
            <p className="text-slate-900 font-bold">{patientToDelete?.firstName} {patientToDelete?.lastName}</p>
            <p className="text-xs text-slate-500 font-mono">{patientToDelete?.id}</p>
          </div>
          <div className="flex gap-3 pt-2">
            <Button 
              variant="secondary" 
              className="flex-1" 
              onClick={() => setPatientToDelete(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button 
              variant="danger" 
              className="flex-1" 
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete Patient'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
