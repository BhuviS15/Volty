import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

/**
 * Service class for managing push notifications in the Volty app.
 * 
 * This service handles all notification-related functionality including permission requests,
 * notification configuration, sending low price alerts, and scheduling periodic reminders.
 * 
 * The service uses Expo Notifications to provide cross-platform notification support
 * with proper configuration for both iOS and Android platforms.
 * 
 * @example
 * ```typescript
 * // Configure notifications on app startup
 * await NotificationService.configurePushNotifications();
 * 
 * // Send a low price alert
 * await NotificationService.sendLowPriceNotification(5.5);
 * ```
 */
export class NotificationService {
  /**
   * Requests notification permissions from the user.
   * 
   * This method checks the current permission status and requests permissions
   * if they haven't been granted. It handles both iOS and Android permission flows.
   * 
   * @returns Promise resolving to true if permissions are granted, false otherwise
   * @returns {Promise<boolean>}
   * 
   * @example
   * ```typescript
   * const hasPermission = await NotificationService.requestPermissions();
   * if (!hasPermission) {
   *   console.log('Notification permissions denied');
   * }
   * ```
   */
  static async requestPermissions(): Promise<boolean> {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return false;
    }
    
    return true;
  }

  /**
   * Configures push notifications for the app.
   * 
   * This method sets up the notification handler, requests permissions,
   * and configures platform-specific settings like Android notification channels.
   * Should be called during app initialization.
   * 
   * @returns Promise that resolves when configuration is complete
   * @returns {Promise<void>}
   * 
   * @example
   * ```typescript
   * // Call this in your app's initialization
   * await NotificationService.configurePushNotifications();
   * ```
   */
  static async configurePushNotifications(): Promise<void> {
    // Configure notification behavior
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });

    // Request permissions
    await this.requestPermissions();

    // Get push token
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }
  }

  /**
   * Sends an immediate notification when electricity prices are low.
   * 
   * This method creates and schedules a notification to alert the user
   * that current electricity prices are favorable for usage. The notification
   * includes the current price and is sent immediately.
   * 
   * @param price - Current electricity price in cents per kWh
   * @returns Promise that resolves when notification is scheduled
   * @returns {Promise<void>}
   * 
   * @example
   * ```typescript
   * // Send notification when price is low
   * await NotificationService.sendLowPriceNotification(5.5);
   * ```
   * 
   * @throws {Error} When notification scheduling fails
   */
  static async sendLowPriceNotification(price: number): Promise<void> {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '⚡ Low Electricity Price Alert!',
          body: `Current price: $${price.toFixed(2)}/kWh - Great time to use electricity!`,
          data: { price, timestamp: new Date().toISOString() },
        },
        trigger: null, // Send immediately
      });
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }

  /**
   * Schedules a periodic notification to remind users to check prices.
   * 
   * This method creates a recurring notification that appears daily at noon
   * to remind users to check current electricity prices. This serves as a
   * fallback mechanism for price monitoring.
   * 
   * @returns Promise that resolves when notification is scheduled
   * @returns {Promise<void>}
   * 
   * @example
   * ```typescript
   * // Schedule daily reminder
   * await NotificationService.schedulePeriodicCheck();
   * ```
   * 
   * @throws {Error} When notification scheduling fails
   */
  static async schedulePeriodicCheck(): Promise<void> {
    // Schedule a notification to remind users to check prices
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🔍 Check Electricity Prices',
        body: 'Tap to check current electricity prices and see if it\'s a good time to use power!',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
        hour: 12, // Daily at noon
        minute: 0,
        repeats: true,
      },
    });
  }

  /**
   * Cancels all scheduled notifications.
   * 
   * This method removes all pending notifications including periodic reminders
   * and any other scheduled notifications. Useful when stopping monitoring
   * or resetting notification state.
   * 
   * @returns Promise that resolves when all notifications are cancelled
   * @returns {Promise<void>}
   * 
   * @example
   * ```typescript
   * // Cancel all notifications
   * await NotificationService.cancelAllNotifications();
   * ```
   */
  static async cancelAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }
}
