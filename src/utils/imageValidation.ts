import { SCREEN_DIMENSIONS, type DeviceType } from '../shared/layout';

export const validateImageDimensions = (file: File, activeDeviceType: DeviceType): Promise<boolean> => {
  return new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const { width, height } = SCREEN_DIMENSIONS[activeDeviceType];
      resolve(img.width === width && img.height === height);
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(false);
    };
    img.src = objectUrl;
  });
};
