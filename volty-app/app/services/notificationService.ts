import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export class NotificationService {
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

  static async cancelAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }
}
