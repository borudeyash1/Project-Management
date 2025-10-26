// Device fingerprinting utility
export const getDeviceFingerprint = async (): Promise<string> => {
  try {
    // Try to get stored device ID first
    let deviceId = localStorage.getItem('deviceId');
    
    if (deviceId) {
      return deviceId;
    }

    // Generate a unique device fingerprint based on multiple factors
    const fingerprint = await generateFingerprint();
    
    // Store it for future use
    localStorage.setItem('deviceId', fingerprint);
    
    return fingerprint;
  } catch (error) {
    console.error('Error getting device fingerprint:', error);
    return 'unknown';
  }
};

const generateFingerprint = async (): Promise<string> => {
  const components: string[] = [];

  // 1. User Agent
  components.push(navigator.userAgent);

  // 2. Screen Resolution
  components.push(`${window.screen.width}x${window.screen.height}x${window.screen.colorDepth}`);

  // 3. Timezone
  components.push(Intl.DateTimeFormat().resolvedOptions().timeZone);

  // 4. Language
  components.push(navigator.language);

  // 5. Platform
  components.push(navigator.platform);

  // 6. Hardware Concurrency (CPU cores)
  components.push(String(navigator.hardwareConcurrency || 0));

  // 7. Device Memory (if available)
  components.push(String((navigator as any).deviceMemory || 0));

  // 8. Canvas Fingerprint
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillStyle = '#f60';
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = '#069';
    ctx.fillText('TaskFlowHQ', 2, 15);
    components.push(canvas.toDataURL());
  }

  // 9. WebGL Fingerprint
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  if (gl) {
    const debugInfo = (gl as any).getExtension('WEBGL_debug_renderer_info');
    if (debugInfo) {
      components.push((gl as any).getParameter(debugInfo.UNMASKED_VENDOR_WEBGL));
      components.push((gl as any).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL));
    }
  }

  // 10. Plugins
  const plugins = Array.from(navigator.plugins || [])
    .map(p => p.name)
    .join(',');
  components.push(plugins);

  // Combine all components and hash them
  const fingerprint = await hashString(components.join('|||'));
  
  return fingerprint;
};

// Simple hash function
const hashString = async (str: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
};

// Get MAC address (Note: This is not directly accessible in browsers for security reasons)
// We'll use the device fingerprint as a unique identifier instead
export const getMacAddress = (): string => {
  // MAC address is not accessible in browsers for privacy/security reasons
  // We'll use a stored custom device ID or the fingerprint
  return localStorage.getItem('customDeviceId') || 'not-available';
};

// Set custom device ID (for admin to manually set)
export const setCustomDeviceId = (deviceId: string): void => {
  localStorage.setItem('customDeviceId', deviceId);
};

// Get all device information
export const getDeviceInfo = async () => {
  const deviceId = await getDeviceFingerprint();
  const customDeviceId = localStorage.getItem('customDeviceId') || null;
  
  return {
    deviceId,
    customDeviceId,
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    language: navigator.language,
    screenResolution: `${window.screen.width}x${window.screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    timestamp: new Date().toISOString()
  };
};
