import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { authService } from '../../services';
import {
  MapPin,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Building,
} from 'lucide-react';

export default function Onboarding() {
  const navigate = useNavigate();
  const { org, setOrg, facilities, setFacilities } = useApp();

  const [step, setStep] = useState(1); // 1: Facility, 2: Capabilities

  // Step 1 State
  const [facility, setFacility] = useState({
    name: 'Rotterdam Circular Hub (HQ)',
    address: 'Maashaven Zuidzijde 12, 3072 AE Rotterdam, Netherlands',
    lat: 51.9054,
    lng: 4.4842,
  });

  // Step 2 State
  const [selectedCapabilities, setSelectedCapabilities] = useState(['seller', 'buyer']);

  const toggleCap = (cap) => {
    if (selectedCapabilities.includes(cap)) {
      if (selectedCapabilities.length > 1) {
        setSelectedCapabilities(selectedCapabilities.filter((c) => c !== cap));
      }
    } else {
      setSelectedCapabilities([...selectedCapabilities, cap]);
    }
  };

  const handleFinish = async () => {
    // Save primary facility
    setFacilities([
      {
        id: 1,
        name: facility.name,
        address: facility.address,
        lat: facility.lat,
        lng: facility.lng,
        isPrimary: true,
        capacityTons: 4500,
      },
    ]);

    // Save selected capabilities
    setOrg((prev) => ({
      ...prev,
      capabilities: selectedCapabilities,
    }));

    // Register user and create facility in backend if email was provided
    try {
      if (org.email) {
        await authService.register({
          email: org.email,
          password: org.password || 'StrongPassword2026!',
          name: org.legalName || 'Operations Lead',
          organizationName: org.legalName || 'Circular Enterprise',
          organizationType: selectedCapabilities.includes('recycler')
            ? 'recycler'
            : selectedCapabilities.includes('carrier')
            ? 'logistics'
            : 'manufacturer',
          city: facility.address ? facility.address.split(',')[0].trim() : 'Rotterdam',
          country: 'Netherlands',
        });
        await authService.createFacility({
          name: facility.name,
          address: facility.address,
          lat: facility.lat,
          lng: facility.lng,
        });
        await authService.updateOrganization({ roles: selectedCapabilities });
      }
    } catch (err) {
      console.warn('Backend onboarding registration sync (continuing):', err.message);
    }

    navigate('/logistics');
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center p-6 select-none font-sans">
      <div className="bg-white rounded-3xl p-8 max-w-xl w-full shadow-floating border border-gray-200/80 flex flex-col gap-6">
        
        {/* Progress Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-black flex items-center justify-center text-white">
              <RefreshCw className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
            <span className="font-extrabold text-black text-sm">ReLoop Onboarding</span>
          </div>
          <span className="text-xs font-bold text-[#7201FF]">
            Step {step} of 2
          </span>
        </div>

        {/* Step 1: Add Primary Facility */}
        {step === 1 ? (
          <div className="flex flex-col gap-4">
            <div>
              <h2 className="text-xl font-extrabold text-black tracking-tight">
                Step 1: Set Up Primary Facility
              </h2>
              <p className="text-xs text-gray-600 mt-1">
                Enter your main processing plant, recycling yard, or logistics depot for geocoding and break-even radius matching.
              </p>
            </div>

            <div className="flex flex-col gap-3 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Facility Name</label>
                <input
                  type="text"
                  required
                  value={facility.name}
                  onChange={(e) => setFacility({ ...facility, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-200 font-medium focus:ring-1 focus:ring-[#7201FF] outline-hidden"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Facility Address</label>
                <input
                  type="text"
                  required
                  value={facility.address}
                  onChange={(e) => setFacility({ ...facility, address: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-200 font-medium focus:ring-1 focus:ring-[#7201FF] outline-hidden"
                />
              </div>

              {/* Geocoding Preview */}
              <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200 flex items-center justify-between font-mono text-[11px] text-gray-600">
                <span className="flex items-center gap-1.5 font-sans font-semibold text-black">
                  <MapPin className="w-3.5 h-3.5 text-[#7201FF]" /> Geocoded Coordinates:
                </span>
                <span>Lat: {facility.lat}, Lng: {facility.lng}</span>
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              className="mt-2 w-full py-3 bg-black hover:bg-neutral-800 text-white rounded-full font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-xs"
            >
              <span>Next: Select Capabilities</span>
              <ArrowRight className="w-4 h-4 text-[#8FFE01]" />
            </button>
          </div>
        ) : (
          /* Step 2: Capability Selection */
          <div className="flex flex-col gap-4">
            <div>
              <h2 className="text-xl font-extrabold text-black tracking-tight">
                Step 2: Choose Initial Capabilities
              </h2>
              <p className="text-xs text-gray-600 mt-1">
                Select your intended operational activities (multi-select). This controls which dashboard sections and tools appear. You can edit this anytime in Settings.
              </p>
            </div>

            <div className="flex flex-col gap-2.5">
              {[
                { id: 'seller', label: 'Sell surplus material (Seller)', desc: 'Post secondary feedstock listings and review incoming bids.' },
                { id: 'buyer', label: 'Source material (Buyer)', desc: 'Set up feedstock sourcing requirements and claim matching lots.' },
                { id: 'recycler', label: 'Process / recycle material (Recycler)', desc: 'Receive feedstock for sorting, wash lines, and compounding.' },
                { id: 'carrier', label: 'Operate logistics / vehicles (Carrier)', desc: 'Accept consolidated multi-stop shipment routes and backhauls.' },
              ].map((cap) => {
                const active = selectedCapabilities.includes(cap.id);
                return (
                  <div
                    key={cap.id}
                    onClick={() => toggleCap(cap.id)}
                    className={`p-3.5 rounded-2xl border cursor-pointer select-none transition-all flex items-center justify-between ${
                      active
                        ? 'bg-purple-50/50 border-[#7201FF] shadow-xs'
                        : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div>
                      <h4 className="font-extrabold text-black text-xs">{cap.label}</h4>
                      <p className="text-[11px] text-gray-500 mt-0.5">{cap.desc}</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={active}
                      onChange={() => {}}
                      className="w-4 h-4 rounded text-[#7201FF] focus:ring-[#7201FF] pointer-events-none ml-2"
                    />
                  </div>
                );
              })}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setStep(1)}
                className="px-5 py-2.5 rounded-full border border-gray-200 text-xs font-semibold hover:bg-gray-50"
              >
                Back
              </button>
              <button
                onClick={handleFinish}
                className="flex-1 py-3 bg-[#7201FF] hover:bg-purple-700 text-white rounded-full font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-xs"
              >
                <span>Launch ReLoop Dashboard</span>
                <CheckCircle2 className="w-4 h-4 text-[#8FFE01]" />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
