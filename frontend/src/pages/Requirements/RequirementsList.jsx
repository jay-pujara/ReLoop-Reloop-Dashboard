import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  Plus,
  Layers,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  Pause,
  Play,
  TrendingDown,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

export default function RequirementsList() {
  const { requirements, setRequirements } = useApp();
  const [activeTab, setActiveTab] = useState('active'); // 'active' | 'standing'

  const toggleStatus = (id) => {
    setRequirements((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: r.status === 'active' ? 'paused' : 'active' } : r))
    );
  };

  const activeReqs = requirements.filter((r) => !r.isStandingContract);
  const standingContracts = requirements.filter((r) => r.isStandingContract);

  return (
    <div className="w-full max-w-[1720px] mx-auto px-6 py-6 flex flex-col gap-6">
      
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-black tracking-tight">
            Requirements
          </h1>
        </div>

        <Link
          to="/requirements/new"
          className="h-10 px-5 bg-black hover:bg-neutral-800 text-white rounded-full text-xs font-bold shadow-xs flex items-center gap-2 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Create Requirement</span>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('active')}
          className={`pb-3 text-xs font-bold transition-all relative ${
            activeTab === 'active'
              ? 'text-black border-b-2 border-black'
              : 'text-gray-500 hover:text-black'
          }`}
        >
          Active Requirements ({activeReqs.length})
        </button>

        <button
          onClick={() => setActiveTab('standing')}
          className={`pb-3 text-xs font-bold transition-all relative flex items-center gap-1.5 ${
            activeTab === 'standing'
              ? 'text-black border-b-2 border-black'
              : 'text-gray-500 hover:text-black'
          }`}
        >
          <span>Standing Contracts ({standingContracts.length})</span>
          {standingContracts.some((s) => s.driftAlert) && (
            <span className="w-2 h-2 rounded-full bg-amber-500" />
          )}
        </button>
      </div>

      {/* Tab 1: Active Requirements */}
      {activeTab === 'active' && (
        <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/90 text-gray-500 font-bold uppercase tracking-wider text-[10.5px] border-b border-gray-100">
                <tr>
                  <th className="py-3.5 px-6">Requirement Title</th>
                  <th className="py-3.5 px-4">Polymer</th>
                  <th className="py-3.5 px-4">Min Grade</th>
                  <th className="py-3.5 px-4">Volume Demand</th>
                  <th className="py-3.5 px-4">Max Price</th>
                  <th className="py-3.5 px-4">Distance Constraint</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {activeReqs.map((req) => (
                  <tr key={req.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="py-4 px-6 font-bold text-black text-[13px]">
                      {req.title}
                    </td>
                    <td className="py-4 px-4 font-bold text-[#7201FF]">{req.materialCategory}</td>
                    <td className="py-4 px-4">{req.minGrade}</td>
                    <td className="py-4 px-4 font-mono font-bold text-black">
                      {req.massPerPeriod.toLocaleString()} kg / {req.period}
                    </td>
                    <td className="py-4 px-4 font-mono font-bold text-black">
                      €{req.maxPrice.toFixed(2)}/kg
                    </td>
                    <td className="py-4 px-4">
                      {req.useCarbonLimit ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 text-[#7201FF] border border-purple-100">
                          🌱 Carbon-Optimized Limit
                        </span>
                      ) : (
                        <span className="text-gray-600 font-medium">Max {req.maxDistanceKm} km</span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10.5px] font-bold ${
                          req.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {req.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => toggleStatus(req.id)}
                        className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-black rounded-full text-xs font-semibold transition-colors"
                      >
                        {req.status === 'active' ? 'Pause' : 'Resume'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Standing Contracts with Drift Alert */}
      {activeTab === 'standing' && (
        <div className="flex flex-col gap-4">
          {standingContracts.map((sc) => (
            <div
              key={sc.id}
              className={`p-6 rounded-3xl bg-white border shadow-xs flex flex-col gap-4 ${
                sc.driftAlert ? 'border-amber-300 ring-1 ring-amber-200' : 'border-gray-200/80'
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-extrabold text-black">{sc.title}</h3>
                    <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-purple-100 text-[#7201FF]">
                      Auto-Match Standing Contract
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Schedule: <strong>{sc.cadence}</strong> • Baseline Volume: <strong>{sc.baselineVolume.toLocaleString()} kg</strong>
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-xs text-gray-500 block">Recent Cycle Actuals</span>
                  <span className="text-lg font-black font-mono text-black">
                    {sc.recentVolume.toLocaleString()} kg
                  </span>
                </div>
              </div>

              {/* Drift Alert Box */}
              {sc.driftAlert && (
                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between text-xs text-amber-900">
                  <div className="flex items-center gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>
                      <strong>Volume Drift Alert:</strong> {sc.driftText}
                    </span>
                  </div>
                  <button
                    onClick={() => alert('Recalibration flow triggered for standing contract.')}
                    className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-full font-bold text-[11px] transition-colors"
                  >
                    Recalibrate Baseline
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
