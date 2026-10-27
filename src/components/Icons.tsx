import React from 'react';

interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

/**
 * Isotipo elegante y minimalista para BelGrano Café.
 * Diseño geométrico contemporáneo de taza de especialidad, grano de café y vapor sutil.
 */
export const MonogramLogo: React.FC<IconProps> = ({ size = 42, className, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    role="img"
    aria-label="Isotipo BelGrano Café"
    {...props}
  >
    {/* Base circular estilizada */}
    <circle cx="24" cy="24" r="22" className="logo-ring-outer" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.3" />
    <circle cx="24" cy="24" r="19.5" className="logo-ring-inner" stroke="#9E4712" strokeWidth="1" />
    
    {/* Silueta minimalista de taza de café de especialidad */}
    <path
      d="M15 22C15 28.5 19 32 24 32C29 32 33 28.5 33 22H15Z"
      className="logo-cup-body"
      fill="currentColor"
      fillOpacity="0.15"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinejoin="round"
    />
    
    {/* Asa ergonómica de la taza */}
    <path
      d="M33 23.5C35.5 23.5 37 25 37 27C37 29 35.5 30.5 33 30.5"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
    />
    
    {/* Plato base sutil */}
    <path
      d="M17 35H31"
      stroke="#9E4712"
      strokeWidth="1.75"
      strokeLinecap="round"
    />
    
    {/* Ondas estilizadas de aroma y grano de café central */}
    <path
      d="M21 13.5C20.5 15.5 21.5 17 21 18.5"
      stroke="#9E4712"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M27 13.5C26.5 15.5 27.5 17 27 18.5"
      stroke="#9E4712"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M24 11.5C23.5 14 24.5 16 24 18.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

export const WarningIcon: React.FC<IconProps> = ({ size = 18, className, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
    {...props}
  >
    <path
      d="M10 2L18.66 17H1.34L10 2Z"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <line x1="10" y1="8" x2="10" y2="12" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    <circle cx="10" cy="14.5" r="1" fill="currentColor" />
  </svg>
);

export const InfoIcon: React.FC<IconProps> = ({ size = 18, className, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
    {...props}
  >
    <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.75" />
    <circle cx="10" cy="6.5" r="1" fill="currentColor" />
    <line x1="10" y1="9.5" x2="10" y2="14" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
  </svg>
);

export const CheckIcon: React.FC<IconProps> = ({ size = 18, className, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
    {...props}
  >
    <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.75" />
    <path
      d="M6.5 10.2L8.8 12.5L13.5 7.8"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const CoffeeBeanIcon: React.FC<IconProps> = ({ size = 18, className, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
    {...props}
  >
    <path
      d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2Z"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <path
      d="M12 4C13.5 7.5 10.5 11 12 14.5C13.5 18 11.5 20 12 20"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

export const ReceiptIcon: React.FC<IconProps> = ({ size = 20, className, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
    {...props}
  >
    <path
      d="M4 2V22L7 20L10 22L13 20L16 22L19 20L20 22V2H4Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    <line x1="8" y1="7" x2="16" y2="7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="8" y1="11" x2="16" y2="11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="8" y1="15" x2="13" y2="15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);
