// Web fallback for React Native Vision Camera
// This allows the app to build for web without camera native dependencies
// For real camera access on web, use MediaDevices API

console.warn('React Native Vision Camera not available on web. Using mock implementation.');
console.info('To enable camera on web, implement MediaDevices getUserMedia API.');

// Mock Camera component
export const Camera = ({children, ...props}) => {
  return children || null;
};

// Mock useCameraDevices hook
export const useCameraDevices = () => ({
  back: null,
  front: null,
});

// Mock useCameraPermission hook
export const useCameraPermission = () => ({
  hasPermission: false,
  requestPermission: async () => false,
});

// Mock takePhoto method
Camera.prototype.takePhoto = async () => {
  throw new Error('Camera not available on web');
};

export default {
  Camera,
  useCameraDevices,
  useCameraPermission,
};
