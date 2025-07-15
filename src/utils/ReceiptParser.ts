import type { ReceiptData, ReceiptItem } from '../types/receipt';

export function parseReceiptText(text: string): Partial<ReceiptData> {
  const lines = text.split('\n').filter(line => line.trim().length > 0);
  
  // Extract merchant name (usually first few lines)
  const merchant = extractMerchant(lines);
  
  // Extract date
  const date = extractDate(text);
  
  // Extract total
  const total = extractTotal(text);
  
  // Extract items
  const items = extractItems(lines);
  
  return {
    merchant,
    date,
    total,
    items,
    rawText: text
  };
}

function extractMerchant(lines: string[]): string {
  // Look for merchant name in first few lines
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const line = lines[i].trim();
    if (line.length > 3 && line.length < 50 && !line.includes('$') && !line.includes('RECEIPT')) {
      // Skip lines that look like addresses or phone numbers
      if (!/^\d+\s/.test(line) && !/\(\d{3}\)/.test(line)) {
        return line;
      }
    }
  }
  return 'Unknown Merchant';
}

function extractDate(text: string): string {
  // Common date patterns
  const datePatterns = [
    /\b(\d{1,2}\/\d{1,2}\/\d{2,4})\b/,
    /\b(\d{1,2}-\d{1,2}-\d{2,4})\b/,
    /\b(\d{4}-\d{2}-\d{2})\b/,
    /\b(\w{3}\s+\d{1,2},?\s+\d{4})\b/
  ];
  
  for (const pattern of datePatterns) {
    const match = text.match(pattern);
    if (match) {
      return match[1];
    }
  }
  
  return new Date().toLocaleDateString();
}

function extractTotal(text: string): number {
  // Look for total patterns
  const totalPatterns = [
    /(?:TOTAL|Total|AMOUNT|Amount|BALANCE|Balance)[:\s]*\$?(\d+\.\d{2})/i,
    /(?:TOTAL|Total)[:\s]*(\d+\.\d{2})/i,
    /\$(\d+\.\d{2})\s*(?:TOTAL|Total)/i
  ];
  
  for (const pattern of totalPatterns) {
    const match = text.match(pattern);
    if (match) {
      return parseFloat(match[1]);
    }
  }
  
  // Fallback: look for largest dollar amount
  const amounts = text.match(/\$(\d+\.\d{2})/g);
  if (amounts) {
    const values = amounts.map(amt => parseFloat(amt.replace('$', '')));
    return Math.max(...values);
  }
  
  return 0;
}

function extractItems(lines: string[]): ReceiptItem[] {
  const items: ReceiptItem[] = [];
  
  for (const line of lines) {
    // Look for lines with item name and price
    const itemMatch = line.match(/^(.+?)\s+\$?(\d+\.\d{2})$/);
    if (itemMatch) {
      const name = itemMatch[1].trim();
      const price = parseFloat(itemMatch[2]);
      
      // Skip lines that are likely totals or taxes
      if (!name.toLowerCase().includes('total') && 
          !name.toLowerCase().includes('tax') && 
          !name.toLowerCase().includes('subtotal') &&
          name.length > 2) {
        items.push({ name, price });
      }
    }
  }
  
  return items;
}