import React from 'react';
import { Loader2, Eye } from 'lucide-react';
import type { OCRProgress as OCRProgressType } from '../types/receipt';

interface OCRProgressProps {
  progress: OCRProgressType;
}

export function OCRProgress({ progress }: OCRProgressProps) {
  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'loading tesseract core':
        return 'Loading OCR engine...';
      case 'initializing tesseract':
        return 'Initializing OCR...';
      case 'loading language traineddata':
        return 'Loading language data...';
      case 'initializing api':
        return 'Starting analysis...';
      case 'recognizing text':
        return 'Scanning receipt...';
      default:
        return 'Processing image...';
    }
  };

  return (
    <div className="w-full max-w-sm sm:max-w-md mx-auto p-4 sm:p-6 bg-white rounded-lg shadow-md">
      <div className="flex items-center justify-center mb-4">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Eye className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
            <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 animate-spin absolute -top-1 -right-1" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-800">
              Scanning Receipt
            </h3>
            <p className="text-xs sm:text-sm text-gray-600">
              {getStatusMessage(progress.status)}
            </p>
          </div>
        </div>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${Math.round(progress.progress * 100)}%` }}
        />
      </div>
      
      <p className="text-center text-xs sm:text-sm text-gray-500 mt-2">
        {Math.round(progress.progress * 100)}% complete
      </p>
    </div>
  );
}