// Smart Contract ABIs
export const CREATOR_FACTORY_ABI = [
  "function getCreators() view returns (tuple(uint256 id, string name, string symbol, address tokenAddress, address owner)[])",
  "function creatorTokenAddress(uint256 creatorId) view returns (address)",
  "function createCreatorToken(string name, string symbol) returns (uint256)",
  "function getCreatorInfo(uint256 creatorId) view returns (tuple(uint256 id, string name, string symbol, address tokenAddress, address owner))"
] as const;

export const CREATOR_MARKETPLACE_ABI = [
  "function buyTokens(uint256 creatorId, uint256 amount) payable",
  "function getMinimumTokensRequired(uint256 creatorId) view returns (uint256)",
  "function getContentCID(uint256 creatorId) view returns (string)",
  "function setContentCID(uint256 creatorId, string cid)",
  "function getTokenPrice(uint256 creatorId) view returns (uint256)",
  "event TokensPurchased(uint256 indexed creatorId, address indexed buyer, uint256 amount, uint256 cost)"
] as const;

export const CREATOR_TOKEN_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function totalSupply() view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function owner() view returns (address)"
] as const;

// Contract addresses (loaded from environment variables)
export const CONTRACT_ADDRESSES = {
  CREATOR_FACTORY: process.env.NEXT_PUBLIC_CREATOR_FACTORY_ADDRESS!,
  CREATOR_MARKETPLACE: process.env.NEXT_PUBLIC_CREATOR_MARKETPLACE_ADDRESS!,
} as const;

// Network configuration
export const NETWORK_CONFIG = {
  chainId: parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || "1"),
  name: process.env.NEXT_PUBLIC_NETWORK_NAME || "ethereum",
  rpcUrl: process.env.NEXT_PUBLIC_ETHEREUM_RPC_URL || "",
} as const;
