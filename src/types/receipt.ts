export interface ReceiptData {
  id: string;
  timestamp: number;
  merchant: string;
  date: string;
  total: number;
  items: ReceiptItem[];
  rawText: string;
  imageUrl: string;
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