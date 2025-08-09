"use client";

import React, { useState, useEffect } from "react";
import { contractService, Creator } from "@/lib/contractService";
import { useWeb3 } from "@/context/Web3Context";
import CreatorCard, { CreatorCardSkeleton } from "@/components/CreatorCard";
import WalletConnect from "@/components/WalletConnect";
import ErrorState from "@/components/ErrorState";
import { Coins, Users, TrendingUp, Globe } from "lucide-react";

export default function HomePage() {
  const { isConnected } = useWeb3();
  const [creators, setCreators] = useState<Creator[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isConnected) {
      fetchCreators();
    }
  }, [isConnected]);

  const fetchCreators = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const creatorsData = await contractService.getCreators();
      setCreators(creatorsData);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const stats = [
    {
      label: "Total Creators",
      value: creators.length.toString(),
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      label: "Active Tokens",
      value: creators.length.toString(),
      icon: Coins,
      color: "text-green-600",
      bg: "bg-green-100",
    },
    {
      label: "Platform Growth",
      value: "+12%",
      icon: TrendingUp,
      color: "text-purple-600",
      bg: "bg-purple-100",
    },
  ];

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-12">
              <div className="flex items-center justify-center mb-6">
                <div className="flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl">
                  <Globe className="w-8 h-8 text-white" />
                </div>
              </div>
              
              <h1 className="text-5xl font-bold text-gray-900 mb-6">
                Welcome to <span className="text-blue-600">CreatorWeb3</span>
              </h1>
              
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                The decentralized marketplace where creators tokenize their content 
                and supporters unlock exclusive access through creator tokens.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-4">
                  <Coins className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Creator Tokens
                </h3>
                <p className="text-gray-600">
                  Each creator has their own ERC-20 token that grants access to exclusive content.
                </p>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mx-auto mb-4">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Community Access
                </h3>
                <p className="text-gray-600">
                  Hold creator tokens to unlock premium content and exclusive creator experiences.
                </p>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-4">
                  <Globe className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Decentralized
                </h3>
                <p className="text-gray-600">
                  Built on blockchain with IPFS storage for truly decentralized content distribution.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Get Started
              </h2>
              <p className="text-gray-600 mb-6">
                Connect your wallet to explore creators and start collecting tokens.
              </p>
              <WalletConnect />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Creator Marketplace
        </h1>
        <p className="text-gray-600">
          Discover creators and unlock exclusive content with creator tokens.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center">
                <div className={`flex items-center justify-center w-12 h-12 ${stat.bg} rounded-lg`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div>
        {error ? (
          <ErrorState error={error} onRetry={fetchCreators} />
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Featured Creators
              </h2>
              <span className="text-sm text-gray-600">
                {creators.length} creator{creators.length !== 1 ? 's' : ''} found
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {isLoading ? (
                <CreatorCardSkeleton count={6} />
              ) : creators.length > 0 ? (
                creators.map((creator) => (
                  <CreatorCard key={creator.id} creator={creator} />
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No creators found
                  </h3>
                  <p className="text-gray-600">
                    Be the first to create a creator token on this platform!
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
