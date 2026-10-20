import React from 'react';

export default function TruckSilhouette({ className = 'w-20 h-8' }) {
  return (
    <svg
      viewBox="0 0 100 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} text-gray-400 group-hover:text-gray-600 transition-colors`}
    >
      {/* Trailer body */}
      <rect x="25" y="8" width="70" height="18" rx="2" fill="#E5E5EA" stroke="#C7C7CC" strokeWidth="1.2" />
      
      {/* Trailer rear doors line */}
      <line x1="91" y1="8" x2="91" y2="26" stroke="#AEAEB2" strokeWidth="1" />
      
      {/* Hitch connection */}
      <rect x="20" y="21" width="6" height="3" fill="#8E8E93" />
      
      {/* Truck Cab */}
      <path
        d="M22 26V13C22 13 20 10 16 10H10C6 10 5 13 4 17L3 22C3 24 4 26 6 26H22Z"
        fill="#E5E5EA"
        stroke="#C7C7CC"
        strokeWidth="1.2"
      />
      {/* Cab Windshield */}
      <path
        d="M15 12H11C8.5 12 7.5 14 7 17H15V12Z"
        fill="#8E8E93"
      />
      {/* Wheels */}
      {/* Front wheel */}
      <circle cx="8" cy="27" r="4" fill="#2C2C2E" />
      <circle cx="8" cy="27" r="2" fill="#AEAEB2" />
      
      {/* Cab drive wheels */}
      <circle cx="21" cy="27" r="4" fill="#2C2C2E" />
      <circle cx="21" cy="27" r="2" fill="#AEAEB2" />
      
      {/* Trailer rear dual wheels */}
      <circle cx="75" cy="27" r="4" fill="#2C2C2E" />
      <circle cx="75" cy="27" r="2" fill="#AEAEB2" />
      
      <circle cx="85" cy="27" r="4" fill="#2C2C2E" />
      <circle cx="85" cy="27" r="2" fill="#AEAEB2" />
    </svg>
  );
}
