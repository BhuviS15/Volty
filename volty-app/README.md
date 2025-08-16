# ⚡ Volty - Electricity Price Monitor

Volty is a React Native mobile app that monitors electricity prices from ComEd's Hourly Pricing API and sends push notifications when prices drop below 8 cents per kWh.

## Features

- **Real-time Price Monitoring**: Fetches current electricity prices every 5 minutes
- **Background Processing**: Continues monitoring even when the app is closed
- **Push Notifications**: Alerts you when prices are under 8¢/kWh
- **Beautiful UI**: Clean, modern interface with real-time status updates
- **Manual Refresh**: Check current prices on demand
- **System Status**: Monitor background task and notification permissions

## How It Works

1. **Price Fetching**: The app fetches data from [ComEd's Hourly Pricing API](https://hourlypricing.comed.com/api?type=5minutefeed)
2. **Background Monitoring**: Uses Expo's background fetch to check prices every 15 minutes
3. **Smart Notifications**: Automatically sends push notifications when prices drop below the threshold
4. **Real-time Updates**: UI updates automatically with the latest price information

## Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm start
   ```

3. Run on your device:
   - iOS: `npm run ios`
   - Android: `npm run android`

## Dependencies

The app uses several Expo packages for functionality:

- `expo-notifications`: Push notification handling
- `expo-task-manager`: Background task management
- `expo-background-fetch`: Periodic background execution
- `expo-constants`: App configuration
- `expo-router`: Navigation

## Configuration

### Background Tasks
- Minimum interval: 15 minutes (iOS/Android limitation)
- Continues running after app restart
- Automatically starts on device boot

### Notifications
- Permission request on first launch
- Custom notification sounds
- Rich notification content with price information

### API Integration
- ComEd Hourly Pricing API endpoint
- 5-minute price update intervals
- Automatic error handling and retry logic

## Usage

1. **Start Monitoring**: Toggle the "Auto-monitoring" switch to begin
2. **View Current Price**: See real-time electricity prices and status
3. **Manual Refresh**: Tap "Refresh Price" to get the latest data
4. **Background Operation**: The app continues monitoring when closed
5. **Notifications**: Receive alerts when prices are favorable

## Technical Architecture

### Services
- `ElectricityPriceService`: API integration and price processing
- `NotificationService`: Push notification management
- `BackgroundTaskService`: Background task coordination

### Components
- `PriceDisplay`: Current price visualization
- `ControlPanel`: Monitoring controls and system status
- Custom hooks for state management

### State Management
- React hooks for local state
- Async operations with error handling
- Real-time updates and background sync

## Permissions

The app requires the following permissions:

- **iOS**: Background fetch, notifications
- **Android**: Internet, wake lock, boot completion
- **Network**: Access to ComEd API endpoints

## Troubleshooting

### Common Issues

1. **Notifications not working**: Check notification permissions in device settings
2. **Background tasks disabled**: Ensure background app refresh is enabled
3. **API errors**: Check internet connection and ComEd API status

### Debug Mode

Enable debug logging by checking the console output for:
- Background task execution logs
- API response data
- Notification delivery status

## API Reference

### ComEd Hourly Pricing API
- **Endpoint**: `https://hourlypricing.comed.com/api?type=5minutefeed`
- **Format**: JSON array with timestamp and price data
- **Update Frequency**: Every 5 minutes
- **Data Structure**: `{ millisUTC: string, price: string }`

### Price Threshold
- **Default**: 8.0 cents per kWh
- **Configurable**: Modify `PRICE_THRESHOLD` in `ElectricityPriceService`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review the console logs
3. Verify device permissions
4. Check network connectivity

---

**Note**: This app is designed for educational and personal use. Always verify electricity pricing information with your utility provider.
