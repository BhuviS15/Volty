import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { ElectricityPriceService } from '../services/electricityPriceService';

interface PriceDisplayProps {
  price: number;
  timestamp: Date;
  isUnderThreshold: boolean;
  isLoading?: boolean;
}

export const PriceDisplay: React.FC<PriceDisplayProps> = ({
  price,
  timestamp,
  isUnderThreshold,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Fetching current price...</Text>
      </View>
    );
  }

  const priceColor = isUnderThreshold ? '#34C759' : '#FF3B30';
  const statusText = isUnderThreshold ? 'Great Time!' : 'High Price';
  const statusIcon = isUnderThreshold ? '⚡' : '⚠️';

  return (
    <View style={styles.container}>
      <View style={[styles.priceContainer, { borderColor: priceColor }]}>
        <Text style={styles.priceLabel}>Current Price</Text>
        <Text style={[styles.priceValue, { color: priceColor }]}>
          {ElectricityPriceService.formatPrice(price)}
        </Text>
        <View style={[styles.statusBadge, { backgroundColor: priceColor }]}>
          <Text style={styles.statusText}>
            {statusIcon} {statusText}
          </Text>
        </View>
      </View>
      
      <View style={styles.timestampContainer}>
        <Text style={styles.timestampLabel}>Last Updated</Text>
        <Text style={styles.timestampValue}>
          {ElectricityPriceService.formatTimestamp(timestamp)}
        </Text>
      </View>
      
      <View style={styles.thresholdInfo}>
        <Text style={styles.thresholdText}>
          Threshold: $8.00/kWh
        </Text>
        <Text style={styles.thresholdDescription}>
          {isUnderThreshold 
            ? 'Prices are below threshold - great time to use electricity!'
            : 'Prices are above threshold - consider reducing usage.'
          }
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  priceContainer: {
    alignItems: 'center',
    padding: 24,
    borderWidth: 3,
    borderRadius: 16,
    backgroundColor: '#F8F9FA',
    marginBottom: 20,
    minWidth: 200,
  },
  priceLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
    fontWeight: '500',
  },
  priceValue: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  timestampContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  timestampLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  timestampValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  thresholdInfo: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F0F0F0',
    borderRadius: 12,
    maxWidth: 300,
  },
  thresholdText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  thresholdDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
});
