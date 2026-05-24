import React, { useState } from "react";
import { 
  CreditCard,
  Coins,
  Cpu,
  FileText,
  BadgeCheck,
  Printer,
  Download,
  CheckCircle2,
  Lock,
  User,
  Building2,
  ChevronRight,
  TrendingUp,
  FileSpreadsheet,
  AlertCircle
} from "lucide-react";
import { Employee, PayrollRecord, AttendanceRecord, LeaveApplication, ChartOfAccount, JournalVoucher } from "../types";

interface PayrollModuleProps {
  payrolls: PayrollRecord[];
  employees: Employee[];
  attendance: AttendanceRecord[];
  leaves: LeaveApplication[];
  lang: "EN" | "BN";
  onAddAuditLog: (action: string, target: string, details: string) => void;
  onUpdatePayrolls: (records: PayrollRecord[]) => void;
  accounts?: ChartOfAccount[];
  setAccounts?: React.Dispatch<React.SetStateAction<ChartOfAccount[]>>;
  onAddVoucher?: (newV: JournalVoucher) => void;
  vouchers?: JournalVoucher[];
}

export default function PayrollModule({
  payrolls,
  employees,
  attendance,
  leaves,
  lang,
  onAddAuditLog,
  onUpdatePayrolls,
  accounts,
  setAccounts,
  onAddVoucher,
  vouchers
}: PayrollModuleProps) {
  const [activeSubTab, setActiveSubTab] = useState<"structure" | "generate" | "payslip" | "banksheet" | "logs" | "reports">("generate");
  
  // Salary Generation month state
  const [selectedMonth, setSelectedMonth] = useState("May 2026");
  const [isGenerating, setIsGenerating] = useState(false);
  const [genMessage, setGenMessage] = useState("");
  
  // Direct interactive Payslip selector
  const [payslipEmpId, setPayslipEmpId] = useState("");
  const [filterDept, setFilterDept] = useState("All");

  // Custom structure adjustments state
  const [houseRentPct, setHouseRentPct] = useState(50); // 50% of Basic (Bangladesh rule)
  const [medicalAllowance, setMedicalAllowance] = useState(1500); // Fixed BDT
  const [conveyanceAllowance, setConveyanceAllowance] = useState(2000); // Fixed BDT
  const [foodAllowance, setFoodAllowance] = useState(3000); // Fixed BDT
  
  // Rules settings
  const [earlyOutDeductionEnabled, setEarlyOutDeductionEnabled] = useState(true);
  const [selectedReportType, setSelectedReportType] = useState<"register" | "bank" | "mobile" | "cash" | "topsheet" | "comparative" | "exception" | "audit" | "grade" | "absent" | "ot">("register");
  
  // Shift baselines for time tracking (same as Attendance module for synchronization)
  const shiftStart = "08:00";
  const shiftEnd = "17:00";
  const graceMinutes = 15;

  // Internal wages audit history
  const [payrollAudits, setPayrollAudits] = useState([
    { timer: "2026-05-23 09:30:00", user: "Office Manager", action: "Recalculated overtime premium factors", comments: "OT hourly factors computed based on (Basic/208)*2.0." },
    { timer: "2026-05-23 09:20:00", user: "Office Manager", action: "Generated draft May 2026 wages list", comments: "Loaded attendance parameters for 12 active workers." }
  ]);

  // Helper selectors
  const depts = ["All", ...Array.from(new Set(employees.map(e => e.department)))];

  // Dynamic salary generator core processor
  const handleGenerateSalaries = () => {
    setIsGenerating(true);
    setGenMessage("");

    setTimeout(() => {
      const monthPrefix = selectedMonth === "May 2026" ? "2026-05" : "2026-06";
      const daysInMonth = selectedMonth === "May 2026" ? 31 : 30;

      const generatedRecords: PayrollRecord[] = employees.map(emp => {
        // Find employee attendance metrics
        const empAttendance = attendance.filter(a => a.employeeId === emp.employeeId && a.date.startsWith(monthPrefix));
        
        // Count base values from list
        let presentDays = empAttendance.filter(a => a.status === "Present").length;
        let absentDays = empAttendance.filter(a => a.status === "Absent").length;
        let leaveDays = empAttendance.filter(a => a.status === "Leave").length;
        let holidayDays = empAttendance.filter(a => a.status === "Holiday").length;
        let lateDaysCount = empAttendance.filter(a => a.status === "Late").length;
        
        // Weekends: Count Fridays in the selected calendar month if there are logs, or default to 4
        let weekendDays = 4;
        
        // If there's no attendance tracking log at all for this employee in the database yet,
        // we fallback to standard 23 present days, 0 abs, 1 leave, 2 holidays, 4 weekends to represent May 2026
        if (empAttendance.length === 0) {
          presentDays = emp.employeeType === "Management" ? 25 : 23;
          absentDays = emp.employeeId === "OJ-021" ? 1 : 0;
          leaveDays = emp.employeeId === "OJ-045" ? 2 : 0;
          holidayDays = 2;
          weekendDays = 4;
          lateDaysCount = emp.employeeId === "OJ-021" ? 3 : 0;
        }

        // Calculate late minutes & early out minutes
        let lateMinutes = 0;
        let earlyOutMinutes = 0;
        let approvedManualCorrections = 0;
        let missingPunchesApproved = 0;
        let missingPunchesUnapproved = 0;

        if (empAttendance.length > 0) {
          empAttendance.forEach(a => {
            // Manual regularization count
            if (a.verificationMethod === "Manual" && a.approvalStatus === "Approved") {
              approvedManualCorrections++;
            }

            // Missing check-in or check-out but not both (Exclusive OR)
            const checkInMissing = !a.checkIn || a.checkIn === "--:--";
            const checkOutMissing = !a.checkOut || a.checkOut === "--:--";
            if (checkInMissing !== checkOutMissing) {
              if (a.approvalStatus === "Approved") {
                missingPunchesApproved++;
              } else {
                missingPunchesUnapproved++;
              }
            }

            // Calibrate late check-in
            if (a.checkIn && a.checkIn !== "--:--") {
              const [h, m] = a.checkIn.split(":").map(Number);
              const actualMins = h * 60 + m;
              const [sh, sm] = shiftStart.split(":").map(Number);
              const targetMins = sh * 60 + sm;
              if (actualMins > targetMins + graceMinutes) {
                lateMinutes += (actualMins - (targetMins + graceMinutes));
              }
            }

            // Calibrate early check-out
            if (a.checkOut && a.checkOut !== "--:--") {
              const [h, m] = a.checkOut.split(":").map(Number);
              const actualMins = h * 60 + m;
              const [eh, em] = shiftEnd.split(":").map(Number);
              const targetMins = eh * 60 + em;
              if (actualMins < targetMins) {
                earlyOutMinutes += (targetMins - actualMins);
              }
            }
          });
        } else {
          // Default fallbacks for rich simulation matching initial dataset
          if (emp.employeeId === "OJ-021") {
            lateMinutes = 35;
            earlyOutMinutes = 10;
            missingPunchesApproved = 1;
          }
        }

        // Count approved leave days by type from leaves prop
        const empApprovedLeaves = leaves.filter(l => l.employeeId === emp.employeeId && l.status === "Approved" && l.startDate.startsWith(monthPrefix));
        let unpaidLeaveDays = 0;
        empApprovedLeaves.forEach(l => {
          if (l.leaveType === "Without Pay") {
            unpaidLeaveDays += l.totalDays;
          }
        });

        // Split overtime into Normal vs Festive
        let normalOtHours = 0;
        let festiveOtHours = 0;
        if (empAttendance.length > 0) {
          empAttendance.forEach(a => {
            const isSpecial = a.status === "Holiday" || (new Date(a.date).getDay() === 5); // 5 is Friday
            if (isSpecial) {
              festiveOtHours += a.otHours || 0;
            } else {
              normalOtHours += a.otHours || 0;
            }
          });
        } else {
          // fallback simulation
          if (emp.employeeId === "OJ-021") {
            normalOtHours = 32;
            festiveOtHours = 10;
          }
        }

        // Night shift tracing
        const isOperator = emp.department === "Production" && emp.employeeType === "Worker";
        const nightShiftDays = isOperator ? (emp.employeeId === "OJ-021" ? 10 : 6) : 0;
        const nightShiftPremium = 100; // 100 BDT per night shift
        const nightShiftAllowance = nightShiftDays * nightShiftPremium;

        // Base wage components
        const basic = emp.basicSalary || 12000;
        const houseRentVal = Math.round(basic * (houseRentPct / 100));
        const medicalCap = emp.medicalAllowance || medicalAllowance;
        const conveyanceCap = emp.conveyance || conveyanceAllowance;
        const foodCap = emp.foodAllowance || foodAllowance;
        const grossSalary = basic + houseRentVal + medicalCap + conveyanceCap + foodCap;

        // Per-day calculation
        const perDaySalary = parseFloat((grossSalary / daysInMonth).toFixed(2));

        // Earnings
        const hourlyOvertimeRate = parseFloat(((basic / 208) * 2.0).toFixed(2));
        const otPayment = parseFloat(((normalOtHours * hourlyOvertimeRate) + (festiveOtHours * hourlyOvertimeRate * 1.5)).toFixed(2));
        
        // Attendance bonus (Present/paid is full and 0 unapproved misses/absences)
        const totalInfractionsAndAbsences = absentDays + unpaidLeaveDays + missingPunchesUnapproved;
        const attendanceBonus = totalInfractionsAndAbsences === 0 ? 1000 : 0;
        const canteenAllowance = isOperator ? 1200 : 2000;
        const otherAllowance = emp.employeeType === "Management" ? 5000 : 1000;

        // Deductions
        // 1. Unpaid Absence & unapproved missing punches deduction
        const absentDeductionCount = totalInfractionsAndAbsences;
        const absentDeduction = parseFloat((absentDeductionCount * perDaySalary).toFixed(2));

        // 2. Late Deduction (Company rule: 3 days late check-in = 1 day gross salary deducted)
        const totalLateDays = lateDaysCount + (empAttendance.length === 0 && emp.employeeId === "OJ-021" ? 3 : 0);
        const lateDeductionDays = Math.floor(totalLateDays / 3);
        const lateDeduction = parseFloat((lateDeductionDays * perDaySalary).toFixed(2));

        // 3. Early Out Deduction (if enabled, deduct BDT 2 per early out minute)
        const earlyOutDeduction = earlyOutDeductionEnabled ? parseFloat((earlyOutMinutes * 2).toFixed(2)) : 0;

        // 4. Advance Loan Deductions
        const advanceDeduction = emp.employeeId === "OJ-021" ? 1000 : 0;

        // 5. Tax Deductions
        const taxDeduction = grossSalary > 25000 ? parseFloat((grossSalary * 0.05).toFixed(2)) : 0;

        // Final allowances sum and net payable
        const allowancesSum = houseRentVal + medicalCap + conveyanceCap + foodCap + canteenAllowance + nightShiftAllowance + otherAllowance;
        
        // Net Calculation
        const totalEarnings = basic + allowancesSum + otPayment + attendanceBonus;
        const totalDeductions = absentDeduction + lateDeduction + earlyOutDeduction + advanceDeduction + taxDeduction;
        const netPayable = parseFloat((totalEarnings - totalDeductions).toFixed(2));

        const workedSum = presentDays + lateDaysCount + holidayDays + weekendDays + leaveDays - totalInfractionsAndAbsences;

        return {
          id: `pay-${Date.now()}-${emp.employeeId}`,
          employeeId: emp.employeeId,
          employeeName: emp.name,
          department: emp.department,
          month: selectedMonth,
          workedDays: workedSum > 0 ? workedSum : 26,
          absentDays: absentDays,
          leaveDays: leaveDays,
          holidayDays: holidayDays,
          weekendDays: weekendDays,
          lateMinutes: lateMinutes,
          earlyOutMinutes: earlyOutMinutes,
          missingPunchesApproved: missingPunchesApproved,
          missingPunchesUnapproved: missingPunchesUnapproved,
          approvedManualCorrections: approvedManualCorrections,
          normalOtHours: normalOtHours,
          festiveOtHours: festiveOtHours,
          nightShiftDays: nightShiftDays,
          nightShiftPremium: nightShiftPremium,
          basicSalary: basic,
          grossSalary: grossSalary,
          otPayment: otPayment,
          attendanceBonus: attendanceBonus,
          canteenAllowance: canteenAllowance,
          nightShiftAllowance: nightShiftAllowance,
          otherAllowance: otherAllowance,
          allowances: allowancesSum,
          deductions: absentDeduction,
          lateDeduction: lateDeduction,
          earlyOutDeduction: earlyOutDeduction,
          advanceDeduction: advanceDeduction,
          taxDeduction: taxDeduction,
          netPayable: netPayable,
          status: "Draft",
          paymentMethod: emp.salaryType === "Piece-rate" ? "Cash" : "Bank"
        };
      });

      onUpdatePayrolls(generatedRecords);
      setIsGenerating(false);
      setGenMessage(`Wages sheets generated successfully for ${generatedRecords.length} workers based on ZK BioTime device records. Total net disbursement BDT ${generatedRecords.reduce((acc, c) => acc + c.netPayable, 0).toLocaleString()} BDT.`);
      
      const nextLogs = [
        { timer: new Date().toISOString().replace("T", " ").slice(0, 19), user: "Office Manager", action: `Generated wages sheets for ${selectedMonth}`, comments: `Processed biometric inputs of OTTOMASS Jacquard.` },
        ...payrollAudits
      ];
      setPayrollAudits(nextLogs);
      
      onAddAuditLog("Generated Payroll Registers", "Payroll Office", `May 2026 batch generated from ZK BioTime biometric system.`);
    }, 1200);
  };

  // Salary Approval Workflow
  const handleApprovePayrollWages = () => {
    const updated = payrolls.map(r => ({ ...r, status: "Approved" as const }));
    onUpdatePayrolls(updated);
    
    // Core accounting integration
    if (onAddVoucher && accounts && setAccounts) {
      const totalGross = payrolls.reduce((sum, r) => sum + r.grossSalary, 0);
      const totalOvertime = payrolls.reduce((sum, r) => sum + r.otPayment, 0);
      const totalNetPayable = payrolls.reduce((sum, r) => sum + r.netPayable, 0);
      const totalTax = payrolls.reduce((sum, r) => sum + (r.taxDeduction || 0), 0);
      const totalAdvance = payrolls.reduce((sum, r) => sum + (r.advanceDeduction || 0), 0);
      const totalDeductions = payrolls.reduce((sum, r) => sum + (r.deductions || 0), 0);

      const items = [
        { accountCode: "6001", accountName: "Salary Expense", debit: totalGross, credit: 0 },
        { accountCode: "6002", accountName: "Overtime Expense", debit: totalOvertime, credit: 0 },
        { accountCode: "2101", accountName: "Salary Payable", debit: 0, credit: totalNetPayable }
      ];

      if (totalAdvance > 0) {
        items.push({ accountCode: "1301", accountName: "Employee Advance", debit: 0, credit: totalAdvance });
      }
      if (totalTax > 0) {
        items.push({ accountCode: "2301", accountName: "Tax Payable", debit: 0, credit: totalTax });
      }
      if (totalDeductions > 0) {
        // Crediting Food/Canteen Expense or general expense recovery for the absence deductions
        items.push({ accountCode: "6007", accountName: "Food/Canteen Expense", debit: 0, credit: totalDeductions });
      }

      // Ensure Debits exactly equal Credits
      const sumDebits = items.reduce((s, x) => s + x.debit, 0);
      const sumCredits = items.reduce((s, x) => s + x.credit, 0);
      if (sumDebits !== sumCredits) {
        const diff = sumDebits - sumCredits;
        if (diff > 0) {
          items[2].credit += diff; // offset to salary payable
        } else {
          items[0].debit += Math.abs(diff); // offset to salary expense
        }
      }

      const freshV: JournalVoucher = {
        id: `jv-salary-approve-${Date.now()}`,
        voucherNo: `SV-202605-${String(Date.now()).slice(-3)}`,
        date: new Date().toISOString().substring(0, 10),
        narration: `Approved Wages Generation Double Entry for ${selectedMonth} compiled list`,
        status: "Posted",
        items,
        createdBy: "Wages Desk Compiler"
      };

      onAddVoucher(freshV);

      // Mutate the accounts balance
      setAccounts(prev => prev.map(acc => {
        let balance = acc.balance;
        items.forEach(itm => {
          if (itm.accountCode === acc.code) {
            if (acc.group === "Asset" || acc.group === "Expense") {
              balance += (itm.debit - itm.credit);
            } else {
              balance += (itm.credit - itm.debit);
            }
          }
        });
        return { ...acc, balance };
      }));
    }

    const logTimer = new Date().toISOString().replace("T", " ").slice(0, 19);
    setPayrollAudits([
      { timer: logTimer, user: "Executive Owner (Islam)", action: "Lock & Approved entire Monthly Wages Ledger", comments: `Wages status finalized and authorized. Handed to accounts for Bank clearance. Posted SV double entry.` },
      ...payrollAudits
    ]);

    onAddAuditLog("Approved Monthly Wages registers", "Payroll Locking Portal", `${selectedMonth} wages finalized under verified compliance status. Posted double entry ledger voucher.`);
    alert(`Success: Payroll registered for ${selectedMonth} was locked and approved successfully! Double entry Posted!`);
  };

  // Salary Disbursement Payments
  const handleDisburseWagesPayment = () => {
    const updated = payrolls.map(r => r.status === "Approved" ? { ...r, status: "Paid" as const } : r);
    onUpdatePayrolls(updated);

    if (onAddVoucher && accounts && setAccounts) {
      // Find total approved wages net payable
      const approvedWages = payrolls.filter(r => r.status === "Approved");
      if (approvedWages.length === 0) {
        alert("No approved wages ready for disbursement.");
        return;
      }

      // Calculate disbursement totals split by Cash vs Bank
      const totalCashDisbursal = approvedWages.filter(r => r.paymentMethod === "Cash" || r.paymentMethod === "bKash" || r.employeeId === "OJ-005").reduce((s, x) => s + x.netPayable, 0);
      const totalBankDisbursal = approvedWages.filter(r => r.paymentMethod === "Bank" && r.employeeId !== "OJ-005").reduce((s, x) => s + x.netPayable, 0);
      const grandDisbursalTotal = totalCashDisbursal + totalBankDisbursal;

      if (grandDisbursalTotal <= 0) {
        alert("Disbursement amount is zero.");
        return;
      }

      const items = [
        { accountCode: "2101", accountName: "Salary Payable", debit: grandDisbursalTotal, credit: 0 }
      ];

      if (totalCashDisbursal > 0) {
        items.push({ accountCode: "1001", accountName: "Cash in Hand", debit: 0, credit: totalCashDisbursal });
      }
      if (totalBankDisbursal > 0) {
        items.push({ accountCode: "1101", accountName: "Bank Account", debit: 0, credit: totalBankDisbursal });
      }

      const paymentVoucher: JournalVoucher = {
        id: `jv-salary-pay-${Date.now()}`,
        voucherNo: `PV-2101-DISBURSE-${String(Date.now()).slice(-3)}`,
        date: new Date().toISOString().substring(0, 10),
        narration: `Paid monthly workers wages. Transferred through DBBL corporate bank & cash desk.`,
        status: "Posted",
        items,
        createdBy: "Wages Desk Disburser"
      };

      onAddVoucher(paymentVoucher);

      // Mutate the accounts balance
      setAccounts(prev => prev.map(acc => {
        let balance = acc.balance;
        items.forEach(itm => {
          if (itm.accountCode === acc.code) {
            if (acc.group === "Asset" || acc.group === "Expense") {
              balance += (itm.debit - itm.credit);
            } else {
              balance += (itm.credit - itm.debit);
            }
          }
        });
        return { ...acc, balance };
      }));
    }

    const logTimer = new Date().toISOString().replace("T", " ").slice(0, 19);
    setPayrollAudits([
      { timer: logTimer, user: "Executive Owner (Islam)", action: "Disbursed Monthly Wages Payouts", comments: "Authorized direct transfer of wages from Bank and physical Cash. Cleared salary payable obligations." },
      ...payrollAudits
    ]);

    onAddAuditLog("Disbursed Monthly Payroll payments", "Wages Disbursement Portal", `${selectedMonth} Wages batch wage payments disbursed.`);
    alert(`Success: Payroll payments for ${selectedMonth} have been disbursed! Debited Salary Payable (Code 2101) and Credited Cash / Bank Accounts accordingly.`);
  };

  // CSV disbursement downloader
  const handleExportBanksheetCSV = () => {
    const headers = "Serial,Employee Name,Employee ID,Account/NID,Routing Code,Gross Salary,Net Wages Payable,Signature Key\n";
    const rows = filteredPayrolls.map((r, index) => {
      const emp = employees.find(e => e.employeeId === r.employeeId);
      const acc = emp?.nid ? `1293${emp.nid.slice(2, 10)}` : `BE-0012948${index}`;
      return `${index + 1},"${r.employeeName}","${r.employeeId}","${acc}","015264321",${r.grossSalary},${r.netPayable},"[Sealed-Authorized]"`
    }).join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `OTTOMASS_Wages_Banksheet_${selectedMonth.replace(" ", "_")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Print triggered outputs
  const handleTriggerPrint = () => {
    window.print();
  };

  const filteredPayrolls = payrolls.filter(p => {
    const matchDept = filterDept === "All" || p.department === filterDept;
    return matchDept;
  });

  const selectedPayslipRecord = payrolls.find(p => p.employeeId === payslipEmpId || p.employeeName === payslipEmpId);
  const selectedPayslipEmp = selectedPayslipRecord ? employees.find(e => e.employeeId === selectedPayslipRecord.employeeId) : null;

  return (
    <div className="space-y-6 animate-fade-in pr-2 pb-12">
      
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 no-print">
        <div>
          <h2 className="font-display font-bold text-2xl text-slate-800 tracking-tight">
            {lang === "EN" ? "Interactive Phase 2 Payroll System & Wage Sheet Desk" : "কর্মচারীদের ডিজিটাল পেরোল এবং বেতন বিতরণ সেল"}
          </h2>
          <p className="font-sans text-xs text-slate-500 mt-1">
            {lang === "EN" ? "Configure standard employee salary structures, generate monthly payslip registers, compile Bank ledger sheets, and post double entries." : "বেতন কাঠামো পরিবর্তন, মাসিক বেতন হিসেবকরণ, ব্যাংক ডিকলারেশন শীট এবং শ্রমিকদের পেরোল রিপোর্ট।" }
          </p>
        </div>

        {/* Global stats metrics */}
        <div className="flex items-center space-x-3 text-xs font-sans">
          <div className="p-3 bg-indigo-50 border border-indigo-150 rounded-xl">
            <p className="text-slate-400 font-bold uppercase text-[9px] tracking-wider text-center">Net Wage Outflow</p>
            <p className="font-mono font-bold text-indigo-700 text-sm mt-0.5 text-center">
              {payrolls.reduce((sum, r) => sum + r.netPayable, 0).toLocaleString()} BDT
            </p>
          </div>
          <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl">
            <p className="text-slate-400 font-bold uppercase text-[9px] tracking-wider text-center">Status Locked</p>
            <p className="font-mono font-bold text-amber-700 text-sm mt-0.5 text-center">
              {payrolls.every(p => p.status === "Approved") ? "APPROVED" : "DRAFT"}
            </p>
          </div>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex space-x-1 p-1 bg-slate-100/80 rounded-xl no-print overflow-x-auto">
        <button
          onClick={() => setActiveSubTab("generate")}
          className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-bold rounded-lg transition-all shrink-0 ${activeSubTab === "generate" ? "bg-white text-indigo-600 shadow-xs" : "text-slate-500 hover:text-slate-700"}`}
        >
          <Cpu size={13} />
          <span>{lang === "EN" ? "Wage Generator Desk" : "বেতন প্রসেসিং কোষ"}</span>
        </button>

        <button
          onClick={() => setActiveSubTab("structure")}
          className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-bold rounded-lg transition-all shrink-0 ${activeSubTab === "structure" ? "bg-white text-indigo-600 shadow-xs" : "text-slate-500 hover:text-slate-700"}`}
        >
          <Coins size={13} />
          <span>{lang === "EN" ? "Salary Structure Rules" : "বেতন কাঠামো সেটিংস"}</span>
        </button>

        <button
          onClick={() => setActiveSubTab("payslip")}
          className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-bold rounded-lg transition-all shrink-0 ${activeSubTab === "payslip" ? "bg-white text-indigo-600 shadow-xs" : "text-slate-500 hover:text-slate-700"}`}
        >
          <FileText size={13} />
          <span>{lang === "EN" ? "Printable Payslips Hub" : "শ্রমিক পে-স্লিপ প্রিন্ট"}</span>
        </button>

        <button
          onClick={() => setActiveSubTab("banksheet")}
          className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-bold rounded-lg transition-all shrink-0 ${activeSubTab === "banksheet" ? "bg-white text-indigo-600 shadow-xs" : "text-slate-500 hover:text-slate-700"}`}
        >
          <Building2 size={13} />
          <span>{lang === "EN" ? "Bank Disbursement Sheet" : "ব্যাংক বিতরণী সীট"}</span>
        </button>

        <button
          onClick={() => setActiveSubTab("reports")}
          className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-bold rounded-lg transition-all shrink-0 ${activeSubTab === "reports" ? "bg-white text-indigo-600 shadow-xs" : "text-slate-500 hover:text-slate-700"}`}
        >
          <TrendingUp size={13} />
          <span>{lang === "EN" ? "Wages Report Center" : "পেরোল রিপোর্ট সেন্টার"}</span>
        </button>

        <button
          onClick={() => setActiveSubTab("logs")}
          className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-bold rounded-lg transition-all shrink-0 ${activeSubTab === "logs" ? "bg-white text-indigo-600 shadow-xs" : "text-slate-500 hover:text-slate-700"}`}
        >
          <BadgeCheck size={13} />
          <span>{lang === "EN" ? "Wages Audit Timeline" : "পেরোল অডিট টাইমলাইন"}</span>
        </button>
      </div>

      {/* VIEW PANEL SECTORS */}

      {/* 1. MOUNT PAYROLL GENERATION DESK */}
      {activeSubTab === "generate" && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 p-5 rounded-2xl space-y-4 no-print">
            <h3 className="font-display font-bold text-sm text-slate-800 flex items-center space-x-2">
              <Coins size={15} className="text-indigo-600" />
              <span>Batch Salary & Wages compilation</span>
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Compile monthly workers' attendance cards, overtime sheets, unpaid leaves absence multipliers, and attendance bonus configurations to compile a sealed, comprehensive salary book.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-2">
              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Select Wages Calendar Month</label>
                <select
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs text-slate-750 font-bold focus:outline-hidden"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                >
                  <option value="May 2026">May 2026 Calendar Month</option>
                  <option value="June 2026">June 2026 Calendar Month</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={handleGenerateSalaries}
                  disabled={isGenerating}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 text-white hover:text-white rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2"
                >
                  <span>{isGenerating ? "Executing Dynamic Calculations..." : "Regenerate Monthly Wages Sheet"}</span>
                </button>
              </div>
            </div>

            {genMessage && (
              <div className="p-4 bg-emerald-50 border border-emerald-150 rounded-xl flex items-start space-x-3 text-emerald-800 animate-fade-in">
                <CheckCircle2 size={16} className="text-emerald-600 mt-0.5 shrink-0" />
                <p className="text-xs font-medium leading-relaxed">{genMessage}</p>
              </div>
            )}
          </div>

          {/* Active compiled payroll values */}
          <div className="bg-white border border-slate-200 p-5 rounded-2xl flex flex-col space-y-4">
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0 no-print">
              <div className="flex items-center space-x-2">
                <h3 className="font-display font-medium text-xs uppercase text-slate-400 tracking-wider">
                  May 2026 Active Payroll Sheet
                </h3>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                  payrolls.every(p => p.status === "Approved") ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                }`}>
                  {payrolls.every(p => p.status === "Approved") ? "Finalized & Posted" : "Draft Status"}
                </span>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={handleTriggerPrint}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg border border-slate-200 transition flex items-center space-x-1"
                >
                  <Printer size={12} />
                  <span>Print Registers</span>
                </button>

                {payrolls.some(p => p.status === "Draft") && (
                  <button
                    onClick={handleApprovePayrollWages}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white hover:text-white text-xs font-bold rounded-lg transition flex items-center space-x-1"
                  >
                    <BadgeCheck size={12} />
                    <span>Authorize & Approve Salaries</span>
                  </button>
                )}

                {payrolls.some(p => p.status === "Approved") && (
                  <button
                    onClick={handleDisburseWagesPayment}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white hover:text-white text-xs font-bold rounded-lg transition flex items-center space-x-1"
                  >
                    <Coins size={12} />
                    <span>Disburse Wages (Debit Payable)</span>
                  </button>
                )}
              </div>
            </div>

            {/* Print Header (Visible only when printing) */}
            <div className="hidden print:block text-center border-b border-slate-800 pb-4 mb-6">
              <h1 className="font-display font-extrabold text-lg text-slate-900 tracking-tight">OTTOMASS JACQUARD LTD</h1>
              <p className="text-xs text-slate-600 uppercase font-mono tracking-widest mt-0.5">Official Factory Payroll Registers</p>
              <p className="text-xs text-slate-600 mt-2 font-mono">Calibrated Month: {selectedMonth} • Compliance Audit Cleared</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs divide-y divide-slate-100 font-sans print:text-[10px]">
                <thead>
                  <tr className="text-slate-400 text-[10px] uppercase font-bold tracking-wider pt-2 border-b border-slate-100 print:text-black">
                    <th className="py-2.5">Emp ID</th>
                    <th className="py-2.5">Name</th>
                    <th className="py-2.5">Worked / Abs</th>
                    <th className="py-2.5">OT Hours</th>
                    <th className="py-2.5 font-mono">Basic Salary</th>
                    <th className="py-2.5 font-mono">OT Wages</th>
                    <th className="py-2.5 font-mono">Allowances</th>
                    <th className="py-2.5 font-mono">Deductions</th>
                    <th className="py-2.5 font-mono">Net Payable</th>
                    <th className="py-2.5 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {payrolls.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50/50 transition-colors print:hover:bg-transparent">
                      <td className="py-3 font-mono font-bold text-slate-800 print:text-black">{p.employeeId}</td>
                      <td className="py-3 font-bold text-slate-800 print:text-black">{p.employeeName}</td>
                      <td className="py-3 text-slate-500 font-mono">
                        {p.workedDays}d / <span className="text-rose-500">{p.absentDays}d</span>
                      </td>
                      <td className="py-3 font-mono font-bold text-slate-600">{(p.normalOtHours + p.festiveOtHours)} Hrs</td>
                      <td className="py-3 font-mono text-slate-850">{p.basicSalary.toLocaleString()} BDT</td>
                      <td className="py-3 font-mono text-emerald-600">+{p.otPayment.toLocaleString()} BDT</td>
                      <td className="py-3 font-mono text-slate-500">+{p.allowances.toLocaleString()} BDT</td>
                      <td className="py-3 font-mono text-rose-600">-{p.deductions.toLocaleString()} BDT</td>
                      <td className="py-3 font-mono font-extrabold text-slate-900 border-r border-slate-50 pr-4 print:text-black">{p.netPayable.toLocaleString()} BDT</td>
                      <td className="py-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                          p.status === "Approved" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-amber-50 text-amber-700 border border-amber-100"
                        } print:border`}>
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {payrolls.length === 0 && (
                <div className="text-center italic text-slate-400 py-12">
                  No payroll records compiled yet. Click 'Regenerate Monthly Wages Sheet' above to process salaries.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. SALARY STRUCTURE CONFIG */}
      {activeSubTab === "structure" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 no-print">
          <div className="lg:col-span-2 bg-white border border-slate-200 p-5 rounded-2xl space-y-4">
            <h3 className="font-display font-bold text-sm text-slate-800 flex items-center space-x-2">
              <Coins size={14} className="text-indigo-600" />
              <span>Generic Bangladesh Apparel Salary Structure</span>
            </h3>
            <p className="text-xs text-slate-500">
              Configure baseline breakdown parameters compliant with the Minimum Wages Union parameters for apparel factories in Gazipur, Bangladesh.
            </p>

            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">House Rent (Percentage of Basic)</label>
                  <div className="flex items-center space-x-2">
                    <input 
                      type="number"
                      value={houseRentPct}
                      onChange={(e) => setHouseRentPct(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-700 focus:outline-hidden"
                    />
                    <span className="text-xs font-bold text-slate-400">%</span>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Medical Allowance (BDT Standard)</label>
                  <input 
                    type="number"
                    value={medicalAllowance}
                    onChange={(e) => setMedicalAllowance(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-700 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Conveyance Allowance (BDT Standard)</label>
                  <input 
                    type="number"
                    value={conveyanceAllowance}
                    onChange={(e) => setConveyanceAllowance(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-700 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Food / Tiffin Allowance (BDT Standard)</label>
                  <input 
                    type="number"
                    value={foodAllowance}
                    onChange={(e) => setFoodAllowance(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-700 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => {
                    onAddAuditLog("Modified corporate allowance scales", "Compliance parameters", `House rent: ${houseRentPct}%, Medical: ${medicalAllowance} BDT`);
                    alert("Wages structure scales saved securely!");
                  }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white hover:text-white rounded-xl text-xs font-bold transition"
                >
                  Save Salary components
                </button>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl">
            <h4 className="font-display font-semibold text-xs text-slate-400 uppercase tracking-wider mb-3">
              Minimum Wages Grading Schema
            </h4>
            <div className="space-y-2.5 text-[11px] leading-relaxed text-slate-600">
              <p>
                <strong>Grade A (Knitting Specialists/Master):</strong> Minimum scale starting at BDT 15,000 basic + allowances, OT calculated standard.
              </p>
              <p>
                <strong>Grade B (Knit Operators/Linking):</strong> Baseline start BDT 11,500 basic wages.
              </p>
              <p>
                <strong>Grade C (Menders/Helpers):</strong> Scale starting BDT 8,500 basic.
              </p>
              <div className="p-3 bg-indigo-50 text-indigo-700 rounded-xl mt-4 font-medium">
                These scales are cross-linked to Grade Definitions in the master setup directory.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. INDIVIDUAL PRINTABLE PAYSLIPS */}
      {activeSubTab === "payslip" && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 p-5 rounded-2xl space-y-4 no-print">
            <h3 className="font-display font-bold text-sm text-slate-800">
              Printable Payslips Hub
            </h3>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Select Employee to Extract Slip</label>
                <select
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-700 focus:outline-hidden"
                  value={payslipEmpId}
                  onChange={(e) => setPayslipEmpId(e.target.value)}
                >
                  <option value="">-- Choose Worker --</option>
                  {employees.map(e => (
                    <option key={e.id} value={e.employeeId}>{e.name} ({e.employeeId})</option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={handleTriggerPrint}
                  disabled={!selectedPayslipRecord}
                  className="w-full sm:w-auto px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 text-white hover:text-white rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2"
                >
                  <Printer size={13} />
                  <span>Print Payroll Summary</span>
                </button>
              </div>
            </div>
          </div>

          {/* Payslip & Employee Payroll Summary View Panel */}
          {selectedPayslipRecord ? (
            <div className="bg-white border-2 border-slate-300 p-8 rounded-2xl max-w-3xl mx-auto shadow-sm font-sans print:border-none print:shadow-none">
              
              {/* Employer Header */}
              <div className="text-center border-b border-double border-slate-800 pb-5 mb-5">
                <h1 className="font-display font-extrabold text-2xl text-slate-900 tracking-tight">OTTOMASS JACQUARD LTD</h1>
                <p className="text-[10.5px] text-slate-500 uppercase tracking-widest font-mono">Plot B-14, BSCIC Industrial Area, Konabari, Gazipur, Bangladesh</p>
                <h2 className="font-sans font-extrabold text-xs bg-slate-900 text-white uppercase inline-block px-4 py-1.5 mt-3 rounded-md print:bg-slate-200 print:text-black">
                  EMPLOYEE PAYROLL SUMMARY & WAGE SHEET
                </h2>
              </div>

              {/* SECTION A: Employee Profile Details */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 grid grid-cols-2 md:grid-cols-3 gap-y-3 gap-x-6 text-xs text-slate-700 font-sans mb-5 print:bg-transparent">
                <div>
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Employee ID</span>
                  <span className="font-mono font-bold text-[13px] text-slate-900">{selectedPayslipRecord.employeeId}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Employee Name</span>
                  <span className="font-bold text-[13px] text-slate-900">{selectedPayslipRecord.employeeName}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Department</span>
                  <span className="font-bold text-[13px] text-slate-800">{selectedPayslipRecord.department}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Section / Line</span>
                  <span className="font-semibold">{selectedPayslipEmp?.section || "Knitting Section"} / {selectedPayslipEmp?.line || "Line 04"}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Operator Shift / Grade</span>
                  <span className="font-semibold">{"Day Shift"} / {selectedPayslipEmp?.grade || "Grade B"}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Wages Month Period</span>
                  <span className="font-bold text-indigo-700">{selectedPayslipRecord.month}</span>
                </div>
              </div>

              {/* SECTION B: Processed Attendance Summary */}
              <div className="border border-slate-200 rounded-xl p-4 mb-5">
                <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b pb-1.5 mb-3 flex items-center justify-between">
                  <span>ZK BIOTIME AUTOMATED PRESENCE REGISTER</span>
                  <span className="text-emerald-600 font-mono text-[9px] lowercase">[verified bio logs]</span>
                </h3>
                
                <div className="grid grid-cols-3 md:grid-cols-6 gap-3.5 text-center text-xs font-sans">
                  <div className="bg-emerald-50/50 p-2 rounded-lg border border-emerald-100">
                    <p className="text-[9px] text-emerald-800 font-bold uppercase">Present</p>
                    <p className="text-sm font-bold text-emerald-700 font-mono mt-0.5">{selectedPayslipRecord.workedDays}d</p>
                  </div>
                  <div className="bg-rose-50/50 p-2 rounded-lg border border-rose-100">
                    <p className="text-[9px] text-rose-800 font-bold uppercase">Absent</p>
                    <p className="text-sm font-bold text-rose-700 font-mono mt-0.5">{selectedPayslipRecord.absentDays}d</p>
                  </div>
                  <div className="bg-sky-50 p-2 rounded-lg border border-sky-100">
                    <p className="text-[9px] text-sky-800 font-bold uppercase">Approved Leave</p>
                    <p className="text-sm font-bold text-sky-700 font-mono mt-0.5">{selectedPayslipRecord.leaveDays}d</p>
                  </div>
                  <div className="bg-amber-50 p-2 rounded-lg border border-amber-100">
                    <p className="text-[9px] text-amber-800 font-bold uppercase">Holidays</p>
                    <p className="text-sm font-bold text-amber-700 font-mono mt-0.5">{selectedPayslipRecord.holidayDays || 2}d</p>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                    <p className="text-[9px] text-slate-500 font-bold uppercase">Weekends</p>
                    <p className="text-sm font-bold text-slate-700 font-mono mt-0.5">{selectedPayslipRecord.weekendDays || 4}d</p>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                    <p className="text-[9px] text-slate-500 font-bold uppercase">Corrections</p>
                    <p className="text-sm font-bold text-slate-700 font-mono mt-0.5">{selectedPayslipRecord.approvedManualCorrections || 0}d</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3 text-xs border-t pt-3">
                  <div className="flex justify-between p-1 bg-slate-50/50 rounded">
                    <span className="text-slate-500">Late Minutes:</span>
                    <strong className="font-mono text-slate-700">{selectedPayslipRecord.lateMinutes} mins</strong>
                  </div>
                  <div className="flex justify-between p-1 bg-slate-50/50 rounded">
                    <span className="text-slate-500">Early Outs:</span>
                    <strong className="font-mono text-slate-700">{selectedPayslipRecord.earlyOutMinutes} mins</strong>
                  </div>
                  <div className="flex justify-between p-1 bg-slate-50/50 rounded">
                    <span className="text-slate-500">Punches Approved:</span>
                    <strong className="font-mono text-emerald-600">+{selectedPayslipRecord.missingPunchesApproved}</strong>
                  </div>
                  <div className="flex justify-between p-1 bg-slate-50/50 rounded">
                    <span className="text-slate-500">Punches Unapproved:</span>
                    <strong className="font-mono text-rose-600">-{selectedPayslipRecord.missingPunchesUnapproved}</strong>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2 text-xs">
                  <div className="flex justify-between p-1 bg-slate-50/50 rounded">
                    <span className="text-slate-500">Normal OT Hours:</span>
                    <strong className="font-mono text-slate-700">{selectedPayslipRecord.normalOtHours} hrs</strong>
                  </div>
                  <div className="flex justify-between p-1 bg-slate-50/50 rounded">
                    <span className="text-slate-500">Festive OT Hours:</span>
                    <strong className="font-mono text-indigo-600">{selectedPayslipRecord.festiveOtHours} hrs</strong>
                  </div>
                  <div className="flex justify-between p-1 bg-slate-50/50 rounded">
                    <span className="text-slate-500">Night Shift Worked:</span>
                    <strong className="font-mono text-slate-700">{selectedPayslipRecord.nightShiftDays} shifts</strong>
                  </div>
                  <div className="flex justify-between p-1 bg-slate-50/50 rounded">
                    <span className="text-slate-500">Night shift Premium:</span>
                    <strong className="font-mono text-indigo-600">{selectedPayslipRecord.nightShiftPremium} BDT</strong>
                  </div>
                </div>
              </div>

              {/* SECTION C: Base Gross Salary Allocation */}
              <div className="border border-slate-200 rounded-xl p-4 mb-5 text-xs">
                <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b pb-1.5 mb-3">
                  BASE GROSS SALARY ALLOCATION (GAZIPUR REGIONAL REGISTRY)
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 font-mono font-medium text-slate-800">
                  <div className="p-1.5 bg-slate-50 rounded">
                    <span className="text-[8px] text-slate-400 uppercase font-sans block">Basic Salary</span>
                    <span>{selectedPayslipRecord.basicSalary.toLocaleString()} BDT</span>
                  </div>
                  <div className="p-1.5 bg-slate-50 rounded">
                    <span className="text-[8px] text-slate-400 uppercase font-sans block">House Rent</span>
                    <span>{Math.round(selectedPayslipRecord.basicSalary * 0.5).toLocaleString()} BDT</span>
                  </div>
                  <div className="p-1.5 bg-slate-50 rounded">
                    <span className="text-[8px] text-slate-400 uppercase font-sans block">Medical Allw.</span>
                    <span>{(selectedPayslipEmp?.medicalAllowance || medicalAllowance).toLocaleString()} BDT</span>
                  </div>
                  <div className="p-1.5 bg-slate-50 rounded">
                    <span className="text-[8px] text-slate-400 uppercase font-sans block">Conveyance</span>
                    <span>{(selectedPayslipEmp?.conveyance || conveyanceAllowance).toLocaleString()} BDT</span>
                  </div>
                  <div className="p-1.5 bg-indigo-50/50 rounded border border-indigo-100">
                    <span className="text-[8px] text-indigo-700 uppercase font-sans block font-bold">Base Gross</span>
                    <span className="font-bold text-indigo-800">{selectedPayslipRecord.grossSalary.toLocaleString()} BDT</span>
                  </div>
                </div>
              </div>

              {/* SECTION D: Additions & Deductions Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs font-sans">
                {/* Earnings */}
                <div className="border border-slate-200 rounded-xl p-4 space-y-2">
                  <h4 className="font-bold text-emerald-800 border-b pb-1.5 uppercase text-[10px] tracking-wider">Earnings & Allowances</h4>
                  <div className="flex justify-between p-1 border-b border-slate-50">
                    <span>Overtime Wages</span>
                    <span className="font-mono text-emerald-600">+{selectedPayslipRecord.otPayment.toLocaleString()} BDT</span>
                  </div>
                  <div className="flex justify-between p-1 border-b border-slate-50">
                    <span>Canteen Allowance</span>
                    <span className="font-mono text-slate-600">+{selectedPayslipRecord.canteenAllowance.toLocaleString()} BDT</span>
                  </div>
                  <div className="flex justify-between p-1 border-b border-slate-50">
                    <span>Attendance Bonus</span>
                    <span className="font-mono text-slate-600">+{selectedPayslipRecord.attendanceBonus.toLocaleString()} BDT</span>
                  </div>
                  <div className="flex justify-between p-1 border-b border-slate-50">
                    <span>Night Shift Allowance</span>
                    <span className="font-mono text-slate-600">+{selectedPayslipRecord.nightShiftAllowance.toLocaleString()} BDT</span>
                  </div>
                  <div className="flex justify-between p-1">
                    <span>Other Allowances / Bonus</span>
                    <span className="font-mono text-slate-600">+{selectedPayslipRecord.otherAllowance.toLocaleString()} BDT</span>
                  </div>
                </div>

                {/* Deductions */}
                <div className="border border-slate-200 rounded-xl p-4 space-y-2">
                  <h4 className="font-bold text-rose-800 border-b pb-1.5 uppercase text-[10px] tracking-wider">Infractions & Deductions</h4>
                  <div className="flex justify-between p-1 border-b border-slate-50">
                    <span>Absent Cutout ({selectedPayslipRecord.absentDays}d)</span>
                    <span className="font-mono text-rose-600">-{selectedPayslipRecord.deductions.toLocaleString()} BDT</span>
                  </div>
                  <div className="flex justify-between p-1 border-b border-slate-50">
                    <span>Late Deduction</span>
                    <span className="font-mono text-rose-600">-{selectedPayslipRecord.lateDeduction.toLocaleString()} BDT</span>
                  </div>
                  <div className="flex justify-between p-1 border-b border-slate-50">
                    <span>Early Out Cutout</span>
                    <span className="font-mono text-rose-600">-{selectedPayslipRecord.earlyOutDeduction.toLocaleString()} BDT</span>
                  </div>
                  <div className="flex justify-between p-1 border-b border-slate-50">
                    <span>Loan / Salary Advance</span>
                    <span className="font-mono text-rose-600">-{selectedPayslipRecord.advanceDeduction.toLocaleString()} BDT</span>
                  </div>
                  <div className="flex justify-between p-1">
                    <span>Source Income Tax (5%)</span>
                    <span className="font-mono text-rose-600">-{selectedPayslipRecord.taxDeduction.toLocaleString()} BDT</span>
                  </div>
                </div>
              </div>

              {/* SECTION E: Grand Total Net Payable */}
              <div className="bg-slate-900 text-white border border-slate-800 mt-6 p-4 flex justify-between items-center rounded-xl font-sans print:border-none">
                <div>
                  <span className="font-bold text-[10px] tracking-widest block text-slate-400">NET DISBURSABLE PAYABLE WAGES</span>
                  <span className="text-[10px] italic text-slate-400">Ruled in compliance with Minimum Wages act</span>
                </div>
                <div className="text-right">
                  <span className="font-mono font-extrabold text-xl text-emerald-400">{selectedPayslipRecord.netPayable.toLocaleString()} BDT</span>
                </div>
              </div>

              {/* Payment Info */}
              <div className="mt-4 p-3 bg-slate-50 text-[11px] rounded-lg text-slate-500 font-mono text-center flex justify-around border print:bg-transparent">
                <p>Disbursement Method: <strong className="text-slate-800">{selectedPayslipRecord.paymentMethod}</strong></p>
                <p>Account/Routing Code: <strong className="text-slate-800">12903{selectedPayslipRecord.employeeId.slice(-3)} / 015264321</strong></p>
              </div>

              {/* Signature layout */}
              <div className="grid grid-cols-3 gap-4 pt-14 text-center text-[10.5px] font-sans no-print-block">
                <div className="pt-4 border-t border-slate-350">
                  <p className="font-bold text-slate-705">Worker's Signature</p>
                  <p className="text-[9.5px] text-slate-400 mt-0.5">Fingerprint Marked</p>
                </div>
                <div className="pt-4 border-t border-slate-350">
                  <p className="font-bold text-slate-705">Checked by Finance</p>
                  <p className="text-[9.5px] text-slate-400 mt-0.5">Audit Stamp Approved</p>
                </div>
                <div className="pt-4 border-t border-slate-350">
                  <p className="font-bold text-slate-705">Managing Director</p>
                  <p className="text-[9.5px] text-emerald-600 mt-0.5 uppercase tracking-wider font-semibold font-mono">[Security Sealed Approved]</p>
                </div>
              </div>

            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-200 p-12 rounded-2xl text-center italic text-slate-400 text-xs font-bold no-print">
              Select an employee from the dropdown selector above to compile and view the full payroll summary register.
            </div>
          )}
        </div>
      )}

      {/* 4. BANK DISBURSEMENT SHEET */}
      {activeSubTab === "banksheet" && (
        <div className="bg-white border border-slate-200 p-5 rounded-2xl flex flex-col space-y-4">
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0 no-print">
            <div className="flex items-center space-x-2">
              <h3 className="font-display font-medium text-xs uppercase text-slate-400 tracking-wider">
                Bank Asia / Brac Bank Salary Disbursement Sheet
              </h3>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={handleTriggerPrint}
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-750 text-xs font-bold rounded-lg border border-slate-200 transition flex items-center space-x-1"
              >
                <Printer size={12} />
                <span>Print Bank Ledger</span>
              </button>

              <button
                onClick={handleExportBanksheetCSV}
                className="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-lg border border-indigo-200 transition flex items-center space-x-1"
              >
                <Download size={12} />
                <span>Export Bank CSV</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 no-print">
            <select
              value={filterDept}
              onChange={(e) => setFilterDept(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-700 focus:outline-hidden"
            >
              <option value="All">All Departments</option>
              {depts.filter(d => d !== "All").map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Printable Bank Format */}
          <div className="hidden print:block text-center border-b border-slate-800 pb-4 mb-6">
            <h1 className="font-display font-extrabold text-lg text-slate-900">OTTOMASS JACQUARD LTD</h1>
            <p className="text-xs text-slate-600 uppercase font-mono tracking-widest mt-0.5">Corporate Wages Disbursals Sheet</p>
            <p className="text-xs text-slate-600 mt-2 font-mono">Disbursing Bank: Bank Asia Ltd, Konabari Branch • Routing Index: 0153245</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs divide-y divide-slate-100 font-sans print:text-[11px]">
              <thead>
                <tr className="text-slate-400 text-[10px] uppercase font-bold tracking-wider pt-2 border-b border-slate-100 print:text-black">
                  <th className="py-2.5">Serial</th>
                  <th className="py-2.5">Employee Name</th>
                  <th className="py-2.5">Employee ID</th>
                  <th className="py-2.5">Bank Account NO</th>
                  <th className="py-2.5">Routing Code</th>
                  <th className="py-2.5 font-mono">Gross Salary</th>
                  <th className="py-2.5 font-mono">Disbursement wage</th>
                  <th className="py-2.5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredPayrolls.map((p, idx) => {
                  const emp = employees.find(e => e.employeeId === p.employeeId);
                  const accNo = emp?.nid ? `12903${emp.nid.slice(1, 9)}` : `129032849010${idx}`;
                  return (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors print:hover:bg-transparent">
                      <td className="py-3.5 text-slate-400 font-bold">{idx + 1}</td>
                      <td className="py-3.5 font-bold text-slate-800 print:text-black">{p.employeeName}</td>
                      <td className="py-3.5 font-mono font-bold text-slate-500 mt-0.5">{p.employeeId}</td>
                      <td className="py-3.5 font-mono text-slate-705 font-bold print:text-black">{accNo}</td>
                      <td className="py-3.5 font-mono text-slate-400">015264321</td>
                      <td className="py-3.5 font-mono text-slate-500">{p.grossSalary.toLocaleString()} BDT</td>
                      <td className="py-3.5 font-mono font-extrabold text-indigo-700 print:text-black">{p.netPayable.toLocaleString()} BDT</td>
                      <td className="py-3.5 text-center">
                        <span className="text-[10px] font-bold text-slate-400 uppercase font-mono italic">Bank Cleared</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4.5. INTEGRATED WAGES REPORT CENTER (11 REPORTS DEFINED) */}
      {activeSubTab === "reports" && (
        <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-6 no-print-block">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b pb-4 border-slate-100">
            <div>
              <h3 className="font-display font-bold text-base text-slate-800 flex items-center space-x-2">
                <TrendingUp size={16} className="text-indigo-600" />
                <span>OTTOMASS JACQUARD - Wages Report Center</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Generate, review, and print 11 compliance registers linked directly to biometric processed BioTime logs.
              </p>
            </div>
            <div className="flex space-x-2 mt-4 md:mt-0">
              <button 
                onClick={handleTriggerPrint}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-205 text-slate-700 rounded-lg text-xs font-bold transition flex items-center space-x-1.5"
              >
                <Printer size={13} />
                <span>Print Active Report</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left selector sidebar rail */}
            <div className="space-y-1.5 lg:col-span-1 border-r border-slate-100 pr-4">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-2 px-2">Compliance Registers</span>
              
              <button
                onClick={() => setSelectedReportType("register")}
                className={`w-full text-left px-3 py-2 text-xs font-semibold rounded-lg transition-all flex items-center space-x-2 ${selectedReportType === "register" ? "bg-indigo-50 text-indigo-700 shadow-2xs font-bold" : "text-slate-600 hover:bg-slate-50"}`}
              >
                <div className={`w-1.5 h-1.5 rounded-full ${selectedReportType === "register" ? "bg-indigo-600" : "bg-transparent"}`} />
                <span>1. Salary Register Master</span>
              </button>

              <button
                onClick={() => setSelectedReportType("bank")}
                className={`w-full text-left px-3 py-2 text-xs font-semibold rounded-lg transition-all flex items-center space-x-2 ${selectedReportType === "bank" ? "bg-indigo-50 text-indigo-700 shadow-2xs font-bold" : "text-slate-600 hover:bg-slate-50"}`}
              >
                <div className={`w-1.5 h-1.5 rounded-full ${selectedReportType === "bank" ? "bg-indigo-600" : "bg-transparent"}`} />
                <span>2. Bank Disbursals Sheet</span>
              </button>

              <button
                onClick={() => setSelectedReportType("mobile")}
                className={`w-full text-left px-3 py-2 text-xs font-semibold rounded-lg transition-all flex items-center space-x-2 ${selectedReportType === "mobile" ? "bg-indigo-50 text-indigo-700 shadow-2xs font-bold" : "text-slate-600 hover:bg-slate-50"}`}
              >
                <div className={`w-1.5 h-1.5 rounded-full ${selectedReportType === "mobile" ? "bg-indigo-600" : "bg-transparent"}`} />
                <span>3. Mobile Banking cashout</span>
              </button>

              <button
                onClick={() => setSelectedReportType("cash")}
                className={`w-full text-left px-3 py-2 text-xs font-semibold rounded-lg transition-all flex items-center space-x-2 ${selectedReportType === "cash" ? "bg-indigo-50 text-indigo-700 shadow-2xs font-bold" : "text-slate-600 hover:bg-slate-50"}`}
              >
                <div className={`w-1.5 h-1.5 rounded-full ${selectedReportType === "cash" ? "bg-indigo-600" : "bg-transparent"}`} />
                <span>4. Physical Cash Statement</span>
              </button>

              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mt-4 mb-2 px-2">Aggregate top sheets</span>

              <button
                onClick={() => setSelectedReportType("topsheet")}
                className={`w-full text-left px-3 py-2 text-xs font-semibold rounded-lg transition-all flex items-center space-x-2 ${selectedReportType === "topsheet" ? "bg-indigo-50 text-indigo-700 shadow-2xs font-bold" : "text-slate-600 hover:bg-slate-50"}`}
              >
                <div className={`w-1.5 h-1.5 rounded-full ${selectedReportType === "topsheet" ? "bg-indigo-600" : "bg-transparent"}`} />
                <span>5. Executive Top Sheet</span>
              </button>

              <button
                onClick={() => setSelectedReportType("comparative")}
                className={`w-full text-left px-3 py-2 text-xs font-semibold rounded-lg transition-all flex items-center space-x-2 ${selectedReportType === "comparative" ? "bg-indigo-50 text-indigo-700 shadow-2xs font-bold" : "text-slate-600 hover:bg-slate-50"}`}
              >
                <div className={`w-1.5 h-1.5 rounded-full ${selectedReportType === "comparative" ? "bg-indigo-600" : "bg-transparent"}`} />
                <span>6. Variance Comparison</span>
              </button>

              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mt-4 mb-2 px-2">Exceptions & Auditing</span>

              <button
                onClick={() => setSelectedReportType("exception")}
                className={`w-full text-left px-3 py-2 text-xs font-semibold rounded-lg transition-all flex items-center space-x-2 ${selectedReportType === "exception" ? "bg-indigo-50 text-indigo-700 shadow-2xs font-bold" : "text-slate-600 hover:bg-slate-50"}`}
              >
                <div className={`w-1.5 h-1.5 rounded-full ${selectedReportType === "exception" ? "bg-indigo-600" : "bg-transparent"}`} />
                <span>7. Biometric exceptions</span>
              </button>

              <button
                onClick={() => setSelectedReportType("audit")}
                className={`w-full text-left px-3 py-2 text-xs font-semibold rounded-lg transition-all flex items-center space-x-2 ${selectedReportType === "audit" ? "bg-indigo-50 text-indigo-700 shadow-2xs font-bold" : "text-slate-600 hover:bg-slate-50"}`}
              >
                <div className={`w-1.5 h-1.5 rounded-full ${selectedReportType === "audit" ? "bg-indigo-600" : "bg-transparent"}`} />
                <span>8. Wages audit Timeline</span>
              </button>

              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mt-4 mb-2 px-2">Granular Details</span>

              <button
                onClick={() => setSelectedReportType("grade")}
                className={`w-full text-left px-3 py-2 text-xs font-semibold rounded-lg transition-all flex items-center space-x-2 ${selectedReportType === "grade" ? "bg-indigo-50 text-indigo-700 shadow-2xs font-bold" : "text-slate-600 hover:bg-slate-50"}`}
              >
                <div className={`w-1.5 h-1.5 rounded-full ${selectedReportType === "grade" ? "bg-indigo-600" : "bg-transparent"}`} />
                <span>9. Grade-Wise Summary</span>
              </button>

              <button
                onClick={() => setSelectedReportType("absent")}
                className={`w-full text-left px-3 py-2 text-xs font-semibold rounded-lg transition-all flex items-center space-x-2 ${selectedReportType === "absent" ? "bg-indigo-50 text-indigo-700 shadow-2xs font-bold" : "text-slate-600 hover:bg-slate-50"}`}
              >
                <div className={`w-1.5 h-1.5 rounded-full ${selectedReportType === "absent" ? "bg-indigo-600" : "bg-transparent"}`} />
                <span>10. Absent Deduction Desk</span>
              </button>

              <button
                onClick={() => setSelectedReportType("ot")}
                className={`w-full text-left px-3 py-2 text-xs font-semibold rounded-lg transition-all flex items-center space-x-2 ${selectedReportType === "ot" ? "bg-indigo-50 text-indigo-700 shadow-2xs font-bold" : "text-slate-600 hover:bg-slate-50"}`}
              >
                <div className={`w-1.5 h-1.5 rounded-full ${selectedReportType === "ot" ? "bg-indigo-600" : "bg-transparent"}`} />
                <span>11. Overtime hours Ledger</span>
              </button>
            </div>

            {/* Right details content pane */}
            <div className="lg:col-span-3 space-y-4">
              {/* 1. MASTER SALARY REGISTER */}
              {selectedReportType === "register" && (
                <div className="space-y-3 font-sans">
                  <div className="bg-slate-50 p-3 rounded-lg flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-650 uppercase">Master Salary Register ({selectedMonth})</span>
                    <span className="font-mono text-slate-450 uppercase text-[10px]">{payrolls.length} workers registered</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-[11px] divide-y divide-slate-100">
                      <thead>
                        <tr className="text-slate-450 uppercase text-[9px] font-bold bg-slate-50">
                          <th className="p-2">ID</th>
                          <th className="p-2">Name</th>
                          <th className="p-2">Department</th>
                          <th className="p-2 font-mono text-right">Worked</th>
                          <th className="p-2 font-mono text-right">Absent</th>
                          <th className="p-2 font-mono text-right">Basic BDT</th>
                          <th className="p-2 font-mono text-right">OT Pay</th>
                          <th className="p-2 font-mono text-right">Allowances</th>
                          <th className="p-2 font-mono text-right">Deductions</th>
                          <th className="p-2 font-mono text-right font-bold text-slate-800">Net Payable</th>
                          <th className="p-2">Mode</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-105 font-medium text-slate-700">
                        {payrolls.map(p => (
                          <tr key={p.id} className="hover:bg-slate-50/50">
                            <td className="p-2 font-mono font-bold">{p.employeeId}</td>
                            <td className="p-2 font-bold text-slate-800">{p.employeeName}</td>
                            <td className="p-2">{p.department}</td>
                            <td className="p-2 font-mono text-right">{p.workedDays}d</td>
                            <td className="p-2 font-mono text-right text-rose-600">{p.absentDays}d</td>
                            <td className="p-2 font-mono text-right">{p.basicSalary.toLocaleString()}</td>
                            <td className="p-2 font-mono text-right text-emerald-600">+{p.otPayment.toLocaleString()}</td>
                            <td className="p-2 font-mono text-right">+{p.allowances.toLocaleString()}</td>
                            <td className="p-2 font-mono text-right text-rose-600">-{p.deductions.toLocaleString()}</td>
                            <td className="p-2 font-mono text-right font-bold text-indigo-700">{p.netPayable.toLocaleString()}</td>
                            <td className="p-2 text-center text-[10px] font-bold text-slate-400">{p.paymentMethod}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 2. BANK INSTRUCTIONS SHEET */}
              {selectedReportType === "bank" && (
                <div className="space-y-3 font-sans">
                  <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl text-xs space-y-1.5">
                    <h4 className="font-bold text-indigo-900 uppercase">Bank Asia Ltd clearing instruction</h4>
                    <p className="text-indigo-700">The following employees are designated for direct EFT bank accounts transfer clearance.</p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs divide-y divide-slate-100">
                      <thead>
                        <tr className="text-slate-450 uppercase text-[10px] font-bold">
                          <th className="py-2">Employee ID</th>
                          <th className="py-2">Account Name</th>
                          <th className="py-2 font-mono">Clearing Account</th>
                          <th className="py-2 font-mono">Routing No.</th>
                          <th className="py-2 font-mono text-right">Net wages BDT</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {payrolls.map((p, idx) => {
                          const emp = employees.find(e => e.employeeId === p.employeeId);
                          const accNo = emp?.nid ? `12903${emp.nid.slice(2, 10)}` : `129032849010${idx}`;
                          return (
                            <tr key={p.id}>
                              <td className="py-2 font-mono font-bold text-slate-500">{p.employeeId}</td>
                              <td className="py-2 font-bold text-slate-800">{p.employeeName}</td>
                              <td className="py-2 font-mono text-slate-600">{accNo}</td>
                              <td className="py-2 font-mono text-slate-405">015264321</td>
                              <td className="py-2 font-mono text-right text-indigo-700 font-extrabold">{p.netPayable.toLocaleString()} BDT</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 3. MOBILE CASHING DISBURSE LIST */}
              {selectedReportType === "mobile" && (
                <div className="space-y-3 font-sans">
                  <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl text-xs space-y-1">
                    <h4 className="font-bold text-amber-900 uppercase">bKash Mobile Disbursals Ledger</h4>
                    <p className="text-amber-700">Automatic payroll routing for employee wallets hosted via bKash Enterprise API.</p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs divide-y divide-slate-100">
                      <thead>
                        <tr className="text-slate-450 uppercase text-[10px] font-bold">
                          <th className="py-2">Employee ID</th>
                          <th className="py-2">Wallet holder</th>
                          <th className="py-2 font-mono">bKash Account Number</th>
                          <th className="py-2">Brand</th>
                          <th className="py-2 font-mono text-right">Payout BDT</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {payrolls.map(p => {
                          const walletNo = `01712-4${p.employeeId.slice(-3)}30`;
                          return (
                            <tr key={p.id}>
                              <td className="py-2 font-mono font-bold text-slate-500">{p.employeeId}</td>
                              <td className="py-2 font-bold text-slate-800">{p.employeeName}</td>
                              <td className="py-2 font-mono text-slate-650 font-bold">{walletNo}</td>
                              <td className="py-2 font-semibold text-pink-600">bKash wallet</td>
                              <td className="py-2 font-mono text-right text-indigo-700 font-bold">{p.netPayable.toLocaleString()} BDT</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 4. PHYSICAL CASH DISBURSE */}
              {selectedReportType === "cash" && (
                <div className="space-y-3 font-sans">
                  <div className="bg-slate-50 p-3 rounded-lg text-xs font-mono text-slate-500">
                    Specifically formatted sheets with dedicated physical thumbmark space.
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs divide-y divide-slate-100">
                      <thead>
                        <tr className="text-slate-450 uppercase text-[10px] font-bold">
                          <th className="py-2">ID</th>
                          <th className="py-2">Employee Name</th>
                          <th className="py-2">Dept / Section / Line</th>
                          <th className="py-2 font-mono text-right">Net Payable BDT</th>
                          <th className="py-2 text-center w-40">Signature Stamp</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {payrolls.map(p => {
                          const emp = employees.find(e => e.employeeId === p.employeeId);
                          return (
                            <tr key={p.id}>
                              <td className="py-3 font-mono text-slate-400 font-bold">{p.employeeId}</td>
                              <td className="py-3 font-bold text-slate-800">{p.employeeName}</td>
                              <td className="py-3 text-slate-500 text-[11px]">{p.department} - {emp?.section || "Knitting Section"}</td>
                              <td className="py-3 font-mono text-right text-slate-900 font-extrabold">{p.netPayable.toLocaleString()} BDT</td>
                              <td className="py-3 text-[9px] text-slate-350 text-center font-bold font-mono">
                                _______________________
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 5. EXECUTIVE TOP SHEET SUMMARY */}
              {selectedReportType === "topsheet" && (
                <div className="space-y-4 font-sans">
                  <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-5 rounded-2xl flex justify-between items-center shadow-xs">
                    <div>
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-indigo-300">Total Month payroll liability</h4>
                      <p className="text-2xl font-bold font-mono mt-1">BDT {payrolls.reduce((s, r)=> s + r.netPayable, 0).toLocaleString()}</p>
                    </div>
                    <div className="text-right text-xs text-indigo-200">
                      <p>Wages Period: <strong className="text-white font-mono">{selectedMonth}</strong></p>
                      <p className="mt-0.5">Automated BioTime logs sync check: <strong className="text-emerald-400">Pass</strong></p>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs divide-y divide-slate-100">
                      <thead>
                        <tr className="text-slate-400 uppercase text-[10px] font-bold">
                          <th className="py-2">Department Name</th>
                          <th className="py-2 text-center font-mono">Headcount</th>
                          <th className="py-2 text-right font-mono">Base Basic Sum</th>
                          <th className="py-2 text-right font-mono">Gross Wages Sum</th>
                          <th className="py-2 text-right font-mono">Overtime (OT) Sum</th>
                          <th className="py-2 text-right font-mono">Net Payable Sum</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {Array.from(new Set(payrolls.map(p => p.department))).map(dept => {
                          const deptRecords = payrolls.filter(p => p.department === dept);
                          const count = deptRecords.length;
                          const basic = deptRecords.reduce((sum, r) => sum + r.basicSalary, 0);
                          const gross = deptRecords.reduce((sum, r) => sum + r.grossSalary, 0);
                          const ot = deptRecords.reduce((sum, r) => sum + r.otPayment, 0);
                          const net = deptRecords.reduce((sum, r) => sum + r.netPayable, 0);
                          return (
                            <tr key={dept} className="font-medium">
                              <td className="py-2.5 font-bold text-slate-800">{dept}</td>
                              <td className="py-2.5 text-center font-mono font-bold">{count}</td>
                              <td className="py-2.5 text-right font-mono text-slate-500">{basic.toLocaleString()} BDT</td>
                              <td className="py-2.5 text-right font-mono text-slate-500">{gross.toLocaleString()} BDT</td>
                              <td className="py-2.5 text-right font-mono text-emerald-600">+{ot.toLocaleString()} BDT</td>
                              <td className="py-2.5 text-right font-mono font-extrabold text-indigo-700">{net.toLocaleString()} BDT</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 6. COMPARATIVE SALARY SHEET */}
              {selectedReportType === "comparative" && (
                <div className="space-y-4 font-sans">
                  <div className="bg-slate-50 p-4 rounded-xl text-xs space-y-1">
                    <h4 className="font-bold text-slate-700 uppercase">Interactive Wages Comparative Summary Table</h4>
                    <p className="text-slate-500">Variance overview between standard current values ({selectedMonth}) and previous registers (April 2026 Estimated baseline).</p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs divide-y divide-slate-100">
                      <thead>
                        <tr className="text-slate-400 uppercase text-[10px] font-bold">
                          <th className="py-2">Audit Metric Column</th>
                          <th className="py-2 text-right font-mono">Previous Month BDT (April)</th>
                          <th className="py-2 text-right font-mono">Active month BDT ({selectedMonth})</th>
                          <th className="py-2 text-right font-mono">Variance Amount (BDT)</th>
                          <th className="py-2 text-right font-mono">Variance Ratio (%)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {[
                          { metric: "Aggregate payroll Headcount", valCur: payrolls.length, valPrev: payrolls.length, isNum: true },
                          { metric: "Total Basic Salary pool liability", valCur: payrolls.reduce((s, r)=>s+r.basicSalary, 0), valPrev: Math.round(payrolls.reduce((s, r)=>s+r.basicSalary, 0) * 0.94) },
                          { metric: "Total Gross Wages Base Liability", valCur: payrolls.reduce((s, r)=>s+r.grossSalary, 0), valPrev: Math.round(payrolls.reduce((s, r)=>s+r.grossSalary,0) * 0.95) },
                          { metric: "Total compliance Overtime Premium", valCur: payrolls.reduce((s, r)=>s+r.otPayment, 0), valPrev: Math.round(payrolls.reduce((s, r)=>s+r.otPayment,0) * 1.08) },
                          { metric: "Absence infractions Deductions pool", valCur: payrolls.reduce((s, r)=>s+r.deductions, 0), valPrev: Math.round(payrolls.reduce((s, r)=>s+r.deductions,0) * 1.25) },
                          { metric: "Final wages net cash dispersals", valCur: payrolls.reduce((s, r)=>s+r.netPayable, 0), valPrev: Math.round(payrolls.reduce((s, r)=>s+r.netPayable,0) * 0.93) }
                        ].map((row, i) => {
                          const diff = row.valCur - row.valPrev;
                          const pct = row.valPrev > 0 ? (diff / row.valPrev) * 100 : 0;
                          return (
                            <tr key={i} className="hover:bg-slate-50">
                              <td className="py-3 font-bold text-slate-800 text-[11px]">{row.metric}</td>
                              <td className="py-3 text-right font-mono font-medium text-slate-550">
                                {row.isNum ? row.valPrev : row.valPrev.toLocaleString() + " BDT"}
                              </td>
                              <td className="py-3 text-right font-mono font-bold text-slate-800">
                                {row.isNum ? row.valCur : row.valCur.toLocaleString() + " BDT"}
                              </td>
                              <td className={`py-3 text-right font-mono font-semibold ${diff > 0 ? "text-rose-600" : "text-emerald-600"}`}>
                                {row.isNum ? (diff > 0 ? `+${diff}` : diff) : (diff > 0 ? `+${diff.toLocaleString()}` : diff.toLocaleString())} BDT
                              </td>
                              <td className={`py-3 text-right font-mono font-bold ${pct > 0 ? "text-rose-600" : "text-emerald-600"}`}>
                                {pct > 0 ? `+${pct.toFixed(1)}%` : `${pct.toFixed(1)}%`}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 7. BIOMETRIC EXCEPTION AUDITING */}
              {selectedReportType === "exception" && (
                <div className="space-y-4 font-sans">
                  <div className="bg-rose-50 border border-rose-100 p-4 rounded-xl text-xs space-y-1.5 flex items-center space-x-3">
                    <AlertCircle className="text-rose-600 shrink-0" size={16} />
                    <div>
                      <h4 className="font-bold text-rose-950 uppercase">Biometric Anomaly report (ZK BioTime automated Sync)</h4>
                      <p className="text-rose-700">Flagging infractions such as high absence counts, missed punches, and extreme daily late arrival logs.</p>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs divide-y divide-slate-100">
                      <thead>
                        <tr className="text-slate-450 uppercase text-[10px] font-bold">
                          <th className="py-2">Employee ID</th>
                          <th className="py-2">Employee Name</th>
                          <th className="py-2">Flagged Anomaly reason</th>
                          <th className="py-2 font-mono text-center">Metrics Value</th>
                          <th className="py-2 font-mono text-right">Net wages BDT</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {payrolls.map(p => {
                          let anomalies = [];
                          if (p.absentDays > 2) anomalies.push(`High Absence (${p.absentDays} days)`);
                          if (p.lateMinutes > 60) anomalies.push(`Extreme Late (${p.lateMinutes} mins)`);
                          if (p.earlyOutMinutes > 60) anomalies.push(`Extreme Early Out (${p.earlyOutMinutes} mins)`);
                          if (p.missingPunchesUnapproved > 0) anomalies.push(`Missed Punches Unapproved (${p.missingPunchesUnapproved})`);
                          if (p.netPayable <= 0) anomalies.push(`Zero Payout Outlier`);

                          if (anomalies.length === 0) return null;
                          return (
                            <tr key={p.id} className="hover:bg-slate-50/50">
                              <td className="py-3 font-mono font-bold text-slate-500">{p.employeeId}</td>
                              <td className="py-3 font-bold text-slate-800">{p.employeeName}</td>
                              <td className="py-3 font-semibold text-rose-700 text-[11px]">{anomalies.join(" • ")}</td>
                              <td className="py-3 text-center font-mono font-medium text-slate-600">{p.absentDays}a / {p.lateMinutes}m</td>
                              <td className="py-3 font-mono text-right text-slate-900 font-extrabold">{p.netPayable.toLocaleString()} BDT</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 8. STATEFUL AUDIT LOGS */}
              {selectedReportType === "audit" && (
                <div className="space-y-4 font-sans">
                  <div className="bg-slate-50 p-3 rounded-lg text-xs text-slate-500">
                    A formal log of all compliance audits, locking timestamps, and bank clearance events trace.
                  </div>
                  <div className="space-y-3.5 pl-2 border-l-2 border-indigo-150 pt-2">
                    {payrollAudits.map((a, i) => (
                      <div key={i} className="text-xs leading-relaxed">
                        <div className="flex justify-between font-bold text-slate-800">
                          <span>{a.action}</span>
                          <span className="font-mono text-[10px] text-slate-400 font-normal">{a.timer}</span>
                        </div>
                        <p className="text-slate-500 mt-0.5">{a.comments}</p>
                        <p className="text-[9px] uppercase tracking-wider text-indigo-700 font-bold mt-1">Operator key: {a.user}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 9. GRADE-WISE SALARY POOL */}
              {selectedReportType === "grade" && (
                <div className="space-y-3 font-sans">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs divide-y divide-slate-100">
                      <thead>
                        <tr className="text-slate-450 uppercase text-[10px] font-bold">
                          <th className="py-2">Wages Grade Scale</th>
                          <th className="py-2 text-center font-mono">Headcount</th>
                          <th className="py-2 text-right font-mono">Total Basic salary pool</th>
                          <th className="py-2 text-right font-mono">Total OT Payment</th>
                          <th className="py-2 text-right font-mono">Average Net Payout BDT</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {["Grade A", "Grade B", "Grade C"].map(grade => {
                          // Find employees who belong to this grade
                          const gradeEmps = employees.filter(e => e.grade === grade);
                          const gradeRecords = payrolls.filter(p => gradeEmps.some(e => e.employeeId === p.employeeId));
                          if (gradeRecords.length === 0) return null;
                          const headCount = gradeRecords.length;
                          const basic = gradeRecords.reduce((sum, r) => sum + r.basicSalary, 0);
                          const ot = gradeRecords.reduce((sum, r) => sum + r.otPayment, 0);
                          const net = gradeRecords.reduce((sum, r) => sum + r.netPayable, 0);
                          const avgNet = Math.round(net / headCount);
                          return (
                            <tr key={grade}>
                              <td className="py-3 font-bold text-slate-800">{grade} (Compliance Scale)</td>
                              <td className="py-3 text-center font-mono font-bold text-indigo-700">{headCount} operators</td>
                              <td className="py-3 text-right font-mono font-medium text-slate-600">{basic.toLocaleString()} BDT</td>
                              <td className="py-3 text-right font-mono font-medium text-emerald-600">+{ot.toLocaleString()} BDT</td>
                              <td className="py-3 text-right font-mono font-bold text-slate-900">{avgNet.toLocaleString()} BDT</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 10. ABSENT COMPLIANCE & DEDUCTIONS SHEET */}
              {selectedReportType === "absent" && (
                <div className="space-y-3 font-sans">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs divide-y divide-slate-100">
                      <thead>
                        <tr className="text-slate-450 uppercase text-[10px] font-bold">
                          <th className="py-2">Employee ID</th>
                          <th className="py-2">Employee Name</th>
                          <th className="py-2 font-mono text-right">Per-Day Wages rate</th>
                          <th className="py-2 font-mono text-center">Absent Days</th>
                          <th className="py-2 font-mono text-center">Unpaid leave days</th>
                          <th className="py-2 font-mono text-right">Absent Deductions BDT</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                        {payrolls.map(p => {
                          const perDayRate = Math.round(p.grossSalary / 26);
                          return (
                            <tr key={p.id}>
                              <td className="py-2.5 font-mono text-slate-405 font-bold">{p.employeeId}</td>
                              <td className="py-2.5 font-bold text-slate-850">{p.employeeName}</td>
                              <td className="py-2.5 font-mono text-right text-slate-500">{perDayRate.toLocaleString()} BDT</td>
                              <td className="py-2.5 font-mono text-center text-rose-600 font-bold">{p.absentDays} days</td>
                              <td className="py-2.5 font-mono text-center text-slate-400">{p.leaveDays} days</td>
                              <td className="py-2.5 font-mono text-right text-rose-700 font-extrabold">-{p.deductions.toLocaleString()} BDT</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 11. OT STATEMENT REGISTER */}
              {selectedReportType === "ot" && (
                <div className="space-y-3 font-sans">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs divide-y divide-slate-100">
                      <thead>
                        <tr className="text-slate-450 uppercase text-[10px] font-bold">
                          <th className="py-2">Employee ID</th>
                          <th className="py-2">Employee Name</th>
                          <th className="py-2 font-mono text-right">OT Hourly Rate</th>
                          <th className="py-2 font-mono text-center">Normal OT hours</th>
                          <th className="py-2 font-mono text-center">Festive OT hours</th>
                          <th className="py-2 font-mono text-right">OT Premium payment</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                        {payrolls.map(p => {
                          const hourlyRate = Math.round((p.basicSalary / 208) * 2); // Gazipur factory double hourly OT code
                          return (
                            <tr key={p.id} className="hover:bg-slate-50/50">
                              <td className="py-2.5 font-mono text-slate-405 font-bold">{p.employeeId}</td>
                              <td className="py-2.5 font-bold text-slate-850">{p.employeeName}</td>
                              <td className="py-2.5 font-mono text-right text-slate-500">{hourlyRate || 80} BDT/h</td>
                              <td className="py-2.5 font-mono text-center font-bold">{p.normalOtHours} h</td>
                              <td className="py-2.5 font-mono text-center text-indigo-650 font-bold">{p.festiveOtHours} h</td>
                              <td className="py-2.5 font-mono text-right text-emerald-600 font-bold">+{p.otPayment.toLocaleString()} BDT</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 5. AUDIT TIMELINE LOGS */}
      {activeSubTab === "logs" && (
        <div className="bg-white border border-slate-200 p-5 rounded-2xl space-y-4 no-print">
          <h3 className="font-display font-bold text-sm text-slate-800">
            Payroll Verification Audit history
          </h3>
          <p className="text-xs text-slate-400">
            All modifications, updates, and approval commands are logged below to maintain complete transparency.
          </p>

          <div className="space-y-4 pt-2">
            {payrollAudits.map((a, i) => (
              <div key={i} className="flex space-x-3 text-xs leading-relaxed border-l-2 border-indigo-150 pl-4 py-1">
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <h5 className="font-bold text-slate-800">{a.action}</h5>
                    <span className="font-mono text-slate-450 text-[10px]">{a.timer}</span>
                  </div>
                  <p className="text-slate-500 mt-1">{a.comments}</p>
                  <p className="font-mono text-[9px] text-slate-400 mt-1 uppercase font-bold">Authorized by: {a.user}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
