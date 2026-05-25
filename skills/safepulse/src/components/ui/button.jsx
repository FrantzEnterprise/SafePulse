import React from 'react';

export function Button({ children, variant = 'default', className = '', onClick, ...props }) {
  const baseStyle = 'inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition-colors focus:outline-none disabled:pointer-events-none disabled:opacity-50';
  const variants = {
    default: 'bg-slate-900 text-accent hover:bg-slate-800',
    outline: 'border border-slate-300 bg-white text-slate-900 hover:bg-slate-100',
    ghost: 'text-slate-700 hover:bg-slate-100',
    destructive: 'bg-red-600 text-white hover:bg-red-700',
  };
  return (
    <button className={`${baseStyle} ${variants[variant] || variants.default} ${className}`} onClick={onClick} {...props}>
      {children}
    </button>
  );
}
