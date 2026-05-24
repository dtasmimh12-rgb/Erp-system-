import React, { useMemo } from "react";
import { 
  TrendingUp, Cpu, Calendar, Settings, Link, FileSpreadsheet, Activity, AlertCircle, Coins, Clock, Gauge, ArrowRight
} from "lucide-react";
import { 
  ResponsiveContainer, ComposedChart, BarChart, LineChart, AreaChart, Bar, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell 
} from "recharts";
import { DailyProductionEntry, ChartOfAccount } from "../../types";

interface ProductionDashboardProps {
  entries: DailyProductionEntry[];
  accounts: ChartOfAccount[];
  receivedPaymentsSum: number; // calculated sum of all payments received from parties
}

const COLORS = ["#818cf8", "#34d399", "#fb7185", "#f43f5e", "#fb923c", "#a78bfa", "#22d3ee", "#e2e8f0"];

export default function ProductionDashboard({
  entries,
  accounts,
  receivedPaymentsSum
}: ProductionDashboardProps) {
  // Accounts definitions
  const cashBalance = useMemo(() => accounts.find(a => a.code === "1001")?.balance || 0, [accounts]);
  const bankBalance = useMemo(() => accounts.find(a => a.code === "1101")?.balance || 0, [accounts]);
  
  // Total receivable (Code 1201 and 1202)
  const totalDueBill = useMemo(() => {
    const r1 = accounts.find(a => a.code === "1201")?.balance || 0;
    const r2 = accounts.find(a => a.code === "1202")?.balance || 0;
    return r1 + r2;
  }, [accounts]);

  // Calculations for entire dataset
  const dashboardStats = useMemo(() => {
    // Current date values
    const todayStr = "2026-05-23"; // Locked simulation date
    const currentMonthPrefix = "2026-05";

    const approvedAndPosted = entries.filter(e => e.status === "Approved" || e.status === "Posted to Accounts");

    // Total Order Quantity (Sum of unique styles)
    const styleOrders: { [key: string]: number } = {};
    entries.forEach(e => {
      styleOrders[e.style] = e.orderQty;
    });
    const totalOrderQuantity = Object.values(styleOrders).reduce((sum, q) => sum + q, 0);

    // Month knit (Total Production Qty in current month)
    const monthEntries = entries.filter(e => e.date.startsWith(currentMonthPrefix));
    const currentMonthKnit = monthEntries.reduce((sum, e) => sum + e.totalProdQty, 0);

    // Total Production (Sum of approved/posted total production pcs)
    const totalProduction = approvedAndPosted.reduce((sum, e) => sum + e.totalProdQty, 0);

    // Grand Totals inside approved entries
    const sumPrev = approvedAndPosted.reduce((sum, e) => sum + e.prevProdQty, 0);
    const grandApprovedTotal = sumPrev + totalProduction;

    // Completion percentage
    const completionPercentage = totalOrderQuantity > 0 
      ? Math.min((grandApprovedTotal / totalOrderQuantity) * 100, 100) 
      : 0;

    // Total Amount This Month (approved/posted values in the month)
    const approvedMonth = monthEntries.filter(e => e.status === "Approved" || e.status === "Posted to Accounts");
    const totalAmountThisMonth = approvedMonth.reduce((sum, e) => sum + e.productionAmount, 0);

    // Total amount ever
    const totalAmountEver = approvedAndPosted.reduce((sum, e) => sum + e.productionAmount, 0);

    // Balance quantity
    const totalBalanceQty = Math.max(0, totalOrderQuantity - grandApprovedTotal);

    // Due in market = Total Production Amount - received amount
    const dueInMarket = Math.max(0, totalAmountEver - receivedPaymentsSum);

    // Lost minutes and Stop machine counts
    const monthLostMinutes = monthEntries.reduce((sum, e) => sum + e.lostMinute, 0);
    const stopMachineMonth = monthEntries.reduce((sum, e) => sum + e.stopMachine, 0);
    const stopHourMonth = monthEntries.reduce((sum, e) => sum + e.stopHour, 0);

    // Yesterday Production Amount
    const yesterdayDate = "2026-05-22";
    const yesterdayProdAmount = entries
      .filter(e => e.date === yesterdayDate && (e.status === "Approved" || e.status === "Posted to Accounts"))
      .reduce((sum, e) => sum + e.productionAmount, 0);

    return {
      totalOrderQuantity,
      currentMonthKnit,
      totalProduction,
      completionPercentage,
      totalAmountThisMonth,
      totalAmountEver,
      totalBalanceQty,
      dueInMarket,
      monthLostMinutes,
      stopMachineMonth,
      stopHourMonth,
      yesterdayProdAmount
    };
  }, [entries, receivedPaymentsSum]);

  // Graphs Aggregators
  const styleData = useMemo(() => {
    // Current Month knit quantities by style
    const styleMap: { [key: string]: { name: string; qty: number; amt: number } } = {};
    entries.forEach(e => {
      if (!styleMap[e.style]) {
        styleMap[e.style] = { name: e.style, qty: 0, amt: 0 };
      }
      styleMap[e.style].qty += e.totalProdQty;
      styleMap[e.style].amt += e.productionAmount;
    });
    return Object.values(styleMap);
  }, [entries]);

  const dailyTrendData = useMemo(() => {
    // Group production by Date
    const dateMap: { [key: string]: { date: string; qty: number; amt: number; mCUsed: number; lostMin: number } } = {};
    entries.forEach(e => {
      const dt = e.date.substring(5); // simplify MM-DD
      if (!dateMap[e.date]) {
        dateMap[e.date] = { date: dt, qty: 0, amt: 0, mCUsed: 0, lostMin: 0 };
      }
      dateMap[e.date].qty += e.totalProdQty;
      dateMap[e.date].amt += e.productionAmount;
      dateMap[e.date].mCUsed = Math.max(dateMap[e.date].mCUsed, e.totalUsedMachine);
      dateMap[e.date].lostMin += e.lostMinute;
    });
    // Sort chronologically
    return Object.keys(dateMap).sort().map(k => ({
      date: dateMap[k].date,
      Production: dateMap[k].qty,
      Amount: dateMap[k].amt,
      Machines: dateMap[k].mCUsed,
      LostMinutes: dateMap[k].lostMin
    }));
  }, [entries]);

  const monthlyActiveStylesData = useMemo(() => {
    const currentMonthPrefix = "2026-05";
    const activeStylesInMonth = new Set(
      entries
        .filter(e => e.date.startsWith(currentMonthPrefix))
        .map(e => e.style)
    );

    const dataMap: { [styleName: string]: { styleCode: string; orderQty: number; totalProdQty: number } } = {};

    entries.forEach(e => {
      if (activeStylesInMonth.has(e.style)) {
        if (!dataMap[e.style]) {
          dataMap[e.style] = {
            styleCode: e.style,
            orderQty: e.orderQty,
            totalProdQty: 0
          };
        }
        dataMap[e.style].totalProdQty += e.totalProdQty;
        if (e.orderQty > dataMap[e.style].orderQty) {
          dataMap[e.style].orderQty = e.orderQty;
        }
      }
    });

    return Object.values(dataMap);
  }, [entries]);

  return (
    <div className="space-y-6">
      
      {/* 15 Statistics Counters Bento Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        
        {/* Row 1 */}
        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
          <span className="text-[10px] text-slate-500 font-bold uppercase block tracking-wider">Total Order Quantity</span>
          <p className="font-mono text-xl font-black text-indigo-400 mt-1">{dashboardStats.totalOrderQuantity.toLocaleString()} <span className="text-xs uppercase font-sans text-slate-500">pcs</span></p>
          <div className="text-[9px] text-slate-650 font-semibold mt-1">Sum of active buyer contracts</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
          <span className="text-[10px] text-slate-500 font-bold uppercase block tracking-wider">Current Month Knit</span>
          <p className="font-mono text-xl font-black text-indigo-400 mt-1">{dashboardStats.currentMonthKnit.toLocaleString()} <span className="text-xs uppercase font-sans text-slate-500">pcs</span></p>
          <div className="text-[9px] text-slate-650 font-semibold mt-1">May 2026 Knit records</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
          <span className="text-[10px] text-slate-500 font-bold uppercase block tracking-wider">Approved Production</span>
          <p className="font-mono text-xl font-black text-white mt-1">{dashboardStats.totalProduction.toLocaleString()} <span className="text-xs uppercase font-sans text-slate-500">pcs</span></p>
          <div className="text-[9px] text-slate-650 font-semibold mt-1">Fully approved &amp; verified lines</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
          <span className="text-[10px] text-slate-500 font-bold uppercase block tracking-wider">Completion Percentage</span>
          <p className="font-mono text-xl font-black text-emerald-400 mt-1">{dashboardStats.completionPercentage.toFixed(1)}%</p>
          <div className="w-full bg-slate-950 h-1 rounded mt-2.5 overflow-hidden">
            <div className="bg-emerald-400 h-1" style={{ width: `${dashboardStats.completionPercentage}%` }}></div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
          <span className="text-[10px] text-slate-500 font-bold uppercase block tracking-wider">Total Amount This Month</span>
          <p className="font-mono text-lg font-black text-emerald-400 mt-1">BDT {dashboardStats.totalAmountThisMonth.toLocaleString()}</p>
          <div className="text-[9px] text-slate-650 font-semibold mt-1">Knit financial value (May)</div>
        </div>

        {/* Row 2 */}
        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
          <span className="text-[10px] text-slate-500 font-bold uppercase block tracking-wider">Order Balance Qty</span>
          <p className="font-mono text-xl font-black text-amber-500 mt-1">{dashboardStats.totalBalanceQty.toLocaleString()} <span className="text-xs uppercase font-sans text-slate-500">pcs</span></p>
          <div className="text-[9px] text-slate-650 font-semibold mt-1">Remaining to deliver on contract</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
          <span className="text-[10px] text-slate-500 font-bold uppercase block tracking-wider">Due in Market</span>
          <p className="font-mono text-lg font-black text-rose-400 mt-1">BDT {dashboardStats.dueInMarket.toLocaleString()}</p>
          <div className="text-[9px] text-slate-650 font-semibold mt-1">Invoice - total collection balance</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
          <span className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider font-mono">Lost Minutes (Month)</span>
          <p className="font-mono text-xl font-black text-rose-500 mt-1">{dashboardStats.monthLostMinutes} <span className="text-xs uppercase font-sans text-slate-600">min</span></p>
          <div className="text-[9px] text-slate-600 font-semibold mt-1">Line breakdowns total logs</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
          <span className="text-[10px] text-slate-500 font-bold uppercase block tracking-wider">Used Machine Index</span>
          <p className="font-mono text-xl font-black text-indigo-400 mt-1">{Math.ceil(entries.reduce((acc, c) => acc + c.totalUsedMachine, 0) / (entries.length || 1))} <span className="text-xs uppercase font-sans text-slate-500">M/C</span></p>
          <div className="text-[9px] text-slate-650 font-semibold mt-1">Average daily machinery active</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
          <span className="text-[10px] text-slate-500 font-bold uppercase block tracking-wider">Yesterday Production</span>
          <p className="font-mono text-lg font-bold text-slate-200 mt-1">BDT {dashboardStats.yesterdayProdAmount.toLocaleString()}</p>
          <div className="text-[9px] text-slate-650 font-semibold mt-1">Posted on date 22-May</div>
        </div>

        {/* Row 3 - Connected Banking Indicators */}
        <div className="bg-[#111827] border border-indigo-900/30 p-3.5 rounded-xl">
          <span className="text-[10px] text-indigo-400 font-bold uppercase block tracking-wider">Stop Machine Count</span>
          <p className="font-mono text-xl font-black text-rose-400 mt-1">{dashboardStats.stopMachineMonth} <span className="text-xs text-slate-500">units</span></p>
          <div className="text-[9px] text-slate-600 font-semibold mt-1">Knit needle repair list</div>
        </div>

        <div className="bg-[#111827] border border-indigo-900/30 p-3.5 rounded-xl">
          <span className="text-[10px] text-indigo-400 font-bold uppercase block tracking-wider">Stop Hour (Total)</span>
          <p className="font-mono text-xl font-black text-rose-400 mt-1">{dashboardStats.stopHourMonth} <span className="text-xs text-slate-500">hrs</span></p>
          <div className="text-[9px] text-slate-650 font-semibold mt-1">Production downtime</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl hover:border-emerald-500/30 transition">
          <span className="text-[10px] text-emerald-400 font-bold uppercase block tracking-wider">Cash Balance</span>
          <p className="font-mono text-lg font-black text-white mt-1">BDT {cashBalance.toLocaleString()}</p>
          <div className="text-[9px] text-slate-550 font-semibold mt-1">Account Code: 1001 (Cash)</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl hover:border-emerald-500/30 transition">
          <span className="text-[10px] text-emerald-400 font-bold uppercase block tracking-wider">Bank Balance</span>
          <p className="font-mono text-lg font-black text-white mt-1">BDT {bankBalance.toLocaleString()}</p>
          <div className="text-[9px] text-slate-550 font-semibold mt-1">Account Code: 1101 (Bank ACC)</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl hover:border-amber-500/30 transition">
          <span className="text-[10px] text-amber-500 font-bold uppercase block tracking-wider">Total Due Bill</span>
          <p className="font-mono text-lg font-black text-amber-400 mt-1">BDT {totalDueBill.toLocaleString()}</p>
          <div className="text-[9px] text-slate-550 font-semibold mt-1">Acc Code: 1201 / 1202 Accounts Receivable</div>
        </div>

      </div>

      {/* 6 Recharts Charts Panel Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Buyer/Style Production Overview */}
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 text-xs">
          <p className="font-sans font-bold text-[11px] uppercase text-white mb-2 tracking-wide font-mono">1. Buyer/Style Production Overview</p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={styleData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 9 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 9 }} />
                <Tooltip contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #334155" }} />
                <Bar dataKey="qty" fill="#6366f1" name="Piece Quantity" maxBarSize={30}>
                  {styleData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Current Month Knit Quantity by Style */}
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 text-xs">
          <p className="font-sans font-bold text-[11px] uppercase text-white mb-2 tracking-wide font-mono">2. Current Month Knit by Style (Pcs)</p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={styleData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="qty"
                >
                  {styleData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Daily Production Trend Chart */}
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 text-xs">
          <p className="font-sans font-bold text-[11px] uppercase text-white mb-2 tracking-wide font-mono">3. Daily Production Trend Chart (Pcs)</p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyTrendData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 9 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 9 }} />
                <Tooltip contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #334155" }} />
                <defs>
                  <linearGradient id="colorKnit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="Production" stroke="#818cf8" strokeWidth={2.5} fillOpacity={1} fill="url(#colorKnit)" name="Pcs Knit" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Daily Production Amount Chart */}
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 text-xs">
          <p className="font-sans font-bold text-[11px] uppercase text-white mb-2 tracking-wide font-mono">4. Daily Production Amount (BDT)</p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={dailyTrendData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 9 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 9 }} />
                <Tooltip contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #334155" }} />
                <Bar dataKey="Amount" fill="#10b981" name="BDT Valuation" maxBarSize={20} />
                <Line type="monotone" dataKey="Amount" stroke="#34d399" strokeWidth={1.5} dot={true} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 5: Machine Usage Chart */}
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 text-xs">
          <p className="font-sans font-bold text-[11px] uppercase text-white mb-2 tracking-wide font-mono">5. Machine Usage Count Daily Peaks</p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyTrendData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" strokeOpacity={0.4} />
                <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 9 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 9 }} />
                <Tooltip contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #334155" }} />
                <Line type="monotone" dataKey="Machines" stroke="#fb923c" strokeWidth={3} name="Total Machines Active" dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 6: Lost Minutes Chart */}
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 text-xs">
          <p className="font-sans font-bold text-[11px] uppercase text-white mb-2 tracking-wide font-mono">6. Daily Machine Lost Minutes (breakdowns)</p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyTrendData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 9 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 9 }} />
                <Tooltip contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #334155" }} />
                <Bar dataKey="LostMinutes" fill="#f43f5e" name="Minutes Lost" maxBarSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 7: Style total production vs order quantity */}
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 text-xs lg:col-span-2">
          <p className="font-sans font-bold text-[11px] uppercase text-white mb-2 tracking-wide font-mono">7. Daily Production Trend - Style Progress (Total Production VS Order Quantity)</p>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyActiveStylesData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="styleCode" stroke="#64748b" tick={{ fontSize: 9 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 9 }} />
                <Tooltip contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #334155" }} />
                <Legend />
                <Bar dataKey="totalProdQty" fill="#818cf8" name="Total Production Quantity" maxBarSize={40} />
                <Bar dataKey="orderQty" fill="#f43f5e" name="Order Quantity" maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[10px] text-slate-500 mt-2 font-mono">
            * Compares accumulated physical quantities against custom contracted values for styles that recorded active production in May 2026.
          </p>
        </div>

      </div>

    </div>
  );
}
