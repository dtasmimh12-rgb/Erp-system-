import React, { useState, useEffect, useMemo } from "react";
import { 
  Plus, Save, Trash2, Edit2, CheckCircle, Search, RefreshCw, AlertCircle, 
  Settings, Link, FileText, Activity, ShieldCheck, Check, Award, LayoutGrid, Cpu, Clock, Coins, Terminal
} from "lucide-react";
import { DailyProductionEntry, ProductionSetting, ChartOfAccount, JournalVoucher, InventoryItem } from "../types";

// Import modular pages
import DailyProductionGrid from "./production/DailyProductionGrid";
import ProductionDashboard from "./production/ProductionDashboard";
import BuyerSummaryTable from "./production/BuyerSummaryTable";
import ProductionReports from "./production/ProductionReports";

interface ProductionModuleProps {
  accounts: ChartOfAccount[];
  setAccounts: React.Dispatch<React.SetStateAction<ChartOfAccount[]>>;
  onAddVoucher: (v: JournalVoucher) => void;
  userRole: string;
  lang: "EN" | "BN";
  inventory?: InventoryItem[];
  setInventory?: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
}

// Seed production entries following requested styles & parties
const SEED_DAILY_ENTRIES: DailyProductionEntry[] = [
  {
    id: "prod-1",
    date: "2026-05-23",
    buyer: "SPRING",
    style: "327",
    cfmRate: 60,
    orderQty: 25000,
    prevProdQty: 2000,
    dayMachine: 15,
    dayProdQty: 120,
    nightMachine: 14,
    nightProdQty: 105,
    totalUsedMachine: 15,
    totalProdQty: 225,
    grandTotalProd: 2225,
    balanceQty: 22775,
    totalMachineQty: 40,
    productionAmount: 13500, // 225 * 60
    stopMachine: 1,
    stopHour: 2,
    lostMinute: 120,
    remarks: "Thread tensioner replacement on Block A",
    status: "Posted to Accounts",
    createdBy: "Tariqul Islam",
    createdAt: "2026-05-23T08:00:00Z",
    updatedAt: "2026-05-23T11:00:00Z"
  },
  {
    id: "prod-2",
    date: "2026-05-23",
    buyer: "TOP-TEX",
    style: "HEART",
    cfmRate: 45,
    orderQty: 18000,
    prevProdQty: 1200,
    dayMachine: 20,
    dayProdQty: 180,
    nightMachine: 20,
    nightProdQty: 190,
    totalUsedMachine: 20,
    totalProdQty: 370,
    grandTotalProd: 1570,
    balanceQty: 16430,
    totalMachineQty: 40,
    productionAmount: 16650, // 370 * 45
    stopMachine: 2,
    stopHour: 4,
    lostMinute: 240,
    remarks: "Yarn feeder clogging issue",
    status: "Approved",
    createdBy: "Tariqul Islam",
    createdAt: "2026-05-23T08:30:00Z",
    updatedAt: "2026-05-23T11:30:00Z"
  },
  {
    id: "prod-3",
    date: "2026-05-22",
    buyer: "BISMILLAH-BUYING",
    style: "003",
    cfmRate: 60,
    orderQty: 30000,
    prevProdQty: 4500,
    dayMachine: 10,
    dayProdQty: 90,
    nightMachine: 10,
    nightProdQty: 85,
    totalUsedMachine: 10,
    totalProdQty: 175,
    grandTotalProd: 4675,
    balanceQty: 25325,
    totalMachineQty: 40,
    productionAmount: 10500, // 175 * 60
    stopMachine: 0,
    stopHour: 0,
    lostMinute: 0,
    remarks: "Optimal line output",
    status: "Posted to Accounts",
    createdBy: "Tariqul Islam",
    createdAt: "2026-05-22T08:00:00Z",
    updatedAt: "2026-05-22T10:00:00Z"
  },
  {
    id: "prod-4",
    date: "2026-05-22",
    buyer: "SRK APPARELS",
    style: "256P",
    cfmRate: 40,
    orderQty: 15000,
    prevProdQty: 800,
    dayMachine: 12,
    dayProdQty: 110,
    nightMachine: 12,
    nightProdQty: 95,
    totalUsedMachine: 12,
    totalProdQty: 205,
    grandTotalProd: 1005,
    balanceQty: 13995,
    totalMachineQty: 40,
    productionAmount: 8200, // 205 * 40
    stopMachine: 0,
    stopHour: 0,
    lostMinute: 0,
    remarks: "Normal operations",
    status: "Draft",
    createdBy: "Production Operator",
    createdAt: "2026-05-22T09:00:00Z",
    updatedAt: "2026-05-22T09:00:00Z"
  },
  {
    id: "prod-5",
    date: "2026-05-21",
    buyer: "KISHAN",
    style: "161",
    cfmRate: 120,
    orderQty: 8000,
    prevProdQty: 500,
    dayMachine: 5,
    dayProdQty: 45,
    nightMachine: 5,
    nightProdQty: 40,
    totalUsedMachine: 5,
    totalProdQty: 85,
    grandTotalProd: 585,
    balanceQty: 7415,
    totalMachineQty: 40,
    productionAmount: 10200, // 85 * 120
    stopMachine: 1,
    stopHour: 1.5,
    lostMinute: 90,
    remarks: "Needle breakage replacement",
    status: "Posted to Accounts",
    createdBy: "Production Operator",
    createdAt: "2026-05-21T08:00:00Z",
    updatedAt: "2026-05-21T11:00:00Z"
  }
];

const SEED_PAYMENTS = [
  { date: "2026-05-20", buyer: "SPRING", amount: 150000, billNo: "BILL-MAY-01", remarks: "RTGS Clearing Bank Asia" },
  { date: "2026-05-22", buyer: "BISMILLAH-BUYING", amount: 300000, billNo: "SLIP-09A1", remarks: "Cheque received to DBBL ACC" }
];

const SEED_QC = [
  { id: "qc-1", date: "2026-05-23", styleNo: "STY-HM-221", operatorName: "Abdul Karim", panelType: "Front body panel", inspectedQty: 300, passedQty: 295, minorDefects: 4, majorDefects: 1, actionTaken: "Defect panel sent for mending", inspector: "Saddat Rahman" },
  { id: "qc-2", date: "2026-05-23", styleNo: "STY-ZRA-092", operatorName: "Kamrul Islam", panelType: "Sleeves panels", inspectedQty: 150, passedQty: 147, minorDefects: 2, majorDefects: 1, actionTaken: "Inspected at iron post", inspector: "Saddat Rahman" }
];

const SEED_MAINTENANCE = [
  { id: "ticket-1", date: "2026-05-23", machineNo: "OJ-ST-06", brand: "Stoll", issue: "Broken needle on bed B slot 45", repairStatus: "In Progress", partsReplaced: "Groz-Beckert Needle Voigt-02", techName: "Rafiqul Hasan" },
  { id: "ticket-2", date: "2026-05-22", machineNo: "OJ-SM-12", brand: "Shima Seiki", issue: "Pattern file transfer timeout buffer full", repairStatus: "Resolved", partsReplaced: "None (Memory cache reset)", techName: "Rafiqul Hasan" }
];

const SEED_ASSETS = [
  { id: "asset-1", serialNo: "OMJ-EQ-001", name: "Stoll 12GG Computerized Knitting Machine", category: "Knitting Machine", floorLocation: "Floor 3 West Wing", status: "Running", valueBdt: 4200000 },
  { id: "asset-2", serialNo: "OMJ-EQ-002", name: "Shima Seiki 7GG Computerized Knitting Machine", category: "Knitting Machine", floorLocation: "Floor 3 East Wing", status: "Running", valueBdt: 4800000 },
  { id: "asset-3", serialNo: "OMJ-EQ-101", name: "Heavy Screw Air Compressor Central Unit 45KW", category: "Utility Air Compressor", floorLocation: "Utility Room Outer Annex", status: "Running", valueBdt: 1250000 },
  { id: "asset-4", serialNo: "OMJ-EQ-201", name: "Heavy Duty 400KVA Diesel Power Generator", category: "Factory Power Backup", floorLocation: "Ground Floor Generator Room", status: "Running", valueBdt: 2450000 }
];

const SEED_PACKING = [
  { id: "pack-1", chalNo: "CHAL-2026-601", date: "2026-05-23", styleNo: "STY-HM-221", buyer: "SPRING", cartonCount: 45, itemsPerCarton: 40, totalPcs: 1800, grossWeightKg: 420, driverPhone: "01755-123456", status: "Shipped" },
  { id: "pack-2", chalNo: "CHAL-2026-602", date: "2026-05-22", styleNo: "STY-ZRA-092", buyer: "TOP-TEX", cartonCount: 30, itemsPerCarton: 50, totalPcs: 1500, grossWeightKg: 380, driverPhone: "01811-987654", status: "In Transshipment" }
];

export default function ProductionModule({
  accounts,
  setAccounts,
  onAddVoucher,
  userRole,
  lang,
  inventory,
  setInventory
}: ProductionModuleProps) {
  // Navigation Menu tabs inside Production Management
  const [activeMenuTab, setActiveMenuTab] = useState<string>("dashboard");

  // Load state from local storage or fallback to defaults
  const [entries, setEntries] = useState<DailyProductionEntry[]>(() => {
    const saved = localStorage.getItem("ottomass_production_entries");
    return saved ? JSON.parse(saved) : SEED_DAILY_ENTRIES;
  });

  const [payments, setPayments] = useState<any[]>(() => {
    const saved = localStorage.getItem("ottomass_production_payments");
    return saved ? JSON.parse(saved) : SEED_PAYMENTS;
  });

  const [settings, setSettings] = useState<ProductionSetting>(() => {
    const saved = localStorage.getItem("ottomass_production_settings");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          productionAccountingMode: parsed.productionAccountingMode || "Post manually after approval",
          allowNegativeBalanceOverride: parsed.allowNegativeBalanceOverride ?? true,
          autoPostApprovedEntries: parsed.autoPostApprovedEntries ?? (parsed.productionAccountingMode === "Auto-post after approval")
        };
      } catch (e) {
        // Fallback
      }
    }
    return {
      productionAccountingMode: "Post manually after approval",
      allowNegativeBalanceOverride: true,
      autoPostApprovedEntries: false
    };
  });

  // Track double entries generated
  const [glLogs, setGlLogs] = useState<any[]>(() => {
    const saved = localStorage.getItem("ottomass_production_gl_links");
    return saved ? JSON.parse(saved) : [
      { id: "pv-lnk-1", voucherNo: "PV-INC-1002", date: "2026-05-23", buyer: "SPRING", amount: 13500, status: "Posted", referenceEntry: "prod-1" },
      { id: "pv-lnk-2", voucherNo: "PV-INC-1004", date: "2026-05-22", buyer: "BISMILLAH-BUYING", amount: 10500, status: "Posted", referenceEntry: "prod-3" },
      { id: "pv-lnk-3", voucherNo: "PV-INC-1005", date: "2026-05-21", buyer: "KISHAN", amount: 10200, status: "Posted", referenceEntry: "prod-5" }
    ];
  });

  // Additional production-related modules states
  const [qcRecords, setQcRecords] = useState<any[]>(() => {
    const saved = localStorage.getItem("ottomass_qc_records");
    return saved ? JSON.parse(saved) : SEED_QC;
  });

  const [maintRecords, setMaintRecords] = useState<any[]>(() => {
    const saved = localStorage.getItem("ottomass_maint_records");
    return saved ? JSON.parse(saved) : SEED_MAINTENANCE;
  });

  const [assetRecords, setAssetRecords] = useState<any[]>(() => {
    const saved = localStorage.getItem("ottomass_asset_records");
    return saved ? JSON.parse(saved) : SEED_ASSETS;
  });

  const [packingRecords, setPackingRecords] = useState<any[]>(() => {
    const saved = localStorage.getItem("ottomass_packing_records");
    return saved ? JSON.parse(saved) : SEED_PACKING;
  });

  // Forms state inside local sub-modules
  const [qcStyle, setQcStyle] = useState("STY-HM-221");
  const [qcInspected, setQcInspected] = useState(200);
  const [qcPassed, setQcPassed] = useState(197);
  const [qcMinor, setQcMinor] = useState(2);
  const [qcMajor, setQcMajor] = useState(1);
  const [qcAction, setQcAction] = useState("Direct Line check ok");

  const [maintMachine, setMaintMachine] = useState("OJ-ST-05");
  const [maintIssue, setMaintIssue] = useState("Needle slot lubing adjustment needed");
  const [maintNeedles, setMaintNeedles] = useState(1);

  const [packStyle, setPackStyle] = useState("STY-HM-221");
  const [packBuyer, setPackBuyer] = useState("SPRING");
  const [packCartons, setPackCartons] = useState(10);
  const [packQtyPerCarton, setPackQtyPerCarton] = useState(50);
  const [packWeight, setPackWeight] = useState(120);

  // Persists states in case iframe resets
  useEffect(() => {
    localStorage.setItem("ottomass_production_entries", JSON.stringify(entries));
  }, [entries]);

  useEffect(() => {
    localStorage.setItem("ottomass_production_payments", JSON.stringify(payments));
  }, [payments]);

  useEffect(() => {
    localStorage.setItem("ottomass_production_settings", JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem("ottomass_production_gl_links", JSON.stringify(glLogs));
  }, [glLogs]);

  useEffect(() => {
    localStorage.setItem("ottomass_qc_records", JSON.stringify(qcRecords));
  }, [qcRecords]);

  useEffect(() => {
    localStorage.setItem("ottomass_maint_records", JSON.stringify(maintRecords));
  }, [maintRecords]);

  useEffect(() => {
    localStorage.setItem("ottomass_asset_records", JSON.stringify(assetRecords));
  }, [assetRecords]);

  useEffect(() => {
    localStorage.setItem("ottomass_packing_records", JSON.stringify(packingRecords));
  }, [packingRecords]);

  // Actions
  const handleAddQc = (e: React.FormEvent) => {
    e.preventDefault();
    const newQc = {
      id: `qc-${Date.now()}`,
      date: new Date().toISOString().substring(0, 10),
      styleNo: qcStyle,
      operatorName: "Live Floor Inspector",
      panelType: "Body panel check",
      inspectedQty: qcInspected,
      passedQty: qcPassed,
      minorDefects: qcMinor,
      majorDefects: qcMajor,
      actionTaken: qcAction,
      inspector: "Saddat Rahman"
    };
    setQcRecords([newQc, ...qcRecords]);
    alert("QC Inspection ticket added to the tracking log!");
  };

  const handleAddMaintenance = (e: React.FormEvent) => {
    e.preventDefault();
    const matchM = assetRecords.find(a => a.serialNo === maintMachine || a.id === maintMachine);
    const brandStr = matchM ? matchM.name.split(" ")[0] : "Stoll";

    const newTicket = {
      id: `ticket-${Date.now()}`,
      date: new Date().toISOString().substring(0, 10),
      machineNo: maintMachine,
      brand: brandStr,
      issue: maintIssue,
      repairStatus: "Resolved",
      partsReplaced: `${maintNeedles} x Groz-Beckert Needles`,
      techName: "Rafiqul Hasan"
    };
    setMaintRecords([newTicket, ...maintRecords]);

    // Also deduct needle spare parts from inventory average value if linked!
    if (inventory && setInventory && maintNeedles > 0) {
      const needlesItem = inventory.find(i => i.itemCode === "MST-NDL-07");
      if (needlesItem) {
        setInventory(prev => prev.map(item => {
          if (item.itemCode === "MST-NDL-07") {
            return { ...item, currentQty: Math.max(0, item.currentQty - maintNeedles) };
          }
          return item;
        }));
      }
    }
    alert("Maintenance breakdown log successfully locked and resolved.");
  };

  const handleAddPacking = (e: React.FormEvent) => {
    e.preventDefault();
    const calculatedPcs = packCartons * packQtyPerCarton;
    const newChal = {
      id: `pack-${Date.now()}`,
      chalNo: `CHAL-2026-${String(packingRecords.length + 603)}`,
      date: new Date().toISOString().substring(0, 10),
      styleNo: packStyle,
      buyer: packBuyer,
      cartonCount: packCartons,
      itemsPerCarton: packQtyPerCarton,
      totalPcs: calculatedPcs,
      grossWeightKg: packWeight,
      driverPhone: "01755-123456",
      status: "Gate Pass Issued"
    };
    setPackingRecords([newChal, ...packingRecords]);
    alert(`Packing slip issued: Export Challan ${newChal.chalNo} cataloged!`);
  };

  // Operations triggers
  const handleAddEntry = (entryPartial: Partial<DailyProductionEntry>) => {
    const fresh: DailyProductionEntry = {
      id: `prod-${Date.now().toString().slice(-4)}`,
      date: entryPartial.date || new Date().toISOString().substring(0, 10),
      buyer: entryPartial.buyer || "SPRING",
      style: entryPartial.style || "327",
      cfmRate: entryPartial.cfmRate ?? 60,
      orderQty: entryPartial.orderQty ?? 25000,
      prevProdQty: entryPartial.prevProdQty ?? 2000,
      dayMachine: entryPartial.dayMachine ?? 15,
      dayProdQty: entryPartial.dayProdQty ?? 120,
      nightMachine: entryPartial.nightMachine ?? 14,
      nightProdQty: entryPartial.nightProdQty ?? 105,
      totalUsedMachine: entryPartial.totalUsedMachine ?? 15,
      totalProdQty: entryPartial.totalProdQty ?? 225,
      grandTotalProd: entryPartial.grandTotalProd ?? 2225,
      balanceQty: entryPartial.balanceQty ?? 22775,
      totalMachineQty: entryPartial.totalMachineQty ?? 40,
      productionAmount: entryPartial.productionAmount ?? 13500,
      stopMachine: entryPartial.stopMachine ?? 1,
      stopHour: entryPartial.stopHour ?? 2,
      lostMinute: entryPartial.lostMinute ?? 120,
      remarks: entryPartial.remarks || "Direct input",
      status: "Draft",
      createdBy: entryPartial.createdBy || "Operational Owner",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setEntries(prev => [fresh, ...prev]);
  };

  const handleUpdateEntry = (id: string, updated: Partial<DailyProductionEntry>) => {
    const oldEntry = entries.find(x => x.id === id);
    if (!oldEntry) return;

    setEntries(prev => {
      return prev.map(e => {
        if (e.id === id) {
          const fresh = { ...e, ...updated, updatedAt: new Date().toISOString() };
          
          // Auto-post triggers if autoPostApprovedEntries is enabled and status is changing to Approved
          if (updated.status === "Approved" && settings.autoPostApprovedEntries && e.status !== "Posted to Accounts") {
            // we will run posting logic right after state update completes
            setTimeout(() => handlePostEntry(id), 50);
          }
          
          return fresh;
        }
        return e;
      });
    });

    // Check if it was already posted to accounts - trigger dynamic ledger Adjustment!
    if (oldEntry.status === "Posted to Accounts" && updated.productionAmount !== undefined) {
      const diff = updated.productionAmount - oldEntry.productionAmount;
      if (diff !== 0) {
        // Formulate adjustment voucher
        const vNo = `ADJ-PROD-${Date.now().toString().slice(-4)}`;
        const freshV: JournalVoucher = {
          id: `vchr-${Date.now()}`,
          voucherNo: vNo,
          date: updated.date || oldEntry.date,
          narration: `Adjustment for Buyer: ${oldEntry.buyer}, Style: ${oldEntry.style}. Discrepancy amount difference: BDT ${diff}`,
          status: "Posted",
          createdBy: "Automated Ledger Adjustments",
          items: diff > 0 ? [
            { accountCode: "1202", accountName: "Buyer Receivable", debit: diff, credit: 0, narration: "Increase in production yield" },
            { accountCode: "4002", accountName: "Buyer Order Income", debit: 0, credit: diff, narration: "Positive production yield adjustment" }
          ] : [
            { accountCode: "4002", accountName: "Buyer Order Income", debit: Math.abs(diff), credit: 0, narration: "Decrease in production yield" },
            { accountCode: "1202", accountName: "Buyer Receivable", debit: 0, credit: Math.abs(diff), narration: "Negative production yield adjustment" }
          ]
        };

        onAddVoucher(freshV);

        // Adjust real account balances
        setAccounts(prev => {
          return prev.map(a => {
            if (a.code === "1202") {
              return { ...a, balance: a.balance + diff };
            }
            if (a.code === "4002") {
              return { ...a, balance: a.balance + diff };
            }
            return a;
          });
        });

        // Add to production gl links list
        setGlLogs(prev => [
          {
            id: `gl-adj-${Date.now()}`,
            voucherNo: vNo,
            date: oldEntry.date,
            buyer: oldEntry.buyer,
            amount: diff,
            status: "Adjusted",
            referenceEntry: id
          },
          ...prev
        ]);
      }
    }
  };

  const handleDeleteEntry = (id: string) => {
    const target = entries.find(x => x.id === id);
    if (target?.status === "Posted to Accounts") {
      alert("Error: Strictly forbidden to delete Posted entries! You can only adjust them.");
      return;
    }
    setEntries(prev => prev.filter(e => e.id !== id));
  };

  const handleApproveEntry = (id: string) => {
    handleUpdateEntry(id, { status: "Approved" });
  };

  // Real ledger double-entry generator
  const handlePostEntry = (id: string) => {
    const entry = entries.find(e => e.id === id);
    if (!entry) return;
    if (entry.status === "Posted to Accounts") {
      alert("Warning: Entry already posted to accounts!");
      return;
    }

    // Build Voucher No
    const voucherNo = `V-INC-PROD-${Date.now().toString().slice(-4)}`;

    const freshV: JournalVoucher = {
      id: `vchr-${Date.now()}`,
      voucherNo,
      date: entry.date,
      narration: `Production Revenue for Buyer: ${entry.buyer}, Style: ${entry.style}. Qty: ${entry.totalProdQty} pcs @ Rate BDT ${entry.cfmRate}/pc`,
      status: "Posted",
      createdBy: "Tariqul Islam",
      items: [
        { accountCode: "1202", accountName: "Buyer Receivable", debit: entry.productionAmount, credit: 0, narration: `Receivable from ${entry.buyer}` },
        { accountCode: "4002", accountName: "Buyer Order Income", debit: 0, credit: entry.productionAmount, narration: "Knit yield billable revenue" }
      ]
    };

    // Dispatch voucher to primary state
    onAddVoucher(freshV);

    // Dynamic material BOM consumption triggered automatically during accounts posting!
    const STYLE_BOMS = [
      { style: "327", yarnCode: "YRN-ACY-32", yarnName: "Acrylic Cashlike 2/32 Yarn", consumptionGramsPerPc: 220, category: "Yarn", assetCode: "1401" },
      { style: "HEART", yarnCode: "YRN-COT-40", yarnName: "Mercerized Cotton 2/40 Yarn", consumptionGramsPerPc: 250, category: "Yarn", assetCode: "1401" },
      { style: "003", yarnCode: "YRN-ACY-32", yarnName: "Acrylic Cashlike 2/32 Yarn", consumptionGramsPerPc: 210, category: "Yarn", assetCode: "1401" },
      { style: "256P", yarnCode: "YRN-COT-40", yarnName: "Mercerized Cotton 2/40 Yarn", consumptionGramsPerPc: 180, category: "Yarn", assetCode: "1401" },
      { style: "161", yarnCode: "YRN-ACY-32", yarnName: "Acrylic Cashlike 2/32 Yarn", consumptionGramsPerPc: 280, category: "Yarn", assetCode: "1401" }
    ];

    const matchBOM = STYLE_BOMS.find(b => b.style === entry.style);
    if (matchBOM && inventory && setInventory) {
      const yarnItem = inventory.find(i => i.itemCode === matchBOM.yarnCode);
      if (yarnItem) {
        // (total production quantity * consumption per pc in grams / 1000) * average rate per kg
        const consumedKg = (entry.totalProdQty * matchBOM.consumptionGramsPerPc) / 1000;
        const totalConsumptionValuation = consumedKg * yarnItem.averageRate;

        const invVNo = `V-INV-CONS-${Date.now().toString().slice(-4)}`;
        const invVoucher: JournalVoucher = {
          id: `vchr-inv-${Date.now()}`,
          voucherNo: invVNo,
          date: entry.date,
          narration: `Automated material consumption for Style: ${entry.style}. Production: ${entry.totalProdQty} pcs. Consumed: ${consumedKg.toFixed(2)} kg of ${matchBOM.yarnName} @ Avg Rate: ${yarnItem.averageRate}`,
          status: "Posted",
          createdBy: "Auto BOM System",
          items: [
            { accountCode: "5001", accountName: "Yarn Consumption Cost", debit: totalConsumptionValuation, credit: 0, narration: "Production Yarn Expense" },
            { accountCode: "1401", accountName: "Inventory - Yarn", debit: 0, credit: totalConsumptionValuation, narration: "Direct stock credit" }
          ]
        };

        onAddVoucher(invVoucher);

        // Update balances in general ledger (including accounts)
        setAccounts(prev => {
          return prev.map(a => {
            if (a.code === "1202") {
              return { ...a, balance: a.balance + entry.productionAmount };
            }
            if (a.code === "4002") {
              return { ...a, balance: a.balance + entry.productionAmount };
            }
            if (a.code === "5001") {
              return { ...a, balance: a.balance + totalConsumptionValuation };
            }
            if (a.code === "1401") {
              return { ...a, balance: Math.max(0, a.balance - totalConsumptionValuation) };
            }
            return a;
          });
        });

        // Reduce stock in local store inventory
        setInventory(prev => prev.map(i => {
          if (i.itemCode === matchBOM.yarnCode) {
            return {
              ...i,
              currentQty: Math.max(0, i.currentQty - consumedKg)
            };
          }
          return i;
        }));

        // Append a Stock Issue transaction to locally stored movements so InventoryModule can synchronize
        const freshMovement = {
          id: `move-auto-${Date.now()}`,
          date: entry.date,
          itemCode: matchBOM.yarnCode,
          itemName: matchBOM.yarnName,
          type: "Production Consumption" as const,
          quantity: -consumedKg,
          rate: yarnItem.averageRate,
          totalAmount: totalConsumptionValuation,
          referenceNo: invVNo,
          remarks: `Auto production consumption style ${entry.style} yield.`
        };

        const savedMovements = localStorage.getItem("ottomass_inventory_movements");
        const movementsList = savedMovements ? JSON.parse(savedMovements) : [];
        movementsList.unshift(freshMovement);
        localStorage.setItem("ottomass_inventory_movements", JSON.stringify(movementsList));
      } else {
        // If BOM matches but yarnItem not found, fallback to update just receivables and income
        setAccounts(prev => {
          return prev.map(a => {
            if (a.code === "1202") {
              return { ...a, balance: a.balance + entry.productionAmount };
            }
            if (a.code === "4002") {
              return { ...a, balance: a.balance + entry.productionAmount };
            }
            return a;
          });
        });
      }
    } else {
      // Fallback if no inventory module linked or no matching style BOM
      setAccounts(prev => {
        return prev.map(a => {
          if (a.code === "1202") {
            return { ...a, balance: a.balance + entry.productionAmount };
          }
          if (a.code === "4002") {
            return { ...a, balance: a.balance + entry.productionAmount };
          }
          return a;
        });
      });
    }

    // Update daily entry status to Posted
    setEntries(prev => {
      return prev.map(e => {
        if (e.id === id) {
          return { ...e, status: "Posted to Accounts" };
        }
        return e;
      });
    });

    // Add to link list
    setGlLogs(prev => [
      {
        id: `gl-lnk-${Date.now()}`,
        voucherNo,
        date: entry.date,
        buyer: entry.buyer,
        amount: entry.productionAmount,
        status: "Posted",
        referenceEntry: id
      },
      ...prev
    ]);
  };

  const handleRecordPayment = (payment: { date: string; buyer: string; amount: number; billNo: string; remarks: string }) => {
    // Offset Accounts Receivable and Increase Cash Account
    const freshPayment = {
      ...payment,
      id: `rcpt-${Date.now()}`,
      remarks: `${payment.remarks} (GL Posted: Dr 1001 / Cr 1202)`
    };

    setPayments(prev => [freshPayment, ...prev]);

    // Dispatch actual receipt voucher
    const vNo = `V-RCPT-BUYER-${Date.now().toString().slice(-3)}`;
    const freshV: JournalVoucher = {
      id: `vchr-${Date.now()}`,
      voucherNo: vNo,
      date: payment.date,
      narration: `Remittance collection from ${payment.buyer}. Reference Invoice: ${payment.billNo}`,
      status: "Posted",
      createdBy: "Tariqul Islam",
      items: [
        { accountCode: "1001", accountName: "Cash in Hand", debit: payment.amount, credit: 0, narration: `Receipt offset` },
        { accountCode: "1202", accountName: "Buyer Receivable", debit: 0, credit: payment.amount, narration: `Collection credit offset` }
      ]
    };

    onAddVoucher(freshV);

    // Mutate chart balances in state
    setAccounts(prev => {
      return prev.map(a => {
        if (a.code === "1001") {
          return { ...a, balance: a.balance + payment.amount };
        }
        if (a.code === "1202") {
          return { ...a, balance: Math.max(0, a.balance - payment.amount) };
        }
        return a;
      });
    });
  };

  // Calculate sum of payments for dashboard
  const receivedPaymentsSum = useMemo(() => {
    return payments.reduce((acc, c) => acc + c.amount, 0);
  }, [payments]);

  return (
    <div className="space-y-6 font-sans">
      
      {/* 10 Subsystem Header Menus Navigation */}
      <div className="flex flex-wrap gap-1.5 p-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-2xl w-max min-w-full overflow-x-auto text-[11px] font-bold">
        <button 
          onClick={() => setActiveMenuTab("dashboard")}
          className={`px-3 py-1.5 rounded-xl transition ${activeMenuTab === "dashboard" ? "bg-indigo-600 text-white" : "text-slate-600 dark:text-slate-400 hover:text-indigo-500"}`}
        >
          📈 3. Output Dashboard
        </button>
        <button 
          onClick={() => setActiveMenuTab("entry")}
          className={`px-3 py-1.5 rounded-xl transition ${activeMenuTab === "entry" ? "bg-indigo-600 text-white" : "text-slate-600 dark:text-slate-400 hover:text-indigo-500"}`}
        >
          📂 1. Daily Production Entry (Excel Grid)
        </button>
        <button 
          onClick={() => setActiveMenuTab("summaries")}
          className={`px-3 py-1.5 rounded-xl transition ${activeMenuTab === "summaries" ? "bg-indigo-600 text-white" : "text-slate-600 dark:text-slate-400 hover:text-indigo-500"}`}
        >
          👥 4 &amp; 5. Party &amp; Style Ledgers
        </button>
        <button 
          onClick={() => setActiveMenuTab("reports")}
          className={`px-3 py-1.5 rounded-xl transition ${activeMenuTab === "reports" ? "bg-indigo-600 text-white" : "text-slate-600 dark:text-slate-400 hover:text-indigo-500"}`}
        >
          📄 2. Production Reports (11 Formats)
        </button>
        <button 
          onClick={() => setActiveMenuTab("posting")}
          className={`px-3 py-1.5 rounded-xl transition ${activeMenuTab === "posting" ? "bg-indigo-600 text-white" : "text-slate-600 dark:text-slate-400 hover:text-indigo-500"}`}
        >
          🛡️ 8. Amount Posting Control
        </button>
        <button 
          onClick={() => setActiveMenuTab("accounting")}
          className={`px-3 py-1.5 rounded-xl transition ${activeMenuTab === "accounting" ? "bg-indigo-600 text-white" : "text-slate-600 dark:text-slate-400 hover:text-indigo-500"}`}
        >
          🔗 9. Accounts Double Entry link
        </button>
        <button 
          onClick={() => setActiveMenuTab("settings")}
          className={`px-3 py-1.5 rounded-xl transition ${activeMenuTab === "settings" ? "bg-indigo-600 text-white" : "text-slate-600 dark:text-slate-400 hover:text-indigo-500"}`}
        >
          ⚙️ 10. Ledger Settings
        </button>
        <button 
          onClick={() => setActiveMenuTab("qc")}
          className={`px-3 py-1.5 rounded-xl transition ${activeMenuTab === "qc" ? "bg-indigo-600 text-white" : "text-slate-600 dark:text-slate-400 hover:text-indigo-500"}`}
        >
          🔍 QC & Inspections
        </button>
        <button 
          onClick={() => setActiveMenuTab("maintenance")}
          className={`px-3 py-1.5 rounded-xl transition ${activeMenuTab === "maintenance" ? "bg-indigo-600 text-white" : "text-slate-600 dark:text-slate-400 hover:text-indigo-500"}`}
        >
          🔧 Machine Maintenance
        </button>
        <button 
          onClick={() => setActiveMenuTab("assets")}
          className={`px-3 py-1.5 rounded-xl transition ${activeMenuTab === "assets" ? "bg-indigo-600 text-white" : "text-slate-600 dark:text-slate-400 hover:text-indigo-500"}`}
        >
          🏢 Factory Asset Registry
        </button>
        <button 
          onClick={() => setActiveMenuTab("shipping")}
          className={`px-3 py-1.5 rounded-xl transition ${activeMenuTab === "shipping" ? "bg-indigo-600 text-white" : "text-slate-600 dark:text-slate-400 hover:text-indigo-500"}`}
        >
          📦 Packing & Gate pass
        </button>
      </div>

      {/* RENDER ACTIVE TABS */}
      
      {activeMenuTab === "dashboard" && (
        <ProductionDashboard 
          entries={entries} 
          accounts={accounts} 
          receivedPaymentsSum={receivedPaymentsSum} 
        />
      )}

      {activeMenuTab === "entry" && (
        <DailyProductionGrid 
          entries={entries}
          onAddEntry={handleAddEntry}
          onUpdateEntry={handleUpdateEntry}
          onDeleteEntry={handleDeleteEntry}
          onApproveEntry={handleApproveEntry}
          onPostEntry={handlePostEntry}
          settings={settings}
          userRole={userRole}
          lang={lang}
        />
      )}

      {activeMenuTab === "summaries" && (
        <BuyerSummaryTable 
          entries={entries}
          payments={payments}
          onAddPayment={handleRecordPayment}
          lang={lang}
        />
      )}

      {activeMenuTab === "reports" && (
        <ProductionReports 
          entries={entries}
          lang={lang} 
        />
      )}

      {/* Auxiliary posting sub-systems */}
      
      {activeMenuTab === "posting" && (
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-6 text-xs text-slate-200">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <div>
              <h3 className="font-display font-extrabold text-sm text-white uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="text-emerald-400" size={16} /> Subsystem 8: Production Amount Posting Center
              </h3>
              <p className="text-slate-500 font-sans mt-0.5">Control post approvals manually over active billing contracts</p>
            </div>
            <div className="bg-slate-950 font-mono text-[10px] px-3 py-1.5 rounded-lg text-emerald-400 border border-slate-850">
              Active Mode: {settings.productionAccountingMode}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-950 border border-slate-850 rounded-xl space-y-2">
              <span className="text-amber-500 font-bold block uppercase tracking-wider text-[10px]">Unposted Approved Queue</span>
              <p className="text-[22px] font-mono font-black text-white">
                {entries.filter(e => e.status === "Approved").length} <span className="text-xs text-slate-500 font-sans">Entries</span>
              </p>
              <p className="text-slate-400 text-[10.5px]">These have been fully audited and are ready for bulk posting to General Ledger books.</p>
            </div>
            <div className="p-4 bg-slate-950 border border-slate-850 rounded-xl space-y-2">
              <span className="text-emerald-400 font-bold block uppercase tracking-wider text-[10px]">Already posted to GL ledger</span>
              <p className="text-[22px] font-mono font-black text-white">
                {entries.filter(e => e.status === "Posted to Accounts").length} <span className="text-xs text-slate-500 font-sans font-normal">Registered Vouchers</span>
              </p>
              <p className="text-slate-400 text-[10.5px]">These are legally locked inside Chart of Accounts double ledger registries.</p>
            </div>
          </div>

          <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950">
            <table className="table-auto w-full text-center text-xs">
              <thead className="bg-[#111827] text-slate-400 uppercase font-mono text-[9px] border-b border-slate-800">
                <tr>
                  <th className="p-3 text-left">Date</th>
                  <th className="p-3 text-left">Buyer / Party</th>
                  <th className="p-3 text-center">Style Code</th>
                  <th className="p-3 text-right">Yield Qty</th>
                  <th className="p-3 text-right">Production Valuation Amount</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 w-40">Posting Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850 text-slate-300 font-mono text-[11.5px]">
                {entries.filter(e => e.status === "Approved" || e.status === "Posted to Accounts").map((e) => (
                  <tr key={e.id} className="hover:bg-slate-900/40">
                    <td className="p-3 text-left font-sans">{e.date}</td>
                    <td className="p-3 text-left font-sans font-black">{e.buyer}</td>
                    <td className="p-3 text-center text-indigo-300 font-bold">{e.style}</td>
                    <td className="p-3 text-right">{e.totalProdQty.toLocaleString()} pcs</td>
                    <td className="p-3 text-right text-emerald-400 font-bold">BDT {e.productionAmount.toLocaleString()}</td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold tracking-wider ${e.status === "Approved" ? "bg-indigo-950 text-indigo-400" : "bg-emerald-950 text-emerald-400"}`}>
                        {e.status}
                      </span>
                    </td>
                    <td className="p-3 font-sans">
                      {e.status === "Approved" ? (
                        <button 
                          onClick={() => handlePostEntry(e.id)}
                          className="px-2.5 py-1 bg-amber-500 text-slate-950 hover:bg-amber-400 font-bold rounded cursor-pointer"
                        >
                          Send to GL (Post)
                        </button>
                      ) : (
                        <span className="text-slate-500 font-semibold font-sans text-[11px]">✓ Legally Locked</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeMenuTab === "accounting" && (
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-6 text-xs text-slate-200">
          <div>
            <h3 className="font-display font-extrabold text-sm text-white uppercase tracking-wider flex items-center gap-1.5">
              <Link className="text-indigo-400" size={16} /> Subsystem 9: Production Accounts Link (Double Entry Schema)
            </h3>
            <p className="text-slate-500 font-sans mt-0.5">Understand dynamic ledger connections between active floors and financial journals</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch text-xs">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-3">
              <span className="text-indigo-400 font-bold font-mono tracking-wider text-[10px] uppercase block">Debit / Credit Booking Maps</span>
              <div className="space-y-4 font-mono text-[11px] text-slate-300">
                <div className="p-2.5 bg-[#111827] rounded-lg border-l-2 border-indigo-500">
                  <p className="text-indigo-300 font-bold">DEBIT: Buyer Receivable (Code 1202)</p>
                  <p className="text-slate-450 mt-1">Classification: Current Asset. Asset balances increase proportionally with production yield.</p>
                </div>
                <div className="p-2.5 bg-[#111827] rounded-lg border-l-2 border-emerald-500">
                  <p className="text-emerald-400 font-bold">CREDIT: Buyer Order Income (Code 4002)</p>
                  <p className="text-slate-450 mt-1">Classification: Operating revenue. Accrues directly on floor approvals of daily units.</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-2.5 text-[11px]">
              <span className="text-amber-500 font-bold block uppercase tracking-wider font-mono text-[10px]">Accounts Connection Audit Logs</span>
              <div className="space-y-2 max-h-[170px] overflow-y-auto scrollbar-thin divide-y divide-slate-850">
                {glLogs.map((log) => (
                  <div key={log.id} className="pt-2 font-mono flex justify-between items-center">
                    <div>
                      <p className="text-indigo-300 font-bold">{log.voucherNo}</p>
                      <p className="text-slate-500 text-[10px]">{log.buyer} • Date: {log.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-emerald-400 font-extrabold">BDT {log.amount.toLocaleString()}</p>
                      <p className="text-[9.5px] text-slate-500">{log.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeMenuTab === "settings" && (
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-6 text-xs text-slate-200">
          <div>
            <h3 className="font-display font-extrabold text-sm text-white uppercase tracking-wider flex items-center gap-1.5">
              <Settings className="text-slate-400" size={16} /> Subsystem 10: Production Report Settings
            </h3>
            <p className="text-slate-500 font-sans mt-0.5">Control operational override flags and Double Entry system behaviors</p>
          </div>

          <div className="max-w-2xl space-y-5 text-slate-300 text-xs">
            
            <div className="bg-slate-950 p-4 border border-slate-850 rounded-xl space-y-3">
              <label className="block text-[11px] text-amber-400 font-bold uppercase tracking-wider font-mono">Production Accounting Mode</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 font-sans mt-1">
                {[
                  "Auto-post after approval",
                  "Post manually after approval",
                  "Do not post automatically"
                ].map((mode: any) => (
                  <button
                    key={mode}
                    onClick={() => setSettings(prev => ({ 
                      ...prev, 
                      productionAccountingMode: mode, 
                      autoPostApprovedEntries: mode === "Auto-post after approval"
                    }))}
                    className={`p-3 rounded-xl border text-center font-bold tracking-tight transition cursor-pointer ${settings.productionAccountingMode === mode ? "bg-indigo-600/15 text-indigo-300 border-indigo-500" : "bg-slate-900 border-[#1e293b] text-slate-400 hover:text-white"}`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
              <p className="text-slate-500 text-[10px] leading-relaxed">
                * Note: Under <strong>Post manually after approval</strong>, approved yields must be reviewed and pushed to GL via Subsystem 8.
              </p>
            </div>

            <div className="bg-slate-950 p-4 border border-slate-850 rounded-xl flex items-center justify-between">
              <div>
                <span className="block text-[11px] text-indigo-400 font-bold uppercase tracking-wider font-mono">Auto-Post Approved Entries</span>
                <span className="block text-[10.5px] text-slate-500 font-sans mt-1">
                  Enabling this automatically triggers double-entry journal voucher creation as soon as a production record is set to <strong>Approved</strong>.
                </span>
              </div>
              <div>
                <button
                  onClick={() => setSettings(prev => {
                    const nextVal = !prev.autoPostApprovedEntries;
                    return {
                      ...prev,
                      autoPostApprovedEntries: nextVal,
                      productionAccountingMode: nextVal ? "Auto-post after approval" : "Post manually after approval"
                    };
                  })}
                  className={`px-4 py-2 rounded-xl border font-bold transition cursor-pointer text-xs ${settings.autoPostApprovedEntries ? "bg-emerald-600/15 border-emerald-500 text-emerald-400" : "bg-[#111827] border-slate-800 text-slate-500"}`}
                >
                  {settings.autoPostApprovedEntries ? "✓ AUTO-POST ACTIVE" : "✗ AUTO-POST DISABLED"}
                </button>
              </div>
            </div>

            <div className="bg-slate-950 p-4 border border-slate-850 rounded-xl flex items-center justify-between">
              <div>
                <span className="block text-[11px] text-white font-bold uppercase tracking-wider font-mono">Order Balance Lockout Limit</span>
                <span className="block text-[10.5px] text-slate-500 font-sans mt-1">Restrict daily entries from forcing order quantities below zero index.</span>
              </div>
              <div>
                <button
                  onClick={() => setSettings(prev => ({ ...prev, allowNegativeBalanceOverride: !prev.allowNegativeBalanceOverride }))}
                  className={`px-4 py-2 rounded-xl border font-bold transition cursor-pointer text-xs ${settings.allowNegativeBalanceOverride ? "bg-emerald-600/15 border-emerald-500 text-emerald-400" : "bg-[#111827] border-rose-800 text-rose-500"}`}
                >
                  {settings.allowNegativeBalanceOverride ? "ENABLED (bypass allowed)" : "RESTRICTED (lock active)"}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* QC & Inspectors Tab */}
      {activeMenuTab === "qc" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in pr-2">
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-5 rounded-2xl text-xs text-slate-200 space-y-4">
            <h3 className="font-display font-extrabold text-sm text-white uppercase tracking-wider">Quality Control (QC) Floor Inspections</h3>
            <div className="overflow-x-auto">
              <table className="table-auto w-full text-center text-xs">
                <thead className="bg-[#111827] text-slate-400 uppercase font-mono text-[9px] border-b border-slate-800">
                  <tr>
                    <th className="p-2.5 text-left">Date</th>
                    <th className="p-2.5 text-left">Style No</th>
                    <th className="p-2.5 text-left">Panel Inspected</th>
                    <th className="p-2.5 text-right">Inspected</th>
                    <th className="p-2.5 text-right">Passed</th>
                    <th className="p-2.5 text-right text-rose-400">Major Defects</th>
                    <th className="p-2.5 text-left">Action Taken</th>
                    <th className="p-2.5 text-left">Inspector</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850 text-slate-300 font-mono text-[11px]">
                  {qcRecords.map((q) => (
                    <tr key={q.id} className="hover:bg-slate-800/40">
                      <td className="p-2.5 text-left font-sans text-slate-400">{q.date}</td>
                      <td className="p-2.5 text-left text-indigo-300 font-bold">{q.styleNo}</td>
                      <td className="p-2.5 text-left font-sans text-slate-300">{q.panelType}</td>
                      <td className="p-2.5 text-right font-bold">{q.inspectedQty} pcs</td>
                      <td className="p-2.5 text-right text-emerald-400 font-bold">{q.passedQty} pcs</td>
                      <td className="p-2.5 text-right text-rose-400 font-bold">{q.majorDefects}</td>
                      <td className="p-2.5 text-left font-sans text-slate-400">{q.actionTaken}</td>
                      <td className="p-2.5 text-left font-sans font-medium text-slate-400">{q.inspector}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-850 p-5 rounded-2xl h-fit text-xs text-slate-300 space-y-4">
            <h4 className="font-display font-bold text-xs uppercase text-amber-500 tracking-wider">Log Real-Time QC Check</h4>
            <form onSubmit={handleAddQc} className="space-y-4">
              <div>
                <label className="text-[10px] text-slate-500 font-bold uppercase">Stitch Style Code</label>
                <select value={qcStyle} onChange={e => setQcStyle(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-lg p-2.5 font-mono text-white">
                  <option value="STY-HM-221">STY-HM-221</option>
                  <option value="STY-ZRA-092">STY-ZRA-092</option>
                  <option value="STY-C&A-404">STY-C&A-404</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-slate-500 font-bold uppercase">Inspected Qty</label>
                  <input type="number" required value={qcInspected} onChange={e => setQcInspected(Number(e.target.value))} className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-lg p-2 font-mono text-white" />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 font-bold uppercase">Passed Qty</label>
                  <input type="number" required value={qcPassed} onChange={e => setQcPassed(Number(e.target.value))} className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-lg p-2 font-mono text-white" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-slate-500 font-bold uppercase">Minor Defects</label>
                  <input type="number" value={qcMinor} onChange={e => setQcMinor(Number(e.target.value))} className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-lg p-2 font-mono text-white" />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 font-bold uppercase">Major Defects</label>
                  <input type="number" value={qcMajor} onChange={e => setQcMajor(Number(e.target.value))} className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-lg p-2 font-mono text-white" />
                </div>
              </div>
              <div>
                <label className="text-[10px] text-slate-500 font-bold uppercase">Corrective Command / Action Taken</label>
                <input type="text" value={qcAction} onChange={e => setQcAction(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white" />
              </div>

              <button type="submit" className="w-full bg-indigo-650 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded-lg transition tracking-wide cursor-pointer">
                Submit Finished Panel Verdict
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Maintenance & Spare Needles Tab */}
      {activeMenuTab === "maintenance" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in pr-2">
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-5 rounded-2xl text-xs text-slate-200 space-y-4">
            <h3 className="font-display font-extrabold text-sm text-white uppercase tracking-wider">Mechanical Breakdown & Preventive Lubing Tickets</h3>
            <div className="overflow-x-auto">
              <table className="table-auto w-full text-center text-xs">
                <thead className="bg-[#111827] text-slate-400 uppercase font-mono text-[9px] border-b border-slate-800">
                  <tr>
                    <th className="p-2.5 text-left">Date</th>
                    <th className="p-2.5 text-left">Machine No</th>
                    <th className="p-2.5 text-left">Brand</th>
                    <th className="p-2.5 text-left">Breakdown Issue / Diagnosis</th>
                    <th className="p-2.5 text-center">Ticket Status</th>
                    <th className="p-2.5 text-left">Parts Replaced</th>
                    <th className="p-2.5 text-left">Lead Mechanic</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850 text-slate-300 font-mono text-[11px]">
                  {maintRecords.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-800/40">
                      <td className="p-2.5 text-left font-sans text-slate-400">{m.date}</td>
                      <td className="p-2.5 text-left font-sans font-bold text-yellow-405 text-yellow-500">{m.machineNo}</td>
                      <td className="p-2.5 text-left font-sans">{m.brand}</td>
                      <td className="p-2.5 text-left font-sans text-slate-200">{m.issue}</td>
                      <td className="p-2.5 text-center">
                        <span className={`px-1.5 py-0.5 rounded text-[9.5px] font-bold uppercase ${m.repairStatus === "Resolved" ? "bg-emerald-950 text-emerald-400" : "bg-amber-950 text-amber-400"}`}>
                          {m.repairStatus}
                        </span>
                      </td>
                      <td className="p-2.5 text-left font-sans text-indigo-300 font-bold">{m.partsReplaced}</td>
                      <td className="p-2.5 text-left font-sans text-slate-400">{m.techName}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-850 p-5 rounded-2xl h-fit text-xs text-slate-300 space-y-4">
            <h4 className="font-display font-bold text-xs uppercase text-amber-500 tracking-wider">Log Machine Maintenance Roster</h4>
            <form onSubmit={handleAddMaintenance} className="space-y-4">
              <div>
                <label className="text-[10px] text-slate-500 font-bold uppercase">Asset Machine No</label>
                <select value={maintMachine} onChange={e => setMaintMachine(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-lg p-2.5 font-mono text-white font-bold">
                  <option value="OJ-ST-05">OJ-ST-05 (Stoll 12GG)</option>
                  <option value="OJ-ST-06">OJ-ST-06 (Stoll 12GG)</option>
                  <option value="OJ-SM-12">OJ-SM-12 (Shima Seiki)</option>
                  <option value="OJ-SM-13">OJ-SM-13 (Shima Seiki)</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] text-slate-500 font-bold uppercase">Breakdown Diagnosed Issue</label>
                <input type="text" required value={maintIssue} onChange={e => setMaintIssue(e.target.value)} placeholder="e.g. Needle breakage Slot 14" className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-lg p-2 text-white" />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 font-bold uppercase">Needle Parts Replaced Qty (Deducted from Store)</label>
                <input type="number" value={maintNeedles} onChange={e => setMaintNeedles(Number(e.target.value))} className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-lg p-2 font-mono text-white font-black" />
              </div>

              <div className="bg-slate-900 p-3 rounded-lg text-slate-450 border border-slate-850 text-[10px] leading-relaxed">
                * Replaced needles consume directly from item code <strong className="font-mono text-indigo-400">MST-NDL-07</strong> (Stoll-12GG Groz-Beckert Needles) in Store Inventory automatically.
              </div>

              <button type="submit" className="w-full bg-yellow-500 hover:bg-yellow-405 text-slate-950 font-bold py-2 rounded-lg transition tracking-wide cursor-pointer">
                Commit Resolution Ticket
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Factory Assets List */}
      {activeMenuTab === "assets" && (
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-5 text-xs text-slate-200">
          <div className="border-b border-slate-800 pb-3 flex justify-between items-center">
            <div>
              <h3 className="font-display font-black text-sm text-white uppercase tracking-wider flex items-center gap-1.5">
                🏢 Factory Capital Assets (Online Ledger)
              </h3>
              <p className="text-slate-500 mt-0.5 font-sans">Capital equipments index. Revalued continuously with zero branch clutter.</p>
            </div>
            <div className="font-mono text-[10.5px] text-emerald-400 font-bold py-1 px-3 bg-slate-950 rounded border border-slate-850">
              Total Capital Valuation: BDT ৳12,700,000
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 font-sans text-xs">
            {assetRecords.map((a) => (
              <div key={a.id} className="p-4 rounded-xl border border-slate-800 bg-slate-950 hover:border-slate-700 transition space-y-2 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center">
                    <span className="font-mono font-bold text-[9px] text-[#0ea5e9] bg-[#0ea5e9]/10 px-1.5 py-0.5 rounded uppercase">{a.category}</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  </div>
                  <h4 className="font-bold text-slate-200 mt-2 text-[12.5px] leading-tight pr-1">{a.name}</h4>
                  <p className="text-[10px] text-slate-505 font-mono text-slate-500 mt-1">Serial: {a.serialNo}</p>
                </div>

                <div className="pt-2 border-t border-slate-900 flex justify-between items-end">
                  <div>
                    <span className="text-slate-500 block text-[9.5px]">Floor Location</span>
                    <span className="text-slate-300 font-bold text-[10.5px]">{a.floorLocation}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-500 block text-[9.5px]">Direct Value</span>
                    <span className="text-emerald-400 font-mono font-bold text-[11px]">৳{a.valueBdt.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Packing lists & Shipping gatepass */}
      {activeMenuTab === "shipping" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in pr-2">
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-5 rounded-2xl text-xs text-slate-200 space-y-4 font-sans">
            <h3 className="font-display font-extrabold text-sm text-white uppercase tracking-wider">Garments Cargo Packing Lists &amp; Delivery Gate Passes</h3>
            <div className="overflow-x-auto">
              <table className="table-auto w-full text-center text-xs">
                <thead className="bg-[#111827] text-slate-400 uppercase font-mono text-[9px] border-b border-slate-800">
                  <tr>
                    <th className="p-2.5 text-left">Challan No</th>
                    <th className="p-2.5 text-left">Date</th>
                    <th className="p-2.5 text-left">Style No</th>
                    <th className="p-2.5 text-left">Buyer Partner</th>
                    <th className="p-2.5 text-right">Total Box Cartons</th>
                    <th className="p-2.5 text-right">Yield Count</th>
                    <th className="p-2.5 text-right text-indigo-305">Gross Weight</th>
                    <th className="p-2.5 text-center">Export Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850 text-slate-300 font-mono text-[11px]">
                  {packingRecords.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-800/40">
                      <td className="p-2.5 text-left text-emerald-400 font-bold">{p.chalNo}</td>
                      <td className="p-2.5 text-left font-sans text-slate-500">{p.date}</td>
                      <td className="p-2.5 text-left text-indigo-300 font-bold">{p.styleNo}</td>
                      <td className="p-2.5 text-left text-slate-200 font-black">{p.buyer}</td>
                      <td className="p-2.5 text-right font-bold">{p.cartonCount} Boxes</td>
                      <td className="p-2.5 text-right text-white font-extrabold">{p.totalPcs.toLocaleString()} Pcs</td>
                      <td className="p-2.5 text-right text-indigo-300 font-bold">{p.grossWeightKg} Kg</td>
                      <td className="p-2.5 text-center flex justify-center items-center">
                        <span className="bg-emerald-950 border border-emerald-900 text-emerald-400 text-[9px] font-bold px-2 py-0.5 rounded">
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-855 p-5 border-slate-850 rounded-2xl h-fit text-xs text-slate-300 space-y-4 font-sans">
            <h4 className="font-display font-bold text-xs uppercase text-amber-500 tracking-wider">Log Export Packing &amp; Gate Pass</h4>
            <form onSubmit={handleAddPacking} className="space-y-4">
              <div>
                <label className="text-[10px] text-slate-550 mr-2 text-slate-400 font-bold uppercase">Target Style No</label>
                <select value={packStyle} onChange={e => setPackStyle(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-lg p-2 font-mono text-white font-bold">
                  <option value="STY-HM-221">STY-HM-221</option>
                  <option value="STY-ZRA-092">STY-ZRA-092</option>
                  <option value="STY-C&A-404">STY-C&A-404</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase">Buyer Partner</label>
                <input type="text" required value={packBuyer} onChange={e => setPackBuyer(e.target.value)} placeholder="e.g. SPRING" className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-lg p-2 text-white" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase">Carton Count</label>
                  <input type="number" required value={packCartons} onChange={e => setPackCartons(Number(e.target.value))} className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-lg p-2 font-mono text-white" />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase">Pcs per Carton</label>
                  <input type="number" required value={packQtyPerCarton} onChange={e => setPackQtyPerCarton(Number(e.target.value))} className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-lg p-2 font-mono text-white" />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase">Gross Weight (Kg)</label>
                <input type="number" required value={packWeight} onChange={e => setPackWeight(Number(e.target.value))} className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-lg p-2 font-mono text-white" />
              </div>

              <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-lg transition tracking-wide cursor-pointer">
                Issue Gate Pass &amp; Export Challan
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
