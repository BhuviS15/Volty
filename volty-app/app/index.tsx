import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import { useElectricityPriceMonitor } from './hooks/useElectricityPriceMonitor';
import { PriceDisplay } from './components/PriceDisplay';
import { ControlPanel } from './components/ControlPanel';

/**
 * Main App component for the Volty electricity price monitoring application.
 * 
 * This is the root component that orchestrates the entire electricity price monitoring
 * system. It uses the useElectricityPriceMonitor hook to manage state and provides
 * a user interface for viewing current prices and controlling monitoring functionality.
 * 
 * Features:
 * - Real-time electricity price display
 * - Background monitoring controls
 * - Push notification management
 * - Error handling with user alerts
 * - Responsive design for mobile devices
 * 
 * The app integrates with ComEd's Hourly Pricing API to fetch current electricity
 * prices and provides notifications when prices drop below 8 cents per kWh.
 * 
 * @returns React component representing the main app interface
 * 
 * @example
 * ```typescript
 * // This component is automatically rendered by Expo Router
 * // No manual instantiation required
 * ```
 */
export default function App() {
  // Use the custom hook to manage electricity price monitoring
  const {
    currentPrice,
    isLoading,
    error,
    isMonitoring,
    backgroundTaskStatus,
    refreshPrice,
    startMonitoring,
    stopMonitoring,
    toggleMonitoring,
  } = useElectricityPriceMonitor();

  /**
   * Effect hook to display error alerts to the user.
   * 
   * Monitors the error state and shows an alert dialog when an error occurs.
   * This provides user feedback for any issues with price fetching or monitoring.
   */
  useEffect(() => {
    if (error) {
      Alert.alert('Error', error, [{ text: 'OK' }]);
    }
  }, [error]);

  /**
   * Handler function for toggling monitoring state.
   * 
   * Wraps the toggleMonitoring function with error handling to provide
   * user feedback if the operation fails.
   * 
   * @returns Promise that resolves when the toggle operation is complete
   */
  const handleToggleMonitoring = async () => {
    try {
      await toggleMonitoring();
    } catch (err) {
      Alert.alert('Error', 'Failed to toggle monitoring');
    }
  };

  /**
   * Handler function for manually refreshing price data.
   * 
   * Wraps the refreshPrice function with error handling to provide
   * user feedback if the operation fails.
   * 
   * @returns Promise that resolves when the refresh operation is complete
   */
  const handleRefreshPrice = async () => {
    try {
      await refreshPrice();
    } catch (err) {
      Alert.alert('Error', 'Failed to refresh price');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* App Header */}
        <View style={styles.header}>
          <Text style={styles.title}>⚡ Volty</Text>
          <Text style={styles.subtitle}>Electricity Price Monitor</Text>
        </View>

        {/* Price Display Section */}
        {currentPrice ? (
          <PriceDisplay
            price={currentPrice.price}
            timestamp={currentPrice.timestamp}
            isUnderThreshold={currentPrice.isUnderThreshold}
            isLoading={isLoading}
          />
        ) : (
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>
              {isLoading ? 'Loading...' : 'No price data available'}
            </Text>
            <Text style={styles.noDataSubtext}>
              Tap "Start Monitoring" to begin tracking electricity prices
            </Text>
          </View>
        )}

        {/* Control Panel Section */}
        <ControlPanel
          isMonitoring={isMonitoring}
          backgroundTaskStatus={backgroundTaskStatus}
          onToggleMonitoring={handleToggleMonitoring}
          onRefreshPrice={handleRefreshPrice}
          isLoading={isLoading}
        />

        {/* App Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Data provided by ComEd Hourly Pricing
          </Text>
          <Text style={styles.footerSubtext}>
            Prices update every 5 minutes
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/**
 * Styles for the main App component.
 * 
 * Provides responsive styling with:
 * - Safe area handling for different device types
 * - Scrollable layout for content overflow
 * - Typography hierarchy for app branding
 * - Loading and error state styling
 * - Footer information styling
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
  },
  noDataContainer: {
    alignItems: 'center',
    padding: 40,
    marginHorizontal: 20,
    backgroundColor: '#F0F0F0',
    borderRadius: 16,
  },
  noDataText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 8,
    fontWeight: '500',
  },
  noDataSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
  },
  footer: {
    alignItems: 'center',
    padding: 20,
    marginTop: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 10,
    color: '#BBB',
  },
});
