import React from 'react';

export const Input = ({ label, type = 'text', value, onChange, placeholder, required = false, disabled = false, readOnly = false }: any) => {
  const isReadOnly = readOnly || (value !== undefined && value !== null && !onChange);
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
      <input
        type={type}
        value={value}
        onChange={onChange}
        readOnly={isReadOnly}
        disabled={disabled}
        placeholder={placeholder}
        required={required}
        className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all disabled:bg-slate-50 disabled:text-slate-500"
      />
    </div>
  );
};
