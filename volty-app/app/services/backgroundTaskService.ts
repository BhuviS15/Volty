import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import { ElectricityPriceService } from './electricityPriceService';
import { NotificationService } from './notificationService';

const BACKGROUND_FETCH_TASK = 'background-fetch-electricity-prices';

export class BackgroundTaskService {
  static async registerBackgroundTask(): Promise<void> {
    try {
      // Define the background task
      TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
        try {
          console.log('Background task: Checking electricity prices...');
          
          const priceData = await ElectricityPriceService.fetchCurrentPrice();
          
          if (priceData && priceData.isUnderThreshold) {
            // Send notification for low price
            await NotificationService.sendLowPriceNotification(priceData.price);
            console.log(`Background task: Low price detected! ${priceData.price} cents/kWh`);
          }
          
          return BackgroundFetch.Result.NewData;
        } catch (error) {
          console.error('Background task error:', error);
          return BackgroundFetch.Result.Failed;
        }
      });

      // Register the background fetch task
      await BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
        minimumInterval: 15 * 60, // 15 minutes minimum
        stopOnTerminate: false,
        startOnBoot: true,
      });

      console.log('Background task registered successfully');
    } catch (error) {
      console.error('Failed to register background task:', error);
    }
  }

  static async unregisterBackgroundTask(): Promise<void> {
    try {
      await BackgroundFetch.unregisterTaskAsync(BACKGROUND_FETCH_TASK);
      console.log('Background task unregistered successfully');
    } catch (error) {
      console.error('Failed to unregister background task:', error);
    }
  }

  static async getBackgroundFetchStatus(): Promise<BackgroundFetch.BackgroundFetchStatus> {
    return await BackgroundFetch.getStatusAsync();
  }

  static async startPeriodicPriceCheck(): Promise<void> {
    try {
      // Set up background task
      await this.registerBackgroundTask();
      
      // Also set up periodic notifications as a fallback
      await NotificationService.schedulePeriodicCheck();
      
      console.log('Periodic price checking started');
    } catch (error) {
      console.error('Failed to start periodic price checking:', error);
    }
  }

  static async stopPeriodicPriceCheck(): Promise<void> {
    try {
      await this.unregisterBackgroundTask();
      await NotificationService.cancelAllNotifications();
      console.log('Periodic price checking stopped');
    } catch (error) {
      console.error('Failed to stop periodic price checking:', error);
    }
  }
}
