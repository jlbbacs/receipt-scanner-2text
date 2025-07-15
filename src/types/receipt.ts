export interface ReceiptData {
  id: string;
  timestamp: number;
  merchant: string;
  date: string;
  total: number;
  items: ReceiptItem[];
  rawText: string;
  imageUrl: string;
  imageData?: string; // Base64 encoded image data for export
}

export interface ReceiptItem {
  name: string;
  quantity?: number;
  price?: number;
}

export interface OCRProgress {
  status: string;
  progress: number;
}