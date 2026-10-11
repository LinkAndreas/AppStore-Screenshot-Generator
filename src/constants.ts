import { BEZELS, getBezelSpec, type BezelSpec, type DeviceType } from './shared/layout';

// Vite resolves every bezel PNG to a hashed asset URL; images load only when a frame is shown.
const bezelFiles = import.meta.glob('./assets/Bezels/**/*.png', { eager: true, import: 'default' }) as Record<string, string>;

const BEZEL_URLS = new Map(BEZELS.map(b => [b.name, bezelFiles[`./assets/Bezels/${b.file}`]]));

for (const [name, url] of BEZEL_URLS) {
  if (!url) console.error(`Bezel asset missing for "${name}"`);
}

/** The bezel stored on a screen with its asset URL; unknown names fall back to the device default. */
export const resolveBezel = (name: string | undefined, device: DeviceType): BezelSpec & { url: string } => {
  const spec = getBezelSpec(name, device);
  return { ...spec, url: BEZEL_URLS.get(spec.name) ?? '' };
};

export { SCREEN_DIMENSIONS } from './shared/layout';
