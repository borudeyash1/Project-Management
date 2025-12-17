import { useEffect } from 'react';

/**
 * Custom hook to enable data refresh when the header refresh button is clicked
 * @param refreshCallback - Function to call when refresh is triggered
 * @param deps - Dependencies array for the callback
 */
export const useRefreshData = (refreshCallback: () => void, deps: any[] = []) => {
  useEffect(() => {
    const handleRefresh = () => {
      console.log('🔄 Refreshing data...');
      refreshCallback();
    };

    window.addEventListener('refreshData', handleRefresh);
    return () => window.removeEventListener('refreshData', handleRefresh);
  }, [refreshCallback, ...deps]);
};
