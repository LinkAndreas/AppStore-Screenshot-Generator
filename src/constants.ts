// Use a relative glob from the src directory to catch bundled assets correctly
const bezelFiles = import.meta.glob('./assets/Bezels/**/*.png', { eager: true }) as Record<string, { default: string }>;

/**
 * Maps simple bezel names (e.g., "iPhone 17 Pro - Silver - Portrait") 
 * to their actual Vite-resolved URLs.
 */
export const BEZEL_URL_MAP: Record<string, string> = {};

Object.entries(bezelFiles).forEach(([key, module]) => {
  const parts = key.split('/');
  const name = parts[parts.length - 1].replace('.png', '');
  
  // Filter: If it's an iPhone, only keep Pro Max models
  if (name.includes('iPhone') && !name.includes('17 Pro Max')) return;
  // Filter: If it's an iPad, only keep 13-inch models
  if (name.includes('iPad') && !name.includes('13')) return;
  // Filter: Only keep Portrait orientation
  if (!name.includes('Portrait')) return;
  
  BEZEL_URL_MAP[name] = module.default;
});

// Sanity check for the console
if (Object.keys(BEZEL_URL_MAP).length === 0) {
  console.error('CRITICAL: No Bezel assets found in src/assets/Bezels!');
}

export const AVAILABLE_BEZELS = Object.keys(BEZEL_URL_MAP).sort((a, b) => {
  const isAIphone = a.includes('iPhone');
  const isBIphone = b.includes('iPhone');
  const isAPortrait = a.includes('Portrait');
  const isBPortrait = b.includes('Portrait');

  if (isAIphone && !isBIphone) return -1;
  if (!isAIphone && isBIphone) return 1;

  if (isAPortrait && !isBPortrait) return -1;
  if (!isAPortrait && isBPortrait) return 1;

  return a.localeCompare(b);
});

export const getBezelPath = (name: string) => {
  const path = BEZEL_URL_MAP[name];
  if (!path && name) {
    console.warn(`Bezel asset not found for: ${name}`);
  }
  return path || '';
}

export const getBezelCategories = (name: string) => {
  const nameLower = name.toLowerCase();
  const isIpad = nameLower.includes('ipad');
  const device = isIpad ? 'iPad' : 'iPhone';
  const isLandscape = nameLower.includes('landscape');
  const orientation = isLandscape ? 'Landscape' : 'Portrait';
  return { device, orientation };
}
export const getDefaultBezel = () => {
  const preferred = 'iPhone 17 Pro Max - Silver - Portrait';
  if (AVAILABLE_BEZELS.includes(preferred)) return preferred;
  return AVAILABLE_BEZELS.length > 0 ? AVAILABLE_BEZELS[0] : '';
};
export const SCREEN_DIMENSIONS = {
  iPhone: { width: 1320, height: 2868 },
  iPad: { width: 2064, height: 2752 }
};
