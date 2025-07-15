import  { useState, useEffect, useRef } from 'react';
import { createWorker } from 'tesseract.js';
import { Camera, Receipt, History } from 'lucide-react';
import { ImageUpload } from './components/ImageUpload';
import { CameraCapture } from './components/CameraCapture';
import { OCRProgress } from './components/OCRProgress';
import { ReceiptResults } from '../src/components/ReceiptResult';
import { ReceiptHistory } from './components/ReceiptHistory';
import type{ ReceiptData, OCRProgress as OCRProgressType } from './types/receipt';
import  { parseReceiptText } from './utils/ReceiptParser';
import { saveReceipt, getReceipts, deleteReceipt } from './utils/LocalStorage';

type AppState = 'upload' | 'processing' | 'results' | 'history';

function App() {
  const [currentState, setCurrentState] = useState<AppState>('upload');
  const [showCamera, setShowCamera] = useState(false);
  const [ocrProgress, setOcrProgress] = useState<OCRProgressType>({ status: '', progress: 0 });
  const [currentReceipt, setCurrentReceipt] = useState<ReceiptData | null>(null);
  const [receipts, setReceipts] = useState<ReceiptData[]>([]);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string>('');
  const workerRef = useRef<any>(null);
  const ocrProgressRef = useRef(setOcrProgress);

  // Update the ref whenever setOcrProgress changes
  useEffect(() => {
    ocrProgressRef.current = setOcrProgress;
  }, [setOcrProgress]);

  // Initialize worker once when component mounts
  useEffect(() => {
    const initializeWorker = async () => {
      try {
        const worker = await createWorker('eng', 1, {
          logger: (m) => {
            ocrProgressRef.current({
              status: m.status,
              progress: m.progress || 0
            });
          }
        });
        
        await worker.setParameters({
          tessedit_char_whitelist: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz .,/$-:',
        });
        
        workerRef.current = worker;
      } catch (error) {
        console.error('Failed to initialize OCR worker:', error);
      }
    };

    initializeWorker();

    // Cleanup worker on unmount
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
      }
    };
  }, []);

  useEffect(() => {
    setReceipts(getReceipts());
  }, []);

  const handleImageSelect = async (file: File) => {
    setCurrentState('processing');
    
    // Create image URL for display
    const imageUrl = URL.createObjectURL(file);
    setSelectedImageUrl(imageUrl);

    try {
      if (!workerRef.current) {
        throw new Error('OCR worker not initialized');
      }

      const { data: { text } } = await workerRef.current.recognize(file);

      // Parse the extracted text
      const parsedData = parseReceiptText(text);
      
      const receipt: ReceiptData = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        merchant: parsedData.merchant || 'Unknown Merchant',
        date: parsedData.date || new Date().toLocaleDateString(),
        total: parsedData.total || 0,
        items: parsedData.items || [],
        rawText: text,
        imageUrl: imageUrl
      };

      setCurrentReceipt(receipt);
      setCurrentState('results');
    } catch (error) {
      console.error('OCR failed:', error);
      alert('Failed to process the image. Please try again.');
      setCurrentState('upload');
    }
  };

  const handleSaveReceipt = () => {
    if (currentReceipt) {
      saveReceipt(currentReceipt);
      setReceipts(getReceipts());
      setCurrentState('history');
    }
  };

  const handleDeleteReceipt = (id: string) => {
    deleteReceipt(id);
    setReceipts(getReceipts());
  };

  const handleNewScan = () => {
    setCurrentReceipt(null);
    setSelectedImageUrl('');
    setCurrentState('upload');
    setShowCamera(true);
  };

  const handleCameraClick = () => {
    setShowCamera(true);
  };

  const handleCameraClose = () => {
    setShowCamera(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-4 sm:py-8">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="p-2 sm:p-3 bg-blue-600 rounded-full">
              <Camera className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Receipt Scanner</h1>
          </div>
          <p className="text-sm sm:text-base text-gray-600 max-w-md mx-auto px-4">
            Upload receipt images and automatically extract text and data using OCR technology
          </p>
        </div>

        {/* Navigation */}
        <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4 mb-6 sm:mb-8 px-4">
          <button
            onClick={handleNewScan}
            className={`flex items-center justify-center space-x-2 px-4 sm:px-6 py-3 rounded-lg font-medium transition-colors w-full sm:w-auto ${
              currentState === 'upload' || currentState === 'processing' || currentState === 'results'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Receipt className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>New Scan</span>
          </button>
          <button
            onClick={() => setCurrentState('history')}
            className={`flex items-center justify-center space-x-2 px-4 sm:px-6 py-3 rounded-lg font-medium transition-colors w-full sm:w-auto ${
              currentState === 'history'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <History className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>History ({receipts.length})</span>
          </button>
        </div>

        {/* Main Content */}
        <div className="flex justify-center px-4">
          {currentState === 'upload' && (
            <ImageUpload 
              onImageSelect={handleImageSelect} 
              onCameraClick={handleCameraClick}
              isProcessing={false} 
            />
          )}
          
          {currentState === 'processing' && (
            <OCRProgress progress={ocrProgress} />
          )}
          
          {currentState === 'results' && currentReceipt && (
            <ReceiptResults receipt={currentReceipt} onSave={handleSaveReceipt} />
          )}
          
          {currentState === 'history' && (
            <ReceiptHistory receipts={receipts} onDelete={handleDeleteReceipt} />
          )}
        </div>

        {/* Camera Modal */}
        {showCamera && (
          <CameraCapture
            onImageCapture={handleImageSelect}
            onClose={handleCameraClose}
            isProcessing={currentState === 'processing'}
          />
        )}
      </div>
    </div>
  );
}

export default App;