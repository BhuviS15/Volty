/**
 * Interface representing electricity price data from the ComEd API
 */
interface PriceData {
  /** Unix timestamp in milliseconds UTC */
  millisUTC: string;
  /** Price in cents per kWh as a string */
  price: string;
}

/**
 * Service class for fetching and processing electricity price data from ComEd's Hourly Pricing API.
 * 
 * This service handles all interactions with the ComEd API, including fetching current prices,
 * processing price history, and determining if prices are below the threshold for notifications.
 * 
 * @example
 * ```typescript
 * // Fetch current price
 * const priceData = await ElectricityPriceService.fetchCurrentPrice();
 * if (priceData && priceData.isUnderThreshold) {
 *   console.log('Great time to use electricity!');
 * }
 * 
 * // Get price history
 * const history = await ElectricityPriceService.getPriceHistory();
 * ```
 */
export class ElectricityPriceService {
  /** ComEd Hourly Pricing API endpoint URL */
  private static readonly API_URL = 'https://hourlypricing.comed.com/api?type=5minutefeed';
  
  /** Price threshold in cents per kWh (8.0 = 8 cents) */
  private static readonly PRICE_THRESHOLD = 8.0;

  /**
   * Fetches the most recent electricity price from the ComEd API.
   * 
   * This method retrieves the latest price data and determines if it's below
   * the notification threshold. It processes the API response and returns
   * structured data with price, timestamp, and threshold status.
   * 
   * @returns Promise resolving to price data object or null if fetch fails
   * @returns {Promise<{price: number, timestamp: Date, isUnderThreshold: boolean} | null>}
   * 
   * @example
   * ```typescript
   * const priceData = await ElectricityPriceService.fetchCurrentPrice();
   * if (priceData) {
   *   console.log(`Current price: ${priceData.price} cents/kWh`);
   *   console.log(`Is under threshold: ${priceData.isUnderThreshold}`);
   * }
   * ```
   * 
   * @throws {Error} When API request fails or response is invalid
   */
  static async fetchCurrentPrice(): Promise<{ price: number; timestamp: Date; isUnderThreshold: boolean } | null> {
    try {
      const response = await fetch(this.API_URL);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: PriceData[] = await response.json();
      
      if (!data || data.length === 0) {
        throw new Error('No price data received');
      }

      // Get the most recent price (first item in the array)
      const mostRecent = data[0];
      const price = parseFloat(mostRecent.price);
      const timestamp = new Date(parseInt(mostRecent.millisUTC));
      const isUnderThreshold = price < this.PRICE_THRESHOLD;

      return {
        price,
        timestamp,
        isUnderThreshold
      };
    } catch (error) {
      console.error('Error fetching electricity price:', error);
      return null;
    }
  }

  /**
   * Fetches the complete price history from the ComEd API.
   * 
   * This method retrieves all available price data points from the API.
   * The data is returned in chronological order with the most recent first.
   * 
   * @returns Promise resolving to array of price data objects
   * @returns {Promise<PriceData[]>}
   * 
   * @example
   * ```typescript
   * const history = await ElectricityPriceService.getPriceHistory();
   * console.log(`Retrieved ${history.length} price points`);
   * history.forEach(point => {
   *   console.log(`${point.millisUTC}: ${point.price} cents/kWh`);
   * });
   * ```
   * 
   * @throws {Error} When API request fails
   */
  static async getPriceHistory(): Promise<PriceData[]> {
    try {
      const response = await fetch(this.API_URL);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: PriceData[] = await response.json();
      return data || [];
    } catch (error) {
      console.error('Error fetching price history:', error);
      return [];
    }
  }

  /**
   * Formats a price value for display.
   * 
   * Converts a numeric price value to a formatted string with currency
   * symbol and units for user-friendly display.
   * 
   * @param price - Price in cents per kWh
   * @returns Formatted price string (e.g., "$5.50/kWh")
   * 
   * @example
   * ```typescript
   * const formatted = ElectricityPriceService.formatPrice(5.5);
   * console.log(formatted); // "$5.50/kWh"
   * ```
   */
  static formatPrice(price: number): string {
    return `$${price.toFixed(2)}/kWh`;
  }

  /**
   * Formats a timestamp for display.
   * 
   * Converts a Date object to a user-friendly string format showing
   * month, day, hour, and minute with AM/PM indicator.
   * 
   * @param timestamp - Date object to format
   * @returns Formatted timestamp string (e.g., "Dec 15, 2:30 PM")
   * 
   * @example
   * ```typescript
   * const now = new Date();
   * const formatted = ElectricityPriceService.formatTimestamp(now);
   * console.log(formatted); // "Dec 15, 2:30 PM"
   * ```
   */
  static formatTimestamp(timestamp: Date): string {
    return timestamp.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }
}
