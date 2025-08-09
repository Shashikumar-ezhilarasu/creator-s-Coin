"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { web3Service } from "@/lib/web3";

interface Web3ContextType {
  // Connection state
  isConnected: boolean;
  isConnecting: boolean;
  walletAddress: string | null;
  walletBalance: string | null;
  
  // Actions
  connectWallet: () => Promise<void>;
  disconnectWallet: () => Promise<void>;
  
  // Error state
  error: string | null;
  clearError: () => void;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

interface Web3ProviderProps {
  children: ReactNode;
}

export function Web3Provider({ children }: Web3ProviderProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [walletBalance, setWalletBalance] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Check if wallet is already connected on mount
  useEffect(() => {
    checkConnection();
    setupEventListeners();

    return () => {
      web3Service.removeAllListeners();
    };
  }, []);

  const checkConnection = async () => {
    try {
      const connected = await web3Service.isConnected();
      if (connected) {
        const address = await web3Service.getWalletAddress();
        if (address) {
          setWalletAddress(address);
          setIsConnected(true);
          await updateWalletBalance();
        }
      }
    } catch (error: any) {
      console.warn("Failed to check wallet connection:", error.message);
    }
  };

  const setupEventListeners = () => {
    web3Service.onAccountChanged(async (accounts) => {
      if (accounts.length === 0) {
        handleDisconnect();
      } else {
        setWalletAddress(accounts[0]);
        await updateWalletBalance();
      }
    });

    web3Service.onChainChanged(() => {
      // Reload the page when chain changes to ensure consistency
      window.location.reload();
    });
  };

  const connectWallet = async () => {
    if (isConnecting) return;

    setIsConnecting(true);
    setError(null);

    try {
      const address = await web3Service.connectWallet();
      setWalletAddress(address);
      setIsConnected(true);
      await updateWalletBalance();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = async () => {
    try {
      await web3Service.disconnect();
      handleDisconnect();
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setWalletAddress(null);
    setWalletBalance(null);
  };

  const updateWalletBalance = async () => {
    try {
      const balance = await web3Service.getWalletBalance();
      setWalletBalance(balance);
    } catch (error: any) {
      console.warn("Failed to update wallet balance:", error.message);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value: Web3ContextType = {
    isConnected,
    isConnecting,
    walletAddress,
    walletBalance,
    connectWallet,
    disconnectWallet,
    error,
    clearError,
  };

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
}

export function useWeb3() {
  const context = useContext(Web3Context);
  if (context === undefined) {
    throw new Error("useWeb3 must be used within a Web3Provider");
  }
  return context;
}

// Custom hook for wallet requirement
export function useRequireWallet() {
  const { isConnected, connectWallet, isConnecting } = useWeb3();

  const requireConnection = async () => {
    if (!isConnected && !isConnecting) {
      await connectWallet();
    }
  };

  return {
    isConnected,
    requireConnection,
    isConnecting,
  };
}
