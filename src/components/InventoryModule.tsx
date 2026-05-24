import React, { useState, useEffect, useMemo } from "react";
import { 
  Plus, Inbox, Send, BookOpen, AlertTriangle, PieChart, RefreshCw, 
  Settings, Check, Compass, Trash2, Edit2, List, ClipboardCheck, ArrowRight, Save
} from "lucide-react";
import { InventoryItem, ChartOfAccount, JournalVoucher, DailyProductionEntry } from "../types";

// Standard Yarn BOM Configuration by Styles
export interface StyleBOM {
  style: string;
  yarnCode: string;
  yarnName: string;
  consumptionGramsPerPc: number; // e.g. 220g per Sweater
  accessories?: { code: string; name: string; qtyPerPc: number }[];
}

export const STYLE_BOMS: StyleBOM[] = [
  { 
    style: "327", 
    yarnCode: "YRN-ACY-32", 
    yarnName: "Acrylic Cashlike 2/32 Yarn", 
    consumptionGramsPerPc: 220,
    accessories: [{ code: "ACC-ZIPP-05", name: "YKK Sweatpart Metal Zipper 6-inch", qtyPerPc: 1 }]
  },
  { 
    style: "HEART", 
    yarnCode: "YRN-COT-40", 
    yarnName: "Mercerized Cotton 2/40 Yarn", 
    consumptionGramsPerPc: 250,
    accessories: []
  },
  { 
    style: "003", 
    yarnCode: "YRN-ACY-32", 
    yarnName: "Acrylic Cashlike 2/32 Yarn", 
    consumptionGramsPerPc: 210,
    accessories: []
  },
  { 
    style: "256P", 
    yarnCode: "YRN-COT-40", 
    yarnName: "Mercerized Cotton 2/40 Yarn", 
    consumptionGramsPerPc: 180,
    accessories: []
  },
  { 
    style: "161", 
    yarnCode: "YRN-ACY-32", 
    yarnName: "Acrylic Cashlike 2/32 Yarn", 
    consumptionGramsPerPc: 280,
    accessories: []
  }
];

export interface StockMovement {
  id: string;
  date: string;
  itemCode: string;
  itemName: string;
  type: "Receive" | "Issue" | "Production Consumption" | "Adjustment";
  quantity: number;
  rate: number;
  totalAmount: number;
  referenceNo: string; // e.g. MRR-002, IS-991, PROD-ENTRY-1
  remarks: string;
}

interface InventoryModuleProps {
  inventory: InventoryItem[];
  setInventory: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
  accounts: ChartOfAccount[];
  setAccounts: React.Dispatch<React.SetStateAction<ChartOfAccount[]>>;
  onAddVoucher: (v: JournalVoucher) => void;
  lang: "EN" | "BN";
}

// Additional Seed Inventory for Spare Parts and Packing Materials
const SEED_EXTRA_ITEMS: InventoryItem[] = [
  {
    id: "inv-005",
    itemCode: "PCK-BOX-01",
    category: "Consumables", // Packing Material Stock
    name: "Standard Sweater Export Box (7-Ply)",
    countOrSpec: "80 x 60 x 50 cm",
    supplierName: "Pragati Packaging Gazipur",
    uom: "Pcs",
    currentQty: 12000,
    allocatedQty: 8000,
    reorderLevel: 3000,
    averageRate: 110,
    lastReceiveDate: "2026-05-14"
  },
  {
    id: "inv-006",
    itemCode: "PCK-PPB-02",
    category: "Consumables", // Packing Material Stock
    name: "Polybag Printed Self-Adhesive with Warn Logo",
    countOrSpec: "Sweater Standard size",
    supplierName: "Karim Plastic Konabari",
    uom: "Pcs",
    currentQty: 45000,
    allocatedQty: 25000,
    reorderLevel: 15000,
    averageRate: 3.5,
    lastReceiveDate: "2026-05-18"
  },
  {
    id: "inv-007",
    itemCode: "MST-OIL-03",
    category: "Spare Parts",
    name: "Shell Tellus S2 Stoll Machine Grade Lubricating Oil",
    countOrSpec: "Viscosity Index 32",
    supplierName: "Euro Machinery Gazipur",
    uom: "Litre",
    currentQty: 480,
    allocatedQty: 30,
    reorderLevel: 100,
    averageRate: 420,
    lastReceiveDate: "2026-05-15"
  }
];

export default function InventoryModule({
  inventory,
  setInventory,
  accounts,
  setAccounts,
  onAddVoucher,
  lang
}: InventoryModuleProps) {
  // Store Menu Tabs (All 12 menus/reports requested)
  // Menus:
  // - "yarn": Yarn Stock
  // - "accessories": Accessories Stock
  // - "packing": Packing Material Stock
  // - "spare": Spare Parts Stock
  // - "receive": Stock Receive
  // - "issue": Stock Issue
  // - "consumption": Production Consumption
  // - "ledger": Stock Ledger
  // - "low": Low Stock Report
  // - "usage": Order-wise Material Usage
  // - "adjustment": Stock Adjustment
  // - "physical": Physical Stock Count
  const [activeTab, setActiveTab] = useState<string>("yarn");

  // Local Search Filter
  const [searchQuery, setSearchQuery] = useState("");

  // Stock Move list state
  const [movements, setMovements] = useState<StockMovement[]>(() => {
    const saved = localStorage.getItem("ottomass_inventory_movements");
    if (saved) return JSON.parse(saved);
    // Seed initial stock receipts matching opening quantities
    return [
      { id: "move-1", date: "2026-05-15", itemCode: "YRN-ACY-32", itemName: "Acrylic Cashlike 2/32 Yarn", type: "Receive", quantity: 14200, rate: 380, totalAmount: 5396000, referenceNo: "MRR-2026-001", remarks: "Opening bulk raw yarn block load" },
      { id: "move-2", date: "2026-05-18", itemCode: "YRN-COT-40", itemName: "Mercerized Cotton 2/40 Yarn", type: "Receive", quantity: 3200, rate: 460, totalAmount: 1472000, referenceNo: "MRR-2026-002", remarks: "Dyed cotton shipment from Narayanganj" },
      { id: "move-3", date: "2026-05-02", itemCode: "ACC-ZIPP-05", itemName: "YKK Sweatpart Metal Zipper 6-inch", type: "Receive", quantity: 28000, rate: 42, totalAmount: 1176000, referenceNo: "MRR-2026-003", remarks: "Zipper bulk delivery" },
      { id: "move-4", date: "2026-05-10", itemCode: "MST-NDL-07", itemName: "Stoll Stoll-12GG Knitting Needles Voigt-02", type: "Receive", quantity: 85, rate: 1250, totalAmount: 106250, referenceNo: "MRR-2026-004", remarks: "Imported needles replenishment" }
    ];
  });

  // Consolidate extra seed inventory items on first load
  useEffect(() => {
    // If we don't have packing material seed inside global list, add it
    const hasPacking = inventory.some(i => i.itemCode.startsWith("PCK-") || i.itemCode.startsWith("MST-OIL"));
    if (!hasPacking) {
      setInventory(prev => {
        // Only append if doesn't exist
        const kept = [...prev];
        SEED_EXTRA_ITEMS.forEach(extra => {
          if (!kept.some(k => k.itemCode === extra.itemCode)) {
            kept.push(extra);
          }
        });
        return kept;
      });
    }
  }, []);

  // Save movements in LocalStorage
  useEffect(() => {
    localStorage.setItem("ottomass_inventory_movements", JSON.stringify(movements));
  }, [movements]);

  // Form states for stock receive
  const [recItemCode, setRecItemCode] = useState("YRN-ACY-32");
  const [recQty, setRecQty] = useState<number>(1000);
  const [recRate, setRecRate] = useState<number>(385);
  const [recRef, setRecRef] = useState("");
  const [recSupplier, setRecSupplier] = useState("");
  const [recRemarks, setRecRemarks] = useState("");

  // Form states for stock issue
  const [issItemCode, setIssItemCode] = useState("YRN-ACY-32");
  const [issQty, setIssQty] = useState<number>(400);
  const [issRef, setIssRef] = useState("");
  const [issRemarks, setIssRemarks] = useState("");

  // Form states for physical stock count
  const [physItemCode, setPhysItemCode] = useState("YRN-ACY-32");
  const [physActualQty, setPhysActualQty] = useState<number>(14000);
  const [physRemarks, setPhysRemarks] = useState("");

  // Form states for stock adjustment
  const [adjItemCode, setAdjItemCode] = useState("YRN-ACY-32");
  const [adjType, setAdjType] = useState<"Increase" | "Decrease">("Decrease");
  const [adjQty, setAdjQty] = useState<number>(50);
  const [adjRemarks, setAdjRemarks] = useState("");

  // Select Item Ledger Code
  const [ledgerItemCode, setLedgerItemCode] = useState("YRN-ACY-32");

  // Get matching category for activeTab filter
  const itemsByTab = useMemo(() => {
    return inventory.filter(item => {
      const matchQuery = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         item.itemCode.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchQuery) return false;

      if (activeTab === "yarn") return item.category === "Yarn";
      if (activeTab === "accessories") return item.category === "Accessories";
      if (activeTab === "packing") return item.category === "Consumables"; // Consolidated as consumables
      if (activeTab === "spare") return item.category === "Spare Parts";
      return true;
    });
  }, [inventory, activeTab, searchQuery]);

  // Handle Inventory Receive Submission
  const handleStockReceiveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (recQty <= 0 || recRate <= 0) {
      alert("Please enter positive quantities and rates.");
      return;
    }

    const matchedItem = inventory.find(i => i.itemCode === recItemCode);
    if (!matchedItem) return;

    // Recalculate average unit rate of item
    // New Total Quantity = Current Quantity + Received Quantity
    // New Value = (Current * Average) + (Received * Receive Price)
    // New Rate = New Value / New Total Quantity
    const newQty = matchedItem.currentQty + recQty;
    const currentVal = matchedItem.currentQty * matchedItem.averageRate;
    const receivedVal = recQty * recRate;
    const newAverageRate = parseFloat(((currentVal + receivedVal) / newQty).toFixed(2));

    // Determine account code to debit based on category
    let assetAccountCode = "1401"; // Yarn Stock
    let assetAccountName = "Inventory - Yarn";
    if (matchedItem.category === "Accessories") {
      assetAccountCode = "1402";
      assetAccountName = "Inventory - Accessories";
    } else if (matchedItem.category === "Spare Parts") {
      assetAccountCode = "1403";
      assetAccountName = "Inventory - Spare Parts";
    } else if (matchedItem.category === "Consumables") {
      assetAccountCode = "1404";
      assetAccountName = "Inventory - Packing Material";
    }

    // General receive voucher
    // Debit: Stock Account
    // Credit: Accounts Payable / Trade Creditors (Code 2001) or Cash (Code 1001)
    const totalCost = recQty * recRate;
    const vNo = `V-MRR-${Date.now().toString().slice(-4)}`;
    const freshV: JournalVoucher = {
      id: `vchr-${Date.now()}`,
      voucherNo: vNo,
      date: new Date().toISOString().substring(0, 10),
      narration: `Stock receipt MRR: ${recRef || "MRR-AUTO"}. Item: [${recItemCode}] ${matchedItem.name}. Qty: ${recQty} ${matchedItem.uom} @ BDT ${recRate}/${matchedItem.uom}`,
      status: "Posted",
      createdBy: "Store Auditor Panel",
      items: [
        { accountCode: assetAccountCode, accountName: assetAccountName, debit: totalCost, credit: 0, narration: "Stock inventory receipt" },
        { accountCode: "1001", accountName: "Cash in Hand", debit: 0, credit: totalCost, narration: "Payment offset for stock delivery" }
      ]
    };

    onAddVoucher(freshV);

    // Update global accounts
    setAccounts(prev => prev.map(a => {
      if (a.code === assetAccountCode) {
        return { ...a, balance: a.balance + totalCost };
      }
      if (a.code === "1001") {
        return { ...a, balance: Math.max(0, a.balance - totalCost) };
      }
      return a;
    }));

    // Update inventory item quantity and rate
    setInventory(prev => prev.map(i => {
      if (i.itemCode === recItemCode) {
        return {
          ...i,
          currentQty: newQty,
          averageRate: newAverageRate,
          lastReceiveDate: new Date().toISOString().substring(0, 10)
        };
      }
      return i;
    }));

    // Log movement entries
    const freshMove: StockMovement = {
      id: `move-${Date.now()}`,
      date: new Date().toISOString().substring(0, 10),
      itemCode: recItemCode,
      itemName: matchedItem.name,
      type: "Receive",
      quantity: recQty,
      rate: recRate,
      totalAmount: totalCost,
      referenceNo: recRef || `MRR-${Date.now().toString().slice(-4)}`,
      remarks: recRemarks || `Received from supplier ${recSupplier || matchedItem.supplierName}`
    };

    setMovements(prev => [freshMove, ...prev]);

    // Clear Form inputs
    setRecQty(1000);
    setRecRef("");
    setRecSupplier("");
    setRecRemarks("");
    alert(`Successfully registered MRR of ${recQty} ${matchedItem.uom} for ${matchedItem.name}. Average rate updated to BDT ${newAverageRate}. Accounts updated.`);
  };

  // Handle Inventory Issues
  const handleStockIssueSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (issQty <= 0) {
      alert("Core issue quantity must be progressive.");
      return;
    }

    const matchedItem = inventory.find(i => i.itemCode === issItemCode);
    if (!matchedItem) return;

    if (matchedItem.currentQty < issQty) {
      alert(`Insufficient stock! Cannot issue ${issQty} when current stock is only ${matchedItem.currentQty}.`);
      return;
    }

    // Determine accounts and calculate valuations
    let assetAccountCode = "1401"; // Yarn Stock
    let assetAccountName = "Inventory - Yarn";
    if (matchedItem.category === "Accessories") {
      assetAccountCode = "1402";
      assetAccountName = "Inventory - Accessories";
    } else if (matchedItem.category === "Spare Parts") {
      assetAccountCode = "1403";
      assetAccountName = "Inventory - Spare Parts";
    } else if (matchedItem.category === "Consumables") {
      assetAccountCode = "1404";
      assetAccountName = "Inventory - Packing Material";
    }

    const issueValuation = issQty * matchedItem.averageRate;

    // Accounts post:
    // Debit: Material Consumption Cost / Technical Maintenance (Code 5001 or 5002)
    // Credit: Inventory Asset (Code 1401/1402/...)
    const vNo = `V-ISS-${Date.now().toString().slice(-4)}`;
    const freshV: JournalVoucher = {
      id: `vchr-${Date.now()}`,
      voucherNo: vNo,
      date: new Date().toISOString().substring(0, 10),
      narration: `Manual inventory issue ref: ${issRef || "ISS-AUTO"}. Item: [${issItemCode}] ${matchedItem.name}. Qty Issued: ${issQty} ${matchedItem.uom}`,
      status: "Posted",
      createdBy: "Store Auditor Panel",
      items: [
        { accountCode: "5001", accountName: "Yarn Consumption Cost", debit: issueValuation, credit: 0, narration: "Manual material issue allocation" },
        { accountCode: assetAccountCode, accountName: assetAccountName, debit: 0, credit: issueValuation, narration: "Inventory asset balance decrease" }
      ]
    };

    onAddVoucher(freshV);

    // Update global accounts
    setAccounts(prev => prev.map(a => {
      if (a.code === assetAccountCode) {
        return { ...a, balance: Math.max(0, a.balance - issueValuation) };
      }
      if (a.code === "5001") {
        return { ...a, balance: a.balance + issueValuation };
      }
      return a;
    }));

    // Update stock levels
    setInventory(prev => prev.map(i => {
      if (i.itemCode === issItemCode) {
        return {
          ...i,
          currentQty: i.currentQty - issQty
        };
      }
      return i;
    }));

    // Log movement entry
    const freshMove: StockMovement = {
      id: `move-${Date.now()}`,
      date: new Date().toISOString().substring(0, 10),
      itemCode: issItemCode,
      itemName: matchedItem.name,
      type: "Issue",
      quantity: issQty,
      rate: matchedItem.averageRate,
      totalAmount: issueValuation,
      referenceNo: issRef || `ISS-${Date.now().toString().slice(-4)}`,
      remarks: issRemarks || "Manual floor issue release."
    };

    setMovements(prev => [freshMove, ...prev]);

    setIssQty(400);
    setIssRef("");
    setIssRemarks("");
    alert(`Inventory issue of ${issQty} units cataloged successfully. Ledger vouchers recorded.`);
  };

  // Physical stock validation and corrections
  const handlePhysicalCountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const matchedItem = inventory.find(i => i.itemCode === physItemCode);
    if (!matchedItem) return;

    const diff = physActualQty - matchedItem.currentQty;
    if (diff === 0) {
      alert("No discrepancies identified. Local state is matching physical records.");
      return;
    }

    const changeType = diff > 0 ? "Increase" : "Decrease";

    // Call adjustment handler directly
    performInventoryAdjustment(physItemCode, changeType, Math.abs(diff), physRemarks || `Physical count discrepancy adjustment of ${diff}`);
    alert(`Physical discrepancy resolved! Adjusted stock by ${diff} ${matchedItem.uom} to match counted value of ${physActualQty}.`);
  };

  // Perform Inventory Adjustments (Increase or Decrease)
  const performInventoryAdjustment = (itemCode: string, type: "Increase" | "Decrease", qty: number, remarks: string) => {
    const matchedItem = inventory.find(i => i.itemCode === itemCode);
    if (!matchedItem) return;

    const rate = matchedItem.averageRate;
    const valAmount = qty * rate;

    // Determine Account codes
    let assetAccountCode = "1401"; // Yarn Stock
    let assetAccountName = "Inventory - Yarn";
    if (matchedItem.category === "Accessories") {
      assetAccountCode = "1402";
      assetAccountName = "Inventory - Accessories";
    } else if (matchedItem.category === "Spare Parts") {
      assetAccountCode = "1403";
      assetAccountName = "Inventory - Spare Parts";
    } else if (matchedItem.category === "Consumables") {
      assetAccountCode = "1404";
      assetAccountName = "Inventory - Packing Material";
    }

    // Accounts voucher
    const vNo = `ADJ-INV-${Date.now().toString().slice(-4)}`;
    const freshV: JournalVoucher = {
      id: `vchr-${Date.now()}`,
      voucherNo: vNo,
      date: new Date().toISOString().substring(0, 10),
      narration: `Stock Adjustment for [${itemCode}] ${remarks}`,
      status: "Posted",
      createdBy: "Store Auditor Panel",
      items: type === "Increase" ? [
        { accountCode: assetAccountCode, accountName: assetAccountName, debit: valAmount, credit: 0, narration: "Stock correction increase" },
        { accountCode: "5001", accountName: "Yarn Consumption Cost", debit: 0, credit: valAmount, narration: "Consumption offset credit" }
      ] : [
        { accountCode: "5001", accountName: "Yarn Consumption Cost", debit: valAmount, credit: 0, narration: "Stock wastage / writeoff cost" },
        { accountCode: assetAccountCode, accountName: assetAccountName, debit: 0, credit: valAmount, narration: "Stock assets written down" }
      ]
    };

    onAddVoucher(freshV);

    // Update global accounts
    setAccounts(prev => prev.map(a => {
      if (a.code === assetAccountCode) {
        return { ...a, balance: type === "Increase" ? a.balance + valAmount : Math.max(0, a.balance - valAmount) };
      }
      if (a.code === "5001") {
        return { ...a, balance: type === "Increase" ? Math.max(0, a.balance - valAmount) : a.balance + valAmount };
      }
      return a;
    }));

    // Update stock levels
    setInventory(prev => prev.map(i => {
      if (i.itemCode === itemCode) {
        return {
          ...i,
          currentQty: type === "Increase" ? i.currentQty + qty : Math.max(0, i.currentQty - qty)
        };
      }
      return i;
    }));

    // Log movement entry
    const freshMove: StockMovement = {
      id: `move-${Date.now()}`,
      date: new Date().toISOString().substring(0, 10),
      itemCode,
      itemName: matchedItem.name,
      type: "Adjustment",
      quantity: type === "Increase" ? qty : -qty,
      rate,
      totalAmount: valAmount,
      referenceNo: vNo,
      remarks
    };

    setMovements(prev => [freshMove, ...prev]);
  };

  const handleQuickAdjustmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (adjQty <= 0) return;
    const item = inventory.find(i => i.itemCode === adjItemCode);
    if (!item) return;

    if (adjType === "Decrease" && item.currentQty < adjQty) {
      alert("Adjustment failed! Not enough stock available for decrease.");
      return;
    }

    performInventoryAdjustment(adjItemCode, adjType, adjQty, adjRemarks || "Quick stock ledger correction.");
    alert("Successfully registered inventory adjustment and posted JV.");
    setAdjQty(50);
    setAdjRemarks("");
  };

  // Helpers for summary items
  const ledgerMovements = useMemo(() => {
    return movements.filter(m => m.itemCode === ledgerItemCode).reverse();
  }, [movements, ledgerItemCode]);

  const orderWiseSummary = useMemo(() => {
    // Collect simulated outputs based on BOM configurations
    const savedEntries = localStorage.getItem("ottomass_production_entries");
    const parsedEntries: DailyProductionEntry[] = savedEntries ? JSON.parse(savedEntries) : [];

    interface Accumulator { [key: string]: { style: string; buyer: string; pcs: number; yarnCode: string; yarnQtyKg: number; yarnCost: number } }
    
    const results = parsedEntries.reduce((acc: Accumulator, curr) => {
      const key = `${curr.style}-${curr.buyer}`;
      const matchingBOM = STYLE_BOMS.find(b => b.style === curr.style);
      const consumedGrams = matchingBOM ? matchingBOM.consumptionGramsPerPc : 220;
      const yarnCode = matchingBOM ? matchingBOM.yarnCode : "YRN-ACY-32";
      const itemRate = inventory.find(i => i.itemCode === yarnCode)?.averageRate || 380;

      const producedPcs = curr.totalProdQty;
      const consumedKg = (producedPcs * consumedGrams) / 1000;
      const costTotal = consumedKg * itemRate;

      if (acc[key]) {
        acc[key].pcs += producedPcs;
        acc[key].yarnQtyKg += consumedKg;
        acc[key].yarnCost += costTotal;
      } else {
        acc[key] = {
          style: curr.style,
          buyer: curr.buyer,
          pcs: producedPcs,
          yarnCode,
          yarnQtyKg: consumedKg,
          yarnCost: costTotal
        };
      }
      return acc;
    }, {});

    return Object.values(results);
  }, [inventory]);

  return (
    <div className="space-y-6 animate-fade-in pr-2 pb-12">
      <div>
        <h2 className="font-display font-bold text-2xl text-slate-800 tracking-tight">
          {lang === "EN" ? "Production Store Inventory Hub" : "উৎপাদন সুতা এবং এক্সেসরিজ স্টোর নিয়ন্ত্রণ সেল"}
        </h2>
        <p className="font-sans text-xs text-slate-500 mt-1">
          {lang === "EN" ? "Manage yarn counts, Stoll knitting accessories, packing material boxes, monitor automatic style-BOM consumptions and ledger balances." : "সুতা, নিটিং প্যারামিটার, প্যাকিং মেটেরিয়াল বিবরণী এবং অটোমেটিক স্টক কনসাম্পশন ট্র্যাক করার মূল সেল।"}
        </p>
      </div>

      {/* 12 tabs/menus requested layout */}
      <div className="flex flex-wrap gap-1.5 p-1 bg-slate-100 border border-slate-200 rounded-xl text-[10.5px] font-bold">
        <button onClick={() => { setActiveTab("yarn"); setSearchQuery(""); }} className={`px-2.5 py-1.5 rounded-lg transition ${activeTab === "yarn" ? "bg-indigo-600 text-white" : "text-slate-600 hover:text-indigo-600"}`}>🧶 Yarn Stock</button>
        <button onClick={() => { setActiveTab("accessories"); setSearchQuery(""); }} className={`px-2.5 py-1.5 rounded-lg transition ${activeTab === "accessories" ? "bg-indigo-600 text-white" : "text-slate-600 hover:text-indigo-600"}`}>📎 Accessories Stock</button>
        <button onClick={() => { setActiveTab("packing"); setSearchQuery(""); }} className={`px-2.5 py-1.5 rounded-lg transition ${activeTab === "packing" ? "bg-indigo-600 text-white" : "text-slate-600 hover:text-indigo-600"}`}>📦 Packing Stock</button>
        <button onClick={() => { setActiveTab("spare"); setSearchQuery(""); }} className={`px-2.5 py-1.5 rounded-lg transition ${activeTab === "spare" ? "bg-indigo-600 text-white" : "text-slate-600 hover:text-indigo-600"}`}>⚙️ Spare Parts</button>
        <button onClick={() => setActiveTab("receive")} className={`px-2.5 py-1.5 rounded-lg transition ${activeTab === "receive" ? "bg-indigo-600 text-white" : "text-slate-600 hover:text-indigo-600"}`}>📥 Stock Receive</button>
        <button onClick={() => setActiveTab("issue")} className={`px-2.5 py-1.5 rounded-lg transition ${activeTab === "issue" ? "bg-indigo-600 text-white" : "text-slate-600 hover:text-indigo-600"}`}>📤 Stock Issue</button>
        <button onClick={() => setActiveTab("consumption")} className={`px-2.5 py-1.5 rounded-lg transition ${activeTab === "consumption" ? "bg-indigo-600 text-white" : "text-slate-600 hover:text-indigo-600"}`}>📉 Production Consumption</button>
        <button onClick={() => setActiveTab("ledger")} className={`px-2.5 py-1.5 rounded-lg transition ${activeTab === "ledger" ? "bg-indigo-600 text-white" : "text-slate-600 hover:text-indigo-600"}`}>📰 Stock Ledger</button>
        <button onClick={() => setActiveTab("low")} className={`px-2.5 py-1.5 rounded-lg transition ${activeTab === "low" ? "bg-indigo-600 text-white" : "text-slate-600 hover:text-indigo-600"}`}>⚠️ Low Stock Report</button>
        <button onClick={() => setActiveTab("usage")} className={`px-2.5 py-1.5 rounded-lg transition ${activeTab === "usage" ? "bg-indigo-600 text-white" : "text-slate-600 hover:text-indigo-600"}`}>📊 Order-wise Material Usage</button>
        <button onClick={() => setActiveTab("adjustment")} className={`px-2.5 py-1.5 rounded-lg transition ${activeTab === "adjustment" ? "bg-indigo-600 text-white" : "text-slate-600 hover:text-indigo-600"}`}>📝 Stock Adjustment</button>
        <button onClick={() => setActiveTab("physical")} className={`px-2.5 py-1.5 rounded-lg transition ${activeTab === "physical" ? "bg-indigo-600 text-white" : "text-slate-600 hover:text-indigo-600"}`}>📋 Physical Count</button>
      </div>

      {/* CORE SCREENS BASED ON SELECTED SUBTABS */}

      {/* 1-4. LISTINGS (YARN, ACCESSORIES, PACKING, SPARE PARTS) */}
      {(activeTab === "yarn" || activeTab === "accessories" || activeTab === "packing" || activeTab === "spare") && (
        <div className="bg-white border border-slate-200 p-5 rounded-2xl flex flex-col space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-display font-bold text-xs uppercase text-slate-400 tracking-wider">
              {lang === "EN" ? `Store Database: ${activeTab.toUpperCase()} Stock` : "স্টোর ডাটাবেস বিবরণী"}
            </h3>
            <input 
              type="text" 
              placeholder="Search store inventory..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-600 focus:outline-hidden font-sans"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs divide-y divide-slate-100 font-sans">
              <thead>
                <tr className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                  <th className="py-2.5">Item Code</th>
                  <th className="py-2.5">Description</th>
                  <th className="py-2.5">Spec / Shade Info</th>
                  <th className="py-2.5">Supplier Partner</th>
                  <th className="py-2.5 text-right">In-Stock Qty</th>
                  <th className="py-2.5 text-right">Allocated Qty</th>
                  <th className="py-2.5 text-right">Unit Rate (BDT)</th>
                  <th className="py-2.5 text-right font-bold text-indigo-700">Total Value</th>
                  <th className="py-2.5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-755">
                {itemsByTab.map((item) => {
                  const isLow = item.currentQty <= item.reorderLevel;
                  const totalVal = item.currentQty * item.averageRate;
                  return (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="py-3 font-mono font-bold text-slate-900">{item.itemCode}</td>
                      <td className="py-3 text-slate-800 font-bold">{item.name}</td>
                      <td className="py-3 font-mono text-[10.5px] text-slate-400">
                        {item.countOrSpec} {item.shadeNo ? `(${item.shadeNo})` : ""}
                      </td>
                      <td className="py-3 text-slate-500">{item.supplierName}</td>
                      <td className="py-3 text-right font-black text-slate-700 font-mono">
                        {item.currentQty.toLocaleString()} {item.uom}
                      </td>
                      <td className="py-3 text-right text-slate-400 font-mono">
                        {item.allocatedQty.toLocaleString()} {item.uom}
                      </td>
                      <td className="py-3 text-right font-mono">৳{item.averageRate}</td>
                      <td className="py-3 text-right font-mono font-bold text-indigo-705">
                        ৳{totalVal.toLocaleString()}
                      </td>
                      <td className="py-3 text-center">
                        {isLow ? (
                          <span className="bg-rose-50 text-rose-600 border border-rose-100 text-[8.5px] font-extrabold px-1.5 py-0.5 rounded-full uppercase">
                            Low Stock
                          </span>
                        ) : (
                          <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 text-[8.5px] font-extrabold px-1.5 py-0.5 rounded-full uppercase">
                            Healthy
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
      )}

      {/* 5. STOCK RECEIVE */}
      {activeTab === "receive" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white border border-slate-200 p-5 rounded-2xl">
            <h3 className="font-display font-bold text-sm text-slate-800 mb-4 flex items-center gap-1.5">
              <Plus className="text-emerald-500" size={16} /> 5. Core Stock Receive Desk (MRR Entry)
            </h3>

            <form onSubmit={handleStockReceiveSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Select Item from Catalog</label>
                <select 
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl"
                  value={recItemCode}
                  onChange={e => setRecItemCode(e.target.value)}
                >
                  {inventory.map(i => (
                    <option key={i.id} value={i.itemCode}>[{i.itemCode}] - {i.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Reference No / Challan No</label>
                <input 
                  type="text" required
                  placeholder="e.g. CHAL-9908"
                  value={recRef}
                  onChange={e => setRecRef(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Receive Quantity</label>
                <input 
                  type="number" required
                  value={recQty}
                  onChange={e => setRecQty(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-mono text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Unit Rate (BDT)</label>
                <input 
                  type="number" required
                  value={recRate}
                  onChange={e => setRecRate(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-mono text-xs font-bold text-emerald-600"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Supplier Partner</label>
                <input 
                  type="text"
                  placeholder="e.g. Euro Machinery Ltd"
                  value={recSupplier}
                  onChange={e => setRecSupplier(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Receive Remarks</label>
                <input 
                  type="text"
                  placeholder="Standard purchase ledger loading"
                  value={recRemarks}
                  onChange={e => setRecRemarks(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs"
                />
              </div>

              <div className="sm:col-span-2 pt-2 border-t border-slate-100 flex justify-end">
                <button type="submit" className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-750 text-white font-bold rounded-xl shadow-xs transition">
                  Confirm Material Receipt (MRR)
                </button>
              </div>
            </form>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl text-slate-200 text-xs flex flex-col justify-between">
            <div className="space-y-3">
              <span className="text-indigo-400 font-bold uppercase font-mono tracking-wider text-[10px]">MRR Accounting Rule</span>
              <p className="leading-relaxed text-slate-350">
                Registering a stock receipt will immediately increment stock quantity levels, automatically recalculate the **Average Rate BDT** of the item to maintain exact inventory valuations, and generate double entries:
              </p>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 font-mono text-[11px] text-slate-300 space-y-1.5">
                <p className="text-emerald-400 font-bold">DEBIT: Inventory - Yarn (Code 1401) / Core Assets</p>
                <p className="text-indigo-300 font-semibold">CREDIT: Cash / Bank Reserves (Code 1001)</p>
              </div>
            </div>
            <div className="bg-slate-950 p-2.5 rounded-lg text-amber-500 font-semibold border-l-2 border-amber-500 text-[11px]">
              This keeps real assets synced with accounting books inside the double entry General Ledger.
            </div>
          </div>
        </div>
      )}

      {/* 6. STOCK ISSUE */}
      {activeTab === "issue" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white border border-slate-200 p-5 rounded-2xl">
            <h3 className="font-display font-bold text-sm text-slate-800 mb-4 flex items-center gap-1.5">
              <Send className="text-indigo-500" size={16} /> 6. Manual Stock Issuance (Floor Delivery)
            </h3>

            <form onSubmit={handleStockIssueSubmit} className="grid grid-cols-1 gap-4 text-xs font-sans">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Select Item to Issue</label>
                  <select 
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-slate-600"
                    value={issItemCode}
                    onChange={e => setIssItemCode(e.target.value)}
                  >
                    {inventory.map(i => (
                      <option key={i.id} value={i.itemCode}>[{i.itemCode}] - {i.name} (Avail: {i.currentQty} {i.uom})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Requisition No / Issue Reference</label>
                  <input 
                    type="text" required
                    placeholder="e.g. REQ-KNIT-12"
                    value={issRef}
                    onChange={e => setIssRef(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Issue Quantity</label>
                  <input 
                    type="number" required
                    value={issQty}
                    onChange={e => setIssQty(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-mono text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Issue Purpose / Remarks</label>
                  <input 
                    type="text"
                    placeholder="Warping floor pattern loading"
                    value={issRemarks}
                    onChange={e => setIssRemarks(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex justify-end">
                <button type="submit" className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-750 text-white font-bold rounded-xl shadow-xs transition">
                  Authorize Manual Issue
                </button>
              </div>
            </form>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl text-slate-200 text-xs flex flex-col justify-between">
            <div className="space-y-3">
              <span className="text-amber-500 font-bold uppercase font-mono tracking-wider text-[10px]">Issue double entry policy</span>
              <p className="leading-relaxed text-slate-350">
                Issuing floor stock manually decreases current quantities inside the store catalog, calculated using the standard **weighted average cost** metric:
              </p>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 font-mono text-[11px] text-slate-300 space-y-1.5">
                <p className="text-emerald-400 font-bold">DEBIT: Yarn Consumption Cost (Code 5001)</p>
                <p className="text-rose-400 font-semibold">CREDIT: Inventory Asset (Code 1401)</p>
              </div>
            </div>
            <div className="bg-slate-950 p-2.5 rounded-lg text-emerald-400 border-l-2 border-emerald-500 text-[11px]">
              This validates COGS matching principles in corporate accounting logs.
            </div>
          </div>
        </div>
      )}

      {/* 7. PRODUCTION CONSUMPTION */}
      {activeTab === "consumption" && (
        <div className="bg-white border border-slate-200 p-5 rounded-2xl flex flex-col space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-display font-bold text-sm text-slate-800">
                7. Automatic Yarn & Accessories Consumption Ledger
              </h3>
              <p className="font-sans text-xs text-slate-400 mt-0.5">
                Punches generated from style Bill of Materials (BOM) when approved production entries are posted.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs divide-y divide-slate-100 font-mono">
              <thead>
                <tr className="text-slate-400 text-[10px] uppercase font-semibold">
                  <th className="py-2">Log Date</th>
                  <th className="py-2">Linked Ref</th>
                  <th className="py-2">Item Code</th>
                  <th className="py-2">Item Name</th>
                  <th className="py-2 text-right">Production (pcs)</th>
                  <th className="py-2 text-right">BOM Unit Qty (g)</th>
                  <th className="py-2 text-right">Total Consumed</th>
                  <th className="py-2 text-right">Avg Rate</th>
                  <th className="py-2 text-right text-emerald-600">Total BDT Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600">
                {movements.filter(m => m.type === "Production Consumption").length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-10 text-center font-sans text-xs text-slate-400">
                      No production consumption entries triggered yet. Post an approved Daily Production grid row to generate logs automatically.
                    </td>
                  </tr>
                ) : (
                  movements.filter(m => m.type === "Production Consumption").map(m => (
                    <tr key={m.id} className="hover:bg-slate-50 font-medium">
                      <td className="py-3 font-sans">{m.date}</td>
                      <td className="py-3 font-mono font-bold text-slate-800">{m.referenceNo}</td>
                      <td className="py-3 font-mono font-bold text-indigo-600">{m.itemCode}</td>
                      <td className="py-3 text-slate-500 font-sans">{m.itemName}</td>
                      <td className="py-3 text-right">{(Math.abs(m.quantity) * 1000 / (STYLE_BOMS.find(x => x.yarnCode === m.itemCode)?.consumptionGramsPerPc || 220)).toLocaleString()} pcs</td>
                      <td className="py-3 text-right">{STYLE_BOMS.find(x => x.yarnCode === m.itemCode)?.consumptionGramsPerPc || 220} g</td>
                      <td className="py-3 text-right text-rose-600 font-bold">{Math.abs(m.quantity).toLocaleString()} Kg</td>
                      <td className="py-3 text-right">৳{m.rate}</td>
                      <td className="py-3 text-right text-emerald-600 font-black">৳{m.totalAmount.toLocaleString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 8. STOCK LEDGER */}
      {activeTab === "ledger" && (
        <div className="bg-white border border-slate-200 p-5 rounded-2xl space-y-4">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
            <div>
              <h3 className="font-display font-bold text-sm text-slate-800">8. Store Stock Item Ledger Cards</h3>
              <p className="font-sans text-xs text-slate-400">Continuous running transaction index for targeted items.</p>
            </div>
            
            <div className="flex items-center space-x-2 text-xs">
              <span className="font-bold text-slate-405 italic">Target Card:</span>
              <select 
                className="bg-slate-50 border border-slate-200 p-2 rounded-xl text-slate-700 font-bold font-mono"
                value={ledgerItemCode}
                onChange={e => setLedgerItemCode(e.target.value)}
              >
                {inventory.map(i => (
                  <option key={i.id} value={i.itemCode}>[{i.itemCode}] - {i.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs divide-y divide-slate-100 font-mono">
              <thead>
                <tr className="text-slate-400 text-[10px] uppercase font-semibold">
                  <th className="py-2.5">Transaction Date</th>
                  <th className="py-2.5">Reference / Voucher</th>
                  <th className="py-2.5 text-center">Movement Type</th>
                  <th className="py-2.5 text-right">Quantity In / Out </th>
                  <th className="py-2.5 text-right">Unit Rate (BDT)</th>
                  <th className="py-2.5 text-right font-bold text-indigo-700">Total BDT Value</th>
                  <th className="py-2.5 text-left pl-6">remarks / ledger entry detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {ledgerMovements.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-450 font-sans text-xs">No transactions currently loaded for this item.</td>
                  </tr>
                ) : (
                  ledgerMovements.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50 select-all">
                      <td className="py-3 pl-1 font-sans text-slate-500">{m.date}</td>
                      <td className="py-3 font-bold text-slate-850">{m.referenceNo}</td>
                      <td className="py-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[8.5px] font-extrabold uppercase ${
                          m.type === "Receive" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" :
                          m.type === "Issue" ? "bg-indigo-50 text-indigo-700 border border-indigo-100" :
                          m.type === "Production Consumption" ? "bg-rose-50 text-rose-700 border border-rose-100" : "bg-slate-55 text-slate-700"
                        }`}>
                          {m.type}
                        </span>
                      </td>
                      <td className={`py-3 text-right font-bold font-mono ${m.quantity > 0 ? "text-emerald-600" : "text-rose-600"}`}>
                        {m.quantity > 0 ? `+${m.quantity.toLocaleString()}` : m.quantity.toLocaleString()}
                      </td>
                      <td className="py-3 text-right">৳{m.rate}</td>
                      <td className="py-3 text-right text-slate-800 font-bold">৳{m.totalAmount.toLocaleString()}</td>
                      <td className="py-3 text-slate-450 font-sans pl-6 italic text-[11px]">{m.remarks}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 9. LOW STOCK REPORT */}
      {activeTab === "low" && (
        <div className="bg-white border border-slate-200 p-5 rounded-2xl space-y-4">
          <div>
            <h3 className="font-display font-bold text-sm text-slate-800 flex items-center gap-1.5">
              <AlertTriangle className="text-rose-550" size={16} /> 9. Inventory Low stock Reorder Alert
            </h3>
            <p className="font-sans text-xs text-slate-400">Action items that have fallen in or below safety stocks.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs divide-y divide-slate-100 font-sans">
              <thead>
                <tr className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                  <th className="py-2.5">Item Code</th>
                  <th className="py-2.5">Category</th>
                  <th className="py-2.5">Item Details</th>
                  <th className="py-2.5 text-right">Current Stock</th>
                  <th className="py-2.5 text-right">Allocated Sets</th>
                  <th className="py-2.5 text-right text-rose-550">Reorder Threshold</th>
                  <th className="py-2.5 text-right">Primary Sourcing Partner</th>
                  <th className="py-2.5 text-center">Deficit Index</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-105 font-medium">
                {inventory.filter(i => i.currentQty <= i.reorderLevel).length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400 text-xs italic">
                      ✓ Splendid! All inventoried items are operating inside healthy stock margins.
                    </td>
                  </tr>
                ) : (
                  inventory.filter(i => i.currentQty <= i.reorderLevel).map((item) => {
                    const dev = item.reorderLevel - item.currentQty;
                    return (
                      <tr key={item.id} className="bg-rose-50/20 hover:bg-rose-50/40">
                        <td className="py-3 font-mono font-bold text-slate-900">{item.itemCode}</td>
                        <td className="py-3">
                          <span className="bg-slate-100 text-slate-600 text-[10px] px-2 py-0.5 rounded-full font-bold">{item.category}</span>
                        </td>
                        <td className="py-3 font-semibold text-slate-805">{item.name}</td>
                        <td className="py-3 text-right text-rose-600 font-black font-mono">{item.currentQty.toLocaleString()} {item.uom}</td>
                        <td className="py-3 text-right text-slate-400 font-mono">{item.allocatedQty.toLocaleString()} {item.uom}</td>
                        <td className="py-3 text-right text-rose-550 font-mono font-bold">{item.reorderLevel.toLocaleString()} {item.uom}</td>
                        <td className="py-3 text-right font-sans text-slate-450">{item.supplierName}</td>
                        <td className="py-3 text-center">
                          <span className="px-1.5 py-0.5 bg-rose-950 text-rose-400 text-[9px] font-black rounded uppercase">
                            Reorder Deficit: {dev.toLocaleString()}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 10. ORDER-WISE MATERIAL USAGE */}
      {activeTab === "usage" && (
        <div className="bg-white border border-slate-200 p-5 rounded-2xl space-y-4">
          <div>
            <h3 className="font-display font-bold text-sm text-slate-800 flex items-center gap-1.5">
              <PieChart className="text-indigo-500" size={16} /> 10. Order-Wise & Style-Wise Aggregate Material Consumption
            </h3>
            <p className="font-sans text-xs text-slate-400">Calculated sum of yarn utilized inside actual approved floor production units.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs divide-y divide-slate-100 font-mono">
              <thead>
                <tr className="text-slate-400 text-[10px] uppercase font-bold tracking-wider text-center">
                  <th className="py-2.5 text-left">Active Style Name</th>
                  <th className="py-2.5 text-left">Buyer / Brand</th>
                  <th className="py-2.5">Yarn Code consumed</th>
                  <th className="py-2.5 text-right">Units Yield Pcs</th>
                  <th className="py-2.5 text-right">Yarn Consumption Qty</th>
                  <th className="py-2.5 text-right font-semibold text-emerald-600">Total BDT Valuation Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-center font-medium">
                {orderWiseSummary.map((row, index) => (
                  <tr key={index} className="hover:bg-slate-50">
                    <td className="py-3 font-bold text-slate-800 text-left font-sans">{row.style}</td>
                    <td className="py-3 text-slate-500 text-left font-sans font-semibold">{row.buyer}</td>
                    <td className="py-3 text-indigo-700 font-bold">[{row.yarnCode}]</td>
                    <td className="py-3 text-right text-slate-900 font-black">{row.pcs.toLocaleString()} Pcs</td>
                    <td className="py-3 text-right text-rose-600 font-black">{row.yarnQtyKg.toLocaleString()} Kg</td>
                    <td className="py-3 text-right text-emerald-600 font-black text-sm">৳{row.yarnCost.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 11. STOCK ADJUSTMENT */}
      {activeTab === "adjustment" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white border border-slate-200 p-5 rounded-2xl space-y-4">
            <h3 className="font-display font-bold text-sm text-slate-800 flex items-center gap-1.5">
              <RefreshCw className="text-indigo-600" size={16} /> 11. Store Stock ledgers Adjustment Panel
            </h3>
            <p className="font-sans text-xs text-slate-400">Post quick adjustments (wastages, count clearances, errors) into the ledger. Updates balances and creates accounting double entry.</p>

            <form onSubmit={handleQuickAdjustmentSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Select Item to Adjust</label>
                <select 
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-mono text-xs"
                  value={adjItemCode}
                  onChange={e => setAdjItemCode(e.target.value)}
                >
                  {inventory.map(i => (
                    <option key={i.id} value={i.itemCode}>[{i.itemCode}] - {i.name} (Avail: {i.currentQty} {i.uom})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Adjustment Action</label>
                <select 
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs font-bold"
                  value={adjType}
                  onChange={e => setAdjType(e.target.value as any)}
                >
                  <option value="Increase">(+) Increase Stock Level</option>
                  <option value="Decrease">(-) Decrease Stock (Writeoff / Loss)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Adjustment Quantity</label>
                <input 
                  type="number" required
                  value={adjQty}
                  onChange={e => setAdjQty(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-mono text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Override Reason / Audit note</label>
                <input 
                  type="text" required
                  placeholder="e.g. Moisture weight scale loss writeoff"
                  value={adjRemarks}
                  onChange={e => setAdjRemarks(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs"
                />
              </div>

              <div className="sm:col-span-2 pt-2 border-t border-slate-100 flex justify-end">
                <button type="submit" className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-750 text-white font-bold rounded-xl shadow-xs transition">
                  Confirm Ledger Adjustment
                </button>
              </div>
            </form>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl text-slate-350 text-xs flex flex-col justify-between">
            <div className="space-y-3">
              <span className="text-amber-500 font-bold uppercase font-mono tracking-wider text-[10px]">Adjustment Journal Policy</span>
              <p className="leading-relaxed">
                Stock adjustment is mapped into the general ledger automatically based on weighted-average costs:
              </p>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 font-mono text-[11px] text-slate-300 space-y-2">
                <p className="text-white font-bold">1. IF INCREASE (+):</p>
                <p className="text-emerald-400 pl-2">Dr Inventory Asset (1401)</p>
                <p className="text-slate-450 pl-2">Cr Yarn Consumption Cost Expense (5001)</p>
                
                <p className="text-white font-bold">2. IF DECREASE (-):</p>
                <p className="text-rose-400 pl-2">Dr Yarn Consumption Cost Expense (5001)</p>
                <p className="text-slate-450 pl-2">Cr Inventory Asset (1401)</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 12. PHYSICAL STOCK COUNT */}
      {activeTab === "physical" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white border border-slate-200 p-5 rounded-2xl">
            <h3 className="font-display font-bold text-sm text-slate-800 mb-4 flex items-center gap-1.5">
              <ClipboardCheck className="text-emerald-600" size={16} /> 12. Physical Inventory Audit count
            </h3>
            <p className="text-xs text-slate-400 mb-4">Input direct physical counts of warehouse racks. System will auto-evaluate discrepancies and correct database stocks matching actual numbers.</p>

            <form onSubmit={handlePhysicalCountSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Select audited Item</label>
                <select 
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-mono text-xs"
                  value={physItemCode}
                  onChange={e => {
                    setPhysItemCode(e.target.value);
                    const item = inventory.find(i => i.itemCode === e.target.value);
                    if (item) setPhysActualQty(item.currentQty);
                  }}
                >
                  {inventory.map(i => (
                    <option key={i.id} value={i.itemCode}>[{i.itemCode}] - {i.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Physical count measured</label>
                <input 
                  type="number" required
                  value={physActualQty}
                  onChange={e => setPhysActualQty(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-mono text-xs font-bold text-indigo-650"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Count notes</label>
                <input 
                  type="text" required
                  placeholder="e.g. Month-end rack counted verify"
                  value={physRemarks}
                  onChange={e => setPhysRemarks(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs"
                />
              </div>

              <div className="sm:col-span-2 pt-2 border-t border-slate-100 flex justify-end">
                <button type="submit" className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-slate-950 font-bold rounded-xl shadow-xs transition">
                  Save Audited Stock Count
                </button>
              </div>
            </form>
          </div>

          <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl text-slate-655 text-xs">
            <h4 className="font-display font-medium text-xs text-slate-800 uppercase tracking-wider mb-2">Live discrepancy audit</h4>
            {(() => {
              const item = inventory.find(i => i.itemCode === physItemCode);
              if (!item) return null;
              const discrepancy = physActualQty - item.currentQty;
              return (
                <div className="space-y-4">
                  <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1.5 font-mono text-xs text-slate-705">
                    <p>Item: <strong>{item.name}</strong></p>
                    <p>DB Registered: <span className="font-bold">{item.currentQty.toLocaleString()} {item.uom}</span></p>
                    <p>Physically Counted: <span className="font-bold text-indigo-705">{physActualQty.toLocaleString()} {item.uom}</span></p>
                    <p>Discrepancy: <span className={`font-black ${discrepancy === 0 ? "text-slate-500" : discrepancy > 0 ? "text-emerald-600" : "text-rose-600"}`}>
                      {discrepancy === 0 ? "None matches" : discrepancy > 0 ? `+${discrepancy.toLocaleString()}` : discrepancy.toLocaleString()}
                    </span></p>
                  </div>
                  {discrepancy !== 0 && (
                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 text-amber-800 text-[10.5px] leading-relaxed font-sans">
                      ⚠️ Audit: This will register an adjustment transaction of **{discrepancy.toLocaleString() || 0} units** to auto-balance physical records against company ledgers.
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
