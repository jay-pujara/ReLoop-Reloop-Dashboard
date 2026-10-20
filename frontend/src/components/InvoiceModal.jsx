import React from 'react';
import { X, Printer, Download, ShieldCheck, Leaf, FileText, Building2, CheckCircle2 } from 'lucide-react';

export default function InvoiceModal({ order, trade, onClose }) {
  if (!order && !trade) return null;

  const item = order || trade;
  const isTrade = !!trade;

  const invoiceNumber = `INV-2026-${(item.id || '0000').replace(/\D/g, '').padEnd(4, '0')}`;
  const date = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const materialName = item.listingTitle || item.material || 'Circular Industrial Feedstock';
  const qty = item.requestedQty_kg || item.mass_kg || 10000;
  const unitPrice = item.offeredPricePerKg || item.agreedPrice || 1.10;
  const subtotal = item.totalValue || qty * unitPrice;
  const platformFee = Math.round(subtotal * 0.02);
  const vatRate = 0.21;
  const vatAmount = Math.round(subtotal * vatRate);
  const totalWithVat = subtotal + platformFee + vatAmount;

  const buyerName = item.buyerOrg || 'BioPolymer Labs Europe';
  const sellerName = item.sellerOrg || (isTrade ? item.counterpartOrg : 'Rheinland Recovery GmbH');

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto print:p-0 print:bg-white">
      <div className="bg-white rounded-3xl w-full max-w-3xl shadow-floating border border-gray-200 overflow-hidden flex flex-col my-8 animate-in fade-in zoom-in-95 duration-150 print:shadow-none print:border-none print:m-0">
        
        {/* Modal Top Bar (Hidden on print) */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#7201FF]" />
            <span className="font-extrabold text-black text-sm">
              Commercial Tax Invoice &amp; ESG Certificate
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
              Escrow Settled
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-white border border-gray-200 hover:bg-gray-100 rounded-full text-xs font-bold text-black flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Body */}
        <div className="p-8 flex flex-col gap-6 text-black bg-white">
          
          {/* Header */}
          <div className="flex items-start justify-between border-b border-gray-200 pb-6">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-black flex items-center justify-center text-white font-black text-sm">
                  RL
                </div>
                <div>
                  <h2 className="text-xl font-black tracking-tight leading-none">ReLoop Network B.V.</h2>
                  <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">
                    European Circular Materials Exchange
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-gray-500 mt-2 leading-relaxed">
                Keizersgracht 482, 1016 GD Amsterdam<br />
                VAT ID: NL-847291039-B01 · KVK: 74920194<br />
                escrow@reloop-network.eu · www.reloop.eu
              </p>
            </div>

            <div className="text-right">
              <span className="text-2xl font-black font-mono tracking-tight block">
                {invoiceNumber}
              </span>
              <div className="text-xs text-gray-600 mt-1 space-y-0.5">
                <div><span className="font-semibold">Invoice Date:</span> {date}</div>
                <div><span className="font-semibold">Settlement:</span> Escrow Released</div>
                <div><span className="font-semibold">Ref Order:</span> {item.id}</div>
              </div>
            </div>
          </div>

          {/* Parties: Seller & Buyer */}
          <div className="grid grid-cols-2 gap-6 bg-gray-50/80 p-5 rounded-2xl border border-gray-100">
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                Issued By (Seller)
              </span>
              <h3 className="font-extrabold text-sm text-black">{sellerName}</h3>
              <p className="text-[11px] text-gray-600 mt-1 leading-relaxed">
                Facility: {item.pickupFacility || 'Rotterdam Circular Hub'}<br />
                Verified Circular Supplier · EU-REACH Compliant
              </p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                Billed To (Buyer)
              </span>
              <h3 className="font-extrabold text-sm text-black">{buyerName}</h3>
              <p className="text-[11px] text-gray-600 mt-1 leading-relaxed">
                Delivery: {item.deliveryFacility || 'Antwerp Processing Depot'}<br />
                VAT Reverse Charge: Eligible · Scope 3 Account Active
              </p>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="border border-gray-200 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-100 text-gray-700 font-bold uppercase text-[10px] tracking-wider border-b border-gray-200">
                <tr>
                  <th className="py-3 px-4">Description / Material Lot</th>
                  <th className="py-3 px-3 text-right">Quantity</th>
                  <th className="py-3 px-3 text-right">Unit Price</th>
                  <th className="py-3 px-4 text-right">Amount (EUR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                <tr>
                  <td className="py-3.5 px-4">
                    <span className="font-extrabold text-black block">{materialName}</span>
                    <span className="text-[11px] text-gray-500">
                      Ref #{item.listingId || 'L-101'} · Batch certified post-industrial secondary feedstock
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-right font-mono font-bold text-black">
                    {qty.toLocaleString()} kg
                  </td>
                  <td className="py-3.5 px-3 text-right font-mono text-gray-700">
                    €{unitPrice.toFixed(2)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-black text-black">
                    €{subtotal.toLocaleString()}
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 text-gray-600">
                    ReLoop Circular Escrow &amp; QA Verification Fee (2.0%)
                  </td>
                  <td className="py-2.5 px-3 text-right text-gray-500">1 lot</td>
                  <td className="py-2.5 px-3 text-right font-mono text-gray-500">€{platformFee}</td>
                  <td className="py-2.5 px-4 text-right font-mono font-bold text-gray-800">
                    €{platformFee.toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Totals Breakdown */}
          <div className="flex justify-between items-start gap-4">
            {/* Payment stamp */}
            <div className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/60 max-w-sm flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-extrabold text-emerald-900 block">
                  Payment Cleared via Smart Escrow
                </span>
                <span className="text-[11px] text-emerald-700 leading-tight block mt-0.5">
                  Funds held in segregated multi-sig vault and released upon digital bill of lading confirmation.
                </span>
              </div>
            </div>

            {/* Price Calculations */}
            <div className="w-64 space-y-1.5 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal:</span>
                <span className="font-mono font-bold text-black">€{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Platform Assurance:</span>
                <span className="font-mono font-bold text-black">€{platformFee.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>VAT (21%):</span>
                <span className="font-mono font-bold text-black">€{vatAmount.toLocaleString()}</span>
              </div>
              <div className="border-t border-gray-200 pt-2 flex justify-between text-sm font-black text-black">
                <span>Total Due / Paid:</span>
                <span className="font-mono text-base text-[#7201FF]">€{totalWithVat.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* ESG Scope 3 Audit Certificate */}
          <div className="p-4 rounded-2xl bg-black text-white flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#8FFE01] flex items-center justify-center text-black">
                <Leaf className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-black text-white block">
                  CSRD &amp; GHG Protocol Scope 3 Certified Offset
                </span>
                <span className="text-[11px] text-gray-400 block">
                  Displaced virgin resin lifecycle factor 1.95 kg CO₂e/kg · Verified by ReLoop LCA Engine
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-lg font-black font-mono text-[#8FFE01] block">
                -{Math.round(qty * 1.34).toLocaleString()} kg CO₂e
              </span>
              <span className="text-[9.5px] uppercase tracking-wider text-gray-400 font-bold">
                Net Avoided Carbon
              </span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
