import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import FlowGlobe from '../../components/visuals/FlowGlobe';
import {
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  Leaf,
  Layers,
  Truck,
  Plus,
  Clock,
  Sparkles,
  Package,
} from 'lucide-react';

export default function Dashboard() {
  const { org, listings, requirements, matches, proposedRoutes, vehicles, notifications } = useApp();

  const isSeller = org.capabilities.includes('seller');
  const isBuyer = org.capabilities.includes('buyer') || org.capabilities.includes('recycler');
  const isCarrier = org.capabilities.includes('carrier');

  return (
    <div className="w-full max-w-[1720px] mx-auto px-6 py-6 flex flex-col gap-6">
      
      {/* 1. Verification Warning Banner (if unverified / pending) */}
      {org.verificationStatus !== 'verified' && (
        <div className="bg-amber-50/90 border border-amber-200/90 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-700">
              <ShieldAlert className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-amber-950">
                {org.verificationStatus === 'unverified'
                  ? 'Organisation Documents Required for High-Value Trades'
                  : 'Verification Documents Pending Compliance Review'}
              </h4>
              <p className="text-[11.5px] text-amber-800">
                Your account is currently limited to trades under €{org.verificationThreshold.toLocaleString()}. Submit business registration documents to unlock unrestricted claiming.
              </p>
            </div>
          </div>
          <Link
            to="/settings/organisation"
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-full text-xs font-bold transition-colors flex items-center gap-1.5"
          >
            <span>{org.verificationStatus === 'unverified' ? 'Submit Documents' : 'View Status'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* 2. Top Header & Org Impact Summary Stat Block */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-black tracking-tight">
            Welcome back, {org.name}
          </h1>
          <p className="text-xs text-gray-700 font-medium mt-0.5">
            Active Capabilities: <strong className="text-black">{org.capabilities.join(' • ')}</strong>
          </p>
        </div>

        {/* Impact Summary Stat Block */}
        <div className="flex items-center gap-6 bg-white px-5 py-2.5 rounded-2xl border border-gray-200/80 shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-[#8FFE01]">
              <Leaf className="w-4 h-4 text-emerald-600 stroke-[2.2]" />
            </div>
            <div>
              <span className="text-[10.5px] font-bold text-gray-500 uppercase tracking-wider block">
                Net CO₂e Saved
              </span>
              <span className="text-lg font-extrabold text-black leading-none">
                64,300 kg
              </span>
            </div>
          </div>

          <div className="w-[1px] h-8 bg-gray-100" />

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center text-[#7201FF]">
              <TrendingUp className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <span className="text-[10.5px] font-bold text-gray-500 uppercase tracking-wider block">
                Trades Completed
              </span>
              <span className="text-lg font-extrabold text-black leading-none">
                28 Closed
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Main Dashboard Grid: Conditional Sections + Flow Globe Preview */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left Column (2 Cols wide on desktop): Capability Adaptive Blocks */}
        <div className="xl:col-span-2 flex flex-col gap-6">
          
          {/* Action Required / Notifications List */}
          <div className="bg-white rounded-3xl p-5 border border-gray-200/80 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-sm font-extrabold text-black tracking-tight flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#7201FF]" />
                Pending Actions &amp; Priority Alerts
              </h3>
              <span className="text-xs font-bold text-gray-700 bg-gray-100 px-2 py-0.5 rounded-full">
                {notifications.length} Action Items
              </span>
            </div>
            <div className="divide-y divide-gray-50 mt-2">
              {notifications.map((n) => (
                <Link
                  key={n.id}
                  to={n.link}
                  className="py-3 px-2 flex items-center justify-between hover:bg-gray-50/80 rounded-xl transition-colors group"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#7201FF] mt-1.5" />
                    <div>
                      <h4 className="text-xs font-bold text-black group-hover:text-[#7201FF] transition-colors">
                        {n.title}
                      </h4>
                      <p className="text-[11.5px] text-gray-600 mt-0.5">{n.desc}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-gray-700">
                    <span>{n.date}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Conditional Seller Block: Active Listings */}
          {isSeller && (
            <div className="bg-white rounded-3xl p-5 border border-gray-200/80 shadow-xs flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-black tracking-tight flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[#7201FF]" />
                    Your Active Listings ({listings.length})
                  </h3>
                  <p className="text-[11.5px] text-gray-700 font-medium">
                    Materials listed from your primary and regional facilities
                  </p>
                </div>
                <Link
                  to="/listings/new"
                  className="px-3 py-1.5 bg-black hover:bg-neutral-800 text-white rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Listing</span>
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {listings.slice(0, 4).map((l) => (
                  <Link
                    key={l.id}
                    to={`/listings/${l.id}`}
                    className="p-3.5 rounded-2xl bg-gray-50/80 hover:bg-white border border-gray-200/70 hover:border-gray-300 hover:shadow-xs transition-all flex flex-col justify-between gap-2.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-bold text-black line-clamp-1">{l.title}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#8FFE01] text-black">
                        {l.grade}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-gray-600 font-medium">
                      <span>{l.mass_kg.toLocaleString()} kg</span>
                      <span className="font-mono font-bold text-black">€{l.price_per_kg}/kg</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Conditional Buyer / Recycler Block: Open Requirements & Matches */}
          {isBuyer && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-3xl p-5 border border-gray-200/80 shadow-xs flex flex-col justify-between gap-3">
                <div>
                  <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                    Buyer Sourcing Stream
                  </span>
                  <h3 className="text-sm font-extrabold text-black tracking-tight mt-0.5">
                    Open Requirements ({requirements.length})
                  </h3>
                  <p className="text-[11.5px] text-gray-600 mt-1">
                    Continuous feedstocks &amp; active standing contracts with volume tracking.
                  </p>
                </div>
                <Link
                  to="/requirements"
                  className="text-xs font-bold text-[#7201FF] flex items-center gap-1 hover:underline"
                >
                  <span>Manage Requirements</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="bg-white rounded-3xl p-5 border border-gray-200/80 shadow-xs flex flex-col justify-between gap-3">
                <div>
                  <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                    Autonomous Matching
                  </span>
                  <h3 className="text-sm font-extrabold text-black tracking-tight mt-0.5">
                    New Qualified Matches ({matches.length})
                  </h3>
                  <p className="text-[11.5px] text-gray-600 mt-1">
                    Ranked by carbon break-even, geometric fit, and chemical similarity.
                  </p>
                </div>
                <Link
                  to="/matches"
                  className="text-xs font-bold text-[#7201FF] flex items-center gap-1 hover:underline"
                >
                  <span>Review Matches Inbox</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}

          {/* Conditional Carrier Block: Fleet & Proposed Routes */}
          {isCarrier && (
            <div className="bg-white rounded-3xl p-5 border border-gray-200/80 shadow-xs flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-black tracking-tight flex items-center gap-2">
                    <Truck className="w-4 h-4 text-[#7201FF]" />
                    Carrier Logistics Board
                  </h3>
                  <p className="text-[11.5px] text-gray-700 font-medium">
                    {vehicles.length} registered vehicles • {proposedRoutes.length} proposed multi-stop routes awaiting confirmation
                  </p>
                </div>
                <Link
                  to="/logistics"
                  className="px-3.5 py-1.5 rounded-full bg-black text-white text-xs font-semibold hover:bg-neutral-800 transition-colors"
                >
                  Open Logistics Hub
                </Link>
              </div>
            </div>
          )}

        </div>

        {/* Right Column: Flow Globe Preview Card */}
        <div className="flex flex-col gap-6">
          <div className="bg-white rounded-3xl p-5 border border-gray-200/80 shadow-xs flex flex-col justify-between h-full min-h-[460px]">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  Network Overview
                </span>
                <span className="w-2 h-2 rounded-full bg-[#8FFE01] animate-pulse" />
              </div>
              <h3 className="text-base font-extrabold text-black tracking-tight">
                Live Material Flow Globe
              </h3>
              <p className="text-xs text-gray-700 mt-0.5">
                Real-time trans-European circular trade arcs &amp; break-even domes.
              </p>
            </div>

            {/* Embedded 3D Flow Globe (Preview Mode) */}
            <div className="my-3 h-[280px] rounded-2xl overflow-hidden relative">
              <FlowGlobe previewMode={true} />
            </div>

            <Link
              to="/logistics"
              className="w-full py-2.5 bg-black hover:bg-neutral-800 text-white rounded-full text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs"
            >
              <span>Explore Logistics Hub</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

      </div>

    </div>
  );
}
