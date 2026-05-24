import React, { useState, useEffect, useMemo } from "react";
import { 
  Cpu, Upload, Play, HelpCircle, Clock, FileText, User, Users, Check, 
  Download, Printer, RefreshCw, AlertTriangle, MapPin, ListFilter, 
  CheckCircle, FileSpreadsheet, Server, Laptop, Activity, Key, ShieldAlert,
  Fingerprint, Save, Plus, Trash2, CheckSquare
} from "lucide-react";
import { Employee, AttendanceRecord } from "../types";

interface AttendanceModuleProps {
  attendance: AttendanceRecord[];
  employees: Employee[];
  lang: "EN" | "BN";
  onAddAuditLog: (action: string, target: string, details: string) => void;
  onUpdateAttendance: (records: AttendanceRecord[]) => void;
}

// Interfaces for ZK BioTime Fingerprint Attendance model
interface BiometricDevice {
  id: string;
  name: string;
  serialNumber: string;
  ipAddress: string;
  port: string;
  connectionType: "Public IP" | "VPN" | "Local Agent";
  status: "Online" | "Offline" | "Connecting";
  lastPingMs: number;
}

interface BiometricMap {
  employeeId: string;
  name: string;
  fingerprintId: string; // Biometric ID
  primaryFinger: string; // Right Thumb, etc.
  secondaryFinger: string;
  isRegistered: boolean;
}

interface SyncJob {
  id: string;
  syncTime: string;
  dateScoped: string;
  recordsSynced: number;
  deviceSource: string;
  method: "ADMS Net" | "SDK Direct" | "BioTime API" | "Manual Count";
  outcome: "Success" | "Partial Network Loss" | "Access Token Revoked";
}

interface BiometricErrorLog {
  id: string;
  time: string;
  deviceSerial: string;
  rawBioId: string;
  errorReason: string;
  severity: "Low" | "Medium" | "High";
  status: "Unresolved" | "Resolved";
}

interface RawBiomPunch {
  id: string;
  biometricId: string;
  punchTime: string;
  deviceSerial: string;
  verificationMethod: "Fingerprint" | "Manual Overwrite";
}

export default function AttendanceModule({
  attendance,
  employees,
  lang,
  onAddAuditLog,
  onUpdateAttendance
}: AttendanceModuleProps) {
  // 9 sub-menus requested:
  // - "settings": ZK BioTime Settings
  // - "devices": Fingerprint Device Setup
  // - "mapping": Employee Biometric Mapping
  // - "sync": Sync Attendance Logs
  // - "raw": Raw Punch Data
  // - "processing": Attendance Processing
  // - "history": Sync History
  // - "health": Device Health
  // - "errors": Attendance Error Log
  const [activeSubTab, setActiveSubTab] = useState<
    "settings" | "devices" | "mapping" | "sync" | "raw" | "processing" | "history" | "health" | "errors"
  >("processing");

  // Filter/Search states
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDept, setFilterDept] = useState("All");
  const [filterSection, setFilterSection] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterDate, setFilterDate] = useState("2026-05-23");

  // ZK BioTime Settings state
  const [serverIp, setServerIp] = useState("192.168.10.15");
  const [serverPort, setServerPort] = useState("8081");
  const [username, setUsername] = useState("biotime_admin");
  const [password, setPassword] = useState("••••••••••••");
  const [apiToken, setApiToken] = useState("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ottomass.zkbiotime");
  const [connectionMode, setConnectionMode] = useState<"Public IP" | "VPN" | "Local Agent">("VPN");
  const [isTokenValid, setIsTokenValid] = useState(true);

  // Fingerprint Devices setup state
  const [devices, setDevices] = useState<BiometricDevice[]>(() => {
    const saved = localStorage.getItem("ottomass_biometric_devices");
    if (saved) return JSON.parse(saved);
    return [
      { id: "dev-01", name: "Knitting Floor Primary 990", serialNumber: "ZK-KN-990", ipAddress: "192.168.4.201", port: "4370", connectionType: "VPN", status: "Online", lastPingMs: 14 },
      { id: "dev-02", name: "Linking Assembly Wall Unit", serialNumber: "ZK-LN-500", ipAddress: "192.168.4.202", port: "4370", connectionType: "VPN", status: "Online", lastPingMs: 22 },
      { id: "dev-03", name: "Mending QA Desk Reader", serialNumber: "ZK-MD-200", ipAddress: "103.45.204.10", port: "80", connectionType: "Public IP", status: "Offline", lastPingMs: 0 },
      { id: "dev-04", name: "Office Admin Access Gates", serialNumber: "ZK-OFF-30", ipAddress: "192.168.4.204", port: "4370", connectionType: "Local Agent", status: "Online", lastPingMs: 7 }
    ];
  });

  // Employee fingerprint enrollment mapping state
  const [biometricMaps, setBiometricMaps] = useState<BiometricMap[]>(() => {
    const saved = localStorage.getItem("ottomass_biometric_maps");
    if (saved) return JSON.parse(saved);
    return [
      { employeeId: "OJ-001", name: "Shahadat Hossain", fingerprintId: "1001", primaryFinger: "Right Index", secondaryFinger: "Right Thumb", isRegistered: true },
      { employeeId: "OJ-002", name: "Farhana Akter", fingerprintId: "1002", primaryFinger: "Right Index", secondaryFinger: "Left Index", isRegistered: true },
      { employeeId: "OJ-003", name: "Mizanur Rahman", fingerprintId: "1003", primaryFinger: "Right Thumb", secondaryFinger: "Left Thumb", isRegistered: true },
      { employeeId: "OJ-004", name: "Sultana Razia", fingerprintId: "1004", primaryFinger: "Right Index", secondaryFinger: "Right Thumb", isRegistered: true },
      { employeeId: "OJ-005", name: "Anowar Ullah", fingerprintId: "1005", primaryFinger: "Right Thumb", secondaryFinger: "None", isRegistered: true }
    ];
  });

  // Raw biometric punch logs state
  const [rawPunches, setRawPunches] = useState<RawBiomPunch[]>(() => {
    const saved = localStorage.getItem("ottomass_raw_biom_punches");
    if (saved) return JSON.parse(saved);
    return [
      { id: "p-001", biometricId: "1001", punchTime: "2026-05-23 07:52:10", deviceSerial: "ZK-KN-990", verificationMethod: "Fingerprint" },
      { id: "p-002", biometricId: "1002", punchTime: "2026-05-23 08:14:22", deviceSerial: "ZK-KN-990", verificationMethod: "Fingerprint" },
      { id: "p-003", biometricId: "1003", punchTime: "2026-05-23 07:44:00", deviceSerial: "ZK-LN-500", verificationMethod: "Fingerprint" },
      { id: "p-004", biometricId: "1004", punchTime: "2026-05-23 07:59:15", deviceSerial: "ZK-KN-990", verificationMethod: "Fingerprint" },
      { id: "p-005", biometricId: "1001", punchTime: "2026-05-23 17:12:00", deviceSerial: "ZK-KN-990", verificationMethod: "Fingerprint" },
      { id: "p-006", biometricId: "1003", punchTime: "2026-05-23 17:05:00", deviceSerial: "ZK-LN-500", verificationMethod: "Fingerprint" }
    ];
  });

  // Sync execution history logs
  const [syncHistory, setSyncHistory] = useState<SyncJob[]>(() => {
    const saved = localStorage.getItem("ottomass_sync_history");
    if (saved) return JSON.parse(saved);
    return [
      { id: "job-01", syncTime: "2026-05-23 08:30:15", dateScoped: "2026-05-23", recordsSynced: 4, deviceSource: "ZK-KN-990 Knitting", method: "BioTime API", outcome: "Success" },
      { id: "job-02", syncTime: "2026-05-23 18:00:22", dateScoped: "2026-05-23", recordsSynced: 2, deviceSource: "ZK-LN-500 Linking", method: "SDK Direct", outcome: "Success" },
      { id: "job-03", syncTime: "2026-05-22 08:15:00", dateScoped: "2026-05-22", recordsSynced: 5, deviceSource: "Combined ADMS Push", method: "ADMS Net", outcome: "Success" },
      { id: "job-04", syncTime: "2026-05-21 08:10:45", dateScoped: "2026-05-21", recordsSynced: 1, deviceSource: "ZK-MD-200 Mending", method: "BioTime API", outcome: "Partial Network Loss" }
    ];
  });

  // Fingerprint Error Log state
  const [biometricErrors, setBiometricErrors] = useState<BiometricErrorLog[]>(() => {
    const saved = localStorage.getItem("ottomass_biometric_errors");
    if (saved) return JSON.parse(saved);
    return [
      { id: "err-01", time: "2026-05-23 08:02:11", deviceSerial: "ZK-KN-990", rawBioId: "9001", errorReason: "Mismatched Fingerprint Template (unregistered guest key)", severity: "Medium", status: "Unresolved" },
      { id: "err-02", time: "2026-05-23 08:11:44", deviceSerial: "ZK-LN-500", rawBioId: "9002", errorReason: "Worn or oily finger ridges (3 failed authentication slides)", severity: "Low", status: "Resolved" },
      { id: "err-03", time: "2026-05-22 08:08:10", deviceSerial: "ZK-MD-200", rawBioId: "1005", errorReason: "IP Gateway socket timeout packet drops", severity: "High", status: "Resolved" }
    ];
  });

  // Save states in local storage
  useEffect(() => {
    localStorage.setItem("ottomass_biometric_devices", JSON.stringify(devices));
  }, [devices]);
  useEffect(() => {
    localStorage.setItem("ottomass_biometric_maps", JSON.stringify(biometricMaps));
  }, [biometricMaps]);
  useEffect(() => {
    localStorage.setItem("ottomass_raw_biom_punches", JSON.stringify(rawPunches));
  }, [rawPunches]);
  useEffect(() => {
    localStorage.setItem("ottomass_sync_history", JSON.stringify(syncHistory));
  }, [syncHistory]);
  useEffect(() => {
    localStorage.setItem("ottomass_biometric_errors", JSON.stringify(biometricErrors));
  }, [biometricErrors]);

  // Form states for adding device
  const [addDevName, setAddDevName] = useState("");
  const [addDevSerial, setAddDevSerial] = useState("");
  const [addDevIp, setAddDevIp] = useState("192.168.4.");
  const [addDevPort, setAddDevPort] = useState("4370");
  const [addDevType, setAddDevType] = useState<"Public IP" | "VPN" | "Local Agent">("VPN");

  // Form state for adding biometric mapping
  const [mapEmpId, setMapEmpId] = useState("");
  const [mapBioId, setMapBioId] = useState("");
  const [mapPrimary, setMapPrimary] = useState("Right Index");
  const [mapSecondary, setMapSecondary] = useState("Right Thumb");

  // Clipboard raw text import
  const [rawPunchesText, setRawPunchesText] = useState(
    `1001, 2026-05-23, 07:52:10, ZK-KN-990\n1002, 2026-05-23, 08:14:22, ZK-KN-990\n1003, 2026-05-23, 07:44:00, ZK-LN-500\n1001, 2026-05-23, 17:12:00, ZK-KN-990\n1003, 2026-05-23, 17:05:00, ZK-LN-500`
  );

  // Daily processing criteria
  const [procDate, setProcDate] = useState("2026-05-23");
  const [shiftStart, setShiftStart] = useState("08:00");
  const [shiftEnd, setShiftEnd] = useState("17:00");
  const [graceMinutes, setGraceMinutes] = useState(15);
  const [calcStatus, setCalcStatus] = useState("");

  // Missing punch form states
  const [missingPunchEmpId, setMissingPunchEmpId] = useState("");
  const [missingDate, setMissingDate] = useState("2026-05-23");
  const [missingInTime, setMissingInTime] = useState("08:00");
  const [missingOutTime, setMissingOutTime] = useState("17:30");

  // Sync operations simulation
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState("");

  // Handle adding device
  const handleAddDeviceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addDevName || !addDevSerial || !addDevIp) return;

    const fresh: BiometricDevice = {
      id: `dev-${Date.now()}`,
      name: addDevName,
      serialNumber: addDevSerial,
      ipAddress: addDevIp,
      port: addDevPort,
      connectionType: addDevType,
      status: "Online",
      lastPingMs: 15
    };

    setDevices(prev => [...prev, fresh]);
    onAddAuditLog("Add Fingerprint Device", "Biometrics", `Added biometric device [${addDevSerial}] ${addDevName}`);
    
    // Reset Form
    setAddDevName("");
    setAddDevSerial("");
    setAddDevIp("192.168.4.");
  };

  const handleDeleteDevice = (id: string, name: string) => {
    setDevices(prev => prev.filter(d => d.id !== id));
    onAddAuditLog("Delete Biometric Device", "Biometrics", `Removed biometric device ${name}`);
  };

  // Enrolling employee fingerprint mapping
  const handleBiometricMappingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mapEmpId || !mapBioId) return;

    const matchedEmp = employees.find(emp => emp.employeeId === mapEmpId);
    if (!matchedEmp) return;

    // Check if biometric id is already occupied
    if (biometricMaps.some(m => m.fingerprintId === mapBioId && m.employeeId !== mapEmpId)) {
      alert(`Fatal Error: Fingerprint ID ${mapBioId} already assigned to another employee.`);
      return;
    }

    setBiometricMaps(prev => {
      const kept = prev.filter(m => m.employeeId !== mapEmpId);
      return [...kept, {
        employeeId: mapEmpId,
        name: matchedEmp.name,
        fingerprintId: mapBioId,
        primaryFinger: mapPrimary,
        secondaryFinger: mapSecondary,
        isRegistered: true
      }];
    });

    onAddAuditLog("Map Biometric Fingerprint", "Biometrics", `Registered fingerprint template ID ${mapBioId} for worker ${matchedEmp.name} (${mapEmpId})`);
    
    // Reset inputs
    setMapEmpId("");
    setMapBioId("");
    alert(`Success! Biometric registration locked for ${matchedEmp.name}. Template is synchronized to ADMS database.`);
  };

  // ADMS Biometric Log Puller
  const triggerADMSSync = () => {
    setIsSyncing(true);
    setSyncStatus("Connecting bio-servers & verifying tokens...");

    setTimeout(() => {
      setSyncStatus("Validating device network tunnels [ZK-KN-990, ZK-LN-500]...");
      
      setTimeout(() => {
        setSyncStatus("ADMS pushing raw biological punch values...");

        setTimeout(() => {
          // Sync raw punches to active raw punches registry
          // For missing entries, convert raw biometric punches to actual AttendanceRecord!
          let syncCount = 0;
          const freshAttendance = [...attendance];

          rawPunches.forEach(item => {
            const linkedMap = biometricMaps.find(m => m.fingerprintId === item.biometricId);
            if (linkedMap) {
              const matchedEmp = employees.find(e => e.employeeId === linkedMap.employeeId);
              if (matchedEmp) {
                const punchDate = item.punchTime.split(" ")[0];
                const punchTime = item.punchTime.split(" ")[1].substring(0, 5);

                const existingItemIdx = freshAttendance.findIndex(
                  a => a.employeeId === matchedEmp.employeeId && a.date === punchDate
                );

                if (existingItemIdx >= 0) {
                  const rec = freshAttendance[existingItemIdx];
                  if (punchTime > rec.checkIn) {
                    rec.checkOut = punchTime;
                  } else {
                    rec.checkIn = punchTime;
                  }
                } else {
                  freshAttendance.push({
                    id: `biotime-${Date.now()}-${matchedEmp.employeeId}`,
                    employeeId: matchedEmp.employeeId,
                    employeeName: matchedEmp.name,
                    date: punchDate,
                    checkIn: punchTime,
                    checkOut: "",
                    otHours: 0,
                    status: "Present",
                    verificationMethod: "Fingerprint",
                    approvalStatus: "Approved"
                  });
                }
                syncCount++;
              }
            }
          });

          onUpdateAttendance(freshAttendance);
          setIsSyncing(false);
          setSyncStatus(`Syncing finalized! Mapped ${syncCount} biometric logs successfully into wages attendance desk.`);
          onAddAuditLog("ZK BioTime ADMS Log Sync", "Biometrics", `Pulled biometric logs from ADMS server`);

          // Log sync job
          setSyncHistory(prev => [
            {
              id: `job-${Date.now()}`,
              syncTime: new Date().toISOString().replace("T", " ").slice(0, 19),
              dateScoped: procDate,
              recordsSynced: syncCount,
              deviceSource: "ADMS Net Push API",
              method: "BioTime API",
              outcome: "Success"
            },
            ...prev
          ]);
        }, 800);
      }, 800);
    }, 605);
  };

  // Daily processing criteria calculations
  const calculateDailyAttendanceProcessing = () => {
    setCalcStatus("Initializing biometric analytics processor...");

    setTimeout(() => {
      let lates = 0;
      let earlyOuts = 0;
      let computedOT = 0;

      const parsed = attendance.map(item => {
        if (item.date !== procDate) return item;

        // Perform calibrations
        const [inH, inM] = item.checkIn.split(":").map(Number);
        const [startH, startM] = shiftStart.split(":").map(Number);
        
        const inMinutes = inH * 60 + inM;
        const targetStartMin = startH * 60 + startM;

        let status = item.status;
        if (inMinutes > (targetStartMin + graceMinutes)) {
          status = "Late";
          lates++;
        } else status = "Present";

        let ot = 0;
        if (item.checkOut) {
          const [outH, outM] = item.checkOut.split(":").map(Number);
          const [endH, endM] = shiftEnd.split(":").map(Number);

          const actualOutMinutes = outH * 60 + outM;
          const targetEndMinutes = endH * 60 + endM;

          if (actualOutMinutes < targetEndMinutes) {
            earlyOuts++;
          } else if (actualOutMinutes > targetEndMinutes) {
            const excess = actualOutMinutes - targetEndMinutes;
            ot = Math.floor(excess / 30) * 0.5; // half hour increments
            computedOT += ot;
          }
        }

        return {
          ...item,
          status,
          otHours: ot,
          approvalStatus: "Approved" as const
        };
      });

      // Absent markers
      employees.forEach(emp => {
        const hasPunch = parsed.some(p => p.employeeId === emp.employeeId && p.date === procDate);
        if (!hasPunch && emp.status === "Active") {
          parsed.push({
            id: `abs-${Date.now()}-${emp.employeeId}`,
            employeeId: emp.employeeId,
            employeeName: emp.name,
            date: procDate,
            checkIn: "--:--",
            checkOut: "--:--",
            otHours: 0,
            status: "Absent",
            verificationMethod: "Fingerprint",
            approvalStatus: "Approved"
          });
        }
      });

      onUpdateAttendance(parsed);
      setCalcStatus(`Successfully processed daily presence! Calculated ${lates} Lates, ${earlyOuts} Early-Outs, generated ${computedOT} Overtime hours for date ${procDate}.`);
      onAddAuditLog("Daily Processing Run", "Presence Engine", `Processed attendance metrics for date: ${procDate}. OT Hours generated: ${computedOT}`);
    }, 900);
  };

  // Add manual punch regular adjustments
  const handleAddCorrection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!missingPunchEmpId) return;

    const matched = employees.find(emp => emp.employeeId === missingPunchEmpId);
    if (!matched) return;

    const freshList = [...attendance];
    const matchIdx = freshList.findIndex(a => a.employeeId === missingPunchEmpId && a.date === missingDate);

    if (matchIdx >= 0) {
      freshList[matchIdx] = {
        ...freshList[matchIdx],
        checkIn: missingInTime,
        checkOut: missingOutTime,
        status: "Present",
        verificationMethod: "Manual",
        approvalStatus: "Approved"
      };
    } else {
      freshList.push({
        id: `override-${Date.now()}`,
        employeeId: missingPunchEmpId,
        employeeName: matched.name,
        date: missingDate,
        checkIn: missingInTime,
        checkOut: missingOutTime,
        otHours: 0,
        status: "Present",
        verificationMethod: "Manual",
        approvalStatus: "Approved"
      });
    }

    onUpdateAttendance(freshList);
    setMissingPunchEmpId("");
    onAddAuditLog("Manual Punch Correction", "Biometrics", `Regularized check-in/out for ID ${missingPunchEmpId} on date ${missingDate}`);
    alert(`Success: regularized manual biometric logs for employee ${matched.name}.`);
  };

  const getSeverityColor = (sev: string) => {
    if (sev === "High") return "bg-rose-100 text-rose-850 font-bold border-rose-200";
    if (sev === "Medium") return "bg-amber-100 text-amber-850 font-bold border-amber-200";
    return "bg-slate-100 text-slate-700 border-slate-200";
  };

  // Master Filter matching
  const filteredLogs = useMemo(() => {
    return attendance.filter(log => {
      const matchSearch = log.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          log.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
      
      const emp = employees.find(e => e.employeeId === log.employeeId);
      const matchDept = filterDept === "All" || (emp && emp.department === filterDept);
      const matchSec = filterSection === "All" || (emp && emp.section === filterSection);
      const matchStatus = filterStatus === "All" || log.status === filterStatus;
      const matchDate = !filterDate || log.date === filterDate;

      return matchSearch && matchDept && matchSec && matchStatus && matchDate;
    });
  }, [attendance, searchTerm, filterDept, filterSection, filterStatus, filterDate, employees]);

  // Department / Section helpers
  const deptList = ["All", ...Array.from(new Set(employees.map(e => e.department)))];
  const sectionList = ["All", ...Array.from(new Set(employees.map(e => e.section)))];

  return (
    <div className="space-y-6 animate-fade-in pr-2 pb-12 font-sans text-xs">
      
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 no-print">
        <div>
          <h2 className="font-display font-bold text-2xl text-slate-800 tracking-tight">
            ⚡ ZK BioTime Fingerprint Biometric Environment Controller
          </h2>
          <p className="font-sans text-xs text-slate-500 mt-1">
            Connect high-speed biometric scanning machines, manage employee fingerprint templates, sync ADMS raw push streams, calibrate lates, and export payroll attendance logs.
          </p>
        </div>

        {/* Quick KPI blocks */}
        <div className="flex gap-2.5 font-sans">
          <div className="bg-indigo-55/60 border border-indigo-100 p-2.5 rounded-xl text-center">
            <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider block">Machines Online</span>
            <span className="font-mono font-bold text-indigo-755 text-sm mt-0.5">{devices.filter(d => d.status === "Online").length} / {devices.length}</span>
          </div>
          <div className="bg-emerald-55/60 border border-emerald-100 p-2.5 rounded-xl text-center">
            <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider block">Templates enrolled</span>
            <span className="font-mono font-bold text-emerald-700 text-sm mt-0.5">{biometricMaps.length} Users</span>
          </div>
        </div>
      </div>

      {/* 9 Tab Navigation requested */}
      <div className="flex flex-wrap gap-1 p-1 bg-slate-100 border border-slate-205 rounded-xl font-bold text-[10.5px] no-print">
        <button onClick={() => setActiveSubTab("settings")} className={`px-2.5 py-2.5 rounded-lg transition ${activeSubTab === "settings" ? "bg-white text-indigo-600 shadow-xs" : "text-slate-500 hover:text-slate-700"}`}>⚙️ ZK BioTime Settings</button>
        <button onClick={() => setActiveSubTab("devices")} className={`px-2.5 py-2.5 rounded-lg transition ${activeSubTab === "devices" ? "bg-white text-indigo-600 shadow-xs" : "text-slate-500 hover:text-slate-700"}`}>📟 Device Setup</button>
        <button onClick={() => setActiveSubTab("mapping")} className={`px-2.5 py-2.5 rounded-lg transition ${activeSubTab === "mapping" ? "bg-white text-indigo-600 shadow-xs" : "text-slate-500 hover:text-slate-700"}`}>👤 Biometric Mapping</button>
        <button onClick={() => setActiveSubTab("sync")} className={`px-2.5 py-2.5 rounded-lg transition ${activeSubTab === "sync" ? "bg-white text-indigo-600 shadow-xs" : "text-slate-500 hover:text-slate-700"}`}>🔄 Sync Logs</button>
        <button onClick={() => setActiveSubTab("raw")} className={`px-2.5 py-2.5 rounded-lg transition ${activeSubTab === "raw" ? "bg-white text-indigo-600 shadow-xs" : "text-slate-500 hover:text-slate-700"}`}>📝 Raw Punches</button>
        <button onClick={() => setActiveSubTab("processing")} className={`px-2.5 py-2.5 rounded-lg transition ${activeSubTab === "processing" ? "bg-white text-indigo-600 shadow-xs" : "text-slate-500 hover:text-slate-700"}`}>⚙️ Shift Process</button>
        <button onClick={() => setActiveSubTab("history")} className={`px-2.5 py-2.5 rounded-lg transition ${activeSubTab === "history" ? "bg-white text-indigo-600 shadow-xs" : "text-slate-500 hover:text-slate-700"}`}>📰 Sync History</button>
        <button onClick={() => setActiveSubTab("health")} className={`px-2.5 py-2.5 rounded-lg transition ${activeSubTab === "health" ? "bg-white text-indigo-600 shadow-xs" : "text-slate-500 hover:text-slate-700"}`}>❤️ Device Health</button>
        <button onClick={() => setActiveSubTab("errors")} className={`px-2.5 py-2.5 rounded-lg transition ${activeSubTab === "errors" ? "bg-white text-indigo-600 shadow-xs" : "text-slate-500 hover:text-slate-700"}`}>⚠️ Error & Correction Logs</button>
      </div>

      {/* TABS SCREENS IMPLEMENTATION */}

      {/* 1. ZK BIOTIME SETTINGS */}
      {activeSubTab === "settings" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white border border-slate-200 p-5 rounded-2xl">
            <h3 className="font-display font-bold text-sm text-slate-805 mb-4 flex items-center gap-1.5Packed font-medium">
              <Server size={16} className="text-indigo-650" /> 1. ZK BioTime 8.5 Master Server Credentials
            </h3>

            <div className="space-y-4 text-xs font-sans">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Server Host IP / Web URL</label>
                  <input type="text" className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-mono" value={serverIp} onChange={e => setServerIp(e.target.value)} />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">BioTime Web Port (e.g. 8081)</label>
                  <input type="text" className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-mono" value={serverPort} onChange={e => setServerPort(e.target.value)} />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Web Server API Username</label>
                  <input type="text" className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-sans font-bold text-slate-700" value={username} onChange={e => setUsername(e.target.value)} />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Password</label>
                  <input type="password" className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-mono" value={password} onChange={e => setPassword(e.target.value)} />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">API JWT Authentication bearer Token</label>
                <div className="relative">
                  <Key size={13} className="absolute left-3 top-3.5 text-slate-400" />
                  <input type="text" className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px]" value={apiToken} onChange={e => setApiToken(e.target.value)} />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Transmission Infrastructure Type</label>
                <select className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl" value={connectionMode} onChange={e => setConnectionMode(e.target.value as any)}>
                  <option value="VPN">Direct Site-to-Site Encrypted IPSec VPN (Recommended)</option>
                  <option value="Public IP">Statics NAT Public IP Mapping (Port Forwarding)</option>
                  <option value="Local Agent">Local PC Synchronizer Agent (Broker UDP logs)</option>
                </select>
              </div>

              <div className="pt-2 border-t border-slate-100 flex justify-end">
                <button onClick={() => alert("ZK BioTime server connection parameters updated successfully.")} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-750 text-white font-bold rounded-xl shadow-xs">
                  Save Server Configuration
                </button>
              </div>
            </div>
          </div>

          <div className="bg-[#1e293b] border border-slate-800 p-5 rounded-2xl text-slate-200 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-indigo-400 font-sans font-bold text-[10.5px] uppercase tracking-wider">
                <span className="w-2 h-2 rounded bg-emerald-500"></span>
                <span>BioTime Connector Node Status</span>
              </div>
              <p className="text-xs text-slate-350 leading-relaxed text-slate-300">
                The OTTOMASS general attendance core is communicating with the ZK BioTime middleware. This permits live extraction of fingerprints templates and raw ADMS push streams.
              </p>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 font-mono text-[10.5px] text-emerald-400 leading-relaxed">
                <p># Sync Endpoint: Active</p>
                <p># Server Version: 8.5.4 build 2026</p>
                <p># Sync Payload Hash: 0xEE2A91</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. FINGERPRINT DEVICE SETUP */}
      {activeSubTab === "devices" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
          <div className="lg:col-span-2 bg-white border border-slate-200 p-5 rounded-2xl space-y-4">
            <h3 className="font-display font-medium text-xs uppercase text-slate-40 tracking-wider">
              2. Registered Biometric Scanners Setup
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs divide-y divide-slate-100 font-mono">
                <thead>
                  <tr className="text-slate-400 text-[10px] uppercase font-bold">
                    <th className="py-2">Device Name</th>
                    <th className="py-2">Serial Number</th>
                    <th className="py-2 text-right">Host IP / Port</th>
                    <th className="py-2 text-center">Type</th>
                    <th className="py-2 text-center">Link Status</th>
                    <th className="py-2 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {devices.map(d => (
                    <tr key={d.id} className="hover:bg-slate-50 font-medium text-slate-700">
                      <td className="py-3 font-sans font-bold text-slate-900">{d.name}</td>
                      <td className="py-3 text-slate-500 font-bold">{d.serialNumber}</td>
                      <td className="py-3 text-right">{d.ipAddress}:{d.port}</td>
                      <td className="py-3 text-center">
                        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[9px] font-bold uppercase">{d.connectionType}</span>
                      </td>
                      <td className="py-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[8.5px] font-extrabold uppercase ${d.status === "Online" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-rose-50 text-rose-600 border border-rose-100"}`}>
                          {d.status}
                        </span>
                      </td>
                      <td className="py-3 text-center">
                        <button onClick={() => handleDeleteDevice(d.id, d.name)} className="text-rose-550 hover:text-rose-700 p-1">
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white border border-slate-205 p-5 rounded-2xl">
            <h4 className="font-display font-bold text-slate-805 text-xs uppercase tracking-wider mb-3">Add Fingerprint Machine Node</h4>
            <form onSubmit={handleAddDeviceSubmit} className="space-y-3">
              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Device Name / Location</label>
                <input type="text" required placeholder="e.g. Packaging Floor 2 Unit" className="w-full bg-slate-50 border border-slate-205 p-2 rounded-xl text-xs font-sans" value={addDevName} onChange={e => setAddDevName(e.target.value)} />
              </div>
              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">ZK Machine Serial Number</label>
                <input type="text" required placeholder="e.g. ZK-PK-200" className="w-full bg-slate-50 border border-slate-205 p-2 rounded-xl font-mono text-xs" value={addDevSerial} onChange={e => setAddDevSerial(e.target.value)} />
              </div>
              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">LAN IP Address (Host)</label>
                <input type="text" required value={addDevIp} onChange={e => setAddDevIp(e.target.value)} className="w-full bg-slate-50 border border-slate-205 p-2 rounded-xl font-mono text-xs" />
              </div>
              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Platform Link Mode</label>
                <select className="w-full bg-slate-50 border border-slate-205 p-2 rounded-xl text-xs" value={addDevType} onChange={e => setAddDevType(e.target.value as any)}>
                  <option value="VPN">Direct IPSec VPN Tunnel</option>
                  <option value="Public IP">Dynamic NAT (Public IP Forward)</option>
                  <option value="Local Agent">ADMS Local Agent TCP Pool</option>
                </select>
              </div>
              <button type="submit" className="w-full py-2 bg-indigo-600 hover:bg-indigo-755 text-white font-bold rounded-xl mt-2 transition">
                Register Device Node
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 3. EMPLOYEE BIOMETRIC MAPPING */}
      {activeSubTab === "mapping" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
          <div className="lg:col-span-2 bg-white border border-slate-200 p-5 rounded-2xl space-y-4">
            <h3 className="font-display font-medium text-xs uppercase text-slate-400 tracking-wider">
              3. Biometric Fingerprint Registry (ADMS Map Cards)
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs divide-y divide-slate-100 font-sans">
                <thead>
                  <tr className="text-slate-400 text-[10px] uppercase font-bold">
                    <th className="py-2">Employee ID</th>
                    <th className="py-2">Employee name</th>
                    <th className="py-2 text-center">Mapped template ID</th>
                    <th className="py-2">Primary Finger</th>
                    <th className="py-2">backup finger</th>
                    <th className="py-2 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {employees.map(emp => {
                    const mapped = biometricMaps.find(m => m.employeeId === emp.employeeId);
                    return (
                      <tr key={emp.employeeId} className="hover:bg-slate-50">
                        <td className="py-3 font-mono font-bold text-slate-900">{emp.employeeId}</td>
                        <td className="py-3 font-bold text-slate-800">{emp.name}</td>
                        <td className="py-3 text-center font-mono font-bold text-indigo-700">
                          {mapped ? mapped.fingerprintId : (
                            <span className="text-slate-400 italic">-- Not Enrolled --</span>
                          )}
                        </td>
                        <td className="py-3 text-slate-550 font-semibold">{mapped ? mapped.primaryFinger : "N/A"}</td>
                        <td className="py-3 text-slate-400">{mapped ? mapped.secondaryFinger : "N/A"}</td>
                        <td className="py-3 text-center">
                          {mapped ? (
                            <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 text-[8.5px] font-extrabold px-1.5 py-0.5 rounded-full uppercase">
                              Verified
                            </span>
                          ) : (
                            <span className="bg-amber-50 text-amber-600 border border-amber-100 text-[8.5px] font-extrabold px-1.5 py-0.5 rounded-full uppercase">
                              Pending
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

          <div className="bg-white border border-slate-200 p-5 rounded-2xl">
            <h4 className="font-display font-semibold text-xs tracking-wider uppercase text-slate-400 mb-3 flex items-center gap-1.5">
              <Fingerprint size={16} className="text-indigo-600" /> Enrol Fingerprint Template
            </h4>

            <form onSubmit={handleBiometricMappingSubmit} className="space-y-3 font-sans text-xs">
              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Select Employee</label>
                <select className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-medium" value={mapEmpId} onChange={e => setMapEmpId(e.target.value)} required>
                  <option value="">-- Choose employee --</option>
                  {employees.map(e => (
                    <option key={e.id} value={e.employeeId}>{e.name} ({e.employeeId})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Target Biometric ID Number</label>
                <input type="text" required placeholder="e.g. 1009" className="w-full bg-slate-50 border border-slate-202 p-2 rounded-xl font-mono text-xs" value={mapBioId} onChange={e => setMapBioId(e.target.value)} />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Enrolled Finger (Primary)</label>
                <select className="w-full bg-slate-50 border border-slate-202 p-2 rounded-xl text-xs" value={mapPrimary} onChange={e => setMapPrimary(e.target.value)}>
                  <option value="Right Index">Right Index Finger</option>
                  <option value="Right Thumb">Right Thumb</option>
                  <option value="Left Index">Left Index Finger</option>
                  <option value="Left Thumb">Left Thumb</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Backup Finger (Secondary)</label>
                <select className="w-full bg-slate-50 border border-slate-202 p-2 rounded-xl text-xs" value={mapSecondary} onChange={e => setMapSecondary(e.target.value)}>
                  <option value="Right Thumb">Right Thumb</option>
                  <option value="Left Thumb">Left Thumb</option>
                  <option value="Right Middle">Right Middle Finger</option>
                  <option value="None">None</option>
                </select>
              </div>

              <button type="submit" className="w-full py-2.5 bg-indigo-650 hover:bg-indigo-750 text-white font-black rounded-xl transition">
                Synchronize Fingerprint ID
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 4. SYNC ATTENDANCE LOGS */}
      {activeSubTab === "sync" && (
        <div className="bg-white border border-slate-202 p-5 rounded-2xl space-y-4">
          <div>
            <h3 className="font-display font-bold text-sm text-slate-805">4. ADMS Log Synchronizer Core</h3>
            <p className="font-sans text-xs text-slate-450">Pull transactions log packets from ZK physical devices or web API middleware databases into the ERP desk.</p>
          </div>

          <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col items-center justify-center space-y-4 text-center max-w-xl mx-auto">
            <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center">
              <RefreshCw size={22} className={`text-indigo-600 ${isSyncing ? "animate-spin" : ""}`} />
            </div>

            <div className="space-y-1">
              <h4 className="font-sans font-bold text-slate-800 text-sm">Download active biometric transactions log</h4>
              <p className="font-sans text-xs text-slate-400 leading-relaxed">Runs background API polling across all configured VPN tunnels to transfer fingerprint presence stamps.</p>
            </div>

            <button onClick={triggerADMSSync} disabled={isSyncing} className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-slate-950 font-bold rounded-xl transition">
              {isSyncing ? "Connecting socket stream..." : "Establish ADMS Push Socket Sync"}
            </button>

            {syncStatus && (
              <div className="w-full p-3.5 bg-emerald-50 border border-emerald-150 rounded-xl text-left flex items-start gap-2 animate-fade-in font-medium">
                <CheckSquare size={16} className="text-emerald-600 mt-0.5 shrink-0" />
                <span className="text-[11.5px] text-emerald-800 leading-relaxed">{syncStatus}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. RAW PUNCH DATA */}
      {activeSubTab === "raw" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in pr-1">
          <div className="lg:col-span-2 bg-white border border-slate-202 p-5 rounded-2xl space-y-4">
            <h3 className="font-display font-medium text-xs uppercase text-slate-400 tracking-wider">
              5. Transactions Stream (Biometric Memory Blocks)
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs divide-y divide-slate-100 font-mono">
                <thead>
                  <tr className="text-slate-400 text-[10px] uppercase font-bold">
                    <th className="py-2">Punch ID</th>
                    <th className="py-2 text-center">Biometric ID</th>
                    <th className="py-2">Punch Date / Time</th>
                    <th className="py-2">Device Serial</th>
                    <th className="py-2 text-center">Verification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-600 font-medium">
                  {rawPunches.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50 font-medium">
                      <td className="py-3 text-slate-805 font-bold font-mono">[{p.id}]</td>
                      <td className="py-3 text-center font-bold text-indigo-700">{p.biometricId}</td>
                      <td className="py-3 text-slate-500">{p.punchTime}</td>
                      <td className="py-3 text-slate-400 font-bold">{p.deviceSerial}</td>
                      <td className="py-3 text-center">
                        <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[8.5px] font-extrabold uppercase uppercase">{p.verificationMethod}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white border border-slate-202 p-5 rounded-2xl space-y-3">
            <h4 className="font-display font-bold text-slate-800 text-xs uppercase tracking-wider">Direct Clipboard JSON/CSV Import</h4>
            <textarea className="w-full bg-slate-50 border border-slate-200 font-mono text-[10.5px] p-3 rounded-xl" rows={8} value={rawPunchesText} onChange={e => setRawPunchesText(e.target.value)} />
            
            <button onClick={() => {
              if (!rawPunchesText.trim()) return;
              const lines = rawPunchesText.split("\n");
              let imported = 0;
              lines.forEach(line => {
                const parts = line.split(",");
                if (parts.length >= 3) {
                  const bioId = parts[0].trim();
                  const pTime = `${parts[1].trim()} ${parts[2].trim()}`;
                  const serial = parts[3] ? parts[3].trim() : "ZK-MAN-AUTO";
                  setRawPunches(prev => [
                    { id: `p-${Date.now()}-${Math.random().toString(36).substr(2,4)}`, biometricId: bioId, punchTime: pTime, deviceSerial: serial, verificationMethod: "Fingerprint" },
                    ...prev
                  ]);
                  imported++;
                }
              });
              alert(`Successfully decoded and imported ${imported} biometric punch logs.`);
              onAddAuditLog("Clipboard Raw Punch Import", "Biometrics", `Imported ${imported} raw fingerprint blocks`);
            }} className="w-full py-2 bg-indigo-600 text-white font-bold rounded-xl text-xs">
              Parse Clipboard Raw Punches
            </button>
          </div>
        </div>
      )}

      {/* 6. ATTENDANCE PROCESSING */}
      {activeSubTab === "processing" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
          <div className="lg:col-span-2 bg-white border border-slate-200 p-5 rounded-2xl space-y-4">
            <h3 className="font-display font-bold text-sm text-slate-800 flex items-center space-x-2">
              <Clock size={16} className="text-indigo-6s0" />
              <span>6. Biometric presence KPI & Calendar Shift calibrations</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Target Date</label>
                <input type="date" className="w-full bg-slate-50 border border-slate-200 p-2 text-xs font-mono" value={procDate} onChange={e => { setProcDate(e.target.value); setFilterDate(e.target.value); }} />
              </div>
              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Grace minutes Allowed (late check)</label>
                <input type="number" className="w-full bg-slate-50 border border-slate-200 p-2 text-xs font-mono font-bold text-slate-800" value={graceMinutes} onChange={e => setGraceMinutes(Number(e.target.value))} />
              </div>
              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Standard Shift Start Time</label>
                <input type="time" className="w-full bg-slate-50 border border-slate-200 p-2 text-xs font-mono" value={shiftStart} onChange={e => setShiftStart(e.target.value)} />
              </div>
              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Standard Shift End Time</label>
                <input type="time" className="w-full bg-slate-50 border border-slate-200 p-2 text-xs font-mono" value={shiftEnd} onChange={e => setShiftEnd(e.target.value)} />
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button onClick={calculateDailyAttendanceProcessing} className="px-5 py-2 bg-indigo-600 hover:bg-indigo-755 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition">
                <Play size={13} />
                <span>Run Biometric Processor</span>
              </button>
            </div>

            {calcStatus && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-150 rounded-xl flex items-start gap-2 font-medium">
                <CheckCircle size={16} className="text-emerald-600 mt-0.5 shrink-0" />
                <span className="text-[11.5px] text-emerald-805 leading-relaxed">{calcStatus}</span>
              </div>
            )}
          </div>

          <div className="bg-slate-50 border border-slate-202 p-5 rounded-2xl flex flex-col justify-between">
            <div className="space-y-3 font-sans text-xs">
              <h4 className="font-display font-medium text-xs text-slate-400 uppercase tracking-wider mb-2">Shift Rules Guidance</h4>
              <p><strong>Grace-Minutes:</strong> Allow workers up to {graceMinutes} minutes before recording them as "Late" (e.g. 08:15 AM check-in).</p>
              <p><strong>Overtime (OT):</strong> Excess minutes clocked past checkout time ({shiftEnd} PM) are finalized in 30-minute block steps.</p>
            </div>
            <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-100 text-[10px] text-amber-755 mt-4">
              Calibrations processed under this controller dynamically update active hours for Wages and Payroll calculation.
            </div>
          </div>
        </div>
      )}

      {/* 7. SYNC HISTORY */}
      {activeSubTab === "history" && (
        <div className="bg-white border border-slate-202 p-5 rounded-2xl space-y-4 font-mono">
          <h3 className="font-display font-medium text-xs uppercase text-slate-400 tracking-wider">
            7. ADMS & BioTime Sync jobs Audited history
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs divide-y divide-slate-100 font-mono">
              <thead>
                <tr className="text-slate-400 text-[10px] uppercase font-bold">
                  <th className="py-2.5">Sync Time (Date)</th>
                  <th className="py-2.5">Scope Date</th>
                  <th className="py-2.5 text-right">Records Synced</th>
                  <th className="py-2.5">Source Node / Server</th>
                  <th className="py-2.5">Protocol Used</th>
                  <th className="py-2.5 text-center">Sync Outcome</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600 font-medium">
                {syncHistory.map(sync => (
                  <tr key={sync.id} className="hover:bg-slate-50 font-medium">
                    <td className="py-3 text-slate-705 font-bold font-sans">{sync.syncTime}</td>
                    <td className="py-3 text-slate-500 font-sans">{sync.dateScoped}</td>
                    <td className="py-3 text-right font-black text-slate-900">{sync.recordsSynced} Punches</td>
                    <td className="py-3 text-slate-450 font-sans">{sync.deviceSource}</td>
                    <td className="py-3 font-bold text-indigo-700">{sync.method}</td>
                    <td className="py-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[8.5px] font-extrabold uppercase border ${sync.outcome === "Success" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-amber-50 text-amber-600 border-amber-200"}`}>
                        {sync.outcome}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 8. DEVICE HEALTH */}
      {activeSubTab === "health" && (
        <div className="bg-white border border-slate-202 p-5 rounded-2xl space-y-4">
          <h3 className="font-display font-medium text-xs uppercase text-slate-400 tracking-wider">
            8. Live terminal Hardware connection pings
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in font-sans">
            {devices.map(d => (
              <div key={d.id} className="p-4 border border-slate-200 rounded-2xl bg-slate-50 flex flex-col justify-between space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">{d.name}</h4>
                    <p className="font-mono text-[9px] text-slate-400 mt-0.5">{d.serialNumber} • {d.connectionType}</p>
                  </div>
                  <span className={`w-2 h-2 rounded-full ${d.status === "Online" ? "bg-emerald-500 animate-ping" : "bg-rose-500"}`}></span>
                </div>

                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-slate-400 font-bold">Latency:</span>
                  <span className={`font-bold font-mono ${d.status === "Online" ? "text-emerald-600" : "text-slate-400"}`}>
                    {d.status === "Online" ? `${d.lastPingMs} ms` : "No Link"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 9. ATTENDANCE ERROR LOGS & ADJUSTMENTS */}
      {activeSubTab === "errors" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
          <div className="lg:col-span-2 bg-white border border-slate-202 p-5 rounded-2xl space-y-4">
            <h3 className="font-display font-medium text-xs uppercase text-slate-400 tracking-wider">
              9. Biometric Scanner Packet Exceptions Registry
            </h3>

            <div className="overflow-x-auto font-mono text-[11px]">
              <table className="w-full text-left text-xs divide-y divide-slate-105 font-mono">
                <thead>
                  <tr className="text-slate-400 text-[10px] uppercase font-bold">
                    <th className="py-2">Exception Time</th>
                    <th className="py-2 text-center">Unresolved ID</th>
                    <th className="py-2">Description / Error Mode</th>
                    <th className="py-2 text-center">Severity</th>
                    <th className="py-2 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-650 font-medium">
                  {biometricErrors.map(err => (
                    <tr key={err.id} className="hover:bg-slate-50 font-medium text-[11px]">
                      <td className="py-3 font-sans text-slate-502">{err.time}</td>
                      <td className="py-3 text-center font-bold text-rose-600 font-mono">[{err.rawBioId}]</td>
                      <td className="py-3 text-slate-500 font-sans leading-normal">{err.errorReason}</td>
                      <td className="py-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[8.5px] uppercase border ${getSeverityColor(err.severity)}`}>{err.severity}</span>
                      </td>
                      <td className="py-3 text-center">
                        {err.status === "Unresolved" ? (
                          <button onClick={() => {
                            setBiometricErrors(prev => prev.map(e => e.id === err.id ? { ...e, status: "Resolved" as const } : e));
                            alert("Discrepancy marked as Resolved manually in Biometric audit logs.");
                          }} className="p-1 px-2.5 bg-amber-50 hover:bg-amber-100 text-amber-700 text-[10px] font-bold border border-amber-200 rounded-lg transition font-sans">
                            Resolve
                          </button>
                        ) : (
                          <span className="text-emerald-600 font-bold font-sans text-[10.5px]">Resolved ✓</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-5 rounded-2xl">
            <h4 className="font-display font-semibold text-xs tracking-wider uppercase text-slate-400 mb-3 flex items-center gap-1.5">
              <ShieldAlert size={15} className="text-amber-500" /> Manual Regularization adjustment
            </h4>
            <p className="text-[11px] text-slate-400 mb-3 font-sans">For unresolved exceptions or swipe overrides, manually regularize checkout or checkin logs below:</p>

            <form onSubmit={handleAddCorrection} className="space-y-3 font-sans text-xs">
              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Select Employee</label>
                <select className="w-full bg-slate-50 border border-slate-220 p-2 rounded-xl text-slate-650 font-medium" value={missingPunchEmpId} onChange={e => {
                  setMissingPunchEmpId(e.target.value);
                  const log = attendance.find(a => a.employeeId === e.target.value && a.date === missingDate);
                  if (log) {
                    if (log.checkIn && log.checkIn !== "--:--") setMissingInTime(log.checkIn);
                  }
                }} required>
                  <option value="">-- Choose employee --</option>
                  {employees.map(e => (
                    <option key={e.id} value={e.employeeId}>{e.name} ({e.employeeId})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Target Date</label>
                <input type="date" required className="w-full bg-slate-50 border border-slate-202 p-2 rounded-xl font-mono" value={missingDate} onChange={e => setMissingDate(e.target.value)} />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">In-Check Time (hh:mm)</label>
                <input type="time" required className="w-full bg-slate-50 border border-slate-202 p-2 rounded-xl font-mono text-xs" value={missingInTime} onChange={e => setMissingInTime(e.target.value)} />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Out-Check Time (hh:mm)</label>
                <input type="time" required className="w-full bg-slate-50 border border-slate-202 p-2 rounded-xl font-mono text-xs" value={missingOutTime} onChange={e => setMissingOutTime(e.target.value)} />
              </div>

              <button type="submit" className="w-full py-2 bg-indigo-600 hover:bg-indigo-755 text-white font-bold rounded-xl shadow-xs transition">
                Confirm Manual Correction
              </button>
            </form>
          </div>
        </div>
      )}

      {/* FOOTER REPORTS REGISTRY (LOGS AND Hub HUB) */}
      {(activeSubTab === "logs" || activeSubTab === "processing") && (
        <div className="bg-white border border-slate-202 p-5 rounded-2xl flex flex-col space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0 no-print">
            <div className="flex flex-wrap gap-2 items-center font-sans">
              <h3 className="font-display font-medium text-xs uppercase text-slate-405 tracking-wider">
                {lang === "EN" ? "Processed Attendance registry logs" : "প্রসেসড বায়োমেট্রিক উপস্থিতি রেজিস্ট্রি লিংকেজ"}
              </h3>
              <input type="date" className="bg-slate-50 border border-slate-200 rounded-lg p-1 font-mono text-xs font-bold text-indigo-700" value={filterDate} onChange={e => setFilterDate(e.target.value)} />
            </div>

            <div className="flex flex-wrap gap-2">
              <button onClick={() => window.print()} className="px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold rounded-xl border border-slate-200 transition flex items-center space-x-1">
                <Printer size={13} />
                <span>Print Ledger</span>
              </button>
              <button onClick={() => {
                const headers = "Employee ID,Name,Date,Check-In,Check-Out,OT Hours,Status,Method,Approval\n";
                const rows = filteredLogs.map(r => `"${r.employeeId}","${r.employeeName}","${r.date}","${r.checkIn}","${r.checkOut || "--"}","${r.otHours}","${r.status}","${r.verificationMethod}","${r.approvalStatus}"`).join("\n");
                const b = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
                const url = URL.createObjectURL(b);
                const l = document.createElement("a");
                l.setAttribute("href", url);
                l.setAttribute("download", `OTTOMASS_Attendance_Biometric_${filterDate}.csv`);
                document.body.appendChild(l);
                l.click();
                document.body.removeChild(l);
              }} className="px-3 py-2 bg-indigo-50 hover:bg-indigo-120 text-indigo-700 font-bold rounded-xl border border-indigo-200 transition flex items-center space-x-1">
                <Download size={13} />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 no-print font-sans">
            <input type="text" placeholder="Search ID or Employee Name..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="bg-slate-50 border border-slate-200 p-2 rounded-xl text-slate-600 focus:outline-hidden" />
            
            <select value={filterDept} onChange={e => setFilterDept(e.target.value)} className="bg-slate-50 border border-slate-200 p-2 rounded-xl text-slate-600">
              <option value="All">All Departments</option>
              {deptList.filter(d => d !== "All").map(d => <option key={d} value={d}>{d}</option>)}
            </select>

            <select value={filterSection} onChange={e => setFilterSection(e.target.value)} className="bg-slate-50 border border-slate-200 p-2 rounded-xl text-slate-600">
              <option value="All">All Sections</option>
              {sectionList.filter(s => s !== "All").map(s => <option key={s} value={s}>{s}</option>)}
            </select>

            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="bg-slate-50 border border-slate-200 p-2 rounded-xl text-slate-600 font-semibold text-slate-700">
              <option value="All">All Statuses</option>
              <option value="Present">Present</option>
              <option value="Late">Late</option>
              <option value="Absent">Absent</option>
              <option value="Leave">On Leave</option>
            </select>
          </div>

          {/* Table list */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs divide-y divide-slate-100 font-mono">
              <thead>
                <tr className="text-slate-400 text-[10px] uppercase font-extrabold pb-2">
                  <th className="py-2.5">Employee ID</th>
                  <th className="py-2.5">Name</th>
                  <th className="py-2.5">Punch-In</th>
                  <th className="py-2.5">Punch-Out</th>
                  <th className="py-2.5 text-right">OT hours</th>
                  <th className="py-2.5 text-center">Status</th>
                  <th className="py-2.5">Method</th>
                  <th className="py-2.5 text-right">Approval state</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 font-sans text-center text-slate-450 italic">No attendance records found for criteria.</td>
                  </tr>
                ) : (
                  filteredLogs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-50">
                      <td className="py-3 font-mono font-bold text-slate-900">{log.employeeId}</td>
                      <td className="py-3 font-sans font-bold text-slate-800">{log.employeeName}</td>
                      <td className="py-3 text-emerald-600 font-black font-mono">{log.checkIn}</td>
                      <td className="py-3 text-indigo-600 font-black font-mono">{log.checkOut || "--:--"}</td>
                      <td className="py-3 text-right font-black text-indigo-705">{log.otHours} hrs</td>
                      <td className="py-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[8.5px] font-extrabold uppercase ${
                          log.status === "Present" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" :
                          log.status === "Late" ? "bg-amber-50 text-amber-700 border border-amber-200" :
                          log.status === "Absent" ? "bg-rose-50 text-rose-600 border border-rose-100" : "bg-sky-50 text-sky-700 border border-sky-100"
                        }`}>
                          {log.status}
                        </span>
                      </td>
                      <td className="py-3 font-sans text-slate-500">{log.verificationMethod}</td>
                      <td className="py-3 text-right text-emerald-600 font-bold font-sans">Approved ✓</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
