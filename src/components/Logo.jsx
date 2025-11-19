import React from 'react';

export default function Logo({ size = 32, showText = false }) {
  return (
    <div 
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '12px',
        minWidth: size,
        minHeight: size
      }}
    >
      {/* SVG Logo - Heart with Medical Cross */}
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        style={{ minWidth: size, minHeight: size }}
      >
        {/* Heart shape */}
        <path
          d="M50 85 C50 85, 20 60, 20 40 C20 25, 30 15, 40 15 C45 15, 48 18, 50 22 C52 18, 55 15, 60 15 C70 15, 80 25, 80 40 C80 60, 50 85, 50 85 Z"
          fill="none"
          stroke="#5B8DBE"
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
          fill="#5B8DBE"
        />
        
        {/* Vertical bar */}
        <rect
          x="47"
          y="35"
          width="6"
          height="24"
          rx="1"
          fill="#5B8DBE"
        />
      </svg>

      {showText && (
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
          <span style={{ 
            fontSize: size > 40 ? '1.5rem' : '1.2rem', 
            fontWeight: 'bold', 
            color: '#5B8DBE',
            letterSpacing: '-0.5px'
          }}>
            MedTracker
          </span>
          <span style={{ 
            fontSize: size > 40 ? '0.85rem' : '0.75rem', 
            color: '#999',
            marginTop: '2px'
          }}>
            Medicine Tracker
          </span>
        </div>
      )}
    </div>
  );
}
