"use client";

import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface ErrorStateProps {
  error: string;
  onRetry?: () => void;
  className?: string;
}

export default function ErrorState({ error, onRetry, className = "" }: ErrorStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center ${className}`}>
      <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mb-4">
        <AlertTriangle className="w-6 h-6 text-red-600" />
      </div>
      
      <h3 className="text-lg font-medium text-gray-900 mb-2">Something went wrong</h3>
      
      <p className="text-gray-600 mb-4 max-w-md">{error}</p>
      
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
      )}
    </div>
  );
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorState
          error={this.state.error?.message || "An unexpected error occurred"}
          onRetry={() => window.location.reload()}
          className="min-h-screen bg-gray-50"
        />
      );
    }

    return this.props.children;
  }
}
