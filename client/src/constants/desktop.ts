export const DESKTOP_FLOW_STORAGE_KEY = 'saarthi-desktop-flow';
export const DESKTOP_PROTOCOL_URL = 'sartthi-desktop:auth';

export const markDesktopFlowIntent = () => {
  sessionStorage.setItem(DESKTOP_FLOW_STORAGE_KEY, 'true');
};

export const clearDesktopFlowIntent = () => {
  sessionStorage.removeItem(DESKTOP_FLOW_STORAGE_KEY);
};

export const hasDesktopFlowIntent = () => sessionStorage.getItem(DESKTOP_FLOW_STORAGE_KEY) === 'true';

export const getDesktopRedirect = () => {
  const redirect = sessionStorage.getItem('saarthi-desktop-redirect');
  return redirect || '/home';
};

export const setDesktopRedirect = (path: string) => {
  sessionStorage.setItem('saarthi-desktop-redirect', path);
};

export const buildDesktopDeviceInfo = () => {
  if (!isDesktopRuntime()) return undefined;
  return {
    runtime: 'desktop',
    platform: navigator.platform,
    userAgent: navigator.userAgent,
    language: navigator.language,
    timestamp: new Date().toISOString()
  };
};

export const isDesktopRuntime = () => typeof window !== 'undefined' && Boolean((window as any)?.electronAPI);

export const shouldHandleInDesktop = () => hasDesktopFlowIntent() || isDesktopRuntime();

export const redirectToDesktopSplash = () => {
  clearDesktopFlowIntent();
  if (isDesktopRuntime()) {
    const electronAPI = (window as any)?.electronAPI;
    if (electronAPI?.showSplash) {
      electronAPI.showSplash();
      return;
    }
    const shellUrl = '/desktop-shell?source=desktop';
    if (window.location.pathname !== shellUrl) {
      window.location.replace(shellUrl);
    }
    return;
  }
  window.location.href = DESKTOP_PROTOCOL_URL;
};
