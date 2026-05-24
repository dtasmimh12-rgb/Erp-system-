import React, { useState, useEffect, useMemo } from "react";
import { 
  Plus, Search, ShoppingBag, DollarSign, Cpu, FileText, ClipboardList, CheckCircle, 
  Settings, Clock, ArrowRight, UserCheck, AlertTriangle, Layers, Send, TrendingUp, Sparkles, Building2, Package
} from "lucide-react";
import { BuyerOrder, ChartOfAccount, JournalVoucher, InventoryItem } from "../types";

interface SourcingModuleProps {
  orders: BuyerOrder[];
  setOrders: React.Dispatch<React.SetStateAction<BuyerOrder[]>>;
  inventory: InventoryItem[];
  setInventory: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
  accounts: ChartOfAccount[];
  setAccounts: React.Dispatch<React.SetStateAction<ChartOfAccount[]>>;
  onAddVoucher: (v: JournalVoucher) => void;
  lang: "EN" | "BN";
  onAddAuditLog: (action: string, target: string, details: string) => void;
}

// Custom interfaces for Sourcing Module
export interface BuyerProfile {
  id: string;
  name: string;
  country: string;
  paymentTerms: string;
  creditLimit: number;
  contactEmail: string;
  status: "Active" | "Blacklisted";
}

export interface CostingSheet {
  id: string;
  styleNo: string;
  yarnWeightGrams: number;
  yarnRatePerKg: number;
  zipperCost: number;
  polybagCost: number;
  cartonCost: number;
  laborKnitting: number;
  laborFinishing: number;
  overheads: number;
  operatingMarginPercent: number;
  fobUsd: number;
  fobBdt: number;
}

export interface PurchaseOrder {
  id: string;
  poNo: string;
  supplierName: string;
  itemCategory: "Yarn" | "Accessories" | "Spare Parts" | "Packing Material";
  itemCode: string;
  itemName: string;
  orderQty: number;
  unitRate: number;
  totalAmountCustom: number;
  orderDate: string;
  deliveryDate: string;
  status: "Draft" | "Approved" | "Accounts Posted" | "Received";
}

// Initial seed data
const SEED_BUYERS: BuyerProfile[] = [
  { id: "b1", name: "H&M Global", country: "Sweden", paymentTerms: "L/C 90 Days", creditLimit: 25000000, contactEmail: "sourcing.se@hm.com", status: "Active" },
  { id: "b2", name: "Zara Tech", country: "Spain", paymentTerms: "Telegraphic Transfer (TT)", creditLimit: 18050000, contactEmail: "sourcing.es@zara.com", status: "Active" },
  { id: "b3", name: "C&A Europe", country: "Germany", paymentTerms: "L/C At Sight", creditLimit: 15000000, contactEmail: "import.de@c-a.com", status: "Active" },
  { id: "b4", name: "UNIQLO JP", country: "Japan", paymentTerms: "L/C 60 Days", creditLimit: 30000000, contactEmail: "tokyo.purchase@uniqlo.co.jp", status: "Active" }
];

const SEED_COSTINGS: CostingSheet[] = [
  { id: "c1", styleNo: "STY-HM-221", yarnWeightGrams: 220, yarnRatePerKg: 380, zipperCost: 42, polybagCost: 3.5, cartonCost: 12, laborKnitting: 60, laborFinishing: 40, overheads: 15, operatingMarginPercent: 20, fobUsd: 3.25, fobBdt: 380 },
  { id: "c2", styleNo: "STY-ZRA-092", yarnWeightGrams: 250, yarnRatePerKg: 460, zipperCost: 0, polybagCost: 3.5, cartonCost: 15, laborKnitting: 45, laborFinishing: 35, overheads: 15, operatingMarginPercent: 18, fobUsd: 2.95, fobBdt: 345 }
];

const SEED_PURCHASES: PurchaseOrder[] = [
  { id: "po-1", poNo: "PO-2026-101", supplierName: "Dhaka Spinners Ltd.", itemCategory: "Yarn", itemCode: "YRN-ACY-32", itemName: "Acrylic Cashlike 2/32 Yarn", orderQty: 5000, unitRate: 375, totalAmountCustom: 1875000, orderDate: "2026-05-10", deliveryDate: "2026-05-25", status: "Approved" },
  { id: "po-2", poNo: "PO-2026-102", supplierName: "YKK Bangladesh Co.", itemCategory: "Accessories", itemCode: "ACC-ZIPP-05", itemName: "YKK Sweatpart Metal Zipper 6-inch", orderQty: 10000, unitRate: 40, totalAmountCustom: 400000, orderDate: "2026-05-12", deliveryDate: "2026-05-28", status: "Draft" }
];

export default function SourcingModule({
  orders,
  setOrders,
  inventory,
  setInventory,
  accounts,
  setAccounts,
  onAddVoucher,
  lang,
  onAddAuditLog
}: SourcingModuleProps) {
  const [activeTab, setActiveTab] = useState<"buyers" | "orders" | "sampling" | "costing" | "purchasing">("buyers");

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");

  // Storage and Live State Management
  const [buyers, setBuyers] = useState<BuyerProfile[]>(() => {
    const saved = localStorage.getItem("ottomass_buyers");
    return saved ? JSON.parse(saved) : SEED_BUYERS;
  });

  const [costings, setCostings] = useState<CostingSheet[]>(() => {
    const saved = localStorage.getItem("ottomass_costings");
    return saved ? JSON.parse(saved) : SEED_COSTINGS;
  });

  const [purchases, setPurchases] = useState<PurchaseOrder[]>(() => {
    const saved = localStorage.getItem("ottomass_purchase_orders");
    return saved ? JSON.parse(saved) : SEED_PURCHASES;
  });

  useEffect(() => {
    localStorage.setItem("ottomass_buyers", JSON.stringify(buyers));
  }, [buyers]);

  useEffect(() => {
    localStorage.setItem("ottomass_costings", JSON.stringify(costings));
  }, [costings]);

  useEffect(() => {
    localStorage.setItem("ottomass_purchase_orders", JSON.stringify(purchases));
  }, [purchases]);

  // Form input states
  // 1. Buyer Profile
  const [buyerName, setBuyerName] = useState("");
  const [buyerCountry, setBuyerCountry] = useState("Bangladesh");
  const [buyerTerms, setBuyerTerms] = useState("L/C 90 Days");
  const [buyerCredit, setBuyerCredit] = useState(10000000);
  const [buyerEmail, setBuyerEmail] = useState("");

  // 2. Merchandising Order Custom Form
  const [ordNo, setOrdNo] = useState("");
  const [ordStyle, setOrdStyle] = useState("");
  const [ordBuyer, setOrdBuyer] = useState("H&M Global");
  const [ordProduct, setOrdProduct] = useState("");
  const [ordGauge, setOrdGauge] = useState("12GG");
  const [ordYarn, setOrdYarn] = useState("");
  const [ordColor, setOrdColor] = useState("");
  const [ordQty, setOrdQty] = useState(5000);
  const [ordFOB, setOrdFOB] = useState(3.5);
  const [ordDelivery, setOrdDelivery] = useState("");

  // 3. Product Costing Form
  const [costStyle, setCostStyle] = useState("STY-HM-221");
  const [costYarnW, setCostYarnW] = useState(250); // grams per pc
  const [costYarnRate, setCostYarnRate] = useState(380);
  const [costZip, setCostZip] = useState(0);
  const [costPoly, setCostPoly] = useState(3.5);
  const [costBox, setCostBox] = useState(10);
  const [costKnitLabor, setCostKnitLabor] = useState(60);
  const [costFinLabor, setCostFinLabor] = useState(40);
  const [costOH, setCostOH] = useState(15);
  const [costMargin, setCostMargin] = useState(20);

  // 4. Purchase PO Form
  const [poSupplier, setPoSupplier] = useState("Dhaka Spinners Ltd.");
  const [poCategory, setPoCategory] = useState<"Yarn" | "Accessories" | "Spare Parts" | "Packing Material">("Yarn");
  const [poItemCode, setPoItemCode] = useState("YRN-ACY-32");
  const [poQty, setPoQty] = useState(1000);
  const [poRate, setPoRate] = useState(380);
  const [poDeliveryDate, setPoDeliveryDate] = useState("");

  // Form Submissions
  const handleAddBuyer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!buyerName) return;

    const newBuyer: BuyerProfile = {
      id: `b-${Date.now()}`,
      name: buyerName,
      country: buyerCountry,
      paymentTerms: buyerTerms,
      creditLimit: buyerCredit,
      contactEmail: buyerEmail || `sourcing@${buyerName.toLowerCase().replace(/\s/g, "")}.com`,
      status: "Active"
    };

    setBuyers([...buyers, newBuyer]);
    onAddAuditLog("CREATE BUYER", "Sourcing CRM", `Added new international buyer profile for ${newBuyer.name} from ${newBuyer.country}`);
    
    // Reset Form
    setBuyerName("");
    setBuyerEmail("");
    setBuyerCredit(10000000);
    alert(`Buyer ${newBuyer.name} created successfully.`);
  };

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ordNo || !ordStyle) return;

    const newOrder: BuyerOrder = {
      id: `ord-${Date.now()}`,
      orderNo: ordNo,
      styleNo: ordStyle,
      buyerName: ordBuyer,
      productType: ordProduct || "Knit Sweater Parts",
      gauge: ordGauge,
      yarnCount: ordYarn || "2/32 Normal Acrylic Yarn",
      colorCode: ordColor || "Solid Standard Dyed",
      sizeRange: "S - XL",
      orderQty: ordQty,
      deliveryDate: ordDelivery || new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split("T")[0],
      samplingStatus: "Sampling Phase",
      status: "Sampling",
      profitabilityRatio: 18,
      fob: ordFOB
    };

    setOrders([newOrder, ...orders]);
    onAddAuditLog("CREATE ORDER", "Merchandising", `Drafted garment style order ${newOrder.orderNo} for ${newOrder.buyerName} - Style: ${newOrder.styleNo}`);
    
    // Reset Form
    setOrdNo("");
    setOrdStyle("");
    alert(`Order ${newOrder.orderNo} cataloged. Initialized sampling phase.`);
  };

  // Dynamic order warning check when registering an style order
  const orderCostingWarn = useMemo(() => {
    if (!ordStyle) return null;
    const match = costings.find(c => c.styleNo.trim().toUpperCase() === ordStyle.trim().toUpperCase());
    if (!match) return null;

    // Direct materials and labor calculated from BOM costing
    const rawYarnCost = (match.yarnWeightGrams * match.yarnRatePerKg) / 1000;
    const totalBOMCostBDT = rawYarnCost + match.zipperCost + match.polybagCost + match.cartonCost + match.laborKnitting + match.laborFinishing;
    const totalBOMCostUSD = parseFloat((totalBOMCostBDT / 118).toFixed(2));

    if (ordFOB < totalBOMCostUSD) {
      return {
        bomCostBDT: totalBOMCostBDT,
        bomCostUSD: totalBOMCostUSD,
        styleNo: match.styleNo
      };
    }
    return null;
  }, [ordStyle, ordFOB, costings]);

  // Cost calculation helpers
  const calculatedCost = useMemo(() => {
    const rawYarnCost = (costYarnW * costYarnRate) / 1000;
    const materialCostTotal = rawYarnCost + costZip + costPoly + costBox;
    const laborCostTotal = costKnitLabor + costFinLabor;
    const directTotal = materialCostTotal + laborCostTotal + costOH;
    const markupFactor = 1 + (costMargin / 100);
    const calculatedBdt = parseFloat((directTotal * markupFactor).toFixed(2));
    const calculatedUsd = parseFloat((calculatedBdt / 118).toFixed(2)); // Standard Conversions @ 118 BDT/USD

    return {
      yarnCost: rawYarnCost,
      materials: materialCostTotal,
      labor: laborCostTotal,
      totalDirect: directTotal,
      fobBdt: calculatedBdt,
      fobUsd: calculatedUsd
    };
  }, [costYarnW, costYarnRate, costZip, costPoly, costBox, costKnitLabor, costFinLabor, costOH, costMargin]);

  const handleSaveCosting = (e: React.FormEvent) => {
    e.preventDefault();
    
    const existing = costings.find(c => c.styleNo === costStyle);
    const newCosting: CostingSheet = {
      id: existing ? existing.id : `c-${Date.now()}`,
      styleNo: costStyle,
      yarnWeightGrams: costYarnW,
      yarnRatePerKg: costYarnRate,
      zipperCost: costZip,
      polybagCost: costPoly,
      cartonCost: costBox,
      laborKnitting: costKnitLabor,
      laborFinishing: costFinLabor,
      overheads: costOH,
      operatingMarginPercent: costMargin,
      fobBdt: calculatedCost.fobBdt,
      fobUsd: calculatedCost.fobUsd
    };

    if (existing) {
      setCostings(costings.map(c => c.styleNo === costStyle ? newCosting : c));
    } else {
      setCostings([newCosting, ...costings]);
    }

    onAddAuditLog("SAVE COSTING", "Merchandising Costing", `Saved unit BOM cost sheet for Style ${costStyle}. FOB Price: ৳${calculatedCost.fobBdt} ($${calculatedCost.fobUsd})`);
    alert(`Price costing for Style ${costStyle} configured and logged securely.`);
  };

  const handleUpdateSampleStatus = (orderId: string, status: "Sampling Phase" | "Sample Approved" | "Rejected & Revamped" | "Approved") => {
    setOrders(orders.map(o => o.id === orderId ? { ...o, samplingStatus: status, status: status === "Approved" || status === "Sample Approved" ? "Knitting" : "Sampling" } : o));
    onAddAuditLog("UPDATE SAMPLE STATUS", "Sampling Board", `Updated prototype pattern status for order ID: ${orderId} to : ${status}`);
  };

  const handleCreatePO = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedItem = inventory.find(i => i.itemCode === poItemCode);
    const itemNameStr = selectedItem ? selectedItem.name : "Raw Material Sourced";
    const totalAmountVal = poQty * poRate;

    const newPO: PurchaseOrder = {
      id: `po-${Date.now()}`,
      poNo: `PO-2026-${String(purchases.length + 101)}`,
      supplierName: poSupplier,
      itemCategory: poCategory,
      itemCode: poItemCode,
      itemName: itemNameStr,
      orderQty: poQty,
      unitRate: poRate,
      totalAmountCustom: totalAmountVal,
      orderDate: new Date().toISOString().split("T")[0],
      deliveryDate: poDeliveryDate || new Date(Date.now() + 15 * 24 * 3600 * 1000).toISOString().split("T")[0],
      status: "Draft"
    };

    setPurchases([newPO, ...purchases]);
    onAddAuditLog("CREATE PURCHASE ORDER", "Sourcing Desk", `Created Purchase Requisition ${newPO.poNo} for ${newPO.orderQty} units of ${newPO.itemName}`);
    
    // Reset Form
    setPoQty(1000);
    setPoDeliveryDate("");
    alert(`Purchase draft Order ${newPO.poNo} registered.`);
  };

  const handleApprovePO = (poId: string) => {
    setPurchases(purchases.map(p => p.id === poId ? { ...p, status: "Approved" } : p));
    onAddAuditLog("APPROVE PURCHASE ORDER", "Sourcing Desk", `Approved and authorized PO: ${poId}`);
  };

  // ERP DOUBLE ENTRY INTEGRATION RULE FOR SUPPLIER PAYABLE
  const handlePostPOToAccounts = (poId: string) => {
    const poObj = purchases.find(p => p.id === poId);
    if (!poObj) return;

    if (poObj.status !== "Approved") {
      alert("PO must be approved by the chief executive before ledger entry booking");
      return;
    }

    // Double entry voucher
    // Debit: Materials Sourced Asset (Yarn 1401, Accessories 1402, Consumables 1404)
    // Credit: Supplier Payable Control liability (Code 2002) - zero bypass!
    let debitAccount = "1401";
    let debitName = "Inventory - Yarn";

    if (poObj.itemCategory === "Accessories") {
      debitAccount = "1402";
      debitName = "Inventory - Accessories";
    } else if (poObj.itemCategory === "Spare Parts") {
      debitAccount = "1403";
      debitName = "Inventory - Spare Parts";
    } else if (poObj.itemCategory === "Packing Material") {
      debitAccount = "1404";
      debitName = "Inventory - Packing Material";
    }

    const valueStr = poObj.totalAmountCustom;
    const voucherNo = `V-PUR-${poObj.poNo}`;

    const purchaseJV: JournalVoucher = {
      id: `vchr-po-${Date.now()}`,
      voucherNo,
      date: new Date().toISOString().split("T")[0],
      narration: `Sourcing raw material purchase PO No: ${poObj.poNo}. Supplier: ${poObj.supplierName}. Sourced: ${poObj.orderQty} items of ${poObj.itemName}.`,
      status: "Posted",
      createdBy: "Tariqul Islam (Sourcing GM)",
      items: [
        { accountCode: debitAccount, accountName: debitName, debit: valueStr, credit: 0, narration: "Stock inventory incoming asset block" },
        { accountCode: "2002", accountName: "Supplier Payable", debit: 0, credit: valueStr, narration: "Supplier accounts payable credit liability" }
      ]
    };

    onAddVoucher(purchaseJV);

    // Update real ledger chart balances
    setAccounts(prevAccounts => prevAccounts.map(acc => {
      if (acc.code === debitAccount) {
        return { ...acc, balance: acc.balance + valueStr };
      }
      if (acc.code === "2002") {
        return { ...acc, balance: acc.balance + valueStr };
      }
      return acc;
    }));

    // Update PO status
    setPurchases(purchases.map(p => p.id === poId ? { ...p, status: "Accounts Posted" } : p));
    onAddAuditLog("POST PURCHASE PO", "Sourcing accounts link", `Booked double entries for PO ${poObj.poNo}. Dr ${debitAccount} / Cr 2002 for BDT ৳${valueStr.toLocaleString()}`);
    alert(`Double Entry Posted successfully! General ledger accounts updated online.`);
  };

  // Filter listings
  const filteredOrders = useMemo(() => {
    return orders.filter(o => 
      o.styleNo.toLowerCase().includes(searchQuery.toLowerCase()) || 
      o.buyerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.orderNo.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [orders, searchQuery]);

  return (
    <div className="space-y-6 animate-fade-in pr-2 pb-12 font-sans">
      
      {/* Module Title */}
      <div>
        <h2 className="font-display font-black text-2xl text-slate-805 tracking-tight flex items-center gap-1.5">
          <ShoppingBag className="text-indigo-600" size={24} /> 
          {lang === "EN" ? "Sourcing & Merchandising Master Suite" : "মার্চেন্ডাইজিং অ্যান্ড সোর্সিং কন্ট্রোল সেন্টার"}
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          {lang === "EN" ? "Supervise global buyers, sample schedules, order costings, and post supplier accounts payable (Cr 2002) double entries without bypass." : "ক্রেতার প্রোফাইল, অর্ডার বুকিং, স্যাম্পল ট্রায়াল, সঠিক নিটিং কস্টিং এবং কাঁচামাল ক্রয়ের সামগ্রিক সমাধান।"}
        </p>
      </div>

      {/* Sourcing Menu Navigation Tabs */}
      <div className="flex flex-wrap gap-1 p-1 bg-slate-100 border border-slate-200 rounded-2xl text-xs font-bold font-sans">
        <button onClick={() => { setActiveTab("buyers"); setSearchQuery(""); }} className={`px-4 py-2 rounded-xl transition ${activeTab === "buyers" ? "bg-indigo-600 text-white" : "text-slate-600 hover:text-indigo-600"}`}>👥 Buyers Directory</button>
        <button onClick={() => { setActiveTab("orders"); setSearchQuery(""); }} className={`px-4 py-2 rounded-xl transition ${activeTab === "orders" ? "bg-indigo-600 text-white" : "text-slate-600 hover:text-indigo-600"}`}>✉️ Merchandising Orders</button>
        <button onClick={() => { setActiveTab("sampling"); setSearchQuery(""); }} className={`px-4 py-2 rounded-xl transition ${activeTab === "sampling" ? "bg-indigo-600 text-white" : "text-slate-600 hover:text-indigo-600"}`}>📐 Sampling & Prototype</button>
        <button onClick={() => { setActiveTab("costing"); setSearchQuery(""); }} className={`px-4 py-2 rounded-xl transition ${activeTab === "costing" ? "bg-indigo-600 text-white" : "text-slate-600 hover:text-indigo-600"}`}>৳ Sweater BOM Costing</button>
        <button onClick={() => { setActiveTab("purchasing"); setSearchQuery(""); }} className={`px-4 py-2 rounded-xl transition ${activeTab === "purchasing" ? "bg-indigo-600 text-white" : "text-slate-600 hover:text-indigo-600"}`}>📥 Supplier Purchases (PO)</button>
      </div>

      {/* ACTIVE TABS SCREEN */}

      {/* Tab 1: Buyers Directory */}
      {activeTab === "buyers" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white border border-slate-200 p-5 rounded-2xl space-y-4">
            <div className="flex justify-between items-center mb-1">
              <h3 className="font-display font-bold text-xs uppercase text-slate-400 tracking-wider">Approved Active Buyers Index</h3>
              <input 
                type="text" placeholder="Search buyers..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-600 font-sans focus:outline-hidden"
              />
            </div>

            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left divide-y divide-slate-100 font-sans">
                <thead>
                  <tr className="text-slate-400 text-[10.5px] uppercase font-bold tracking-wider">
                    <th className="py-2.5">Buyer Corporate Partner</th>
                    <th className="py-2.5">Country</th>
                    <th className="py-2.5">NID Contact Email</th>
                    <th className="py-2.5">Agreement Payment Terms</th>
                    <th className="py-2.5 text-right">Credit Lock Limit</th>
                    <th className="py-2.5 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {buyers.filter(b => b.name.toLowerCase().includes(searchQuery.toLowerCase())).map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50">
                      <td className="py-3 font-bold text-slate-800 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-indigo-505 bg-indigo-500"></span>
                        {b.name}
                      </td>
                      <td className="py-3 text-slate-500">{b.country}</td>
                      <td className="py-3 font-mono text-[10.5px] text-slate-405">{b.contactEmail}</td>
                      <td className="py-3 font-bold text-slate-600 pr-2">{b.paymentTerms}</td>
                      <td className="py-3 text-right font-mono text-slate-800">৳{b.creditLimit.toLocaleString()}</td>
                      <td className="py-3 text-center">
                        <span className="bg-emerald-50 text-emerald-700 text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase">
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-5 rounded-2xl h-fit">
            <h4 className="font-display font-extrabold text-xs uppercase text-slate-400 tracking-wider mb-4 flex items-center gap-1.5">
              <Plus size={14} className="text-indigo-600" /> Sourcing CRM: Onboard New Buyer
            </h4>
            <form onSubmit={handleAddBuyer} className="space-y-4 text-xs font-sans">
              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase">Buyer Sourcing Name</label>
                <input type="text" required value={buyerName} onChange={e => setBuyerName(e.target.value)} placeholder="e.g. Uniqlo JP" className="w-full mt-1 border border-slate-200 rounded-lg p-2.5 bg-slate-50" />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase">Country of Incorporation</label>
                <select value={buyerCountry} onChange={e => setBuyerCountry(e.target.value)} className="w-full mt-1 border border-slate-200 rounded-lg p-2.5 bg-slate-50">
                  <option value="Sweden">Sweden</option>
                  <option value="Spain">Spain</option>
                  <option value="Germany">Germany</option>
                  <option value="Japan">Japan</option>
                  <option value="Bangladesh">Bangladesh</option>
                  <option value="USA">USA</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase">Corporate Contact Email</label>
                <input type="email" value={buyerEmail} onChange={e => setBuyerEmail(e.target.value)} placeholder="purchase@uniqlo.co.jp" className="w-full mt-1 border border-slate-200 rounded-lg p-2.5 bg-slate-50" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase">Payment Terms</label>
                  <input type="text" value={buyerTerms} onChange={e => setBuyerTerms(e.target.value)} className="w-full mt-1 border border-slate-200 rounded-lg p-2 bg-slate-50" />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase">Credit limit (৳)</label>
                  <input type="number" value={buyerCredit} onChange={e => setBuyerCredit(Number(e.target.value))} className="w-full mt-1 border border-slate-200 rounded-lg p-2 bg-slate-50 font-mono" />
                </div>
              </div>

              <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-lg transition shadow-sm cursor-pointer mt-2">
                Authorize Buyer Profile
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Tab 2: Merchandising Orders */}
      {activeTab === "orders" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white border border-slate-200 p-5 rounded-2xl space-y-4">
            <div className="flex justify-between items-center mb-1">
              <h3 className="font-display font-bold text-xs uppercase text-slate-400 tracking-wider">Garments Style Order Bookings</h3>
              <input 
                type="text" placeholder="Search orders..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-600 font-sans focus:outline-hidden"
              />
            </div>

            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left divide-y divide-slate-100 font-sans">
                <thead>
                  <tr className="text-slate-400 text-[10.5px] uppercase font-bold tracking-wider">
                    <th className="py-2.5">Order No</th>
                    <th className="py-2.5">Style No</th>
                    <th className="py-2.5">Buyer Name</th>
                    <th className="py-2.5">Product Category</th>
                    <th className="py-2.5">GG Rate</th>
                    <th className="py-2.5 text-right">Order Qty</th>
                    <th className="py-2.5">Shipment Date</th>
                    <th className="py-2.5 text-center">Execution Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {filteredOrders.map((o) => {
                    const matchingCost = costings.find(c => c.styleNo.trim().toUpperCase() === o.styleNo.trim().toUpperCase());
                    let hasUnderCostWarning = false;
                    let bomCostUsdVal = 0;
                    if (matchingCost) {
                      const yarnCVal = (matchingCost.yarnWeightGrams * matchingCost.yarnRatePerKg) / 1000;
                      const matLaborBDT = yarnCVal + matchingCost.zipperCost + matchingCost.polybagCost + matchingCost.cartonCost + matchingCost.laborKnitting + matchingCost.laborFinishing;
                      bomCostUsdVal = parseFloat((matLaborBDT / 118).toFixed(2));
                      const orderFob = o.fob || matchingCost.fobUsd;
                      if (orderFob < bomCostUsdVal) {
                        hasUnderCostWarning = true;
                      }
                    }

                    return (
                      <tr key={o.id} className="hover:bg-slate-50">
                        <td className="py-3 font-mono font-bold text-indigo-600">{o.orderNo}</td>
                        <td className="py-3 font-extrabold text-slate-800">
                          <div className="flex items-center gap-1.5">
                            <span>{o.styleNo}</span>
                            {hasUnderCostWarning && (
                              <span className="text-amber-500 relative group cursor-pointer" title={`Warning: FOB Price of this Style ($${o.fob || matchingCost?.fobUsd}) is less than total material & labor cost ($${bomCostUsdVal}) calculated from styles BOM!`}>
                                <AlertTriangle size={13} className="inline text-amber-600 animate-pulse" />
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 font-black text-slate-755">{o.buyerName}</td>
                        <td className="py-3 text-slate-500">
                          <div>
                            <span>{o.productType}</span>
                            <span className="block text-[10px] text-emerald-600 font-bold font-mono">FOB: ${o.fob || matchingCost?.fobUsd || 3.50}</span>
                          </div>
                        </td>
                        <td className="py-3 font-mono font-bold uppercase text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-sm w-fit">{o.gauge}</td>
                        <td className="py-3 text-right font-black text-slate-700">{o.orderQty.toLocaleString()} Pcs</td>
                        <td className="py-3 text-slate-400 font-mono">{o.deliveryDate}</td>
                        <td className="py-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                            o.status === "Knitting" ? "bg-indigo-50 text-indigo-700" : "bg-amber-50 text-amber-700"
                          }`}>
                            {o.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
 
          <div className="bg-white border border-slate-200 p-5 rounded-2xl h-fit">
            <h4 className="font-display font-extrabold text-xs uppercase text-slate-400 tracking-wider mb-4 flex items-center gap-1.5">
              <Plus size={14} className="text-indigo-600" /> Merchandising: Register Sweat Order
            </h4>
            <form onSubmit={handleCreateOrder} className="space-y-4 text-xs font-sans">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase">L/C or Order No</label>
                  <input type="text" required value={ordNo} onChange={e => setOrdNo(e.target.value)} placeholder="ORD-2026-805" className="w-full mt-1 border border-slate-200 rounded-lg p-2 bg-slate-50 font-mono font-bold" />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase">Garments Style No</label>
                  <input type="text" required value={ordStyle} onChange={e => setOrdStyle(e.target.value)} placeholder="STY-HM-221" className="w-full mt-1 border border-slate-200 rounded-lg p-2 bg-slate-50 font-mono font-bold text-slate-900" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase">Target Buyer</label>
                  <select value={ordBuyer} onChange={e => setOrdBuyer(e.target.value)} className="w-full mt-1 border border-slate-200 rounded-lg p-2 bg-slate-50 font-bold">
                    {buyers.map(b => (
                      <option key={b.id} value={b.name}>{b.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase">Product type</label>
                  <input type="text" value={ordProduct} onChange={e => setOrdProduct(e.target.value)} placeholder="Full Sleeve Pullover" className="w-full mt-1 border border-slate-200 rounded-lg p-2 bg-slate-50" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase">Machine Gauge</label>
                  <select value={ordGauge} onChange={e => setOrdGauge(e.target.value)} className="w-full mt-1 border border-slate-200 rounded-lg p-2 bg-slate-50">
                    <option value="12GG">12GG (Stoll Sweaters)</option>
                    <option value="7GG">7GG (Shima Medium Knit)</option>
                    <option value="3GG">3GG (Kauo Heng Coarse Knit)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase">Yarn Spec / Count</label>
                  <input type="text" value={ordYarn} onChange={e => setOrdYarn(e.target.value)} placeholder="Acrylic 2/32" className="w-full mt-1 border border-slate-200 rounded-lg p-2 bg-slate-50" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase">FOB Price per Sweater ($ USD)</label>
                  <input type="number" step="0.01" required value={ordFOB} onChange={e => setOrdFOB(Number(e.target.value))} className="w-full mt-1 border border-slate-200 rounded-lg p-2 bg-slate-50 font-mono font-bold text-emerald-600" />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase">Solid Color Code</label>
                  <input type="text" value={ordColor} onChange={e => setOrdColor(e.target.value)} placeholder="Navy Blue melange" className="w-full mt-1 border border-slate-200 rounded-lg p-2 bg-slate-50" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase">Total Order Quantity</label>
                  <input type="number" required value={ordQty} onChange={e => setOrdQty(Number(e.target.value))} className="w-full mt-1 border border-slate-200 rounded-lg p-2 bg-slate-50 font-mono font-black" />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase">Expected Shipment Delivery Date</label>
                  <input type="date" value={ordDelivery} onChange={e => setOrdDelivery(e.target.value)} className="w-full mt-1 border border-slate-200 rounded-lg p-2 bg-slate-50 font-mono text-xs" />
                </div>
              </div>
 
              {orderCostingWarn && (
                <div className="p-3 bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-300 rounded-xl text-[11px] leading-relaxed flex items-start gap-1.5 font-sans">
                  <AlertTriangle size={14} className="text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">⚠️ Style FOB Price Under-Cost Alert</span>
                    The assigned FOB price of <strong>${ordFOB}</strong> for style <strong>{orderCostingWarn.styleNo}</strong> is less than its calculated BOM materials and labor cost of <strong>${orderCostingWarn.bomCostUSD}</strong> (৳{orderCostingWarn.bomCostBDT.toFixed(1)}). Saving this order could result in negative margins!
                  </div>
                </div>
              )}

              <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-lg transition shadow-sm cursor-pointer mt-2">
                Log Approved Style Order
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Tab 3: Sampling Prototype Roster */}
      {activeTab === "sampling" && (
        <div className="bg-white border border-slate-200 p-5 rounded-2xl flex flex-col space-y-4">
          <div className="flex justify-between items-center pb-2">
            <div>
              <h3 className="font-display font-bold text-sm text-slate-800">Sweater Apparel Sample Status Board</h3>
              <p className="text-xs text-slate-400 mt-0.5">Approve pre-bulk computerized stitch pattern trial samples for actual line loading.</p>
            </div>
          </div>

          <div className="overflow-x-auto text-xs font-sans">
            <table className="w-full text-left divide-y divide-slate-100">
              <thead>
                <tr className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                  <th>Style No</th>
                  <th>Order Ref</th>
                  <th>Buyer Party</th>
                  <th>GG Gauge</th>
                  <th>Yarn Spec Needed</th>
                  <th className="text-right">Ordered Panel Qty</th>
                  <th className="text-center">Current Sampling Phase</th>
                  <th className="text-center">Authorize Approvals</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50">
                    <td className="py-3.5 font-extrabold text-slate-800 text-[12.5px]">{o.styleNo}</td>
                    <td className="py-3.5 font-mono">{o.orderNo}</td>
                    <td className="py-3.5 font-black text-slate-755">{o.buyerName}</td>
                    <td className="py-3.5 font-mono text-slate-500 font-semibold">{o.gauge}</td>
                    <td className="py-3.5 text-slate-400">{o.yarnCount}</td>
                    <td className="py-3.5 text-right font-black text-slate-700">{o.orderQty.toLocaleString()} pcs</td>
                    <td className="py-3.5 text-center">
                      <span className={`px-2.5 py-1 rounded-sm text-[9.5px] font-bold ${
                        o.samplingStatus === "Approved" || o.samplingStatus === "Sample Approved" 
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
                          : "bg-amber-50 text-amber-700 border border-amber-100"
                      }`}>
                        {o.samplingStatus || "Sampling Phase"}
                      </span>
                    </td>
                    <td className="py-3.5 text-center flex items-center justify-center gap-2">
                      {o.samplingStatus !== "Approved" && o.samplingStatus !== "Sample Approved" ? (
                        <>
                          <button onClick={() => handleUpdateSampleStatus(o.id, "Sample Approved")} className="px-2 py-1 bg-emerald-50 border border-emerald-200 text-emerald-805 text-[10px] font-bold rounded-sm hover:bg-emerald-100 transition cursor-pointer">
                            Approve prototype
                          </button>
                          <button onClick={() => handleUpdateSampleStatus(o.id, "Rejected & Revamped")} className="px-2 py-1 bg-rose-50 border border-rose-200 text-rose-800 text-[10px] font-bold rounded-sm hover:bg-rose-100 transition cursor-pointer">
                            Reject & Reset
                          </button>
                        </>
                      ) : (
                        <span className="text-[10.5px] text-emerald-600 font-semibold italic flex items-center gap-1">
                          <CheckCircle size={12} /> Pre-bulk approved, Stitch lock Active
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Sweater Costing Sheet */}
      {activeTab === "costing" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white border border-slate-200 p-5 rounded-2xl space-y-4">
            <h3 className="font-display font-medium text-xs text-slate-400 uppercase tracking-widest pb-1">Apparel Styling Costing Logs</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {costings.map((c) => {
                const yarnCost = (c.yarnWeightGrams * c.yarnRatePerKg) / 1000;
                const totalBOMCostBDT = yarnCost + c.zipperCost + c.polybagCost + c.cartonCost + c.laborKnitting + c.laborFinishing;
                const totalBOMCostUSD = parseFloat((totalBOMCostBDT / 118).toFixed(2));
                const isUnderCostedStyle = c.fobUsd < totalBOMCostUSD;

                return (
                  <div key={c.id} className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 font-sans text-xs transition duration-200 ${isUnderCostedStyle ? "border-amber-350 bg-amber-500/5 border-amber-400" : "border-slate-200 bg-slate-50/50"}`}>
                    <div className="flex justify-between items-start border-b border-slate-100 pb-2">
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="bg-slate-200 text-slate-700 font-mono text-[9px] font-extrabold px-1.5 py-0.5 rounded-sm">STYLE CARD</span>
                          {isUnderCostedStyle && (
                            <span className="bg-amber-100 text-amber-805 font-sans text-[9px] font-bold px-1.5 py-0.5 rounded-sm flex items-center gap-0.5 text-amber-800">
                              <AlertTriangle size={10} /> UNDER-COST
                            </span>
                          )}
                        </div>
                        <h4 className="font-mono font-black text-slate-800 text-sm mt-1">{c.styleNo}</h4>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-slate-400">Target FOB Price</p>
                        <p className="font-display font-black text-emerald-600 text-[15px]">$ {c.fobUsd}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center text-[10.5px] border-b border-slate-100 pb-2.5">
                      <div>
                        <span className="text-slate-400 block mb-0.5">Yarn wt</span>
                        <span className="font-bold text-slate-800">{c.yarnWeightGrams}g</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block mb-0.5">Labor piece</span>
                        <span className="font-bold text-slate-800">৳{c.laborKnitting + c.laborFinishing}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block mb-0.5">Markup</span>
                        <span className="font-bold text-indigo-600">{c.operatingMarginPercent}%</span>
                      </div>
                    </div>

                    {isUnderCostedStyle && (
                      <div className="p-2 bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-[10px] rounded-lg">
                        <span className="font-bold block">🚨 BOM Threshold Breach</span>
                        FOB of <strong>${c.fobUsd}</strong> is below direct material & labor cost of <strong>${totalBOMCostUSD}</strong> (৳{totalBOMCostBDT.toFixed(1)}).
                      </div>
                    )}

                    <div className="flex justify-between items-center pt-1">
                      <span className="text-slate-400">Total Unit Cost (BDT)</span>
                      <span className="font-mono font-extrabold text-slate-800 text-sm">৳ {c.fobBdt}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sourcing Costing Engine Calculator */}
          <div className="bg-white border border-slate-200 p-5 rounded-2xl h-fit font-sans text-xs">
            <h4 className="font-display font-extrabold text-xs uppercase text-slate-400 tracking-wider mb-4 flex items-center gap-1">
              <Sparkles size={14} className="text-indigo-605 text-indigo-600" /> Sweater BOM Costing Sheet Engine
            </h4>

            <form onSubmit={handleSaveCosting} className="space-y-4">
              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase">Configure Style No</label>
                <select value={costStyle} onChange={e => setCostStyle(e.target.value)} className="w-full mt-1 border border-slate-200 rounded-lg p-2.5 bg-slate-50 font-mono font-black">
                  <option value="STY-HM-221">STY-HM-221 (H&M Pullover)</option>
                  <option value="STY-ZRA-092">STY-ZRA-092 (Zara Sleeve)</option>
                  <option value="STY-C&A-404">STY-C&A-404 (C&A Cardigan)</option>
                  <option value="STY-UNQ-552">STY-UNQ-552 (UNIQLO Sleeveless)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3 pb-2.5 border-b border-slate-100">
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase">Yarn wt per sweater (g)</label>
                  <input type="number" value={costYarnW} onChange={e => setCostYarnW(Number(e.target.value))} className="w-full mt-1 border border-slate-200 rounded-lg p-2 bg-slate-50 font-mono font-bold" />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase">Average Yarn Rate (৳/Kg)</label>
                  <input type="number" value={costYarnRate} onChange={e => setCostYarnRate(Number(e.target.value))} className="w-full mt-1 border border-slate-200 rounded-lg p-2 bg-slate-50 font-mono font-bold text-indigo-600" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[9.5px] text-slate-400 font-bold uppercase">Zipper (৳)</label>
                  <input type="number" value={costZip} onChange={e => setCostZip(Number(e.target.value))} className="w-full mt-1 border border-slate-200 rounded-lg p-2 bg-slate-50 font-mono" />
                </div>
                <div>
                  <label className="text-[9.5px] text-slate-400 font-bold uppercase">Polybag (৳)</label>
                  <input type="number" step="0.1" value={costPoly} onChange={e => setCostPoly(Number(e.target.value))} className="w-full mt-1 border border-slate-200 rounded-lg p-2 bg-slate-50 font-mono" />
                </div>
                <div>
                  <label className="text-[9.5px] text-slate-400 font-bold uppercase">Carton Box (৳)</label>
                  <input type="number" value={costBox} onChange={e => setCostBox(Number(e.target.value))} className="w-full mt-1 border border-slate-200 rounded-lg p-2 bg-slate-50 font-mono" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pb-2.5 border-b border-slate-100">
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase">Knitting rate (৳/pc)</label>
                  <input type="number" value={costKnitLabor} onChange={e => setCostKnitLabor(Number(e.target.value))} className="w-full mt-1 border border-slate-200 rounded-lg p-2 bg-slate-50 font-mono" />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase">Finishing (Washing/Iron)</label>
                  <input type="number" value={costFinLabor} onChange={e => setCostFinLabor(Number(e.target.value))} className="w-full mt-1 border border-slate-200 rounded-lg p-2 bg-slate-50 font-mono" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase">Floor Overheads (৳)</label>
                  <input type="number" value={costOH} onChange={e => setCostOH(Number(e.target.value))} className="w-full mt-1 border border-slate-200 rounded-lg p-2 bg-slate-50 font-mono" />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase">Markup Margin (%)</label>
                  <input type="number" value={costMargin} onChange={e => setCostMargin(Number(e.target.value))} className="w-full mt-1 border border-slate-200 rounded-lg p-2 bg-slate-50 font-mono text-emerald-600 font-bold" />
                </div>
              </div>

              {/* Costing calculation panel real-time */}
              <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl text-slate-200 font-sans text-xs space-y-2">
                <div className="flex justify-between font-mono">
                  <span>Yarn Raw Cost:</span>
                  <span className="text-white">৳ {calculatedCost.yarnCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-mono">
                  <span>Accessories + Labor:</span>
                  <span className="text-white">৳ {(calculatedCost.materials - calculatedCost.yarnCost + calculatedCost.labor).toFixed(1)}</span>
                </div>
                <div className="flex justify-between font-mono border-t border-slate-800 pt-2 text-[#0ea5e9] font-black">
                  <span>Calculated FOB (BDT):</span>
                  <span>৳ {calculatedCost.fobBdt}</span>
                </div>
                <div className="flex justify-between font-mono text-emerald-400 font-black">
                  <span>Calculated FOB (USD):</span>
                  <span>$ {calculatedCost.fobUsd}</span>
                </div>

                {calculatedCost.fobUsd < parseFloat(((calculatedCost.materials + calculatedCost.labor) / 118).toFixed(2)) && (
                  <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-lg text-[10.5px] flex items-start gap-1 mt-1 leading-normal">
                    <AlertTriangle size={13} className="text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-amber-300 block">⚠️ BOM Cost Deficit</span>
                      Calculated FOB <strong>${calculatedCost.fobUsd}</strong> is below direct material + labor cost <strong>${((calculatedCost.materials + calculatedCost.labor) / 118).toFixed(2)}</strong> (৳{(calculatedCost.materials + calculatedCost.labor).toFixed(1)}).
                    </div>
                  </div>
                )}
              </div>

              <button type="submit" className="w-full bg-slate-950 border border-slate-850 hover:bg-slate-900 hover:text-white font-bold py-2.5 rounded-lg transition shadow-sm cursor-pointer">
                Commit &amp; Save BOM Costing Sheet
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Tab 5: Supplier Purchase PO Desk */}
      {activeTab === "purchasing" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in pr-2">
          
          <div className="lg:col-span-2 bg-white border border-slate-200 p-5 rounded-2xl space-y-4 font-sans text-xs">
            <h3 className="font-display font-medium text-xs text-slate-400 uppercase tracking-wider mb-2">Sourced Raw Materials Purchase Orders</h3>

            <div className="space-y-3">
              {purchases.map((p) => {
                const isApproved = p.status === "Approved";
                const isPostedObj = p.status === "Accounts Posted";
                return (
                  <div key={p.id} className="p-4 rounded-xl border border-slate-200 bg-slate-5/50 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="space-y-1 overflow-hidden">
                      <div className="flex items-center space-x-2.5">
                        <span className="font-mono font-bold text-xs text-indigo-700">{p.poNo}</span>
                        <span className="bg-slate-200 text-slate-600 font-mono text-[9px] px-2 py-0.5 rounded-full font-bold uppercase">{p.itemCategory}</span>
                      </div>
                      <h4 className="font-bold text-slate-800 truncate">[{p.itemCode}] - {p.itemName}</h4>
                      <p className="text-[10px] text-slate-400 font-bold">Supplier: {p.supplierName} • Order Date: {p.orderDate}</p>
                      <p className="text-[11px] text-slate-600">Qty: <span className="font-bold">{p.orderQty.toLocaleString()}</span> units @ BDT {p.unitRate} per unit</p>
                    </div>

                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <p className="text-emerald-600 font-mono font-bold tracking-tight text-[13.5px]">৳ {p.totalAmountCustom.toLocaleString()}</p>
                      
                      <div className="flex items-center gap-1.5 mt-1.5 font-sans">
                        {p.status === "Draft" && (
                          <button onClick={() => handleApprovePO(p.id)} className="px-2 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 text-[10.5px] font-bold rounded cursor-pointer">
                            Approve PO
                          </button>
                        )}
                        {isApproved && (
                          <button onClick={() => handlePostPOToAccounts(p.id)} className="px-2.5 py-1.5 bg-indigo-650 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold rounded cursor-pointer shadow-xs flex items-center gap-1">
                            <Send size={11} /> Post to Accounts (Cr 2002)
                          </button>
                        )}
                        {isPostedObj && (
                          <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] font-bold px-2 py-1 rounded">
                            Posted to ledger
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-5 rounded-2xl h-fit font-sans text-xs">
            <h4 className="font-display font-extrabold text-xs uppercase text-slate-400 tracking-wider mb-4 flex items-center gap-1">
              <Plus size={14} className="text-indigo-600" /> Sourcing PO: Create Material Requisition
            </h4>

            <form onSubmit={handleCreatePO} className="space-y-4">
              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase">Vendor / Supplier</label>
                <select value={poSupplier} onChange={e => setPoSupplier(e.target.value)} className="w-full mt-1 border border-slate-200 rounded-lg p-2.5 bg-slate-50 font-bold text-slate-800">
                  <option value="Dhaka Spinners Ltd.">Dhaka Spinners Ltd.</option>
                  <option value="Narayanganj Dyed Yarn Co.">Narayanganj Dyed Yarn Co.</option>
                  <option value="YKK Bangladesh Co.">YKK Bangladesh Co.</option>
                  <option value="Euro Machinery Gazipur">Euro Machinery Gazipur</option>
                  <option value="Pragati Packaging Gazipur">Pragati Packaging Gazipur</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase">Item Category</label>
                  <select value={poCategory} onChange={e => {
                    const val = e.target.value as any;
                    setPoCategory(val);
                    if (val === "Yarn") setPoItemCode("YRN-ACY-32");
                    else if (val === "Accessories") setPoItemCode("ACC-ZIPP-05");
                    else setPoItemCode("MST-NDL-07");
                  }} className="w-full mt-1 border border-slate-200 rounded-lg p-2 bg-slate-50">
                    <option value="Yarn">Yarn stock</option>
                    <option value="Accessories">Accessories</option>
                    <option value="Spare Parts">Spare needles</option>
                    <option value="Packing Material">Boxes / Carton</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase">Item Model Code</label>
                  <select value={poItemCode} onChange={e => setPoItemCode(e.target.value)} className="w-full mt-1 border border-slate-200 rounded-lg p-2 bg-slate-50 font-mono font-bold">
                    {poCategory === "Yarn" ? (
                      <>
                        <option value="YRN-ACY-32">YRN-ACY-32</option>
                        <option value="YRN-COT-40">YRN-COT-40</option>
                      </>
                    ) : poCategory === "Accessories" ? (
                      <option value="ACC-ZIPP-05">ACC-ZIPP-05 (Zipper)</option>
                    ) : poCategory === "Packing Material" ? (
                      <>
                        <option value="PCK-BOX-01">PCK-BOX-01 (Carton)</option>
                        <option value="PCK-PPB-02">PCK-PPB-02 (Poly)</option>
                      </>
                    ) : (
                      <>
                        <option value="MST-NDL-07">MST-NDL-07 (Needles)</option>
                        <option value="MST-OIL-03">MST-OIL-03 (Oil)</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase">Order Volume Qty</label>
                  <input type="number" required value={poQty} onChange={e => setPoQty(Number(e.target.value))} className="w-full mt-1 border border-slate-200 rounded-lg p-2 bg-slate-50 font-mono font-bold" />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase">Target Rate (৳)</label>
                  <input type="number" required value={poRate} onChange={e => setPoRate(Number(e.target.value))} className="w-full mt-1 border border-slate-200 rounded-lg p-2 bg-slate-50 font-mono font-bold text-emerald-600" />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase">Expected Shipment Arrival Date</label>
                <input type="date" value={poDeliveryDate} onChange={e => setPoDeliveryDate(e.target.value)} className="w-full mt-1 border border-slate-200 rounded-lg p-2 bg-slate-50 font-mono text-xs" />
              </div>

              <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl text-slate-300 space-y-2 leading-relaxed font-mono text-[10.5px]">
                <span className="text-indigo-400 font-bold uppercase text-[9.5px]">Payable Booking Rules:</span>
                <p>
                  Approving and posting a vendor purchase order maps a liability under supplier trade payable account (offsetting debit to corresponding material asset stock codes):
                </p>
                <p className="text-emerald-400">DEBIT: Stock Material Inventory Acc (1401 to 1404)</p>
                <p className="text-yellow-400">CREDIT: Supplier Payables Control Acc (Code 2002)</p>
              </div>

              <button type="submit" className="w-full bg-indigo-650 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-lg transition shadow-sm cursor-pointer">
                Issue Purchase Order Requisition
              </button>
            </form>
          </div>

        </div>
      )}

    </div>
  );
}
