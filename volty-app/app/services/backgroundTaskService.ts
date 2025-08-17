import { ElectricityPriceService } from './electricityPriceService';
import { NotificationService } from './notificationService';

export class BackgroundTaskService {
  private static monitoringInterval: NodeJS.Timeout | null = null;
  private static isMonitoring = false;

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

  static getBackgroundFetchStatus(): string {
    // Since we're not using expo-background-fetch, return a status
    return this.isMonitoring ? 'Active' : 'Inactive';
  }

  static isCurrentlyMonitoring(): boolean {
    return this.isMonitoring;
  }
}

