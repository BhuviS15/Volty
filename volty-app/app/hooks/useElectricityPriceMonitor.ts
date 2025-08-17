import { useState, useEffect, useCallback } from 'react';
import { ElectricityPriceService } from '../services/electricityPriceService';
import { NotificationService } from '../services/notificationService';
import { BackgroundTaskService } from '../services/backgroundTaskService';

interface PriceData {
  price: number;
  timestamp: Date;
  isUnderThreshold: boolean;
}

interface UseElectricityPriceMonitorReturn {
  currentPrice: PriceData | null;
  isLoading: boolean;
  error: string | null;
  isMonitoring: boolean;
  backgroundTaskStatus: string;
  refreshPrice: () => Promise<void>;
  startMonitoring: () => Promise<void>;
  stopMonitoring: () => Promise<void>;
  toggleMonitoring: () => Promise<void>;
}

export const useElectricityPriceMonitor = (): UseElectricityPriceMonitorReturn => {
  const [currentPrice, setCurrentPrice] = useState<PriceData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [backgroundTaskStatus, setBackgroundTaskStatus] = useState<string>('Unknown');

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

  const stopMonitoring = useCallback(async () => {
    try {
      await BackgroundTaskService.stopPeriodicPriceCheck();
      setIsMonitoring(false);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to stop monitoring');
    }
  }, []);

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
