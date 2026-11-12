import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { X } from 'lucide-react';

export const Input = ({ label, className = '', ...props }) => {
  const { currentTheme } = useTheme();
  return (
    <div className="space-y-1 w-full">
      {label && <label className="text-sm font-medium text-gray-300">{label}</label>}
      <input
        className={`w-full bg-gray-900/50 border border-gray-700 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-${currentTheme.ring} focus:border-${currentTheme.primary} transition-all duration-200 placeholder-gray-600 ${className}`}
        {...props}
      />
    </div>
  );
};

export const Select = ({ label, options, className = '', ...props }) => {
  const { currentTheme } = useTheme();
  return (
    <div className="space-y-1 w-full">
      {label && <label className="text-sm font-medium text-gray-300">{label}</label>}
      <select
        className={`w-full bg-gray-900/50 border border-gray-700 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-${currentTheme.ring} focus:border-${currentTheme.primary} transition-all duration-200 ${className}`}
        {...props}
      >
        <option value="" className="bg-gray-900 text-gray-400">Pilih...</option>
        {options.map((opt, idx) => (
          <option key={idx} value={opt} className="bg-gray-900 text-white">{opt}</option>
        ))}
      </select>
    </div>
  );
};

export const Button = ({ children, variant = 'primary', className = '', icon: Icon, ...props }) => {
  const { currentTheme } = useTheme();
  const variants = {
    primary: `bg-${currentTheme.primary} hover:bg-${currentTheme.hover} text-white shadow-lg shadow-${currentTheme.primary}/20`,
    secondary: 'bg-gray-800 hover:bg-gray-700 text-white border border-gray-700',
    danger: 'bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20',
  };

  return (
    <button
      className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      {...props}
    >
      {Icon && <Icon size={18} />}
      <span>{children}</span>
    </button>
  );
};

export const Modal = ({ isOpen, onClose, title, children }) => {
  const { currentTheme } = useTheme();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className={`bg-gray-950 border border-${currentTheme.border} rounded-2xl w-full max-w-md overflow-hidden shadow-2xl`}>
        <div className={`p-4 border-b border-gray-800 flex justify-between items-center bg-${currentTheme.bg}`}>
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};