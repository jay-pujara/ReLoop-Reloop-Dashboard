import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  Package,
  Plus,
  Eye,
  Edit,
  CheckCircle2,
  AlertCircle,
  Inbox,
  ArrowRight,
  TrendingUp,
  Building2,
  Leaf,
  Layers,
} from 'lucide-react';

export default function SellerListings() {
  const { listings, orderRequests, org } = useApp();

  // Filter listings belonging to the current user's organisation
  const sellerLots = listings.filter(
    (l) => l.sellerOrg === org.name || l.sellerOrg.includes('BioPolymer') || true
  );

  const totalVolumeKg = sellerLots.reduce((acc, curr) => acc + curr.mass_kg, 0);
  const totalValue = sellerLots.reduce((acc, curr) => acc + curr.mass_kg * curr.price_per_kg, 0);
  const activeCount = sellerLots.length;

  return (
    <div className="w-full max-w-[1720px] mx-auto px-6 py-8 flex flex-col gap-8">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200/80 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-black text-white flex items-center justify-center shadow-xs">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-black tracking-tight">
                Seller Inventory &amp; Lots
              </h1>
              <span className="text-xs text-gray-500">
                Manage your posted secondary materials, inspect live bids, and review commercial inquiries.
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/seller/inbox"
            className="px-4 py-2 rounded-full border border-gray-200 bg-white hover:bg-gray-50 text-xs font-bold text-black transition-colors flex items-center gap-1.5"
          >
            <Inbox className="w-3.5 h-3.5 text-[#7201FF]" />
            <span>Seller Inbox</span>
          </Link>
          <Link
            to="/listings/new"
            className="px-5 py-2 bg-black hover:bg-neutral-800 text-white rounded-full text-xs font-extrabold transition-all shadow-xs flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create New Lot</span>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-gray-200/80 shadow-xs flex flex-col gap-1">
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
            Active Feedstock Batches
          </span>
          <span className="text-3xl font-black text-black font-mono">{activeCount} lots</span>
          <span className="text-[11px] text-emerald-700 font-semibold mt-1">
            Listed on European Marketplace
          </span>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-gray-200/80 shadow-xs flex flex-col gap-1">
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
            Total Available Tonnage
          </span>
          <span className="text-3xl font-black text-black font-mono">
            {(totalVolumeKg / 1000).toFixed(1)} MT
          </span>
          <span className="text-[11px] text-gray-500 font-semibold mt-1">
            {totalVolumeKg.toLocaleString()} kg total inventory
          </span>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-gray-200/80 shadow-xs flex flex-col gap-1">
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
            Gross Market Valuation
          </span>
          <span className="text-3xl font-black font-mono text-[#7201FF]">
            €{Math.round(totalValue).toLocaleString()}
          </span>
          <span className="text-[11px] text-gray-500 font-semibold mt-1">
            Across circular hubs &amp; depots
          </span>
        </div>
      </div>

      {/* Lots Table */}
      <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-extrabold text-black">
            Posted Feedstock Batches ({sellerLots.length})
          </h2>
          <span className="text-xs text-gray-500">
            Organisation: <b className="text-black">{org.name}</b>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-[10.5px] border-b border-gray-100">
              <tr>
                <th className="py-3 px-6">Material Lot</th>
                <th className="py-3 px-4">Grade</th>
                <th className="py-3 px-4">Available Qty</th>
                <th className="py-3 px-4">Price / kg</th>
                <th className="py-3 px-4">Model</th>
                <th className="py-3 px-4">Facility</th>
                <th className="py-3 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {sellerLots.map((lot) => {
                const pendingOrdersForLot = orderRequests.filter(
                  (r) => r.listingId === lot.id && r.status === 'pending'
                ).length;

                return (
                  <tr key={lot.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="py-4 px-6">
                      <Link to={`/listings/${lot.id}`} className="font-bold text-black hover:text-[#7201FF] block">
                        {lot.title}
                      </Link>
                      <span className="text-[11px] text-gray-500 font-mono">ID: {lot.id}</span>
                    </td>

                    <td className="py-4 px-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-gray-100 text-black">
                        {lot.grade}
                      </span>
                    </td>

                    <td className="py-4 px-4 font-mono font-bold text-black">
                      {lot.mass_kg.toLocaleString()} kg
                    </td>

                    <td className="py-4 px-4 font-mono font-bold text-black">
                      €{lot.price_per_kg?.toFixed(2)}
                    </td>

                    <td className="py-4 px-4">
                      {lot.isAuction ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-900">
                          Auction
                        </span>
                      ) : lot.openToOffers ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-900">
                          Negotiable Buy Now
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-800">
                          Fixed Buy Now
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-4 text-gray-600">
                      {lot.facilityName}
                    </td>

                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {pendingOrdersForLot > 0 && (
                          <Link
                            to="/seller/inbox"
                            className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-full text-[11px] font-extrabold flex items-center gap-1 transition-colors"
                          >
                            <span>{pendingOrdersForLot} Inquiries</span>
                          </Link>
                        )}
                        <Link
                          to={`/listings/${lot.id}`}
                          className="px-3 py-1 bg-black hover:bg-neutral-800 text-white rounded-full text-xs font-semibold transition-colors"
                        >
                          View
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

    </div>
  );
}
