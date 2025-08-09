"use client";

import React, { useState, useEffect } from "react";
import { contractService, Creator } from "@/lib/contractService";
import { ipfsService } from "@/lib/ipfs";
import { useWeb3 } from "@/context/Web3Context";
import { LoadingButton } from "@/components/LoadingSpinner";
import ErrorState from "@/components/ErrorState";
import {
  Upload as UploadIcon,
  FileText,
  Image as ImageIcon,
  Video,
  Plus,
  X,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

interface FileUpload {
  file: File;
  type: string;
  preview?: string;
}

export default function UploadPage() {
  const { isConnected, walletAddress } = useWeb3();
  const [creators, setCreators] = useState<Creator[]>([]);
  const [selectedCreator, setSelectedCreator] = useState<string>("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<FileUpload[]>([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isConnected && walletAddress) {
      fetchCreators();
    }
  }, [isConnected, walletAddress]);

  const fetchCreators = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const allCreators = await contractService.getCreators();
      // Filter creators owned by the current user
      const userCreators = allCreators.filter(
        creator => creator.owner.toLowerCase() === walletAddress?.toLowerCase()
      );
      
      setCreators(userCreators);
      
      if (userCreators.length === 1) {
        setSelectedCreator(userCreators[0].id);
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    
    selectedFiles.forEach(file => {
      if (file.size > 50 * 1024 * 1024) { // 50MB limit
        setError(`File ${file.name} is too large. Maximum size is 50MB.`);
        return;
      }

      const fileUpload: FileUpload = {
        file,
        type: file.type,
      };

      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          fileUpload.preview = e.target?.result as string;
          setFiles(prev => [...prev, fileUpload]);
        };
        reader.readAsDataURL(file);
      } else {
        setFiles(prev => [...prev, fileUpload]);
      }
    });

    // Reset the input
    event.target.value = '';
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return ImageIcon;
    if (type.startsWith('video/')) return Video;
    return FileText;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleUpload = async () => {
    if (!selectedCreator || !title.trim()) {
      setError("Please select a creator and provide a title");
      return;
    }

    if (files.length === 0) {
      setError("Please select at least one file to upload");
      return;
    }

    try {
      setIsUploading(true);
      setError(null);
      setUploadProgress(["Starting upload..."]);

      // Upload files to IPFS
      const uploadedFiles = [];
      
      for (let i = 0; i < files.length; i++) {
        const fileData = files[i];
        setUploadProgress(prev => [
          ...prev,
          `Uploading ${fileData.file.name} (${i + 1}/${files.length})...`
        ]);
        
        const result = await ipfsService.uploadFile(fileData.file);
        uploadedFiles.push({
          name: fileData.file.name,
          type: fileData.file.type,
          size: fileData.file.size,
          cid: result.cid,
          url: result.url,
        });
      }

      // Create metadata
      const metadata = {
        title: title.trim(),
        description: description.trim(),
        createdAt: new Date().toISOString(),
        creator: selectedCreator,
        files: uploadedFiles,
      };

      setUploadProgress(prev => [...prev, "Uploading metadata..."]);
      const metadataResult = await ipfsService.uploadJSON(metadata);

      // Store CID in smart contract
      setUploadProgress(prev => [...prev, "Storing content reference..."]);
      await contractService.setContentCID(selectedCreator, metadataResult.cid);

      setUploadProgress(prev => [...prev, "Upload complete!"]);
      setSuccess(true);

      // Reset form
      setTimeout(() => {
        setTitle("");
        setDescription("");
        setFiles([]);
        setSelectedCreator(creators.length === 1 ? creators[0].id : "");
        setSuccess(false);
        setUploadProgress([]);
      }, 3000);

    } catch (error: any) {
      setError(error.message);
      setUploadProgress([]);
    } finally {
      setIsUploading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <UploadIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Connect Your Wallet
          </h1>
          <p className="text-gray-600">
            Please connect your wallet to upload content for your creators.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your creators...</p>
        </div>
      </div>
    );
  }

  if (creators.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            No Creator Tokens Found
          </h1>
          <p className="text-gray-600 mb-6">
            You don't have any creator tokens yet. Create a creator token first to upload content.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">How to create a creator token:</h3>
            <ol className="text-sm text-blue-800 text-left space-y-1">
              <li>1. Use the CreatorFactory contract to create a new token</li>
              <li>2. Set your creator name and token symbol</li>
              <li>3. Configure minimum tokens required for access</li>
              <li>4. Return here to upload content for your supporters</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Upload Content
          </h1>
          <p className="text-gray-600">
            Upload exclusive content for your token holders to access.
          </p>
        </div>

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-green-800 font-medium">Content uploaded successfully!</span>
            </div>
            <p className="text-green-700 text-sm mt-1">
              Your content is now available to token holders.
            </p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <form onSubmit={(e) => { e.preventDefault(); handleUpload(); }} className="space-y-6">
            {/* Creator Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Creator
              </label>
              <select
                value={selectedCreator}
                onChange={(e) => setSelectedCreator(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                title="Select a creator"
              >
                {creators.length > 1 && <option value="">Choose a creator...</option>}
                {creators.map((creator) => (
                  <option key={creator.id} value={creator.id}>
                    {creator.name} ({creator.symbol}) - ID #{creator.id}
                  </option>
                ))}
              </select>
            </div>

            {/* Content Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter a title for your content"
                required
              />
            </div>

            {/* Content Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe your content..."
              />
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Files
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                <input
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                  accept="image/*,video/*,application/pdf,.txt,.doc,.docx"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <UploadIcon className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-600 mb-1">
                    Click to upload or drag and drop
                  </span>
                  <span className="text-xs text-gray-500">
                    Images, videos, documents (max 50MB each)
                  </span>
                </label>
              </div>
            </div>

            {/* Selected Files */}
            {files.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">
                  Selected Files ({files.length})
                </h3>
                <div className="space-y-2">
                  {files.map((fileData, index) => {
                    const Icon = getFileIcon(fileData.type);
                    return (
                      <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        {fileData.preview ? (
                          <img
                            src={fileData.preview}
                            alt={fileData.file.name}
                            className="w-10 h-10 object-cover rounded"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                            <Icon className="w-5 h-5 text-gray-600" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {fileData.file.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatFileSize(fileData.file.size)}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                          title="Remove file"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Upload Progress */}
            {uploadProgress.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-blue-900 mb-2">Upload Progress</h3>
                <div className="space-y-1">
                  {uploadProgress.map((step, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-blue-800">
                      <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      {step}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <span className="text-red-800 font-medium">Upload Error</span>
                </div>
                <p className="text-red-700 text-sm mt-1">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <LoadingButton
              type="submit"
              isLoading={isUploading}
              disabled={!selectedCreator || !title.trim() || files.length === 0}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-3"
            >
              {isUploading ? "Uploading Content..." : "Upload Content"}
            </LoadingButton>
          </form>
        </div>
      </div>
    </div>
  );
}
