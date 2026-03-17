import React from 'react';

const Logo = ({ size = 40, className = "", style = {} }: { size?: number, className?: string, style?: React.CSSProperties }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
    >
      {/* Outer Sphere/Circle with Gradient */}
      <defs>
        <linearGradient id="sphereGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0ea5e9" /> {/* Cyan */}
          <stop offset="100%" stopColor="#2563eb" /> {/* Blue */}
        </linearGradient>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2" />
        </filter>
      </defs>

      {/* Main Sphere Body */}
      <circle cx="50" cy="50" r="45" fill="url(#sphereGradient)" />
      
      {/* Gloss Effect */}
      <ellipse cx="50" cy="30" rx="30" ry="15" fill="white" fillOpacity="0.2" />

      {/* House Symbol Inside */}
      <path 
        d="M50 25L25 45V75H40V55H60V75H75V45L50 25Z" 
        fill="white" 
      />

      {/* Stylized 'S' curve around the sphere */}
      <path 
        d="M20 50C20 30 40 15 50 15M80 50C80 70 60 85 50 85" 
        stroke="white" 
        strokeWidth="4" 
        strokeLinecap="round" 
        strokeOpacity="0.6"
      />
    </svg>
  );
};

export default Logo;
