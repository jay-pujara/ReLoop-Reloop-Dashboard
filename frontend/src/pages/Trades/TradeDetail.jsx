import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { trustService, commerceService } from '../../services';
import {
  ArrowLeft,
  Lock,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Truck,
  FileText,
  Upload,
  Camera,
  X,
  Send,
} from 'lucide-react';

export default function TradeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { trades, setTrades } = useApp();

  const trade = trades.find((t) => t.id === id) || trades[0];

  const steps = [
    { label: 'Claimed' },
    { label: 'Accepted' },
    { label: 'Logistics Assigned' },
    { label: 'In Transit' },
    { label: 'Delivered' },
    { label: 'Closed & Settled' },
  ];

  // Dispute Flow State
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [disputeReason, setDisputeReason] = useState('Off-Spec Contamination / Moisture');
  const [disputeNotes, setDisputeNotes] = useState('');
  const [certificateData, setCertificateData] = useState(null);

  useEffect(() => {
    if (trade?._id || trade?.orderId) {
      commerceService.fetchCertificate(trade._id || trade.orderId)
        .then((res) => {
          if (res?.success) setCertificateData(res.data);
        })
        .catch(() => {});
    }
  }, [trade]);

  const handleRaiseDispute = async () => {
    try {
      if (trade._id || trade.id) {
        await trustService.fileDispute({
          orderId: trade._id || trade.id,
          reason: disputeReason,
          notes: disputeNotes,
        });
      }
    } catch (_err) {
      // Handled locally
    }

    setTrades((prev) =>
      prev.map((t) =>
        t.id === trade.id
          ? {
              ...t,
              status: 'disputed',
              escrow_state: 'disputed',
            }
          : t
      )
    );
    setShowDisputeModal(false);
    alert('Dispute raised. Escrow funds have been locked under platform arbitration.');
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto px-6 py-6 flex flex-col gap-6">
      
      {/* Header */}
      <div>
        <button
          onClick={() => navigate('/trades')}
          className="text-xs font-semibold text-gray-500 hover:text-black flex items-center gap-1 mb-2 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Trades List
        </button>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-[#7201FF] tracking-wider uppercase block">
              Contract #{trade.id} • {trade.counterpartOrg}
            </span>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-black tracking-tight mt-0.5">
              {trade.material}
            </h1>
          </div>

          {/* Escrow State Pill */}
          <div className="flex items-center gap-2.5 bg-white px-4 py-2 rounded-2xl border border-gray-200/80 shadow-xs">
            <Lock className="w-4 h-4 text-[#7201FF]" />
            <div className="text-xs">
              <span className="text-gray-500 block text-[10px]">Escrow State:</span>
              <span className="font-extrabold text-black uppercase tracking-wider text-[11px]">
                {trade.escrow_state} (€{trade.totalValue.toLocaleString()})
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 6-Step Timeline Stepper */}
      <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-xs flex flex-col gap-4">
        <h3 className="text-xs font-bold text-black uppercase tracking-wider">
          Trade Progression Stepper
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          {steps.map((s, idx) => {
            const isCompleted = idx < trade.stepIndex;
            const isCurrent = idx === trade.stepIndex;
            return (
              <div
                key={idx}
                className={`p-3.5 rounded-2xl border flex flex-col justify-between h-20 transition-all ${
                  isCurrent
                    ? 'bg-black text-white border-black shadow-xs'
                    : isCompleted
                    ? 'bg-gray-50 text-black border-gray-200'
                    : 'bg-gray-50/50 text-gray-400 border-gray-100'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] font-bold">
                  <span>Step 0{idx + 1}</span>
                  {isCompleted && <CheckCircle2 className="w-3.5 h-3.5 text-[#8FFE01]" />}
                  {isCurrent && <span className="w-2 h-2 rounded-full bg-[#8FFE01] animate-pulse" />}
                </div>
                <span className="text-xs font-bold leading-tight">{s.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Trade Overview & Transit Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Logistics & Route info */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-gray-200/80 shadow-xs flex flex-col gap-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <h3 className="text-xs font-bold text-black uppercase tracking-wider flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#7201FF]" /> Contract &amp; Route Telemetry
            </h3>
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-purple-50 text-[#7201FF] border border-purple-200">
              Shipment {trade.shipmentId}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-3 bg-gray-50 rounded-2xl">
              <span className="text-gray-400 block text-[10.5px]">Pickup Facility</span>
              <span className="font-bold text-black mt-0.5 block">{trade.pickupFacility}</span>
            </div>
            <div className="p-3 bg-gray-50 rounded-2xl">
              <span className="text-gray-400 block text-[10.5px]">Delivery Destination</span>
              <span className="font-bold text-black mt-0.5 block">{trade.deliveryFacility}</span>
            </div>
            <div className="p-3 bg-gray-50 rounded-2xl">
              <span className="text-gray-400 block text-[10.5px]">Agreed Volume</span>
              <span className="font-bold text-black mt-0.5 block">{trade.mass_kg.toLocaleString()} kg</span>
            </div>
            <div className="p-3 bg-gray-50 rounded-2xl">
              <span className="text-gray-400 block text-[10.5px]">Agreed Unit Price</span>
              <span className="font-bold text-black mt-0.5 block">€{trade.agreedPrice.toFixed(2)} / kg</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <ShieldCheck className="w-4 h-4 text-green-600" />
              <span>Smart Escrow Lock Active • Multi-sig settlement triggered upon QR delivery sign-off</span>
            </div>

            <Link
              to={`/logistics/load/${trade.shipmentId}`}
              className="px-4 py-2 bg-black hover:bg-zinc-800 text-white rounded-full text-xs font-bold transition-colors inline-flex items-center gap-1.5 shadow-xs"
            >
              Open Truck Load Studio <Truck className="w-3.5 h-3.5 text-[#8FFE01]" />
            </Link>
          </div>
        </div>

        {/* Counterpart & Escrow Status */}
        <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-xs flex flex-col justify-between gap-4">
          <div>
            <h3 className="text-xs font-bold text-black uppercase tracking-wider mb-3">
              Counterpart Entity
            </h3>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="w-10 h-10 rounded-xl bg-black text-white font-black flex items-center justify-center text-sm">
                {trade.counterpartOrg.charAt(0)}
              </div>
              <div>
                <span className="font-bold text-black text-xs block">{trade.counterpartOrg}</span>
                <span className="text-[11px] text-gray-400 font-medium">Verified Industrial Buyer • KYC L3</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-gray-100">
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="text-gray-500">Total Escrow Principal</span>
              <span className="font-extrabold text-black">€{trade.totalValue.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-xs text-gray-500">
              <span>Platform Protocol Fee (1.5%)</span>
              <span className="font-semibold text-gray-700">€{(trade.totalValue * 0.015).toFixed(0)}</span>
            </div>
          </div>
        </div>
      </div>

      {trade.status === 'delivered' && (
        <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-xs flex flex-col gap-5">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div>
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                Post-Delivery Inspection
              </span>
              <h3 className="text-base font-extrabold text-black tracking-tight mt-0.5">
                Delivery Verification &amp; Re-Grading Comparison
              </h3>
            </div>

            {/* 48-Hour Dispute Countdown */}
            {trade.disputeCountdownHours > 0 && (
              <div className="flex items-center gap-2 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200 text-amber-900 text-xs font-bold">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>Dispute Window: {trade.disputeCountdownHours}h remaining</span>
              </div>
            )}
          </div>

          {/* Grade Deviation Flag Alert */}
          {trade.gradeDeviationFlag && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-950 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                <div>
                  <span className="font-bold block">
                    Discrepancy Detected: Delivery Grade is lower than Original Listing
                  </span>
                  <p className="text-[11.5px] text-amber-800">
                    Seller listed as <strong>{trade.originalGrade}</strong>, but buyer delivery scan graded as <strong>{trade.deliveryGrade}</strong>.
                  </p>
                </div>
              </div>

              {/* Raise a Dispute Action */}
              <button
                onClick={() => setShowDisputeModal(true)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-full text-xs font-bold transition-colors shadow-xs"
              >
                Raise Formal Dispute
              </button>
            </div>
          )}

          {/* Side-by-Side Photo Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Original Photos */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold text-gray-700">
                1. Original Seller Photos ({trade.originalGrade})
              </span>
              <div className="h-56 rounded-2xl overflow-hidden border border-gray-200">
                <img
                  src={trade.photosOriginal[0]}
                  alt="Original Lot"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Delivery Photos */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold text-gray-700">
                2. Buyer Delivery Scan ({trade.deliveryGrade || 'Pending Scan'})
              </span>
              <div className="h-56 rounded-2xl overflow-hidden border border-gray-200 bg-gray-100 flex items-center justify-center">
                {trade.photosDelivery.length > 0 ? (
                  <img
                    src={trade.photosDelivery[0]}
                    alt="Delivery Verification"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center text-gray-400 text-xs">
                    <Camera className="w-8 h-8 mx-auto mb-1 opacity-50" />
                    <span>Upload verification photos upon unsealing</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Raise Dispute Modal */}
      {showDisputeModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-floating border border-gray-200 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <span className="font-extrabold text-black text-base flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600" /> Raise Escrow Dispute
              </span>
              <button
                onClick={() => setShowDisputeModal(false)}
                className="w-7 h-7 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              Disputing this trade will immediately freeze the <strong>€{trade.totalValue.toLocaleString()}</strong> held in escrow until resolved by ReLoop platform compliance arbitrators.
            </p>

            <div className="flex flex-col gap-3 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Dispute Reason</label>
                <select
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-200 font-medium focus:ring-1 focus:ring-red-500 outline-hidden bg-gray-50"
                >
                  <option>Off-Spec Contamination / Moisture</option>
                  <option>Weight Discrepancy (&gt;5% variance)</option>
                  <option>Damage during Transit</option>
                  <option>Incorrect Polymer Classification</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Detailed Explanation</label>
                <textarea
                  rows="3"
                  value={disputeNotes}
                  onChange={(e) => setDisputeNotes(e.target.value)}
                  placeholder="Provide batch details, lab test results, or delivery notes..."
                  className="w-full p-2.5 rounded-xl border border-gray-200 font-medium focus:ring-1 focus:ring-red-500 outline-hidden"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => setShowDisputeModal(false)}
                className="px-4 py-2 border border-gray-200 text-xs font-semibold rounded-full hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRaiseDispute}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-full text-xs font-bold transition-colors shadow-xs"
              >
                Lock Escrow &amp; File Dispute
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
