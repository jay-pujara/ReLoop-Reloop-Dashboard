import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import TruckVisualArea from '../../components/TruckVisualArea';
import {
  Sparkles,
  Leaf,
  Layers,
  Plus,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  Calendar,
  Globe2,
  FileCheck,
  Building2,
  ArrowUpRight,
} from 'lucide-react';

export default function LogisticsDashboard() {
  const navigate = useNavigate();
  const { org, listings, requirements, matches } = useApp();

  return (
    <div className="w-full max-w-[1720px] mx-auto px-6 py-6 flex flex-col gap-6">

      {/* 1. Top Stats Bar (Mixing Personal & Platform-Wide Stats) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1 (Personal): Org Total Net CO₂e Saved */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10.5px] font-bold text-gray-500 uppercase tracking-wider">
              Org Net CO₂e Saved (Personal)
            </span>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80">
              +18.4%
            </span>
          </div>
          <div className="my-2">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl lg:text-3xl font-black text-black tracking-tight font-mono">
                {org.netCo2SavedKg?.toLocaleString() || '64,300'}
              </span>
              <span className="text-xs font-bold text-gray-500">kg CO₂e net</span>
            </div>
          </div>
        </div>

        {/* Card 2 (Personal): Org Active Listings */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10.5px] font-bold text-gray-500 uppercase tracking-wider">
              Org Active Listings (Personal)
            </span>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80">
              +2 New
            </span>
          </div>
          <div className="my-2">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl lg:text-3xl font-black text-black tracking-tight font-mono">
                {listings.length}
              </span>
              <span className="text-xs font-bold text-gray-500">Active Listings</span>
            </div>
          </div>
        </div>

        {/* Card 3 (Global): Platform-Wide Total Net CO₂e Saved */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10.5px] font-bold text-gray-500 uppercase tracking-wider">
              Platform Net CO₂e Saved (Global)
            </span>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-[#7201FF] border border-purple-200/80">
              +31% YoY
            </span>
          </div>
          <div className="my-2">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl lg:text-3xl font-black text-black tracking-tight font-mono">
                248,500
              </span>
              <span className="text-xs font-bold text-gray-500">kg CO₂e net</span>
            </div>
          </div>
        </div>

        {/* Card 4 (Global): Platform-Wide Active Listings / Trades */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10.5px] font-bold text-gray-500 uppercase tracking-wider">
              Global Network Activity (Global)
            </span>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80">
              +12 This Wk
            </span>
          </div>
          <div className="my-2">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl lg:text-3xl font-black text-black tracking-tight font-mono">
                142
              </span>
              <span className="text-xs font-bold text-gray-500">Active Trades</span>
            </div>
          </div>
        </div>

      </div>

      {/* 2. Header: Framed as Top Personalized Recommendations */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
        <div>
          <span className="text-xs font-bold text-[#7201FF] tracking-wider uppercase block">
            AI-Powered Circular Recommendations
          </span>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-black tracking-tight mt-0.5">
            Top Recommended Matches for You
          </h1>
        </div>
      </div>

      {/* 3. Truck Visualization: Repurposed as AI Recommendation Carousel */}
      <div>
        <TruckVisualArea />
      </div>

      {/* 4. Below the Truck: Active Listings & Active Requirements Side-by-Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Section A: Your Active Listings */}
        <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-xs flex flex-col gap-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div>
              <h3 className="text-base font-extrabold text-black tracking-tight flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#7201FF]" />
                Your Active Listings ({listings.length})
              </h3>
              <p className="text-xs text-gray-700 font-medium mt-0.5">
                Secondary materials available from your facilities
              </p>
            </div>
            <Link
              to="/listings/new"
              className="px-4 py-2 bg-black hover:bg-neutral-800 text-white rounded-full text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5 text-[#8FFE01]" />
              <span>Create Listing</span>
            </Link>
          </div>

          <div className="divide-y divide-gray-100">
            {listings.slice(0, 4).map((listing) => (
              <Link
                key={listing.id}
                to={`/listings/${listing.id}`}
                className="py-3 px-2 flex items-center justify-between hover:bg-gray-50/80 rounded-2xl transition-colors group"
              >
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold text-black group-hover:text-[#7201FF] transition-colors">
                      {listing.title}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#8FFE01] text-black">
                      {listing.grade}
                    </span>
                  </div>
                  <span className="text-[11.5px] text-gray-700 font-medium">
                    {listing.facilityName} • {listing.mass_kg?.toLocaleString()} kg available
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-sm font-extrabold text-black block">
                      €{listing.price_per_kg?.toFixed(2)}/kg
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-700">
                      Carbon Positive
                    </span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-black group-hover:translate-x-0.5 transition-all" />
                </div>
              </Link>
            ))}
          </div>

          <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
            <span className="text-gray-700 font-medium">Showing top active listings</span>
            <Link
              to="/listings"
              className="font-bold text-[#7201FF] hover:underline flex items-center gap-1"
            >
              View All Listings <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Section B: Your Requirements */}
        <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-xs flex flex-col gap-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div>
              <h3 className="text-base font-extrabold text-black tracking-tight flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#7201FF]" />
                Your Requirements ({requirements.length})
              </h3>
              <p className="text-xs text-gray-700 font-medium mt-0.5">
                Continuous feedstock streams &amp; active standing contracts
              </p>
            </div>
            <Link
              to="/requirements/new"
              className="px-4 py-2 bg-black hover:bg-neutral-800 text-white rounded-full text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5 text-[#8FFE01]" />
              <span>Add Requirement</span>
            </Link>
          </div>

          <div className="divide-y divide-gray-100">
            {requirements.map((req) => (
              <Link
                key={req.id}
                to="/requirements"
                className="py-3 px-2 flex items-center justify-between hover:bg-gray-50/80 rounded-2xl transition-colors group"
              >
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold text-black group-hover:text-[#7201FF] transition-colors">
                      {req.title}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-[#7201FF] border border-purple-200">
                      {req.materialCategory}
                    </span>
                    {req.isStandingContract && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        Standing Contract
                      </span>
                    )}
                  </div>
                  <span className="text-[11.5px] text-gray-700 font-medium">
                    {req.minGrade} • {req.massPerPeriod?.toLocaleString()} kg / {req.period}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-sm font-extrabold text-black block">
                      Max €{req.maxPrice?.toFixed(2)}/kg
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-700">
                      {req.status === 'active' ? '● Seeking Feedstocks' : 'Paused'}
                    </span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-black group-hover:translate-x-0.5 transition-all" />
                </div>
              </Link>
            ))}
          </div>

          <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
            <span className="text-gray-700 font-medium">Standing supply contracts monitored</span>
            <Link
              to="/requirements"
              className="font-bold text-[#7201FF] hover:underline flex items-center gap-1"
            >
              Manage Sourcing Streams <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

      </div>

    </div>
  );
}
