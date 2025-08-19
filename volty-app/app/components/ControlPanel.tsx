import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';

/**
 * Props interface for the ControlPanel component.
 */
interface ControlPanelProps {
  /** Whether background monitoring is currently active */
  isMonitoring: boolean;
  /** Current status of background monitoring tasks */
  backgroundTaskStatus: string;
  /** Function to toggle monitoring on/off */
  onToggleMonitoring: () => Promise<void>;
  /** Function to manually refresh the current price */
  onRefreshPrice: () => Promise<void>;
  /** Whether a price fetch operation is currently in progress */
  isLoading: boolean;
}

/**
 * React component for controlling electricity price monitoring functionality.
 * 
 * This component provides a user interface for managing the price monitoring system,
 * including controls to start/stop monitoring, manually refresh prices, and view
 * system status information. It displays monitoring state and provides helpful
 * information about how the system works.
 * 
 * Features:
 * - Toggle switch for starting/stopping monitoring
 * - Manual refresh button with loading state
 * - System status display (background tasks, monitoring state)
 * - Color-coded status indicators
 * - Helpful information about system operation
 * 
 * @param props - Component props containing monitoring state and control functions
 * @param props.isMonitoring - Whether background monitoring is currently active
 * @param props.backgroundTaskStatus - Current status of background monitoring tasks
 * @param props.onToggleMonitoring - Function to toggle monitoring on/off
 * @param props.onRefreshPrice - Function to manually refresh the current price
 * @param props.isLoading - Whether a price fetch operation is currently in progress
 * 
 * @returns React component providing monitoring controls and status information
 * 
 * @example
 * ```typescript
 * <ControlPanel
 *   isMonitoring={true}
 *   backgroundTaskStatus="Active"
 *   onToggleMonitoring={handleToggleMonitoring}
 *   onRefreshPrice={handleRefreshPrice}
 *   isLoading={false}
 * />
 * ```
 */
export const ControlPanel: React.FC<ControlPanelProps> = ({
  isMonitoring,
  backgroundTaskStatus,
  onToggleMonitoring,
  onRefreshPrice,
  isLoading,
}) => {
  /**
   * Determines the color for status display based on the background task status.
   * 
   * @param status - The background task status string
   * @returns Color string for the status display
   */
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

  /**
   * Gets a user-friendly description for the background task status.
   * 
   * @param status - The background task status string
   * @returns Human-readable description of the status
   */
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
      {/* Monitoring Controls Section */}
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

      {/* System Status Section */}
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

      {/* How It Works Section */}
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

/**
 * Styles for the ControlPanel component.
 * 
 * Provides responsive styling with:
 * - Sectioned layout with proper spacing
 * - Interactive controls (switch, button)
 * - Status indicators with color coding
 * - Typography hierarchy for readability
 * - Disabled state styling for buttons
 */
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
