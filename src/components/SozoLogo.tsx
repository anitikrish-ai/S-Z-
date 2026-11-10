import React from 'react';

interface SozoLogoProps {
  variant?: 'mark' | 'full' | 'image';
  className?: string;
  size?: number;
}

export const SozoLogo: React.FC<SozoLogoProps> = ({
  variant = 'mark',
  className = '',
  size = 28,
}) => {
  if (variant === 'image') {
    return (
      <img
        src="/sozo-logo.png"
        alt="SŌZŌ Studio"
        className={`object-contain ${className}`}
        style={{ height: `${size}px` }}
      />
    );
  }

  // Precision vector SVG of the SŌZŌ "S" mark and lockup
  if (variant === 'mark') {
    return (
      <svg
        viewBox="0 0 100 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: `${size}px`, height: `${(size * 0.8)}px` }}
        className={`shrink-0 ${className}`}
      >
        {/* Top Purple Stylized Wing */}
        <path
          d="M 48 12 C 58 12, 78 12, 84 12 C 87 12, 89 15, 87 18 L 81 26 C 80 27, 78 28, 76 28 L 52 28 C 48 28, 45 30, 47 34 L 54 44 L 42 44 L 32 30 C 30 27, 31 23, 34 20 L 44 14 C 45 13, 46 12, 48 12 Z"
          fill="#8B5CF6"
        />
        {/* Bottom Interlocking White Wing */}
        <path
          d="M 52 68 C 42 68, 22 68, 16 68 C 13 68, 11 65, 13 62 L 19 54 C 20 53, 22 52, 24 52 L 48 52 C 52 52, 55 50, 53 46 L 46 36 L 58 36 L 68 50 C 70 53, 69 57, 66 60 L 56 66 C 55 67, 54 68, 52 68 Z"
          fill="#FFFFFF"
        />
      </svg>
    );
  }

  // Full Wordmark + Icon Lockup
  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      <SozoLogo variant="mark" size={size} />
      <div className="flex flex-col justify-center leading-none">
        <span className="font-bold tracking-[0.2em] text-[#F5F5F7] text-sm font-sans uppercase">
          SŌZŌ
        </span>
        <div className="flex items-center gap-1 mt-0.5">
          <div className="w-2.5 h-[1.5px] bg-[#8B5CF6]" />
          <span className="text-[8px] font-semibold tracking-[0.3em] text-[#96969F] uppercase">
            STUDIO
          </span>
          <div className="w-2.5 h-[1.5px] bg-[#8B5CF6]" />
        </div>
      </div>
    </div>
  );
};

