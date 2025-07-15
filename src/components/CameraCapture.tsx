import React, { useRef, useState, useCallback } from 'react';
import { Camera, X, RotateCcw, Check } from 'lucide-react';

interface CameraCaptureProps {
  onImageCapture: (file: File) => void;
  onClose: () => void;
  isProcessing: boolean;
}

export function CameraCapture({ onImageCapture, onClose, isProcessing }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startCamera = useCallback(async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Use back camera on mobile
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsStreaming(true);
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Unable to access camera. Please check permissions or use file upload instead.');
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsStreaming(false);
  }, []);

  const captureImage = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw the video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to blob and create file
    canvas.toBlob((blob) => {
      if (blob) {
        const imageUrl = canvas.toDataURL('image/jpeg', 0.8);
        setCapturedImage(imageUrl);
        stopCamera();
      }
    }, 'image/jpeg', 0.8);
  }, [stopCamera]);

  const confirmCapture = useCallback(() => {
    if (!canvasRef.current || !capturedImage) return;

    canvasRef.current.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `receipt-${Date.now()}.jpg`, {
          type: 'image/jpeg'
        });
        onImageCapture(file);
        onClose(); // Close camera after capturing
      }
    }, 'image/jpeg', 0.8);
  }, [capturedImage, onImageCapture]);

  const retakePhoto = useCallback(() => {
    setCapturedImage(null);
    startCamera();
  }, [startCamera]);

  React.useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [startCamera, stopCamera]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
      <div className="relative w-full h-full">
        {/* Header */}
        <div className="absolute top-2 sm:top-4 left-2 sm:left-4 right-2 sm:right-4 z-10 flex items-center justify-between">
          <h3 className="text-white text-base sm:text-lg font-semibold">Scan Receipt</h3>
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-colors"
            disabled={isProcessing}
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="absolute top-12 sm:top-16 left-2 sm:left-4 right-2 sm:right-4 z-10 p-3 sm:p-4 bg-red-600 text-white rounded-lg">
            <p className="text-sm sm:text-base">{error}</p>
          </div>
        )}

        {/* Camera View */}
        {!capturedImage && (
          <div className="relative w-full h-full flex items-center justify-center">
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              playsInline
              muted
            />
            
            {/* Capture Overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="border-2 border-white border-dashed rounded-lg w-64 h-48 sm:w-80 sm:h-60 flex items-center justify-center mx-4">
                <p className="text-white text-center text-sm sm:text-base px-4">
                  Position receipt within this frame
                </p>
              </div>
            </div>

            {/* Capture Button */}
            {isStreaming && (
              <div className="absolute bottom-4 sm:bottom-8 left-1/2 transform -translate-x-1/2">
                <button
                  onClick={captureImage}
                  className="w-12 h-12 sm:w-16 sm:h-16 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
                  disabled={isProcessing}
                >
                  <Camera className="w-6 h-6 sm:w-8 sm:h-8 text-gray-800" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Captured Image Preview */}
        {capturedImage && (
          <div className="relative w-full h-full flex flex-col items-center justify-center p-2 sm:p-4">
            <img
              src={capturedImage}
              alt="Captured receipt"
              className="max-w-full max-h-[60vh] sm:max-h-[70vh] object-contain rounded-lg"
            />
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 mt-4 sm:mt-6 w-full max-w-xs sm:max-w-none">
              <button
                onClick={retakePhoto}
                className="flex items-center justify-center space-x-2 px-4 sm:px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors w-full sm:w-auto"
                disabled={isProcessing}
              >
                <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Retake</span>
              </button>
              <button
                onClick={confirmCapture}
                className="flex items-center justify-center space-x-2 px-4 sm:px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors w-full sm:w-auto"
                disabled={isProcessing}
              >
                <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Use Photo</span>
              </button>
            </div>
          </div>
        )}

        {/* Hidden canvas for image processing */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
}