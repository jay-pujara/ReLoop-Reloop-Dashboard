import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, RefreshCw, ArrowRight, DollarSign, Calendar, MessageSquare, ShieldCheck } from 'lucide-react';

export default function CounterOfferModal({ request, isOpen, onClose }) {
  const { counterOrderRequest } = useApp();

  if (!isOpen || !request) return null;

  const [counterPrice, setCounterPrice] = useState(
    request.offeredPricePerKg ? (request.offeredPricePerKg * 1.05).toFixed(2) : '1.15'
  );
  const [counterQty, setCounterQty] = useState(request.requestedQty_kg || 10000);
  const [newWindow, setNewWindow] = useState('2026-09-28 to 2026-10-02');
  const [message, setMessage] = useState(
    'We can provide certified moisture-controlled flakes at this adjusted rate, including loading inspection.'
  );

  const totalCalculated = Math.round(Number(counterPrice) * Number(counterQty));

  const handleSubmit = (e) => {
    e.preventDefault();
    counterOrderRequest(request.id, {
      pricePerKg: Number(counterPrice),
      qty_kg: Number(counterQty),
      totalValue: totalCalculated,
      newWindow: newWindow,
      message: message,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-floating border border-gray-200 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center text-[#7201FF]">
              <RefreshCw className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-black">Submit Counter-Offer</h3>
              <span className="text-[11px] text-gray-500">
                Propose adjusted commercial terms to {request.buyerOrg}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Original Buyer Request Info */}
        <div className="bg-gray-50 rounded-2xl p-3.5 border border-gray-100 text-xs">
          <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">
            Buyer's Original Request ({request.id})
          </span>
          <div className="flex items-center justify-between font-bold text-black text-[13px] mb-1">
            <span>{request.listingTitle}</span>
            <span className="font-mono text-purple-700">€{request.offeredPricePerKg?.toFixed(2)}/kg</span>
          </div>
          <div className="text-[11px] text-gray-600 flex flex-wrap gap-x-4 gap-y-1 mt-1">
            <span>Volume: <b className="text-black">{request.requestedQty_kg?.toLocaleString()} kg</b></span>
            <span>Total: <b className="text-black">€{request.totalValue?.toLocaleString()}</b></span>
            <span>Pickup: <b className="text-black">{request.preferredPickup || 'Immediate'}</b></span>
          </div>
          {request.notes && (
            <p className="text-[11px] text-gray-500 italic mt-2 bg-white p-2 rounded-xl border border-gray-200">
              "{request.notes}"
            </p>
          )}
        </div>

        {/* Counter Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-gray-700 mb-1">
                Counter Price (€ / kg)
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3 font-mono font-bold text-gray-500">€</span>
                <input
                  type="number"
                  step="0.01"
                  value={counterPrice}
                  onChange={(e) => setCounterPrice(e.target.value)}
                  required
                  className="w-full pl-7 pr-3 py-2 bg-white border border-gray-200 rounded-xl font-mono font-bold text-black focus:ring-1 focus:ring-[#7201FF] outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-700 mb-1">
                Counter Volume (kg)
              </label>
              <div className="relative flex items-center">
                <input
                  type="number"
                  step="500"
                  value={counterQty}
                  onChange={(e) => setCounterQty(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl font-mono font-bold text-black focus:ring-1 focus:ring-[#7201FF] outline-hidden"
                />
                <span className="absolute right-3 font-mono text-[11px] text-gray-500 font-bold">kg</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-700 mb-1">
              Adjusted Availability / Loading Window
            </label>
            <input
              type="text"
              value={newWindow}
              onChange={(e) => setNewWindow(e.target.value)}
              placeholder="e.g. 2026-09-28 to 2026-10-02"
              className="w-full p-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-black focus:ring-1 focus:ring-[#7201FF] outline-hidden"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-700 mb-1">
              Counter Message / Explanation
            </label>
            <textarea
              rows={2}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Reason for rate adjustment, batch availability, or logistics constraints..."
              className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs text-black placeholder-gray-400 focus:ring-1 focus:ring-[#7201FF] outline-hidden resize-none"
            />
          </div>

          {/* Value Preview */}
          <div className="bg-purple-50/70 border border-purple-100 rounded-2xl p-3 flex items-center justify-between">
            <div>
              <span className="text-[10.5px] font-bold text-purple-900 block">
                Adjusted Total Order Value
              </span>
              <span className="text-sm font-black font-mono text-[#7201FF]">
                €{totalCalculated.toLocaleString()}
              </span>
            </div>
            <span className="text-[10.5px] text-purple-700 font-semibold bg-white px-2.5 py-1 rounded-full border border-purple-200">
              Awaiting Buyer Acceptance
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white hover:bg-gray-100 border border-gray-200 rounded-full text-xs font-semibold text-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#7201FF] hover:bg-purple-700 text-white rounded-full text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Send Counter-Offer</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
