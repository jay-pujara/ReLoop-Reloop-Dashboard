import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { matchingService } from '../../services';
import {
  Sparkles,
  Leaf,
  X,
  ArrowRight,
  TrendingUp,
  MapPin,
  CheckCircle2,
} from 'lucide-react';

export default function MatchesInbox() {
  const navigate = useNavigate();
  const { matches, setMatches } = useApp();
  const [includeCarbonNegative, setIncludeCarbonNegative] = useState(false);

  useEffect(() => {
    matchingService.fetchMatches({ includeCarbonNegative })
      .then((res) => {
        if (res && res.length > 0) setMatches(res);
      })
      .catch(() => {});
  }, [includeCarbonNegative]);

  const handleDismiss = (id, e) => {
    e.stopPropagation();
    setMatches((prev) => prev.filter((m) => m.id !== id));
  };

  return (
    <div className="w-full max-w-[1720px] mx-auto px-6 py-6 flex flex-col gap-6">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-extrabold text-black tracking-tight">
              Ranked Matches Inbox
            </h1>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-[#7201FF] border border-purple-100 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Autonomous Engine
            </span>
          </div>
        </div>

        {/* User Toggle: Reveal Carbon-Negative Matches */}
        <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 bg-white px-3.5 py-2 rounded-full border border-gray-200/80 shadow-xs cursor-pointer hover:border-gray-300 select-none">
          <input
            type="checkbox"
            checked={includeCarbonNegative}
            onChange={(e) => setIncludeCarbonNegative(e.target.checked)}
            className="w-4 h-4 rounded text-[#7201FF] focus:ring-[#7201FF] cursor-pointer"
          />
          <span>Reveal Carbon-Negative Lots</span>
        </label>
      </div>

      {/* Match Rows List */}
      <div className="flex flex-col gap-4">
        {matches.map((match) => (
          <div
            key={match.id}
            onClick={() => navigate(`/listings/${match.listingId || match.id}`)}
            className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-xs hover:border-[#7201FF] hover:shadow-card transition-all cursor-pointer flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 group select-none"
          >
            {/* Left: Score Badge + Details */}
            <div className="flex items-start gap-4">
              {/* Composite Score Circle Badge */}
              <div className="w-16 h-16 rounded-2xl bg-black text-white flex flex-col items-center justify-center shadow-xs flex-shrink-0 group-hover:bg-[#7201FF] transition-colors">
                <span className="text-2xl font-black font-mono leading-none">
                  {match.composite_score}
                </span>
                <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400 mt-0.5">
                  Match Fit
                </span>
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <h3 className="text-base font-extrabold text-black group-hover:text-[#7201FF] transition-colors">
                    {match.title}
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#8FFE01] text-black">
                    <Leaf className="w-3 h-3 inline mr-1" /> Carbon Positive
                  </span>
                </div>

                <p className="text-xs text-gray-600 mt-1 max-w-2xl leading-relaxed">
                  <strong className="text-black">Reason:</strong> {match.reasonText}
                </p>

                <div className="flex items-center gap-4 mt-2.5 text-xs text-gray-500 font-medium">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-gray-400" /> {match.distance_km} km direct distance
                  </span>
                  <span>•</span>
                  <span>Net Saved: <strong>+{match.breakdown.net_saved_kg.toLocaleString()} kg CO₂e</strong></span>
                </div>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-3 w-full lg:w-auto justify-end pt-3 lg:pt-0 border-t lg:border-t-0 border-gray-100">
              <button
                onClick={(e) => handleDismiss(match.id, e)}
                title="Dismiss match"
                className="px-3.5 py-2 rounded-full border border-gray-200 text-xs font-semibold text-gray-500 hover:text-red-600 hover:border-red-200 hover:bg-red-50/50 transition-colors flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" />
                <span>Dismiss</span>
              </button>

              <Link
                to={`/matches/${match.id}`}
                onClick={(e) => e.stopPropagation()}
                title="View full LCA carbon accounting breakdown"
                className="px-3.5 py-2 rounded-full border border-gray-200 text-xs font-semibold text-gray-600 hover:text-black hover:border-gray-400 hover:bg-gray-50 transition-colors flex items-center gap-1"
              >
                <Leaf className="w-3.5 h-3.5 text-emerald-600" />
                <span>Carbon Audit</span>
              </Link>

              <Link
                to={`/listings/${match.listingId || match.id}`}
                className="px-5 py-2 rounded-full bg-black text-white text-xs font-bold hover:bg-neutral-800 transition-all flex items-center gap-1.5 shadow-xs"
              >
                <span>View Details</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
