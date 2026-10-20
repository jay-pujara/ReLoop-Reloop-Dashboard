import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  ArrowLeft,
  Sparkles,
  Leaf,
  TrendingUp,
  Save,
  CheckCircle2,
} from 'lucide-react';

export default function RequirementNew() {
  const navigate = useNavigate();
  const { requirements, setRequirements, addRequirement, facilities } = useApp();

  const [formData, setFormData] = useState({
    title: 'Sourcing Run: Industrial Grade rHDPE Pellets',
    materialCategory: 'rHDPE',
    minGrade: 'Grade A',
    massPerPeriod: 30000,
    period: 'monthly',
    maxPrice: 1.28,
    useCarbonLimit: true,
    maxDistanceKm: 200,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const primaryFacility = facilities?.[0];
    const newReq = {
      title: formData.title,
      materialCategory: formData.materialCategory.toLowerCase().includes('cardboard') ? 'cardboard' : formData.materialCategory.toLowerCase().includes('pallet') ? 'pallets' : 'plastic',
      materialSubtype: formData.materialCategory.toLowerCase(),
      minGrade: formData.minGrade,
      quantity: Number(formData.massPerPeriod),
      massKgPerPeriod: Number(formData.massPerPeriod),
      period: formData.period,
      maxPricePerKg: Number(formData.maxPrice),
      maxDistanceKm: Number(formData.maxDistanceKm || 300),
      facilityId: primaryFacility?.id || primaryFacility?._id,
      status: 'Active',
    };

    if (addRequirement) {
      await addRequirement(newReq);
    } else {
      const newId = `REQ-${Math.floor(210 + Math.random() * 800)}`;
      setRequirements([{ ...newReq, id: newId }, ...requirements]);
    }
    navigate('/requirements');
  };

  return (
    <div className="w-full max-w-[1100px] mx-auto px-6 py-6 flex flex-col gap-6">
      
      {/* Header */}
      <div>
        <button
          onClick={() => navigate('/requirements')}
          className="text-xs font-semibold text-gray-500 hover:text-black flex items-center gap-1 mb-2 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Requirements
        </button>
        <h1 className="text-2xl font-extrabold text-black tracking-tight">
          Post Feedstock Requirement
        </h1>
        <p className="text-xs text-gray-600 mt-0.5">
          Define target polymer grades, volume targets, and carbon-optimized matching criteria.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-8 border border-gray-200/80 shadow-xs flex flex-col gap-6">
        
        {/* Predictive Supply Forecast Panel */}
        <div className="p-5 rounded-2xl bg-purple-50/70 border border-purple-100 flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-black flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#7201FF]" />
              Predictive Regional Supply Forecast ({formData.materialCategory})
            </span>
            <span className="text-[11px] font-bold text-[#7201FF] bg-white px-2.5 py-0.5 rounded-full border border-purple-200">
              Benelux &amp; Westphalia Region
            </span>
          </div>
          <p className="text-xs text-gray-700 leading-relaxed">
            Predicted upcoming volume: <strong className="text-black font-mono">145,000 kg</strong> of {formData.minGrade} {formData.materialCategory} expected across 9 network facilities over the next 30 days.
          </p>
          <span className="text-[10.5px] text-gray-700">
            Basis: 12-month historical dispatch patterns + seasonal industrial shutdowns.
          </span>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div className="col-span-2">
            <label className="font-bold text-gray-700 block mb-1">Requirement Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-gray-200 font-medium focus:ring-1 focus:ring-[#7201FF] outline-hidden"
            />
          </div>

          <div>
            <label className="font-bold text-gray-700 block mb-1">Polymer Family</label>
            <select
              value={formData.materialCategory}
              onChange={(e) => setFormData({ ...formData, materialCategory: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-gray-200 font-medium focus:ring-1 focus:ring-[#7201FF] outline-hidden"
            >
              <option value="rHDPE">rHDPE (High Density)</option>
              <option value="rPET">rPET (Polyethylene Terephthalate)</option>
              <option value="rLDPE">rLDPE (Low Density)</option>
              <option value="rPP">rPP (Polypropylene)</option>
            </select>
          </div>

          <div>
            <label className="font-bold text-gray-700 block mb-1">Minimum Acceptable Grade</label>
            <select
              value={formData.minGrade}
              onChange={(e) => setFormData({ ...formData, minGrade: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-gray-200 font-medium focus:ring-1 focus:ring-[#7201FF] outline-hidden"
            >
              <option>Grade A+</option>
              <option>Grade A</option>
              <option>Grade B+</option>
              <option>Grade B</option>
            </select>
          </div>

          <div>
            <label className="font-bold text-gray-700 block mb-1">Target Volume Demand (kg)</label>
            <input
              type="number"
              required
              value={formData.massPerPeriod}
              onChange={(e) => setFormData({ ...formData, massPerPeriod: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-gray-200 font-bold focus:ring-1 focus:ring-[#7201FF] outline-hidden font-mono"
            />
          </div>

          <div>
            <label className="font-bold text-gray-700 block mb-1">Cadence Period</label>
            <select
              value={formData.period}
              onChange={(e) => setFormData({ ...formData, period: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-gray-200 font-medium focus:ring-1 focus:ring-[#7201FF] outline-hidden"
            >
              <option value="weekly">Weekly Run</option>
              <option value="bi-weekly">Bi-Weekly Run</option>
              <option value="monthly">Monthly Sourcing</option>
            </select>
          </div>

          <div>
            <label className="font-bold text-gray-700 block mb-1">Maximum Price per kg (€)</label>
            <input
              type="number"
              step="0.01"
              value={formData.maxPrice}
              onChange={(e) => setFormData({ ...formData, maxPrice: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-gray-200 font-bold focus:ring-1 focus:ring-[#7201FF] outline-hidden font-mono"
            />
          </div>

          {/* Carbon Limit Toggle vs Fixed Distance */}
          <div className="flex flex-col justify-end">
            <label className="flex items-center gap-2 cursor-pointer select-none mb-2">
              <input
                type="checkbox"
                checked={formData.useCarbonLimit}
                onChange={(e) => setFormData({ ...formData, useCarbonLimit: e.target.checked })}
                className="w-4 h-4 rounded text-[#7201FF] focus:ring-[#7201FF] cursor-pointer"
              />
              <span className="font-bold text-black text-xs flex items-center gap-1">
                <Leaf className="w-3.5 h-3.5 text-emerald-600" /> Let platform determine limit based on carbon break-even
              </span>
            </label>

            {!formData.useCarbonLimit && (
              <div>
                <label className="font-bold text-gray-700 block mb-1">Max Fixed Distance (km)</label>
                <input
                  type="number"
                  value={formData.maxDistanceKm}
                  onChange={(e) => setFormData({ ...formData, maxDistanceKm: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-200 font-medium focus:ring-1 focus:ring-[#7201FF] outline-hidden"
                />
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-gray-100">
          <button
            type="submit"
            className="px-6 py-2.5 bg-black hover:bg-neutral-800 text-white rounded-full text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
          >
            <span>Activate Requirement</span>
            <CheckCircle2 className="w-4 h-4 text-[#8FFE01]" />
          </button>
        </div>

      </form>
    </div>
  );
}
