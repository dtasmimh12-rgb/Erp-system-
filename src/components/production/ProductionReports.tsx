import React, { useState, useMemo } from "react";
import { 
  FileText, Printer, Download, Search, RefreshCw, AlertCircle, Calendar, Users, Cpu, FileSpreadsheet, Lock, Sparkles, LayoutGrid, Milestone
} from "lucide-react";
import { DailyProductionEntry } from "../../types";

interface ProductionReportsProps {
  entries: DailyProductionEntry[];
  lang: "EN" | "BN";
}

type ReportType = 
  | "Daily Production Report"
  | "Monthly Production Report"
  | "Buyer-wise Production Report"
  | "Style-wise Production Report"
  | "Machine Usage Report"
  | "Lost Minute Report"
  | "Stop Machine Report"
  | "Production Amount Report"
  | "Production Accounts Posting Report"
  | "Due Bill Report"
  | "Buyer Receivable Report";

const REPORT_OPTIONS: ReportType[] = [
  "Daily Production Report",
  "Monthly Production Report",
  "Buyer-wise Production Report",
  "Style-wise Production Report",
  "Machine Usage Report",
  "Lost Minute Report",
  "Stop Machine Report",
  "Production Amount Report",
  "Production Accounts Posting Report",
  "Due Bill Report",
  "Buyer Receivable Report"
];

export default function ProductionReports({
  entries,
  lang
}: ProductionReportsProps) {
  const [selectedReport, setSelectedReport] = useState<ReportType>("Daily Production Report");
  const [filterDate, setFilterDate] = useState("2026-05-23");
  const [filterMonth, setFilterMonth] = useState("2026-05");
  const [filterBuyer, setFilterBuyer] = useState("");

  const matchingEntries = useMemo(() => {
    return entries.filter(e => {
      // General filtering matching reports rules
      if (selectedReport === "Daily Production Report") {
        return e.date === filterDate;
      }
      if (selectedReport === "Monthly Production Report") {
        return e.date.startsWith(filterMonth);
      }
      if (selectedReport === "Buyer-wise Production Report" && filterBuyer) {
        return e.buyer === filterBuyer;
      }
      return true; // fallback
    });
  }, [entries, selectedReport, filterDate, filterMonth, filterBuyer]);

  const handleExport = (format: "Excel" | "PDF" | "CSV") => {
    alert(`Generating automated export of [${selectedReport}] in [${format}] format. Download package is ready and streaming via ERP secure frame.`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 text-xs text-slate-200">
      
      {/* Sidebar selection list */}
      <div className="lg:col-span-1 bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-4">
        <h4 className="font-display font-extrabold text-[11px] text-white uppercase tracking-wider mb-2 border-b border-slate-800 pb-2">
          Report Directory (11)
        </h4>
        <div className="space-y-1">
          {REPORT_OPTIONS.map((opt) => (
            <button 
              key={opt}
              onClick={() => setSelectedReport(opt)}
              className={`w-full text-left py-2 px-3 rounded-lg transition overflow-hidden text-ellipsis whitespace-nowrap cursor-pointer ${selectedReport === opt ? "bg-indigo-600 font-bold text-white shadow" : "hover:bg-slate-850 hover:text-white text-slate-400"}`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* Main Parameters Content */}
      <div className="lg:col-span-3 space-y-4">
        
        {/* Parameters Filter Box */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-wrap gap-3 items-end justify-between">
          <div className="flex flex-wrap gap-3">
            {selectedReport === "Daily Production Report" && (
              <div>
                <label className="block text-[10px] text-slate-400 uppercase font-black tracking-wider mb-1">Target Date</label>
                <input 
                  type="date" 
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="bg-slate-950 border border-[#1e293b] rounded-lg p-2 font-mono text-white" 
                />
              </div>
            )}

            {selectedReport === "Monthly Production Report" && (
              <div>
                <label className="block text-[10px] text-slate-400 uppercase font-black tracking-wider mb-1">Target Month</label>
                <input 
                  type="month" 
                  value={filterMonth}
                  onChange={(e) => setFilterMonth(e.target.value)}
                  className="bg-slate-950 border border-[#1e293b] rounded-lg p-2 font-mono text-white" 
                />
              </div>
            )}

            <div>
              <label className="block text-[10px] text-slate-400 uppercase font-black tracking-wider mb-1 font-sans">Buyer Selection Filter (Optional)</label>
              <select 
                value={filterBuyer}
                onChange={(e) => setFilterBuyer(e.target.value)}
                className="bg-slate-950 border border-[#1e293b] rounded-lg p-2 font-mono"
              >
                <option value="">-- Apply Buyer filter --</option>
                <option value="SPRING">SPRING</option>
                <option value="TOP-TEX">TOP-TEX</option>
                <option value="BISMILLAH-BUYING">BISMILLAH-BUYING</option>
                <option value="SRK APPARELS">SRK APPARELS</option>
                <option value="KISHAN">KISHAN</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2">
            <button 
              onClick={() => handleExport("Excel")}
              className="bg-indigo-600/20 hover:bg-indigo-600 hover:text-white px-3 py-2 rounded-lg text-xs font-bold border border-indigo-500/40 text-indigo-300 flex items-center gap-1 cursor-pointer"
            >
              <FileSpreadsheet size={13} /> Export Excel
            </button>
            <button 
              onClick={() => handleExport("PDF")}
              className="bg-rose-955/20 hover:bg-rose-900 border border-rose-900/50 text-rose-400 px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <FileText size={13} /> PDF
            </button>
            <button 
              onClick={handlePrint}
              className="bg-emerald-600/25 text-emerald-400 hover:bg-emerald-600 hover:text-slate-950 border border-emerald-500/30 px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <Printer size={13} /> Print
            </button>
          </div>
        </div>

        {/* Clean Ledger Print Preview Container */}
        <div className="bg-slate-955 border border-slate-800 rounded-2xl p-6 shadow-2xl font-serif text-slate-800 bg-white relative overflow-hidden">
          
          {/* Decorative invoice grid watermark */}
          <div className="absolute top-0 right-0 p-3 text-[10px] font-mono uppercase tracking-widest text-[#cbd5e1] font-black pointer-events-none select-none">
            OTTOMASS SW-ERP PRINT FRAME
          </div>

          <div className="text-center font-sans tracking-tight border-b-2 border-slate-900 pb-4">
            <h1 className="text-xl font-black uppercase text-slate-900">OTTOMASS JACQUARD</h1>
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">KNITTING AND APPARELS DIVISION • FACTORY FLOOR LEDGER BOOK</p>
            <p className="text-xs text-slate-500 mt-1">Constituted Unit: Gazipur Industrial Sector, Bangladesh (NO BRANCH REPRESENTATION)</p>
          </div>

          <div className="flex justify-between items-center my-4 font-sans text-xs">
            <div>
              <span className="font-bold text-slate-900 uppercase">Document Class:</span> {selectedReport}
            </div>
            <div>
              <span className="font-bold text-slate-900 uppercase">Generated On:</span> {new Date().toLocaleDateString()}
            </div>
          </div>

          {/* Report Specific Mock Tables */}
          <div className="overflow-x-auto my-6 text-xs text-slate-900 font-sans">
            <table className="table-auto w-full text-center border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-900 uppercase text-[9.5px] border-y border-slate-300 font-black">
                  <th className="p-2 text-left">REFERENCE</th>
                  <th className="p-2 text-left">BUYER PARTY</th>
                  <th className="p-2 text-center">STYLE CODE</th>
                  <th className="p-2 text-right">PCS PRODUCED</th>
                  <th className="p-2 text-right">VALUATION</th>
                  <th className="p-2 text-center">APPROVAL STAMP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px] text-slate-650">
                {matchingEntries.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-slate-550 font-sans">No matching daily entries for validation parameters. Try widening dates.</td>
                  </tr>
                ) : (
                  matchingEntries.map((e, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="p-2 text-left font-sans">{e.date}</td>
                      <td className="p-2 text-left font-sans font-bold">{e.buyer}</td>
                      <td className="p-2 text-center text-indigo-650 font-bold">{e.style}</td>
                      <td className="p-2 text-right">{e.totalProdQty.toLocaleString()} pcs</td>
                      <td className="p-2 text-right text-emerald-700 font-bold">BDT {e.productionAmount.toLocaleString()}</td>
                      <td className="p-2 text-center text-emerald-600 font-sans font-bold">✓ APPROVED</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="border-t border-slate-200 pt-4 flex justify-between font-sans text-[10.5px] text-slate-500">
            <div>
              Generated by system ledger daemon:
              <br />
              <span className="font-bold text-slate-800">Tariqul Islam, Operational Owner</span>
            </div>
            <div className="text-right">
              Verified &amp; Authorized Signature:
              <br />
              <span className="font-mono text-slate-400">...................................................</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
