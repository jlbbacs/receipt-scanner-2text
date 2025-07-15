import React from 'react';
import type { ReceiptData } from '../types/receipt';
import { Store, Calendar, DollarSign, ShoppingCart, Save } from 'lucide-react';

interface ReceiptResultsProps {
  receipt: ReceiptData;
  onSave: () => void;
}

export function ReceiptResults({ receipt, onSave }: ReceiptResultsProps) {
  return (
    <div className="w-full max-w-sm sm:max-w-2xl mx-auto p-4 sm:p-6 bg-white rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg sm:text-xl font-bold text-gray-800">Receipt Details</h3>
        <button
          onClick={onSave}
          className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm sm:text-base"
        >
          <Save className="w-4 h-4" />
          <span>Save</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6">
        <div className="flex items-center space-x-2 sm:space-x-3 p-3 bg-gray-50 rounded-lg">
          <Store className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
          <div>
            <p className="text-xs sm:text-sm text-gray-600">Merchant</p>
            <p className="text-sm sm:text-base font-semibold text-gray-800 truncate">{receipt.merchant}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-3 p-3 bg-gray-50 rounded-lg">
          <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
          <div>
            <p className="text-xs sm:text-sm text-gray-600">Date</p>
            <p className="text-sm sm:text-base font-semibold text-gray-800">{receipt.date}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-3 p-3 bg-gray-50 rounded-lg">
          <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
          <div>
            <p className="text-xs sm:text-sm text-gray-600">Total</p>
            <p className="text-sm sm:text-base font-semibold text-gray-800">${receipt.total.toFixed(2)}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-3 p-3 bg-gray-50 rounded-lg">
          <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
          <div>
            <p className="text-xs sm:text-sm text-gray-600">Items</p>
            <p className="text-sm sm:text-base font-semibold text-gray-800">{receipt.items.length}</p>
          </div>
        </div>
      </div>

      {receipt.items.length > 0 && (
        <div className="mb-6">
          <h4 className="text-base sm:text-lg font-semibold text-gray-800 mb-3">Items</h4>
          <div className="space-y-2">
            {receipt.items.map((item, index) => (
              <div key={index} className="flex justify-between items-center p-2 sm:p-3 bg-gray-50 rounded-lg">
                <span className="text-sm sm:text-base text-gray-800 truncate flex-1 mr-2">{item.name}</span>
                {item.price && (
                  <span className="text-sm sm:text-base font-semibold text-gray-800 whitespace-nowrap">${item.price.toFixed(2)}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h4 className="text-base sm:text-lg font-semibold text-gray-800 mb-3">Raw Text</h4>
        <div className="p-3 sm:p-4 bg-gray-50 rounded-lg max-h-24 sm:max-h-32 overflow-y-auto">
          <pre className="text-xs sm:text-sm text-gray-700 whitespace-pre-wrap">{receipt.rawText}</pre>
        </div>
      </div>
    </div>
  );
}