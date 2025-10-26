// Helper utility to set custom device ID in localStorage
// This should be run once to set your device ID

export const setMyDeviceId = () => {
  const myDeviceId = 'ee16529e29783f94017b264bdf4446d226dfc6506ba02cf0c4c8b8a73c6e9f5a';
  localStorage.setItem('customDeviceId', myDeviceId);
  console.log('✅ Device ID set successfully:', myDeviceId);
  console.log('You can now access the admin portal');
};

// Call this function from browser console to set your device ID:
// import { setMyDeviceId } from './utils/setDeviceId';
// setMyDeviceId();

// Or run this in browser console:
// localStorage.setItem('customDeviceId', 'ee16529e29783f94017b264bdf4446d226dfc6506ba02cf0c4c8b8a73c6e9f5a');

// Make it available globally for easy access
if (typeof window !== 'undefined') {
  (window as any).setMyDeviceId = setMyDeviceId;
}
