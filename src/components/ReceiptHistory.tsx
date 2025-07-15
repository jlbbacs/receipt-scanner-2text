import React, { useState } from 'react';
import type { ReceiptData } from '../types/receipt';
import { Search, Trash2, Store, Calendar, DollarSign } from 'lucide-react';

interface ReceiptHistoryProps {
  receipts: ReceiptData[];
  onDelete: (id: string) => void;
}

export function ReceiptHistory({ receipts, onDelete }: ReceiptHistoryProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredReceipts = receipts.filter(receipt => 
    receipt.merchant.toLowerCase().includes(searchQuery.toLowerCase()) ||
    receipt.rawText.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (receipts.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No receipts scanned yet</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Receipt History</h2>
        <div className="relative">
          <Search className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search receipts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-auto"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
        {filteredReceipts.map((receipt) => (
          <div key={receipt.id} className="bg-white p-3 sm:p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Store className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm sm:text-base font-semibold text-gray-800 truncate">{receipt.merchant}</h3>
              </div>
              <button
                onClick={() => onDelete(receipt.id)}
                className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded flex-shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                <span className="truncate">{receipt.date}</span>
              </div>
              <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600">
                <DollarSign className="w-4 h-4" />
                <span>${receipt.total.toFixed(2)}</span>
              </div>
            </div>

            {receipt.imageUrl && (
              <img
                src={receipt.imageUrl}
                alt="Receipt"
                className="w-full h-24 sm:h-32 object-cover rounded-lg mb-3"
              />
            )}

            <div className="text-xs text-gray-500 truncate">
              Scanned on {new Date(receipt.timestamp).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>

      {filteredReceipts.length === 0 && searchQuery && (
        <div className="text-center py-8">
          <p className="text-gray-500">No receipts found matching "{searchQuery}"</p>
        </div>
      )}
    </div>
  );
}