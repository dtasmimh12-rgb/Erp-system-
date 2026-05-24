import React, { useState } from "react";
import { 
  UserCheck2, 
  ClipboardList, 
  Check, 
  X, 
  Calendar, 
  AlertCircle, 
  ShoppingBag, 
  Plus, 
  Award,
  BookOpen,
  PieChart,
  UserPlus,
  PlusCircle,
  FileSpreadsheet,
  Download,
  Printer,
  CheckCircle2
} from "lucide-react";
import { LeaveApplication, Employee } from "../types";

interface HRDashboardProps {
  leaves: LeaveApplication[];
  onApproveLeave: (id: string) => void;
  onRejectLeave: (id: string) => void;
  onAddLeave: (leave: LeaveApplication) => void;
  employees: Employee[];
  lang: "EN" | "BN";
}

export default function HRDashboard({ 
  leaves, 
  onApproveLeave, 
  onRejectLeave, 
  onAddLeave,
  employees, 
  lang 
}: HRDashboardProps) {
  // Navigation inside HR Dashboard
  const [hrSubTab, setHrSubTab] = useState<"requests" | "apply" | "balances" | "kpis">("requests");
  
  const [filterType, setFilterType] = useState("All");
  
  // Apply Leave form states
  const [applyEmpId, setApplyEmpId] = useState("");
  const [leaveType, setLeaveType] = useState<"Casual Leave" | "Sick Leave" | "Earned Leave" | "Maternity Leave" | "Without Pay">("Casual Leave");
  const [startDate, setStartDate] = useState("2026-05-23");
  const [endDate, setEndDate] = useState("2026-05-25");
  const [leaveReason, setLeaveReason] = useState("");
  const [applyStatus, setApplyStatus] = useState("");

  // KPI evaluation state variables
  const [evalName, setEvalName] = useState("");
  const [kpiScore, setKpiScore] = useState(85);
  const [evalNote, setEvalNote] = useState("");
  const [evalList, setEvalList] = useState([
    { id: 1, name: "Abdul Karim", role: "Knit Operator", score: 92, status: "Recommended Increment", note: "Outstanding Stoll output and shift hours regularity." },
    { id: 2, name: "Nazma Begum", role: "Linking Mender", score: 88, status: "Recommended Promotion", note: "Shows leadership qualities on Line-B2 assembly." }
  ]);

  // Handle registering a new employee leave request
  const handleApplyLeaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!applyEmpId || !startDate || !endDate) return;

    const emp = employees.find(v => v.employeeId === applyEmpId);
    if (!emp) return;

    // Calculate total days
    const sDate = new Date(startDate);
    const eDate = new Date(endDate);
    const diffTime = Math.abs(eDate.getTime() - sDate.getTime());
    const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    const newLeave: LeaveApplication = {
      id: `appl-${Date.now()}`,
      employeeId: emp.employeeId,
      employeeName: emp.name,
      leaveType,
      startDate,
      endDate,
      totalDays,
      reason: leaveReason || "Personal reasons formulated under compliance standard.",
      status: "Pending",
      appliedAt: new Date().toISOString()
    };

    onAddLeave(newLeave);
    setApplyEmpId("");
    setLeaveReason("");
    setApplyStatus(`Success: Leave application filed for ${emp.name} (${totalDays} Days)`);
    setTimeout(() => setApplyStatus(""), 4500);
  };

  // KPI Eval Handler
  function handleAddEval(e: React.FormEvent) {
    e.preventDefault();
    if (!evalName) return;

    setEvalList([{
      id: Date.now(),
      name: evalName,
      role: "Knit Specialist",
      score: kpiScore,
      status: kpiScore >= 90 ? "Recommended Increment" : kpiScore >= 80 ? "Recommended Confirmation" : "Under Probation Review",
      note: evalNote || "Standard performance evaluation profile logged."
    }, ...evalList]);

    setEvalName("");
    setKpiScore(85);
    setEvalNote("");
  }

  // Get dynamic leave stats per employee: Casual (10 total allowance), Sick (14 total), Earned (18 total)
  const calculateLeaveBalances = (employeeId: string) => {
    const approvedLogs = leaves.filter(l => l.employeeId === employeeId && l.status === "Approved");
    
    const casualUsed = approvedLogs.filter(l => l.leaveType === "Casual Leave").reduce((sum, item) => sum + item.totalDays, 0);
    const sickUsed = approvedLogs.filter(l => l.leaveType === "Sick Leave").reduce((sum, item) => sum + item.totalDays, 0);
    const earnedUsed = approvedLogs.filter(l => l.leaveType === "Earned Leave").reduce((sum, item) => sum + item.totalDays, 0);

    return {
      casualAlloc: 10,
      casualUsed,
      casualLeft: Math.max(0, 10 - casualUsed),
      
      sickAlloc: 14,
      sickUsed,
      sickLeft: Math.max(0, 14 - sickUsed),
      
      earnedAlloc: 18,
      earnedUsed,
      earnedLeft: Math.max(0, 18 - earnedUsed)
    };
  };

  // CSV Exporter for Leave records
  const handleExportLeavesCSV = () => {
    const headers = "Employee ID,Name,Leave Type,Start Date,End Date,Days,Status,Rationals\n";
    const rows = leaves.map(l =>
      `"${l.employeeId}","${l.employeeName}","${l.leaveType}","${l.startDate}","${l.endDate}",${l.totalDays},"${l.status}","${l.reason}"`
    ).join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "OTTOMASS_Leave_Registry_Statement.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Generate Excel / Spreadsheet format
  const handleExportLeavesExcel = () => {
    let html = "<table><thead><tr><th>Employee ID</th><th>Employee Name</th><th>Leave Type</th><th>Start Date</th><th>End Date</th><th>Total Days</th><th>Status</th></tr></thead><tbody>";
    leaves.forEach(l => {
      html += `<tr><td>${l.employeeId}</td><td>${l.employeeName}</td><td>${l.leaveType}</td><td>${l.startDate}</td><td>${l.endDate}</td><td>${l.totalDays}</td><td>${l.status}</td></tr>`;
    });
    html += "</tbody></table>";

    const blob = new Blob([html], { type: "application/vnd.ms-excel" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "OTTOMASS_Leaves_Balances_Sheet.xls");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredLeaves = leaves.filter(l => filterType === "All" || l.leaveType === filterType);

  return (
    <div className="space-y-6 animate-fade-in pr-2 pb-12">
      
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 no-print">
        <div>
          <h2 className="font-display font-bold text-2xl text-slate-800 tracking-tight">
            {lang === "EN" ? "HR & Employee Leave Operations Hub" : "মানবসম্পদ ও ছুটি মঞ্জুরি সেল"}
          </h2>
          <p className="font-sans text-xs text-slate-500 mt-1">
            {lang === "EN" ? "Audit worker leaves balances, submit new applications, authorize pending requests, and track KPI evaluations." : "কর্মচারীদের ছুটির আবেদন মঞ্জুর করুন, অবশিষ্ট ছুটি ট্র্যাক করুন এবং পারফরম্যান্স মূল্যায়ন রেকর্ড করুন।"}
          </p>
        </div>

        {/* Global stats */}
        <div className="flex items-center space-x-2">
          <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl font-sans text-xs text-center min-w-[100px]">
            <p className="text-slate-400 font-bold uppercase text-[9px] tracking-wider">Active Pending</p>
            <p className="font-mono font-bold text-indigo-700 text-sm mt-0.5">
              {leaves.filter(l => l.status === "Pending").length} Files
            </p>
          </div>
          <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl font-sans text-xs text-center min-w-[100px]">
            <p className="text-slate-400 font-bold uppercase text-[9px] tracking-wider">Approved Leaves</p>
            <p className="font-mono font-bold text-emerald-700 text-sm mt-0.5">
              {leaves.filter(l => l.status === "Approved").length} requests
            </p>
          </div>
        </div>
      </div>

      {/* Internal Navigation Subtabs */}
      <div className="flex space-x-1 p-1 bg-slate-100/80 rounded-xl no-print">
        <button
          onClick={() => setHrSubTab("requests")}
          className={`flex items-center space-x-2 px-4 py-2 text-xs font-bold rounded-lg transition-all ${hrSubTab === "requests" ? "bg-white text-indigo-600 shadow-xs" : "text-slate-500 hover:text-slate-700"}`}
        >
          <ClipboardList size={13} />
          <span>{lang === "EN" ? "Pending Leave Requests" : "আবেদন মঞ্জুর সেল"}</span>
        </button>

        <button
          onClick={() => setHrSubTab("apply")}
          className={`flex items-center space-x-2 px-4 py-2 text-xs font-bold rounded-lg transition-all ${hrSubTab === "apply" ? "bg-white text-indigo-600 shadow-xs" : "text-slate-500 hover:text-slate-700"}`}
        >
          <PlusCircle size={13} />
          <span>{lang === "EN" ? "New Leave Application" : "ছুটির জন্য নতুন আবেদন"}</span>
        </button>

        <button
          onClick={() => setHrSubTab("balances")}
          className={`flex items-center space-x-2 px-4 py-2 text-xs font-bold rounded-lg transition-all ${hrSubTab === "balances" ? "bg-white text-indigo-600 shadow-xs" : "text-slate-500 hover:text-slate-700"}`}
        >
          <PieChart size={13} />
          <span>{lang === "EN" ? "Leave Balance ledger" : "অবশিষ্ট ছুটির খাতা"}</span>
        </button>

        <button
          onClick={() => setHrSubTab("kpis")}
          className={`flex items-center space-x-2 px-4 py-2 text-xs font-bold rounded-lg transition-all ${hrSubTab === "kpis" ? "bg-white text-indigo-600 shadow-xs" : "text-slate-500 hover:text-slate-700"}`}
        >
          <Award size={13} />
          <span>{lang === "EN" ? "Wages & KPI merit Ratings" : "পারফরম্যান্স মূল্যায়ন"}</span>
        </button>
      </div>

      {/* VIEW CHUNKS */}

      {/* 1. LEAVE APPLICATIONS LIST */}
      {hrSubTab === "requests" && (
        <div className="bg-white border border-slate-200 p-5 rounded-2xl flex flex-col justify-between space-y-4">
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2.5 sm:space-y-0 no-print">
            <h3 className="font-display font-medium text-xs text-slate-400 tracking-wider uppercase">
              {lang === "EN" ? "Active Leave Applications Workflow" : "ছুটির আবেদন অনুমোদন অনুক্রম"}
            </h3>

            <div className="flex space-x-1.5 p-1 bg-slate-150/50 rounded-lg">
              {["All", "Casual Leave", "Sick Leave", "Earned Leave"].map((t) => (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  className={`px-3 py-1 text-[10px] font-bold rounded-md transition ${filterType === t ? "bg-white text-indigo-700 shadow-xs" : "text-slate-500 hover:text-slate-700"}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs divide-y divide-slate-100 font-sans print:text-[11px]">
              <thead>
                <tr className="text-slate-400 text-[10.5px] uppercase font-bold tracking-wider pt-2 border-b border-slate-101 print:text-black">
                  <th className="py-2.5">{lang === "EN" ? "Employee Details" : "কর্মচারীর তথ্য"}</th>
                  <th className="py-2.5">{lang === "EN" ? "Leave Particulars" : "ছুটির বিবরণ"}</th>
                  <th className="py-2.5">{lang === "EN" ? "Rationale" : "কারণ"}</th>
                  <th className="py-2.5 text-center">{lang === "EN" ? "Status" : "অবস্থা"}</th>
                  <th className="py-2.5 text-center no-print">{lang === "EN" ? "Decision Gates" : "সিদ্ধান্ত"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredLeaves.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50/50 transition-colors print:hover:bg-transparent">
                    <td className="py-3.5">
                      <p className="font-bold text-slate-800 print:text-black">{l.employeeName}</p>
                      <p className="text-[10px] text-slate-450 font-mono mt-0.5">OJ ID: {l.employeeId}</p>
                    </td>
                    <td className="py-3.5">
                      <div>
                        <span className="text-slate-800 font-bold">{l.leaveType}</span>
                        <p className="text-[10px] text-slate-400 mt-1 flex items-center space-x-1 print:text-black">
                          <Calendar size={10} />
                          <span>{l.startDate} to {l.endDate} ({l.totalDays} Days)</span>
                        </p>
                      </div>
                    </td>
                    <td className="py-3.5 max-w-[200px] truncate text-slate-605 text-[11px]" title={l.reason}>
                      {l.reason}
                    </td>
                    <td className="py-3.5 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                        l.status === "Approved" 
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
                          : l.status === "Rejected" 
                            ? "bg-rose-50 text-rose-700 border border-rose-100" 
                            : "bg-amber-50 text-amber-700 border border-amber-100"
                      } print:border`}>
                        {l.status}
                      </span>
                    </td>
                    <td className="py-3.5 text-center no-print">
                      {l.status === "Pending" ? (
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => onApproveLeave(l.id)}
                            className="p-1.5 px-2.5 text-[10px] font-bold bg-emerald-55/10 text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition flex items-center space-x-0.5"
                          >
                            <Check size={11} />
                            <span>{lang === "EN" ? "Approve" : "মঞ্জুর"}</span>
                          </button>
                          <button
                            onClick={() => onRejectLeave(l.id)}
                            className="p-1.5 px-2.5 text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-200 rounded-lg hover:bg-rose-100 transition flex items-center space-x-0.5"
                          >
                            <X size={11} />
                            <span>{lang === "EN" ? "Reject" : "বাতিল"}</span>
                          </button>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-mono italic">Decision Finalized</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredLeaves.length === 0 && (
              <p className="text-center italic text-slate-400 py-12 text-xs">No matching leave apps registered.</p>
            )}
          </div>
        </div>
      )}

      {/* 2. FILE NEW LEAVE SUBMISSION FORM */}
      {hrSubTab === "apply" && (
        <div className="bg-white border border-slate-200 p-5 rounded-2xl space-y-4 no-print">
          <h3 className="font-display font-medium text-slate-800 text-sm">
            Filing Corporate Leave Request
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Apply for formal paid or unpaid days off (Casual Leave, Sick Leave, Earned Leave) linked directly to compliance records in the registry.
          </p>

          <form onSubmit={handleApplyLeaveSubmit} className="space-y-4 max-w-xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] text-slate-450 font-bold uppercase tracking-wider mb-1">Select Employee</label>
                <select
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-700 focus:outline-hidden"
                  value={applyEmpId}
                  onChange={(e) => setApplyEmpId(e.target.value)}
                  required
                >
                  <option value="">-- Select Employee --</option>
                  {employees.map(e => (
                    <option key={e.id} value={e.employeeId}>{e.name} ({e.employeeId})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-slate-450 font-bold uppercase tracking-wider mb-1">Leave Category / Class</label>
                <select
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-700 focus:outline-hidden"
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value as any)}
                  required
                >
                  <option value="Casual Leave">Casual Leave (Standard annual quota: 10d)</option>
                  <option value="Sick Leave">Sick Leave (Standard annual quota: 14d)</option>
                  <option value="Earned Leave">Earned Leave (Standard annual quota: 18d)</option>
                  <option value="Maternity Leave">Maternity Leave (Special paid period)</option>
                  <option value="Without Pay">Without Pay (Unpaid absence cutout)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-slate-455 font-bold uppercase tracking-wider mb-1">Leaves Start Date</label>
                <input 
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-750 focus:outline-hidden font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-455 font-bold uppercase tracking-wider mb-1">Leaves End Date (Inclusive)</label>
                <input 
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-750 focus:outline-hidden font-mono"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] text-slate-450 font-bold uppercase tracking-wider mb-1">Rationale / Supervisor Comments</label>
              <input 
                type="text"
                value={leaveReason}
                onChange={(e) => setLeaveReason(e.target.value)}
                placeholder="e.g. Out of station due to home village visits or personal medical constraints."
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-700 focus:outline-hidden"
                required
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white hover:text-white rounded-xl text-xs font-bold transition-colors"
              >
                File and Submit Application
              </button>
            </div>
          </form>

          {applyStatus && (
            <div className="p-4 bg-emerald-50 border border-emerald-150 text-emerald-800 text-xs rounded-xl flex items-center space-x-2">
              <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
              <span>{applyStatus}</span>
            </div>
          )}
        </div>
      )}

      {/* 3. LEAVE BALANCE STATEMENT LEDGER */}
      {hrSubTab === "balances" && (
        <div className="bg-white border border-slate-200 p-5 rounded-2xl flex flex-col space-y-4">
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0 no-print">
            <div>
              <h3 className="font-display font-medium text-slate-800 text-sm">
                Employee Holiday and Paid Leave remaining quota
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Audit worker compliance guidelines. General Bangladesh rules allot 10 days Casual, 14 days Sick, and 18 days Earned Leaves per year.
              </p>
            </div>

            {/* Print and Export commands */}
            <div className="flex space-x-2">
              <button
                onClick={() => window.print()}
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-750 text-xs font-bold rounded-lg border border-slate-200 transition flex items-center space-x-1"
              >
                <Printer size={12} />
                <span>Print Balances</span>
              </button>

              <button
                onClick={handleExportLeavesCSV}
                className="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-lg border border-indigo-200 transition flex items-center space-x-1"
              >
                <Download size={12} />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto pt-2">
            <table className="w-full text-left text-xs divide-y divide-slate-100 font-sans print:text-[11px]">
              <thead>
                <tr className="text-slate-400 text-[10px] uppercase font-bold tracking-wider pt-2 border-b border-slate-100 print:text-black">
                  <th className="py-2.5">Emp ID</th>
                  <th className="py-2.5">Name</th>
                  <th className="py-2.5">Designation / dept</th>
                  <th className="py-2.5 text-center font-semibold">Casual (Left/Alloc)</th>
                  <th className="py-2.5 text-center font-semibold">Sick (Left/Alloc)</th>
                  <th className="py-2.5 text-center font-semibold">Earned (Left/Alloc)</th>
                  <th className="py-2.5 text-center font-bold">Total Approved taken</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-755">
                {employees.map(emp => {
                  const b = calculateLeaveBalances(emp.employeeId);
                  const totalTaken = b.casualUsed + b.sickUsed + b.earnedUsed;
                  return (
                    <tr key={emp.id} className="hover:bg-slate-50 transition-colors print:hover:bg-transparent">
                      <td className="py-3 font-mono font-bold text-slate-800 print:text-black">{emp.employeeId}</td>
                      <td className="py-3 font-bold text-slate-850 print:text-black">{emp.name}</td>
                      <td className="py-3">
                        <p className="text-slate-500 font-medium">{emp.designation}</p>
                        <p className="text-[10px] text-slate-400 font-bold">{emp.department}</p>
                      </td>
                      <td className="py-3 text-center">
                        <span className="font-mono text-slate-850 font-bold">{b.casualLeft}</span>
                        <span className="text-slate-400"> / {b.casualAlloc}d</span>
                      </td>
                      <td className="py-3 text-center">
                        <span className="font-mono text-slate-850 font-bold">{b.sickLeft}</span>
                        <span className="text-slate-400"> / {b.sickAlloc}d</span>
                      </td>
                      <td className="py-3 text-center">
                        <span className="font-mono text-slate-850 font-bold">{b.earnedLeft}</span>
                        <span className="text-slate-400"> / {b.earnedAlloc}d</span>
                      </td>
                      <td className="py-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                          totalTaken > 10 ? "bg-rose-50 text-rose-700" : "bg-indigo-50 text-indigo-705"
                        } print:border`}>
                          {totalTaken} Days taken
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. PERFORMANCE RATINGS EVALUATIONS */}
      {hrSubTab === "kpis" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 no-print">
          <div className="bg-white border border-slate-200 p-5 rounded-2xl flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <h4 className="font-display font-medium text-xs uppercase text-slate-400 tracking-wider">
                  {lang === "EN" ? "KPI Probation & Merit Evaluation" : "কর্মদক্ষতা মূল্যায়ন ও ইনক্রিমেন্ট"}
                </h4>
                <Award size={15} className="text-indigo-650" />
              </div>

              {/* Logging form */}
              <form onSubmit={handleAddEval} className="mt-4 p-4 bg-slate-50 border border-slate-200/60 rounded-xl space-y-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase font-mono">{lang === "EN" ? "Employee Name" : "কর্মচারীর নাম"}</label>
                  <select 
                    className="w-full mt-1 bg-white border border-slate-200 rounded-lg p-1.5 text-xs text-slate-700 focus:outline-hidden"
                    value={evalName}
                    onChange={(e) => setEvalName(e.target.value)}
                    required
                  >
                    <option value="">{lang === "EN" ? "Select worker..." : "নির্বাচন করুন..."}</option>
                    {employees.map(e => (
                      <option key={e.id} value={e.name}>{e.name} ({e.designation})</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase font-mono">{lang === "EN" ? "Score (1-100)" : "স্কোর (১-১০০)"}</label>
                    <input
                      type="number" min="1" max="100"
                      className="w-full mt-1 bg-white border border-slate-200 rounded-lg p-1.5 text-xs text-slate-700 focus:outline-hidden"
                      value={kpiScore}
                      onChange={(e) => setKpiScore(Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase font-mono">{lang === "EN" ? "Shift Regularity" : "নিয়মিত শিফট"}</label>
                    <select className="w-full mt-1 bg-white border border-slate-200 rounded-lg p-1.5 text-xs text-slate-600 focus:outline-hidden">
                      <option>Regular</option>
                      <option>Minor Late</option>
                      <option>Frequent Late</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase font-mono">{lang === "EN" ? "Supervisor Appraisal" : "সুপারভাইজার মন্তব্য"}</label>
                  <input
                    type="text" placeholder="Regularity and outputs appraisal..."
                    className="w-full mt-1 bg-white border border-slate-200 rounded-lg p-1.5 text-xs text-slate-700 focus:outline-hidden"
                    value={evalNote}
                    onChange={(e) => setEvalNote(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white hover:text-white rounded-lg text-xs font-bold transition shadow-sm"
                >
                  {lang === "EN" ? "Log KPI Evaluation Record" : "রুল রেকর্ড সংরক্ষণ করুন"}
                </button>
              </form>
            </div>
          </div>

          {/* List of evaluation records */}
          <div className="lg:col-span-2 space-y-2 max-h-[350px] overflow-y-auto pr-1">
            {evalList.map((ev) => (
              <div key={ev.id} className="p-3.5 rounded-xl border border-slate-200/80 bg-white shadow-xs">
                <div className="flex justify-between items-start">
                  <div>
                    <h5 className="font-sans font-bold text-xs text-slate-800">{ev.name}</h5>
                    <p className="font-mono text-[9.5px] text-slate-400 mt-0.5 font-bold">{ev.role}</p>
                  </div>
                  <span className={`font-mono text-[10px] font-extrabold px-2 py-0.5 rounded ${
                    ev.score >= 90 ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-sky-50 text-sky-700 border border-sky-100"
                  }`}>
                    {ev.score}/100 Score
                  </span>
                </div>
                <div className="mt-2 text-[10.5px] flex justify-between items-center text-slate-500 font-semibold leading-relaxed">
                  <span className="text-indigo-600 uppercase tracking-tight font-extrabold">{ev.status}</span>
                  <span className="text-slate-400 max-w-[200px] truncate">{ev.note}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
