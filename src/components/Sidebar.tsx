import React from "react";
import { 
  Building2, 
  Users, 
  Clock, 
  CreditCard, 
  Cpu, 
  Package, 
  ShoppingCart, 
  Coins, 
  ShieldCheck, 
  Sparkles, 
  FileText,
  BookmarkCheck,
  Settings,
  X,
  PlusCircle,
  TrendingUp,
  FileCheck2,
  Lock
} from "lucide-react";

export type TabType = 
  | "owner-dash" 
  | "hr-dash" 
  | "attendance" 
  | "payroll" 
  | "production" 
  | "store" 
  | "purchase" 
  | "finance" 
  | "compliance" 
  | "ai-assistant"
  | "company-setup"
  | "employees-setup"
  | "audit-log"
  | "doc-reader"
  | "evaluations"
  | "accounts-finance";

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  userRole: string;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  isCollapsed: boolean;
  setIsCollapsed: (c: boolean) => void;
}

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  userRole, 
  isOpen, 
  setIsOpen,
  isCollapsed,
  setIsCollapsed
}: SidebarProps) {
  // Role based filtering logic
  const dashboards = [
    { id: "owner-dash", name: "Owner Dashboard", icon: TrendingUp, roles: ["Owner", "Office"] },
    { id: "accounts-finance", name: "Accounts & Finance", icon: Coins, roles: ["Office"] },
    { id: "hr-dash", name: "HR & Leaves", icon: Users, roles: ["Office"] },
    { id: "attendance", name: "Attendance logs", icon: Clock, roles: ["Office"] },
    { id: "payroll", name: "Payroll & Salaries", icon: CreditCard, roles: ["Office"] },
    { id: "production", name: "Production Management", icon: Cpu, roles: ["Office"] },
    { id: "store", name: "Yarn & Store Stock", icon: Package, roles: ["Office"] },
    { id: "purchase", name: "Supplier Purchases", icon: ShoppingCart, roles: ["Office"] },
    { id: "finance", name: "Double Entry Ledger", icon: Coins, roles: ["Office"] },
    { id: "compliance", name: "Compliance & Audits", icon: ShieldCheck, roles: ["Office"] },
    { id: "ai-assistant", name: "AI Insight Advisor", icon: Sparkles, roles: ["Office"] },
  ];

  const adminMenu = [
    { id: "company-setup", name: "Company Master Settings", icon: Building2, roles: ["Office"] },
    { id: "employees-setup", name: "Employee Directory", icon: Users, roles: ["Office"] },
    { id: "doc-reader", name: "AI Document Reader", icon: FileText, roles: ["Office"] },
    { id: "evaluations", name: "Performance Eval", icon: BookmarkCheck, roles: ["Office"] },
    { id: "audit-log", name: "System Audit Logs", icon: Lock, roles: ["Office"] }
  ];

  const allowedDashboards = dashboards.filter(d => d.roles.includes(userRole));
  const allowedAdminMenu = adminMenu.filter(a => a.roles.includes(userRole));

  function handleSelect(id: TabType) {
    setActiveTab(id);
    if (window.innerWidth < 1024) {
      setIsOpen(false);
    }
  }

  return (
    <>
      {/* Background Overlay for Mobile Drawer */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-50 flex flex-col ${isCollapsed ? "lg:w-16 w-60" : "w-64"} bg-[#0b0a1f] text-slate-300 border-r border-[#1a183d] transition-all duration-300 ease-in-out transform
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0 lg:static lg:h-screen
      `}>
        {/* Sidebar Header */}
        <div className={`flex items-center ${isCollapsed ? "justify-center animate-fade-in" : "justify-between"} h-16 px-4 border-b border-[#1a183d] bg-[#05040e]/95 backdrop-blur-xs transition-all duration-300`}>
          <div className="flex items-center space-x-2.5">
            <div className="flex items-shrink-0 items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-600 font-display font-semibold text-white text-md shadow-lg shadow-indigo-600/30">
              O
            </div>
            {!isCollapsed && (
              <div className="animate-fade-in text-left">
                <h1 className="font-display font-semibold text-[11px] tracking-tight text-white uppercase whitespace-nowrap">
                  OTTOMASS <span className="text-emerald-400 font-bold ml-0.5">JACQUARD</span>
                </h1>
                <p className="font-mono text-[8px] tracking-widest text-[#a5b4fc]/70 font-semibold uppercase leading-none mt-0.5">
                  Enterprise ERP
                </p>
              </div>
            )}
          </div>
          {!isCollapsed && (
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 lg:hidden focus:outline-hidden"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* User Info Capsule */}
        <div className={`px-3 py-3 border-b border-[#1a183d] bg-[#05040e]/30 ${isCollapsed ? "flex justify-center" : ""}`}>
          {isCollapsed ? (
            <div 
              className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-950/80 text-[10px] text-[#818cf8] font-bold border border-indigo-800/40 cursor-help animate-fade-in"
              title={userRole === "Owner" ? "Mr. Tariqul Islam (Owner)" : "Office Staff / Manager (Office)"}
            >
              {userRole[0]}
            </div>
          ) : (
            <div className="flex items-center space-x-2.5 p-2 rounded-lg bg-indigo-950/40 border border-[#1a183d] w-full animate-fade-in">
              <div className="flex items-shrink-0 items-center justify-center w-7 h-7 rounded-full bg-indigo-950 text-[10px] text-[#818cf8] font-bold border border-indigo-800/30">
                {userRole[0]}
              </div>
              <div className="overflow-hidden text-left">
                <p className="font-sans font-medium text-[11px] text-slate-100 truncate pr-1 whitespace-nowrap">
                  {userRole === "Owner" ? "Mr. Tariqul Islam" : "Office Staff / Manager"}
                </p>
                <div className="flex items-center space-x-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
                  <p className="font-mono text-[8.5px] font-semibold tracking-wider text-[#a5b4fc] uppercase">
                    {userRole === "Owner" ? "Owner" : "Office"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation links */}
        <nav className="flex-1 px-2 py-4 overflow-y-auto space-y-5 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
          {/* Dashboard menu */}
          <div>
            {isCollapsed ? (
              <div className="h-[1px] bg-slate-850 my-2" />
            ) : (
              <p className="font-mono text-[8.5px] font-semibold text-slate-500 uppercase tracking-widest px-2.5 mb-2 text-left">
                Core Modules
              </p>
            )}
            <ul className="space-y-0.5">
              {dashboards.map((item) => {
                const isAllowed = item.roles.includes(userRole);
                const isActive = activeTab === item.id;
                
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => isAllowed ? handleSelect(item.id as TabType) : null}
                      disabled={!isAllowed}
                      title={item.name}
                      className={`
                        w-full flex items-center ${isCollapsed ? "justify-center p-2.5" : "justify-between px-2.5 py-2.5"} rounded-md text-xs font-medium transition-all group
                        ${isActive 
                          ? "bg-indigo-600 border-l-4 border-indigo-400 text-white font-semibold shadow-md shadow-indigo-600/10" 
                          : isAllowed 
                            ? "text-slate-350 hover:text-white hover:bg-slate-800/40" 
                            : "text-slate-600 cursor-not-allowed opacity-50"
                        }
                      `}
                    >
                      <div className={`flex items-center ${isCollapsed ? "space-x-0" : "space-x-2.5"}`}>
                        <item.icon size={isCollapsed ? 16 : 14} className={isActive ? "text-indigo-200" : "text-slate-400 group-hover:text-slate-250"} />
                        {!isCollapsed && <span className="truncate">{item.name}</span>}
                      </div>
                      {!isCollapsed && !isAllowed && (
                        <Lock size={11} className="text-slate-650" />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Master control panels */}
          <div>
            {isCollapsed ? (
              <div className="h-[1px] bg-slate-850 my-2" />
            ) : (
              <p className="font-mono text-[8.5px] font-semibold text-slate-500 uppercase tracking-widest px-2.5 mb-2 text-left">
                Specialized Panels
              </p>
            )}
            <ul className="space-y-0.5">
              {adminMenu.map((item) => {
                const isAllowed = item.roles.includes(userRole);
                const isActive = activeTab === item.id;
                
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => isAllowed ? handleSelect(item.id as TabType) : null}
                      disabled={!isAllowed}
                      title={item.name}
                      className={`
                        w-full flex items-center ${isCollapsed ? "justify-center p-2.5" : "justify-between px-2.5 py-2.5"} rounded-md text-xs font-medium transition-all group
                        ${isActive 
                          ? "bg-indigo-600 border-l-4 border-indigo-400 text-white font-semibold shadow-md shadow-indigo-600/10" 
                          : isAllowed 
                            ? "text-slate-350 hover:text-white hover:bg-slate-800/40" 
                            : "text-slate-600 cursor-not-allowed opacity-50"
                        }
                      `}
                    >
                      <div className={`flex items-center ${isCollapsed ? "space-x-0" : "space-x-2.5"}`}>
                        <item.icon size={isCollapsed ? 16 : 14} className={isActive ? "text-indigo-200" : "text-slate-400 group-hover:text-slate-250"} />
                        {!isCollapsed && <span className="truncate">{item.name}</span>}
                      </div>
                      {!isCollapsed && !isAllowed && (
                        <Lock size={11} className="text-slate-650" />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>

        {/* Footer info & status */}
        <div className={`p-3.5 bg-slate-950/40 border-t border-[#334155] ${isCollapsed ? "flex justify-center" : ""}`}>
          {isCollapsed ? (
            <span className="w-2 h-2 rounded-full bg-emerald-500 cursor-help animate-pulse" title="System: Dhaka-01 (v1.1.2) - Status Live"></span>
          ) : (
            <div className="text-left">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[10px] font-bold text-slate-300">System Status: Live</span>
              </div>
              <div className="text-[9px] text-slate-500 font-mono">
                Server: Dhaka-01 (v1.1.2)
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
