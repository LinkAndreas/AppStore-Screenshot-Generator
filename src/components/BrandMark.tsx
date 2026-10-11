import { useId } from 'react';

/**
 * The Storyframe mark: an App Store screenshot carousel, three screens with the middle one in
 * focus and page dots below. Same drawing as public/favicon.svg.
 */
export const BrandMark = ({ size = 40, className }: { size?: number; className?: string }) => {
  const gradient = `storyframe-bg-${useId().replace(/:/g, '')}`;
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id={gradient} x1="32" y1="0" x2="32" y2="64" gradientUnits="userSpaceOnUse">
          <stop stopColor="#8E8BFF" />
          <stop offset="1" stopColor="#4A46D8" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="14.5" fill={`url(#${gradient})`} />
      <rect x="7.5" y="19" width="12" height="24" rx="3" fill="#fff" fillOpacity=".5" />
      <rect x="44.5" y="19" width="12" height="24" rx="3" fill="#fff" fillOpacity=".5" />
      <rect x="22" y="12" width="20" height="38" rx="4.5" fill="#fff" />
      <rect x="28.5" y="15.2" width="7" height="2.2" rx="1.1" fill="#5B57E3" />
      <rect x="26" y="22" width="12" height="2.6" rx="1.3" fill="#5B57E3" fillOpacity=".9" />
      <rect x="27.5" y="27" width="9" height="1.8" rx=".9" fill="#5B57E3" fillOpacity=".45" />
      <rect x="26" y="32" width="12" height="13.5" rx="2" fill="#5B57E3" fillOpacity=".22" />
      <circle cx="27" cy="56" r="1.6" fill="#fff" fillOpacity=".5" />
      <circle cx="32" cy="56" r="1.6" fill="#fff" />
      <circle cx="37" cy="56" r="1.6" fill="#fff" fillOpacity=".5" />
    </svg>
  );
};
