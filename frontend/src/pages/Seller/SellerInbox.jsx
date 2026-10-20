import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import CounterOfferModal from '../../components/CounterOfferModal';
import {
  Inbox,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Building2,
  Calendar,
  Package,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  MessageSquare,
  DollarSign,
  Truck,
  Sparkles,
} from 'lucide-react';

export default function SellerInbox() {
  const navigate = useNavigate();
  const {
    orderRequests,
    acceptOrderRequest,
    declineOrderRequest,
    org,
  } = useApp();

  const [filterTab, setFilterTab] = useState('pending'); // 'pending' | 'countered' | 'accepted' | 'all'
  const [selectedCounterRequest, setSelectedCounterRequest] = useState(null);
  const [declineReasonModal, setDeclineReasonModal] = useState(null);
  const [declineReason, setDeclineReason] = useState('Volume currently committed to long-term contract');

  // Requests directed to the logged in user as seller
  // For demo/richness, we show incoming requests for BioPolymer Labs or any requests where sellerOrg matches org.name or general seller incoming
  const sellerRequests = orderRequests.filter(
    (req) => req.sellerOrg === org.name || req.sellerOrg.includes('BioPolymer') || true
  );

  const filtered = sellerRequests.filter((req) => {
    if (filterTab === 'pending') return req.status === 'pending';
    if (filterTab === 'countered') return req.status === 'countered';
    if (filterTab === 'accepted') return req.status === 'accepted';
    return true;
  });

  const pendingCount = sellerRequests.filter((r) => r.status === 'pending').length;

  const handleDeclineSubmit = () => {
    if (declineReasonModal) {
      declineOrderRequest(declineReasonModal.id, declineReason);
      setDeclineReasonModal(null);
    }
  };

  return (
    <div className="w-full max-w-[1720px] mx-auto px-6 py-8 flex flex-col gap-8">
      
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200/80 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-black text-white flex items-center justify-center shadow-xs">
              <Inbox className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-3xl font-black text-black tracking-tight">
                  Seller Order Inbox
                </h1>
                {pendingCount > 0 && (
                  <span className="px-3 py-0.5 rounded-full text-xs font-black bg-amber-400 text-black animate-pulse">
                    {pendingCount} Pending Response
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Incoming purchase orders and commercial quote requests for your posted secondary material lots.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/seller/listings"
            className="px-4 py-2 rounded-full border border-gray-200 bg-white hover:bg-gray-50 text-xs font-bold text-black transition-colors"
          >
            My Posted Lots
          </Link>
          <Link
            to="/orders"
            className="px-4 py-2 rounded-full border border-gray-200 bg-white hover:bg-gray-50 text-xs font-semibold text-gray-700 transition-colors flex items-center gap-1.5"
          >
            <span>Buyer View</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            to="/listings/new"
            className="px-5 py-2 bg-black hover:bg-neutral-800 text-white rounded-full text-xs font-extrabold transition-all shadow-xs"
          >
            + Create New Listing
          </Link>
        </div>
      </div>

      {/* Tabs Filter Bar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-gray-200/70 pb-3">
        {[
          { id: 'pending', label: 'Action Required', count: sellerRequests.filter((r) => r.status === 'pending').length },
          { id: 'countered', label: 'Countered', count: sellerRequests.filter((r) => r.status === 'countered').length },
          { id: 'accepted', label: 'Accepted / Escrow Opened', count: sellerRequests.filter((r) => r.status === 'accepted').length },
          { id: 'all', label: 'All Inquiries', count: sellerRequests.length },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setFilterTab(t.id)}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              filterTab === t.id
                ? 'bg-black text-white shadow-xs'
                : 'bg-white text-gray-600 hover:text-black hover:bg-gray-100 border border-gray-200/80'
            }`}
          >
            <span>{t.label}</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                filterTab === t.id ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-700'
              }`}
            >
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* Requests Feed */}
      <div className="flex flex-col gap-4">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-200/80 max-w-md mx-auto my-6">
            <Inbox className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-black">No incoming requests in this folder</h3>
            <p className="text-xs text-gray-500 mt-1">
              When prospective buyers submit Buy Now orders or Quote inquiries for your listings, they will appear here.
            </p>
          </div>
        ) : (
          filtered.map((req) => (
            <div
              key={req.id}
              className={`bg-white rounded-3xl p-6 border shadow-xs flex flex-col gap-4 transition-all ${
                req.status === 'pending'
                  ? 'border-amber-300/80 ring-2 ring-amber-100'
                  : 'border-gray-200/80'
              }`}
            >
              {/* Top Row: Ref & Status */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono font-bold text-gray-500">{req.id}</span>
                  <span className="text-gray-300">•</span>
                  <span className="px-2.5 py-0.5 rounded-full font-extrabold uppercase text-[10px] bg-gray-100 text-black">
                    {req.type === 'buy_now' ? '⚡ Instant Buy Now' : '💬 Price / Volume Negotiation'}
                  </span>
                  <span className="text-gray-300">•</span>
                  <span className="text-gray-500">
                    Received {new Date(req.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                  </span>
                </div>

                <div>
                  {req.status === 'pending' && (
                    <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-900 border border-amber-200">
                      Response Required (24h window)
                    </span>
                  )}
                  {req.status === 'countered' && (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-900 border border-purple-200">
                      Counter-Offer Pending with Buyer
                    </span>
                  )}
                  {req.status === 'accepted' && (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-200">
                      ✓ Accepted &amp; Escrow Activated
                    </span>
                  )}
                  {req.status === 'declined' && (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-900 border border-rose-200">
                      Declined
                    </span>
                  )}
                </div>
              </div>

              {/* Middle Row: Buyer & Deal Details */}
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                
                {/* Left info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Building2 className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-extrabold text-black">{req.buyerOrg}</span>
                    {req.buyerVerified && (
                      <span className="inline-flex items-center gap-1 text-[10.5px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        <ShieldCheck className="w-3 h-3" /> Verified Buyer
                      </span>
                    )}
                  </div>

                  <Link
                    to={`/listings/${req.listingId}`}
                    className="text-base font-black text-black hover:text-[#7201FF] transition-colors block"
                  >
                    {req.listingTitle}
                  </Link>

                  <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-xs text-gray-600 mt-2">
                    <span>
                      Delivery Destination: <b className="text-black">{req.deliveryFacility}</b>
                    </span>
                    <span>
                      Requested Loading Date: <b className="text-black">{req.preferredPickup || 'Immediate'}</b>
                    </span>
                    <span>
                      Haulage: <b className="text-black capitalize">{req.logisticsType} Arranged</b>
                    </span>
                  </div>

                  {req.notes && (
                    <p className="text-xs text-gray-600 italic mt-2 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                      <b className="not-italic text-black font-semibold">Buyer note:</b> "{req.notes}"
                    </p>
                  )}
                </div>

                {/* Right pricing & quantities */}
                <div className="flex md:flex-col items-baseline md:items-end justify-between w-full md:w-auto gap-1">
                  <div className="text-right">
                    <span className="text-xs text-gray-500 block">Offer Total Value</span>
                    <span className="text-2xl font-black font-mono text-black">
                      €{req.totalValue?.toLocaleString()}
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold text-gray-700">
                    {req.requestedQty_kg?.toLocaleString()} kg @ €{req.offeredPricePerKg?.toFixed(2)}/kg
                  </span>
                </div>

              </div>

              {/* Counter-offer note if active */}
              {req.status === 'countered' && req.counterOffer && (
                <div className="bg-purple-50/70 border border-purple-200 p-3.5 rounded-2xl text-xs text-purple-950 flex items-start gap-3">
                  <RefreshCw className="w-4 h-4 text-[#7201FF] flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-extrabold block">
                      Your Active Counter-Offer: €{req.counterOffer.pricePerKg.toFixed(2)}/kg (€{req.counterOffer.totalValue.toLocaleString()})
                    </span>
                    <p className="text-[11.5px] text-purple-900 mt-0.5">
                      "{req.counterOffer.message}" (Window: {req.counterOffer.newWindow})
                    </p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-100">
                <div className="text-xs text-gray-500 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Escrow will guarantee payout upon bill of lading receipt</span>
                </div>

                <div className="flex items-center gap-2">
                  {req.status === 'pending' && (
                    <>
                      <button
                        onClick={() => setDeclineReasonModal(req)}
                        className="px-4 py-2 border border-gray-200 bg-white hover:bg-rose-50 text-gray-700 hover:text-rose-600 rounded-full text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Decline</span>
                      </button>

                      <button
                        onClick={() => setSelectedCounterRequest(req)}
                        className="px-4 py-2 border border-purple-200 bg-purple-50 hover:bg-purple-100 text-[#7201FF] rounded-full text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Counter-Offer</span>
                      </button>

                      <button
                        onClick={() => acceptOrderRequest(req.id)}
                        className="px-5 py-2 bg-black hover:bg-neutral-800 text-white rounded-full text-xs font-extrabold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer hover:scale-102"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#8FFE01]" />
                        <span>Accept &amp; Open Escrow</span>
                      </button>
                    </>
                  )}

                  {req.status === 'accepted' && (
                    <Link
                      to={req.tradeId ? `/trades/${req.tradeId}` : '/trades'}
                      className="px-4 py-1.5 bg-black text-white hover:bg-neutral-800 rounded-full text-xs font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <Truck className="w-3.5 h-3.5 text-[#8FFE01]" />
                      <span>Manage Active Escrow Trade</span>
                    </Link>
                  )}
                </div>
              </div>

            </div>
          ))
        )}
      </div>

      {/* Counter-Offer Modal */}
      {selectedCounterRequest && (
        <CounterOfferModal
          request={selectedCounterRequest}
          isOpen={!!selectedCounterRequest}
          onClose={() => setSelectedCounterRequest(null)}
        />
      )}

      {/* Decline Reason Modal */}
      {declineReasonModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-floating border border-gray-200 flex flex-col gap-4">
            <h3 className="text-base font-extrabold text-black">
              Decline Order Request {declineReasonModal.id}
            </h3>
            <p className="text-xs text-gray-500">
              Provide a professional reason for {declineReasonModal.buyerOrg}.
            </p>
            <select
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-black"
            >
              <option value="Volume currently committed to long-term contract">
                Volume currently committed to long-term contract
              </option>
              <option value="Offered price below minimum floor rate">
                Offered price below minimum floor rate
              </option>
              <option value="Unable to meet requested delivery window">
                Unable to meet requested delivery window
              </option>
              <option value="Technical specifications or test requirements not supported">
                Technical specifications or test requirements not supported
              </option>
            </select>
            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                onClick={() => setDeclineReasonModal(null)}
                className="px-4 py-2 border border-gray-200 rounded-full text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleDeclineSubmit}
                className="px-4 py-2 bg-rose-600 text-white rounded-full text-xs font-bold"
              >
                Confirm Decline
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
