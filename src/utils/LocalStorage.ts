import type { ReceiptData } from '../types/receipt';

const STORAGE_KEY = 'scanned_receipts';

export function saveReceipt(receipt: ReceiptData): void {
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