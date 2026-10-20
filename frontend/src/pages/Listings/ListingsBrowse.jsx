import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import RequestQuoteModal from '../../components/RequestQuoteModal';
import {
  Upload,
  Plus,
  Filter,
  Leaf,
  Sparkles,
  AlertTriangle,
  ArrowUpDown,
  Download,
  FileSpreadsheet,
  X,
  Check,
  Heart,
  ShoppingCart,
  Zap,
  MessageSquare,
  LayoutGrid,
  List,
  Building2,
  ArrowRight,
  ShieldCheck,
  Package,
} from 'lucide-react';

export default function ListingsBrowse() {
  const navigate = useNavigate();
  const {
    listings,
    shortlist,
    addToShortlist,
    removeFromShortlist,
    isInShortlist,
  } = useApp();

  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  const [showCarbonNegative, setShowCarbonNegative] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState('all');
  const [sortBy, setSortBy] = useState('best_match'); // 'best_match' | 'price_low' | 'price_high' | 'co2'
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [quoteModalListing, setQuoteModalListing] = useState(null);

  const materialFilters = [
    { id: 'all', label: 'All Materials' },
    { id: 'plastic', label: 'Plastic' },
    { id: 'metal', label: 'Metal' },
    { id: 'cardboard', label: 'Cardboard' },
    { id: 'pallets', label: 'Pallets' },
  ];

  const matchesMaterialFilter = (item, filterId) => {
    if (filterId === 'all') return true;
    const text = `${item.materialType || ''} ${item.title || ''} ${item.subType || ''}`.toLowerCase();
    if (filterId === 'plastic') {
      return (
        text.includes('hdpe') ||
        text.includes('pet') ||
        text.includes('ldpe') ||
        text.includes('pp') ||
        text.includes('plastic') ||
        text.includes('polymer')
      );
    }
    if (filterId === 'metal') {
      return (
        text.includes('steel') ||
        text.includes('metal') ||
        text.includes('drum') ||
        text.includes('aluminum')
      );
    }
    if (filterId === 'cardboard') {
      return (
        text.includes('cardboard') ||
        text.includes('gaylord') ||
        text.includes('occ') ||
        text.includes('corrugated')
      );
    }
    if (filterId === 'pallets') {
      return (
        text.includes('pallet') ||
        text.includes('epal') ||
        text.includes('wood')
      );
    }
    return false;
  };

  // Filter listings
  let filteredListings = listings.filter((item) => {
    if (!showCarbonNegative && item.carbon_class === 'carbon_negative') {
      return false;
    }
    if (!matchesMaterialFilter(item, selectedMaterial)) {
      return false;
    }
    return true;
  });

  // Sort listings
  filteredListings = [...filteredListings].sort((a, b) => {
    if (sortBy === 'price_low') return (a.price_per_kg || 0) - (b.price_per_kg || 0);
    if (sortBy === 'price_high') return (b.price_per_kg || 0) - (a.price_per_kg || 0);
    if (sortBy === 'co2') return (b.net_co2e_saved_kg || 0) - (a.net_co2e_saved_kg || 0);
    return 0; // default order
  });

  const handleToggleShortlist = (e, listingId) => {
    e.preventDefault();
    e.stopPropagation();
    if (isInShortlist(listingId)) {
      removeFromShortlist(listingId);
    } else {
      addToShortlist(listingId);
    }
  };

  return (
    <div className="w-full max-w-[1720px] mx-auto px-6 py-6 flex flex-col gap-6">
      
      {/* Top Header & Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-black tracking-tight">
            Marketplace
          </h1>
          <span className="text-xs text-gray-500">
            Verified secondary industrial feedstocks and circular packaging lots.
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Cart / Shortlist Quick Jump Button */}
          <Link
            to="/shortlist"
            className="h-10 px-4 bg-white hover:bg-gray-50 border border-gray-200/90 rounded-full text-xs font-bold text-black shadow-xs flex items-center gap-2 transition-colors cursor-pointer"
          >
            <ShoppingCart className="w-4 h-4 text-[#7201FF]" />
            <span>Shortlist Cart</span>
            {shortlist.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-[#7201FF] text-white text-[10px] font-extrabold flex items-center justify-center">
                {shortlist.length}
              </span>
            )}
          </Link>

          {/* Bulk Upload Button */}
          <button
            onClick={() => setShowBulkModal(true)}
            className="h-10 px-4 bg-white hover:bg-gray-50 border border-gray-200/90 rounded-full text-xs font-semibold text-gray-800 shadow-xs flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Bulk Upload</span>
          </button>

          {/* Create Listing Primary CTA */}
          <Link
            to="/listings/new"
            className="h-10 px-5 bg-black hover:bg-neutral-800 text-white rounded-full text-xs font-bold shadow-xs flex items-center gap-2 transition-all cursor-pointer hover:scale-102"
          >
            <Plus className="w-4 h-4" />
            <span>Create Listing</span>
          </Link>
        </div>
      </div>

      {/* Filter & View Toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
        
        {/* Left: Material Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-gray-700 mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Filter:
          </span>
          {materialFilters.map((mat) => (
            <button
              key={mat.id}
              onClick={() => setSelectedMaterial(mat.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                selectedMaterial === mat.id
                  ? 'bg-black text-white shadow-xs'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {mat.label}
            </button>
          ))}
        </div>

        {/* Right: Sort, Guardrail Toggle, and Grid/Table Switch */}
        <div className="flex flex-wrap items-center gap-4">
          
          {/* Sort Dropdown */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-gray-500 font-medium">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-1 text-xs font-semibold text-black focus:outline-hidden focus:border-[#7201FF]"
            >
              <option value="best_match">Best Match</option>
              <option value="price_low">Lowest Price / kg</option>
              <option value="price_high">Highest Price / kg</option>
              <option value="co2">Highest CO₂ Saved</option>
            </select>
          </div>

          {/* Carbon-Negative Guardrail Filter Toggle */}
          <div className="flex items-center gap-2 pl-3 border-l border-gray-200">
            <label className="flex items-center gap-1.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showCarbonNegative}
                onChange={(e) => setShowCarbonNegative(e.target.checked)}
                className="w-4 h-4 rounded text-[#7201FF] focus:ring-[#7201FF] cursor-pointer"
              />
              <span className="text-xs font-semibold text-gray-700">
                Show carbon-negative
              </span>
            </label>
          </div>

          {/* View Mode Toggle (Grid vs Table) */}
          <div className="flex items-center bg-gray-100 p-1 rounded-xl border border-gray-200">
            <button
              onClick={() => setViewMode('grid')}
              title="Grid View"
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white text-black shadow-2xs'
                  : 'text-gray-500 hover:text-black'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              title="Table View"
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white text-black shadow-2xs'
                  : 'text-gray-500 hover:text-black'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>

      {/* RENDER VIEW: Grid Mode OR Table Mode */}
      {viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredListings.map((listing) => {
            const isSaved = isInShortlist(listing.id);
            const totalVal = Math.round(listing.mass_kg * listing.price_per_kg);

            return (
              <div
                key={listing.id}
                className="bg-white rounded-3xl border border-gray-200/80 shadow-xs hover:shadow-md hover:border-gray-300 transition-all flex flex-col overflow-hidden group"
              >
                {/* Image & Badges */}
                <div className="relative aspect-4/3 bg-gray-100 overflow-hidden">
                  <img
                    src={listing.photos?.[0] || 'https://images.unsplash.com/photo-1595278069441-2cf29f8005a4?w=600&q=80'}
                    alt={listing.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Top Left Badges */}
                  <div className="absolute top-3 left-3 flex flex-col gap-1 items-start">
                    <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-extrabold bg-black/80 text-white backdrop-blur-xs shadow-xs">
                      {listing.materialType}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/90 text-black backdrop-blur-xs">
                      {listing.grade}
                    </span>
                  </div>

                  {/* Top Right: Shortlist Heart Button */}
                  <button
                    onClick={(e) => handleToggleShortlist(e, listing.id)}
                    title={isSaved ? 'Remove from Shortlist' : 'Add to Shortlist'}
                    className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-md transition-all shadow-xs cursor-pointer ${
                      isSaved
                        ? 'bg-rose-500 text-white scale-110'
                        : 'bg-white/85 text-gray-700 hover:text-rose-500 hover:bg-white'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                  </button>

                  {/* Bottom Carbon Class Badge */}
                  <div className="absolute bottom-3 left-3">
                    {listing.carbon_class === 'carbon_positive' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-extrabold bg-[#8FFE01] text-black shadow-xs">
                        <Leaf className="w-3 h-3" /> Carbon Positive
                      </span>
                    ) : listing.carbon_class === 'marginal' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-gray-200 text-gray-800">
                        Marginal (0 kg)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-rose-100 text-rose-800">
                        <AlertTriangle className="w-3 h-3" /> Carbon Negative
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 flex flex-col flex-1 justify-between gap-4">
                  <div>
                    <Link
                      to={`/listings/${listing.id}`}
                      className="font-extrabold text-black text-sm group-hover:text-[#7201FF] transition-colors line-clamp-2 leading-snug"
                    >
                      {listing.title}
                    </Link>
                    <span className="text-[11px] text-gray-500 block mt-0.5">{listing.subType}</span>

                    <div className="flex items-center gap-1 text-[11px] text-gray-500 mt-2">
                      <Building2 className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                      <span className="truncate">{listing.sellerOrg}</span>
                      {listing.isVerified && <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />}
                    </div>
                    <span className="text-[10.5px] text-gray-400 block mt-0.5">
                      {listing.facilityName} ({listing.distance_km} km away)
                    </span>
                  </div>

                  {/* Pricing & Volume Metrics */}
                  <div className="pt-3 border-t border-gray-100 flex items-end justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-gray-400 block">Unit Price</span>
                      <span className="text-xl font-black font-mono text-black">
                        €{listing.price_per_kg?.toFixed(2)}
                      </span>
                      <span className="text-[11px] text-gray-500 font-semibold"> / kg</span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-gray-400 block">Available</span>
                      <span className="text-xs font-mono font-bold text-black block">
                        {listing.mass_kg?.toLocaleString()} kg
                      </span>
                      <span className="text-[10px] text-gray-400 font-mono">
                        ≈ €{totalVal.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* E-Commerce Buttons (Buy Now for every item, and Negotiate if openToOffers) */}
                  <div className="flex flex-col gap-2 pt-2 border-t border-gray-100">
                    
                    {/* 1. Buy Now button (Always present!) */}
                    <button
                      onClick={() => navigate(`/checkout/${listing.id}`)}
                      className="w-full py-2.5 bg-black hover:bg-neutral-800 text-white rounded-full text-xs font-extrabold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer hover:scale-101"
                    >
                      <Zap className="w-3.5 h-3.5 text-[#8FFE01]" />
                      <span>Buy Now</span>
                    </button>

                    {/* 2. Below Buy Now: Negotiate / Quote button (If seller says it's negotiable!) */}
                    {listing.openToOffers && (
                      <button
                        onClick={() => setQuoteModalListing(listing)}
                        className="w-full py-2 bg-purple-50 hover:bg-purple-100 border border-purple-200 text-[#7201FF] rounded-full text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Negotiate / Request Quote</span>
                      </button>
                    )}

                    {/* 3. Details Link */}
                    <Link
                      to={`/listings/${listing.id}`}
                      className="text-center text-[11px] font-semibold text-gray-500 hover:text-black hover:underline pt-0.5"
                    >
                      View Full Specifications &amp; Hotspots →
                    </Link>

                  </div>

                </div>

              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/90 text-gray-500 font-bold uppercase tracking-wider text-[10.5px] border-b border-gray-100">
                <tr>
                  <th className="py-3.5 px-4 text-center">Save</th>
                  <th className="py-3.5 px-6">Material &amp; Description</th>
                  <th className="py-3.5 px-4">Grade</th>
                  <th className="py-3.5 px-4">Available Mass</th>
                  <th className="py-3.5 px-4">Price / kg</th>
                  <th className="py-3.5 px-4">Carbon Class</th>
                  <th className="py-3.5 px-6 text-right">E-Commerce Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {filteredListings.map((l) => {
                  const isSaved = isInShortlist(l.id);

                  return (
                    <tr key={l.id} className="hover:bg-gray-50/70 transition-colors group">
                      
                      {/* Shortlist Heart */}
                      <td className="py-4 px-4 text-center">
                        <button
                          onClick={(e) => handleToggleShortlist(e, l.id)}
                          className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                            isSaved
                              ? 'text-rose-600 bg-rose-50'
                              : 'text-gray-400 hover:text-rose-500 hover:bg-gray-100'
                          }`}
                        >
                          <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                        </button>
                      </td>

                      {/* Material */}
                      <td className="py-4 px-6">
                        <Link to={`/listings/${l.id}`} className="block">
                          <span className="font-extrabold text-black group-hover:text-[#7201FF] text-[13px] block transition-colors">
                            {l.title}
                          </span>
                          <span className="text-[11px] text-gray-500">
                            {l.subType} · {l.sellerOrg}
                          </span>
                        </Link>
                      </td>

                      {/* Grade */}
                      <td className="py-4 px-4">
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-gray-100 text-black">
                          {l.grade}
                        </span>
                      </td>

                      {/* Mass */}
                      <td className="py-4 px-4 font-mono font-bold text-black text-[12.5px]">
                        {l.mass_kg.toLocaleString()} kg
                      </td>

                      {/* Price */}
                      <td className="py-4 px-4 font-mono font-bold text-black text-[13px]">
                        €{l.price_per_kg.toFixed(2)}
                      </td>

                      {/* Carbon Class Badge */}
                      <td className="py-4 px-4">
                        {l.carbon_class === 'carbon_positive' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#8FFE01] text-black">
                            <Leaf className="w-3 h-3" /> Carbon Positive
                          </span>
                        ) : l.carbon_class === 'marginal' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-gray-200 text-gray-800">
                            Marginal (0 kg)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-700">
                            <AlertTriangle className="w-3 h-3" /> Carbon Negative
                          </span>
                        )}
                      </td>

                      {/* E-Commerce Actions */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {l.openToOffers && (
                            <button
                              onClick={() => setQuoteModalListing(l)}
                              className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-[#7201FF] border border-purple-200 rounded-full text-xs font-bold transition-colors cursor-pointer"
                            >
                              Negotiate
                            </button>
                          )}
                          <button
                            onClick={() => navigate(`/checkout/${l.id}`)}
                            className="px-4 py-1.5 bg-black hover:bg-neutral-800 text-white rounded-full text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <Zap className="w-3 h-3 text-[#8FFE01]" />
                            <span>Buy Now</span>
                          </button>
                          <Link
                            to={`/listings/${l.id}`}
                            className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-black rounded-full text-xs font-semibold transition-colors"
                          >
                            Details
                          </Link>
                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Quote Request / Negotiation Modal */}
      {quoteModalListing && (
        <RequestQuoteModal
          listing={quoteModalListing}
          isOpen={!!quoteModalListing}
          onClose={() => setQuoteModalListing(null)}
        />
      )}

      {/* Bulk Upload Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-floating border border-gray-200 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <div className="flex items-center gap-2 font-extrabold text-black text-base">
                <FileSpreadsheet className="w-5 h-5 text-[#7201FF]" />
                <span>Bulk Listing Import</span>
              </div>
              <button
                onClick={() => setShowBulkModal(false)}
                className="w-7 h-7 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              Upload lots in bulk using the standard ReLoop circular taxonomy schema or integrate directly via our ERP REST endpoint (<code className="bg-gray-100 px-1 py-0.5 rounded text-black font-mono">POST /listings/bulk</code>).
            </p>

            <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center flex flex-col items-center gap-2 hover:border-[#7201FF] transition-colors cursor-pointer bg-gray-50">
              <Upload className="w-6 h-6 text-gray-400" />
              <span className="text-xs font-bold text-black">Drag CSV file here, or browse</span>
              <span className="text-[10px] text-gray-500">Supports .csv, .xlsx up to 50MB</span>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button className="text-xs font-bold text-[#7201FF] flex items-center gap-1 hover:underline">
                <Download className="w-3.5 h-3.5" />
                <span>Download CSV Template</span>
              </button>

              <button
                onClick={() => setShowBulkModal(false)}
                className="px-4 py-2 bg-black text-white rounded-full text-xs font-bold hover:bg-neutral-800 transition-colors"
              >
                Import Lots
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
