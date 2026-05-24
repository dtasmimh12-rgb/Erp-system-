import React, { useState } from "react";
import { 
  Building2, 
  Cpu, 
  Clock, 
  Plus, 
  Check, 
  Layers, 
  ArrowRight, 
  AlertTriangle, 
  TrendingUp, 
  FileText, 
  CornerDownRight, 
  Package, 
  ShieldAlert, 
  Calendar, 
  UserCheck 
} from "lucide-react";

import { 
  AttendanceRecord, 
  Machine, 
  InventoryItem, 
  ChartOfAccount, 
  JournalVoucher, 
  KnittingRecord, 
  CompanySettings 
} from "../types";

interface OtherModulesProps {
  activeTab: string;
  attendance: AttendanceRecord[];
  onApproveAttendance: (id: string) => void;
  machines: Machine[];
  inventory: InventoryItem[];
  accounts: ChartOfAccount[];
  vouchers: JournalVoucher[];
  onAddVoucher: (v: JournalVoucher) => void;
  knitting: KnittingRecord[];
  onAddKnitting: (k: KnittingRecord) => void;
  lang: "EN" | "BN";
  auditLogs?: any[];
}

export default function OtherModules({
  activeTab,
  attendance,
  onApproveAttendance,
  machines,
  inventory,
  accounts,
  vouchers,
  onAddVoucher,
  knitting,
  onAddKnitting,
  lang,
  auditLogs: passedAuditLogs
}: OtherModulesProps) {

  // Search filter
  const [storeSearch, setStoreSearch] = useState("");
  const [financeSearch, setFinanceSearch] = useState("");

  // Voucher state
  const [debitAcc, setDebitAcc] = useState("5001");
  const [creditAcc, setCreditAcc] = useState("1001");
  const [vAmt, setVAmt] = useState(15000);
  const [vNarration, setVNarration] = useState("");
  const [pMsg, setPMsg] = useState("");

  // Knitting state
  const [knitMac, setKnitMac] = useState("OJ-ST-05");
  const [knitOrder, setKnitOrder] = useState("ORD-2026-801");
  const [knitQty, setKnitQty] = useState(105);
  const [knitMinutes, setKnitMinutes] = useState(0);
  const [knitReason, setKnitReason] = useState("");

  // Master setup inputs for Company Setup
  const [cName, setCName] = useState("OTTOMASS JACQUARD");
  const [cBangla, setCBangla] = useState("অটোমাস জ্যাকার্ড");
  const [cPhone, setCPhone] = useState("+880 1711-223344");
  const [cAddress, setCAddress] = useState("Plot B-14, BSCIC Industrial Area, Konabari, Gazipur, Bangladesh");

  function handleCreateVoucher(e: React.FormEvent) {
    e.preventDefault();
    if (vAmt <= 0) return;

    const debNom = accounts.find(a => a.code === debitAcc)?.name || "Material Expense Acc";
    const credNom = accounts.find(a => a.code === creditAcc)?.name || "Cash / Bank Reserves";

    const customJV: JournalVoucher = {
      id: `jv-${Date.now()}`,
      voucherNo: `JV-202605-${String(vouchers.length + 10).padStart(3, "0")}`,
      date: new Date().toISOString().split("T")[0],
      narration: vNarration || `Standard dual debit cash alignment post for ${debNom}`,
      status: "Posted",
      createdBy: "Kamran Hassan (Senior Accountant)",
      items: [
        { accountCode: debitAcc, accountName: debNom, debit: vAmt, credit: 0 },
        { accountCode: creditAcc, accountName: credNom, debit: 0, credit: vAmt }
      ]
    };

    onAddVoucher(customJV);
    setVNarration("");
    setVAmt(10000);
    setPMsg(lang === "EN" ? `✅ Double Entry posted successfully! Voucher ${customJV.voucherNo}.` : `✅ ভাউচার ${customJV.voucherNo} সফলভাবে পোস্ট করা হয়েছে।`);
    setTimeout(() => setPMsg(""), 4000);
  }

  function handleCreateKnitRecord(e: React.FormEvent) {
    e.preventDefault();
    const mockRecord: KnittingRecord = {
      id: `knit-${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
      shift: "Day",
      machineId: knitMac,
      operatorName: "Abdul Karim",
      orderNo: knitOrder,
      styleNo: "STY-HM-221",
      bodyPart: "Front",
      targetQty: 120,
      achievedQty: knitQty,
      reworkQty: Math.max(0, Math.floor((120 - knitQty) / 4)),
      rejectQty: 0,
      downtimeMinutes: knitMinutes,
      downtimeReason: knitReason || "Standard production load shift pattern integration",
      checkedBy: "Saddat Rahman"
    };

    onAddKnitting(mockRecord);
    setKnitQty(105);
    setKnitMinutes(0);
    setKnitReason("");
    setPMsg(lang === "EN" ? `✅ Production set of ${knitQty} pcs recorded for machine ${knitMac}!` : `✅ মেশিন ${knitMac} এর জন্য ${knitQty} পিস উৎপাদন রেকর্ড করা হয়েছে!`);
    setTimeout(() => setPMsg(""), 4000);
  }

  // Audits log array (Simulated / Live fallback)
  const auditLogs = passedAuditLogs || [
    { id: 1, timer: "2026-05-23 09:02:15", ip: "192.168.4.15", action: "User LOGIN Success", payload: "User sumi.hr@ottomass.com from HR, Gazipur central", status: "Permitted" },
    { id: 2, timer: "2026-05-23 08:45:00", ip: "124.90.31.22", action: "NID Document UPLOAD", payload: "Associated file for employee OJ-082 (Rafiqul Hasan)", status: "Permitted" },
    { id: 3, timer: "2026-05-23 08:31:04", ip: "192.168.4.18", action: "Biometric Card MAP", payload: "Added RFID card RFID-4421B to Abdul Karim", status: "Security Audit" },
    { id: 4, timer: "2026-05-22 17:15:30", ip: "192.168.4.02", action: "POST Journal Voucher", payload: "Posted JV-202605-001 by Kamran Hassan", status: "Accounts Override" }
  ];

  // 1. ATTENDANCE SCAN LOGS SCREEN
  if (activeTab === "attendance") {
    return (
      <div className="space-y-6 animate-fade-in pr-2">
        <div>
          <h2 className="font-display font-bold text-2xl text-slate-800 tracking-tight">
            {lang === "EN" ? "Biometric & RFID Punch Records" : "বায়োমেট্রিক এবং আরএফআইডি উপস্থিতি বিবরণ"}
          </h2>
          <p className="font-sans text-xs text-slate-500 mt-1">
            {lang === "EN" ? "Resolve biometric scanner mismatched tags, check-in errors, or manual leave allocations." : "স্ক্যানারের অসঙ্গতি সংশোধন এবং বিলম্ব উপস্থিতির জন্য ম্যানুয়াল অনুমোদন স্ক্রিন।"}
          </p>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-display font-bold text-xs uppercase text-slate-400 tracking-wider">
              {lang === "EN" ? "Punch Correction Registry" : "উপস্থিতি সংশোধন বিবরণ"}
            </h3>
            <span className="bg-amber-50 text-amber-600 font-mono text-[10px] font-bold px-2 py-0.5 rounded-full">
              {attendance.filter(a => a.approvalStatus === "Pending Approval").length} Correction Requests
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs divide-y divide-slate-100 font-sans">
              <thead>
                <tr className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                  <th className="py-2.5">Emp ID</th>
                  <th className="py-2.5">Name</th>
                  <th className="py-2.5">Date</th>
                  <th className="py-2.5">In punch</th>
                  <th className="py-2.5">Out punch</th>
                  <th className="py-2.5 font-mono">Overtime</th>
                  <th className="py-2.5">Method</th>
                  <th className="py-2.5 text-center">Status</th>
                  <th className="py-2.5 text-center">Correction Valve</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {attendance.map((att) => (
                  <tr key={att.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 font-mono font-bold text-slate-800">{att.employeeId}</td>
                    <td className="py-3 font-bold text-slate-700">{att.employeeName}</td>
                    <td className="py-3 text-slate-500">{att.date}</td>
                    <td className="py-3">
                      <span className="bg-emerald-50 text-emerald-700 text-[11px] px-1.5 py-0.5 rounded-sm font-semibold">{att.checkIn}</span>
                    </td>
                    <td className="py-3">
                      <span className="bg-slate-100 text-slate-700 text-[11px] px-1.5 py-0.5 rounded-sm font-semibold">{att.checkOut || "--:--"}</span>
                    </td>
                    <td className="py-3 font-mono text-indigo-600 font-bold">{att.otHours} Hrs</td>
                    <td className="py-3 text-slate-400 text-[10px]">{att.verificationMethod}</td>
                    <td className="py-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold leading-relaxed ${
                        att.approvalStatus === "Approved" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                      }`}>
                        {att.approvalStatus}
                      </span>
                    </td>
                    <td className="py-3 text-center">
                      {att.approvalStatus === "Pending Approval" ? (
                        <button
                          onClick={() => onApproveAttendance(att.id)}
                          className="px-2 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 text-[10px] font-bold rounded-md hover:bg-indigo-100 transition"
                        >
                          <Check size={10} className="inline mr-1" />
                          Approve Correction
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-mono italic">Verified RFID</span>
                      )}
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

  // 2. STOLL & SHIMA KNITTING MACHINE MONITORING
  if (activeTab === "production") {
    return (
      <div className="space-y-6 animate-fade-in pr-2">
        <div>
          <h2 className="font-display font-bold text-2xl text-slate-800 tracking-tight">
            {lang === "EN" ? "Computerized Jacquard Production Monitor" : "কম্পিউটারাইজড উৎপাদন মনিটর"}
          </h2>
          <p className="font-sans text-xs text-slate-500 mt-1">
            {lang === "EN" ? "Monitor real-time stitch pattern codes, Stoll/Shima maintenance states, and log yarn breakdown downtimes." : "স্টল এবং শিমা সেকি মেশিনের আউটপুট লক্ষ্যমাত্রা এবং ডাউনটাইম এন্ট্রি স্ক্রিন।"}
          </p>
        </div>

        {pMsg && (
          <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-xl text-emerald-800 text-xs font-medium">
            {pMsg}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Machine log layout */}
          <div className="lg:col-span-2 bg-white border border-slate-200 p-5 rounded-2xl space-y-4">
            <h3 className="font-display font-bold text-xs uppercase text-slate-400 tracking-wider">
              {lang === "EN" ? "Gazipur Unit 1: Computerized Knitting Machineries Roster" : "মেশিনারি বিবরণী"}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {machines.map((mac) => (
                <div key={mac.id} className="p-4 border border-slate-200 rounded-xl bg-slate-50/50 flex justify-between items-center">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-slate-800 font-mono">{mac.machineNo}</span>
                      <span className="bg-slate-200 text-slate-700 text-[8.5px] px-1.5 rounded-sm font-semibold">{mac.brand}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">{mac.location}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">GG: {mac.gauge} • Cap: {mac.capacityPcsPerDay} pcs/day</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                    mac.status === "Running" ? "bg-emerald-100 text-emerald-800" : mac.status === "Idle" ? "bg-amber-100 text-amber-800" : "bg-rose-100 text-rose-800"
                  }`}>
                    {mac.status}
                  </span>
                </div>
              ))}
            </div>

            {/* knitting records */}
            <h3 className="font-display font-medium text-xs text-slate-800 pt-4">
              Yesterday's Verified Panel Outputs
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs divide-y divide-slate-100 font-sans">
                <thead>
                  <tr className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                    <th className="py-2">Date</th>
                    <th className="py-2">Machine ID</th>
                    <th className="py-2">Active Style</th>
                    <th className="py-2 text-right">Target Output (Pcs)</th>
                    <th className="py-2 text-right">Achieved Output</th>
                    <th className="py-2 text-right">Downtime Minutes</th>
                    <th className="py-2">Downtime Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {knitting.map((k) => (
                    <tr key={k.id}>
                      <td className="py-2.5 text-slate-500">{k.date}</td>
                      <td className="py-2.5 font-mono font-bold text-slate-700">{k.machineId}</td>
                      <td className="py-2.5 font-bold text-slate-800">{k.styleNo}</td>
                      <td className="py-2.5 text-right font-semibold text-slate-400">{k.targetQty}</td>
                      <td className="py-2.5 text-right font-extrabold text-slate-900">{k.achievedQty}</td>
                      <td className="py-2.5 text-right font-mono text-rose-500 font-semibold">{k.downtimeMinutes} mins</td>
                      <td className="py-2.5 text-[10.5px] text-slate-400">{k.downtimeReason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>

          {/* Log panel right side */}
          <div className="bg-white border border-slate-200 p-5 rounded-2xl h-fit">
            <h4 className="font-display font-bold text-xs uppercase text-slate-400 tracking-wider mb-4">
              {lang === "EN" ? "Quick Log Daily Knitting Output" : "নিটিং আউটপুট এন্ট্রি"}
            </h4>

            <form onSubmit={handleCreateKnitRecord} className="space-y-4 font-sans text-xs">
              <div>
                <label className="text-[10px] text-slate-400 font-bold">{lang === "EN" ? "Select Knitting Machine" : "মেশিন"}</label>
                <select 
                  className="w-full mt-1 border border-slate-200 rounded-lg p-2 text-slate-600 focus:outline-hidden"
                  value={knitMac} onChange={(e) => setKnitMac(e.target.value)}
                >
                  {machines.map(m => (
                    <option key={m.id} value={m.machineNo}>{m.machineNo} ({m.gauge})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-bold">{lang === "EN" ? "Buyer Order Style" : "ক্রেতার স্টাইল নং"}</label>
                <select 
                  className="w-full mt-1 border border-slate-200 rounded-lg p-2 text-slate-600 focus:outline-hidden"
                  value={knitOrder} onChange={(e) => setKnitOrder(e.target.value)}
                >
                  <option value="ORD-2026-801">STY-HM-221 (H&M Global)</option>
                  <option value="ORD-2026-802">STY-ZRA-092 (Zara Tech)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-bold">{lang === "EN" ? "Achieved Panel Qty (Today)" : "আজকের অর্জিত সংখ্যা"}</label>
                <input
                  type="number" className="w-full mt-1 border border-slate-200 rounded-lg p-2 text-slate-700"
                  value={knitQty} onChange={(e) => setKnitQty(Number(e.target.value))}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-slate-400 font-bold">{lang === "EN" ? "Downtime (Mins)" : "ডাউনটাইম"}</label>
                  <input
                    type="number" className="w-full mt-1 border border-slate-200 rounded-lg p-2 text-slate-700"
                    value={knitMinutes} onChange={(e) => setKnitMinutes(Number(e.target.value))}
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 font-bold">{lang === "EN" ? "Operator Name" : "অপারেটর"}</label>
                  <input
                    type="text" className="w-full mt-1 border border-slate-200 rounded-lg p-2 text-slate-400 bg-slate-50"
                    value="Abdul Karim" disabled
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-bold">{lang === "EN" ? "Downtime / Delay Reason" : "ডাউনটাইম এর কারণ"}</label>
                <input
                  type="text" className="w-full mt-1 border border-slate-200 rounded-lg p-2 text-slate-700"
                  placeholder="e.g. yarn tension, needle change"
                  value={knitReason} onChange={(e) => setKnitReason(e.target.value)}
                />
              </div>

              <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg py-2.5 font-bold transition shadow-sm">
                Log Yesterday's Output
              </button>
            </form>
          </div>

        </div>
      </div>
    );
  }

  // 3. STORAGE YARNS & SPEC PARTS TRACKING
  if (activeTab === "store") {
    return (
      <div className="space-y-6 animate-fade-in pr-2">
        <div>
          <h2 className="font-display font-bold text-2xl text-slate-800 tracking-tight">
            {lang === "EN" ? "Production Store Yarn & Accessory Stocks" : "স্টোর সুতা এবং এক্সেসরিজ স্টকস"}
          </h2>
          <p className="font-sans text-xs text-slate-500 mt-1">
            {lang === "EN" ? "Monitor yarn counts, color shade cards availability, and map automatic Stoll needles reorder limits." : "সুতা, নিটিং সুই, এক্সেসরিজ বিভাগীয় ইনভেন্টরি ট্র্যাকিং মনিটর।"}
          </p>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl flex flex-col space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-display font-bold text-xs uppercase text-slate-400 tracking-wider">
              {lang === "EN" ? "Store Material Master Catalog" : "স্টোর ইনভেন্টরি ক্যাটালগ"}
            </h3>
            <input
              type="text" placeholder="Search by shade code/name..."
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-600 focus:outline-hidden font-sans"
              value={storeSearch} onChange={(e) => setStoreSearch(e.target.value)}
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs divide-y divide-slate-100 font-sans">
              <thead>
                <tr className="text-slate-400 text-[10.5px] uppercase font-bold tracking-wider">
                  <th className="py-2.5">Item Code</th>
                  <th className="py-2.5">Description</th>
                  <th className="py-2.5">Category</th>
                  <th className="py-2.5">Specifications / Shade</th>
                  <th className="py-2.5">Primary Supplier</th>
                  <th className="py-2.5 text-right">In-Stock Qty</th>
                  <th className="py-2.5 text-right">Allocated Sets</th>
                  <th className="py-2.5 text-right">Reorder Limit</th>
                  <th className="py-2.5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {inventory.filter(item => item.name.toLowerCase().includes(storeSearch.toLowerCase())).map((item) => {
                  const isLow = item.currentQty <= item.reorderLevel;
                  return (
                    <tr key={item.id} className="hover:bg-slate-105 transition-colors">
                      <td className="py-3 font-mono font-bold text-slate-900">{item.itemCode}</td>
                      <td className="py-3">{item.name}</td>
                      <td className="py-3">
                        <span className="bg-slate-100 text-slate-700 text-[10px] px-2 py-0.5 rounded-full font-bold">
                          {item.category}
                        </span>
                      </td>
                      <td className="py-3 font-mono text-[10.5px] text-slate-400">{item.countOrSpec} {item.shadeNo ? `(${item.shadeNo})` : ""}</td>
                      <td className="py-3 text-slate-500 font-medium">{item.supplierName}</td>
                      <td className="py-3 text-right font-extrabold text-slate-800">{item.currentQty.toLocaleString()} {item.uom}</td>
                      <td className="py-3 text-right text-slate-400">{item.allocatedQty.toLocaleString()} {item.uom}</td>
                      <td className="py-3 text-right text-slate-400 font-mono font-semibold">{item.reorderLevel.toLocaleString()} {item.uom}</td>
                      <td className="py-3 text-center">
                        {isLow ? (
                          <span className="bg-rose-50 text-rose-600 border border-rose-100 text-[8.5px] font-extrabold px-1.5 py-0.5 rounded-full uppercase">
                            Low Stock
                          </span>
                        ) : (
                          <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 text-[8.5px] font-extrabold px-1.5 py-0.5 rounded-full uppercase">
                            Healthy Stock
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // 4. DOUBLE ENTRY JOURNAL VOUCHERS POSTING
  if (activeTab === "finance") {
    return (
      <div className="space-y-6 animate-fade-in pr-2">
        <div>
          <h2 className="font-display font-bold text-2xl text-slate-800 tracking-tight">
            {lang === "EN" ? "Double-Entry General ledger & Accounts" : "ডাবল-এন্ট্রি হিসাব খাতা ও ভাউচার"}
          </h2>
          <p className="font-sans text-xs text-slate-500 mt-1">
            {lang === "EN" ? "Audit company liabilities, post journal vouchers, verify buyer revenue collection schedules." : "প্রতিষ্ঠানের সামগ্রিক অডিট ট্রেইল এবং আইনী দ্বিপাক্ষিক হিসাব ভাউচার পোস্টিং গেটওয়ে।"}
          </p>
        </div>

        {pMsg && (
          <div className="bg-slate-900 border border-indigo-950 text-emerald-400 p-3.5 rounded-xl text-xs font-semibold font-sans animate-fade-in">
            {pMsg}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Active ledger balances (2 columns) */}
          <div className="lg:col-span-2 bg-white border border-slate-200 p-5 rounded-2xl space-y-4">
            
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-display font-bold text-xs uppercase text-slate-400 tracking-wider">
                {lang === "EN" ? "Real-time Chart of Accounts Ledger" : "চার্ট অফ অ্যাকাউন্টস ব্যালেন্স"}
              </h3>
              <input
                type="text" placeholder="Filter Ledger..."
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-600 focus:outline-hidden font-sans"
                value={financeSearch} onChange={(e) => setFinanceSearch(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {accounts.filter(a => a.name.toLowerCase().includes(financeSearch.toLowerCase())).map((acc) => (
                <div key={acc.code} className="p-3 border border-slate-200 bg-slate-50/50 rounded-xl flex justify-between items-start">
                  <div>
                    <span className="font-mono text-[10px] text-slate-400 font-bold leading-none">{acc.code}</span>
                    <h4 className="font-sans font-bold text-[11.5px] text-slate-700 mt-1">{acc.name}</h4>
                    <p className="font-mono text-[9.5px] text-slate-400 uppercase tracking-widest mt-0.5">{acc.group}</p>
                  </div>
                  <span className="font-display font-bold text-slate-800 text-xs">
                    ৳{acc.balance.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            {/* General Journal ledger */}
            <h3 className="font-display font-medium text-xs text-slate-800 pt-4 mb-2">
              General Posted Journal Ledger Vouchers
            </h3>
            <div className="space-y-3">
              {vouchers.map((v) => (
                <div key={v.id} className="p-3.5 rounded-xl border border-slate-200/80 bg-white space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2.5">
                      <span className="font-mono font-bold text-xs text-indigo-700">{v.voucherNo}</span>
                      <span className="text-[10px] text-slate-400">{v.date}</span>
                    </div>
                    <span className="bg-slate-100 text-slate-600 font-mono text-[9px] font-bold px-2 py-0.5 rounded-full">
                      {v.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium italic">Narration: {v.narration}</p>
                  
                  {/* Voucher entries inside */}
                  <div className="bg-slate-50 border border-slate-200/50 rounded-lg p-2.5 divide-y divide-slate-100">
                    {v.items.map((line, idx) => (
                      <div key={idx} className="py-1.5 flex justify-between text-[11.5px] font-mono">
                        <div className="flex items-center space-x-1.5 text-slate-600">
                          {line.debit > 0 ? <Plus size={11} className="text-emerald-500" /> : <Plus size={11} className="text-slate-300 opacity-0" />}
                          <span>[{line.accountCode}] {line.accountName}</span>
                        </div>
                        <div className="flex space-x-4">
                          <span className={line.debit > 0 ? "text-emerald-600 font-bold" : "text-slate-300"}>
                            {line.debit > 0 ? `৳${line.debit.toLocaleString()}` : ""}
                          </span>
                          <span className={line.credit > 0 ? "text-indigo-600 font-bold" : "text-slate-300"}>
                            {line.credit > 0 ? `৳${line.credit.toLocaleString()}` : ""}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 font-mono">
                    <span>Approved by executive auditor</span>
                    <span>Operator: {v.createdBy}</span>
                  </div>
                </div>
              ))}
            </div>

          </div>

          {/* Quick Double-Entry Poster Panel */}
          <div className="bg-white border border-slate-200 p-5 rounded-2xl h-fit">
            <h4 className="font-display font-bold text-xs uppercase text-slate-400 tracking-wider mb-4">
              {lang === "EN" ? "Post Double-Entry Journal Voucher" : "ভাউচার পোস্টিং প্যানেল"}
            </h4>

            <form onSubmit={handleCreateVoucher} className="space-y-4 font-sans text-xs">
              
              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">{lang === "EN" ? "Debit Account Link (Dr)" : "ডেবিট হিসাব লিংক"}</label>
                <select 
                  className="w-full mt-1 border border-slate-200 rounded-lg p-2 text-slate-600 focus:outline-hidden"
                  value={debitAcc} onChange={(e) => setDebitAcc(e.target.value)}
                >
                  <option value="5001">5001 - Yarn Material Consumption Expense</option>
                  <option value="5002">5002 - Factory Floor Labor Wages Expense</option>
                  <option value="5003">5003 - Utility, Steam & Electricity Bills</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">{lang === "EN" ? "Credit offsetting link (Cr)" : "ক্রেডিট হিসাব লিংক"}</label>
                <select 
                  className="w-full mt-1 border border-slate-200 rounded-lg p-2 text-slate-600 focus:outline-hidden"
                  value={creditAcc} onChange={(e) => setCreditAcc(e.target.value)}
                >
                  <option value="1001">1001 - Cash in Hand (Corporate Office)</option>
                  <option value="1101">1101 - Dutch-Bangla Bank Acc (Salaries)</option>
                  <option value="1102">1102 - BRAC Bank Acc (Buyer Receipts)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-bold">{lang === "EN" ? "Transacted Value (BDT)" : "লেনদেন মূল্য (টাকা)"}</label>
                <input
                  type="number" className="w-full mt-1 border border-slate-200 rounded-lg p-2 text-slate-700"
                  value={vAmt} onChange={(e) => setVAmt(Number(e.target.value))}
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-bold">{lang === "EN" ? "Accounts Voucher Rationale / Narration" : "ভাউচার কারণ / বিবরণ"}</label>
                <input
                  type="text" required className="w-full mt-1 border border-slate-200 rounded-lg p-2 text-slate-700"
                  placeholder="e.g. yarn reels allocation, employee lunch bills"
                  value={vNarration} onChange={(e) => setVNarration(e.target.value)}
                />
              </div>

              <button type="submit" className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg py-2.5 font-bold hover:bg-slate-950 transition shadow-sm">
                Post Journal Voucher (JV)
              </button>
            </form>
          </div>

        </div>
      </div>
    );
  }

  // 5. MASTER COMPANY SETTINGS SETUP
  if (activeTab === "company-setup") {
    return (
      <div className="space-y-6 animate-fade-in pr-2">
        <div>
          <h2 className="font-display font-bold text-2xl text-slate-800 tracking-tight">
            {lang === "EN" ? "Master Factory Setup Parameters" : "কোম্পানি ও ফ্যাক্টরি মাস্টার সেটআপ"}
          </h2>
          <p className="font-sans text-xs text-slate-500 mt-1">
            {lang === "EN" ? "Configure plant designations, grade scales, shift codes, and corporate identifiers." : "ফ্যাক্টরি লাইন কোড, পদবী তালিকা, ওভারটাইম নীতি এবং উইকেন্ড সেটআপ স্ক্রিন।"}
          </p>
        </div>

        {pMsg && (
          <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-xl text-emerald-800 text-xs font-semibold">
            {pMsg}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* General settings form (2 columns) */}
          <div className="lg:col-span-2 bg-white border border-slate-200 p-5 rounded-2xl space-y-4">
            <h3 className="font-display font-bold text-xs uppercase text-slate-400 tracking-wider mb-2">
              OTTOMASS JACQUARD Plant Corporate Snapshot
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
              <div>
                <label className="font-sans text-[11px] text-slate-400 font-medium">Primary Company Title (EN)</label>
                <input type="text" className="w-full mt-1 border border-slate-200 rounded-lg p-2 text-slate-700" value={cName} onChange={(e) => setCName(e.target.value)} />
              </div>
              <div>
                <label className="font-sans text-[11px] text-slate-400 font-medium">Primary Company Title (BN)</label>
                <input type="text" className="w-full mt-1 border border-slate-200 rounded-lg p-2 text-slate-700" value={cBangla} onChange={(e) => setCBangla(e.target.value)} />
              </div>
              <div>
                <label className="font-sans text-[11px] text-slate-400 font-medium">Head Office Phone Contact</label>
                <input type="text" className="w-full mt-1 border border-slate-200 rounded-lg p-2 text-slate-700" value={cPhone} onChange={(e) => setCPhone(e.target.value)} />
              </div>
              <div>
                <label className="font-sans text-[11px] text-slate-400 font-medium">Plant Corporate Address</label>
                <input type="text" className="w-full mt-1 border border-slate-200 rounded-lg p-2 text-slate-700" value={cAddress} onChange={(e) => setCAddress(e.target.value)} />
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4 flex justify-end">
              <button 
                onClick={() => {
                  setPMsg("✅ Master Company parameters cataloged securely!");
                  setTimeout(() => setPMsg(""), 3000);
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition shadow-sm"
              >
                Save Corporate Settings
              </button>
            </div>
          </div>

          {/* Plant lines / grids layout */}
          <div className="bg-white border border-slate-200 p-5 rounded-2xl text-xs space-y-4">
            <h4 className="font-display font-bold text-xs uppercase text-slate-400 tracking-wider">
              Plant Line & Shift Setup
            </h4>

            <div className="space-y-3 font-semibold text-slate-700">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <p className="font-bold text-slate-800">Shifts Setup</p>
                <p className="text-[10px] text-slate-400 mt-1">Day Shift: 08:00 AM - 05:00 PM (1h break)</p>
                <p className="text-[10px] text-slate-400">Night Shift: 08:30 PM - 05:30 AM (1h break)</p>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <p className="font-bold text-slate-800">Active Knitting Lines</p>
                <p className="text-[10.5px] text-slate-500 mt-1">Line-A1: Stoll Computers 1 to 10 (12GG)</p>
                <p className="text-[10.5px] text-slate-500">Line-A2: Stoll Computers 11 to 20 (12GG)</p>
                <p className="text-[10.5px] text-slate-500">Line-B1: Shima Seiki Machines 1 to 8 (7GG)</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    );
  }

  // 6. SYSTEM AUDIT LOGS SECURITY
  if (activeTab === "audit-log") {
    return (
      <div className="space-y-6 animate-fade-in pr-2">
        <div>
          <h2 className="font-display font-bold text-2xl text-slate-800 tracking-tight">
            {lang === "EN" ? "Security Audit & System Events logs" : "সিস্টেম সিকিউরিটি ও অডিট লগ বিবরণী"}
          </h2>
          <p className="font-sans text-xs text-slate-500 mt-1">
            {lang === "EN" ? "Review biometric mapping changes, login IP signatures, and manual salary recalculation override parameters." : "আরএফআইডি পরিবর্তন, ডেটা মডিফিকেশন এবং লগইন নিরাপত্তা ট্র্যাকিং সেল।"}
          </p>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold text-xs uppercase text-slate-400 tracking-wider">
              Zero-Trust Audit Trail Logs
            </h3>
            <span className="bg-rose-50 text-rose-600 font-mono text-[9.5px] font-bold px-2 py-0.5 rounded-full uppercase">
              System Hardened Active
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs divide-y divide-slate-100 font-mono">
              <thead>
                <tr className="text-slate-400 text-[10px] uppercase font-semibold pb-2">
                  <th className="py-2">Datetime Event</th>
                  <th className="py-2">Client IP</th>
                  <th className="py-2">System Action Tag</th>
                  <th className="py-2">Log Payload Specification</th>
                  <th className="py-2 text-center">Status Security</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-600">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 text-slate-400 font-semibold">{log.timer}</td>
                    <td className="py-3 text-slate-700 font-bold">{log.ip}</td>
                    <td className="py-3 font-semibold text-slate-900">{log.action}</td>
                    <td className="py-3 text-slate-500 font-sans text-xs max-w-[200px] truncate">{log.payload}</td>
                    <td className="py-3 text-center">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[9px] font-bold rounded">
                        {log.status}
                      </span>
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

  // Failsafe empty slate
  return (
    <div className="p-8 text-center text-slate-400">
      <Building2 size={36} className="text-slate-300 mx-auto mb-2" />
      <p className="font-sans text-sm">Module structure aligns with current active Phase development schedules.</p>
    </div>
  );
}
