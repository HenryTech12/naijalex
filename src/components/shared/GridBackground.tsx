import React from 'react';

interface GridBackgroundProps {
  opacity?: string;
}

export const GridBackground: React.FC<GridBackgroundProps> = ({ opacity = '0.06' }) => {
  return (
    <div
      className="absolute inset-0"
      style={{
        opacity: parseFloat(opacity),
        backgroundImage:
          'linear-gradient(rgba(29,158,117,1) 1px, transparent 1px), linear-gradient(90deg, rgba(29,158,117,1) 1px, transparent 1px)',
        backgroundSize: '56px 56px',
      }}
    />
  );
};
