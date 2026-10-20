import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Building,
  MapPin,
  ShieldCheck,
  ShieldAlert,
  Users,
  Layers,
  Upload,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  FileText,
} from 'lucide-react';

export default function OrgSettings() {
  const {
    org,
    setOrg,
    facilities,
    setFacilities,
    teamMembers,
    setTeamMembers,
    toggleCapability,
    setVerificationStatus,
  } = useApp();

  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'facilities' | 'capabilities' | 'team' | 'verification'

  // New Facility Form State
  const [showAddFacility, setShowAddFacility] = useState(false);
  const [newFac, setNewFac] = useState({
    name: 'Ghent Circular Terminal',
    address: 'Vliegtuiglaan 18, 9000 Ghent, Belgium',
    capacityTons: 2200,
  });

  const handleAddFacility = (e) => {
    e.preventDefault();
    setFacilities([
      ...facilities,
      {
        id: facilities.length + 1,
        name: newFac.name,
        address: newFac.address,
        lat: 51.0543,
        lng: 3.7174,
        isPrimary: false,
        capacityTons: Number(newFac.capacityTons),
      },
    ]);
    setShowAddFacility(false);
  };

  const handleRemoveFacility = (id) => {
    setFacilities(facilities.filter((f) => f.id !== id));
  };

  const handleToggleMemberPerm = (memberId, permKey) => {
    setTeamMembers((prev) =>
      prev.map((m) => (m.id === memberId ? { ...m, [permKey]: !m[permKey] } : m))
    );
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto px-6 py-6 flex flex-col gap-6">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-black tracking-tight">
          Organisation &amp; Facility Settings
        </h1>
        <p className="text-xs text-gray-700 font-medium mt-0.5">
          Manage corporate credentials, operational facilities, trading capabilities, verification, and team access permissions
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200">
        {[
          { id: 'profile', label: 'Company Profile' },
          { id: 'facilities', label: `Facilities (${facilities.length})` },
          { id: 'capabilities', label: 'Trading Capabilities' },
          { id: 'verification', label: 'Verification Status' },
          { id: 'team', label: `Team & Permissions (${teamMembers.length})` },
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

      {/* Tab 1: Profile */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-xs flex flex-col gap-4 max-w-xl">
          <h3 className="text-xs font-bold text-black uppercase tracking-wider pb-2 border-b border-gray-100">
            Legal Entity Details
          </h3>

          <div className="flex flex-col gap-3 text-xs">
            <div>
              <label className="font-bold text-gray-700 block mb-1">Trading Name</label>
              <input
                type="text"
                value={org.name}
                onChange={(e) => setOrg({ ...org, name: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-gray-200 font-semibold focus:ring-1 focus:ring-[#7201FF] outline-hidden"
              />
            </div>

            <div>
              <label className="font-bold text-gray-700 block mb-1">Registered Legal Entity</label>
              <input
                type="text"
                value={org.legalName}
                onChange={(e) => setOrg({ ...org, legalName: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-gray-200 font-medium focus:ring-1 focus:ring-[#7201FF] outline-hidden"
              />
            </div>

            <div>
              <label className="font-bold text-gray-700 block mb-1">Business Registration ID / VAT</label>
              <input
                type="text"
                value={org.businessId}
                onChange={(e) => setOrg({ ...org, businessId: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-gray-200 font-mono font-bold focus:ring-1 focus:ring-[#7201FF] outline-hidden"
              />
            </div>

            <div>
              <label className="font-bold text-gray-700 block mb-1">Operations Contact Email</label>
              <input
                type="email"
                value={org.email}
                onChange={(e) => setOrg({ ...org, email: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-gray-200 font-medium focus:ring-1 focus:ring-[#7201FF] outline-hidden"
              />
            </div>

            <button
              onClick={() => alert('Organisation details updated.')}
              className="mt-2 px-5 py-2.5 bg-black hover:bg-neutral-800 text-white rounded-full text-xs font-bold self-start transition-colors"
            >
              Save Profile
            </button>
          </div>
        </div>
      )}

      {/* Tab 2: Facilities */}
      {activeTab === 'facilities' && (
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-600 font-medium">
              Registered processing yards, warehouses, and pickup docks used for routing and break-even calculations.
            </span>
            <button
              onClick={() => setShowAddFacility(true)}
              className="px-4 py-2 bg-black text-white rounded-full text-xs font-bold hover:bg-neutral-800 transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Facility</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {facilities.map((fac) => (
              <div
                key={fac.id}
                className={`p-5 rounded-3xl bg-white border shadow-xs flex flex-col justify-between gap-3 ${
                  fac.isPrimary ? 'border-[#7201FF] ring-1 ring-[#7201FF]/30' : 'border-gray-200/80'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-black text-sm">{fac.name}</span>
                    {fac.isPrimary && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-[#7201FF]">
                        Primary HQ
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1 flex items-start gap-1">
                    <MapPin className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                    <span>{fac.address}</span>
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-gray-100">
                  <span className="text-gray-500">Capacity: <strong>{fac.capacityTons} t</strong></span>
                  {!fac.isPrimary && (
                    <button
                      onClick={() => handleRemoveFacility(fac.id)}
                      className="text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete facility"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {showAddFacility && (
            <form onSubmit={handleAddFacility} className="p-6 bg-white rounded-3xl border border-gray-200 shadow-xs max-w-lg flex flex-col gap-3 text-xs">
              <h4 className="font-extrabold text-black text-sm">Add New Facility</h4>
              <div>
                <label className="font-bold text-gray-700 block mb-1">Facility Name</label>
                <input
                  type="text"
                  required
                  value={newFac.name}
                  onChange={(e) => setNewFac({ ...newFac, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-200 font-medium"
                />
              </div>
              <div>
                <label className="font-bold text-gray-700 block mb-1">Address (Auto-geocoded)</label>
                <input
                  type="text"
                  required
                  value={newFac.address}
                  onChange={(e) => setNewFac({ ...newFac, address: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-200 font-medium"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddFacility(false)}
                  className="px-3.5 py-1.5 border border-gray-200 rounded-full font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-black text-white rounded-full font-bold hover:bg-neutral-800"
                >
                  Save Facility
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Tab 3: Capabilities */}
      {activeTab === 'capabilities' && (
        <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-xs flex flex-col gap-4 max-w-2xl">
          <div>
            <h3 className="text-sm font-extrabold text-black">Trading &amp; Logistics Capabilities</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              These control which dashboard modules, forms, and matching rules appear for your organisation. Editable anytime.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { id: 'seller', label: 'Sell Surplus Material (Seller)', desc: 'Post secondary feedstock lots and manage supply listings.' },
              { id: 'buyer', label: 'Source Material (Buyer)', desc: 'Define sourcing requirements and claim qualifying material lots.' },
              { id: 'recycler', label: 'Process / Recycle Material', desc: 'Accept feedstock for compounding, pelletizing, and wash lines.' },
              { id: 'carrier', label: 'Operate Logistics / Vehicles (Carrier)', desc: 'Accept consolidated multi-stop shipment routes and backhauls.' },
            ].map((cap) => {
              const active = org.capabilities.includes(cap.id);
              return (
                <div
                  key={cap.id}
                  onClick={() => toggleCapability(cap.id)}
                  className={`p-4 rounded-2xl border cursor-pointer select-none transition-all flex flex-col justify-between gap-2 ${
                    active
                      ? 'bg-purple-50/50 border-[#7201FF] shadow-xs'
                      : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <span className="font-extrabold text-black text-xs">{cap.label}</span>
                    <input
                      type="checkbox"
                      checked={active}
                      onChange={() => {}}
                      className="w-4 h-4 rounded text-[#7201FF] focus:ring-[#7201FF] pointer-events-none"
                    />
                  </div>
                  <p className="text-[11px] text-gray-500 leading-relaxed">{cap.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 4: Verification */}
      {activeTab === 'verification' && (
        <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-xs flex flex-col gap-5 max-w-2xl">
          <div>
            <h3 className="text-sm font-extrabold text-black">Organisation Verification State Machine</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Current state: <strong className="uppercase font-mono text-black">{org.verificationStatus}</strong>
            </p>
          </div>

          {/* Verification Status Card */}
          <div className={`p-4 rounded-2xl border text-xs flex items-center justify-between ${
            org.verificationStatus === 'verified'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
              : org.verificationStatus === 'documents_submitted'
              ? 'bg-amber-50 border-amber-200 text-amber-950'
              : 'bg-rose-50 border-rose-200 text-rose-950'
          }`}>
            <div className="flex items-center gap-3">
              {org.verificationStatus === 'verified' ? (
                <ShieldCheck className="w-6 h-6 text-emerald-600" />
              ) : (
                <ShieldAlert className="w-6 h-6 text-amber-600" />
              )}
              <div>
                <span className="font-bold text-sm block">
                  {org.verificationStatus === 'verified'
                    ? 'Full Trading Clearance Active'
                    : org.verificationStatus === 'documents_submitted'
                    ? 'Documents Submitted — Pending Compliance Review'
                    : 'Unverified Tier — Capped at €15,000 per Trade'}
                </span>
                <span className="text-[11px] text-gray-600 block mt-0.5">
                  {org.verificationStatus === 'verified'
                    ? 'No transaction limits apply to your account.'
                    : 'Submit corporate registry documents to lift the transaction ceiling.'}
                </span>
              </div>
            </div>
          </div>

          {/* Document Upload Area */}
          <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center flex flex-col items-center gap-2 hover:border-[#7201FF] transition-colors cursor-pointer bg-gray-50 text-xs">
            <Upload className="w-6 h-6 text-gray-400" />
            <span className="font-bold text-black">Upload Chamber of Commerce Extract or Tax Certificate</span>
            <span className="text-[10.5px] text-gray-500">PDF, JPG up to 20MB</span>
            <button
              onClick={() => {
                setVerificationStatus('documents_submitted');
                alert('Documents submitted for review!');
              }}
              className="mt-2 px-4 py-2 bg-black text-white rounded-full text-xs font-bold hover:bg-neutral-800 transition-colors"
            >
              Submit for Verification
            </button>
          </div>
        </div>
      )}

      {/* Tab 5: Team Members & Permissions */}
      {activeTab === 'team' && (
        <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xs overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between text-xs">
            <span className="font-bold text-black">Team Members &amp; Permission Access Control</span>
            <span className="text-gray-500">Toggle Platform Admin &amp; Reporting flags</span>
          </div>

          <div className="divide-y divide-gray-100 text-xs">
            {teamMembers.map((member) => (
              <div key={member.id} className="p-4 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h4 className="font-bold text-black">{member.name}</h4>
                  <span className="text-gray-500 block text-[11px]">{member.email} • {member.role}</span>
                </div>

                <div className="flex items-center gap-3">
                  {/* Platform Admin Toggle */}
                  <label className="flex items-center gap-1.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={member.platform_admin}
                      onChange={() => handleToggleMemberPerm(member.id, 'platform_admin')}
                      className="w-4 h-4 rounded text-[#7201FF] focus:ring-[#7201FF]"
                    />
                    <span className="font-semibold text-gray-700">Platform Admin</span>
                  </label>

                  {/* Reporting Toggle */}
                  <label className="flex items-center gap-1.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={member.reporting}
                      onChange={() => handleToggleMemberPerm(member.id, 'reporting')}
                      className="w-4 h-4 rounded text-black focus:ring-black"
                    />
                    <span className="font-semibold text-gray-700">Reporting</span>
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
