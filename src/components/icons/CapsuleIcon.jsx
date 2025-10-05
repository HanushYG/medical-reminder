import React from 'react';

export default function CapsuleIcon({ style, className }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="currentColor" 
      style={style}
      className={className}
    >
      <path 
        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H5v-2h6v2zm4-4H5v-2h10v2zm0-4H5V6h10v2z"
      />
    </svg>
  );
}
