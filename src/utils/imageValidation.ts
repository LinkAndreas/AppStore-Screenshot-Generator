export const validateImageDimensions = (file: File, activeDeviceType: 'iPhone' | 'iPad'): Promise<boolean> => {
  return new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      if (activeDeviceType === 'iPad') {
        resolve(img.width === 2064 && img.height === 2752);
      } else {
        // iPhone 17 Pro Max
        resolve(img.width === 1320 && img.height === 2868);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(false);
    };
    img.src = objectUrl;
  });
};
