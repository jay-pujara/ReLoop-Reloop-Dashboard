import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  ArrowLeft,
  Leaf,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Info,
  CheckCircle2,
  X,
} from 'lucide-react';

export default function MatchDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { matches, trades, setTrades } = useApp();

  const match = matches.find((m) => m.id === id) || matches[0];
  const b = match.breakdown;

  const handleClaim = () => {
    navigate(`/checkout/${match.listingId}`);
  };

  return (
    <div className="w-full max-w-[1300px] mx-auto px-6 py-6 flex flex-col gap-6">
      
      {/* Back link & Header */}
      <div>
        <button
          onClick={() => navigate('/matches')}
          className="text-xs font-semibold text-gray-500 hover:text-black flex items-center gap-1 mb-2 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Matches Inbox
        </button>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-[#7201FF] tracking-wider uppercase block">
              Match Audit Report #{match.id}
            </span>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-black tracking-tight mt-0.5">
              {match.title}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <Link
              to={`/listings/${match.listingId || 'L-101'}`}
              className="px-4 py-2 rounded-full bg-black text-white text-xs font-bold hover:bg-neutral-800 transition-all flex items-center gap-1.5 shadow-xs"
            >
              <span>View Material Passport</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <div className="text-right">
              <span className="text-[10px] text-gray-500 block font-bold uppercase">Composite Fit</span>
              <span className="text-2xl font-black font-mono text-black">{match.composite_score} / 100</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Full Carbon LCA Breakdown + Sub-Scores */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (7 Cols): LCA Carbon Breakdown */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-xs flex flex-col gap-5">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Leaf className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-extrabold text-black">
                  Full Carbon Accounting Breakdown
                </h3>
              </div>
              <span className="text-[10.5px] font-mono text-gray-500">
                LCA Standard: {b.factor_version}
              </span>
            </div>

            {/* Stepped Emission Waterfall */}
            <div className="flex flex-col gap-3">
              <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-100 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-emerald-950 block">1. Gross Avoided Emissions</span>
                  <span className="text-[11px] text-emerald-800">Virgin fossil polymer displacement factor</span>
                </div>
                <span className="text-sm font-black font-mono text-emerald-700">
                  +{b.gross_avoided_kg.toLocaleString()} kg CO₂e
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200/70 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-gray-900 block">2. Mechanical Reprocessing Penalty</span>
                  <span className="text-[11px] text-gray-600">Extrusion, washing, and optical sorting energy</span>
                </div>
                <span className="text-sm font-black font-mono text-rose-600">
                  -{b.reprocess_kg.toLocaleString()} kg CO₂e
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200/70 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-gray-900 block">3. Intermodal Transport Emissions</span>
                  <span className="text-[11px] text-gray-600">Haulage across {match.distance_km} km @ {b.assumed_load_factor}% load factor</span>
                </div>
                <span className="text-sm font-black font-mono text-rose-600">
                  -{b.transport_kg.toLocaleString()} kg CO₂e
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-black text-white flex items-center justify-between shadow-xs mt-1">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#8FFE01] block">
                    Net Lifecycle Emissions Saved
                  </span>
                  <span className="text-[11px] text-gray-300">
                    Break-even distance: {b.breakeven_radius_km} km
                  </span>
                </div>
                <span className="text-xl font-black font-mono text-[#8FFE01]">
                  +{b.net_saved_kg.toLocaleString()} kg CO₂e
                </span>
              </div>
            </div>

            {/* Audit Data Sources */}
            <div className="p-3 bg-gray-50 rounded-xl text-[11px] text-gray-600 flex items-center gap-2">
              <Info className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
              <span>
                Data sources: ecoinvent 3.9, PlasticsEurope Eco-profiles, GLEC Framework v3.0 logistics emission intensities.
              </span>
            </div>
          </div>

        </div>

        {/* Right Column (5 Cols): Sub-Score Breakdown & Action CTAs */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-xs flex flex-col gap-4">
            <h3 className="text-xs font-bold text-black uppercase tracking-wider pb-3 border-b border-gray-100">
              Composite Sub-Scores
            </h3>

            <div className="flex flex-col gap-3 text-xs">
              {[
                { label: 'Grade & Melt Index Fit', score: b.grade_fit },
                { label: 'Carbon Abatement Efficiency', score: b.carbon_score },
                { label: 'Semantic Polymer Similarity', score: b.semantic_similarity },
                { label: 'Pricing Guidance Alignment', score: b.price_fit },
                { label: 'Dispatch Timing & Capacity', score: b.timing_fit },
              ].map((s, i) => (
                <div key={i} className="flex flex-col gap-1">
                  <div className="flex justify-between font-semibold text-gray-700">
                    <span>{s.label}</span>
                    <span className="font-mono font-bold text-black">{s.score}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#7201FF]"
                      style={{ width: `${s.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Action CTAs */}
            <div className="flex flex-col gap-2.5 pt-4 border-t border-gray-100">
              <button
                onClick={handleClaim}
                className="w-full py-3 bg-[#7201FF] hover:bg-purple-700 text-white rounded-full text-xs font-bold transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Claim Match &amp; Open Escrow</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => alert('Counter-offer thread initiated.')}
                className="w-full py-2.5 bg-white hover:bg-gray-50 border border-gray-200 text-black rounded-full text-xs font-semibold transition-colors"
              >
                Submit Counter-Offer
              </button>

              <button
                onClick={() => navigate('/matches')}
                className="w-full py-2 text-gray-500 hover:text-red-600 text-xs font-semibold transition-colors text-center"
              >
                Dismiss Match
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
