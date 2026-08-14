import React from 'react';

/**
 * CA Emblem SVG Icon
 * Features the signature stylized CA monogram with gold verification tick and rich forest gradient.
 */
export const CAEmblem = ({ size = 36, className = '', idPrefix = 'ca-emblem' }) => {
  const bgId = `${idPrefix}-bg`;
  const goldId = `${idPrefix}-gold`;
  const goldBrightId = `${idPrefix}-gold-bright`;
  const shadowId = `${idPrefix}-shadow`;
  const glowId = `${idPrefix}-glow`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`flex-shrink-0 select-none ${className}`}
      aria-label="CA Emblem"
    >
      <defs>
        {/* Background Gradient */}
        <linearGradient id={bgId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0A221E" />
          <stop offset="50%" stopColor="#0F2F2A" />
          <stop offset="100%" stopColor="#1A4A42" />
        </linearGradient>

        {/* Gold Foil Gradient */}
        <linearGradient id={goldId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F3E5AB" />
          <stop offset="25%" stopColor="#DFC18A" />
          <stop offset="50%" stopColor="#C4A574" />
          <stop offset="75%" stopColor="#B38B50" />
          <stop offset="100%" stopColor="#9A7B4F" />
        </linearGradient>

        {/* Gold Bright Accent */}
        <linearGradient id={goldBrightId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#FFEBB3" />
          <stop offset="50%" stopColor="#DFC18A" />
          <stop offset="100%" stopColor="#C4A574" />
        </linearGradient>

        {/* Soft Drop Shadow */}
        <filter id={shadowId} x="-10%" y="-10%" width="130%" height="130%">
          <feDropShadow dx="0" dy="4" stdDeviation="5" floodColor="#000000" floodOpacity="0.35" />
        </filter>

        {/* Glow */}
        <filter id={glowId} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Base Rounded Shield */}
      <rect width="512" height="512" rx="128" fill={`url(#${bgId})`} />

      {/* Outer Metallic Gold Ring */}
      <rect
        x="16"
        y="16"
        width="480"
        height="480"
        rx="114"
        fill="none"
        stroke={`url(#${goldId})`}
        strokeWidth="7"
        opacity="0.85"
      />

      {/* Inner Accent Ring */}
      <rect
        x="28"
        y="28"
        width="456"
        height="456"
        rx="102"
        fill="none"
        stroke="#A8C5BE"
        strokeWidth="1.5"
        opacity="0.25"
        strokeDasharray="8 6"
      />

      {/* Monogram Group */}
      <g filter={`url(#${shadowId})`}>
        {/* Letter 'C' */}
        <path
          d="M 230 150 
             C 150 150, 95 195, 95 260 
             C 95 325, 150 370, 230 370 
             C 265 370, 292 360, 312 346 
             L 295 310 
             C 278 322, 258 330, 230 330 
             C 176 330, 138 298, 138 260 
             C 138 222, 176 190, 230 190 
             C 258 190, 278 198, 295 210 
             L 312 174 
             C 292 160, 265 150, 230 150 Z"
          fill="#FFFFFF"
        />

        {/* Letter 'A' */}
        <path
          d="M 335 152 
             L 270 368 
             L 312 368 
             L 326 318 
             L 394 318 
             L 408 368 
             L 450 368 
             L 385 152 
             L 335 152 Z 
             M 360 200 
             L 384 282 
             L 336 282 
             Z"
          fill="#FFFFFF"
        />

        {/* Dynamic Verification Swash / Checkmark across 'A' */}
        <path
          d="M 285 304 
             L 335 348 
             L 442 225 
             C 445 221, 440 216, 434 220 
             L 332 316 
             L 295 284 
             C 289 279, 281 288, 285 294 
             Z"
          fill={`url(#${goldBrightId})`}
          filter={`url(#${glowId})`}
        />

        {/* Golden Accent Nodes */}
        <circle cx="360" cy="120" r="10" fill={`url(#${goldId})`} />
        <circle cx="330" cy="122" r="5" fill={`url(#${goldId})`} opacity="0.8" />
        <circle cx="390" cy="122" r="5" fill={`url(#${goldId})`} opacity="0.8" />
      </g>

      {/* Bottom Subtitle / Seal Line */}
      <g transform="translate(256, 424)" textAnchor="middle">
        <path d="M -110 -2 L 110 -2" stroke={`url(#${goldId})`} strokeWidth="2" opacity="0.7" />
        <text
          y="18"
          fill={`url(#${goldId})`}
          fontFamily="'DM Sans', system-ui, sans-serif"
          fontSize="20"
          fontWeight="700"
          letterSpacing="6"
        >
          ACCOUNTANT
        </text>
      </g>
    </svg>
  );
};

/**
 * CALogo Component
 * Configurable CA Brand Logo supporting multiple layouts and color themes.
 */
const CALogo = ({
  variant = 'full', // 'mark' | 'compact' | 'full'
  theme = 'dark', // 'dark' (for light bg) | 'light' (for dark bg)
  size = 'md', // 'sm' | 'md' | 'lg' | 'xl' | number
  subtitle,
  className = '',
}) => {
  const sizeMap = {
    xs: 24,
    sm: 32,
    md: 40,
    lg: 52,
    xl: 64,
  };

  const pixelSize = typeof size === 'number' ? size : sizeMap[size] || 40;

  if (variant === 'mark' || variant === 'icon') {
    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        <CAEmblem size={pixelSize} idPrefix={`ca-mark-${pixelSize}`} />
      </div>
    );
  }

  const isLight = theme === 'light';

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      <CAEmblem size={pixelSize} idPrefix={`ca-logo-${pixelSize}`} />

      <div className="flex flex-col justify-center">
        <div className="flex items-baseline gap-1.5 leading-none">
          <span
            className={`font-display font-bold tracking-tight ${
              isLight ? 'text-parchment' : 'text-forest'
            } ${pixelSize >= 48 ? 'text-2xl' : pixelSize >= 36 ? 'text-xl' : 'text-base'}`}
          >
            CA <span className="text-brass">Hub</span>
          </span>
        </div>

        {variant === 'full' && (
          <p
            className={`text-[9px] sm:text-[10px] tracking-[0.2em] uppercase font-medium mt-1 ${
              isLight ? 'text-brass-soft opacity-90' : 'text-forest-400'
            }`}
          >
            {subtitle || 'Chartered Accountants'}
          </p>
        )}
      </div>
    </div>
  );
};

export default CALogo;
