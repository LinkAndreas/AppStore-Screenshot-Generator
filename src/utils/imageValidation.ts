import { DEVICES, screenshotFits, type DeviceType } from '../shared/layout';

const readImageSize = (file: File): Promise<{ width: number; height: number } | null> =>
  new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(null);
    };
    img.src = objectUrl;
  });

/** Screenshot sizes accepted for a device, for messages: "1320 × 2868" or "2880 × 1800, 2560 × 1600, …". */
export const acceptedSizesText = (device: DeviceType) =>
  DEVICES[device].acceptedScreenshots.map(s => `${s.width} × ${s.height}`).join(', ');

/**
 * Checks an uploaded screenshot against the device's App Store size. Returns null when it fits,
 * otherwise the parameters for the "error.dimension" message.
 */
export const checkScreenshot = async (file: File, device: DeviceType): Promise<Record<string, string> | null> => {
  const size = await readImageSize(file);
  if (size && screenshotFits(device, size.width, size.height)) return null;
  return {
    device: DEVICES[device].label,
    size: acceptedSizesText(device),
    actual: size ? `${size.width} × ${size.height}` : '?',
  };
};
