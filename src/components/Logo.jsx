import React from 'react';

export default function Logo({ size = 32 }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      style={{ minWidth: size, minHeight: size }}
    >
      {/* Heart shape - outline only */}
      <path
        d="M50 85 C50 85, 20 60, 20 40 C20 25, 30 15, 40 15 C45 15, 48 18, 50 22 C52 18, 55 15, 60 15 C70 15, 80 25, 80 40 C80 60, 50 85, 50 85 Z"
        fill="none"
        stroke="url(#heartGradient)"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Medical cross inside heart */}
      {/* Horizontal bar */}
      <rect
        x="38"
        y="44"
        width="24"
        height="6"
        rx="1"
        fill="white"
      />
      
      {/* Vertical bar */}
      <rect
        x="47"
        y="35"
        width="6"
        height="24"
        rx="1"
        fill="white"
      />
      
      {/* Gradient definition */}
      <defs>
        <linearGradient id="heartGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#00d4aa', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#00b894', stopOpacity: 1 }} />
        </linearGradient>
      </defs>
    </svg>
  );
}
