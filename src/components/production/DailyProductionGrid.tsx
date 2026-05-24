import React, { useState } from "react";
import { 
  FileSpreadsheet, Plus, Trash2, Edit2, Check, X, Search, AlertCircle, Sparkles, RefreshCw
} from "lucide-react";
import { DailyProductionEntry, ProductionSetting } from "../../types";

interface DailyProductionGridProps {
  entries: DailyProductionEntry[];
  onAddEntry: (entry: Partial<DailyProductionEntry>) => void;
  onUpdateEntry: (id: string, updated: Partial<DailyProductionEntry>) => void;
  onDeleteEntry: (id: string) => void;
  onApproveEntry: (id: string) => void;
  onPostEntry: (id: string) => void;
  settings: ProductionSetting;
  userRole: string;
  lang: "EN" | "BN";
}

const SAMPLE_PARTIES = [
  "SRK APPARELS", "SK APPARELS", "MI-KNIT", "TOP-TEX", "ARMIN-SW", "KNITSTUDIO", 
  "BISMILLAH-BUYING", "BHUYAN", "CKL", "SPRING", "MIRAS-FASHION", "MIRAS-FA", "MOFIZ", "KISHAN"
];

const SEED_STYLES = [
  { style: "327", buyer: "SPRING", rate: 60, orderQty: 25000 },
  { style: "HEART", buyer: "TOP-TEX", rate: 45, orderQty: 18000 },
  { style: "003", buyer: "BISMILLAH-BUYING", rate: 60, orderQty: 30000 },
  { style: "256P", buyer: "SRK APPARELS", rate: 40, orderQty: 15000 },
  { style: "161", buyer: "KISHAN", rate: 120, orderQty: 8000 }
];

export default function DailyProductionGrid({
  entries,
  onAddEntry,
  onUpdateEntry,
  onDeleteEntry,
  onApproveEntry,
  onPostEntry,
  settings,
  userRole,
  lang
}: DailyProductionGridProps) {
  // Spreadsheet edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<DailyProductionEntry>>({});

  // Filter states
  const [filterDate, setFilterDate] = useState("");
  const [filterBuyer, setFilterBuyer] = useState("");
  const [filterStyle, setFilterStyle] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // New quick row variables
  const [newDate, setNewDate] = useState(new Date().toISOString().substring(0, 10));
  const [newBuyer, setNewBuyer] = useState("SPRING");
  const [newStyle, setNewStyle] = useState("327");
  const [newCfmRate, setNewCfmRate] = useState(60);
  const [newOrderQty, setNewOrderQty] = useState(25000);
  const [newPrevQty, setNewPrevQty] = useState(2000);
  const [newDayMc, setNewDayMc] = useState(15);
  const [newDayProd, setNewDayProd] = useState(120);
  const [newNightMc, setNewNightMc] = useState(14);
  const [newNightProd, setNewNightProd] = useState(105);
  const [newStopMc, setNewStopMc] = useState(1);
  const [newStopHour, setNewStopHour] = useState(2);
  const [newLostMnt, setNewLostMnt] = useState(120);
  const [newStopReason, setNewStopReason] = useState("");

  const handleSelectStyle = (styleVal: string) => {
    setNewStyle(styleVal);
    const matched = SEED_STYLES.find(x => x.style === styleVal);
    if (matched) {
      setNewBuyer(matched.buyer);
      setNewCfmRate(matched.rate);
      setNewOrderQty(matched.orderQty);
    }
  };

  const handleFastAdd = () => {
    // Calculables
    const totalUsedMachine = Math.ceil((newDayMc + newNightMc) / 2);
    const totalProdQty = newDayProd + newNightProd;
    const grandTotalProd = newPrevQty + totalProdQty;
    const balanceQty = newOrderQty - grandTotalProd;
    const productionAmount = totalProdQty * newCfmRate;

    if (balanceQty < 0 && !settings.allowNegativeBalanceOverride) {
      alert("Error: Balance Quantity cannot go below zero without admin bypass permission.");
      return;
    }

    onAddEntry({
      date: newDate,
      buyer: newBuyer,
      style: newStyle,
      cfmRate: newCfmRate,
      orderQty: newOrderQty,
      prevProdQty: newPrevQty,
      dayMachine: newDayMc,
      dayProdQty: newDayProd,
      nightMachine: newNightMc,
      nightProdQty: newNightProd,
      totalUsedMachine,
      totalProdQty,
      grandTotalProd,
      balanceQty,
      totalMachineQty: 40, // standard factory machine block size
      productionAmount,
      stopMachine: newStopMc,
      stopHour: newStopHour,
      lostMinute: newLostMnt,
      remarks: newStopReason || "Direct Excel entry",
      status: "Draft",
      createdBy: userRole === "Owner" ? "Tariqul Islam" : "Production Operator"
    });

    // Reset some values
    setNewDayProd(0);
    setNewNightProd(0);
    setNewLostMnt(0);
    setNewStopReason("");
  };

  const startInlineEdit = (r: DailyProductionEntry) => {
    setEditingId(r.id);
    setEditValues({ ...r });
  };

  const cancelInlineEdit = () => {
    setEditingId(null);
    setEditValues({});
  };

  const handleInlineChange = (field: keyof DailyProductionEntry, val: any) => {
    const updated = { ...editValues, [field]: val };
    
    // Auto recalculations inside edit values
    const dayMc = Number(field === "dayMachine" ? val : updated.dayMachine ?? 0);
    const nightMc = Number(field === "nightMachine" ? val : updated.nightMachine ?? 0);
    const dayProd = Number(field === "dayProdQty" ? val : updated.dayProdQty ?? 0);
    const nightProd = Number(field === "nightProdQty" ? val : updated.nightProdQty ?? 0);
    const prev = Number(field === "prevProdQty" ? val : updated.prevProdQty ?? 0);
    const rate = Number(field === "cfmRate" ? val : updated.cfmRate ?? 0);
    const ord = Number(field === "orderQty" ? val : updated.orderQty ?? 0);

    updated.totalUsedMachine = Math.ceil((dayMc + nightMc) / 2);
    updated.totalProdQty = dayProd + nightProd;
    updated.grandTotalProd = prev + updated.totalProdQty;
    updated.balanceQty = ord - updated.grandTotalProd;
    updated.productionAmount = updated.totalProdQty * rate;

    setEditValues(updated);
  };

  const saveInlineEdit = (id: string) => {
    if ((editValues.balanceQty ?? 0) < 0 && !settings.allowNegativeBalanceOverride) {
      alert("Error: Order balancing constraint violation. Negative balances are restricted.");
      return;
    }
    // If it's already posted, then require approvals or label adjustment
    const original = entries.find(x => x.id === id);
    if (original?.status === "Posted to Accounts") {
      // Prompt adjustment
      const proceed = confirm("Warning: This entry is already Posted to Accounts! Editing will require re-approval & automatic ledger adjustment. Continue?");
      if (!proceed) return;
      onUpdateEntry(id, {
        ...editValues,
        status: "Submitted" // moves back to submitted for re-approval
      });
    } else {
      onUpdateEntry(id, editValues);
    }
    setEditingId(null);
    setEditValues({});
  };

  // Filtered rows
  const filtered = entries.filter(e => {
    const matchesDate = !filterDate || e.date === filterDate;
    const matchesBuyer = !filterBuyer || e.buyer === filterBuyer;
    const matchesStyle = !filterStyle || e.style.toLowerCase().includes(filterStyle.toLowerCase());
    const matchesStatus = !filterStatus || e.status === filterStatus;
    return matchesDate && matchesBuyer && matchesStyle && matchesStatus;
  });

  const sumTotalAmount = filtered.reduce((acc, c) => acc + c.productionAmount, 0);

  return (
    <div className="space-y-6">
      {/* Spreadsheet Quick Creator Header */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
        <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
          <span className="font-sans font-bold text-xs text-white uppercase tracking-wider flex items-center gap-1.5">
            <FileSpreadsheet className="text-indigo-400" size={14} />
            Excel Quick Entry Row
          </span>
          <span className="font-mono text-[9px] text-slate-400">Target Line: OTTOMASS Unit-1 Floor</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2.5 text-xs">
          <div>
            <label className="block text-[10px] text-slate-400 uppercase font-black mb-1">Date</label>
            <input 
              type="date" 
              value={newDate} 
              onChange={e => setNewDate(e.target.value)} 
              className="w-full bg-slate-950 border border-slate-800 p-1.5 rounded-md text-white font-mono" 
            />
          </div>
          <div>
            <label className="block text-[10px] text-slate-400 uppercase font-black mb-1">Style Template</label>
            <select 
              value={newStyle} 
              onChange={e => handleSelectStyle(e.target.value)} 
              className="w-full bg-slate-950 border border-slate-800 p-1.5 rounded-md text-indigo-300 font-mono font-semibold"
            >
              <option value="">-- select style --</option>
              {SEED_STYLES.map(x => (
                <option key={x.style} value={x.style}>{x.style} ({x.buyer})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[10px] text-slate-400 uppercase font-black mb-1">Buyer / Party</label>
            <select 
              value={newBuyer} 
              onChange={e => setNewBuyer(e.target.value)} 
              className="w-full bg-slate-950 border border-slate-800 p-1.5 rounded-md text-white font-mono"
            >
              {SAMPLE_PARTIES.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[10px] text-slate-400 uppercase font-black mb-1">CFM Rate (BDT)</label>
            <input 
              type="number" 
              value={newCfmRate} 
              onChange={e => setNewCfmRate(Number(e.target.value))} 
              className="w-full bg-slate-950 border border-slate-800 p-1.5 rounded-md text-emerald-400 font-mono font-bold" 
            />
          </div>
          <div>
            <label className="block text-[10px] text-slate-400 uppercase font-black mb-1">Order Qty (Pcs)</label>
            <input 
              type="number" 
              value={newOrderQty} 
              onChange={e => setNewOrderQty(Number(e.target.value))} 
              className="w-full bg-slate-950 border border-slate-800 p-1.5 rounded-md text-white font-mono" 
            />
          </div>
          <div>
            <label className="block text-[10px] text-slate-400 uppercase font-black mb-1">Prev Prod.</label>
            <input 
              type="number" 
              value={newPrevQty} 
              onChange={e => setNewPrevQty(Number(e.target.value))} 
              className="w-full bg-slate-950 border border-slate-800 p-1.5 rounded-md text-slate-400 font-mono" 
            />
          </div>
          <div className="flex items-end">
            <button 
              onClick={handleFastAdd}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 rounded-md transition duration-200 flex items-center justify-center gap-1 cursor-pointer shadow-md shadow-indigo-650/15"
            >
              <Plus size={13} /> Add Line
            </button>
          </div>
        </div>

        {/* Extended Machinery / Loss Fields Expansion */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-2.5 mt-3 pt-3 border-t border-slate-800/50 text-xs">
          <div>
            <span className="block text-[9.5px] text-slate-500 font-bold mb-1">Day Machine</span>
            <input 
              type="number" 
              value={newDayMc} 
              onChange={e => setNewDayMc(Number(e.target.value))} 
              className="w-full bg-slate-950 border border-slate-850 p-1 rounded font-mono text-center" 
            />
          </div>
          <div>
            <span className="block text-[9.5px] text-slate-500 font-bold mb-1">Day Prod (Pcs)</span>
            <input 
              type="number" 
              value={newDayProd} 
              onChange={e => setNewDayProd(Number(e.target.value))} 
              className="w-full bg-slate-950 border border-slate-850 p-1 rounded font-mono text-center text-indigo-400 font-bold" 
            />
          </div>
          <div>
            <span className="block text-[9.5px] text-slate-500 font-bold mb-1">Night Machine</span>
            <input 
              type="number" 
              value={newNightMc} 
              onChange={e => setNewNightMc(Number(e.target.value))} 
              className="w-full bg-slate-950 border border-slate-850 p-1 rounded font-mono text-center" 
            />
          </div>
          <div>
            <span className="block text-[9.5px] text-slate-500 font-bold mb-1">Night Prod (Pcs)</span>
            <input 
              type="number" 
              value={newNightProd} 
              onChange={e => setNewNightProd(Number(e.target.value))} 
              className="w-full bg-slate-950 border border-slate-850 p-1 rounded font-mono text-center text-indigo-400 font-bold" 
            />
          </div>
          <div>
            <span className="block text-[9.5px] text-slate-500 font-bold mb-1">Stop M/C &amp; Hours</span>
            <div className="flex gap-1">
              <input 
                type="number" 
                placeholder="M/C" 
                value={newStopMc} 
                onChange={e => setNewStopMc(Number(e.target.value))} 
                className="w-1/2 bg-slate-950 border border-slate-850 p-1 rounded font-mono text-center" 
              />
              <input 
                type="number" 
                placeholder="Hrs" 
                value={newStopHour} 
                onChange={e => setNewStopHour(Number(e.target.value))} 
                className="w-1/2 bg-slate-950 border border-slate-850 p-1 rounded font-mono text-center" 
              />
            </div>
          </div>
          <div>
            <span className="block text-[9.5px] text-slate-500 font-bold mb-1">Lost Min &amp; Remarks</span>
            <div className="flex gap-1">
              <input 
                type="number" 
                placeholder="Min" 
                value={newLostMnt} 
                onChange={e => setNewLostMnt(Number(e.target.value))} 
                className="w-1/3 bg-slate-950 border border-slate-850 p-1 rounded font-mono text-center" 
              />
              <input 
                type="text" 
                placeholder="Reason" 
                value={newStopReason} 
                onChange={e => setNewStopReason(e.target.value)} 
                className="w-2/3 bg-slate-950 border border-slate-850 p-1 rounded font-sans text-xs" 
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Excel List Filters */}
      <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex flex-wrap gap-2.5 items-center justify-between text-xs text-slate-200">
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
            <Search size={12} /> Filters:
          </span>
          <input 
            type="date" 
            value={filterDate} 
            onChange={e => setFilterDate(e.target.value)} 
            className="bg-slate-950 border border-slate-800 p-1.5 rounded-md text-white font-mono" 
          />
          <select 
            value={filterBuyer} 
            onChange={e => setFilterBuyer(e.target.value)} 
            className="bg-slate-950 border border-slate-800 p-1.5 rounded-md text-white"
          >
            <option value="">All Buyers</option>
            {SAMPLE_PARTIES.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
          <input 
            type="text" 
            placeholder="Search Style..." 
            value={filterStyle} 
            onChange={e => setFilterStyle(e.target.value)} 
            className="bg-slate-950 border border-slate-800 p-1.5 rounded-md text-white placeholder-slate-500 font-mono" 
          />
          <select 
            value={filterStatus} 
            onChange={e => setFilterStatus(e.target.value)} 
            className="bg-slate-950 border border-slate-800 p-1.5 rounded-md text-white"
          >
            <option value="">All Statuses</option>
            <option value="Draft">Draft</option>
            <option value="Submitted">Submitted</option>
            <option value="Approved">Approved</option>
            <option value="Posted to Accounts">Posted to Accounts</option>
          </select>
        </div>

        <div className="font-mono text-xs bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-850 text-emerald-400 font-semibold">
          Filtered Amount: BDT {sumTotalAmount.toLocaleString()}
        </div>
      </div>

      {/* Modern Spreadsheet Table View */}
      <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-950 text-slate-200">
        <div className="overflow-x-auto min-w-full text-xs font-sans">
          
          <table className="table-auto w-full border-collapse border-b border-slate-800 min-w-[1400px]">
            <thead className="bg-[#111827] text-slate-400 uppercase font-mono text-[9px] tracking-wider text-center">
              <tr>
                <th className="border-r border-slate-850 p-2 text-left w-36">DATE</th>
                <th className="border-r border-slate-850 p-2 text-left w-36">BUYER</th>
                <th className="border-r border-slate-850 p-2 text-left w-24">STYLE</th>
                <th className="border-r border-slate-850 p-2 text-right w-20">CFM RATE</th>
                <th className="border-r border-slate-850 p-2 text-right w-24">ORDER QTY</th>
                <th className="border-r border-slate-850 p-2 text-right w-24">PREV PROD</th>
                <th className="border-r border-slate-850 p-2 text-indigo-400 w-16">DAY MC</th>
                <th className="border-r border-slate-850 p-2 text-indigo-400 w-24">DAY PROD</th>
                <th className="border-r border-slate-850 p-2 text-teal-400 w-16">NIGHT MC</th>
                <th className="border-r border-slate-850 p-2 text-teal-400 w-24">NIGHT PROD</th>
                <th className="border-r border-slate-850 p-2 text-slate-300 w-24">TOTAL USED MC</th>
                <th className="border-r border-slate-850 p-2 text-slate-300 w-24">TOTAL PROD</th>
                <th className="border-r border-slate-850 p-2 text-amber-500 w-24">G. TOTAL</th>
                <th className="border-r border-slate-850 p-2 text-amber-500 w-24">BALANCE</th>
                <th className="border-r border-slate-850 p-2 text-right w-20">M/C QTY</th>
                <th className="border-r border-slate-850 p-2 text-emerald-400 text-right w-32">PRO. AMOUNT</th>
                <th className="border-r border-slate-850 p-2 text-rose-550 w-14">STOP MC</th>
                <th className="border-r border-slate-850 p-2 text-rose-550 w-14">STOP HR</th>
                <th className="border-r border-slate-850 p-2 text-rose-550 w-16">LOST MNT</th>
                <th className="p-2 w-52">ACTIONS</th>
              </tr>
            </thead>
            
            <tbody className="font-mono text-[11px] divide-y divide-slate-850 text-center">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={20} className="p-10 font-sans text-xs text-slate-500 text-center">
                    <AlertCircle size={28} className="mx-auto text-slate-650 mb-2.5" />
                    No daily production entries matched selected filters. Add lines using the Excel Quick Row.
                  </td>
                </tr>
              ) : (
                filtered.map((r) => {
                  const isEditing = editingId === r.id;
                  
                  return (
                    <tr 
                      key={r.id} 
                      className={`hover:bg-slate-900/60 transition ${r.status === "Approved" ? "bg-indigo-950/20" : r.status === "Posted to Accounts" ? "bg-emerald-950/15" : ""}`}
                    >
                      {/* Date */}
                      <td className="border-r border-slate-900 p-2 text-left font-sans">
                        {isEditing ? (
                          <input 
                            type="date" 
                            value={editValues.date || ""} 
                            onChange={e => handleInlineChange("date", e.target.value)} 
                            className="w-full bg-slate-920 border border-slate-800 p-1 text-[11px]" 
                          />
                        ) : (
                          r.date
                        )}
                      </td>

                      {/* Buyer */}
                      <td className="border-r border-slate-900 p-2 text-left font-sans text-slate-300 font-bold">
                        {isEditing ? (
                          <select 
                            value={editValues.buyer || ""} 
                            onChange={e => handleInlineChange("buyer", e.target.value)}
                            className="bg-slate-910 text-white p-0.5 border border-slate-800"
                          >
                            {SAMPLE_PARTIES.map(p => (
                              <option key={p} value={p}>{p}</option>
                            ))}
                          </select>
                        ) : (
                          r.buyer
                        )}
                      </td>

                      {/* Style */}
                      <td className="border-r border-slate-900 p-2 text-indigo-300 font-bold">
                        {isEditing ? (
                          <input 
                            type="text" 
                            value={editValues.style || ""} 
                            onChange={e => handleInlineChange("style", e.target.value)} 
                            className="w-full bg-slate-925 text-center text-indigo-300 font-bold" 
                          />
                        ) : (
                          r.style
                        )}
                      </td>

                      {/* CFM Rate */}
                      <td className="border-r border-slate-900 p-2 text-right text-emerald-400 font-bold">
                        {isEditing ? (
                          <input 
                            type="number" 
                            value={editValues.cfmRate || 0} 
                            onChange={e => handleInlineChange("cfmRate", Number(e.target.value))} 
                            className="w-14 bg-slate-925 text-right font-bold text-emerald-400" 
                          />
                        ) : (
                          `BDT ${r.cfmRate}`
                        )}
                      </td>

                      {/* Order Qty */}
                      <td className="border-r border-slate-900 p-2 text-right">
                        {isEditing ? (
                          <input 
                            type="number" 
                            value={editValues.orderQty || 0} 
                            onChange={e => handleInlineChange("orderQty", Number(e.target.value))} 
                            className="w-16 bg-slate-925 text-right text-slate-300" 
                          />
                        ) : (
                          r.orderQty.toLocaleString()
                        )}
                      </td>

                      {/* Prev Prod */}
                      <td className="border-r border-slate-900 p-2 text-right text-slate-450">
                        {isEditing ? (
                          <input 
                            type="number" 
                            value={editValues.prevProdQty || 0} 
                            onChange={e => handleInlineChange("prevProdQty", Number(e.target.value))} 
                            className="w-16 bg-slate-925 text-right font-bold" 
                          />
                        ) : (
                          r.prevProdQty.toLocaleString()
                        )}
                      </td>

                      {/* Day Mc */}
                      <td className="border-r border-slate-900 p-2 text-indigo-400">
                        {isEditing ? (
                          <input 
                            type="number" 
                            value={editValues.dayMachine || 0} 
                            onChange={e => handleInlineChange("dayMachine", Number(e.target.value))} 
                            className="w-10 bg-slate-925 text-center text-indigo-400" 
                          />
                        ) : (
                          r.dayMachine
                        )}
                      </td>

                      {/* Day Prod */}
                      <td className="border-r border-slate-900 p-2 text-indigo-400 font-bold text-right">
                        {isEditing ? (
                          <input 
                            type="number" 
                            value={editValues.dayProdQty || 0} 
                            onChange={e => handleInlineChange("dayProdQty", Number(e.target.value))} 
                            className="w-14 bg-slate-925 text-right text-indigo-450 font-bold" 
                          />
                        ) : (
                          r.dayProdQty.toLocaleString()
                        )}
                      </td>

                      {/* Night Mc */}
                      <td className="border-r border-slate-900 p-2 text-teal-400">
                        {isEditing ? (
                          <input 
                            type="number" 
                            value={editValues.nightMachine || 0} 
                            onChange={e => handleInlineChange("nightMachine", Number(e.target.value))} 
                            className="w-10 bg-slate-925 text-center text-teal-400" 
                          />
                        ) : (
                          r.nightMachine
                        )}
                      </td>

                      {/* Night Prod */}
                      <td className="border-r border-slate-900 p-2 text-teal-400 font-bold text-right">
                        {isEditing ? (
                          <input 
                            type="number" 
                            value={editValues.nightProdQty || 0} 
                            onChange={e => handleInlineChange("nightProdQty", Number(e.target.value))} 
                            className="w-14 bg-slate-925 text-right text-teal-400 font-bold" 
                          />
                        ) : (
                          r.nightProdQty.toLocaleString()
                        )}
                      </td>

                      {/* Total Used Mc */}
                      <td className="border-r border-slate-900 p-2 bg-slate-900/40 font-bold">
                        {isEditing ? editValues.totalUsedMachine : r.totalUsedMachine}
                      </td>

                      {/* Total Prod Qty */}
                      <td className="border-r border-slate-900 p-2 bg-slate-900/40 font-bold text-right text-slate-100">
                        {isEditing ? editValues.totalProdQty?.toLocaleString() : r.totalProdQty.toLocaleString()}
                      </td>

                      {/* Grand Total Production */}
                      <td className="border-r border-slate-900 p-2 text-amber-500 font-black text-right">
                        {isEditing ? editValues.grandTotalProd?.toLocaleString() : r.grandTotalProd.toLocaleString()}
                      </td>

                      {/* Balance Quantity */}
                      <td className={`border-r border-slate-900 p-2 text-right font-bold ${(isEditing ? (editValues.balanceQty ?? 0) : r.balanceQty) < 0 ? "text-rose-500" : "text-amber-550"}`}>
                        {isEditing ? editValues.balanceQty?.toLocaleString() : r.balanceQty.toLocaleString()}
                      </td>

                      {/* Total Machine Quantity */}
                      <td className="border-r border-slate-900 p-2 text-slate-500">
                        {isEditing ? (
                          <input 
                            type="number" 
                            value={editValues.totalMachineQty || 0} 
                            onChange={e => handleInlineChange("totalMachineQty", Number(e.target.value))} 
                            className="w-10 bg-slate-925 text-center text-slate-500" 
                          />
                        ) : (
                          r.totalMachineQty
                        )}
                      </td>

                      {/* Production Amount */}
                      <td className="border-r border-slate-900 p-2 text-right text-emerald-400 font-black">
                        {isEditing ? (editValues.productionAmount ?? 0).toLocaleString() : r.productionAmount.toLocaleString()}
                      </td>

                      {/* Stop Machine count */}
                      <td className="border-r border-slate-900 p-2 text-rose-500">
                        {isEditing ? (
                          <input 
                            type="number" 
                            value={editValues.stopMachine ?? 0} 
                            onChange={e => handleInlineChange("stopMachine", Number(e.target.value))} 
                            className="w-8 bg-slate-925 text-center text-rose-500" 
                          />
                        ) : (
                          r.stopMachine
                        )}
                      </td>

                      {/* Stop Hours */}
                      <td className="border-r border-slate-900 p-2 text-rose-500">
                        {isEditing ? (
                          <input 
                            type="number" 
                            value={editValues.stopHour ?? 0} 
                            onChange={e => handleInlineChange("stopHour", Number(e.target.value))} 
                            className="w-8 bg-slate-925 text-center text-rose-500" 
                          />
                        ) : (
                          r.stopHour
                        )}
                      </td>

                      {/* Lost Minutes */}
                      <td className="border-r border-slate-900 p-2 text-rose-500">
                        {isEditing ? (
                          <input 
                            type="number" 
                            value={editValues.lostMinute ?? 0} 
                            onChange={e => handleInlineChange("lostMinute", Number(e.target.value))} 
                            className="w-10 bg-slate-925 text-center text-rose-500" 
                          />
                        ) : (
                          r.lostMinute
                        )}
                      </td>

                      {/* Actions column */}
                      <td className="p-1 font-sans text-[10.5px]">
                        {isEditing ? (
                          <div className="flex justify-center gap-1">
                            <button 
                              onClick={() => saveInlineEdit(r.id)}
                              className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded flex items-center justify-center gap-0.5 cursor-pointer"
                              title="Commit edits"
                            >
                              <Check size={11} /> Save
                            </button>
                            <button 
                              onClick={cancelInlineEdit}
                              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-350 font-medium rounded flex items-center justify-center gap-0.5 cursor-pointer"
                            >
                              <X size={11} /> Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-wrap items-center justify-center gap-1.5">
                            
                            {/* Badges and primary actions based on states */}
                            {r.status === "Draft" && (
                              <>
                                <button 
                                  onClick={() => startInlineEdit(r)}
                                  className="p-1 bg-slate-850 hover:bg-slate-800 text-indigo-400 rounded cursor-pointer border border-slate-800"
                                  title="Edit entry Draft"
                                >
                                  <Edit2 size={11} />
                                </button>
                                <button 
                                  onClick={() => onUpdateEntry(r.id, { status: "Submitted" })}
                                  className="px-1.5 py-1 bg-indigo-950/55 text-indigo-400 hover:bg-indigo-900/60 font-bold rounded border border-indigo-900/50 cursor-pointer"
                                  title="Submit for Approval"
                                >
                                  Submit
                                </button>
                                <button 
                                  onClick={() => onDeleteEntry(r.id)}
                                  className="p-1 bg-slate-900 hover:bg-rose-950 text-rose-500 rounded cursor-pointer border border-slate-850"
                                  title="Trash Draft"
                                >
                                  <Trash2 size={11} />
                                </button>
                              </>
                            )}

                            {r.status === "Submitted" && (
                              <>
                                <button 
                                  onClick={() => startInlineEdit(r)}
                                  className="p-1 bg-slate-850 hover:bg-slate-800 text-indigo-400 rounded cursor-pointer border border-slate-800 animate-pulse"
                                  title="Review Submission"
                                >
                                  <Edit2 size={11} />
                                </button>
                                {(userRole === "Owner" || userRole === "Office") && (
                                  <button 
                                    onClick={() => onApproveEntry(r.id)}
                                    className="px-2 py-1 bg-emerald-650/40 border border-emerald-500/50 text-emerald-400 hover:bg-emerald-600 hover:text-slate-950 font-bold rounded cursor-pointer"
                                  >
                                    Approve
                                  </button>
                                )}
                              </>
                            )}

                            {r.status === "Approved" && (
                              <div className="flex flex-wrap items-center gap-1">
                                <span className="px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-400 border border-indigo-900/50 font-bold text-[9px] uppercase tracking-wider">
                                  Approved
                                </span>
                                {(userRole === "Owner" || userRole === "Office") && (
                                  <button 
                                    onClick={() => onPostEntry(r.id)}
                                    className="px-1.5 py-1 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded cursor-pointer shadow-xs animate-pulse text-[10px]"
                                  >
                                    Post GL
                                  </button>
                                )}
                                <span className="text-[10px] text-rose-500 flex items-center gap-0.5" title="No matching Journal Voucher found in Double Entry Accounts registry">
                                  ⚠️ Unposted
                                </span>
                              </div>
                            )}

                            {r.status === "Posted to Accounts" && (
                              <div className="flex items-center gap-1">
                                <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-900/50 font-bold text-[9px] uppercase tracking-wider">
                                  Posted GL
                                </span>
                                <button 
                                  onClick={() => startInlineEdit(r)}
                                  className="p-1 bg-slate-900 hover:bg-slate-850 text-amber-500 rounded cursor-pointer border border-slate-800"
                                  title="Modify posted list (Requires re-approval & will trigger an Accounts Adjustment double entry!)"
                                >
                                  Adjust
                                </button>
                              </div>
                            )}

                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>

        </div>
      </div>
    </div>
  );
}
