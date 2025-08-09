"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Creator } from "@/lib/contractService";
import { priceService } from "@/lib/priceService";
import { User, TrendingUp, TrendingDown, Coins, ExternalLink } from "lucide-react";
import { LoadingButton } from "./LoadingSpinner";

interface CreatorCardProps {
  creator: Creator;
}

export default function CreatorCard({ creator }: CreatorCardProps) {
  const [tokenPrice, setTokenPrice] = useState<number | null>(null);
  const [priceChange, setPriceChange] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTokenPrice();
  }, [creator.tokenAddress]);

  const fetchTokenPrice = async () => {
    try {
      setIsLoading(true);
      const price = await priceService.getTokenPrice(creator.tokenAddress);
      setTokenPrice(price.usd);
      setPriceChange(price.change24h);
    } catch (error) {
      console.warn("Failed to fetch token price:", error);
      setTokenPrice(0.01); // Fallback price
    } finally {
      setIsLoading(false);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{creator.name}</h3>
              <p className="text-sm text-gray-600">#{creator.id}</p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <Coins className="w-4 h-4" />
              {creator.symbol}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {formatAddress(creator.tokenAddress)}
            </p>
          </div>
        </div>
      </div>

      {/* Token Info */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-gray-600">Token Price</span>
          {isLoading ? (
            <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
          ) : tokenPrice !== null ? (
            <div className="text-right">
              <span className="font-medium">
                {priceService.formatPrice(tokenPrice)}
              </span>
              {priceChange !== 0 && (
                <div className={`flex items-center gap-1 text-xs ${priceService.getPriceChangeColor(priceChange)}`}>
                  {priceChange > 0 ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  {priceService.formatPriceChange(priceChange)}
                </div>
              )}
            </div>
          ) : (
            <span className="text-gray-400">--</span>
          )}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Creator</span>
          <span className="text-sm font-mono">
            {formatAddress(creator.owner)}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="p-6">
        <div className="flex gap-3">
          <Link 
            href={`/creator/${creator.id}`}
            className="flex-1"
          >
            <LoadingButton
              isLoading={false}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              View Creator
            </LoadingButton>
          </Link>
          
          <a
            href={`https://etherscan.io/token/${creator.tokenAddress}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center px-3 py-2 border border-gray-300 hover:border-gray-400 rounded-lg transition-colors"
            title="View on Etherscan"
          >
            <ExternalLink className="w-4 h-4 text-gray-600" />
          </a>
        </div>
      </div>
    </div>
  );
}

interface CreatorCardSkeletonProps {
  count?: number;
}

export function CreatorCardSkeleton({ count = 1 }: CreatorCardSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse"></div>
                <div>
                  <div className="w-24 h-5 bg-gray-200 rounded animate-pulse mb-2"></div>
                  <div className="w-12 h-4 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
              <div className="text-right">
                <div className="w-16 h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="w-20 h-3 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          </div>

          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="flex items-center justify-between">
              <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-24 h-4 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>

          <div className="p-6">
            <div className="flex gap-3">
              <div className="flex-1 h-10 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-10 h-10 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}
