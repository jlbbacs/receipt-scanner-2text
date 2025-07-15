import React, { useCallback, useState } from 'react';
import { Upload, FileImage, X, Camera } from 'lucide-react';

interface ImageUploadProps {
  onImageSelect: (file: File) => void;
  onCameraClick: () => void;
  isProcessing: boolean;
}

export function ImageUpload({ onImageSelect, onCameraClick, isProcessing }: ImageUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        handleFileSelect(file);
      }
    }
  }, []);

  const handleFileSelect = (file: File) => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      onImageSelect(file);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
  };

  return (
    <div className="w-full max-w-sm sm:max-w-md mx-auto">
      {!selectedImage ? (
        <div
          className={`relative border-2 border-dashed rounded-lg p-6 sm:p-8 text-center transition-all duration-200 ${
            dragActive
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          } ${isProcessing ? 'opacity-50 pointer-events-none' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept="image/*"
            onChange={handleInputChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={isProcessing}
          />
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="p-3 sm:p-4 bg-gray-100 rounded-full">
              <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-gray-600" />
            </div>
            <div>
              <p className="text-base sm:text-lg font-medium text-gray-700">
                Drop receipt image here
              </p>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                or click to browse (JPG, PNG)
              </p>
            </div>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 mt-4 w-full sm:w-auto">
              <button
                onClick={onCameraClick}
                className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors w-full sm:w-auto"
                disabled={isProcessing}
              >
                <Camera className="w-4 h-4" />
                <span>Use Camera</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative">
          <img
            src={selectedImage}
            alt="Selected receipt"
            className="w-full max-h-64 sm:max-h-96 object-contain rounded-lg shadow-md"
          />
          <button
            onClick={clearImage}
            className="absolute top-2 right-2 p-1.5 sm:p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
            disabled={isProcessing}
          >
            <X className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>
        </div>
      )}
    </div>
  );
}