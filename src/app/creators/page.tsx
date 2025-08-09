"use client";

import React, { useState, useEffect } from "react";
import { contractService, Creator } from "@/lib/contractService";
import { useWeb3 } from "@/context/Web3Context";
import CreatorCard, { CreatorCardSkeleton } from "@/components/CreatorCard";
import ErrorState from "@/components/ErrorState";
import { Search, Filter, Users } from "lucide-react";

export default function CreatorsPage() {
  const { isConnected } = useWeb3();
  const [creators, setCreators] = useState<Creator[]>([]);
  const [filteredCreators, setFilteredCreators] = useState<Creator[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "id" | "symbol">("name");

  useEffect(() => {
    if (isConnected) {
      fetchCreators();
    }
  }, [isConnected]);

  useEffect(() => {
    filterAndSortCreators();
  }, [creators, searchTerm, sortBy]);

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

  const filterAndSortCreators = () => {
    let filtered = creators;

    // Filter by search term
    if (searchTerm) {
      filtered = creators.filter((creator) =>
        creator.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        creator.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        creator.id.includes(searchTerm)
      );
    }

    // Sort creators
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "id":
          return parseInt(a.id) - parseInt(b.id);
        case "symbol":
          return a.symbol.localeCompare(b.symbol);
        default:
          return 0;
      }
    });

    setFilteredCreators(filtered);
  };

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Connect Your Wallet
          </h1>
          <p className="text-gray-600">
            Please connect your wallet to explore creators and their tokens.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          All Creators
        </h1>
        <p className="text-gray-600">
          Explore all creators on the platform and discover exclusive content.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search creators by name, symbol, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "name" | "id" | "symbol")}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              title="Sort creators by"
            >
              <option value="name">Sort by Name</option>
              <option value="id">Sort by ID</option>
              <option value="symbol">Sort by Symbol</option>
            </select>
          </div>
        </div>

        {/* Results Summary */}
        <div className="mt-4 text-sm text-gray-600">
          {isLoading ? (
            "Loading creators..."
          ) : (
            `Showing ${filteredCreators.length} of ${creators.length} creators`
          )}
        </div>
      </div>

      {/* Content */}
      {error ? (
        <ErrorState error={error} onRetry={fetchCreators} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            <CreatorCardSkeleton count={9} />
          ) : filteredCreators.length > 0 ? (
            filteredCreators.map((creator) => (
              <CreatorCard key={creator.id} creator={creator} />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? "No creators found" : "No creators available"}
              </h3>
              <p className="text-gray-600">
                {searchTerm
                  ? `No creators match "${searchTerm}". Try adjusting your search.`
                  : "Be the first to create a creator token on this platform!"
                }
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
