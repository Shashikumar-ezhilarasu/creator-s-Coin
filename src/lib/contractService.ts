import { ethers } from "ethers";
import { web3Service } from "./web3";
import { 
  CREATOR_FACTORY_ABI, 
  CREATOR_MARKETPLACE_ABI, 
  CREATOR_TOKEN_ABI, 
  CONTRACT_ADDRESSES 
} from "./contracts";

export interface Creator {
  id: string;
  name: string;
  symbol: string;
  tokenAddress: string;
  owner: string;
}

export interface TokenInfo {
  balance: string;
  name: string;
  symbol: string;
  totalSupply: string;
}

export class ContractService {
  async getCreators(): Promise<Creator[]> {
    const provider = web3Service.getProvider();
    if (!provider) {
      throw new Error("Wallet not connected");
    }

    const contract = new ethers.Contract(
      CONTRACT_ADDRESSES.CREATOR_FACTORY,
      CREATOR_FACTORY_ABI,
      provider
    );

    try {
      const creators = await contract.getCreators();
      return creators.map((creator: any) => ({
        id: creator.id.toString(),
        name: creator.name,
        symbol: creator.symbol,
        tokenAddress: creator.tokenAddress,
        owner: creator.owner,
      }));
    } catch (error: any) {
      throw new Error(`Failed to fetch creators: ${error.message}`);
    }
  }

  async getCreatorInfo(creatorId: string): Promise<Creator> {
    const provider = web3Service.getProvider();
    if (!provider) {
      throw new Error("Wallet not connected");
    }

    const contract = new ethers.Contract(
      CONTRACT_ADDRESSES.CREATOR_FACTORY,
      CREATOR_FACTORY_ABI,
      provider
    );

    try {
      const creator = await contract.getCreatorInfo(creatorId);
      return {
        id: creator.id.toString(),
        name: creator.name,
        symbol: creator.symbol,
        tokenAddress: creator.tokenAddress,
        owner: creator.owner,
      };
    } catch (error: any) {
      throw new Error(`Failed to fetch creator info: ${error.message}`);
    }
  }

  async getTokenBalance(tokenAddress: string, userAddress: string): Promise<string> {
    const provider = web3Service.getProvider();
    if (!provider) {
      throw new Error("Wallet not connected");
    }

    const contract = new ethers.Contract(tokenAddress, CREATOR_TOKEN_ABI, provider);

    try {
      const balance = await contract.balanceOf(userAddress);
      return ethers.formatEther(balance);
    } catch (error: any) {
      throw new Error(`Failed to fetch token balance: ${error.message}`);
    }
  }

  async getTokenInfo(tokenAddress: string): Promise<TokenInfo> {
    const provider = web3Service.getProvider();
    if (!provider) {
      throw new Error("Wallet not connected");
    }

    const contract = new ethers.Contract(tokenAddress, CREATOR_TOKEN_ABI, provider);

    try {
      const [name, symbol, totalSupply, userAddress] = await Promise.all([
        contract.name(),
        contract.symbol(),
        contract.totalSupply(),
        web3Service.getWalletAddress(),
      ]);

      let balance = "0";
      if (userAddress) {
        const balanceWei = await contract.balanceOf(userAddress);
        balance = ethers.formatEther(balanceWei);
      }

      return {
        balance,
        name,
        symbol,
        totalSupply: ethers.formatEther(totalSupply),
      };
    } catch (error: any) {
      throw new Error(`Failed to fetch token info: ${error.message}`);
    }
  }

  async getMinimumTokensRequired(creatorId: string): Promise<string> {
    const provider = web3Service.getProvider();
    if (!provider) {
      throw new Error("Wallet not connected");
    }

    const contract = new ethers.Contract(
      CONTRACT_ADDRESSES.CREATOR_MARKETPLACE,
      CREATOR_MARKETPLACE_ABI,
      provider
    );

    try {
      const minTokens = await contract.getMinimumTokensRequired(creatorId);
      return ethers.formatEther(minTokens);
    } catch (error: any) {
      throw new Error(`Failed to fetch minimum tokens required: ${error.message}`);
    }
  }

  async getTokenPrice(creatorId: string): Promise<string> {
    const provider = web3Service.getProvider();
    if (!provider) {
      throw new Error("Wallet not connected");
    }

    const contract = new ethers.Contract(
      CONTRACT_ADDRESSES.CREATOR_MARKETPLACE,
      CREATOR_MARKETPLACE_ABI,
      provider
    );

    try {
      const price = await contract.getTokenPrice(creatorId);
      return ethers.formatEther(price);
    } catch (error: any) {
      throw new Error(`Failed to fetch token price: ${error.message}`);
    }
  }

  async buyTokens(creatorId: string, amount: string): Promise<string> {
    const signer = web3Service.getSigner();
    if (!signer) {
      throw new Error("Wallet not connected");
    }

    const contract = new ethers.Contract(
      CONTRACT_ADDRESSES.CREATOR_MARKETPLACE,
      CREATOR_MARKETPLACE_ABI,
      signer
    );

    try {
      // Get the price per token
      const pricePerToken = await contract.getTokenPrice(creatorId);
      const totalCost = BigInt(ethers.parseEther(amount)) * BigInt(pricePerToken) / BigInt(ethers.parseEther("1"));

      const tx = await contract.buyTokens(creatorId, ethers.parseEther(amount), {
        value: totalCost,
      });

      return tx.hash;
    } catch (error: any) {
      if (error.code === "ACTION_REJECTED") {
        throw new Error("Transaction rejected by user");
      }
      throw new Error(`Failed to buy tokens: ${error.message}`);
    }
  }

  async getContentCID(creatorId: string): Promise<string> {
    const provider = web3Service.getProvider();
    if (!provider) {
      throw new Error("Wallet not connected");
    }

    const contract = new ethers.Contract(
      CONTRACT_ADDRESSES.CREATOR_MARKETPLACE,
      CREATOR_MARKETPLACE_ABI,
      provider
    );

    try {
      const cid = await contract.getContentCID(creatorId);
      return cid;
    } catch (error: any) {
      throw new Error(`Failed to fetch content CID: ${error.message}`);
    }
  }

  async setContentCID(creatorId: string, cid: string): Promise<string> {
    const signer = web3Service.getSigner();
    if (!signer) {
      throw new Error("Wallet not connected");
    }

    const contract = new ethers.Contract(
      CONTRACT_ADDRESSES.CREATOR_MARKETPLACE,
      CREATOR_MARKETPLACE_ABI,
      signer
    );

    try {
      const tx = await contract.setContentCID(creatorId, cid);
      return tx.hash;
    } catch (error: any) {
      if (error.code === "ACTION_REJECTED") {
        throw new Error("Transaction rejected by user");
      }
      throw new Error(`Failed to set content CID: ${error.message}`);
    }
  }

  async checkTokenAccess(creatorId: string, userAddress: string): Promise<boolean> {
    try {
      const [creator, minTokens] = await Promise.all([
        this.getCreatorInfo(creatorId),
        this.getMinimumTokensRequired(creatorId),
      ]);

      const userBalance = await this.getTokenBalance(creator.tokenAddress, userAddress);
      return parseFloat(userBalance) >= parseFloat(minTokens);
    } catch (error: any) {
      throw new Error(`Failed to check token access: ${error.message}`);
    }
  }

  async createCreatorToken(name: string, symbol: string): Promise<string> {
    const signer = web3Service.getSigner();
    if (!signer) {
      throw new Error("Wallet not connected");
    }

    const contract = new ethers.Contract(
      CONTRACT_ADDRESSES.CREATOR_FACTORY,
      CREATOR_FACTORY_ABI,
      signer
    );

    try {
      const tx = await contract.createCreatorToken(name, symbol);
      return tx.hash;
    } catch (error: any) {
      if (error.code === "ACTION_REJECTED") {
        throw new Error("Transaction rejected by user");
      }
      throw new Error(`Failed to create creator token: ${error.message}`);
    }
  }
}

// Singleton instance
export const contractService = new ContractService();
