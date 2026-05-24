import React, { useState } from "react";
import { Search, Bell, Globe, ArrowLeftRight, Check, AlertCircle, Sun, Moon } from "lucide-react";

interface HeaderProps {
  userRole: string;
  setUserRole: (role: string) => void;
  lang: "EN" | "BN";
  setLang: (lang: "EN" | "BN") => void;
  onSearch: (term: string) => void;
  toggleSidebar: () => void;
  onLogout: () => void;
  theme: "light" | "dark";
  setTheme: (theme: "light" | "dark") => void;
  isCollapsed: boolean;
  setIsCollapsed: (c: boolean) => void;
}

export default function Header({ 
  userRole, 
  setUserRole, 
  lang, 
  setLang, 
  onSearch, 
  toggleSidebar,
  onLogout,
  theme,
  setTheme,
  isCollapsed,
  setIsCollapsed
}: HeaderProps) {
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const roles = [
    { value: "Office", label: "Office Staff / Manager", desc: "Manage & Edit All Core Modules" },
    { value: "Owner", label: "Executive Owner (Tariqul)", desc: "View Overview Only" }
  ];

  const notifications = [
    { id: 1, text: lang === "EN" ? "Yarn Stock ALERT: Mercerized Cotton 2/40 below target!" : "সুতা স্টক সতর্কতা: মার্সারাইজড কটন ২/৪০ লক্ষ্যমাত্রার নিচে!", type: "alert" },
    { id: 2, text: lang === "EN" ? "New Leave Application: Abdul Karim (Casual Leave)" : "নতুন ছুটির আবেদন: আব্দুল করিম (নৈমিত্তিক ছুটি)", type: "info" },
    { id: 3, text: lang === "EN" ? "Knitting record checked and approved for OJ-ST-05 machine" : "OJ-ST-05 মেশিনের জন্য বুনন রেকর্ড পরীক্ষা করা হয়েছে এবং অনুমোদিত হয়েছে", type: "success" }
  ];

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSearchTerm(e.target.value);
    onSearch(e.target.value);
  }

  return (
    <header className="sticky top-0 bg-white/90 dark:bg-[#05040e]/95 backdrop-blur-md border-b border-[#f1f3f9] dark:border-[#1a183d] h-16 flex items-center justify-between px-6 z-30 shrink-0 shadow-xs transition-all duration-200">
      
      {/* Search Input Left */}
      <div className="flex items-center space-x-3 flex-1 max-w-sm sm:max-w-md">
        <button 
          onClick={toggleSidebar}
          className="p-1.5 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900/55 lg:hidden focus:outline-hidden"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Collapsible Sidebar Button for Desktop */}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex p-1.5 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900/55 focus:outline-none"
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          <svg className={`w-5 h-5 transition-transform duration-200 ${isCollapsed ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7M20 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="relative w-full">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400 dark:text-[#8c88c7]" />
          <input
            type="text"
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-[#161434] rounded-full pl-9 pr-4 py-1.5 text-xs text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-hidden focus:border-indigo-500 dark:focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-950 transition-all font-sans"
            placeholder={lang === "EN" ? "Search records, orders, items..." : "রেকর্ড, অর্ডার বা আইটেম খুঁজুন..."}
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
      </div>

      {/* Actions and switches Right */}
      <div className="flex items-center space-x-2.5 sm:space-x-3">
        
        {/* Light/Dark Toggle */}
        <button
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          className="p-1.5 sm:p-2 text-slate-500 hover:text-slate-800 dark:text-[#a5b4fc] dark:hover:text-[#34d399] rounded-full bg-slate-50 dark:bg-[#100e26] border border-slate-200 dark:border-[#161434] hover:bg-slate-100 dark:hover:bg-[#161434] transition-all shadow-xs duration-200"
          title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
        >
          {theme === "light" ? <Moon size={15} /> : <Sun size={15} className="text-amber-400" />}
        </button>

        {/* Language Switch */}
        <button 
          onClick={() => setLang(lang === "EN" ? "BN" : "EN")}
          className="flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-slate-50 dark:bg-[#100e26] border border-slate-200 dark:border-[#161434] text-[10px] font-bold text-slate-600 dark:text-[#a5b4fc] hover:bg-slate-100 dark:hover:bg-[#161434] transition-all duration-200 shadow-xs"
          title={lang === "EN" ? "Switch to Bangla" : "ইংরেজিতে পরিবর্তন করুন"}
        >
          <Globe size={11} className="text-indigo-600 dark:text-[#10b981]" />
          <span className="font-mono tracking-wider">{lang}</span>
        </button>

        {/* Dynamic Mock Role Switcher (ERP Sandbox) */}
        <div className="relative">
          <button 
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-full bg-indigo-50 dark:bg-emerald-500/10 border border-indigo-150 dark:border-emerald-500/20 text-[10px] font-bold text-indigo-650 dark:text-[#10b981] hover:bg-indigo-150/80 dark:hover:bg-emerald-500/20 transition-all duration-200 shadow-xs"
          >
            <ArrowLeftRight size={11} className="hidden sm:inline" />
            <span>{lang === "EN" ? "Switch Role" : "ভূমিকা পরিবর্তন"}</span>
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 py-1.5 z-45 animate-fade-in divide-y divide-slate-100 dark:divide-slate-800">
              <div className="px-3.5 py-1.5 mb-1">
                <p className="font-mono text-[8px] font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase">
                  Impersonate Sandbox Role
                </p>
              </div>
              {roles.map((r) => (
                <button
                  key={r.value}
                  onClick={() => {
                    setUserRole(r.value);
                    setShowRoleMenu(false);
                  }}
                  className="w-full text-left px-3.5 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors flex items-start justify-between group"
                >
                  <div className="overflow-hidden">
                    <p className={`text-[11px] font-bold ${userRole === r.value ? "text-indigo-600 dark:text-emerald-400" : "text-slate-700 dark:text-slate-300"}`}>
                      {r.label}
                    </p>
                    <p className="text-[9px] text-slate-400 dark:text-slate-500 truncate mt-0.5 group-hover:text-slate-500 dark:group-hover:text-slate-400">
                      {r.desc}
                    </p>
                  </div>
                  {userRole === r.value && (
                    <Check size={12} className="text-indigo-600 dark:text-emerald-400 mt-0.5 flex-shrink-0 ml-1.5" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notification Bell */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifMenu(!showNotifMenu)}
            className="relative p-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Bell size={16} />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-rose-500 border border-white dark:border-[#0f172a]"></span>
          </button>

          {showNotifMenu && (
            <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 py-2.5 z-45 animate-fade-in">
              <div className="px-3.5 pb-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <p className="font-sans font-bold text-[11px] text-slate-700 dark:text-slate-200">
                  {lang === "EN" ? "Recent Alerts" : "সাম্প্রতিক সতর্কতা"}
                </p>
                <span className="bg-indigo-50 dark:bg-emerald-500/15 text-indigo-600 dark:text-emerald-400 font-mono text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                  {notifications.length}
                </span>
              </div>
              <div className="mt-1 divide-y divide-slate-100 dark:divide-slate-800">
                {notifications.map((n) => (
                  <div key={n.id} className="p-2.5 hover:bg-slate-550 dark:hover:bg-slate-850 transition-colors flex items-start space-x-2">
                    {n.type === "alert" ? (
                      <AlertCircle size={13} className="text-rose-500 mt-0.5 flex-shrink-0" />
                    ) : (
                      <Check size={13} className="text-emerald-550 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
                    )}
                    <p className="text-[10px] text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                      {n.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Divider & Simple Logout */}
        <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-800"></div>
        <button 
          onClick={onLogout}
          className="text-[11px] font-bold text-rose-500 hover:text-white hover:bg-rose-500 hover:px-2 hover:py-1 rounded-md transition-all active:scale-95 duration-150"
        >
          {lang === "EN" ? "Sign Out" : "লগআউট"}
        </button>

      </div>
    </header>
  );
}
