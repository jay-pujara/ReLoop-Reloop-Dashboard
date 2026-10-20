import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import InvoiceModal from '../../components/InvoiceModal';
import {
  Package,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Truck,
  ArrowRight,
  RefreshCw,
  XCircle,
  Building2,
  Leaf,
  Calendar,
  DollarSign,
  ShieldCheck,
  Eye,
  Download,
} from 'lucide-react';

export default function OrdersPage() {
  const navigate = useNavigate();
  const { orderRequests, trades, acceptCounterOffer, declineOrderRequest, org } = useApp();

  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'pending' | 'countered' | 'active' | 'completed'
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState(null);
  const [selectedInvoiceTrade, setSelectedInvoiceTrade] = useState(null);

  // Combine order requests and active trades to provide unified view
  // Filter by user's org as buyer (or general view for current session)
  const buyerRequests = orderRequests.filter(
    (req) => req.buyerOrg === org.name || req.buyerOrg.includes('BioPolymer') || true
  );

  const filterOrders = () => {
    switch (activeTab) {
      case 'pending':
        return buyerRequests.filter((r) => r.status === 'pending');
      case 'countered':
        return buyerRequests.filter((r) => r.status === 'countered');
      case 'active':
        return buyerRequests.filter((r) => r.status === 'accepted');
      case 'completed':
        return trades.filter((t) => t.status === 'closed' || t.status === 'delivered');
      default:
        return buyerRequests;
    }
  };

  const displayedOrders = filterOrders();

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-200">
            <Clock className="w-3.5 h-3.5" /> Pending Seller Review
          </span>
        );
      case 'countered':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-900 border border-purple-200 animate-pulse">
            <RefreshCw className="w-3.5 h-3.5 text-[#7201FF]" /> Seller Countered
          </span>
        );
      case 'accepted':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-900 border border-blue-200">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-700" /> Accepted &amp; In Escrow
          </span>
        );
      case 'declined':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
            <XCircle className="w-3.5 h-3.5" /> Declined
          </span>
        );
      case 'in-transit':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-900 border border-indigo-200">
            <Truck className="w-3.5 h-3.5" /> In Transit
          </span>
        );
      case 'delivered':
      case 'closed':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Completed &amp; Settled
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="w-full max-w-[1720px] mx-auto px-6 py-8 flex flex-col gap-8">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200/80 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-black text-white flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-black tracking-tight">
                Procurement Orders &amp; Inquiries
              </h1>
              <span className="text-xs text-gray-500">
                Track submitted purchase orders, respond to seller counters, and manage escrow settlements.
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/seller/inbox"
            className="px-4 py-2 rounded-full border border-gray-200 bg-white hover:bg-gray-50 text-xs font-bold text-black transition-colors flex items-center gap-2"
          >
            <span>Switch to Seller Inbox</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            to="/listings"
            className="px-5 py-2 bg-black hover:bg-neutral-800 text-white rounded-full text-xs font-extrabold transition-all shadow-xs"
          >
            Browse Marketplace
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-gray-200/70 pb-3">
        {[
          { id: 'all', label: 'All Orders & Inquiries', count: buyerRequests.length },
          {
            id: 'pending',
            label: 'Pending Review',
            count: buyerRequests.filter((r) => r.status === 'pending').length,
          },
          {
            id: 'countered',
            label: 'Counter-Offers Received',
            count: buyerRequests.filter((r) => r.status === 'countered').length,
          },
          {
            id: 'active',
            label: 'Escrow Active',
            count: buyerRequests.filter((r) => r.status === 'accepted').length,
          },
          {
            id: 'completed',
            label: 'Settled Trades',
            count: trades.filter((t) => t.status === 'closed' || t.status === 'delivered').length,
          },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === tab.id
                ? 'bg-black text-white shadow-xs'
                : 'bg-white text-gray-600 hover:text-black hover:bg-gray-100 border border-gray-200/80'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-700'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Orders List */}
      <div className="flex flex-col gap-4">
        {activeTab === 'completed' ? (
          /* Trades Completed List */
          trades
            .filter((t) => t.status === 'closed' || t.status === 'delivered')
            .map((trade) => (
              <div
                key={trade.id}
                className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <span className="font-mono text-xs font-bold text-gray-400 uppercase">
                      {trade.id}
                    </span>
                    {getStatusBadge(trade.status)}
                    <span className="text-[11px] text-gray-500">
                      Settled via ReLoop Smart Escrow
                    </span>
                  </div>

                  <h3 className="text-base font-black text-black">{trade.material}</h3>

                  <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-xs text-gray-600 mt-2">
                    <span>
                      Seller: <b className="text-black">{trade.counterpartOrg}</b>
                    </span>
                    <span>
                      Delivered to: <b className="text-black">{trade.deliveryFacility}</b>
                    </span>
                    <span>
                      Volume: <b className="text-black font-mono">{trade.mass_kg.toLocaleString()} kg</b>
                    </span>
                    <span>
                      Rate: <b className="text-black font-mono">€{trade.agreedPrice.toFixed(2)}/kg</b>
                    </span>
                  </div>
                </div>

                <div className="flex flex-col md:items-end gap-3 w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-gray-100">
                  <div className="text-right">
                    <span className="text-lg font-black font-mono text-black block">
                      €{trade.totalValue.toLocaleString()}
                    </span>
                    <span className="text-[10.5px] font-bold text-emerald-700 flex items-center justify-end gap-1">
                      <Leaf className="w-3 h-3" /> ESG Avoided Emissions Certified
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedInvoiceTrade(trade)}
                      className="px-4 py-2 bg-purple-50 hover:bg-purple-100 text-[#7201FF] border border-purple-200 rounded-full text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Tax Invoice</span>
                    </button>
                    <Link
                      to={`/trades/${trade.id}`}
                      className="px-4 py-2 bg-black hover:bg-neutral-800 text-white rounded-full text-xs font-bold transition-colors flex items-center gap-1.5"
                    >
                      <span>View Details</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))
        ) : displayedOrders.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-200/80">
            <Package className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-black">No orders found in this category.</p>
            <span className="text-xs text-gray-500">
              When you submit Buy Now requests or Quote negotiations, they will appear here.
            </span>
          </div>
        ) : (
          displayedOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-xs flex flex-col gap-4 group hover:border-gray-300 transition-all"
            >
              {/* Card Top Row */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-xs font-bold text-gray-500">{order.id}</span>
                  <span className="text-gray-300">•</span>
                  <span className="text-xs font-semibold text-gray-500">
                    Type: <b className="text-black capitalize">{order.type.replace('_', ' ')}</b>
                  </span>
                  <span className="text-gray-300">•</span>
                  <span className="text-xs text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                {getStatusBadge(order.status)}
              </div>

              {/* Card Middle: Material Info & Pricing */}
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <Link
                    to={`/listings/${order.listingId}`}
                    className="text-base font-extrabold text-black group-hover:text-[#7201FF] transition-colors"
                  >
                    {order.listingTitle}
                  </Link>

                  <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-xs text-gray-600 mt-1.5">
                    <span>
                      Seller: <b className="text-black">{order.sellerOrg}</b>
                    </span>
                    <span>
                      Receiving: <b className="text-black">{order.deliveryFacility}</b>
                    </span>
                    <span>
                      Pickup: <b className="text-black">{order.preferredPickup || 'Immediate'}</b>
                    </span>
                  </div>

                  {order.notes && (
                    <p className="text-[11.5px] text-gray-500 italic mt-2 bg-gray-50 p-2 rounded-xl border border-gray-100">
                      "{order.notes}"
                    </p>
                  )}
                </div>

                <div className="flex md:flex-col items-baseline md:items-end justify-between w-full md:w-auto gap-1">
                  <div className="text-right">
                    <span className="text-xs text-gray-500 block">Requested Lot Value</span>
                    <span className="text-xl font-black font-mono text-black">
                      €{order.totalValue.toLocaleString()}
                    </span>
                  </div>
                  <span className="text-xs font-mono font-semibold text-gray-600">
                    {order.requestedQty_kg.toLocaleString()} kg @ €{order.offeredPricePerKg.toFixed(2)}/kg
                  </span>
                </div>
              </div>

              {/* SPECIAL BANNER: If Seller Countered! */}
              {order.status === 'countered' && order.counterOffer && (
                <div className="p-4 rounded-2xl bg-purple-50/80 border border-purple-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="w-8 h-8 rounded-xl bg-[#7201FF] text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                      <RefreshCw className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-extrabold text-purple-950">
                          Seller Counter-Proposal: €{order.counterOffer.pricePerKg.toFixed(2)} / kg
                        </span>
                        <span className="text-[10.5px] font-bold text-purple-700 font-mono">
                          (Total: €{order.counterOffer.totalValue.toLocaleString()})
                        </span>
                      </div>
                      <p className="text-xs text-purple-900 mt-1">
                        "{order.counterOffer.message}"
                      </p>
                      <span className="text-[10.5px] text-purple-700 block mt-1">
                        New Availability Window: <b>{order.counterOffer.newWindow}</b>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => declineOrderRequest(order.id, 'Counter-offer rejected by buyer')}
                      className="px-4 py-2 bg-white hover:bg-gray-100 border border-purple-200 rounded-full text-xs font-bold text-gray-700 transition-colors"
                    >
                      Decline Counter
                    </button>
                    <button
                      onClick={() => acceptCounterOffer(order.id)}
                      className="px-5 py-2 bg-[#7201FF] hover:bg-purple-700 text-white rounded-full text-xs font-extrabold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#8FFE01]" />
                      <span>Accept Counter &amp; Initiate Escrow</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Action Buttons for Normal States */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-100 text-xs">
                <div className="flex items-center gap-2 text-gray-500">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>ReLoop Escrow Protected Order</span>
                </div>

                <div className="flex items-center gap-2">
                  {order.status === 'accepted' && (
                    <>
                      <button
                        onClick={() => setSelectedInvoiceOrder(order)}
                        className="px-4 py-1.5 bg-purple-50 hover:bg-purple-100 text-[#7201FF] border border-purple-200 rounded-full font-bold transition-colors flex items-center gap-1.5"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Tax Invoice</span>
                      </button>
                      <Link
                        to={order.tradeId ? `/trades/${order.tradeId}` : '/trades'}
                        className="px-4 py-1.5 bg-black hover:bg-neutral-800 text-white rounded-full font-bold transition-colors flex items-center gap-1.5"
                      >
                        <Truck className="w-3.5 h-3.5 text-[#8FFE01]" />
                        <span>Track Escrow &amp; Logistics</span>
                      </Link>
                    </>
                  )}

                  {order.status === 'pending' && (
                    <span className="text-gray-500 font-medium">
                      Awaiting seller acknowledgment (usually &lt; 4 hours)
                    </span>
                  )}
                </div>
              </div>

            </div>
          ))
        )}
      </div>

      {/* Invoice Modal for Orders */}
      {selectedInvoiceOrder && (
        <InvoiceModal
          order={selectedInvoiceOrder}
          onClose={() => setSelectedInvoiceOrder(null)}
        />
      )}

      {/* Invoice Modal for Trades */}
      {selectedInvoiceTrade && (
        <InvoiceModal
          trade={selectedInvoiceTrade}
          onClose={() => setSelectedInvoiceTrade(null)}
        />
      )}

    </div>
  );
}
