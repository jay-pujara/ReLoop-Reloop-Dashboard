import React, { useState } from 'react';
import { ArrowRight, Scale, Leaf, TrendingDown } from 'lucide-react';

export default function ImpactSankey() {
  const [metric, setMetric] = useState('mass'); // 'mass' | 'carbon'

  // Sankey Stage Data
  const sources = [
    { label: 'Post-Industrial Clean Scrap', mass: 4800, carbon: 9800, color: '#7201FF' },
    { label: 'Post-Consumer Washed Flakes', mass: 6200, carbon: 14200, color: '#8FFE01' },
    { label: 'Commercial Packaging Return', mass: 2400, carbon: 4100, color: '#3A3A3C' },
  ];

  const materials = [
    { label: 'rPET (Bottle/Sheet)', mass: 5400, carbon: 12100 },
    { label: 'rHDPE (Blow/Inject)', mass: 4600, carbon: 8900 },
    { label: 'rLDPE (Film Bales)', mass: 2100, carbon: 4300 },
    { label: 'rPP (Co-Polymer)', mass: 1300, carbon: 2800 },
  ];

  const destinations = [
    { label: 'High-Value Circular Reuse', pct: 52, mass: 6968, carbon: 16200, color: '#8FFE01' },
    { label: 'Mechanical Pelletization', pct: 36, mass: 4824, carbon: 9800, color: '#7201FF' },
    { label: 'Closed-Loop Feedstock', pct: 9, mass: 1206, carbon: 1800, color: '#636366' },
    { label: 'Residual Landfill (Shrinking)', pct: 3, mass: 402, carbon: 300, color: '#FF453A', isResidual: true },
  ];

  const total = metric === 'mass' ? '13,400 tonnes' : '28,100 tCO₂e';

  return (
    <div className="w-full bg-white rounded-3xl p-6 border border-gray-200/80 shadow-xs flex flex-col gap-5 select-none">
      {/* Header & Metric Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-gray-100">
        <div>
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
            Circular Material &amp; Carbon Trajectory
          </span>
          <h3 className="text-xl font-extrabold text-black tracking-tight mt-0.5">
            Material Flow &amp; Carbon Sankey
          </h3>
        </div>

        {/* Toggle between Mass Flow vs Carbon Flow */}
        <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-full">
          <button
            onClick={() => setMetric('mass')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              metric === 'mass'
                ? 'bg-black text-white shadow-xs'
                : 'text-gray-600 hover:text-black'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>Mass Flow (tonnes)</span>
          </button>
          <button
            onClick={() => setMetric('carbon')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              metric === 'carbon'
                ? 'bg-black text-white shadow-xs'
                : 'text-gray-600 hover:text-black'
            }`}
          >
            <Leaf className="w-3.5 h-3.5 text-[#8FFE01]" />
            <span>Carbon Flow (tCO₂e)</span>
          </button>
        </div>
      </div>

      {/* Sankey Flow Representation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
        
        {/* Stage 1: Origin Sources */}
        <div className="flex flex-col gap-3">
          <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
            1. Sourcing Origins
          </span>
          {sources.map((s, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200/70 flex flex-col gap-1 hover:border-gray-300 transition-colors"
            >
              <div className="flex items-center justify-between text-xs font-bold text-black">
                <span>{s.label}</span>
                <span className="font-mono text-[#7201FF]">
                  {metric === 'mass' ? `${s.mass} t` : `${s.carbon} tCO₂e`}
                </span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mt-1">
                <div
                  className="h-full rounded-full"
                  style={{
                    backgroundColor: s.color,
                    width: `${(s.mass / 13400) * 100}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Stage 2: Material Polymorphs */}
        <div className="flex flex-col gap-3">
          <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
            2. Polymer Streams
          </span>
          {materials.map((m, idx) => (
            <div
              key={idx}
              className="p-2.5 rounded-xl bg-white border border-gray-200/90 shadow-2xs flex items-center justify-between text-xs hover:border-[#7201FF] transition-colors"
            >
              <span className="font-semibold text-black">{m.label}</span>
              <span className="font-mono text-gray-700 font-bold">
                {metric === 'mass' ? `${m.mass} t` : `${m.carbon} tCO₂e`}
              </span>
            </div>
          ))}
        </div>

        {/* Stage 3: Destinations & Landfill Diversion */}
        <div className="flex flex-col gap-3">
          <span className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center justify-between">
            <span>3. Circular Fate</span>
            <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
              97% Diverted
            </span>
          </span>
          {destinations.map((d, idx) => (
            <div
              key={idx}
              className={`p-3.5 rounded-2xl border flex flex-col gap-1 transition-colors ${
                d.isResidual
                  ? 'bg-rose-50/50 border-rose-200'
                  : 'bg-gray-50 border-gray-200/70 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-bold">
                <span className={d.isResidual ? 'text-rose-700' : 'text-black'}>
                  {d.label}
                </span>
                <span className="font-mono font-bold text-black">
                  {d.pct}% ({metric === 'mass' ? `${d.mass} t` : `${d.carbon} tCO₂e`})
                </span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mt-1">
                <div
                  className="h-full rounded-full"
                  style={{
                    backgroundColor: d.color,
                    width: `${d.pct}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Residual Landfill Shrunk Banner */}
      <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-3 flex items-center justify-between text-xs text-emerald-900">
        <div className="flex items-center gap-2 font-semibold">
          <TrendingDown className="w-4 h-4 text-emerald-600" />
          <span>
            Landfill branch contracted from <strong>24%</strong> to <strong>3.0%</strong> across network trades this quarter.
          </span>
        </div>
        <span className="font-mono font-bold text-emerald-700">Net CO₂e Saved: 28,100 t</span>
      </div>
    </div>
  );
}
