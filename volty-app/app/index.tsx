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

export default function App() {
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

  // Show error alerts
  useEffect(() => {
    if (error) {
      Alert.alert('Error', error, [{ text: 'OK' }]);
    }
  }, [error]);

  const handleToggleMonitoring = async () => {
    try {
      await toggleMonitoring();
    } catch (err) {
      Alert.alert('Error', 'Failed to toggle monitoring');
    }
  };

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
        <View style={styles.header}>
          <Text style={styles.title}>⚡ Volty</Text>
          <Text style={styles.subtitle}>Electricity Price Monitor</Text>
        </View>

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

        <ControlPanel
          isMonitoring={isMonitoring}
          backgroundTaskStatus={backgroundTaskStatus}
          onToggleMonitoring={handleToggleMonitoring}
          onRefreshPrice={handleRefreshPrice}
          isLoading={isLoading}
        />

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
