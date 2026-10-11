import { useId } from 'react';

/**
 * The Vitrine mark: a glass display case (vitrine) showing a phone on a plinth.
 * Same drawing as public/favicon.svg.
 */
export const BrandMark = ({ size = 40, className }: { size?: number; className?: string }) => {
  const gradient = `vitrine-bg-${useId().replace(/:/g, '')}`;
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id={gradient} x1="32" y1="0" x2="32" y2="64" gradientUnits="userSpaceOnUse">
          <stop stopColor="#8E8BFF" />
          <stop offset="1" stopColor="#4A46D8" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="14.5" fill={`url(#${gradient})`} />
      <path d="M18.5 48.5V27.5a13.5 13.5 0 0 1 27 0v21" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" />
      <path d="M23.6 22.6a9.2 9.2 0 0 1 5.6-4.4" stroke="#fff" strokeOpacity=".55" strokeWidth="2.2" strokeLinecap="round" />
      <rect x="26.5" y="26" width="11" height="19.5" rx="2.8" fill="#fff" />
      <rect x="30" y="28.2" width="4" height="1.5" rx=".75" fill="#5B57E3" />
      <path d="M13.5 49.5h37" stroke="#fff" strokeWidth="3.6" strokeLinecap="round" />
    </svg>
  );
};
