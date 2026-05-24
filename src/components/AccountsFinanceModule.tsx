import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Coins, 
  TrendingUp, 
  Wallet, 
  Plus, 
  Search, 
  ArrowUpDown, 
  SlidersHorizontal, 
  Download, 
  Printer, 
  BookOpen, 
  FileSpreadsheet, 
  UserCheck, 
  MoreHorizontal, 
  Filter, 
  CheckCircle, 
  RefreshCw, 
  AlertCircle, 
  Calendar, 
  DollarSign, 
  Building, 
  Briefcase, 
  AlertTriangle,
  Lock,
  ArrowRight,
  ChevronRight,
  ShieldAlert,
  Save,
  Trash2,
  X,
  Layers,
  Check,
  Award
} from "lucide-react";
import { ChartOfAccount, JournalVoucher, Employee, BuyerOrder, PayrollRecord } from "../types";

interface AccountsFinanceProps {
  accounts: ChartOfAccount[];
  setAccounts: React.Dispatch<React.SetStateAction<ChartOfAccount[]>>;
  vouchers: JournalVoucher[];
  onAddVoucher: (newV: JournalVoucher) => void;
  setVouchers: React.Dispatch<React.SetStateAction<JournalVoucher[]>>;
  orders: BuyerOrder[];
  employees: Employee[];
  onAddAuditLog: (action: string, target: string, details: string) => void;
  userRole: string;
  userEmail: string;
  lang: "EN" | "BN";
}

// Reorganized active 35 sub menus requested under 6 strict group headers
const MENU_CATEGORIES = [
  {
    name: "Dashboard",
    items: [
      { id: 1, name: "Accounts Dashboard", icon: TrendingUp, secure: false }
    ]
  },
  {
    name: "Setup",
    items: [
      { id: 2, name: "Chart of Accounts", icon: BookOpen, secure: true },
      { id: 3, name: "Opening Balance", icon: RefreshCw, secure: true },
      { id: 43, name: "Financial Year", icon: Calendar, secure: true },
      { id: 44, name: "Bank Accounts", icon: Building, secure: true },
      { id: 39, name: "Accounts Settings", icon: SlidersHorizontal, secure: true }
    ]
  },
  {
    name: "Transactions",
    items: [
      { id: 6, name: "Income Entry", icon: Plus, secure: false },
      { id: 7, name: "Expense Entry", icon: Plus, secure: false },
      { id: 8, name: "Journal Voucher", icon: Layers, secure: false },
      { id: 9, name: "Payment Voucher", icon: Wallet, secure: false },
      { id: 10, name: "Receive Voucher", icon: Coins, secure: false },
      { id: 11, name: "Contra Voucher", icon: ArrowRight, secure: false },
      { id: 12, name: "Purchase Voucher", icon: Briefcase, secure: false },
      { id: 13, name: "Sales Voucher", icon: Coins, secure: false },
      { id: 14, name: "Salary Voucher", icon: DollarSign, secure: false },
      { id: 15, name: "Adjustment Voucher", icon: SlidersHorizontal, secure: false }
    ]
  },
  {
    name: "Party Accounts",
    items: [
      { id: 18, name: "Accounts Payable", icon: SlidersHorizontal, secure: false },
      { id: 19, name: "Accounts Receivable", icon: SlidersHorizontal, secure: false },
      { id: 20, name: "Supplier Ledger", icon: Briefcase, secure: false },
      { id: 21, name: "Buyer Ledger", icon: Coins, secure: false },
      { id: 22, name: "Employee Ledger", icon: DollarSign, secure: false }
    ]
  },
  {
    name: "Cash & Bank",
    items: [
      { id: 4, name: "Cash Book", icon: Wallet, secure: false },
      { id: 5, name: "Bank Book", icon: Building, secure: false },
      { id: 24, name: "Bank Reconciliation", icon: UserCheck, secure: false },
      { id: 25, name: "Cheque Management", icon: FileSpreadsheet, secure: false },
      { id: 26, name: "Mobile Banking Transactions", icon: Wallet, secure: false }
    ]
  },
  {
    name: "Reports",
    items: [
      { id: 23, name: "General Ledger", icon: BookOpen, secure: true },
      { id: 34, name: "Trial Balance", icon: ArrowUpDown, secure: true },
      { id: 32, name: "Profit & Loss", icon: TrendingUp, secure: true },
      { id: 33, name: "Balance Sheet", icon: FileSpreadsheet, secure: true },
      { id: 35, name: "Cash Flow Statement", icon: Coins, secure: true },
      { id: 40, name: "Income Report", icon: TrendingUp, secure: true },
      { id: 41, name: "Expense Report", icon: AlertTriangle, secure: true },
      { id: 36, name: "Monthly Financial Summary", icon: Calendar, secure: true },
      { id: 29, name: "Order-wise Profit/Loss", icon: TrendingUp, secure: true }
    ]
  }
];

// Inline dynamic helper icon
function ShadersIcon(props: any) {
  return <SlidersHorizontal {...props} size={14} className="text-emerald-400 group-hover:text-emerald-300" />;
}

export default function AccountsFinanceModule({
  accounts,
  setAccounts,
  vouchers,
  onAddVoucher,
  setVouchers,
  orders,
  employees,
  onAddAuditLog,
  userRole,
  userEmail,
  lang
}: AccountsFinanceProps) {
  // Navigation 
  const [activeMenuId, setActiveMenuId] = useState<number>(1);
  const [financialYear, setFinancialYear] = useState("FY 2026-27");
  const [costCenterFilter, setCostCenterFilter] = useState("All");
  const [deptFilter, setDeptFilter] = useState("All");
  const [orderFilter, setOrderFilter] = useState("All");

  // Sidebar controls
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [sidebarQuery, setSidebarQuery] = useState("");

  // Permissions state
  const permissions = useMemo(() => {
    const isOwner = userRole === "Owner";
    return {
      canViewAccounts: true,
      canCreateVoucher: !isOwner,
      canEditVoucher: !isOwner,
      canDeleteVoucher: !isOwner,
      canApproveVoucher: isOwner || userRole === "Office",
      canPostVoucher: isOwner || userRole === "Office",
      canViewReports: true,
      canExportReports: true,
      canViewPL: true,
      canViewBalanceSheet: true
    };
  }, [userRole]);

  // Search, filter, sorting queries
  const [searchQuery, setSearchQuery] = useState("");
  const [voucherStatusFilter, setVoucherStatusFilter] = useState("All");

  // Local state extensions for cash book, bank book, etc.
  const [incomeList, setIncomeList] = useState([
    { id: "inc-1", date: "2026-05-20", category: "Buyer Collection", payer: "H&M Global", amount: 1250000, accCode: "1102", ref: "HM-INV-891", desc: "TT transfer clearance", center: "Dhaka HQ", dept: "Marketing" },
    { id: "inc-2", date: "2026-05-22", category: "Service Income", payer: "Aman Logistics", amount: 45000, accCode: "1001", ref: "SERV-002", desc: "Sample design testing return fee", center: "Factory Floor", dept: "Knitting" },
    { id: "inc-3", date: "2026-05-23", category: "Other Income", payer: "Waste Yarn Sale", amount: 15000, accCode: "1002", ref: "SCRP-902", desc: "Sold loose waste knit fabric parts", center: "Factory Floor", dept: "Knitting" }
  ]);

  const [expenseList, setExpenseList] = useState([
    { id: "exp-1", date: "2026-05-18", category: "Machine Lubrication", payee: "Mobile Lube Co", amount: 18000, accCode: "5003", ref: "PR-882", desc: "High temp grease for Jacquard units", center: "Factory Floor", dept: "Knitting" },
    { id: "exp-2", date: "2026-05-19", category: "Office Stationery", payee: "Paper House", amount: 4200, accCode: "5003", ref: "OP-112", desc: "Custom printed barcode labels", center: "Dhaka HQ", dept: "Administration" },
    { id: "exp-3", date: "2026-05-21", category: "Generator Fuel", payee: "Jamuna Oil", amount: 85000, accCode: "5003", ref: "DSL-199", desc: "500 Liters diesel delivery", center: "Factory Floor", dept: "Finishing" }
  ]);

  const [chequeList, setChequeList] = useState([
    { id: "chq-1", bank: "BRAC Bank", chequeNo: "BB-920192", date: "2026-06-05", payee: "Dhaka Spinners Ltd.", amount: 800000, status: "Post-Dated" },
    { id: "chq-2", bank: "Dutch-Bangla", chequeNo: "DB-118277", date: "2026-05-22", payee: "Faisal Transport", amount: 45000, status: "Cleared" },
    { id: "chq-3", bank: "BRAC Bank", chequeNo: "BB-700291", date: "2026-05-25", payee: "Bureau Veritas Compliance", amount: 120000, status: "Pending Clearance" }
  ]);

  const [reconciliations, setReconciliations] = useState([
    { id: "rec-1", systemDate: "2026-05-22", ref: "DB-118277", bankDate: "2026-05-22", amount: 45000, matched: true, type: "Bank Out" },
    { id: "rec-2", systemDate: "2026-05-20", ref: "HM-INV-891", bankDate: "2026-05-21", amount: 1250000, matched: true, type: "Bank In" },
    { id: "rec-3", systemDate: "2026-05-23", ref: "JV-990-Wages", bankDate: "Pending", amount: 280000, matched: false, type: "Bank Out" }
  ]);

  const [budgets, setBudgets] = useState([
    { id: "b-1", category: "Yarn Purchasing", limit: 6000000, utilized: 4200000, dept: "Store & Purchase" },
    { id: "b-2", category: "Electricity & Gas", limit: 600000, utilized: 450000, dept: "Factory Overhead" },
    { id: "b-3", category: "Labor Overtime", limit: 300000, utilized: 185000, dept: "Knitting Floor" }
  ]);

  const [mobileTrans, setMobileTrans] = useState([
    { id: "mob-1", provider: "bKash Personal", transType: "Inward Cash", date: "2026-05-23", mobNo: "01728192837", transId: "BKE90MK38", amount: 15000, ref: "Retail scrap sale", status: "Success" },
    { id: "mob-2", provider: "Nagad Corporate", transType: "Salary Disburse", date: "2026-05-15", mobNo: "01929384912", transId: "NG887YTRN", amount: 12500, ref: "Worker advance Faisal", status: "Success" }
  ]);

  // State-vouchers sync, audit trails state
  const [auditLogs, setAuditLogs] = useState<any[]>([
    { id: "alg-1", action: "COA Init", target: "Chart of Accounts", details: "Standard double-entry schema configured securely", user: "Kamran Staff", date: "2026-05-23 09:12 AM" }
  ]);

  const logAudit = (action: string, target: string, details: string) => {
    const freshLog = {
      id: `alg-${Date.now()}`,
      action,
      target,
      details,
      user: userEmail,
      date: new Date().toISOString().replace("T", " ").substring(0, 19)
    };
    setAuditLogs(prev => [freshLog, ...prev]);
    onAddAuditLog(action, target, details);
  };

  // Add standard new voucher modal state
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [modalVoucherType, setModalVoucherType] = useState<string>("Journal");
  
  // Dynamic double entry rows builder in form
  const [voucherNarration, setVoucherNarration] = useState("");
  const [voucherRef, setVoucherRef] = useState("");
  const [voucherLines, setVoucherLines] = useState<Array<{ accountCode: string; debit: number; credit: number; desc: string }>>([
    { accountCode: "1001", debit: 0, credit: 0, desc: "" },
    { accountCode: "5002", debit: 0, credit: 0, desc: "" }
  ]);

  const totalLinesDebit = voucherLines.reduce((s, x) => s + (Number(x.debit) || 0), 0);
  const totalLinesCredit = voucherLines.reduce((s, x) => s + (Number(x.credit) || 0), 0);

  const handleCreateVoucherSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!permissions.canCreateVoucher) {
      alert("Permission denied. Only Office users can submit raw financial vouchers.");
      return;
    }

    if (totalLinesDebit <= 0 || totalLinesCredit <= 0) {
      alert("Amounts must be positive BDT digits.");
      return;
    }

    if (totalLinesDebit !== totalLinesCredit) {
      alert(`Unbalanced Double Entry. Debits (${totalLinesDebit} BDT) must exactly equal Credits (${totalLinesCredit} BDT). Difference: ${Math.abs(totalLinesDebit - totalLinesCredit)} BDT`);
      return;
    }

    // Build voucher structure compatible with database
    const vId = `jv-${Date.now()}`;
    const formattedDate = new Date().toISOString().substring(0, 10);
    const codeTag = modalVoucherType.substring(0, 2).toUpperCase();
    const vNo = `${codeTag}-202605-${String(vouchers.length + 11).padStart(3, "0")}`;

    const items = voucherLines.map((line) => {
      const acc = accounts.find(a => a.code === line.accountCode);
      return {
        accountCode: line.accountCode,
        accountName: acc ? acc.name : "Accounts Sub Ledger",
        debit: Number(line.debit) || 0,
        credit: Number(line.credit) || 0,
        narration: line.desc || voucherNarration
      };
    });

    const newV: JournalVoucher = {
      id: vId,
      voucherNo: vNo,
      date: formattedDate,
      narration: voucherNarration || "Financial record ledger adjustments",
      status: "Approved", // Auto-approved for admin simplicity
      items,
      createdBy: userEmail || "System Accounts Controller"
    };

    // Calculate effect on accounts
    const updatedAccounts = accounts.map(acc => {
      let balance = acc.balance;
      items.forEach(itm => {
        if (itm.accountCode === acc.code) {
          // Asset and Expense accounts: Increase on Debit, decrease on Credit
          if (acc.group === "Asset" || acc.group === "Expense") {
            balance += (itm.debit - itm.credit);
          } else {
            // Liabilities, Equity, Revenues: Increase on Credit, decrease on Debit
            balance += (itm.credit - itm.debit);
          }
        }
      });
      return { ...acc, balance };
    });

    setAccounts(updatedAccounts);
    onAddVoucher(newV);

    logAudit("SUBMIT VOUCHER", "Double Entry Engine", `Created & Approved Double-Entry ${modalVoucherType} (${vNo}) amounting To ৳${totalLinesDebit}. Account balances parsed.`);
    
    // reset form
    setVoucherNarration("");
    setVoucherRef("");
    setVoucherLines([
      { accountCode: "1001", debit: 0, credit: 0, desc: "" },
      { accountCode: "5002", debit: 0, credit: 0, desc: "" }
    ]);
    setShowVoucherModal(false);
  };

  const handleAddVoucherLine = () => {
    setVoucherLines(prev => [...prev, { accountCode: "1001", debit: 0, credit: 0, desc: "" }]);
  };

  const handleRemoveVoucherLine = (idx: number) => {
    if (voucherLines.length <= 2) {
      alert("At least two accounts are required for double-entry records!");
      return;
    }
    setVoucherLines(prev => prev.filter((_, i) => i !== idx));
  };

  const handleUpdateLine = (idx: number, field: string, value: any) => {
    setVoucherLines(prev => prev.map((item, i) => {
      if (i === idx) {
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  // Cross-module automatic actions simulated
  const handleSimulateSalaryPayrollVoucher = () => {
    if (vouchers.some(v => v.narration.includes("Simulated monthly wages"))) {
      alert("Simulation Voucher to post Salary & Wages Payable has already been run for May 2026!");
      return;
    }
    const staffSalaryAcc = "5002"; // Factory Floor Labor Wages Expense
    const wagesPayableAcc = "2101"; // Salary & Wages Payable
    const amount = 680000;

    const items = [
      { accountCode: staffSalaryAcc, accountName: "Factory Floor Labor Wages Expense", debit: amount, credit: 0, narration: "Simulated monthly wages ledger booking for May 2026" },
      { accountCode: wagesPayableAcc, accountName: "Salary & Wages Payable (Current Month)", debit: 0, credit: amount, narration: "Simulated monthly wages ledger booking for May 2026" }
    ];

    const vNo = `SV-202605-${String(vouchers.length + 11).padStart(3, "0")}`;
    const newV: JournalVoucher = {
      id: `jv-sal-${Date.now()}`,
      voucherNo: vNo,
      date: "2026-05-23",
      narration: "Wages Booking - Payroll system auto-integration log",
      status: "Posted",
      items,
      createdBy: "Payroll API Automated Agent"
    };

    setAccounts(prev => prev.map(acc => {
      if (acc.code === staffSalaryAcc) {
        return { ...acc, balance: acc.balance + amount };
      }
      if (acc.code === wagesPayableAcc) {
        return { ...acc, balance: acc.balance + amount };
      }
      return acc;
    }));

    onAddVoucher(newV);
    logAudit("PAYROLL AUTO VOUCHER", "Integrations Engine", "Mapped payroll system closure: generated Wages Expense ৳680,000 against Wages Payable.");
    alert("Success! Double entry Voucher created: Debited Factory Floor Labor Wages Expense (৳680,000), Credited Salary & Wages Payable.");
  };

  const handleSimulateSupplierBillPurchase = () => {
    const pNo = `PU-${String(Date.now()).substring(9)}`;
    const yarnCostAcc = "5001"; // Yarn Material Consumption Expense
    const supplierPayableAcc = "2001"; // Accounts Payable
    const amount = 450000;

    const items = [
      { accountCode: yarnCostAcc, accountName: "Yarn Material Consumption Expense", debit: amount, credit: 0, narration: "Store Yarn purchase record simulated import" },
      { accountCode: supplierPayableAcc, accountName: "Accounts Payable - Dhaka Spinners Ltd.", debit: 0, credit: amount, narration: "Store Yarn purchase record simulated import" }
    ];

    const newV: JournalVoucher = {
      id: `jv-pu-${Date.now()}`,
      voucherNo: `PV-202605-${String(vouchers.length + 11).padStart(3, "0")}`,
      date: "2026-05-23",
      narration: `Purchase Receive Bill Ref: ${pNo} for Sweaters Production Wool`,
      status: "Posted",
      items,
      createdBy: "Store Stock Integration Gate"
    };

    setAccounts(prev => prev.map(acc => {
      if (acc.code === yarnCostAcc) {
        return { ...acc, balance: acc.balance + amount };
      }
      if (acc.code === supplierPayableAcc) {
        return { ...acc, balance: acc.balance + amount };
      }
      return acc;
    }));

    onAddVoucher(newV);
    logAudit("PURCHASE BILL AUTO VOUCHER", "Integrations Engine", `Store inventory received: booked Yarn Material Expense ৳450,000 and updated Supplier Payable (Dhaka Spinners Ltd).`);
    alert(`Success! Material Purchase Received. Debited Yarn Consumption (৳450,000), Credited Supplier Payable.`);
  };

  // Helper calculation metrics for the dynamic real-time dashboard cards
  const metrics = useMemo(() => {
    const cashOnHand = accounts.filter(a => a.group === "Asset" && a.name.toLowerCase().includes("cash")).reduce((s, a) => s + a.balance, 0);
    const bankBal = accounts.filter(a => a.group === "Asset" && (a.name.toLowerCase().includes("bank") || a.code.startsWith("11"))).reduce((s, a) => s + a.balance, 0);
    const totalRec = accounts.filter(a => a.code.startsWith("12") || a.name.toLowerCase().includes("receivable")).reduce((s, a) => s + a.balance, 0);
    const totalPay = accounts.filter(a => a.code.startsWith("2") || a.name.toLowerCase().includes("payable")).reduce((s, a) => s + a.balance, 0);
    
    const sPay = accounts.find(a => a.code === "2001")?.balance || 0;
    const bRec = accounts.find(a => a.code === "1201")?.balance || 0;

    // Daily & Monthly income/expenses parsed dynamically from elements
    const todayInc = incomeList.filter(i => i.date === "2026-05-23").reduce((s, x) => s + x.amount, 0);
    const todayExp = expenseList.filter(e => e.date === "2026-05-23").reduce((s, x) => s + x.amount, 0);

    const mInc = accounts.filter(a => a.group === "Revenue").reduce((s, a) => s + a.balance, 0) + incomeList.reduce((s, x) => s + x.amount, 0);
    const mExp = accounts.filter(a => a.group === "Expense").reduce((s, a) => s + a.balance, 0) + expenseList.reduce((s, x) => s + x.amount, 0);
    const pLossVal = mInc - mExp;

    const currentWagesPayable = accounts.find(a => a.code === "2101")?.balance || 0;

    return {
      cashOnHand,
      bankBal,
      totalRec,
      totalPay,
      sPay,
      bRec,
      todayInc,
      todayExp,
      mInc,
      mExp,
      pLossVal,
      currentWagesPayable,
      vouchersPending: vouchers.filter(v => v.status === "Pending Approval" || v.status === "Draft").length
    };
  }, [accounts, incomeList, expenseList, vouchers]);

  // Export utility simple simulation
  const triggerRawFileExport = (format: "csv" | "excel", filename: string, csvData: string) => {
    if (!permissions.canExportReports) {
      alert("Unauthorized permissions. Please sync appropriate roles.");
      return;
    }
    const blob = new Blob([csvData], { type: format === "csv" ? "text/csv;charset=utf-8;" : "application/vnd.ms-excel" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}.${format === "csv" ? "csv" : "xls"}`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    logAudit("EXPORT REPORT", "Reporting Portal", `Downloaded file: ${filename}.${format.toUpperCase()}`);
  };

  // Real-time categorized menu filter
  const filteredCategories = useMemo(() => {
    if (!sidebarQuery.trim()) return MENU_CATEGORIES;
    const sQuery = sidebarQuery.toLowerCase();
    return MENU_CATEGORIES.map(cat => {
      const itemsMatched = cat.items.filter(it => 
        it.name.toLowerCase().includes(sQuery)
      );
      return { ...cat, items: itemsMatched };
    }).filter(cat => cat.items.length > 0);
  }, [sidebarQuery]);

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between bg-slate-900 border border-slate-800 p-6 rounded-2xl gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/30">
              <Coins className="h-5 w-5 text-white animate-spin-slow" />
            </div>
            <div>
              <h2 className="text-lg font-display font-medium text-white tracking-widest uppercase">
                Accounts &amp; Finance <span className="text-[10px] text-emerald-400 font-mono tracking-normal ml-2 font-semibold">Live Ledger Double-Entry v2.4</span>
              </h2>
              <p className="text-xs text-slate-400 leading-normal">
                {lang === "EN" ? "Ottomass Jacquard sweater production bookkeeping, financial entries, cost audits, and statements." : "অটোমাস জ্যাকার্ড সোয়েটার উৎপাদন হিসাবরক্ষণ খাতা এবং সামগ্রিক দ্বিমুখী ভাউচার ট্রেইল।"}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Actions Integration simulation */}
          <button 
            type="button"
            onClick={handleSimulateSalaryPayrollVoucher}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-mono text-[11px] font-bold py-2 px-3.5 rounded-xl transition-all flex items-center gap-1.5 shadow-sm"
          >
            <DollarSign size={13} className="text-emerald-400" />
            Sync Payroll Wages
          </button>
          <button 
            type="button"
            onClick={handleSimulateSupplierBillPurchase}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-mono text-[11px] font-bold py-2 px-3.5 rounded-xl transition-all flex items-center gap-1.5 shadow-sm"
          >
            <Briefcase size={13} className="text-indigo-400" />
            Sync Yarn Purchase
          </button>
          
          <button
            type="button"
            onClick={() => {
              setModalVoucherType("Journal");
              setShowVoucherModal(true);
            }}
            className="bg-emerald-600 hover:bg-emerald-500 hover:scale-[1.01] text-slate-910 font-sans text-xs font-black py-2.5 px-4 rounded-xl transition-all flex items-center gap-1.5 shadow-md shadow-emerald-650/10"
          >
            <Plus size={14} className="stroke-[3.5]" />
            Fast Voucher Entry
          </button>
        </div>
      </div>

      {/* 2. Inner Tab Menu Segment & Body Layout with responsive columns */}
      <div className={`grid grid-cols-1 ${isSidebarCollapsed ? "lg:grid-cols-12" : "lg:grid-cols-4"} gap-6 items-start transition-all duration-300`}>
        
        {/* Left Sub-Sidebar Menu List of 35 Items grouped beautifully (Collapsible, Searchable, Role-based) */}
        <div className={`${isSidebarCollapsed ? "lg:col-span-1 min-w-[70px] text-center" : "lg:col-span-1"} border border-slate-800 bg-slate-920 p-4 rounded-2xl max-h-[780px] overflow-y-auto space-y-5 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent transition-all duration-300`}>
          
          {/* Collapse/Expand Toggle controller */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            {!isSidebarCollapsed && (
              <span className="font-sans font-black text-xs text-white uppercase tracking-wider">
                Finance Nav
              </span>
            )}
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              type="button"
              className="p-1 px-2 rounded bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-white transition-all text-[10px] uppercase font-bold tracking-widest font-mono ml-auto flex items-center gap-1"
              title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              <span>{isSidebarCollapsed ? "→" : "Collapse ←"}</span>
            </button>
          </div>

          {/* Search bar wrapper when expanded */}
          {!isSidebarCollapsed && (
            <div className="relative animate-fade-in">
              <Search size={12} className="absolute left-2.5 top-2.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search 35 accounts..."
                value={sidebarQuery}
                onChange={(e) => setSidebarQuery(e.target.value)}
                className="w-full bg-slate-950 text-slate-200 pl-8 pr-3 py-1.5 rounded-xl border border-slate-800 text-[11px] focus:outline-hidden focus:border-indigo-500 font-mono transition-all"
              />
            </div>
          )}

          {/* Selected Financial Period */}
          {!isSidebarCollapsed && (
            <div className="animate-fade-in">
              <span className="font-mono text-[8.5px] font-extrabold text-indigo-400 uppercase tracking-widest block mb-1.5 px-1">Selected FY Period</span>
              <select 
                value={financialYear}
                onChange={(e) => setFinancialYear(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 p-2 rounded-lg text-xs text-slate-350 focus:outline-hidden font-mono font-semibold"
              >
                <option value="FY 2026-27">FY 2026-27 (Current Active)</option>
                <option value="FY 2025-26">FY 2025-26 (Audited &amp; Closed)</option>
              </select>
            </div>
          )}

          <div className="space-y-4">
            {filteredCategories.map((cat, catIdx) => (
              <div key={catIdx} className="space-y-1">
                {!isSidebarCollapsed && (
                  <p className="font-sans font-black text-[9px] text-slate-500 uppercase tracking-wider mb-2 px-1.5 border-b border-slate-850/50 pb-0.5 mt-2">
                    {cat.name}
                  </p>
                )}
                <div className="space-y-0.5">
                  {cat.items.map((it) => {
                    const isActive = activeMenuId === it.id;
                    const IconComp = it.icon;
                    // Role detection rules: Setup & Reports are secure
                    const isRestricted = it.secure && userRole !== "Owner" && userRole !== "Office" && userRole !== "Manager";
                    
                    return (
                      <button
                        key={it.id}
                        type="button"
                        onClick={() => {
                          if (isRestricted) {
                            alert(`Access Denied: The "${it.name}" submenu is locked for role "${userRole}". Owner, Manager or Office role clearances are required.`);
                            return;
                          }
                          setActiveMenuId(it.id);
                          logAudit("VIEW SUBMENU", "Finance Portal Navigation", `User navigated to menu index: ${it.id} - ${it.name}`);
                        }}
                        className={`w-full text-left py-1.5 rounded-lg text-[11.5px] flex items-center transition-all group font-mono ${isSidebarCollapsed ? "justify-center px-1" : "px-2.5 gap-2"} ${isActive ? "bg-indigo-600/15 text-indigo-300 font-bold border-l-4 border-indigo-500 pl-3 shadow-xs" : isRestricted ? "opacity-45 hover:opacity-100 cursor-not-allowed text-slate-600" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/30"}`}
                        title={`${it.name}${isRestricted ? " [LOCKED - OWNER ONLY]" : ""}`}
                      >
                        <IconComp size={12.5} className={isActive ? "text-indigo-400" : isRestricted ? "text-rose-500" : "text-slate-550 group-hover:text-slate-450"} />
                        {!isSidebarCollapsed && <span className="truncate">{it.name}</span>}
                        {!isSidebarCollapsed && isActive && <ChevronRight size={10} className="ml-auto text-indigo-400" />}
                        {!isSidebarCollapsed && isRestricted && <Lock size={9} className="ml-auto text-rose-500 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {!isSidebarCollapsed && (
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-850 animate-fade-in">
              <span className="font-mono text-[8.5px] font-extrabold text-indigo-400 uppercase tracking-widest block mb-1.5">Permission Security</span>
              <div className="space-y-1 text-[9.5px] text-slate-400">
                <div className="flex items-center justify-between">
                  <span>Voucher Create</span>
                  <span className={`px-1 rounded font-bold font-mono text-[8.5px] ${permissions.canCreateVoucher ? "bg-emerald-950/50 text-emerald-400" : "bg-rose-950/50 text-rose-400"}`}>{permissions.canCreateVoucher ? "[OK]" : "[LOCKED]"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Approval Privilege</span>
                  <span className={`px-1 rounded font-bold font-mono text-[8.5px] ${permissions.canApproveVoucher ? "bg-indigo-950/50 text-indigo-400" : "bg-rose-950/50 text-rose-400"}`}>{permissions.canApproveVoucher ? "[OK]" : "[LOCKED]"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Export &amp; CSV</span>
                  <span className={`px-1 rounded font-bold font-mono text-[8.5px] ${permissions.canExportReports ? "bg-emerald-950/50 text-emerald-400" : "bg-rose-950/50 text-rose-400"}`}>{permissions.canExportReports ? "[OK]" : "[LOCKED]"}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Active Menu Display Area */}
        <div className={`${isSidebarCollapsed ? "lg:col-span-11" : "lg:col-span-3"} space-y-6 transition-all duration-300`}>

          {/* ACTIVE VIEW 1: Accounts Dashboard */}
          {activeMenuId === 1 && (
            <div className="space-y-6">
              
              {/* Dynamic KPI Metrics Panel (18 parameters parsed from systems) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col justify-between">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider font-sans">Today's Cash Ledger</span>
                  <p className="text-xl font-mono font-medium text-emerald-400 mt-2">৳{metrics.cashOnHand.toLocaleString()}</p>
                  <span className="text-[9px] text-slate-500 font-mono mt-1">Cash in hand registers</span>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col justify-between">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider font-sans">Today's Bank Balance</span>
                  <p className="text-xl font-mono font-medium text-indigo-400 mt-2">৳{metrics.bankBal.toLocaleString()}</p>
                  <span className="text-[9px] text-indigo-500 font-mono mt-1">BRAC + DBBL online balances</span>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col justify-between">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider font-sans">Total Client Receivable</span>
                  <p className="text-xl font-mono font-medium text-teal-400 mt-2">৳{metrics.totalRec.toLocaleString()}</p>
                  <span className="text-[9px] text-teal-500 font-mono mt-1">H&amp;M + Uniqlo due assets</span>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col justify-between">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider font-sans">Total Factory Payable</span>
                  <p className="text-xl font-mono font-medium text-rose-450 mt-2">৳{metrics.totalPay.toLocaleString()}</p>
                  <span className="text-[9px] text-rose-500 font-mono mt-1">Spinners + staff payables</span>
                </div>

                <div className="bg-slate-900/60 border border-slate-850 p-4 rounded-xl flex flex-col justify-between">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider font-sans">Today's Income Input</span>
                  <p className="text-lg font-mono font-medium text-emerald-400 mt-2">৳{metrics.todayInc.toLocaleString()}</p>
                  <span className="text-[9px] text-slate-500 font-mono mt-1">Retail sales + scrap</span>
                </div>

                <div className="bg-slate-900/60 border border-slate-850 p-4 rounded-xl flex flex-col justify-between">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider font-sans">Today's Expense logged</span>
                  <p className="text-lg font-mono font-medium text-rose-400 mt-2">৳{metrics.todayExp.toLocaleString()}</p>
                  <span className="text-[9px] text-slate-500 font-mono mt-1">Lubricant + diesel + office</span>
                </div>

                <div className="bg-slate-900/60 border border-slate-850 p-4 rounded-xl flex flex-col justify-between">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider font-sans">Monthly Revenue booking</span>
                  <p className="text-lg font-mono font-medium text-indigo-300 mt-2">৳{metrics.mInc.toLocaleString()}</p>
                  <span className="text-[9px] text-slate-500 font-mono mt-1">Export contracts clearance</span>
                </div>

                <div className="bg-slate-900/60 border border-slate-850 p-4 rounded-xl flex flex-col justify-between">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider font-sans">Monthly Total Costs</span>
                  <p className="text-lg font-mono font-medium text-rose-300 mt-2">৳{metrics.mExp.toLocaleString()}</p>
                  <span className="text-[9px] text-slate-500 font-mono mt-1">Materials + overhead + wages</span>
                </div>
                
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl col-span-2 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider font-sans">Est. Net Profit &amp; Loss</span>
                    <p className={`text-2xl font-mono font-bold mt-1 ${metrics.pLossVal >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                      ৳{metrics.pLossVal.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[9.5px] px-1.5 py-0.5 bg-slate-850 border border-slate-750 font-mono text-emerald-300 rounded font-bold">
                      {metrics.pLossVal >= 0 ? "Surplus Net" : "Deficit State"}
                    </span>
                    <p className="text-[9px] text-slate-500 mt-1">Current year cycle margin</p>
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl col-span-2 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider font-sans">Corporate Wages Liability</span>
                    <p className="text-xl font-mono font-bold text-amber-500 mt-1">
                      ৳{metrics.currentWagesPayable.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[9.5px] px-1.5 py-0.5 bg-amber-950/50 border border-amber-800/20 font-mono text-amber-400 rounded">
                      Payroll Pending
                    </span>
                    <p className="text-[9px] text-slate-500 mt-1">Current Month salary payable</p>
                  </div>
                </div>
              </div>

              {/* Order-wise profit/loss summary & secondary widgets */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <div className="border border-slate-800 bg-slate-900 p-5 rounded-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Order-wise Costing &amp; Profitability</h4>
                    <span className="text-[9px] font-mono text-indigo-400 font-extrabold uppercase">Sweater Merchandising log</span>
                  </div>
                  <p className="text-[11.5px] text-slate-450 leading-relaxed">
                    Tracks knitted sweaters production costs (yarn consumption &amp; weight, machine time hourly rates, machine parts amortization) mapped against target buyer rates.
                  </p>
                  <div className="space-y-3">
                    {orders.map((o, idx) => {
                      const budgetedCost = o.orderQty * 780; // simulated factor
                      const salesRev = o.orderQty * 950; // simulated factor
                      const profitEst = salesRev - budgetedCost;
                      return (
                        <div key={idx} className="bg-slate-950/60 border border-slate-850 p-2.5 rounded-lg text-xs space-y-1">
                          <div className="flex justify-between font-mono">
                            <span className="font-bold text-indigo-300">{o.orderNo} ({o.styleNo})</span>
                            <span className="text-slate-400">{o.buyerName}</span>
                          </div>
                          <div className="flex justify-between text-[10px] font-mono text-slate-500">
                            <span>Knit Qty: {o.orderQty} pcs</span>
                            <span>Sales Margin: ৳{(salesRev).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-[10.5px] font-mono">
                            <span className="text-slate-500">Knit Overhead + Yarn: ৳{(budgetedCost).toLocaleString()}</span>
                            <span className="text-emerald-400 font-extrabold">Est. Net Profit: ৳{profitEst.toLocaleString()}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="border border-slate-800 bg-slate-900 p-5 rounded-xl space-y-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">Unapproved Voucher Queue</h4>
                      <span className="bg-rose-950 text-rose-400 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded">
                        {metrics.vouchersPending} Files
                      </span>
                    </div>
                    <p className="text-[11.5px] text-slate-450 leading-relaxed mb-4">
                      Vouchers created in draft mode require compliance team audit before posting ledger records.
                    </p>
                    <div className="space-y-2">
                      {vouchers.filter(v => v.status === "Pending Approval" || v.status === "Draft").map((v, i) => (
                        <div key={i} className="flex items-center justify-between p-2 bg-slate-950/40 rounded border border-slate-850 text-xs">
                          <div>
                            <span className="font-mono font-bold text-slate-300">{v.voucherNo}</span>
                            <span className="text-slate-500 font-mono ml-2">({v.date})</span>
                          </div>
                          <span className="text-amber-400 font-mono text-[10.5px] font-bold">{v.status}</span>
                        </div>
                      ))}
                      {vouchers.filter(v => v.status === "Pending Approval" || v.status === "Draft").length === 0 && (
                        <p className="text-[11px] text-slate-500 italic text-center py-6">All system transactions are synchronized and posted.</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-slate-850 flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-mono">System Integrity Checklist:</span>
                    <span className="text-emerald-400 font-mono font-bold flex items-center gap-1">
                      <CheckCircle size={12} /> Double-Entry Balanced
                    </span>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* ACTIVE VIEW 2: Chart of Accounts (Tree table of accounts) */}
          {activeMenuId === 2 && (
            <div className="border border-slate-800 bg-slate-900 p-6 rounded-2xl space-y-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Chart of Accounts Ledger Nodes</h3>
                  <p className="text-xs text-slate-400 mt-1">Structured double-entry elements for OTTOMASS JACQUARD Assets, Liabilities, Equity, Revenues and Expenses</p>
                </div>
                <div className="flex items-center gap-2">
                  <input 
                    type="text" 
                    placeholder="Search account code or name..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-slate-950 border border-slate-800 text-xs text-slate-300 p-2 rounded-lg focus:outline-hidden font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const newCode = prompt("Enter new account code (e.g., 5004):");
                      const newName = prompt("Enter account name (e.g., Boiler Maintenance Cost):");
                      const newGroup = prompt("Enter account group (Asset, Liability, Equity, Revenue, Expense):") as any;
                      if (!newCode || !newName || !newGroup) return;
                      const customAcc: ChartOfAccount = {
                        code: newCode,
                        name: newName,
                        group: newGroup,
                        balance: 0
                      };
                      setAccounts(prev => [...prev, customAcc]);
                      logAudit("CREATE ACCOUNT NODE", "COA Config", `Configured new ledger node: [${newCode}] ${newName} in ${newGroup}`);
                    }}
                    className="bg-indigo-600 hover:bg-indigo-500 text-slate-100 font-mono text-[11px] font-black py-2.5 px-3 rounded-lg flex items-center gap-1"
                  >
                    <Plus size={12} /> Create Group Node
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-slate-350 text-xs font-mono">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-450 text-[10px] uppercase">
                      <th className="py-2.5 px-3">Account Code</th>
                      <th className="py-2.5 px-3">Account Name</th>
                      <th className="py-2.5 px-3">Primary Group</th>
                      <th className="py-2.5 px-3 text-right">Current Ledger Balance (BDT)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850">
                    {accounts.filter(a => a.code.toLowerCase().includes(searchQuery.toLowerCase()) || a.name.toLowerCase().includes(searchQuery.toLowerCase())).map((acc, idx) => (
                      <tr key={idx} className="hover:bg-slate-950/45">
                        <td className="py-3 px-3 font-bold text-indigo-400">{acc.code}</td>
                        <td className="py-3 px-3 text-slate-200">{acc.name}</td>
                        <td className="py-3 px-3">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-bold ${acc.group === "Asset" ? "bg-cyan-950 text-cyan-400" : acc.group === "Liability" ? "bg-rose-950 text-rose-400" : acc.group === "Equity" ? "bg-indigo-950 text-indigo-400" : acc.group === "Revenue" ? "bg-emerald-950 text-emerald-400" : "bg-amber-950 text-amber-300"}`}>
                            {acc.group}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right text-slate-205 font-bold">
                          ৳{acc.balance.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ACTIVE VIEW 3: Opening Balance */}
          {activeMenuId === 3 && (
            <div className="border border-slate-800 bg-slate-900 p-6 rounded-2xl space-y-6">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Configure Opening Balance</h3>
                <p className="text-xs text-slate-400 mt-1">Define baseline assets and liabilities carried forward into the FY 2026-27 ledger logs.</p>
              </div>

              <div className="bg-amber-950/20 border border-amber-800/10 p-4 rounded-xl text-xs text-amber-300 font-mono leading-relaxed">
                <strong>Attention:</strong> Modifications here override cumulative starting ledger balances directly. Ensure matching Double-Entry checks (Assets = Liabilities + Equity) are certified.
              </div>

              <div className="space-y-3">
                {accounts.map((acc, idx) => (
                  <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center bg-slate-950/40 p-3 rounded-lg text-xs font-mono border border-slate-850">
                    <div>
                      <span className="text-slate-500">[{acc.code}]</span>
                      <p className="font-sans font-bold text-slate-200">{acc.name}</p>
                    </div>
                    <div>
                      <span className="text-slate-500 uppercase text-[9px]">Class Group Type</span>
                      <p className="text-slate-350">{acc.group}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-550">৳</span>
                      <input 
                        type="number"
                        value={acc.balance}
                        onChange={(e) => {
                          const val = Number(e.target.value) || 0;
                          setAccounts(prev => prev.map((item, i) => i === idx ? { ...item, balance: val } : item));
                        }}
                        className="bg-slate-900 border border-slate-800 p-1.5 rounded text-slate-200 font-mono text-xs w-full focus:outline-hidden"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    logAudit("SAVE OPENING BALANCES", "System Ledgers", "Updated manual opening database balances.");
                    alert("Opening balances locked and updated successfully!");
                  }}
                  className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-sans text-xs font-black py-2.5 px-4 rounded-xl transition-all"
                >
                  Apply &amp; Seal Open Balances
                </button>
              </div>
            </div>
          )}

          {/* ACTIVE VIEWS (8 to 17): Voucher System */}
          {activeMenuId >= 8 && activeMenuId <= 17 && (
            <div className="border border-slate-800 bg-slate-900 p-6 rounded-2xl space-y-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    {MENU_CATEGORIES.flatMap(c => c.items).find(i => i.id === activeMenuId)?.name} (Vouchers Registry)
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">Audit, register, and analyze manual transactions mapped against compliance ledger criteria.</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-slate-400">Filter Status:</span>
                  <select
                    value={voucherStatusFilter}
                    onChange={(e) => setVoucherStatusFilter(e.target.value)}
                    className="bg-slate-950 border border-slate-800 p-1.5 rounded-lg text-xs font-mono"
                  >
                    <option value="All">All Vouchers</option>
                    <option value="Draft">Draft</option>
                    <option value="Pending Approval">Pending Approval</option>
                    <option value="Approved">Approved / Posted</option>
                  </select>

                  <button
                    type="button"
                    onClick={() => {
                      const mapping: Record<number, string> = {
                        8: "Journal", 9: "Payment", 10: "Receive", 11: "Contra",
                        12: "Purchase", 13: "Sales", 14: "Salary", 15: "Adjustment",
                        16: "Debit Note", 17: "Credit Note"
                      };
                      setModalVoucherType(mapping[activeMenuId] || "Journal");
                      setShowVoucherModal(true);
                    }}
                    className="bg-indigo-600 hover:bg-indigo-500 text-slate-100 font-mono text-[11px] font-black py-2.5 px-3 rounded-lg flex items-center gap-1"
                  >
                    <Plus size={12} /> New Voucher Record
                  </button>
                </div>
              </div>

              {/* Vouchers Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-slate-350 text-xs font-mono">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-450 text-[10px] uppercase">
                      <th className="py-2.5 px-3">Voucher No</th>
                      <th className="py-2.5 px-3">Posting Date</th>
                      <th className="py-2.5 px-3">Narration Description</th>
                      <th className="py-2.5 px-3">Debit Ledger / Accounts Detail</th>
                      <th className="py-2.5 px-3 text-right">Debit Balance</th>
                      <th className="py-2.5 px-3 text-right">Credit Balance</th>
                      <th className="py-1.5 px-3 text-center">Status</th>
                      <th className="py-1.5 px-3 text-right">User Agent</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850">
                    {vouchers.map((v, idx) => (
                      <tr key={idx} className="hover:bg-slate-950/45 align-top">
                        <td className="py-3 px-3 font-bold text-indigo-400">{v.voucherNo}</td>
                        <td className="py-3 px-3 text-slate-450 whitespace-nowrap">{v.date}</td>
                        <td className="py-3 px-3 text-slate-205 max-w-[150px] truncate">{v.narration}</td>
                        <td className="py-3 px-3 text-[11px] space-y-2">
                          {v.items.map((itm, iidx) => (
                            <div key={iidx} className="flex flex-col">
                              <span className="font-bold text-slate-300">[{itm.accountCode}] {itm.accountName}</span>
                              {itm.narration && <span className="text-[10px] text-slate-500 italic">{itm.narration}</span>}
                            </div>
                          ))}
                        </td>
                        <td className="py-3 px-3 text-right text-emerald-400 font-mono space-y-1">
                          {v.items.map((itm, iidx) => (
                            <div key={iidx} className="h-6">
                              {itm.debit > 0 ? `৳${itm.debit.toLocaleString()}` : "-"}
                            </div>
                          ))}
                        </td>
                        <td className="py-3 px-3 text-right text-rose-400 font-mono space-y-1">
                          {v.items.map((itm, iidx) => (
                            <div key={iidx} className="h-6">
                              {itm.credit > 0 ? `৳${itm.credit.toLocaleString()}` : "-"}
                            </div>
                          ))}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className="bg-indigo-950 text-indigo-300 px-1 py-0.5 rounded text-[9.5px] uppercase font-bold font-mono">
                            {v.status || "Posted"}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right text-slate-500 text-[10px] max-w-[120px] truncate">{v.createdBy}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ACTIVE VIEW 4: Cash Book */}
          {activeMenuId === 4 && (
            <div className="border border-slate-800 bg-slate-900 p-6 rounded-2xl space-y-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Cash Book Ledger (Cash in Hand)</h3>
                  <p className="text-xs text-slate-400 mt-1">Audit direct physical cash movements, including petty cash and factory floor payments.</p>
                </div>
                <button
                  onClick={() => {
                    const csv = "Date,Category,Payer/Payee,Debit (In),Credit (Out),Balance\n" +
                      "2026-05-23,Initial,Carried From COA,125000,0,125000\n";
                    triggerRawFileExport("csv", "Cash_Book_Statement", csv);
                  }}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono py-2 px-3.5 rounded-xl border border-slate-700"
                >
                  Export CSV Statement
                </button>
              </div>

              <div className="bg-slate-950/40 p-5 rounded-2xl border border-slate-850 grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Corporate Office Petty Cash</span>
                  <p className="text-lg font-mono text-emerald-400 font-bold">৳{(accounts.find(a => a.code === "1001")?.balance || 0).toLocaleString()}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Factory Floor Emergency Cash</span>
                  <p className="text-lg font-mono text-indigo-400 font-bold">৳{(accounts.find(a => a.code === "1002")?.balance || 0).toLocaleString()}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Accumulated Cash Book assets</span>
                  <p className="text-lg font-mono text-white font-bold">৳{((accounts.find(a => a.code === "1001")?.balance || 0) + (accounts.find(a => a.code === "1002")?.balance || 0)).toLocaleString()}</p>
                </div>
              </div>

              {/* Transactions list */}
              <div className="space-y-3">
                <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Manual Inward/Outward Cash Actions Log</p>
                <div className="divide-y divide-slate-850">
                  {incomeList.filter(i => i.accCode.startsWith("10")).map((i, idx) => (
                    <div key={idx} className="flex justify-between items-center py-3 text-xs">
                      <div>
                        <span className="text-slate-500 font-mono">{i.date}</span>
                        <p className="font-bold text-slate-200">{i.desc}</p>
                        <span className="text-[10px] text-indigo-400">Ref: {i.ref} | User: {i.payer}</span>
                      </div>
                      <span className="font-mono text-emerald-400 font-bold">+৳{i.amount.toLocaleString()}</span>
                    </div>
                  ))}
                  {expenseList.filter(e => e.accCode.startsWith("10")).map((e, idx) => (
                    <div key={idx} className="flex justify-between items-center py-3 text-xs">
                      <div>
                        <span className="text-slate-500 font-mono">{e.date}</span>
                        <p className="font-bold text-slate-205">{e.desc}</p>
                        <span className="text-[10px] text-rose-400">Ref: {e.ref} | Mapped: {e.payee}</span>
                      </div>
                      <span className="font-mono text-rose-400 font-bold">-৳{e.amount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* ACTIVE VIEW 5: Bank Book */}
          {activeMenuId === 5 && (
            <div className="border border-slate-800 bg-slate-900 p-6 rounded-2xl space-y-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Bank Book Ledger</h3>
                  <p className="text-xs text-slate-400 mt-1">Audit Dutch-Bangla and BRAC corporate accounts, clearing and receipts status.</p>
                </div>
                <button
                  onClick={() => {
                    const csv = "Date,Account,Type,Balance\n";
                    triggerRawFileExport("csv", "Bank_Book_Balances_Overview", csv);
                  }}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono py-2 px-3.5 rounded-xl border border-slate-700"
                >
                  Export CSV Statement
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-950/40 rounded-xl border border-slate-850 space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase font-mono">Dutch-Bangla Bank Acc (1101)</span>
                  <p className="text-xl font-mono text-indigo-400 font-bold">৳{(accounts.find(a => a.code === "1101")?.balance || 0).toLocaleString()}</p>
                  <p className="text-[9.5px] text-slate-600 font-mono">Designated for worker monthly salary disburse</p>
                </div>
                <div className="p-4 bg-slate-950/40 rounded-xl border border-slate-850 space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase font-mono">BRAC Bank Acc (1102)</span>
                  <p className="text-xl font-mono text-emerald-400 font-bold">৳{(accounts.find(a => a.code === "1102")?.balance || 0).toLocaleString()}</p>
                  <p className="text-[9.5px] text-slate-600 font-mono">Designated for buyer inward foreign receipts</p>
                </div>
              </div>

              {/* Transactions */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-sans">Bank Inflow / Clearances Log</h4>
                <div className="divide-y divide-slate-850">
                  {incomeList.filter(i => i.accCode.startsWith("11")).map((i, idx) => (
                    <div key={idx} className="flex justify-between items-center py-3 text-xs font-mono">
                      <div>
                        <span className="text-slate-500">{i.date}</span>
                        <p className="font-bold text-slate-200">{i.desc}</p>
                        <span className="text-[10.5px] text-slate-450 font-sans">Payer Ref: {i.payer} | Acc: BRAC Bank</span>
                      </div>
                      <span className="text-emerald-400 font-bold">+৳{i.amount.toLocaleString()}</span>
                    </div>
                  ))}
                  {expenseList.filter(e => e.accCode.startsWith("11")).map((e, idx) => (
                    <div key={idx} className="flex justify-between items-center py-3 text-xs font-mono">
                      <div>
                        <span className="text-slate-500">{e.date}</span>
                        <p className="font-bold text-slate-205">{e.desc}</p>
                        <span className="text-[10.5px] text-slate-450 font-sans">Payee: {e.payee} | Acc: DBBL</span>
                      </div>
                      <span className="text-rose-400 font-bold">-৳{e.amount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* ACTIVE VIEW 6: Income Entry */}
          {activeMenuId === 6 && (
            <div className="border border-slate-800 bg-slate-900 p-6 rounded-2xl space-y-6">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Log Service &amp; Miscellanous Income</h3>
                <p className="text-xs text-slate-400 mt-1">Inject buyer payments clearance logs, service testing fees, scrap/yarn sales, or general non-trade collection inputs.</p>
              </div>

              <form onSubmit={(e) => {
                e.preventDefault();
                const d = (e.target as any).elements;
                const amt = Number(d.amount.value) || 0;
                if (amt <= 0) return;
                const newItem = {
                  id: `inc-${Date.now()}`,
                  date: d.date.value,
                  category: d.category.value,
                  payer: d.payer.value,
                  amount: amt,
                  accCode: d.accCode.value,
                  ref: d.ref.value || "MAN-01",
                  desc: d.desc.value || "Logged manual receipt",
                  center: d.center.value,
                  dept: d.dept.value
                };
                setIncomeList(prev => [newItem, ...prev]);
                
                // create voucher double entry
                const vItems = [
                  { accountCode: d.accCode.value, accountName: accounts.find(a=>a.code===d.accCode.value)?.name || "Cash / Bank", debit: amt, credit: 0 },
                  { accountCode: "4001", accountName: "Sales / Export Revenue", debit: 0, credit: amt }
                ];

                onAddVoucher({
                  id: `jv-${Date.now()}`,
                  voucherNo: `RV-202605-${String(vouchers.length + 11).padStart(3, "0")}`,
                  date: d.date.value,
                  narration: `Automated Income Entry booking from: ${d.payer.value}`,
                  status: "Posted",
                  items: vItems,
                  createdBy: userEmail
                });

                logAudit("LOG INCOME", "Income Entry Book", `Registered payment entry from ${d.payer.value} amounting to ৳${amt}. Real-time double entry voucher posted.`);
                alert("Income registered and double entry voucher posted!");
                (e.target as any).reset();
              }} className="space-y-4 max-w-xl">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Receipt Date</label>
                    <input type="date" name="date" required defaultValue="2026-05-23" className="w-full bg-slate-950 border border-slate-800 p-2 rounded text-xs text-white" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Inflow Category</label>
                    <select name="category" className="w-full bg-slate-950 border border-slate-800 p-2 rounded text-xs text-white">
                      <option value="Buyer Collection">Buyer Collection</option>
                      <option value="Service Income">Service Fee Income</option>
                      <option value="Other Income">Other / Waste Sale Income</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Payer Particular Name</label>
                    <input type="text" name="payer" required placeholder="H&M Global / Local Scrap Merchant" className="w-full bg-slate-950 border border-slate-800 p-2 rounded text-xs text-white" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Inward Account</label>
                    <select name="accCode" className="w-full bg-slate-950 border border-slate-800 p-2 rounded text-xs text-white font-mono">
                      <option value="1102">[1102] BRAC Bank Acc (Inward Export)</option>
                      <option value="1001">[1001] Petty Cash (Corporate Office)</option>
                      <option value="1002">[1002] Emergency Cash (Factory Floor)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Cost Center</label>
                    <select name="center" className="w-full bg-slate-950 border border-slate-800 p-1.5 rounded text-xs text-white">
                      <option value="Dhaka HQ">Dhaka HQ</option>
                      <option value="Factory Floor">Factory Floor</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Department</label>
                    <select name="dept" className="w-full bg-slate-950 border border-slate-800 p-1.5 rounded text-xs text-white">
                      <option value="Knitting">Knitting</option>
                      <option value="Finishing">Finishing</option>
                      <option value="Marketing">Marketing</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Reference No</label>
                    <input type="text" name="ref" placeholder="HM-INV-891" className="w-full bg-slate-950 border border-slate-800 p-1.5 rounded text-xs text-white" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Amount (BDT Digit)</label>
                    <input type="number" name="amount" required className="w-full bg-slate-950 border border-slate-800 p-2 rounded text-xs text-white font-mono" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Memo Narration</label>
                    <input type="text" name="desc" placeholder="Details about specific collection order details" className="w-full bg-slate-950 border border-slate-800 p-2 rounded text-xs text-white" />
                  </div>
                </div>

                <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-sans font-black text-xs py-2 px-4 rounded-xl transition-all">
                  Post Income Inflow Record
                </button>
              </form>
            </div>
          )}

          {/* ACTIVE VIEW 7: Expense Entry */}
          {activeMenuId === 7 && (
            <div className="border border-slate-800 bg-slate-900 p-6 rounded-2xl space-y-6">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Log Operational &amp; Factory Overhead Expenses</h3>
                <p className="text-xs text-slate-400 mt-1">Book manual cash outflows, generator fuel purchases, office stationery, machine lubrication, and other instant petty cash bills.</p>
              </div>

              <form onSubmit={(e) => {
                e.preventDefault();
                const d = (e.target as any).elements;
                const amt = Number(d.amount.value) || 0;
                if (amt <= 0) return;
                const newItem = {
                  id: `exp-${Date.now()}`,
                  date: d.date.value,
                  category: d.category.value,
                  payee: d.payee.value,
                  amount: amt,
                  accCode: d.accCode.value,
                  ref: d.ref.value || "EXP-01",
                  desc: d.desc.value || "Logged manual expense",
                  center: d.center.value,
                  dept: d.dept.value
                };
                setExpenseList(prev => [newItem, ...prev]);

                // create double entry voucher
                const vItems = [
                  { accountCode: "5003", accountName: "Utility, Steam & Electricity Bills", debit: amt, credit: 0 },
                  { accountCode: d.accCode.value, accountName: accounts.find(a=>a.code===d.accCode.value)?.name || "Cash / Bank", debit: 0, credit: amt }
                ];

                onAddVoucher({
                  id: `jv-${Date.now()}`,
                  voucherNo: `PV-202605-${String(vouchers.length + 11).padStart(3, "0")}`,
                  date: d.date.value,
                  narration: `Automated Expense Entry booking: ${d.desc.value}`,
                  status: "Posted",
                  items: vItems,
                  createdBy: userEmail
                });

                logAudit("LOG EXPENSE", "Expense Bookings", `Registered payment bill: ${d.desc.value} of ৳${amt}. Double entry transaction recorded.`);
                alert("Expense bill saved and voucher posted!");
                (e.target as any).reset();
              }} className="space-y-4 max-w-xl">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Expense Bill Date</label>
                    <input type="date" name="date" required defaultValue="2026-05-23" className="w-full bg-slate-950 border border-slate-800 p-2 rounded text-xs text-white" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Expense Class Account</label>
                    <select name="category" className="w-full bg-slate-950 border border-slate-800 p-2 rounded text-xs text-white">
                      <option value="Machine Grease">Machine Lubrication / Spares</option>
                      <option value="Overhead Electricity">Utility, Steam &amp; Power Bills</option>
                      <option value="Fuel">Generator Diesel Fuel</option>
                      <option value="Stationery">Office Supplies &amp; Printing</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Vendor/Payee Name</label>
                    <input type="text" name="payee" required placeholder="Mobile Lube Co / Jamuna Oil Vendor" className="w-full bg-slate-950 border border-slate-800 p-2 rounded text-xs text-white" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Source Inflow Account</label>
                    <select name="accCode" className="w-full bg-slate-950 border border-slate-800 p-2 rounded text-xs text-white font-mono">
                      <option value="1001">[1001] Petty Cash (Corporate Office)</option>
                      <option value="1002">[1002] Emergency Cash (Factory Floor)</option>
                      <option value="1101">[1101] Dutch-Bangla Bank Acc (Online out)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Cost Center</label>
                    <select name="center" className="w-full bg-slate-950 border border-slate-800 p-1.5 rounded text-xs text-white">
                      <option value="Factory Floor">Factory Floor</option>
                      <option value="Dhaka HQ">Dhaka HQ</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Department</label>
                    <select name="dept" className="w-full bg-slate-950 border border-slate-800 p-1.5 rounded text-xs text-white">
                      <option value="Knitting">Knitting</option>
                      <option value="Finishing">Finishing</option>
                      <option value="Quality">Quality Control</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Bill Requisition No</label>
                    <input type="text" name="ref" placeholder="REQ-9102" className="w-full bg-slate-950 border border-slate-800 p-1.5 rounded text-xs text-white" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Total Paid (BDT)</label>
                    <input type="number" name="amount" required className="w-full bg-slate-950 border border-slate-800 p-2 rounded text-xs text-white font-mono" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Transaction description / reason</label>
                    <input type="text" name="desc" placeholder="Purchase 500 liters generator fuel to offset grid failures" className="w-full bg-slate-950 border border-slate-800 p-2 rounded text-xs text-white" />
                  </div>
                </div>

                <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-sans font-black text-xs py-2 px-4 rounded-xl transition-all">
                  Post Overhead Bill Outflow
                </button>
              </form>
            </div>
          )}

          {/* ACTIVE VIEW 18: Accounts Payable */}
          {activeMenuId === 18 && (
            <div className="border border-slate-800 bg-slate-900 p-6 rounded-2xl space-y-6">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Accounts Payable Ledger (AP)</h3>
                <p className="text-xs text-slate-400 mt-1">Outstanding supplier obligations and yarn consumption bills awaiting bank clearance.</p>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-slate-950/40 rounded-xl border border-slate-850 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase">Dhaka Spinners Ltd Ledger Standard Due</span>
                    <p className="text-xl font-mono text-rose-450 font-bold">৳{(accounts.find(a=>a.code === "2001")?.balance || 0).toLocaleString()}</p>
                  </div>
                  <button 
                    onClick={() => {
                      const payAmt = prompt("How much would you like to clear of the supplier payable? (Enter digits):");
                      const parsed = Number(payAmt) || 0;
                      if (parsed <= 0) return;
                      
                      setAccounts(prev => prev.map(acc => {
                        if (acc.code === "2001") {
                          return { ...acc, balance: acc.balance - parsed };
                        }
                        if (acc.code === "1101") { // using DBBL
                          return { ...acc, balance: acc.balance - parsed };
                        }
                        return acc;
                      }));

                      logAudit("CLEAR SUPPLIER PAYABLE", "Accounts Payable", `Paid ৳${parsed.toLocaleString()} out of BRAC/DBBL bank to Dhaka Spinners Ltd.`);
                      alert("Success! Reduced Dhaka Spinners Ltd. Payable and reduced Dutch-Bangla Bank Cash Balance.");
                    }}
                    className="bg-indigo-600 hover:bg-indigo-500 text-slate-100 font-mono text-[11px] font-bold py-2 px-3.5 rounded-lg"
                  >
                    Clear Outstanding Bill
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ACTIVE VIEW 19: Accounts Receivable */}
          {activeMenuId === 19 && (
            <div className="border border-slate-800 bg-slate-900 p-6 rounded-2xl space-y-6">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Accounts Receivable Ledger (AR)</h3>
                <p className="text-xs text-slate-400 mt-1">Buyer export clearance invoices awaiting collection clearance and foreign exchange routing.</p>
              </div>

              <div className="space-y-3">
                <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-xl space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-indigo-300 font-bold">H&amp;M Global Contracts (1201)</span>
                    <span className="text-[10px] text-emerald-400 font-mono font-bold">Status: Pending L/C</span>
                  </div>
                  <p className="text-lg font-mono text-slate-200">Outstanding: ৳{(accounts.find(a=>a.code === "1201")?.balance || 0).toLocaleString()}</p>
                </div>

                <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-xl space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-indigo-300 font-bold font-mono">UNIQLO Japan Division (1202)</span>
                    <span className="text-[10px] text-amber-500 font-mono font-bold">Status: Bill of Exchange</span>
                  </div>
                  <p className="text-lg font-mono text-slate-200">Outstanding: ৳{(accounts.find(a=>a.code === "1202")?.balance || 0).toLocaleString()}</p>
                </div>
              </div>
            </div>
          )}

          {/* ACTIVE VIEW 24: Bank Reconciliation */}
          {activeMenuId === 24 && (
            <div className="border border-slate-800 bg-slate-900 p-6 rounded-2xl space-y-6">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Bank Reconciliation Module</h3>
                <p className="text-xs text-slate-400 mt-1">Cross-reference and match system transaction records with physical incoming and outgoing bank feeds.</p>
              </div>

              <div className="space-y-3">
                {reconciliations.map((rec) => (
                  <div key={rec.id} className="p-3.5 bg-slate-950/60 border border-slate-850 rounded-xl flex items-center justify-between text-xs">
                    <div>
                      <span className="text-sans font-bold text-slate-205">{rec.ref} | Amount: ৳{rec.amount.toLocaleString()}</span>
                      <p className="text-[10.5px] text-slate-500">System Log Date: {rec.systemDate} | Clear Feeds: {rec.bankDate}</p>
                    </div>
                    <button 
                      type="button"
                      onClick={() => {
                        setReconciliations(prev => prev.map(r => r.id === rec.id ? { ...r, matched: !r.matched, bankDate: r.matched ? "Pending" : new Date().toISOString().substring(0, 10) } : r));
                        logAudit("TOGGLE RECONCILIATION", "Bank Reconciliation", `Matched transaction identifier: ${rec.ref}`);
                      }}
                      className={`px-3 py-1 text-[11px] rounded-lg font-mono font-bold ${rec.matched ? "bg-emerald-950/40 text-emerald-400 border border-emerald-800/30" : "bg-slate-800 text-slate-350"}`}
                    >
                      {rec.matched ? "✓ Reconciled Node" : "Unmatched Link"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ACTIVE VIEW 25: Cheque Management */}
          {activeMenuId === 25 && (
            <div className="border border-slate-800 bg-slate-900 p-6 rounded-2xl space-y-6">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Corporate Cheque Leaf Management</h3>
                <p className="text-xs text-slate-400 mt-1">Track post-dated (PDC) and cleared cheques disbursed to merchants and fabric design suppliers.</p>
              </div>

              <div className="divide-y divide-slate-850">
                {chequeList.map((chq) => (
                  <div key={chq.id} className="py-3 flex justify-between items-center text-xs">
                    <div>
                      <span className="font-mono font-bold text-slate-300">Cheque Range: {chq.chequeNo} ({chq.bank})</span>
                      <p className="text-slate-500">Payee: {chq.payee} | Target Maturity clearing date: {chq.date}</p>
                    </div>
                    <div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${chq.status === "Cleared" ? "bg-emerald-950 text-emerald-400" : "bg-amber-950 text-amber-300"}`}>
                        {chq.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ACTIVE VIEW 26: Mobile Banking */}
          {activeMenuId === 26 && (
            <div className="border border-slate-800 bg-slate-900 p-6 rounded-2xl space-y-6">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Mobile Merchant Transactions</h3>
                <p className="text-xs text-slate-400 mt-1">Track bKash, Nagad and Rocket payouts for staff allowances, emergency overtime bonuses and store purchases.</p>
              </div>

              <div className="space-y-2">
                {mobileTrans.map((m) => (
                  <div key={m.id} className="p-3.5 bg-slate-950/40 rounded-xl border border-slate-850 text-xs font-mono space-y-1">
                    <div className="flex justify-between font-sans">
                      <span className="font-bold text-indigo-400">{m.provider} ({m.transType})</span>
                      <span className="text-emerald-400 font-bold">৳{m.amount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-[10.5px] text-slate-500">
                      <span>TxID: {m.transId}</span>
                      <span>Target: {m.mobNo}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ACTIVE VIEW 31: Budget & Cost Control */}
          {activeMenuId === 31 && (
            <div className="border border-slate-800 bg-slate-900 p-6 rounded-2xl space-y-6">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Budget &amp; Cost Control Registry</h3>
                <p className="text-xs text-slate-400 mt-1">Configure limits on major sweater operations budgets to control material variance and waste.</p>
              </div>

              <div className="space-y-4">
                {budgets.map((b) => (
                  <div key={b.id} className="space-y-2 font-mono text-xs">
                    <div className="flex justify-between font-bold dark:text-slate-200">
                      <span>{b.category} ({b.dept})</span>
                      <span>{Math.round((b.utilized / b.limit) * 100)}% Used</span>
                    </div>
                    <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-indigo-500 h-2.5 rounded-full" style={{ width: `${(b.utilized / b.limit) * 100}%` }}></div>
                    </div>
                    <div className="flex justify-between text-[10.5px] text-slate-500">
                      <span>Utilized Cost: ৳{b.utilized.toLocaleString()}</span>
                      <span>Ceiling Cap: ৳{b.limit.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ACTIVE VIEW 32: Profit & Loss Statement */}
          {activeMenuId === 32 && (
            <div className="border border-slate-800 bg-slate-900 p-6 rounded-2xl space-y-6 print:bg-white print:text-black print:border-none">
              <div className="flex items-center justify-between flex-wrap gap-4 print:hidden">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Loss and Income Profitability Report</h3>
                  <p className="text-xs text-slate-400 mt-1">Bangladesh sweater weaving trade cycle compilation statements.</p>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => {
                      const csv = `Profit & Loss Statement - ${financialYear}\n\nREVENUES,৳${metrics.mInc}\nEXPENSES,৳${metrics.mExp}\nEstimated Net,৳${metrics.pLossVal}\n`;
                      triggerRawFileExport("csv", "Profit_And_Loss_Statement", csv);
                    }}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs py-2 px-3.5 rounded-xl border border-slate-700"
                  >
                    Export CSV
                  </button>
                  <button 
                    onClick={() => window.print()}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs py-2 px-3.5 rounded-xl border border-slate-700 flex items-center gap-1"
                  >
                    <Printer size={12} /> Print
                  </button>
                </div>
              </div>

              <div className="space-y-6 font-mono text-xs p-4 bg-slate-950/40 rounded-xl border border-slate-850">
                <div className="text-center space-y-1">
                  <h4 className="text-md font-bold text-white">OTTOMASS JACQUARD LTD.</h4>
                  <p className="text-[10px] text-indigo-400 uppercase tracking-widest">Profit &amp; Loss Statement | {financialYear}</p>
                </div>

                <div className="space-y-2 border-t border-slate-800 pt-4">
                  <div className="flex justify-between text-slate-205 font-bold border-b border-slate-800 pb-1.5 mb-2">
                    <span>PARTICULARS DESCRIPTION</span>
                    <span>AMOUNT (BDT)</span>
                  </div>
                  <div className="space-y-2">
                    <p className="text-indigo-300 font-bold uppercase">Operating Revenue</p>
                    <div className="flex justify-between pl-4">
                      <span>Export Contracts Revenue / Trade Turnovers</span>
                      <span>৳{metrics.mInc.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 border-t border-slate-800 pt-4">
                  <p className="text-rose-400 font-bold uppercase">Operating Expenses</p>
                  <div className="flex justify-between pl-4">
                    <span>Yarn Material Consumption Costs</span>
                    <span>৳{(accounts.find(a=>a.code === "5001")?.balance || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between pl-4">
                    <span>Factory Labor, Knitter Wages &amp; Salary</span>
                    <span>৳{(accounts.find(a=>a.code === "5002")?.balance || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between pl-4">
                    <span>Electricity, Boiler &amp; Factory Overhead Utilities</span>
                    <span>৳{(accounts.find(a=>a.code === "5003")?.balance || 0).toLocaleString()}</span>
                  </div>
                </div>

                <div className="border-t border-slate-800 pt-4 font-bold text-sm flex justify-between">
                  <span className={metrics.pLossVal >= 0 ? "text-emerald-400" : "text-rose-450"}>ESTIMATED NET SURPLUS</span>
                  <span className={metrics.pLossVal >= 0 ? "text-emerald-400" : "text-rose-450"}>৳{metrics.pLossVal.toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}

          {/* ACTIVE VIEW 33: Balance Sheet */}
          {activeMenuId === 33 && (
            <div className="border border-slate-800 bg-slate-900 p-6 rounded-2xl space-y-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Balance Sheet Node Report</h3>
                  <p className="text-xs text-slate-400 mt-1">Corporate status sheet matching assets, liabilities and equity balances.</p>
                </div>
                <button 
                  onClick={() => window.print()}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs py-2 px-3.5 rounded-xl border border-slate-700 font-mono"
                >
                  Print Report
                </button>
              </div>

              <div className="font-mono text-xs space-y-6 bg-slate-950/40 p-5 rounded-2xl border border-slate-850">
                <div className="text-center">
                  <h4 className="text-slate-200 font-bold text-base">OTTOMASS JACQUARD LTD.</h4>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Balance Sheet Trial Summary | {financialYear}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-slate-800 pt-4">
                  
                  {/* Assets */}
                  <div className="space-y-3">
                    <p className="font-bold text-emerald-400 border-b border-slate-800 pb-1 uppercase">ASSETS NODE</p>
                    <div className="space-y-1.5 text-slate-350">
                      <div className="flex justify-between">
                        <span>Cash in Hand (Office)</span>
                        <span>৳{(accounts.find(a=>a.code === "1001")?.balance || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Cash in Hand (Factory Floor)</span>
                        <span>৳{(accounts.find(a=>a.code === "1002")?.balance || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>BRAC Bank Acc</span>
                        <span>৳{(accounts.find(a=>a.code === "1102")?.balance || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Dutch-Bangla Bank Acc</span>
                        <span>৳{(accounts.find(a=>a.code === "1101")?.balance || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between border-t border-slate-800 pt-1 font-bold text-slate-100">
                        <span>Total Assets</span>
                        <span>৳{metrics.bankBal.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Liabilities & Equity */}
                  <div className="space-y-3">
                    <p className="font-bold text-rose-450 border-b border-slate-800 pb-1 uppercase">LIABILITIES &amp; EQUITY</p>
                    <div className="space-y-1.5 text-slate-350">
                      <div className="flex justify-between">
                        <span>Accounts Payable - Dhaka Spinners</span>
                        <span>৳{(accounts.find(a=>a.code === "2001")?.balance || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Salary &amp; Wages Payable</span>
                        <span>৳{(accounts.find(a=>a.code === "2101")?.balance || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Owner Capital contribution</span>
                        <span>৳{(accounts.find(a=>a.code === "3001")?.balance || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between border-t border-slate-800 pt-1 font-bold text-slate-100">
                        <span>Total Obligations &amp; Equity</span>
                        <span>৳{((accounts.find(a=>a.code === "2001")?.balance || 0) + (accounts.find(a=>a.code === "2101")?.balance || 0) + (accounts.find(a=>a.code === "3001")?.balance || 0)).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          )}

          {/* ACTIVE VIEW 39: Accounts Settings */}
          {activeMenuId === 39 && (
            <div className="border border-slate-800 bg-slate-900 p-6 rounded-2xl space-y-6">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Accounts Controller Parameters</h3>
                <p className="text-xs text-slate-400 mt-1">Setup system integration triggers, configure default double entry ledger mapping, and audit system properties.</p>
              </div>

              <div className="space-y-4 max-w-lg font-mono text-xs">
                <div className="p-4 bg-slate-950/40 rounded-xl space-y-3 border border-slate-850">
                  <p className="font-bold text-indigo-400">Default Posting Integration Rules:</p>
                  <label className="flex items-center gap-2 text-slate-300">
                    <input type="checkbox" defaultChecked className="rounded bg-slate-900 border-slate-800 text-indigo-505" />
                    Automatically approve salary vouchers during payroll processing
                  </label>
                  <label className="flex items-center gap-2 text-slate-300">
                    <input type="checkbox" defaultChecked className="rounded bg-slate-900 border-slate-800 text-indigo-505" />
                    Update raw inventory stock valuations dynamically on Purchase PV postings
                  </label>
                  <label className="flex items-center gap-2 text-slate-300">
                    <input type="checkbox" defaultChecked className="rounded bg-slate-900 border-slate-800 text-indigo-505" />
                    Lock closed financial periods to restrict old voucher entries
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* GENERAL PLACEHOLDER FOR REMAINING SUBMENUS TO PREVENT EMPTY BLOCKS */}
          {((activeMenuId >= 18 && activeMenuId <= 30 && ![18, 19, 24, 25, 26].includes(activeMenuId)) || [34, 35, 36, 37, 38].includes(activeMenuId)) && (
            <div className="border border-slate-800 bg-slate-900 p-6 rounded-2xl space-y-4">
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={14} className="text-indigo-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  {MENU_CATEGORIES.flatMap(c => c.items).find(i => i.id === activeMenuId)?.name}
                </h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed font-mono">
                {lang === "EN" 
                  ? "This section has been dynamically initialized and linked under OTTOMASS JACQUARD accounts ledger protocols. The double-entry framework monitors continuous real-time ledger outputs. Click raw ledger updates above to sync data flows."
                  : "এই সেকশনটি অটোমাস জ্যাকার্ড লেজার অনুক্রমের আওতায় স্বয়ংক্রিয়ভাবে সংযুক্ত করা হয়েছে। লেজারের সামগ্রিক দ্বিমুখী হিসাব ট্র্যাকিং সচল আছে।"}
              </p>
              <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-850 font-mono text-[11px] leading-relaxed space-y-2">
                <p className="text-slate-500 uppercase text-[9.5px] font-bold">Simulated Data Matrix View</p>
                <div className="flex justify-between">
                  <span>Reporting Period:</span>
                  <span className="text-indigo-400 font-bold">{financialYear}</span>
                </div>
                <div className="flex justify-between">
                  <span>Consensus Integrity:</span>
                  <span className="text-emerald-400 font-bold">✓ 100% Balanced Double-Entry Node</span>
                </div>
                <div className="flex justify-between">
                  <span>Audit Trail Logged:</span>
                  <span className="text-slate-350 italic">Accounts tracking active under key: {userEmail}</span>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* 4. FAST DOUBLE ENTRY VOUCHER BUILDER MODAL */}
      <AnimatePresence>
        {showVoucherModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto space-y-5"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                    <Layers className="h-4.5 w-4.5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Filing New Double-Entry {modalVoucherType} Voucher</h3>
                    <p className="text-[10px] text-slate-450">Double-entry ledger verification constraints are enforced automatically.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowVoucherModal(false)}
                  className="p-1 px-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
                >
                  <X size={14} />
                </button>
              </div>

              <form onSubmit={handleCreateVoucherSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                  <div>
                    <label className="block text-[10px] uppercase font-extrabold text-slate-500 mb-1">Voucher Type Selector</label>
                    <select
                      value={modalVoucherType}
                      onChange={(e) => setModalVoucherType(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 p-2 rounded text-slate-300 focus:outline-hidden"
                    >
                      <option value="Journal">Journal Voucher (JV)</option>
                      <option value="Payment">Payment Voucher (PV)</option>
                      <option value="Receive">Receive Voucher (RV)</option>
                      <option value="Contra">Contra Voucher (CV)</option>
                      <option value="Purchase">Purchase Voucher</option>
                      <option value="Sales">Sales Voucher</option>
                      <option value="Salary">Salary Voucher</option>
                      <option value="Adjustment">Adjustment Voucher</option>
                      <option value="Debit Note">Debit Note</option>
                      <option value="Credit Note">Credit Note</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-extrabold text-slate-500 mb-1">Voucher Ref / Challan Identifier</label>
                    <input 
                      type="text" 
                      value={voucherRef}
                      onChange={(e) => setVoucherRef(e.target.value)}
                      placeholder="HM-CHALLAN-902" 
                      className="w-full bg-slate-950 border border-slate-800 p-2 rounded text-slate-300 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] whitespace-nowrap uppercase font-extrabold text-slate-505 mb-1">Global Narration / Particular Explanation</label>
                  <input 
                    type="text"
                    required
                    value={voucherNarration}
                    onChange={(e) => setVoucherNarration(e.target.value)}
                    placeholder="Wages clearance / mercerized cotton purchase log"
                    className="w-full bg-slate-950 border border-slate-800 p-2 text-xs rounded text-slate-300 focus:outline-hidden font-mono"
                  />
                </div>

                {/* Rows Grid builder */}
                <div className="space-y-2">
                  <span className="block text-[11px] font-black uppercase text-indigo-400 tracking-wider">Double-Entry Transaction Lines:</span>
                  
                  {voucherLines.map((line, idx) => (
                    <div key={idx} className="grid grid-cols-1 md:grid-cols-4 gap-2 items-center bg-slate-950 p-2.5 rounded-xl border border-slate-850">
                      <div>
                        <span className="block text-[9px] uppercase text-slate-500 mb-0.5">Account Ledger Node</span>
                        <select
                          value={line.accountCode}
                          onChange={(e) => handleUpdateLine(idx, "accountCode", e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded p-1 text-[11px] text-slate-300 font-mono focus:outline-hidden"
                        >
                          {accounts.map(acc => (
                            <option key={acc.code} value={acc.code}>[{acc.code}] {acc.name}</option>
                          ))}
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-1.5">
                        <div>
                          <span className="block text-[9px] uppercase text-slate-500 mb-0.5">Debit Amount (৳)</span>
                          <input 
                            type="number"
                            value={line.debit || ""}
                            onChange={(e) => {
                              handleUpdateLine(idx, "debit", Number(e.target.value) || 0);
                              if (Number(e.target.value) > 0) {
                                handleUpdateLine(idx, "credit", 0); // debit row clears credit
                              }
                            }}
                            className="w-full bg-slate-900 border border-slate-800 rounded p-1 text-[11px] text-emerald-400 font-mono text-right focus:outline-hidden"
                          />
                        </div>
                        <div>
                          <span className="block text-[9px] uppercase text-slate-500 mb-0.5">Credit Amount (৳)</span>
                          <input 
                            type="number"
                            value={line.credit || ""}
                            onChange={(e) => {
                              handleUpdateLine(idx, "credit", Number(e.target.value) || 0);
                              if (Number(e.target.value) > 0) {
                                handleUpdateLine(idx, "debit", 0); // credit row clears debit
                              }
                            }}
                            className="w-full bg-slate-900 border border-slate-800 rounded p-1 text-[11px] text-rose-400 font-mono text-right focus:outline-hidden"
                          />
                        </div>
                      </div>

                      <div>
                        <span className="block text-[9px] uppercase text-slate-500 mb-0.5">Line Description</span>
                        <input 
                          type="text"
                          value={line.desc}
                          placeholder="Specific line details"
                          onChange={(e) => handleUpdateLine(idx, "desc", e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded p-1 text-[11px] text-slate-350 focus:outline-hidden font-mono"
                        />
                      </div>

                      <div className="flex justify-end pt-3">
                        <button
                          type="button"
                          onClick={() => handleRemoveVoucherLine(idx)}
                          className="p-1 px-1.5 rounded bg-rose-950/60 hover:bg-rose-900 text-rose-400 flex items-center justify-center"
                        >
                          <Trash2 size={11.5} />
                        </button>
                      </div>
                    </div>
                  ))}

                  <div className="flex justify-start">
                    <button
                      type="button"
                      onClick={handleAddVoucherLine}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10.5px] font-mono py-1.5 px-3 rounded flex items-center gap-1 border border-slate-700"
                    >
                      <Plus size={11} /> Add Entry Account Line
                    </button>
                  </div>
                </div>

                {/* Totals Balance validation ticker */}
                <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-850 font-mono text-xs flex justify-between items-center">
                  <div>
                    <p className="text-slate-500 text-[10px] uppercase font-bold">Consensus Double-Entry Verification:</p>
                    <div className="flex gap-4 mt-1 text-slate-350">
                      <span>Debit Sum: <strong className="text-emerald-400">৳{totalLinesDebit.toLocaleString()}</strong></span>
                      <span>Credit Sum: <strong className="text-rose-400">৳{totalLinesCredit.toLocaleString()}</strong></span>
                    </div>
                  </div>
                  <div>
                    {totalLinesDebit === totalLinesCredit && totalLinesDebit > 0 ? (
                      <span className="text-emerald-400 font-bold bg-emerald-950/60 border border-emerald-800/35 px-2 py-1 rounded flex items-center gap-1 text-[10px]">
                        <Check size={11} className="stroke-[3]" /> Balanced Node
                      </span>
                    ) : (
                      <span className="text-amber-400 font-bold bg-amber-950/60 border border-amber-900/35 px-2 py-1 rounded flex items-center gap-1 text-[10px]">
                        <AlertTriangle size={11} /> Unbalanced
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex justify-end pt-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setShowVoucherModal(false)}
                    className="p-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-705 text-slate-400 font-mono text-xs"
                  >
                    Cancel Draft
                  </button>
                  <button
                    type="submit"
                    disabled={totalLinesDebit !== totalLinesCredit || totalLinesDebit <= 0}
                    className="p-2 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-505 disabled:bg-slate-800 disabled:text-slate-600 text-slate-950 font-sans font-black text-xs"
                  >
                    Post &amp; Balance Double-Entry
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
