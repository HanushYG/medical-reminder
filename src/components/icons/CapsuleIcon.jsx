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
        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14c-3.88 0-7-3.12-7-7s3.12-7 7-7 7 3.12 7 7-3.12 7-7 7z"
      />
    </svg>
  );
}
