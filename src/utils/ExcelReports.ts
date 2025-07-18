import * as XLSX from 'xlsx';
import type { ReceiptData } from '../types/receipt';

export function exportToExcel(receipts: ReceiptData[]): void {
  // Create workbook
  const workbook = XLSX.utils.book_new();

  // Create summary sheet
  const summaryData = receipts.map((receipt, index) => ({
    'Receipt #': index + 1,
    'Name': receipt.merchant,
    'Date': receipt.date,
    'Total Amount': receipt.total,
    // 'Items Count': receipt.items.length,
    'Scan Date': new Date(receipt.timestamp).toLocaleDateString(),
    'Raw Text': receipt.rawText.replace(/\n/g, ' ').substring(0, 100) + '...'
  }));

  const summarySheet = XLSX.utils.json_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Receipt Summary');

  // Create detailed items sheet
  const itemsData: any[] = [];
  receipts.forEach((receipt, receiptIndex) => {
    if (receipt.items.length > 0) {
      receipt.items.forEach((item, itemIndex) => {
        itemsData.push({
          'Receipt #': receiptIndex + 1,
          'Name': receipt.merchant,
          'Receipt Date': receipt.date,
          'Item #': itemIndex + 1,
          'Item Name': item.name,
          'Quantity': item.quantity || 1,
          'Price': item.price || 0,
          'Total Amount': receipt.total
        });
      });
    } else {
      // Add receipt without items
      itemsData.push({
        'Receipt #': receiptIndex + 1,
        'Name': receipt.merchant,
        'Receipt Date': receipt.date,
        'Item #': 1,
        'Item Name': 'No items detected',
        'Quantity': 0,
        'Price': 0,
        'Total Amount': receipt.total
      });
    }
  });

  const itemsSheet = XLSX.utils.json_to_sheet(itemsData);
  XLSX.utils.book_append_sheet(workbook, itemsSheet, 'Receipt Items');

  // Create raw text sheet for full OCR results
  const rawTextData = receipts.map((receipt, index) => ({
    'Receipt #': index + 1,
    'Name': receipt.merchant,
    'Date': receipt.date,
    'Total': receipt.total,
    'Scan Date': new Date(receipt.timestamp).toLocaleDateString(),
    'Full OCR Text': receipt.rawText
  }));

  const rawTextSheet = XLSX.utils.json_to_sheet(rawTextData);
  XLSX.utils.book_append_sheet(workbook, rawTextSheet, 'Raw OCR Text');

  // Generate filename with current date
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const filename = `receipts_export_${dateStr}.xlsx`;

  // Write and download file
  XLSX.writeFile(workbook, filename);
}

export function exportSingleReceiptToExcel(receipt: ReceiptData): void {
  exportToExcel([receipt]);
}

// Function to convert image URL to base64 for embedding in Excel
export async function convertImageToBase64(imageUrl: string): Promise<string> {
  try {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error converting image to base64:', error);
    return '';
  }
}