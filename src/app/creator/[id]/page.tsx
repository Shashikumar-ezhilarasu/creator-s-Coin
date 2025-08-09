"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { contractService, Creator, TokenInfo } from "@/lib/contractService";
import { ipfsService } from "@/lib/ipfs";
import { priceService } from "@/lib/priceService";
import { useWeb3 } from "@/context/Web3Context";
import { LoadingState } from "@/components/LoadingSpinner";
import { LoadingButton } from "@/components/LoadingSpinner";
import ErrorState from "@/components/ErrorState";
import {
  User,
  Coins,
  Lock,
  Unlock,
  ExternalLink,
  TrendingUp,
  TrendingDown,
  FileText,
  Image as ImageIcon,
  Video,
} from "lucide-react";

export default function CreatorPage() {
  const params = useParams();
  const creatorId = params.id as string;
  const { isConnected, walletAddress } = useWeb3();

  const [creator, setCreator] = useState<Creator | null>(null);
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [minTokens, setMinTokens] = useState<string>("0");
  const [tokenPrice, setTokenPrice] = useState<number>(0);
  const [priceChange, setPriceChange] = useState<number>(0);
  const [content, setContent] = useState<any>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isBuying, setIsBuying] = useState(false);
  const [buyAmount, setBuyAmount] = useState("1");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isConnected && creatorId) {
      fetchCreatorData();
    }
  }, [isConnected, creatorId, walletAddress]);

  const fetchCreatorData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch basic creator info
      const creatorData = await contractService.getCreatorInfo(creatorId);
      setCreator(creatorData);

      // Fetch token information
      const tokenData = await contractService.getTokenInfo(creatorData.tokenAddress);
      setTokenInfo(tokenData);

      // Fetch minimum tokens required
      const minTokensRequired = await contractService.getMinimumTokensRequired(creatorId);
      setMinTokens(minTokensRequired);

      // Check if user has access
      if (walletAddress) {
        const access = await contractService.checkTokenAccess(creatorId, walletAddress);
        setHasAccess(access);
      }

      // Fetch token price
      const price = await priceService.getTokenPrice(creatorData.tokenAddress);
      setTokenPrice(price.usd);
      setPriceChange(price.change24h);

      // Fetch content if user has access
      if (walletAddress) {
        const access = await contractService.checkTokenAccess(creatorId, walletAddress);
        if (access) {
          await fetchContent();
        }
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchContent = async () => {
    try {
      const cid = await contractService.getContentCID(creatorId);
      if (cid) {
        const contentData = await ipfsService.fetchFromIPFS(cid);
        setContent(contentData);
      }
    } catch (error) {
      console.warn("Failed to fetch content:", error);
    }
  };

  const handleBuyTokens = async () => {
    if (!buyAmount || parseFloat(buyAmount) <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    try {
      setIsBuying(true);
      setError(null);

      const txHash = await contractService.buyTokens(creatorId, buyAmount);
      
      // Wait for transaction and refresh data
      setTimeout(() => {
        fetchCreatorData();
      }, 3000);

      setBuyAmount("1");
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsBuying(false);
    }
  };

  const calculateCost = () => {
    const amount = parseFloat(buyAmount) || 0;
    return amount * tokenPrice;
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Connect Your Wallet
          </h1>
          <p className="text-gray-600">
            Please connect your wallet to view creator details and access content.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <LoadingState message="Loading creator details..." />;
  }

  if (error && !creator) {
    return <ErrorState error={error} onRetry={fetchCreatorData} />;
  }

  if (!creator) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Creator Not Found
          </h1>
          <p className="text-gray-600">
            The creator you're looking for doesn't exist or has been removed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Creator Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full">
                <User className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{creator.name}</h1>
                <p className="text-gray-600">Creator #{creator.id}</p>
                <p className="text-sm text-gray-500 font-mono">
                  {formatAddress(creator.owner)}
                </p>
              </div>
            </div>
            
            <div className="text-right">
              <div className="flex items-center gap-2 mb-2">
                <Coins className="w-5 h-5 text-gray-600" />
                <span className="font-semibold">{creator.symbol}</span>
              </div>
              <a
                href={`https://etherscan.io/token/${creator.tokenAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
              >
                View Token <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Token Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Your Balance</p>
              <p className="text-lg font-semibold text-gray-900">
                {tokenInfo?.balance || "0"}
              </p>
            </div>
            
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Required</p>
              <p className="text-lg font-semibold text-gray-900">
                {minTokens}
              </p>
            </div>
            
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Token Price</p>
              <div className="flex items-center justify-center gap-1">
                <p className="text-lg font-semibold text-gray-900">
                  {priceService.formatPrice(tokenPrice)}
                </p>
                {priceChange !== 0 && (
                  <div className={`flex items-center ${priceService.getPriceChangeColor(priceChange)}`}>
                    {priceChange > 0 ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                  </div>
                )}
              </div>
            </div>
            
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Total Supply</p>
              <p className="text-lg font-semibold text-gray-900">
                {tokenInfo?.totalSupply ? parseFloat(tokenInfo.totalSupply).toFixed(0) : "0"}
              </p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Content Area */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                {hasAccess ? (
                  <>
                    <Unlock className="w-5 h-5 text-green-600" />
                    <h2 className="text-xl font-semibold text-gray-900">
                      Exclusive Content
                    </h2>
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5 text-gray-600" />
                    <h2 className="text-xl font-semibold text-gray-900">
                      Content Preview
                    </h2>
                  </>
                )}
              </div>

              {hasAccess ? (
                <div>
                  {content ? (
                    <div className="space-y-4">
                      {typeof content === "string" ? (
                        <div className="prose max-w-none">
                          <div className="whitespace-pre-wrap">{content}</div>
                        </div>
                      ) : (
                        <div>
                          <h3 className="font-semibold mb-2">{content.title || "Exclusive Content"}</h3>
                          <p className="text-gray-600 mb-4">{content.description}</p>
                          {content.files && content.files.map((file: any, index: number) => (
                            <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                              {file.type?.startsWith("image/") ? (
                                <ImageIcon className="w-5 h-5 text-blue-600" />
                              ) : file.type?.startsWith("video/") ? (
                                <Video className="w-5 h-5 text-purple-600" />
                              ) : (
                                <FileText className="w-5 h-5 text-gray-600" />
                              )}
                              <span>{file.name}</span>
                              <a
                                href={ipfsService.getIPFSUrl(file.cid)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="ml-auto text-blue-600 hover:text-blue-700"
                                title="View file on IPFS"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-600">
                      You have access to this creator's content, but no content has been uploaded yet.
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Lock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Content Locked
                  </h3>
                  <p className="text-gray-600 mb-4">
                    You need at least {minTokens} {creator.symbol} tokens to access this content.
                  </p>
                  <p className="text-sm text-gray-500">
                    Your current balance: {tokenInfo?.balance || "0"} {creator.symbol}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Purchase Panel */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Get Access
              </h3>

              {hasAccess ? (
                <div className="text-center py-4">
                  <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mx-auto mb-3">
                    <Unlock className="w-6 h-6 text-green-600" />
                  </div>
                  <p className="text-green-700 font-medium">
                    You have access!
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Enjoy the exclusive content
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Amount to Buy
                    </label>
                    <input
                      type="number"
                      value={buyAmount}
                      onChange={(e) => setBuyAmount(e.target.value)}
                      min="0"
                      step="0.1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter amount"
                    />
                  </div>

                  <div className="text-sm text-gray-600 space-y-1">
                    <div className="flex justify-between">
                      <span>Price per token:</span>
                      <span>{priceService.formatPrice(tokenPrice)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total cost:</span>
                      <span className="font-semibold">
                        {priceService.formatPrice(calculateCost())}
                      </span>
                    </div>
                  </div>

                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-red-700 text-sm">{error}</p>
                    </div>
                  )}

                  <LoadingButton
                    onClick={handleBuyTokens}
                    isLoading={isBuying}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {isBuying ? "Purchasing..." : "Buy Tokens"}
                  </LoadingButton>

                  <p className="text-xs text-gray-500 text-center">
                    You need {minTokens} tokens minimum for access
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
