import React from 'react';

export default function DashboardIcon({ style, className }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      fill="none" 
      viewBox="0 0 24 24" 
      strokeWidth={1.5} 
      stroke="currentColor" 
      style={style}
      className={className}
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        d="M10.5 6a7.5 7.5 0 100 15 7.5 7.5 0 000-15zM10.5 6a7.5 7.5 0 00-7.5 7.5h15A7.5 7.5 0 0010.5 6z" 
      />
    </svg>
  );
}
