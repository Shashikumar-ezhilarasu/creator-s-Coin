"use client";

import React from "react";
import { useWeb3 } from "@/context/Web3Context";
import { Wallet, LogOut, AlertCircle, Loader2 } from "lucide-react";

export default function WalletConnect() {
  const { 
    isConnected, 
    isConnecting, 
    walletAddress, 
    walletBalance, 
    connectWallet, 
    disconnectWallet, 
    error, 
    clearError 
  } = useWeb3();

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatBalance = (balance: string) => {
    const num = parseFloat(balance);
    return num.toFixed(4);
  };

  if (error) {
    return (
      <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
        <AlertCircle className="w-5 h-5 text-red-600" />
        <span className="text-red-700 text-sm">{error}</span>
        <button
          onClick={clearError}
          className="ml-auto text-red-600 hover:text-red-800"
        >
          ×
        </button>
      </div>
    );
  }

  if (isConnected && walletAddress) {
    return (
      <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <Wallet className="w-5 h-5 text-green-600" />
        </div>
        
        <div className="flex-1">
          <div className="text-sm font-medium text-gray-900">
            {formatAddress(walletAddress)}
          </div>
          {walletBalance && (
            <div className="text-xs text-gray-600">
              {formatBalance(walletBalance)} ETH
            </div>
          )}
        </div>
        
        <button
          onClick={disconnectWallet}
          className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={connectWallet}
      disabled={isConnecting}
      className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors"
    >
      {isConnecting ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          Connecting...
        </>
      ) : (
        <>
          <Wallet className="w-5 h-5" />
          Connect Wallet
        </>
      )}
    </button>
  );
}

// Compact version for navigation
export function WalletConnectCompact() {
  const { 
    isConnected, 
    isConnecting, 
    walletAddress, 
    connectWallet, 
    disconnectWallet 
  } = useWeb3();

  if (isConnected && walletAddress) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-sm rounded">
          <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
          {formatAddress(walletAddress)}
        </div>
        <button
          onClick={disconnectWallet}
          className="p-1 text-gray-500 hover:text-red-600 transition-colors"
          title="Disconnect"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={connectWallet}
      disabled={isConnecting}
      className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm rounded transition-colors"
    >
      {isConnecting ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Wallet className="w-4 h-4" />
      )}
      {isConnecting ? "..." : "Connect"}
    </button>
  );

  function formatAddress(address: string) {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }
}
