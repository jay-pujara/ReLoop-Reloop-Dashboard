import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { listingsService } from '../../services';
import MaterialPassport3D from '../../components/visuals/MaterialPassport3D';
import RequestQuoteModal from '../../components/RequestQuoteModal';
import {
  ArrowLeft,
  ShieldCheck,
  ShieldAlert,
  Leaf,
  Scale,
  Calendar,
  Sparkles,
  Gavel,
  Calculator,
  Building,
  CheckCircle2,
  Clock,
  ArrowRight,
  Heart,
  ShoppingCart,
  Zap,
  MessageSquare,
  Building2,
  Package,
} from 'lucide-react';

export default function ListingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    listings,
    setListings,
    org,
    facilities,
    matches,
    shortlist,
    addToShortlist,
    removeFromShortlist,
    isInShortlist,
  } = useApp();

  const [remoteListing, setRemoteListing] = useState(null);

  useEffect(() => {
    if (id) {
      listingsService.fetchListingById(id)
        .then((fetched) => {
          if (fetched) setRemoteListing(fetched);
        })
        .catch(() => {});
    }
  }, [id]);

  // Find listing from state or remote
  const listing = remoteListing || listings.find((l) => l.id === id || l._id === id) || listings[0];
  const relatedMatch = matches?.find((m) => m.listingId === listing.id);

  // E-commerce purchase state
  const [procureQty, setProcureQty] = useState(listing.mass_kg || 10000);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [destinationFacility, setDestinationFacility] = useState(
    facilities[0]?.name || 'Rotterdam Circular Hub (HQ)'
  );

  // Calculated dynamic values
  const calculatedSubtotal = Math.round(procureQty * (listing.price_per_kg || 1));
  const calculatedCo2 = Math.round(procureQty * 1.34);
  const isSaved = isInShortlist(listing.id);

  // "What if?" Carbon Estimator state
  const [selectedFacilityId, setSelectedFacilityId] = useState(facilities[0]?.id || 1);
  const selectedFacility = facilities.find((f) => f.id === Number(selectedFacilityId)) || facilities[0];
  const simulatedDistance = selectedFacility.id === 1 ? 42 : selectedFacility.id === 2 ? 78 : 145;
  const simulatedNetCo2 = Math.round(listing.mass_kg * 1.35 - simulatedDistance * 12);
  const isBreakEven = simulatedNetCo2 > 0;

  // Auction State
  const [bidAmount, setBidAmount] = useState((listing.leadingBid || listing.price_per_kg) + 0.05);
  const [bids, setBids] = useState([
    { bidder: 'Circular Poly GmbH', amount: 1.38, time: '12m ago' },
    { bidder: 'Nordic Packaging NV', amount: 1.35, time: '1h ago' },
    { bidder: 'EcoPlast Polymers France', amount: 1.30, time: '3h ago' },
  ]);

  // Unverified threshold check
  const totalLotValue = listing.mass_kg * listing.price_per_kg;
  const isClaimBlocked = org.verificationStatus !== 'verified' && totalLotValue > org.verificationThreshold;

  const handlePlaceBid = () => {
    setBids([{ bidder: org.name, amount: Number(bidAmount), time: 'Just now' }, ...bids]);
    alert(`Bid of €${bidAmount}/kg submitted successfully!`);
  };

  const handleClaim = () => {
    const newTradeId = `TR-${Math.floor(4100 + Math.random() * 800)}`;
    const newTrade = {
      id: newTradeId,
      listingId: listing.id,
      material: listing.title,
      mass_kg: listing.mass_kg,
      agreedPrice: listing.price_per_kg,
      totalValue: totalLotValue,
      currency: '€',
      counterpartOrg: listing.sellerOrg,
      status: 'claimed',
      stepIndex: 0,
      escrow_state: 'held',
      pickupFacility: listing.facilityName,
      deliveryFacility: selectedFacility.name,
      shipmentId: `SH-${Math.floor(8000 + Math.random() * 900)}`,
      deliveredAt: null,
      disputeCountdownHours: null,
      originalGrade: listing.grade,
      deliveryGrade: null,
      photosOriginal: listing.photos,
      photosDelivery: [],
    };
    setTrades([newTrade, ...trades]);
    navigate(`/trades/${newTradeId}`);
  };

  return (
    <div className="w-full max-w-[1720px] mx-auto px-6 py-6 flex flex-col gap-6">
      
      {/* Top Breadcrumb */}
      <div>
        <button
          onClick={() => navigate(-1)}
          className="text-xs font-semibold text-gray-500 hover:text-black flex items-center gap-1 mb-2 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back
        </button>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-[#7201FF] tracking-wider uppercase block">
              Lot #{listing.id} • {listing.materialType}
            </span>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-black tracking-tight mt-0.5">
              {listing.title}
            </h1>
          </div>

          {/* Seller Trust Badge */}
          <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl border border-gray-200/80 shadow-xs">
            <Building className="w-4 h-4 text-gray-400" />
            <div className="text-xs">
              <span className="text-gray-500 block text-[10px]">Seller:</span>
              <span className="font-bold text-black flex items-center gap-1">
                {listing.sellerOrg}
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 inline" />
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recommended Match Fit Banner (Shown if this listing was matched/recommended) */}
      {relatedMatch && (
        <div className="bg-purple-50/80 border border-purple-200/80 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs shadow-2xs">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full bg-[#7201FF] text-white font-extrabold text-xs flex items-center gap-1.5 shadow-2xs flex-shrink-0">
              <Sparkles className="w-3.5 h-3.5" />
              {relatedMatch.composite_score}% AI Match Fit
            </span>
            <div>
              <span className="text-black font-extrabold text-xs block">
                Algorithmic Match Recommendation
              </span>
              <span className="text-gray-600 font-medium text-[11.5px]">
                {relatedMatch.reasonText}
              </span>
            </div>
          </div>
          <Link
            to={`/matches/${relatedMatch.id}`}
            className="px-3.5 py-1.5 rounded-full bg-white hover:bg-gray-100 border border-purple-200 text-[#7201FF] font-bold text-xs flex items-center gap-1.5 transition-colors shadow-2xs ml-auto flex-shrink-0"
          >
            <Leaf className="w-3.5 h-3.5 text-emerald-600" />
            <span>View Full Carbon Audit</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Main Grid: 3D Material Passport on Left + Action/Specs on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column (7 Cols): Material Passport 3D + "What if?" Carbon Estimator */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          {/* Material Specimen Photo Gallery */}
          <MaterialPassport3D
            materialType={listing.materialType}
            photos={listing.photos}
          />

          {/* "What If?" Carbon Estimator Widget */}
          <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-xs flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Calculator className="w-4 h-4 text-[#7201FF]" />
                <h3 className="text-sm font-extrabold text-black">
                  "What If?" Pre-Claim Carbon Estimator
                </h3>
              </div>
              <span className="text-[11px] font-bold text-gray-500">
                Live LCA Estimation API
              </span>
            </div>

            <p className="text-xs text-gray-600">
              Simulate net emissions saved and break-even status based on your delivery facility before submitting an offer or claiming.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
              <div className="sm:col-span-1">
                <label className="text-[11px] font-bold text-gray-700 block mb-1">
                  Destination Facility
                </label>
                <select
                  value={selectedFacilityId}
                  onChange={(e) => setSelectedFacilityId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-xs font-semibold focus:ring-1 focus:ring-[#7201FF] outline-hidden bg-gray-50"
                >
                  {facilities.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2 bg-gray-50 p-3.5 rounded-2xl border border-gray-200/80 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                    Estimated Net CO₂e Outcome
                  </span>
                  <span className={`text-base font-extrabold font-mono ${isBreakEven ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {isBreakEven ? `+${simulatedNetCo2.toLocaleString()} kg saved` : `${simulatedNetCo2.toLocaleString()} kg (penalty)`}
                  </span>
                  <span className="text-[10px] text-gray-500 block mt-0.5">
                    Haul Distance: {simulatedDistance} km • Break-Even: {isBreakEven ? 'Yes (Profitable)' : 'No (Excess Transport)'}
                  </span>
                </div>

                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${isBreakEven ? 'bg-[#8FFE01] text-black' : 'bg-rose-100 text-rose-700'}`}>
                  {isBreakEven ? 'Carbon Positive' : 'Carbon Negative'}
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column (5 Cols): Specs & Claim / Auction Bidding Widget */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Spec Panel */}
          <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-xs flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <span className="text-xs font-bold text-black uppercase tracking-wider">
                Specification Passport
              </span>
              <span className="text-[10px] font-bold text-[#7201FF] bg-purple-50 px-2.5 py-0.5 rounded-full">
                {listing.gradeSource}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-y-3.5 text-xs">
              <div>
                <span className="text-gray-500 block text-[11px]">Polymer Family</span>
                <span className="font-extrabold text-black text-sm">{listing.materialType}</span>
              </div>
              <div>
                <span className="text-gray-500 block text-[11px]">Material Sub-Type</span>
                <span className="font-semibold text-black">{listing.subType}</span>
              </div>
              <div>
                <span className="text-gray-500 block text-[11px]">Certified Grade</span>
                <span className="font-bold text-black inline-block px-2 py-0.5 bg-gray-100 rounded-md mt-0.5">
                  {listing.grade}
                </span>
              </div>
              <div>
                <span className="text-gray-500 block text-[11px]">Available Volume</span>
                <span className="font-bold text-black font-mono text-sm">
                  {listing.mass_kg.toLocaleString()} kg
                </span>
              </div>
              <div>
                <span className="text-gray-500 block text-[11px]">Unit Dimensions</span>
                <span className="font-medium text-black">{listing.unit_dimensions || '120x100x110 cm'}</span>
              </div>
              <div>
                <span className="text-gray-500 block text-[11px]">Packaging Type</span>
                <span className="font-medium text-black">{listing.unit_count || 24} Gaylord Boxes</span>
              </div>
              <div>
                <span className="text-gray-500 block text-[11px]">Available Window</span>
                <span className="font-medium text-black">{listing.available_from} → {listing.available_until}</span>
              </div>
              <div>
                <span className="text-gray-500 block text-[11px]">Origin Facility</span>
                <span className="font-medium text-black">{listing.facilityName}</span>
              </div>
            </div>

            {/* Price & Value Banner */}
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200/80 flex items-center justify-between mt-2">
              <div>
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                  Unit Price
                </span>
                <span className="text-2xl font-black text-black font-mono">
                  €{listing.price_per_kg?.toFixed(2)}
                  <span className="text-xs text-gray-500 font-sans font-normal"> / kg</span>
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                  Lot Total Value
                </span>
                <span className="text-lg font-extrabold text-black font-mono">
                  €{totalLotValue.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Auction Bidding Widget OR B2B Purchase Action Panel */}
            {listing.isAuction ? (
              /* Live Bidding Widget */
              <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200 flex flex-col gap-3 mt-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-black flex items-center gap-1.5">
                    <Gavel className="w-3.5 h-3.5 text-[#7201FF]" /> Live Auction Bidding
                  </span>
                  <span className="font-mono text-purple-700 font-bold bg-white px-2 py-0.5 rounded-md flex items-center gap-1">
                    <Clock className="w-3 h-3" /> 2h 45m left
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">Leading Bid:</span>
                  <span className="text-base font-extrabold font-mono text-black">
                    €{listing.leadingBid?.toFixed(2) || listing.price_per_kg} / kg
                  </span>
                </div>

                <div className="flex gap-2">
                  <input
                    type="number"
                    step="0.01"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    className="w-32 p-2 rounded-xl border border-purple-200 bg-white font-mono font-bold text-sm focus:ring-1 focus:ring-[#7201FF] outline-hidden"
                  />
                  <button
                    onClick={handlePlaceBid}
                    className="flex-1 py-2 bg-[#7201FF] hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs cursor-pointer"
                  >
                    Place Live Bid
                  </button>
                </div>

                {/* Bid History */}
                <div className="mt-1 divide-y divide-purple-100 text-[11px]">
                  {bids.map((b, i) => (
                    <div key={i} className="py-1 flex items-center justify-between text-gray-700">
                      <span>{b.bidder}</span>
                      <span className="font-mono font-bold text-black">€{b.amount.toFixed(2)} ({b.time})</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* B2B Commercial Purchase Panel */
              <div className="flex flex-col gap-3.5 mt-2 bg-white rounded-2xl border border-gray-100 p-3">
                
                {/* Quantity Selector */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <label className="font-bold text-gray-700">Procurement Quantity:</label>
                    <span className="font-mono font-bold text-black text-sm">
                      {Number(procureQty).toLocaleString()} kg
                    </span>
                  </div>
                  <input
                    type="range"
                    min="500"
                    max={listing.mass_kg}
                    step="500"
                    value={procureQty}
                    onChange={(e) => setProcureQty(Number(e.target.value))}
                    className="w-full accent-black cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-gray-400 font-mono mt-0.5">
                    <span>Min: 500 kg</span>
                    <span>Max: {listing.mass_kg?.toLocaleString()} kg</span>
                  </div>
                </div>

                {/* Receiving Facility Picker */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">
                    Receiving Facility (Buyer)
                  </label>
                  <select
                    value={destinationFacility}
                    onChange={(e) => setDestinationFacility(e.target.value)}
                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-black focus:outline-hidden focus:border-[#7201FF]"
                  >
                    {facilities.map((fac) => (
                      <option key={fac.id} value={fac.name}>
                        {fac.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Dynamic Subtotal & ESG Preview */}
                <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-gray-400 block">
                      Calculated Batch Subtotal
                    </span>
                    <span className="text-xl font-black font-mono text-black">
                      €{calculatedSubtotal.toLocaleString()}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-gray-500 block">Avoided Scope 3</span>
                    <span className="text-xs font-black font-mono text-emerald-700">
                      -{calculatedCo2.toLocaleString()} kg CO₂e
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-2 pt-1">
                  
                  {/* Primary CTA 1: Buy Now */}
                  <button
                    onClick={() => navigate(`/checkout/${listing.id}?qty=${procureQty}`)}
                    className="w-full py-3 bg-black hover:bg-neutral-800 text-white rounded-full text-xs font-extrabold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer hover:scale-101"
                  >
                    <Zap className="w-3.5 h-3.5 text-[#8FFE01]" />
                    <span>⚡ Buy Now / Proceed to Checkout</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  {/* Primary CTA 2: Negotiate / Request Quote (If openToOffers) */}
                  {listing.openToOffers && (
                    <button
                      onClick={() => setShowQuoteModal(true)}
                      className="w-full py-2.5 bg-purple-50 hover:bg-purple-100 border border-purple-200 text-[#7201FF] rounded-full text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>💬 Negotiate / Request Quote</span>
                    </button>
                  )}

                  {/* Secondary CTA: Shortlist Toggle */}
                  <button
                    onClick={() => {
                      if (isSaved) {
                        removeFromShortlist(listing.id);
                      } else {
                        addToShortlist(listing.id, procureQty);
                      }
                    }}
                    className={`w-full py-2 border rounded-full text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      isSaved
                        ? 'border-rose-200 bg-rose-50 text-rose-600'
                        : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
                    <span>{isSaved ? '✓ Saved in Shortlist' : 'Add to Shortlist Cart'}</span>
                  </button>

                </div>

                {/* Seller Trust Footer */}
                <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
                  <div className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Smart Escrow Protected</span>
                  </div>
                  <span>Response: &lt; 2 hours</span>
                </div>

              </div>
            )}

          </div>

        </div>

      </div>

      {/* Real Quote / Negotiation Modal */}
      {showQuoteModal && (
        <RequestQuoteModal
          listing={listing}
          initialQty={procureQty}
          isOpen={showQuoteModal}
          onClose={() => setShowQuoteModal(false)}
        />
      )}

    </div>
  );
}
