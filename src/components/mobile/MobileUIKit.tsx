'use client';

import React from 'react';

/**
 * Componentes de UI Móvil Premium para CotizaYa
 * Inspirados en Luminio pero con mejor UX y animaciones fluidas
 */

// ============ Botones Premium ============

export interface PremiumButtonProps {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  icon?: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}

export function PremiumButton({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  icon,
  loading = false,
  disabled = false,
  onClick,
  children,
}: PremiumButtonProps) {
  const baseStyles = 'font-semibold rounded-lg transition-all duration-300 flex items-center justify-center gap-2 active:scale-95';

  const variants = {
    primary: 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-900 shadow-md hover:shadow-lg',
    success: 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl',
    danger: 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl',
    ghost: 'bg-transparent hover:bg-gray-100 text-gray-900 border border-gray-300',
  };

  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-6 py-4 text-lg',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${
        disabled || loading ? 'opacity-50 cursor-not-allowed' : ''
      }`}
    >
      {loading ? (
        <>
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          Cargando...
        </>
      ) : (
        <>
          {icon}
          {children}
        </>
      )}
    </button>
  );
}

// ============ Cards Premium ============

export interface PremiumCardProps {
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  highlighted?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}

export function PremiumCard({
  title,
  subtitle,
  icon,
  highlighted = false,
  children,
  onClick,
}: PremiumCardProps) {
  return (
    <div
      onClick={onClick}
      className={`rounded-xl p-4 transition-all duration-300 cursor-pointer ${
        highlighted
          ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-300 shadow-lg'
          : 'bg-white border border-gray-200 hover:shadow-lg hover:border-gray-300'
      }`}
    >
      {(title || icon) && (
        <div className="flex items-center gap-3 mb-3">
          {icon && <div className="text-2xl">{icon}</div>}
          <div>
            {title && <h3 className="font-bold text-gray-900">{title}</h3>}
            {subtitle && <p className="text-xs text-gray-600">{subtitle}</p>}
          </div>
        </div>
      )}
      {children}
    </div>
  );
}

// ============ Input Premium ============

export interface PremiumInputProps {
  label?: string;
  placeholder?: string;
  value?: string | number;
  onChange?: (value: string) => void;
  type?: 'text' | 'number' | 'email' | 'tel';
  icon?: React.ReactNode;
  suffix?: string;
  error?: string;
  disabled?: boolean;
}

export function PremiumInput({
  label,
  placeholder,
  value,
  onChange,
  type = 'text',
  icon,
  suffix,
  error,
  disabled = false,
}: PremiumInputProps) {
  return (
    <div className="w-full">
      {label && <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>}
      <div className="relative">
        {icon && <div className="absolute left-3 top-3 text-gray-500">{icon}</div>}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full px-4 py-3 ${icon ? 'pl-10' : ''} ${suffix ? 'pr-12' : ''} rounded-lg border-2 transition-all ${
            error
              ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
              : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
          } focus:outline-none focus:ring-4 disabled:bg-gray-100 disabled:cursor-not-allowed`}
        />
        {suffix && <span className="absolute right-3 top-3 text-gray-600 font-semibold">{suffix}</span>}
      </div>
      {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
    </div>
  );
}

// ============ Tabs Premium ============

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: number;
}

export interface PremiumTabsProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  children: React.ReactNode;
}

export function PremiumTabs({ tabs, activeTab, onTabChange, children }: PremiumTabsProps) {
  return (
    <div>
      <div className="flex gap-2 border-b-2 border-gray-200 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`px-4 py-3 font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === tab.id
                ? 'text-blue-600 border-b-2 border-blue-600 -mb-0.5'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.icon}
            {tab.label}
            {tab.badge !== undefined && (
              <span className="ml-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>
      <div className="mt-4">{children}</div>
    </div>
  );
}

// ============ Modal Premium ============

export interface PremiumModalProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function PremiumModal({ isOpen, title, onClose, children, footer }: PremiumModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md max-h-[90vh] overflow-y-auto shadow-2xl animate-in slide-in-from-bottom-5 sm:slide-in-from-center-5">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-4 border-b border-gray-200 bg-white">
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-900 transition p-1"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-4">{children}</div>

        {/* Footer */}
        {footer && <div className="border-t border-gray-200 p-4 bg-gray-50">{footer}</div>}
      </div>
    </div>
  );
}

// ============ Badge Premium ============

export interface PremiumBadgeProps {
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'default';
  children: React.ReactNode;
}

export function PremiumBadge({ variant = 'default', children }: PremiumBadgeProps) {
  const variants = {
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
    default: 'bg-gray-100 text-gray-800',
  };

  return (
    <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${variants[variant]}`}>
      {children}
    </span>
  );
}

// ============ Spinner Premium ============

export function PremiumSpinner() {
  return (
    <div className="flex items-center justify-center">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-4 border-gray-200" />
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 animate-spin" />
      </div>
    </div>
  );
}

// ============ Alert Premium ============

export interface PremiumAlertProps {
  type?: 'success' | 'warning' | 'danger' | 'info';
  title?: string;
  message: string;
  onClose?: () => void;
}

export function PremiumAlert({
  type = 'info',
  title,
  message,
  onClose,
}: PremiumAlertProps) {
  const icons = {
    success: '✓',
    warning: '⚠',
    danger: '✕',
    info: 'ℹ',
  };

  const colors = {
    success: 'bg-green-50 border-green-300 text-green-900',
    warning: 'bg-yellow-50 border-yellow-300 text-yellow-900',
    danger: 'bg-red-50 border-red-300 text-red-900',
    info: 'bg-blue-50 border-blue-300 text-blue-900',
  };

  return (
    <div className={`rounded-lg border-l-4 p-4 ${colors[type]} flex items-start justify-between gap-3`}>
      <div className="flex items-start gap-3">
        <span className="text-xl font-bold">{icons[type]}</span>
        <div>
          {title && <h4 className="font-bold">{title}</h4>}
          <p className="text-sm">{message}</p>
        </div>
      </div>
      {onClose && (
        <button onClick={onClose} className="text-xl opacity-50 hover:opacity-100 transition">
          ✕
        </button>
      )}
    </div>
  );
}
