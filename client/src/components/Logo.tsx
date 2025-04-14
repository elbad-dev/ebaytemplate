import React from 'react';

export function Logo({ size = 'default', className = '' }: { size?: 'small' | 'default' | 'large', className?: string }) {
  const sizeClasses = {
    small: 'w-8 h-8',
    default: 'w-12 h-12',
    large: 'w-24 h-24',
  };
  
  const sizePx = size === 'small' ? 32 : size === 'large' ? 96 : 48;
  
  return (
    <div className={`relative ${sizeClasses[size]} ${className}`}>
      <svg 
        width={sizePx} 
        height={sizePx} 
        viewBox="0 0 48 48" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Background shapes */}
        <rect x="2" y="6" width="44" height="36" rx="3" fill="url(#paint0_linear)" />
        <rect x="6" y="10" width="36" height="28" rx="2" fill="white" />
        
        {/* Template elements */}
        <rect x="9" y="14" width="15" height="12" rx="1" fill="#E2F2FF" />
        <rect x="9" y="28" width="30" height="2" rx="1" fill="#A0D7FF" />
        <rect x="9" y="32" width="20" height="2" rx="1" fill="#A0D7FF" />
        <rect x="26" y="14" width="13" height="4" rx="1" fill="#E2F2FF" />
        <rect x="26" y="20" width="13" height="2" rx="1" fill="#E2F2FF" />
        <rect x="26" y="24" width="8" height="2" rx="1" fill="#E2F2FF" />
        
        {/* Edit pen */}
        <path d="M34 10L38 14L36 16L32 12L34 10Z" fill="#3490DC" />
        <path d="M31 13L35 17L28 20L31 13Z" fill="#90CDF4" />
        
        {/* Gradient definition */}
        <defs>
          <linearGradient id="paint0_linear" x1="2" y1="6" x2="46" y2="42" gradientUnits="userSpaceOnUse">
            <stop stopColor="#3490DC" />
            <stop offset="1" stopColor="#6366F1" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}