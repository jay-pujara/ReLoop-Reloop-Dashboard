import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  X,
  MessageSquare,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Building2,
  Calendar,
  DollarSign,
  Package,
} from 'lucide-react';

export default function RequestQuoteModal({ listing, isOpen, onClose, initialQty = null }) {
  const { org, facilities, createOrderRequest } = useApp();
  const navigate = useNavigate();

  if (!isOpen || !listing) return null;

  const defaultQty = initialQty || Math.min(listing.mass_kg, 10000);
  const [requestedQty, setRequestedQty] = useState(defaultQty);
  const [targetPrice, setTargetPrice] = useState(
    listing.price_per_kg ? (listing.price_per_kg * 0.95).toFixed(2) : '1.00'
  );
  const [deliveryFacility, setDeliveryFacility] = useState(
    facilities[0]?.name || 'Rotterdam Circular Hub (HQ)'
  );
  const [preferredDate, setPreferredDate] = useState('2026-10-01');
  const [notes, setNotes] = useState(
    'Requesting volume batch test. Please confirm if moisture is below 0.05% and COA can be provided.'
  );
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedOrderId, setSubmittedOrderId] = useState(null);

  const totalOfferedValue = Math.round(Number(requestedQty) * Number(targetPrice));
  const estCo2Saved = Math.round(Number(requestedQty) * 1.34);

  const handleSubmit = (e) => {
    e.preventDefault();
    const order = createOrderRequest({
      type: 'quote_request',
      listingId: listing.id,
      listingTitle: listing.title,
      buyerOrg: org.name,
      buyerContact: 'Marcus Vance (Trading Specialist)',
      buyerVerified: org.verificationStatus === 'verified',
      sellerOrg: listing.sellerOrg,
      requestedQty_kg: Number(requestedQty),
      offeredPricePerKg: Number(targetPrice),
      totalValue: totalOfferedValue,
      deliveryFacility: deliveryFacility,
      pickupFacility: listing.facilityName || 'Seller Hub',
      preferredPickup: preferredDate,
      logisticsType: 'platform',
      notes: notes,
    });

    setSubmittedOrderId(order.id);
    setIsSubmitted(true);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-floating border border-gray-200 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center text-[#7201FF]">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-black">
                {isSubmitted ? 'Quote Request Sent' : 'Negotiate & Request Quote'}
              </h3>
              <span className="text-[11px] text-gray-500">
                Direct commercial inquiry with seller
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

        {isSubmitted ? (
          /* Confirmation State */
          <div className="py-6 flex flex-col items-center text-center gap-3">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h4 className="text-base font-extrabold text-black">
              Proposal Submitted to {listing.sellerOrg}
            </h4>
            <p className="text-xs text-gray-600 max-w-sm">
              Your inquiry <span className="font-mono font-bold text-black">{submittedOrderId}</span> for{' '}
              <span className="font-bold">{requestedQty.toLocaleString()} kg</span> at{' '}
              <span className="font-bold">€{Number(targetPrice).toFixed(2)}/kg</span> has been placed in the seller’s inbox.
            </p>
            <div className="flex items-center gap-3 mt-4">
              <button
                onClick={() => {
                  onClose();
                  navigate('/orders');
                }}
                className="px-5 py-2.5 bg-black text-white hover:bg-neutral-800 rounded-full text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <span>View in Orders</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-black rounded-full text-xs font-semibold transition-colors"
              >
                Back to Marketplace
              </button>
            </div>
          </div>
        ) : (
          /* Input Form */
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-xs">
            
            {/* Listing Summary Card */}
            <div className="bg-gray-50 rounded-2xl p-3 border border-gray-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-gray-400 block">Target Lot</span>
                <span className="font-extrabold text-black text-xs block truncate max-w-[260px]">
                  {listing.title}
                </span>
                <span className="text-[11px] text-gray-500">
                  Seller: {listing.sellerOrg} · Listed at €{listing.price_per_kg?.toFixed(2)}/kg
                </span>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                Negotiable
              </span>
            </div>

            {/* Target Price & Requested Quantity */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">
                  Proposed Target Price (€ / kg)
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 font-mono font-bold text-gray-500">€</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0.05"
                    max={listing.price_per_kg ? listing.price_per_kg * 2 : 10}
                    value={targetPrice}
                    onChange={(e) => setTargetPrice(e.target.value)}
                    required
                    className="w-full pl-7 pr-3 py-2 bg-white border border-gray-200 rounded-xl font-mono font-bold text-black focus:ring-1 focus:ring-[#7201FF] outline-hidden"
                  />
                </div>
                <span className="text-[10px] text-gray-500 mt-0.5 block">
                  Original: €{listing.price_per_kg?.toFixed(2)}/kg
                </span>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">
                  Requested Volume (kg)
                </label>
                <div className="relative flex items-center">
                  <input
                    type="number"
                    step="500"
                    min="500"
                    max={listing.mass_kg || 100000}
                    value={requestedQty}
                    onChange={(e) => setRequestedQty(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl font-mono font-bold text-black focus:ring-1 focus:ring-[#7201FF] outline-hidden"
                  />
                  <span className="absolute right-3 font-mono text-[11px] text-gray-500 font-bold">kg</span>
                </div>
                <span className="text-[10px] text-gray-500 mt-0.5 block">
                  Max available: {listing.mass_kg?.toLocaleString()} kg
                </span>
              </div>
            </div>

            {/* Delivery Facility & Window */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">
                  Receiving Facility
                </label>
                <select
                  value={deliveryFacility}
                  onChange={(e) => setDeliveryFacility(e.target.value)}
                  className="w-full p-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-black focus:ring-1 focus:ring-[#7201FF] outline-hidden"
                >
                  {facilities.map((fac) => (
                    <option key={fac.id} value={fac.name}>
                      {fac.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">
                  Requested Pickup / Delivery
                </label>
                <input
                  type="date"
                  value={preferredDate}
                  onChange={(e) => setPreferredDate(e.target.value)}
                  className="w-full p-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-black focus:ring-1 focus:ring-[#7201FF] outline-hidden"
                />
              </div>
            </div>

            {/* Note / Terms to Seller */}
            <div>
              <label className="block text-[11px] font-bold text-gray-700 mb-1">
                Commercial Note / Specifications to Seller
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Mention quality requirements, delivery preferences, or recurring contract terms..."
                className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs text-black placeholder-gray-400 focus:ring-1 focus:ring-[#7201FF] outline-hidden resize-none"
              />
            </div>

            {/* Projected Cost & ESG Preview */}
            <div className="bg-purple-50/60 border border-purple-100 rounded-2xl p-3 flex items-center justify-between">
              <div>
                <span className="text-[10.5px] font-bold text-purple-900 block">
                  Projected Commercial Value
                </span>
                <span className="text-sm font-black font-mono text-[#7201FF]">
                  €{totalOfferedValue.toLocaleString()}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-gray-600 block">Est. Net CO₂e Saved</span>
                <span className="text-xs font-black font-mono text-emerald-700">
                  -{estCo2Saved.toLocaleString()} kg
                </span>
              </div>
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
                className="px-5 py-2.5 bg-black hover:bg-neutral-800 text-white rounded-full text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Send Quote Request</span>
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
}
