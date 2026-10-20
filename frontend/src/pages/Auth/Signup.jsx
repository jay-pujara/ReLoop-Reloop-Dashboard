import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { RefreshCw, ArrowRight, ShieldCheck } from 'lucide-react';

export default function Signup() {
  const navigate = useNavigate();
  const { setOrg } = useApp();

  const [form, setForm] = useState({
    legalName: 'BioPolymer Technologies B.V.',
    businessId: 'NL-884920194-B01',
    email: 'operations@biopolymerlabs.eu',
    password: '••••••••••••',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setOrg((prev) => ({
      ...prev,
      legalName: form.legalName,
      businessId: form.businessId,
      email: form.email,
    }));
    navigate('/onboarding');
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center p-6 select-none font-sans">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-floating border border-gray-200/80 flex flex-col gap-6">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-black flex items-center justify-center text-white">
            <RefreshCw className="w-4 h-4 stroke-[2.5]" />
          </div>
          <span className="text-xl font-black text-black tracking-tight">ReLoop</span>
        </div>

        <div>
          <h1 className="text-2xl font-extrabold text-black tracking-tight">Create Organisation Account</h1>
          <p className="text-xs text-gray-600 mt-1">
            Access the European circular material exchange &amp; logistics network.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5 text-xs">
          <div>
            <label className="font-bold text-gray-700 block mb-1">Registered Legal Entity Name</label>
            <input
              type="text"
              required
              value={form.legalName}
              onChange={(e) => setForm({ ...form, legalName: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-gray-200 font-medium focus:ring-1 focus:ring-[#7201FF] outline-hidden"
            />
          </div>

          <div>
            <label className="font-bold text-gray-700 block mb-1">Tax / Business ID (VAT/Chamber)</label>
            <input
              type="text"
              required
              value={form.businessId}
              onChange={(e) => setForm({ ...form, businessId: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-gray-200 font-mono font-bold focus:ring-1 focus:ring-[#7201FF] outline-hidden"
            />
          </div>

          <div>
            <label className="font-bold text-gray-700 block mb-1">Corporate Email Address</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-gray-200 font-medium focus:ring-1 focus:ring-[#7201FF] outline-hidden"
            />
          </div>

          <div>
            <label className="font-bold text-gray-700 block mb-1">Password</label>
            <input
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-gray-200 font-medium focus:ring-1 focus:ring-[#7201FF] outline-hidden"
            />
          </div>

          <button
            type="submit"
            className="mt-2 w-full py-3 bg-black hover:bg-neutral-800 text-white rounded-full font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-xs"
          >
            <span>Continue to Onboarding</span>
            <ArrowRight className="w-4 h-4 text-[#8FFE01]" />
          </button>
        </form>

        <div className="text-center text-xs text-gray-500 pt-2 border-t border-gray-100">
          Already registered?{' '}
          <Link to="/login" className="text-[#7201FF] font-bold hover:underline">
            Log in to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
