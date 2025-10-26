// Helper utility to set custom device ID in localStorage
// This should be run once to set your device ID

export const setMyDeviceId = () => {
  const myDeviceId = '37D98603-981B-493F-9A74-C3DD4A3AEE48';
  localStorage.setItem('customDeviceId', myDeviceId);
  console.log('✅ Device ID set successfully:', myDeviceId);
  console.log('You can now access the admin portal');
};

// Call this function from browser console to set your device ID:
// import { setMyDeviceId } from './utils/setDeviceId';
// setMyDeviceId();

// Or run this in browser console:
// localStorage.setItem('customDeviceId', '37D98603-981B-493F-9A74-C3DD4A3AEE48');

// Make it available globally for easy access
if (typeof window !== 'undefined') {
  (window as any).setMyDeviceId = setMyDeviceId;
}
