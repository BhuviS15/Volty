import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';

interface ControlPanelProps {
  isMonitoring: boolean;
  backgroundTaskStatus: string;
  onToggleMonitoring: () => Promise<void>;
  onRefreshPrice: () => Promise<void>;
  isLoading: boolean;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  isMonitoring,
  backgroundTaskStatus,
  onToggleMonitoring,
  onRefreshPrice,
  isLoading,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available':
        return '#34C759';
      case 'Denied':
        return '#FF3B30';
      case 'Restricted':
        return '#FF9500';
      default:
        return '#666';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'Available':
        return 'Background tasks enabled';
      case 'Denied':
        return 'Background tasks disabled';
      case 'Restricted':
        return 'Background tasks restricted';
      default:
        return 'Background task status unknown';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Monitoring Controls</Text>
        
        <View style={styles.controlRow}>
          <Text style={styles.controlLabel}>Auto-monitoring</Text>
          <Switch
            value={isMonitoring}
            onValueChange={onToggleMonitoring}
            trackColor={{ false: '#E5E5EA', true: '#34C759' }}
            thumbColor={isMonitoring ? '#FFFFFF' : '#FFFFFF'}
          />
        </View>
        
        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={onRefreshPrice}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'Refreshing...' : 'Refresh Price'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>System Status</Text>
        
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Background Tasks:</Text>
          <Text style={[styles.statusValue, { color: getStatusColor(backgroundTaskStatus) }]}>
            {backgroundTaskStatus}
          </Text>
        </View>
        
        <Text style={styles.statusDescription}>
          {getStatusText(backgroundTaskStatus)}
        </Text>
        
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Monitoring:</Text>
          <Text style={[styles.statusValue, { color: isMonitoring ? '#34C759' : '#FF3B30' }]}>
            {isMonitoring ? 'Active' : 'Inactive'}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>How It Works</Text>
        <Text style={styles.infoText}>
          • The app checks electricity prices every 15 minutes in the background{'\n'}
          • You'll receive push notifications when prices drop below 8¢/kWh{'\n'}
          • Manual refresh updates the current price immediately{'\n'}
          • Background monitoring continues even when the app is closed
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  controlRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  controlLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#C7C7CC',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusLabel: {
    fontSize: 14,
    color: '#666',
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  statusDescription: {
    fontSize: 12,
    color: '#999',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});
