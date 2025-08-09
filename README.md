# CreatorWeb3 - Decentralized Creator Token MarketplaceA full-stack Next.js application that enables creators to tokenize their content and allows supporters to access exclusive content through creator tokens. Built with Web3 integration using Ethers.js, MetaMask wallet connection, and IPFS for decentralized content storage.## 🚀 Features### For Users- **Wallet Integration**: Connect MetaMask wallet to interact with the platform- **Creator Discovery**: Browse all available creators and their tokens- **Token Purchase**: Buy creator tokens to unlock exclusive content- **Content Access**: View exclusive content based on token holdings- **Real-time Price Data**: Live token prices with 24h changes via CoinGecko API### For Creators- **Token Creation**: Create custom ERC-20 tokens for your brand- **Content Upload**: Upload exclusive content to IPFS- **Access Control**: Set minimum token requirements for content access- **Creator Dashboard**: Manage your content and track supporters### Web3 Features- **Smart Contract Integration**: Interact with CreatorToken, CreatorFactory, and CreatorMarketplace contracts- **Decentralized Storage**: Content stored on IPFS for censorship resistance- **Token Gating**: Automatic access control based on token balance- **Multi-Network Support**: Configurable for Ethereum, Avalanche, or other EVM chains## 🛠️ Tech Stack- **Frontend**: Next.js 15 with App Router, TypeScript, TailwindCSS- **Web3**: Ethers.js for blockchain interactions- **Wallet**: MetaMask integration with account switching- **Storage**: IPFS via Web3.Storage for decentralized content- **Icons**: Lucide React for beautiful, consistent icons- **State Management**: React Context for Web3 state- **API Integration**: Axios for price data from CoinGecko## 🏗️ Smart Contract Requirements

This frontend expects the following smart contracts to be deployed:

### CreatorFactory.sol

```solidity
// Main functions:
- getCreators() -> Creator[]
- creatorTokenAddress(creatorId) -> address
- createCreatorToken(name, symbol) -> creatorId
- getCreatorInfo(creatorId) -> Creator
```

### CreatorMarketplace.sol

```solidity
// Main functions:
- buyTokens(creatorId, amount) payable
- getMinimumTokensRequired(creatorId) -> uint256
- getContentCID(creatorId) -> string
- setContentCID(creatorId, cid) // Creator only
- getTokenPrice(creatorId) -> uint256
```

### CreatorToken.sol (ERC-20)

```solidity
// Standard ERC-20 functions:
- balanceOf(owner) -> uint256
- name() -> string
- symbol() -> string
- totalSupply() -> uint256
- transfer(to, amount) -> bool
- owner() -> address
```

## ⚙️ Setup & Configuration

### 1. Environment Variables

Copy `.env.example` to `.env.local` and update with your values:

```bash
# Smart Contract Addresses
NEXT_PUBLIC_CREATOR_FACTORY_ADDRESS=0x...
NEXT_PUBLIC_CREATOR_MARKETPLACE_ADDRESS=0x...

# RPC URLs
NEXT_PUBLIC_ETHEREUM_RPC_URL=https://eth-mainnet.alchemyapi.io/v2/your-api-key
NEXT_PUBLIC_AVALANCHE_RPC_URL=https://api.avax.network/ext/bc/C/rpc

# Network Configuration
NEXT_PUBLIC_CHAIN_ID=1
NEXT_PUBLIC_NETWORK_NAME=ethereum

# Web3.Storage (for IPFS uploads)
WEB3_STORAGE_TOKEN=your-web3-storage-token

# CoinGecko API
NEXT_PUBLIC_COINGECKO_API_URL=https://api.coingecko.com/api/v3
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`.

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Home page with creator listings
│   ├── creator/[id]/      # Individual creator pages
│   ├── creators/          # All creators listing
│   └── upload/            # Content upload for creators
├── components/            # Reusable React components
│   ├── WalletConnect.tsx  # Wallet connection component
│   ├── CreatorCard.tsx    # Creator display card
│   ├── Navigation.tsx     # Main navigation
│   ├── LoadingSpinner.tsx # Loading states
│   └── ErrorState.tsx     # Error handling
├── context/              # React Context providers
│   └── Web3Context.tsx   # Web3 state management
├── lib/                  # Utility libraries
│   ├── web3.ts           # Web3 service layer
│   ├── contracts.ts      # Contract ABIs and config
│   ├── contractService.ts # Smart contract interactions
│   ├── ipfs.ts           # IPFS upload/fetch service
│   └── priceService.ts   # Token price fetching
└── styles/
    └── globals.css       # Global styles with Tailwind
```

## 🔗 Key User Flows

### User Journey

1. **Connect Wallet** → MetaMask connection with network switching
2. **Browse Creators** → View all available creator tokens and prices
3. **Select Creator** → View creator profile and content preview
4. **Check Access** → Automatic token balance verification
5. **Buy Tokens** → Purchase tokens if insufficient balance
6. **Access Content** → Unlock and view exclusive content

### Creator Journey

1. **Connect Wallet** → Verify creator ownership
2. **Upload Content** → Select creator token and upload files
3. **IPFS Storage** → Content uploaded to decentralized storage
4. **Smart Contract** → Content CID stored on blockchain
5. **Token Gating** → Only token holders can access content

## 🚨 Security Considerations

- **Contract Validation**: All contract addresses verified before interactions
- **Access Control**: Token balance checked before content access
- **IPFS Security**: Content hash validation for integrity
- **Wallet Security**: No private keys stored, MetaMask handles signing
- **Error Handling**: Graceful handling of transaction failures
- **Rate Limiting**: Built-in protection against spam transactions

## 🌐 Network Support

Configured for multiple EVM-compatible networks:

- **Ethereum Mainnet** (default)
- **Avalanche C-Chain**
- **Polygon**
- **BSC**
- Any EVM-compatible testnet

Network switching handled automatically through MetaMask.

## 📊 Price Integration

Token prices fetched from:

- **Primary**: CoinGecko API for listed tokens
- **Fallback**: Default pricing for unlisted tokens
- **Real-time**: 24h price changes and trending indicators

## 🎨 UI/UX Features

- **Responsive Design**: Mobile-first responsive layout
- **Loading States**: Skeleton screens and progress indicators
- **Error Boundaries**: Graceful error handling and recovery
- **Accessibility**: ARIA labels and keyboard navigation
- **Dark Mode Ready**: Tailwind classes support dark mode
- **Animations**: Smooth transitions and micro-interactions

## 🔧 Development Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Type checking
npm run type-check
```

## 📝 Additional Notes

- **IPFS Integration**: Currently using Web3.Storage, easily configurable for other IPFS providers
- **Gas Optimization**: Smart contract calls optimized for minimal gas usage
- **Caching**: Price data and contract calls cached for better performance
- **Scalability**: Designed to handle multiple creators and high user volumes

## 🤝 Contributing

This project is designed to be easily extensible. Key areas for contribution:

- Additional IPFS providers
- More token price sources
- Enhanced creator analytics
- Mobile app companion
- Advanced content types

## 📄 License

MIT License - feel free to use this for your own creator token marketplace!
