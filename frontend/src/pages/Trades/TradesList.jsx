import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  ShieldCheck,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Truck,
  Lock,
} from 'lucide-react';

export default function TradesList() {
  const { trades } = useApp();

  return (
    <div className="w-full max-w-[1720px] mx-auto px-6 py-6 flex flex-col gap-6">
      
      {/* Top Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-black tracking-tight">
          Escrow Trades &amp; Settlements
        </h1>
        <p className="text-xs text-gray-700 font-medium mt-0.5">
          Live secondary material contracts protected by multi-signature escrow and delivery verification
        </p>
      </div>

      {/* Trades Table Card */}
      <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/90 text-gray-500 font-bold uppercase tracking-wider text-[10.5px] border-b border-gray-100">
              <tr>
                <th className="py-3.5 px-6">Trade ID &amp; Material</th>
                <th className="py-3.5 px-4">Counterpart Org</th>
                <th className="py-3.5 px-4">Volume Mass</th>
                <th className="py-3.5 px-4">Agreed Price</th>
                <th className="py-3.5 px-4">Total Value</th>
                <th className="py-3.5 px-4">Trade Progression</th>
                <th className="py-3.5 px-4">Escrow State</th>
                <th className="py-3.5 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {trades.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50/70 transition-colors group">
                  {/* Trade ID & Material */}
                  <td className="py-4 px-6">
                    <Link to={`/trades/${t.id}`} className="block">
                      <span className="font-mono font-bold text-black group-hover:text-[#7201FF] text-xs transition-colors">
                        {t.id}
                      </span>
                      <span className="text-[12px] font-semibold text-gray-800 block mt-0.5">
                        {t.material}
                      </span>
                    </Link>
                  </td>

                  {/* Counterpart */}
                  <td className="py-4 px-4 font-semibold text-black">
                    {t.counterpartOrg}
                  </td>

                  {/* Volume */}
                  <td className="py-4 px-4 font-mono font-bold text-black">
                    {t.mass_kg.toLocaleString()} kg
                  </td>

                  {/* Price */}
                  <td className="py-4 px-4 font-mono text-gray-700">
                    €{t.agreedPrice.toFixed(2)}/kg
                  </td>

                  {/* Total Value */}
                  <td className="py-4 px-4 font-mono font-extrabold text-black text-[13px]">
                    €{t.totalValue.toLocaleString()}
                  </td>

                  {/* Status Progression */}
                  <td className="py-4 px-4">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-gray-100 text-black capitalize">
                      {t.status.replace('_', ' ')}
                    </span>
                  </td>

                  {/* Escrow State Badge */}
                  <td className="py-4 px-4">
                    {t.escrow_state === 'held' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 text-[#7201FF] border border-purple-200">
                        <Lock className="w-3 h-3" /> Escrow Held
                      </span>
                    ) : t.escrow_state === 'released' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" /> Released
                      </span>
                    ) : t.escrow_state === 'disputed' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        <AlertTriangle className="w-3 h-3" /> Disputed
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-gray-100 text-gray-700">
                        Pending
                      </span>
                    )}
                  </td>

                  {/* Action */}
                  <td className="py-4 px-6 text-right">
                    <Link
                      to={`/trades/${t.id}`}
                      className="px-3.5 py-1.5 bg-black hover:bg-neutral-800 text-white rounded-full text-xs font-semibold transition-colors inline-block"
                    >
                      Inspect Trade
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
