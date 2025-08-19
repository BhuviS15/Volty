import { useState, useEffect, useCallback } from 'react';
import { ElectricityPriceService } from '../services/electricityPriceService';
import { NotificationService } from '../services/notificationService';
import { BackgroundTaskService } from '../services/backgroundTaskService';

/**
 * Interface representing electricity price data with threshold status.
 */
interface PriceData {
  /** Price in cents per kWh */
  price: number;
  /** Timestamp when the price was recorded */
  timestamp: Date;
  /** Whether the price is below the notification threshold (8 cents/kWh) */
  isUnderThreshold: boolean;
}

/**
 * Interface defining the return type of the useElectricityPriceMonitor hook.
 */
interface UseElectricityPriceMonitorReturn {
  /** Current electricity price data or null if not available */
  currentPrice: PriceData | null;
  /** Whether a price fetch operation is currently in progress */
  isLoading: boolean;
  /** Error message if the last operation failed, null otherwise */
  error: string | null;
  /** Whether background monitoring is currently active */
  isMonitoring: boolean;
  /** Current status of background monitoring tasks */
  backgroundTaskStatus: string;
  /** Function to manually refresh the current price */
  refreshPrice: () => Promise<void>;
  /** Function to start background price monitoring */
  startMonitoring: () => Promise<void>;
  /** Function to stop background price monitoring */
  stopMonitoring: () => Promise<void>;
  /** Function to toggle monitoring on/off */
  toggleMonitoring: () => Promise<void>;
}

/**
 * Custom React hook for managing electricity price monitoring functionality.
 * 
 * This hook provides a complete interface for monitoring electricity prices from the ComEd API.
 * It manages state for current prices, loading states, errors, and background monitoring status.
 * The hook automatically handles price fetching, notification sending, and background task management.
 * 
 * Features:
 * - Real-time price fetching with error handling
 * - Background monitoring with timer-based checks
 * - Automatic notifications for low prices
 * - Manual refresh capability
 * - Monitoring status tracking
 * 
 * @returns Object containing price data, monitoring state, and control functions
 * @returns {UseElectricityPriceMonitorReturn}
 * 
 * @example
 * ```typescript
 * function MyComponent() {
 *   const {
 *     currentPrice,
 *     isLoading,
 *     error,
 *     isMonitoring,
 *     refreshPrice,
 *     toggleMonitoring
 *   } = useElectricityPriceMonitor();
 * 
 *   return (
 *     <View>
 *       {currentPrice && (
 *         <Text>Current Price: ${currentPrice.price}/kWh</Text>
 *       )}
 *       <Button onPress={toggleMonitoring}>
 *         {isMonitoring ? 'Stop Monitoring' : 'Start Monitoring'}
 *       </Button>
 *     </View>
 *   );
 * }
 * ```
 */
export const useElectricityPriceMonitor = (): UseElectricityPriceMonitorReturn => {
  const [currentPrice, setCurrentPrice] = useState<PriceData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [backgroundTaskStatus, setBackgroundTaskStatus] = useState<string>('Unknown');

  /**
   * Manually refreshes the current electricity price.
   * 
   * This function fetches the latest price from the ComEd API and updates the state.
   * If the price is below the threshold, it automatically sends a notification.
   * 
   * @returns Promise that resolves when the price refresh is complete
   * @returns {Promise<void>}
   */
  const refreshPrice = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const priceData = await ElectricityPriceService.fetchCurrentPrice();
      
      if (priceData) {
        setCurrentPrice(priceData);
        
        // If price is under threshold, send notification
        if (priceData.isUnderThreshold) {
          await NotificationService.sendLowPriceNotification(priceData.price);
        }
      } else {
        setError('Failed to fetch price data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Starts background price monitoring.
   * 
   * This function initializes the background monitoring system and fetches
   * the initial price data. It sets up periodic price checking and notification
   * sending when prices are favorable.
   * 
   * @returns Promise that resolves when monitoring is started
   * @returns {Promise<void>}
   */
  const startMonitoring = useCallback(async () => {
    try {
      // Start background task
      await BackgroundTaskService.startPeriodicPriceCheck();
      
      // Get initial price
      await refreshPrice();
      
      setIsMonitoring(true);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start monitoring');
    }
  }, [refreshPrice]);

  /**
   * Stops background price monitoring.
   * 
   * This function stops the background monitoring system and cleans up
   * any active timers or background tasks.
   * 
   * @returns Promise that resolves when monitoring is stopped
   * @returns {Promise<void>}
   */
  const stopMonitoring = useCallback(async () => {
    try {
      await BackgroundTaskService.stopPeriodicPriceCheck();
      setIsMonitoring(false);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to stop monitoring');
    }
  }, []);

  /**
   * Toggles background monitoring on/off.
   * 
   * This function switches between starting and stopping monitoring based on
   * the current monitoring state. It provides a convenient way to control
   * the monitoring system with a single function call.
   * 
   * @returns Promise that resolves when the toggle operation is complete
   * @returns {Promise<void>}
   */
  const toggleMonitoring = useCallback(async () => {
    if (isMonitoring) {
      await stopMonitoring();
    } else {
      await startMonitoring();
    }
  }, [isMonitoring, startMonitoring, stopMonitoring]);

  // Check background task status
  useEffect(() => {
    const checkBackgroundTaskStatus = () => {
      const status = BackgroundTaskService.getBackgroundFetchStatus();
      setBackgroundTaskStatus(status);
    };

    checkBackgroundTaskStatus();
    
    // Check status every minute
    const interval = setInterval(checkBackgroundTaskStatus, 60000);
    
    return () => clearInterval(interval);
  }, []);

  // Auto-refresh price every 5 minutes when monitoring
  useEffect(() => {
    if (!isMonitoring) return;

    const interval = setInterval(refreshPrice, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [isMonitoring, refreshPrice]);

  return {
    currentPrice,
    isLoading,
    error,
    isMonitoring,
    backgroundTaskStatus,
    refreshPrice,
    startMonitoring,
    stopMonitoring,
    toggleMonitoring,
  };
};
