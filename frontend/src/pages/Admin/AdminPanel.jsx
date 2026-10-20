import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  FileText,
  AlertTriangle,
  Layers,
  Activity,
  Plus,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

export default function AdminPanel() {
  const { org, emissionFactors, setEmissionFactors } = useApp();
  const [activeTab, setActiveTab] = useState('verification'); // 'verification' | 'disputes' | 'factors' | 'health'

  // Admin Gating Check
  if (!org.permissions.platform_admin) {
    return (
      <div className="w-full max-w-lg mx-auto py-24 text-center px-6">
        <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-extrabold text-black">Access Restricted</h2>
        <p className="text-xs text-gray-600 mt-1">
          This area is restricted to users with <code>platform_admin</code> authorization. Use the floating Role Switcher at the bottom-right to toggle Admin permission.
        </p>
      </div>
    );
  }

  // Mock Verification Queue
  const [verificationQueue, setVerificationQueue] = useState([
    { id: 'VQ-1', orgName: 'Nordic Circular Materials ApS', country: 'Denmark', businessId: 'DK-9920194', submittedDate: '2026-09-11', docName: 'Chamber_Of_Commerce_Extract.pdf', status: 'pending' },
    { id: 'VQ-2', orgName: 'Rheinland Recovery GmbH', country: 'Germany', businessId: 'DE-8492012', submittedDate: '2026-09-10', docName: 'Handelsregister_HRB_8821.pdf', status: 'pending' },
  ]);

  // Mock Disputes Queue
  const [disputesQueue, setDisputesQueue] = useState([
    { id: 'DQ-1', tradeId: 'TR-3980', buyerOrg: 'EcoPlast Polymers France', sellerOrg: 'Nordic Circular Materials', material: 'rPET Washed Flakes', disputedAmount: 31680, reason: 'Delivery grade degraded to Grade B due to high moisture count (2.8%)', status: 'under_review' },
  ]);

  // Factor Management State
  const [showFactorModal, setShowFactorModal] = useState(false);
  const [newFactor, setNewFactor] = useState({
    material: 'rPET Flakes (Bottle-to-Bottle)',
    efVirgin: 2.18,
    efReprocess: 0.35,
    source: 'ecoinvent 3.9.1 Update',
  });

  const handleCreateNewVersion = (e) => {
    e.preventDefault();
    const created = {
      id: `EF-0${emissionFactors.length + 1}`,
      material: newFactor.material,
      efVirgin: Number(newFactor.efVirgin),
      efReprocess: Number(newFactor.efReprocess),
      source: newFactor.source,
      version: 'v2.5',
      updatedAt: '2026-09-12',
    };
    setEmissionFactors([created, ...emissionFactors]);
    setShowFactorModal(false);
  };

  return (
    <div className="w-full max-w-[1720px] mx-auto px-6 py-6 flex flex-col gap-6">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-extrabold text-black tracking-tight">
              Platform Administration
            </h1>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#7201FF] text-white">
              Root Authority
            </span>
          </div>
          <p className="text-xs text-gray-700 font-medium mt-0.5">
            Organisation verification queue, escrow arbitration, emission factor versioning, and matching health
          </p>
        </div>
      </div>

      {/* Admin Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200">
        {[
          { id: 'verification', label: `Verification Queue (${verificationQueue.length})` },
          { id: 'disputes', label: `Disputes Arbitration (${disputesQueue.length})` },
          { id: 'factors', label: `Emission Factors (${emissionFactors.length})` },
          { id: 'health', label: 'Matching System Health' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-3 text-xs font-bold transition-all relative ${
              activeTab === tab.id
                ? 'text-black border-b-2 border-black'
                : 'text-gray-500 hover:text-black'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Verification Queue */}
      {activeTab === 'verification' && (
        <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xs overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between text-xs">
            <span className="font-bold text-black">Pending Organisation Compliance Submissions</span>
            <span className="text-gray-500">Unlocks unrestricted trading above €15,000</span>
          </div>

          <div className="divide-y divide-gray-100">
            {verificationQueue.map((item) => (
              <div key={item.id} className="p-5 flex flex-wrap items-center justify-between gap-4 text-xs">
                <div>
                  <h3 className="font-extrabold text-black text-sm">{item.orgName}</h3>
                  <span className="text-gray-500 block text-[11px] mt-0.5">
                    {item.country} • Business ID: <strong className="font-mono text-black">{item.businessId}</strong> • Submitted: {item.submittedDate}
                  </span>
                  <div className="flex items-center gap-1.5 text-[#7201FF] font-semibold mt-1">
                    <FileText className="w-3.5 h-3.5" />
                    <span>{item.docName}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setVerificationQueue(verificationQueue.filter((v) => v.id !== item.id));
                      alert(`Rejected ${item.orgName}`);
                    }}
                    className="px-3.5 py-1.5 rounded-full border border-gray-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 font-semibold text-gray-700 transition-colors"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => {
                      setVerificationQueue(verificationQueue.filter((v) => v.id !== item.id));
                      alert(`Approved ${item.orgName}. Trading limit removed.`);
                    }}
                    className="px-4 py-1.5 bg-black hover:bg-neutral-800 text-white rounded-full font-bold transition-colors shadow-xs"
                  >
                    Approve &amp; Verify Org
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Disputes Queue */}
      {activeTab === 'disputes' && (
        <div className="flex flex-col gap-4">
          {disputesQueue.map((disp) => (
            <div key={disp.id} className="p-6 rounded-3xl bg-white border border-gray-200/80 shadow-xs flex flex-col gap-4">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 block">
                    Escrow Frozen: €{disp.disputedAmount.toLocaleString()}
                  </span>
                  <h3 className="text-base font-extrabold text-black mt-0.5">
                    Trade #{disp.tradeId} — {disp.material}
                  </h3>
                  <span className="text-xs text-gray-500">
                    Buyer: <strong>{disp.buyerOrg}</strong> ↔ Seller: <strong>{disp.sellerOrg}</strong>
                  </span>
                </div>
                <span className="px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-full text-xs font-bold">
                  Under Arbitration
                </span>
              </div>

              <div className="p-3.5 bg-gray-50 rounded-2xl text-xs text-gray-700">
                <strong className="text-black">Dispute Reason:</strong> {disp.reason}
              </div>

              {/* Arbitration Actions */}
              <div className="flex flex-wrap items-center justify-end gap-3 pt-2 border-t border-gray-100 text-xs font-bold">
                <button
                  onClick={() => alert('Escrow released to seller.')}
                  className="px-4 py-2 border border-gray-200 rounded-full hover:bg-gray-50"
                >
                  Release Escrow to Seller
                </button>
                <button
                  onClick={() => alert('Escrow refunded to buyer.')}
                  className="px-4 py-2 border border-gray-200 rounded-full hover:bg-gray-50"
                >
                  Full Refund to Buyer
                </button>
                <button
                  onClick={() => alert('Partial 50/50 settlement executed.')}
                  className="px-5 py-2 bg-black text-white rounded-full hover:bg-neutral-800 shadow-xs"
                >
                  Execute 50/50 Settlement
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Factor Management with Versioning */}
      {activeTab === 'factors' && (
        <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xs overflow-hidden flex flex-col">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-black">LCA Emission Factors Library</h3>
              <p className="text-xs text-gray-500">
                Immutable emission intensity factors. Editing creates an incremented version (never mutates historical records).
              </p>
            </div>
            <button
              onClick={() => setShowFactorModal(true)}
              className="px-4 py-2 bg-black text-white rounded-full text-xs font-bold hover:bg-neutral-800 flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create New Factor Version</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-500 font-bold uppercase tracking-wider text-[10.5px]">
                <tr>
                  <th className="py-3 px-6">Material</th>
                  <th className="py-3 px-4">EF Virgin (kg CO₂e/kg)</th>
                  <th className="py-3 px-4">EF Reprocess (kg CO₂e/kg)</th>
                  <th className="py-3 px-4">Version</th>
                  <th className="py-3 px-4">Data Source Basis</th>
                  <th className="py-3 px-6 text-right">Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {emissionFactors.map((ef) => (
                  <tr key={ef.id} className="hover:bg-gray-50/70">
                    <td className="py-3.5 px-6 font-bold text-black">{ef.material}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-black">{ef.efVirgin}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-[#7201FF]">{ef.efReprocess}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full bg-purple-50 text-[#7201FF] font-mono text-[10.5px] font-bold">
                        {ef.version}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-gray-600">{ef.source}</td>
                    <td className="py-3.5 px-6 text-right font-mono text-gray-500">{ef.updatedAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: System Health Dashboard */}
      {activeTab === 'health' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
              Carbon-Negative Suppression Rate
            </span>
            <span className="text-3xl font-black font-mono text-black mt-2 block">
              12.4%
            </span>
            <p className="text-xs text-gray-600 mt-1">
              Lots successfully suppressed from default discovery to prevent carbon-negative long-haul transport.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
              Match-to-Trade Conversion
            </span>
            <span className="text-3xl font-black font-mono text-emerald-700 mt-2 block">
              68.2%
            </span>
            <p className="text-xs text-gray-600 mt-1">
              Autonomous pairings resulting in completed escrow trades within 72 hours.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
              Arbitration Settlement Speed
            </span>
            <span className="text-3xl font-black font-mono text-[#7201FF] mt-2 block">
              18.4 hrs
            </span>
            <p className="text-xs text-gray-600 mt-1">
              Average resolution turnaround for disputed deliveries using AI vision re-grading logs.
            </p>
          </div>
        </div>
      )}

    </div>
  );
}
