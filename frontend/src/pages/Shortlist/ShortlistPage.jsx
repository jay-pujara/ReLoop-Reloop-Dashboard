import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import RequestQuoteModal from '../../components/RequestQuoteModal';
import {
  ShoppingCart,
  Trash2,
  ArrowRight,
  Leaf,
  ShieldCheck,
  Building2,
  Package,
  Sparkles,
  AlertCircle,
  MessageSquare,
  Zap,
} from 'lucide-react';

export default function ShortlistPage() {
  const navigate = useNavigate();
  const { shortlist, listings, updateShortlistQty, removeFromShortlist, clearShortlist } = useApp();

  const [quoteModalListing, setQuoteModalListing] = useState(null);
  const [quoteModalQty, setQuoteModalQty] = useState(null);

  // Hydrate shortlist items with listing details
  const populatedItems = shortlist
    .map((item) => {
      const listing = listings.find((l) => l.id === item.listingId);
      if (!listing) return null;
      const qty = Math.min(item.qty_kg, listing.mass_kg);
      const subtotal = Math.round(qty * (listing.price_per_kg || 1));
      const co2Saved = Math.round(qty * 1.34);
      return {
        ...item,
        listing,
        qty_kg: qty,
        subtotal,
        co2Saved,
      };
    })
    .filter(Boolean);

  const totalLots = populatedItems.length;
  const totalWeightKg = populatedItems.reduce((acc, curr) => acc + curr.qty_kg, 0);
  const totalSubtotal = populatedItems.reduce((acc, curr) => acc + curr.subtotal, 0);
  const totalCo2Saved = populatedItems.reduce((acc, curr) => acc + curr.co2Saved, 0);
  const escrowFee = Math.round(totalSubtotal * 0.02);
  const totalEstimated = totalSubtotal + escrowFee;

  return (
    <div className="w-full max-w-[1720px] mx-auto px-6 py-8 flex flex-col gap-8">
      
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200/80 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-black flex items-center justify-center text-white shadow-xs">
            <ShoppingCart className="w-6 h-6 stroke-[2]" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-3xl font-black text-black tracking-tight">
                Procurement Shortlist &amp; Cart
              </h1>
              <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-[#7201FF] text-white">
                {totalLots} {totalLots === 1 ? 'Lot' : 'Lots'}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Review saved circular secondary materials, adjust procurement batches, and initiate purchase orders.
            </p>
          </div>
        </div>

        {totalLots > 0 && (
          <div className="flex items-center gap-3">
            <button
              onClick={clearShortlist}
              className="px-4 py-2 rounded-full border border-gray-200 bg-white hover:bg-gray-50 text-xs font-semibold text-gray-600 hover:text-red-600 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Shortlist</span>
            </button>
            <Link
              to="/listings"
              className="px-4 py-2 rounded-full border border-gray-200 bg-white hover:bg-gray-50 text-xs font-bold text-black transition-colors"
            >
              + Add More Lots
            </Link>
          </div>
        )}
      </div>

      {totalLots === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-3xl p-16 border border-gray-200/80 shadow-xs flex flex-col items-center justify-center text-center max-w-xl mx-auto my-12">
          <div className="w-20 h-20 rounded-3xl bg-purple-50 text-[#7201FF] flex items-center justify-center mb-4">
            <ShoppingCart className="w-10 h-10 stroke-[1.75]" />
          </div>
          <h2 className="text-2xl font-black text-black tracking-tight mb-2">
            Your Shortlist is Empty
          </h2>
          <p className="text-xs text-gray-500 max-w-md leading-relaxed mb-6">
            You have not added any secondary polymer, cardboard, or industrial container lots to your procurement shortlist yet. Explore active lots on the Marketplace.
          </p>
          <Link
            to="/listings"
            className="px-6 py-3 bg-black hover:bg-neutral-800 text-white rounded-full text-xs font-extrabold transition-all shadow-xs flex items-center gap-2 hover:scale-102"
          >
            <span>Explore Marketplace Lots</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        /* Populated Shortlist & Summary Grid */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Shortlist Item Cards (8 cols) */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            {populatedItems.map(({ listingId, qty_kg, subtotal, co2Saved, listing }) => (
              <div
                key={listingId}
                className="bg-white rounded-3xl p-5 border border-gray-200/80 shadow-xs hover:border-gray-300 transition-all flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between group"
              >
                {/* Thumbnail & Main Info */}
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div className="w-24 h-24 rounded-2xl bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-200/80 relative">
                    <img
                      src={listing.photos?.[0] || 'https://images.unsplash.com/photo-1595278069441-2cf29f8005a4?w=400&q=80'}
                      alt={listing.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded-md text-[9.5px] font-extrabold bg-black/80 text-white backdrop-blur-xs">
                      {listing.materialType}
                    </span>
                  </div>

                  <div className="flex flex-col flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-gray-100 text-black">
                        {listing.grade}
                      </span>
                      {listing.carbon_class === 'carbon_positive' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#8FFE01] text-black">
                          <Leaf className="w-3 h-3" /> Carbon Positive
                        </span>
                      )}
                      {listing.openToOffers && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-100 text-[#7201FF]">
                          Negotiable
                        </span>
                      )}
                    </div>

                    <Link
                      to={`/listings/${listing.id}`}
                      className="text-base font-extrabold text-black group-hover:text-[#7201FF] transition-colors truncate block"
                    >
                      {listing.title}
                    </Link>

                    <span className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
                      <Building2 className="w-3.5 h-3.5 text-gray-400" />
                      {listing.sellerOrg} · {listing.facilityName} ({listing.distance_km} km away)
                    </span>

                    <div className="flex items-center gap-4 mt-2 text-xs">
                      <span className="text-gray-500">
                        Price: <b className="text-black font-mono">€{listing.price_per_kg?.toFixed(2)} / kg</b>
                      </span>
                      <span className="text-gray-500">
                        Available: <b className="text-black font-mono">{listing.mass_kg?.toLocaleString()} kg</b>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quantity Input, Price & Action Buttons */}
                <div className="flex flex-col sm:items-end gap-3 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                  
                  {/* Quantity Stepper */}
                  <div className="flex items-center gap-2">
                    <label className="text-[11px] font-bold text-gray-500">Quantity:</label>
                    <div className="relative flex items-center">
                      <input
                        type="number"
                        step="500"
                        min="500"
                        max={listing.mass_kg}
                        value={qty_kg}
                        onChange={(e) => updateShortlistQty(listingId, e.target.value)}
                        className="w-28 py-1.5 px-3 bg-gray-50 border border-gray-200 rounded-xl font-mono font-extrabold text-xs text-black focus:outline-hidden focus:border-[#7201FF] focus:bg-white transition-all text-right"
                      />
                      <span className="ml-1.5 text-[11px] font-mono text-gray-500 font-bold">kg</span>
                    </div>
                  </div>

                  {/* Computed Price */}
                  <div className="text-right">
                    <span className="text-lg font-black font-mono text-black block">
                      €{subtotal.toLocaleString()}
                    </span>
                    <span className="text-[10.5px] font-bold text-emerald-700 flex items-center justify-end gap-1">
                      <Leaf className="w-3 h-3" /> -{co2Saved.toLocaleString()} kg CO₂e
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-1">
                    <button
                      onClick={() => removeFromShortlist(listingId)}
                      title="Remove from shortlist"
                      className="w-8 h-8 rounded-full bg-gray-100 hover:bg-rose-50 text-gray-500 hover:text-rose-600 flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    {listing.openToOffers && (
                      <button
                        onClick={() => {
                          setQuoteModalListing(listing);
                          setQuoteModalQty(qty_kg);
                        }}
                        className="px-3 py-1.5 rounded-full border border-gray-200 hover:border-[#7201FF] bg-white text-xs font-semibold text-gray-800 hover:text-[#7201FF] transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <MessageSquare className="w-3 h-3" />
                        <span>Negotiate</span>
                      </button>
                    )}

                    <button
                      onClick={() => navigate(`/checkout/${listing.id}?qty=${qty_kg}`)}
                      className="px-4 py-1.5 bg-black hover:bg-neutral-800 text-white rounded-full text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <Zap className="w-3 h-3 text-[#8FFE01]" />
                      <span>Buy Now</span>
                    </button>
                  </div>

                </div>

              </div>
            ))}
          </div>

          {/* Right Column: Sticky Multi-Lot Order Summary Card (4 cols) */}
          <div className="lg:col-span-4 sticky top-24">
            <div className="bg-white rounded-3xl p-6 border border-gray-200/90 shadow-xs flex flex-col gap-5">
              
              <div className="border-b border-gray-100 pb-4">
                <h3 className="text-lg font-extrabold text-black tracking-tight">
                  Multi-Lot Order Summary
                </h3>
                <span className="text-[11px] text-gray-500">
                  Consolidated purchase order specification
                </span>
              </div>

              {/* Metric Highlights */}
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between text-gray-600">
                  <span>Selected Lots:</span>
                  <span className="font-bold text-black">{totalLots} batches</span>
                </div>

                <div className="flex items-center justify-between text-gray-600">
                  <span>Total Gross Weight:</span>
                  <span className="font-mono font-bold text-black">
                    {totalWeightKg.toLocaleString()} kg ({(totalWeightKg / 1000).toFixed(1)} MT)
                  </span>
                </div>

                <div className="flex items-center justify-between text-gray-600">
                  <span>Estimated Materials Subtotal:</span>
                  <span className="font-mono font-bold text-black">
                    €{totalSubtotal.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between text-gray-600">
                  <span className="flex items-center gap-1">
                    ReLoop Escrow &amp; QA Fee (2%):
                  </span>
                  <span className="font-mono font-bold text-black">
                    €{escrowFee.toLocaleString()}
                  </span>
                </div>

                <div className="border-t border-gray-100 pt-3 flex items-center justify-between">
                  <span className="text-sm font-extrabold text-black">Total Commitment:</span>
                  <span className="text-xl font-black font-mono text-[#7201FF]">
                    €{totalEstimated.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Carbon Credit Badge */}
              <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200 flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#8FFE01] flex items-center justify-center text-black flex-shrink-0">
                  <Leaf className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-emerald-950 block">
                    Avoided Carbon Footprint
                  </span>
                  <span className="text-sm font-black font-mono text-emerald-800">
                    -{totalCo2Saved.toLocaleString()} kg CO₂e
                  </span>
                </div>
              </div>

              {/* Primary Bulk CTAs */}
              <div className="flex flex-col gap-2.5 pt-2">
                <button
                  onClick={() => navigate('/checkout?source=cart')}
                  className="w-full py-3.5 bg-black hover:bg-neutral-800 text-white rounded-full text-xs font-extrabold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer hover:scale-101"
                >
                  <Zap className="w-4 h-4 text-[#8FFE01]" />
                  <span>Bulk Checkout All {totalLots} Lots</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <p className="text-[11px] text-gray-500 text-center leading-tight">
                  Protected by ReLoop Smart Escrow. Funds are released to sellers only upon verified delivery.
                </p>
              </div>

              {/* Guarantees */}
              <div className="border-t border-gray-100 pt-4 flex flex-col gap-2 text-[11px] text-gray-600">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span>Quality dispute protection window (48h after delivery)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Package className="w-3.5 h-3.5 text-[#7201FF] flex-shrink-0" />
                  <span>Integrated logistics &amp; automated CMR bill of lading</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      )}

      {/* Quote / Negotiation Modal */}
      {quoteModalListing && (
        <RequestQuoteModal
          listing={quoteModalListing}
          initialQty={quoteModalQty}
          isOpen={!!quoteModalListing}
          onClose={() => {
            setQuoteModalListing(null);
            setQuoteModalQty(null);
          }}
        />
      )}

    </div>
  );
}
