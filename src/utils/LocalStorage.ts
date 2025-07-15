import type { ReceiptData } from '../types/receipt';
import { convertImageToBase64 } from '../utils/ExcelReports';

const STORAGE_KEY = 'scanned_receipts';

export async function saveReceipt(receipt: ReceiptData): Promise<void> {
  // Convert image to base64 for better storage and export
  if (receipt.imageUrl && !receipt.imageData) {
    try {
      receipt.imageData = await convertImageToBase64(receipt.imageUrl);
    } catch (error) {
      console.error('Failed to convert image to base64:', error);
    }
  }
  
  const receipts = getReceipts();
  receipts.unshift(receipt);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(receipts));
}

export function getReceipts(): ReceiptData[] {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function deleteReceipt(id: string): void {
  const receipts = getReceipts().filter(receipt => receipt.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(receipts));
}

export function searchReceipts(query: string): ReceiptData[] {
  const receipts = getReceipts();
  if (!query.trim()) return receipts;
  
  return receipts.filter(receipt => 
    receipt.merchant.toLowerCase().includes(query.toLowerCase()) ||
    receipt.rawText.toLowerCase().includes(query.toLowerCase())
  );
}