interface PriceData {
  millisUTC: string;
  price: string;
}

export class ElectricityPriceService {
  private static readonly API_URL = 'https://hourlypricing.comed.com/api?type=5minutefeed';
  private static readonly PRICE_THRESHOLD = 8.0; // 8 cents per kWh

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

  static formatPrice(price: number): string {
    return `$${price.toFixed(2)}/kWh`;
  }

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
