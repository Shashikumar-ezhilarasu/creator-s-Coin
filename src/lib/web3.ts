import { ethers } from "ethers";
import { CONTRACT_ADDRESSES, NETWORK_CONFIG } from "./contracts";

declare global {
  interface Window {
    ethereum?: any;
  }
}

export class Web3Service {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.Signer | null = null;

  async connectWallet(): Promise<string> {
    if (!window.ethereum) {
      throw new Error("MetaMask not installed");
    }

    try {
      // Request account access
      await window.ethereum.request({ method: "eth_requestAccounts" });
      
      this.provider = new ethers.BrowserProvider(window.ethereum);
      this.signer = await this.provider.getSigner();
      
      // Check if we're on the correct network
      const network = await this.provider.getNetwork();
      if (Number(network.chainId) !== NETWORK_CONFIG.chainId) {
        await this.switchNetwork();
      }

      const address = await this.signer.getAddress();
      return address;
    } catch (error: any) {
      if (error.code === 4001) {
        throw new Error("User rejected the request");
      }
      throw new Error(`Failed to connect wallet: ${error.message}`);
    }
  }

  async switchNetwork(): Promise<void> {
    if (!window.ethereum) {
      throw new Error("MetaMask not installed");
    }

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${NETWORK_CONFIG.chainId.toString(16)}` }],
      });
    } catch (error: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (error.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: `0x${NETWORK_CONFIG.chainId.toString(16)}`,
                chainName: NETWORK_CONFIG.name,
                rpcUrls: [NETWORK_CONFIG.rpcUrl],
              },
            ],
          });
        } catch (addError) {
          throw new Error("Failed to add network to MetaMask");
        }
      } else {
        throw new Error("Failed to switch network");
      }
    }
  }

  async getWalletAddress(): Promise<string | null> {
    if (!this.provider) {
      return null;
    }

    try {
      const signer = await this.provider.getSigner();
      return await signer.getAddress();
    } catch {
      return null;
    }
  }

  async getWalletBalance(): Promise<string> {
    if (!this.provider || !this.signer) {
      throw new Error("Wallet not connected");
    }

    const balance = await this.provider.getBalance(await this.signer.getAddress());
    return ethers.formatEther(balance);
  }

  getProvider(): ethers.BrowserProvider | null {
    return this.provider;
  }

  getSigner(): ethers.Signer | null {
    return this.signer;
  }

  async isConnected(): Promise<boolean> {
    if (!window.ethereum || !this.provider) {
      return false;
    }

    try {
      const accounts = await window.ethereum.request({ method: "eth_accounts" });
      return accounts.length > 0;
    } catch {
      return false;
    }
  }

  async disconnect(): Promise<void> {
    this.provider = null;
    this.signer = null;
  }

  onAccountChanged(callback: (accounts: string[]) => void): void {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", callback);
    }
  }

  onChainChanged(callback: (chainId: string) => void): void {
    if (window.ethereum) {
      window.ethereum.on("chainChanged", callback);
    }
  }

  removeAllListeners(): void {
    if (window.ethereum) {
      window.ethereum.removeAllListeners("accountsChanged");
      window.ethereum.removeAllListeners("chainChanged");
    }
  }
}

// Singleton instance
export const web3Service = new Web3Service();
