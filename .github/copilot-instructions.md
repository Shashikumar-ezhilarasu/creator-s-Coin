<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

This is a Next.js TypeScript Web3 Creator Token marketplace project with the following key characteristics:

## Project Structure

- **Framework**: Next.js 15 with App Router, TypeScript, TailwindCSS
- **Web3 Integration**: Ethers.js for blockchain interactions, MetaMask wallet connection
- **IPFS**: Using @web3-storage/w3up-client for decentralized content storage
- **Smart Contracts**: CreatorToken (ERC20), CreatorFactory, CreatorMarketplace

## Key Components

- Wallet connection and management
- Smart contract interactions for creator tokens
- IPFS content upload and retrieval
- Token balance checks and purchases
- Creator content access control

## Coding Standards

- Use TypeScript strict mode
- Follow Next.js App Router conventions
- Use Tailwind for all styling
- Implement proper error handling for Web3 operations
- Use async/await for blockchain calls
- Implement loading states for all async operations

## Web3 Integration Patterns

- Always check wallet connection before contract interactions
- Handle user rejection of transactions gracefully
- Show gas estimation where applicable
- Use provider switching for different networks
- Implement proper error messages for common Web3 errors

## Security Considerations

- Validate smart contract addresses
- Sanitize IPFS content
- Check token balances before allowing access
- Verify creator ownership before allowing uploads
  c
