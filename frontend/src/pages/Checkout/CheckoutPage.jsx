import React, { useState } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  CheckCircle2,
  Truck,
  ShieldCheck,
  Building2,
  Calendar,
  Leaf,
  ArrowRight,
  ArrowLeft,
  Package,
  FileText,
  AlertCircle,
  Zap,
} from 'lucide-react';

export default function CheckoutPage() {
  const { listingId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const {
    listings,
    shortlist,
    removeFromShortlist,
    clearShortlist,
    facilities,
    org,
    createOrderRequest,
  } = useApp();

  const isCartSource = searchParams.get('source') === 'cart' || !listingId;
  const initialQtyParam = Number(searchParams.get('qty'));

  // Collect items to checkout
  let checkoutItems = [];
  if (isCartSource) {
    checkoutItems = shortlist
      .map((s) => {
        const l = listings.find((item) => item.id === s.listingId);
        if (!l) return null;
        return {
          listing: l,
          qty_kg: s.qty_kg || l.mass_kg,
        };
      })
      .filter(Boolean);
  } else {
    const singleListing = listings.find((l) => l.id === listingId);
    if (singleListing) {
      checkoutItems = [
        {
          listing: singleListing,
          qty_kg: initialQtyParam || singleListing.mass_kg || 10000,
        },
      ];
    }
  }

  // Wizard steps: 1 = Order Details, 2 = Logistics, 3 = Review & Submit
  const [step, setStep] = useState(1);

  // Form State
  const [quantities, setQuantities] = useState(
    checkoutItems.reduce((acc, item) => {
      acc[item.listing.id] = item.qty_kg;
      return acc;
    }, {})
  );
  const [selectedFacility, setSelectedFacility] = useState(
    facilities[0]?.name || 'Rotterdam Circular Hub (HQ)'
  );
  const [deliveryDate, setDeliveryDate] = useState('2026-09-22');
  const [logisticsMode, setLogisticsMode] = useState('platform'); // 'platform' | 'self' | 'seller'
  const [orderNotes, setOrderNotes] = useState(
    'Please ensure moisture inspection certificate is attached with digital CMR.'
  );
  const [termsAgreed, setTermsAgreed] = useState(true);

  if (checkoutItems.length === 0) {
    return (
      <div className="w-full max-w-lg mx-auto px-6 py-20 text-center flex flex-col items-center">
        <AlertCircle className="w-12 h-12 text-amber-500 mb-3" />
        <h2 className="text-xl font-bold text-black mb-1">No Items Selected for Checkout</h2>
        <p className="text-xs text-gray-500 mb-6">
          Please select a listing from the marketplace or items from your shortlist.
        </p>
        <Link
          to="/listings"
          className="px-5 py-2.5 bg-black text-white rounded-full text-xs font-bold"
        >
          Return to Marketplace
        </Link>
      </div>
    );
  }

  const handleQtyChange = (id, val, max) => {
    const num = Math.min(Number(val) || 0, max);
    setQuantities((prev) => ({ ...prev, [id]: num }));
  };

  // Calculations
  const calculatedItems = checkoutItems.map(({ listing }) => {
    const qty = quantities[listing.id] ?? listing.mass_kg;
    const price = listing.price_per_kg || 1;
    const subtotal = Math.round(qty * price);
    const co2Saved = Math.round(qty * 1.34);
    return {
      listing,
      qty,
      price,
      subtotal,
      co2Saved,
    };
  });

  const totalGrossKg = calculatedItems.reduce((acc, curr) => acc + curr.qty, 0);
  const totalSubtotal = calculatedItems.reduce((acc, curr) => acc + curr.subtotal, 0);
  const totalCo2Saved = calculatedItems.reduce((acc, curr) => acc + curr.co2Saved, 0);
  const freightEstimate = logisticsMode === 'platform' ? Math.round(450 + totalGrossKg * 0.03) : 0;
  const platformAssuranceFee = Math.round(totalSubtotal * 0.02);
  const totalCommitment = totalSubtotal + freightEstimate + platformAssuranceFee;

  const handleSubmitOrder = (e) => {
    e.preventDefault();
    if (!termsAgreed) return;

    // Create order requests for each item
    calculatedItems.forEach((item) => {
      createOrderRequest({
        type: 'buy_now',
        listingId: item.listing.id,
        listingTitle: item.listing.title,
        buyerOrg: org.name,
        buyerContact: 'Marcus Vance (Procurement)',
        buyerVerified: org.verificationStatus === 'verified',
        sellerOrg: item.listing.sellerOrg,
        requestedQty_kg: item.qty,
        offeredPricePerKg: item.price,
        totalValue: item.subtotal,
        deliveryFacility: selectedFacility,
        pickupFacility: item.listing.facilityName || 'Seller Hub',
        preferredPickup: deliveryDate,
        logisticsType: logisticsMode,
        notes: orderNotes,
      });

      if (isCartSource) {
        removeFromShortlist(item.listing.id);
      }
    });

    navigate('/orders');
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-6 py-8 flex flex-col gap-8">
      
      {/* Checkout Steps Progress Bar */}
      <div className="flex items-center justify-between border-b border-gray-200/80 pb-6">
        <div>
          <h1 className="text-2xl font-black text-black tracking-tight">
            Commercial Purchase Checkout
          </h1>
          <span className="text-xs text-gray-500">
            {isCartSource ? `Consolidated Multi-Lot (${calculatedItems.length} items)` : 'Single Lot Purchase'}
          </span>
        </div>

        {/* Step Indicator Pills */}
        <div className="flex items-center gap-2">
          {[
            { num: 1, label: 'Order Specs' },
            { num: 2, label: 'Logistics' },
            { num: 3, label: 'Review & Confirm' },
          ].map((s) => (
            <button
              key={s.num}
              onClick={() => s.num < step && setStep(s.num)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                step === s.num
                  ? 'bg-black text-white shadow-xs'
                  : step > s.num
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-gray-100 text-gray-500'
              }`}
            >
              <span>{s.num}.</span>
              <span>{s.label}</span>
              {step > s.num && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
            </button>
          ))}
        </div>
      </div>

      {/* Main Form Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Step Content (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 border border-gray-200/90 shadow-xs flex flex-col gap-6">
          
          {/* STEP 1: Order Details & Quantities */}
          {step === 1 && (
            <div className="flex flex-col gap-5 animate-in fade-in duration-150">
              <div className="border-b border-gray-100 pb-3">
                <h3 className="text-base font-extrabold text-black">
                  Step 1: Quantities &amp; Receiving Facility
                </h3>
                <span className="text-xs text-gray-500">
                  Specify requested batch weights and destination hub.
                </span>
              </div>

              {/* Items List */}
              <div className="flex flex-col gap-4">
                {calculatedItems.map(({ listing, qty, price, subtotal }) => (
                  <div
                    key={listing.id}
                    className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between"
                  >
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-bold uppercase text-gray-400 block">
                        {listing.materialType} · {listing.grade}
                      </span>
                      <h4 className="font-extrabold text-sm text-black truncate">
                        {listing.title}
                      </h4>
                      <span className="text-[11px] text-gray-500">
                        Seller: {listing.sellerOrg} · Origin: {listing.facilityName}
                      </span>
                      <div className="text-xs font-mono font-bold text-black mt-1">
                        €{price.toFixed(2)} / kg
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 block mb-0.5">
                          Procure Qty:
                        </label>
                        <div className="flex items-center">
                          <input
                            type="number"
                            step="500"
                            min="500"
                            max={listing.mass_kg}
                            value={qty}
                            onChange={(e) =>
                              handleQtyChange(listing.id, e.target.value, listing.mass_kg)
                            }
                            className="w-24 p-2 bg-white border border-gray-200 rounded-xl font-mono font-bold text-xs text-right"
                          />
                          <span className="ml-1 text-xs font-mono text-gray-500 font-bold">kg</span>
                        </div>
                      </div>

                      <div className="text-right min-w-[90px]">
                        <span className="text-[10px] text-gray-400 block">Batch Value</span>
                        <span className="text-sm font-extrabold font-mono text-black">
                          €{subtotal.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Facility & Date Selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Select Receiving Facility (Buyer)
                  </label>
                  <select
                    value={selectedFacility}
                    onChange={(e) => setSelectedFacility(e.target.value)}
                    className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold text-black focus:ring-1 focus:ring-[#7201FF] outline-hidden"
                  >
                    {facilities.map((fac) => (
                      <option key={fac.id} value={fac.name}>
                        {fac.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Target Delivery Date
                  </label>
                  <input
                    type="date"
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold text-black focus:ring-1 focus:ring-[#7201FF] outline-hidden"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Handling Notes &amp; Quality Specifications
                </label>
                <textarea
                  rows={2}
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs text-black placeholder-gray-400 focus:ring-1 focus:ring-[#7201FF] outline-hidden resize-none"
                />
              </div>

              <div className="flex justify-end pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-6 py-2.5 bg-black hover:bg-neutral-800 text-white rounded-full text-xs font-bold flex items-center gap-2 transition-all shadow-xs"
                >
                  <span>Proceed to Logistics Selection</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Logistics & Transportation */}
          {step === 2 && (
            <div className="flex flex-col gap-5 animate-in fade-in duration-150">
              <div className="border-b border-gray-100 pb-3">
                <h3 className="text-base font-extrabold text-black">
                  Step 2: Freight &amp; Transport Mode
                </h3>
                <span className="text-xs text-gray-500">
                  Select how secondary materials will be hauled from seller facilities to your depot.
                </span>
              </div>

              {/* Logistics Options */}
              <div className="grid grid-cols-1 gap-3">
                
                {/* 1. Platform-Arranged */}
                <div
                  onClick={() => setLogisticsMode('platform')}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3.5 ${
                    logisticsMode === 'platform'
                      ? 'border-[#7201FF] bg-purple-50/40'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="w-9 h-9 rounded-xl bg-[#7201FF] text-white flex items-center justify-center flex-shrink-0">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-black">
                        ReLoop Platform-Arranged Haulage (Recommended)
                      </span>
                      <span className="text-xs font-mono font-bold text-[#7201FF]">
                        +€{freightEstimate.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-[11.5px] text-gray-600 mt-1 leading-relaxed">
                      Matched to verified carrier electric/Euro-6 fleet backhauls. Includes real-time telematics, digital bill of lading, and automated CO₂e routing.
                    </p>
                  </div>
                </div>

                {/* 2. Self-Arranged */}
                <div
                  onClick={() => setLogisticsMode('self')}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3.5 ${
                    logisticsMode === 'self'
                      ? 'border-[#7201FF] bg-purple-50/40'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="w-9 h-9 rounded-xl bg-gray-100 text-gray-800 flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-black">
                        Self-Arranged (Buyer's Own Fleet)
                      </span>
                      <span className="text-xs font-mono font-bold text-gray-600">€0</span>
                    </div>
                    <p className="text-[11.5px] text-gray-600 mt-1 leading-relaxed">
                      You coordinate pickup directly with the seller. ReLoop provides loading appointment slots and release security codes.
                    </p>
                  </div>
                </div>

                {/* 3. Seller-Arranged */}
                <div
                  onClick={() => setLogisticsMode('seller')}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3.5 ${
                    logisticsMode === 'seller'
                      ? 'border-[#7201FF] bg-purple-50/40'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="w-9 h-9 rounded-xl bg-gray-100 text-gray-800 flex items-center justify-center flex-shrink-0">
                    <Package className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-black">
                        Seller-Delivered (CIF Terms)
                      </span>
                      <span className="text-xs font-mono font-bold text-gray-600">Included</span>
                    </div>
                    <p className="text-[11.5px] text-gray-600 mt-1 leading-relaxed">
                      The seller handles carriage to your designated facility gate.
                    </p>
                  </div>
                </div>

              </div>

              {/* Truck Capacity Indicator */}
              <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-between text-xs">
                <span className="text-gray-600">Payload Requirement:</span>
                <span className="font-bold text-black font-mono">
                  {totalGrossKg.toLocaleString()} kg (~{Math.ceil(totalGrossKg / 24000)} x 24T Semi-Trailer)
                </span>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2 border border-gray-200 rounded-full text-xs font-semibold text-gray-700 flex items-center gap-1.5 hover:bg-gray-50"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-6 py-2.5 bg-black hover:bg-neutral-800 text-white rounded-full text-xs font-bold flex items-center gap-2 transition-all shadow-xs"
                >
                  <span>Review Final Order</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Review & Submit */}
          {step === 3 && (
            <div className="flex flex-col gap-5 animate-in fade-in duration-150">
              <div className="border-b border-gray-100 pb-3">
                <h3 className="text-base font-extrabold text-black">
                  Step 3: Review &amp; Binding Commitment
                </h3>
                <span className="text-xs text-gray-500">
                  Confirm contractual parameters before sending order request to sellers.
                </span>
              </div>

              {/* Summary Table */}
              <div className="border border-gray-200 rounded-2xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-[10px] border-b border-gray-100">
                    <tr>
                      <th className="py-2.5 px-4">Item</th>
                      <th className="py-2.5 px-2 text-right">Volume</th>
                      <th className="py-2.5 px-3 text-right">Rate</th>
                      <th className="py-2.5 px-4 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-medium">
                    {calculatedItems.map(({ listing, qty, price, subtotal }) => (
                      <tr key={listing.id}>
                        <td className="py-3 px-4 font-bold text-black">{listing.title}</td>
                        <td className="py-3 px-2 text-right font-mono">{qty.toLocaleString()} kg</td>
                        <td className="py-3 px-3 text-right font-mono">€{price.toFixed(2)}</td>
                        <td className="py-3 px-4 text-right font-mono font-bold">€{subtotal.toLocaleString()}</td>
                      </tr>
                    ))}
                    {freightEstimate > 0 && (
                      <tr>
                        <td colSpan={3} className="py-2.5 px-4 text-gray-600">
                          ReLoop Carrier Haulage ({selectedFacility})
                        </td>
                        <td className="py-2.5 px-4 text-right font-mono font-bold">
                          €{freightEstimate.toLocaleString()}
                        </td>
                      </tr>
                    )}
                    <tr>
                      <td colSpan={3} className="py-2.5 px-4 text-gray-600">
                        Smart Escrow Verification Fee (2%)
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono font-bold">
                        €{platformAssuranceFee.toLocaleString()}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Binding Agreement Checkbox */}
              <label className="p-4 rounded-2xl bg-gray-50 border border-gray-200/90 flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={termsAgreed}
                  onChange={(e) => setTermsAgreed(e.target.checked)}
                  className="w-4 h-4 rounded text-[#7201FF] focus:ring-[#7201FF] mt-0.5"
                />
                <div className="text-xs">
                  <span className="font-extrabold text-black block">
                    Binding Commercial Purchase Order
                  </span>
                  <span className="text-[11.5px] text-gray-600 leading-relaxed block mt-0.5">
                    I confirm this is a binding purchase request. Upon seller acceptance, escrow funds will be held in multi-sig custody until electronic confirmation of delivery and quality inspection.
                  </span>
                </div>
              </label>

              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-4 py-2 border border-gray-200 rounded-full text-xs font-semibold text-gray-700 flex items-center gap-1.5 hover:bg-gray-50"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  onClick={handleSubmitOrder}
                  disabled={!termsAgreed}
                  className="px-7 py-3 bg-black hover:bg-neutral-800 disabled:bg-gray-300 text-white rounded-full text-xs font-extrabold flex items-center gap-2 transition-all shadow-xs cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5 text-[#8FFE01]" />
                  <span>Submit Purchase Order</span>
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Right Side: Order Summary Card (4 cols) */}
        <div className="lg:col-span-4 sticky top-24">
          <div className="bg-white rounded-3xl p-6 border border-gray-200/90 shadow-xs flex flex-col gap-4">
            <h4 className="text-sm font-extrabold text-black border-b border-gray-100 pb-3">
              Order Breakdown
            </h4>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Material Subtotal:</span>
                <span className="font-mono font-bold text-black">€{totalSubtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Freight ({logisticsMode}):</span>
                <span className="font-mono font-bold text-black">€{freightEstimate.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Platform Assurance (2%):</span>
                <span className="font-mono font-bold text-black">€{platformAssuranceFee.toLocaleString()}</span>
              </div>
              <div className="border-t border-gray-100 pt-3 flex justify-between text-sm font-black text-black">
                <span>Total Commitment:</span>
                <span className="font-mono text-base text-[#7201FF]">
                  €{totalCommitment.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-2.5">
              <Leaf className="w-4 h-4 text-emerald-700 flex-shrink-0" />
              <div className="text-xs">
                <span className="font-bold text-emerald-950 block">CSRD Scope 3 Offset</span>
                <span className="font-mono font-bold text-emerald-800">
                  -{totalCo2Saved.toLocaleString()} kg CO₂e avoided
                </span>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-3 flex items-center gap-2 text-[11px] text-gray-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>48h quality testing buffer prior to funds release.</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
