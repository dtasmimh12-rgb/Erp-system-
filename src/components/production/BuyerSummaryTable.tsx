import React, { useState, useMemo } from "react";
import { 
  Building, UserCheck, ShieldAlert, ArrowRight, Printer, Download, Coins, Plus, Check, RefreshCw
} from "lucide-react";
import { DailyProductionEntry } from "../../types";

interface BuyerSummaryTableProps {
  entries: DailyProductionEntry[];
  payments: any[]; // list of buyer payments
  onAddPayment: (p: { date: string; buyer: string; amount: number; billNo: string; remarks: string }) => void;
  lang: "EN" | "BN";
}

const SEED_PARTIES = [
  "SRK APPARELS", "SK APPARELS", "MI-KNIT", "TOP-TEX", "ARMIN-SW", "KNITSTUDIO", 
  "BISMILLAH-BUYING", "BHUYAN", "CKL", "SPRING", "MIRAS-FASHION", "MIRAS-FA", "MOFIZ", "KISHAN"
];

export default function BuyerSummaryTable({
  entries,
  payments,
  onAddPayment,
  lang
}: BuyerSummaryTableProps) {
  const [activeSubTab, setActiveSubTab] = useState<"buyer" | "style" | "payments">("buyer");
  
  // Payment quick dialog
  const [payBuyer, setPayBuyer] = useState("SPRING");
  const [payAmount, setPayAmount] = useState(50000);
  const [payBill, setPayBill] = useState("BILL-9021");
  const [payDate, setPayDate] = useState(new Date().toISOString().substring(0, 10));
  const [payRemarks, setPayRemarks] = useState("Wire transfer received");

  // Sum payments by buyer
  const paymentSumMap = useMemo(() => {
    const map: { [key: string]: { total: number; lastDate: string } } = {};
    payments.forEach(p => {
      const bName = p.buyer;
      if (!map[bName]) {
        map[bName] = { total: 0, lastDate: "" };
      }
      map[bName].total += p.amount;
      if (!map[bName].lastDate || p.date > map[bName].lastDate) {
        map[bName].lastDate = p.date;
      }
    });
    return map;
  }, [payments]);

  // Approved rows only
  const approvedRows = useMemo(() => {
    return entries.filter(e => e.status === "Approved" || e.status === "Posted to Accounts");
  }, [entries]);

  // Group by Buyer / Party
  const buyerSummaries = useMemo(() => {
    const map: { [key: string]: {
      buyerName: string;
      styles: string[];
      rate: number;
      quantity: number;
      productionAmount: number;
      billNo: string;
    }} = {};

    approvedRows.forEach((e, idx) => {
      if (!map[e.buyer]) {
        map[e.buyer] = {
          buyerName: e.buyer,
          styles: [],
          rate: e.cfmRate,
          quantity: 0,
          productionAmount: 0,
          billNo: `B-MAY-${1000 + idx}`
        };
      }
      if (!map[e.buyer].styles.includes(e.style)) {
        map[e.buyer].styles.push(e.style);
      }
      map[e.buyer].quantity += e.totalProdQty;
      map[e.buyer].productionAmount += e.productionAmount;
      // take last available rate for display
      map[e.buyer].rate = e.cfmRate;
    });

    return Object.values(map).map(b => {
      const paymentsRec = paymentSumMap[b.buyerName]?.total || 0;
      const lastDate = paymentSumMap[b.buyerName]?.lastDate || "None";
      return {
        ...b,
        stylesStr: b.styles.join(", ") || "None",
        receivedAmount: paymentsRec,
        dueAmount: Math.max(0, b.productionAmount - paymentsRec),
        lastReceivedDate: lastDate
      };
    });
  }, [approvedRows, paymentSumMap]);

  // Group by Style
  const styleSummaries = useMemo(() => {
    const map: { [key: string]: {
      styleName: string;
      buyerName: string;
      rate: number;
      quantity: number;
      productionAmount: number;
    }} = {};

    approvedRows.forEach(e => {
      if (!map[e.style]) {
        map[e.style] = {
          styleName: e.style,
          buyerName: e.buyer,
          rate: e.cfmRate,
          quantity: 0,
          productionAmount: 0
        };
      }
      map[e.style].quantity += e.totalProdQty;
      map[e.style].productionAmount += e.productionAmount;
    });

    return Object.values(map);
  }, [approvedRows]);

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (payAmount <= 0) {
      alert("Amount must be greater than zero.");
      return;
    }
    onAddPayment({
      date: payDate,
      buyer: payBuyer,
      amount: payAmount,
      billNo: payBill,
      remarks: payRemarks
    });
    alert(`Success: Received BDT ${payAmount.toLocaleString()} from ${payBuyer}. Cash/Bank ledger and accounts receivable updated.`);
    setPayAmount(0);
    setPayRemarks("");
  };

  return (
    <div className="space-y-6">
      
      {/* Tab Selectors */}
      <div className="flex gap-1.5 border-b border-slate-800 pb-2">
        <button 
          onClick={() => setActiveSubTab("buyer")}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition ${activeSubTab === "buyer" ? "bg-indigo-600/15 text-indigo-300 border-l-2 border-indigo-500 font-extrabold" : "text-slate-400 hover:text-slate-200"}`}
        >
          Buyer / Party Production Summary
        </button>
        <button 
          onClick={() => setActiveSubTab("style")}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition ${activeSubTab === "style" ? "bg-indigo-600/15 text-indigo-300 border-l-2 border-indigo-500 font-extrabold" : "text-slate-400 hover:text-slate-200"}`}
        >
          Style-wise Summary
        </button>
        <button 
          onClick={() => setActiveSubTab("payments")}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition ${activeSubTab === "payments" ? "bg-[#111827] text-amber-400 border-l-2 border-amber-500" : "text-slate-400 hover:text-slate-100"}`}
        >
          Receive Buyer Remittance Payment
        </button>
      </div>

      {activeSubTab === "buyer" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500 font-mono font-bold uppercase tracking-wider">Party outstanding audit books</span>
            <span className="text-indigo-400 font-mono font-bold">Consolidated approved collections</span>
          </div>

          <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950 text-slate-150">
            <div className="overflow-x-auto">
              <table className="table-auto w-full text-xs font-sans text-center">
                <thead className="bg-[#111827] text-slate-400 uppercase font-mono text-[9px] tracking-wider divide-x divide-slate-900 border-b border-slate-800">
                  <tr>
                    <th className="p-3 text-left">Buyer / Party Name</th>
                    <th className="p-3 text-center">Style Assigned</th>
                    <th className="p-3 text-center">Assigned Bill No.</th>
                    <th className="p-3 text-right">Job CFM Rate</th>
                    <th className="p-3 text-right">Qty Produced (Pcs)</th>
                    <th className="p-3 text-right">Production Value</th>
                    <th className="p-3 text-right text-emerald-400">Total Billed</th>
                    <th className="p-3 text-right text-indigo-300">Received (BDT)</th>
                    <th className="p-3 text-right text-rose-400">Due Balance</th>
                    <th className="p-3 text-center">Last Receipt Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850 font-mono text-[11.5px]">
                  {buyerSummaries.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="p-8 text-slate-500 font-sans text-center">
                        No approved entries to formulate buyer-wise summarizes. Ensure entries are approved/submitted first.
                      </td>
                    </tr>
                  ) : (
                    buyerSummaries.map((b) => (
                      <tr key={b.buyerName} className="hover:bg-slate-900/60 transition">
                        <td className="p-3 text-left font-sans font-black text-slate-300">{b.buyerName}</td>
                        <td className="p-3 text-center text-indigo-300 font-bold">{b.stylesStr}</td>
                        <td className="p-3 text-center text-slate-500">{b.billNo}</td>
                        <td className="p-3 text-right text-slate-400">BDT {b.rate}</td>
                        <td className="p-3 text-right font-bold">{b.quantity.toLocaleString()}</td>
                        <td className="p-3 text-right text-slate-400">{b.productionAmount.toLocaleString()}</td>
                        <td className="p-3 text-right text-emerald-400 font-bold">BDT {b.productionAmount.toLocaleString()}</td>
                        <td className="p-3 text-right text-indigo-300 font-semibold">{b.receivedAmount.toLocaleString()}</td>
                        <td className={`p-3 text-right font-black ${b.dueAmount > 0 ? "text-rose-450" : "text-emerald-400"}`}>
                          BDT {b.dueAmount.toLocaleString()}
                        </td>
                        <td className="p-3 text-center font-sans font-bold text-slate-500">{b.lastReceivedDate}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === "style" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500 font-mono font-bold">Style-wise Production parameters</span>
            <span className="text-indigo-400 font-mono">Job orders production percentage summaries</span>
          </div>

          <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950 text-slate-150">
            <table className="table-auto w-full text-xs font-sans text-center">
              <thead className="bg-[#111827] text-slate-400 uppercase font-mono text-[9px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-3 text-left">Style Code</th>
                  <th className="p-3 text-left">Associated Buyer</th>
                  <th className="p-3 text-right">Job rate</th>
                  <th className="p-3 text-right">Total Pcs Produced</th>
                  <th className="p-3 text-right text-emerald-400">Total Billed Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850 font-mono text-[11.5px]">
                {styleSummaries.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-slate-500 font-sans text-center">No style profiles available. Add draft line entries first.</td>
                  </tr>
                ) : (
                  styleSummaries.map((s) => (
                    <tr key={s.styleName} className="hover:bg-slate-900/40 transition">
                      <td className="p-3 text-left text-indigo-300 font-black">{s.styleName}</td>
                      <td className="p-3 text-left font-sans font-bold">{s.buyerName}</td>
                      <td className="p-3 text-right">BDT {s.rate}</td>
                      <td className="p-3 text-right font-bold">{s.quantity.toLocaleString()}</td>
                      <td className="p-3 text-right font-black text-emerald-400">BDT {s.productionAmount.toLocaleString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeSubTab === "payments" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Payment receipt creation form */}
          <div className="lg:col-span-1 bg-[#111827] border border-slate-800 p-5 rounded-2xl">
            <h4 className="font-display font-extrabold text-xs text-white uppercase tracking-wider mb-4 flex items-center gap-1.5 border-b border-slate-800 pb-2">
              <Coins className="text-amber-400" size={14} /> Record Buyer Collection Receipt
            </h4>
            
            <form onSubmit={handleRecordPayment} className="space-y-4 text-xs font-sans text-slate-300">
              <div>
                <label className="block text-[10.5px] font-bold text-slate-400 uppercase mb-1">Receipt Date</label>
                <input 
                  type="date" 
                  value={payDate}
                  onChange={e => setPayDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 font-mono" 
                />
              </div>

              <div>
                <label className="block text-[10.5px] font-bold text-slate-400 uppercase mb-1">Buyer / Payer Party</label>
                <select 
                  value={payBuyer} 
                  onChange={e => setPayBuyer(e.target.value)} 
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 font-mono"
                >
                  {SEED_PARTIES.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10.5px] font-bold text-slate-400 uppercase mb-1">Received Amount (BDT)</label>
                <input 
                  type="number" 
                  value={payAmount}
                  onChange={e => setPayAmount(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-emerald-400 font-mono font-bold" 
                />
              </div>

              <div>
                <label className="block text-[10.5px] font-bold text-slate-400 uppercase mb-1">Reference Bill No / Slip No</label>
                <input 
                  type="text" 
                  value={payBill}
                  onChange={e => setPayBill(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white font-mono" 
                />
              </div>

              <div>
                <label className="block text-[10.5px] font-bold text-slate-400 uppercase mb-1">Payer Remarks</label>
                <input 
                  type="text" 
                  placeholder="e.g. Bank transfer to Bank Asia ACC" 
                  value={payRemarks}
                  onChange={e => setPayRemarks(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 font-sans" 
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2 px-4 rounded-xl transition font-sans cursor-pointer text-center"
              >
                Record Cash/Bank Receipt
              </button>
            </form>
          </div>

          {/* Historical remittances tracking book */}
          <div className="lg:col-span-2 border border-slate-800 bg-slate-950 rounded-2xl p-5 overflow-hidden">
            <h4 className="font-display font-extrabold text-xs text-white uppercase tracking-wider mb-3 pb-2 border-b border-slate-850">
              Remittances Ledger Book
            </h4>
            <div className="overflow-y-auto max-h-[380px] scrollbar-thin">
              <table className="table-auto w-full text-xs text-center border-collapse">
                <thead className="bg-[#111827] text-slate-400 uppercase font-mono text-[9px] border-b border-slate-800">
                  <tr>
                    <th className="p-2.5 text-left">Date</th>
                    <th className="p-2.5 text-left">Buyer / Remitter</th>
                    <th className="p-2.5 text-right text-emerald-400">Received Receipt (BDT)</th>
                    <th className="p-2.5 text-center">Reference Bill ID</th>
                    <th className="p-2.5 text-left">Accounting Posting Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850 text-slate-350 font-mono text-[11.5px]">
                  {payments.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-slate-550 font-sans">No remittances posted yet. Add logs using the compiler form.</td>
                    </tr>
                  ) : (
                    payments.map((p, idx) => (
                      <tr key={idx} className="hover:bg-slate-900/30 transition">
                        <td className="p-2.5 text-left font-sans">{p.date}</td>
                        <td className="p-2.5 text-left font-sans font-black text-slate-300">{p.buyer}</td>
                        <td className="p-2.5 text-right font-bold text-emerald-450">BDT {p.amount.toLocaleString()}</td>
                        <td className="p-2.5 text-center">{p.billNo}</td>
                        <td className="p-2.5 text-left font-sans text-xs text-indigo-400">
                          {p.remarks || "No ledger entries mapped"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="mt-4 p-3 bg-[#111827]/40 border border-slate-850 rounded-xl text-[10px] text-slate-400 font-sans">
              ℹ️ <strong>System automation</strong>: Approved daily receipts credit <strong>Buyer Receivable (Code 1202)</strong> and debit <strong>Cash/Bank Accounts (Code 1001 / 1101)</strong> instantly.
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
