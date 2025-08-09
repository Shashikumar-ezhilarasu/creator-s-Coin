import axios from "axios";

export interface TokenPrice {
  usd: number;
  change24h: number;
}

export class PriceService {
  private readonly coingeckoUrl = process.env.NEXT_PUBLIC_COINGECKO_API_URL || "https://api.coingecko.com/api/v3";

  async getTokenPrice(contractAddress: string): Promise<TokenPrice> {
    try {
      const response = await axios.get(
        `${this.coingeckoUrl}/simple/token_price/ethereum`,
        {
          params: {
            contract_addresses: contractAddress,
            vs_currencies: "usd",
            include_24hr_change: true,
          },
        }
      );

      const data = response.data[contractAddress.toLowerCase()];
      
      if (!data) {
        // If token not found on CoinGecko, return mock data
        return {
          usd: 0.01, // Default price of $0.01
          change24h: 0,
        };
      }

      return {
        usd: data.usd || 0,
        change24h: data.usd_24h_change || 0,
      };
    } catch (error: any) {
      console.warn("Failed to fetch token price from CoinGecko:", error.message);
      // Return mock data if API fails
      return {
        usd: 0.01,
        change24h: 0,
      };
    }
  }

  async getETHPrice(): Promise<TokenPrice> {
    try {
      const response = await axios.get(`${this.coingeckoUrl}/simple/price`, {
        params: {
          ids: "ethereum",
          vs_currencies: "usd",
          include_24hr_change: true,
        },
      });

      const data = response.data.ethereum;
      return {
        usd: data.usd || 0,
        change24h: data.usd_24h_change || 0,
      };
    } catch (error: any) {
      console.warn("Failed to fetch ETH price:", error.message);
      return {
        usd: 2000, // Fallback ETH price
        change24h: 0,
      };
    }
  }

  calculateTokenValueInUSD(tokenAmount: string, tokenPriceUSD: number): number {
    return parseFloat(tokenAmount) * tokenPriceUSD;
  }

  formatPrice(price: number): string {
    if (price < 0.01) {
      return `$${price.toFixed(6)}`;
    } else if (price < 1) {
      return `$${price.toFixed(4)}`;
    } else {
      return `$${price.toFixed(2)}`;
    }
  }

  formatPriceChange(change: number): string {
    const sign = change >= 0 ? "+" : "";
    return `${sign}${change.toFixed(2)}%`;
  }

  getPriceChangeColor(change: number): string {
    return change >= 0 ? "text-green-600" : "text-red-600";
  }
}

// Singleton instance
export const priceService = new PriceService();
