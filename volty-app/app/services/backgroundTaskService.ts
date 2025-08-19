import { ElectricityPriceService } from './electricityPriceService';
import { NotificationService } from './notificationService';

/**
 * Service class for managing background price monitoring in the Volty app.
 * 
 * This service provides a timer-based approach to periodically check electricity prices
 * in the background. It uses JavaScript's setInterval to create a monitoring loop that
 * checks prices every 15 minutes and sends notifications when prices are favorable.
 * 
 * The service maintains internal state to track monitoring status and prevent
 * multiple monitoring instances from running simultaneously.
 * 
 * @example
 * ```typescript
 * // Start monitoring
 * await BackgroundTaskService.startPeriodicPriceCheck();
 * 
 * // Check if monitoring is active
 * const isActive = BackgroundTaskService.isCurrentlyMonitoring();
 * 
 * // Stop monitoring
 * await BackgroundTaskService.stopPeriodicPriceCheck();
 * ```
 */
export class BackgroundTaskService {
  /** Timer interval for periodic price checking (null when not monitoring) */
  private static monitoringInterval: NodeJS.Timeout | null = null;
  
  /** Flag indicating whether monitoring is currently active */
  private static isMonitoring = false;

  /**
   * Starts periodic price monitoring.
   * 
   * This method initializes a timer-based monitoring system that checks electricity
   * prices every 15 minutes. It configures notifications and begins the monitoring
   * loop. If monitoring is already active, this method does nothing.
   * 
   * The monitoring process:
   * 1. Fetches current price from ComEd API
   * 2. Checks if price is below threshold (8 cents/kWh)
   * 3. Sends notification if price is favorable
   * 4. Repeats every 15 minutes
   * 
   * @returns Promise that resolves when monitoring is started
   * @returns {Promise<void>}
   * 
   * @example
   * ```typescript
   * try {
   *   await BackgroundTaskService.startPeriodicPriceCheck();
   *   console.log('Price monitoring started successfully');
   * } catch (error) {
   *   console.error('Failed to start monitoring:', error);
   * }
   * ```
   * 
   * @throws {Error} When notification configuration fails
   */
  static async startPeriodicPriceCheck(): Promise<void> {
    try {
      if (this.isMonitoring) {
        console.log('Monitoring already active');
        return;
      }

      // Configure notifications first
      await NotificationService.configurePushNotifications();
      
      // Start monitoring with a timer (every 15 minutes)
      this.monitoringInterval = setInterval(async () => {
        try {
          console.log('Timer-based check: Checking electricity prices...');
          
          const priceData = await ElectricityPriceService.fetchCurrentPrice();
          
          if (priceData && priceData.isUnderThreshold) {
            // Send notification for low price
            await NotificationService.sendLowPriceNotification(priceData.price);
            console.log(`Timer-based check: Low price detected! ${priceData.price} cents/kWh`);
          }
        } catch (error) {
          console.error('Timer-based check error:', error);
        }
      }, 15 * 60 * 1000); // 15 minutes

      this.isMonitoring = true;
      console.log('Periodic price checking started (timer-based)');
    } catch (error) {
      console.error('Failed to start periodic price checking:', error);
    }
  }

  /**
   * Stops periodic price monitoring.
   * 
   * This method cleans up the monitoring timer and resets the monitoring state.
   * It safely clears the interval and sets the monitoring flag to false.
   * 
   * @returns Promise that resolves when monitoring is stopped
   * @returns {Promise<void>}
   * 
   * @example
   * ```typescript
   * try {
   *   await BackgroundTaskService.stopPeriodicPriceCheck();
   *   console.log('Price monitoring stopped successfully');
   * } catch (error) {
   *   console.error('Failed to stop monitoring:', error);
   * }
   * ```
   */
  static async stopPeriodicPriceCheck(): Promise<void> {
    try {
      if (this.monitoringInterval) {
        clearInterval(this.monitoringInterval);
        this.monitoringInterval = null;
      }
      
      this.isMonitoring = false;
      console.log('Periodic price checking stopped');
    } catch (error) {
      console.error('Failed to stop periodic price checking:', error);
    }
  }

  /**
   * Gets the current background monitoring status.
   * 
   * This method returns a string indicating whether background monitoring
   * is currently active or inactive. Since this service uses a timer-based
   * approach rather than native background fetch, the status is simplified.
   * 
   * @returns String indicating monitoring status ("Active" or "Inactive")
   * @returns {string}
   * 
   * @example
   * ```typescript
   * const status = BackgroundTaskService.getBackgroundFetchStatus();
   * console.log(`Monitoring status: ${status}`); // "Active" or "Inactive"
   * ```
   */
  static getBackgroundFetchStatus(): string {
    // Since we're not using expo-background-fetch, return a status
    return this.isMonitoring ? 'Active' : 'Inactive';
  }

  /**
   * Checks if monitoring is currently active.
   * 
   * This method returns a boolean indicating whether the price monitoring
   * system is currently running and checking prices periodically.
   * 
   * @returns True if monitoring is active, false otherwise
   * @returns {boolean}
   * 
   * @example
   * ```typescript
   * const isActive = BackgroundTaskService.isCurrentlyMonitoring();
   * if (isActive) {
   *   console.log('Price monitoring is running');
   * } else {
   *   console.log('Price monitoring is stopped');
   * }
   * ```
   */
  static isCurrentlyMonitoring(): boolean {
    return this.isMonitoring;
  }
}

