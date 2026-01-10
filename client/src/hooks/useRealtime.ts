import { useContext } from 'react';
import { RealtimeContext } from '../context/RealtimeContext';

/**
 * Hook to access real-time Socket.IO connection
 * 
 * @example
 * const { socket, isConnected } = useRealtime();
 * 
 * useEffect(() => {
 *   socket?.on('notification:new', (notification) => {
 *     console.log('New notification:', notification);
 *   });
 *   
 *   return () => {
 *     socket?.off('notification:new');
 *   };
 * }, [socket]);
 */
export function useRealtime() {
    const context = useContext(RealtimeContext);

    if (!context) {
        throw new Error('useRealtime must be used within RealtimeProvider');
    }

    return context;
}
