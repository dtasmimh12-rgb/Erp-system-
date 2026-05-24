import React, { useState } from "react";
import { 
  Plus, Search, Trash2, Edit3, UserCheck, AlertCircle, FileSpreadsheet, KeyRound, Check, 
  RefreshCw, FileText, UploadCloud, Eye, Sliders, Scan, Radio, ClipboardCheck, ArrowUp, ArrowDown, HelpCircle
} from "lucide-react";
import { Employee } from "../types";

interface EmployeeSetupProps {
  employees: Employee[];
  onAddEmployee: (emp: Employee) => void;
  onUpdateEmployee: (emp: Employee) => void;
  onDeleteEmployee: (id: string) => void;
  onAddAuditLog: (action: string, target: string, details: string) => void;
  isDark: boolean;
  lang: "EN" | "BN";
}

// Sample custom NID uploads that can be used for OCR simulation
const sampleNIDDocuments = [
  { id: "nid-smart", type: "Smart NID Card", nameSuffix: "MD. MOSTAFIZUR RAHMAN", nameBangla: "মোঃ মোস্তাফিজুর রহমান", nidNo: "7381924192", bday: "1991-03-12" },
  { id: "nid-old", type: "Paper NID Card (Laminated)", nameSuffix: "SULTANA RAZIA", nameBangla: "সুলতানা রাজিয়া", nidNo: "1988261541011", bday: "1988-11-20" }
];

export default function EmployeeSetup({ 
  employees, 
  onAddEmployee, 
  onUpdateEmployee, 
  onDeleteEmployee, 
  onAddAuditLog,
  isDark, 
  lang 
}: EmployeeSetupProps) {
  // Navigation inside Employee Directory
  const [empSubTab, setEmpSubTab] = useState<"roster" | "ocr" | "rfid" | "import">("roster");

  // Roster listing states
  const [search, setSearch] = useState("");
  const [filterDept, setFilterDept] = useState("All");
  const [filterBranch, setFilterBranch] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [activeId, setActiveId] = useState("");
  const [showArchived, setShowArchived] = useState(false);

  // Sorting columns
  const [sortField, setSortField] = useState<"employeeId" | "name" | "joiningDate">("employeeId");
  const [sortAsc, setSortAsc] = useState(true);

  // Profile modal state
  const [selectedProfile, setSelectedProfile] = useState<Employee | null>(null);

  // OCR process states
  const [ocrSelectedDoc, setOcrSelectedDoc] = useState<string>("nid-smart");
  const [ocrProgress, setOcrProgress] = useState(0);
  const [ocrScanning, setOcrScanning] = useState(false);
  const [ocrSuccess, setOcrSuccess] = useState(false);
  const [ocrResult, setOcrResult] = useState<any>(null);

  // RFID Mapping & Testing states
  const [rfidSelectedEmp, setRfidSelectedEmp] = useState("");
  const [rfidInputCode, setRfidInputCode] = useState("");
  const [rfidPulseLogged, setRfidPulseLogged] = useState<string[]>([]);
  const [pulseActive, setPulseActive] = useState(false);

  // Bulk Import States
  const [importText, setImportText] = useState("");
  const [parsedImportRows, setParsedImportRows] = useState<Employee[]>([]);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [importSuccessCount, setImportSuccessCount] = useState<number | null>(null);

  // Master Employee Form state variables
  const [name, setName] = useState("");
  const [banglaName, setBanglaName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [nid, setNid] = useState("");
  const [department, setDepartment] = useState("Production");
  const [branch, setBranch] = useState("Gazipur Plant");
  const [section, setSection] = useState("Computerized Flat Jacquard");
  const [line, setLine] = useState("Line-A1 (12GG Stoll)");
  const [designation, setDesignation] = useState("Jacquard Machine Operator");
  const [grade, setGrade] = useState("Grade 2 (Junior Operator)");
  const [empType, setEmpType] = useState<"Worker" | "Staff" | "Management">("Worker");
  const [salaryType, setSalaryType] = useState<"Monthly" | "Hourly" | "Piece-rate">("Monthly");
  const [gender, setGender] = useState<"Male" | "Female">("Male");
  const [rfidCard, setRfidCard] = useState("");
  const [biometricId, setBiometricId] = useState("");
  const [basicSalary, setBasicSalary] = useState(15500);
  const [joiningDate, setJoiningDate] = useState("2026-05-23");

  // Form input validation errors list
  const [formErrors, setFormErrors] = useState<string[]>([]);

  // Seed constants
  const depts = ["All", "Management", "Production", "HR & Leaves Portal", "Double Entry Ledger", "Yarn & Store Stock", "Quality Assurance & Mending"];
  const branches = ["All", "Gazipur Plant", "Dhaka HQ", "Chittagong Port"];

  // Toggle Sorting column
  function handleSort(field: "employeeId" | "name" | "joiningDate") {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  }

  // Soft delete check
  const activeEmployees = employees.filter((e) => !e.isDeleted);
  const archivedEmployees = employees.filter((e) => !!e.isDeleted);

  const displayedEmployees = (showArchived ? archivedEmployees : activeEmployees).filter((e) => {
    const matchesSearch = e.name.toLowerCase().includes(search.toLowerCase()) || 
                          e.employeeId.toLowerCase().includes(search.toLowerCase()) ||
                          e.phone.includes(search) ||
                          e.nid.includes(search);
    const matchesDept = filterDept === "All" || e.department === filterDept;
    
    // Fallback branch matches if undefined
    const empBranch = (e as any).branch || "Gazipur Plant";
    const matchesBranch = filterBranch === "All" || empBranch === filterBranch;
    return matchesSearch && matchesDept && matchesBranch;
  }).sort((a, b) => {
    const valA = a[sortField] || "";
    const valB = b[sortField] || "";
    return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
  });

  function resetForm() {
    setName("");
    setBanglaName("");
    setPhone("");
    setEmail("");
    setNid("");
    setDepartment("Production");
    setBranch("Gazipur Plant");
    setSection("Computerized Flat Jacquard");
    setLine("Line-A1 (12GG Stoll)");
    setDesignation("Jacquard Machine Operator");
    setGrade("Grade 2 (Junior Operator)");
    setEmpType("Worker");
    setSalaryType("Monthly");
    setGender("Male");
    setRfidCard("");
    setBiometricId("");
    setBasicSalary(15500);
    setJoiningDate("2026-05-23");
    setIsEditing(false);
    setActiveId("");
    setFormErrors([]);
  }

  // --- FORM VALIDATION ENGINE ---
  function validateForm(): boolean {
    const errors: string[] = [];
    if (!name.trim()) errors.push("Employee Name (English) is required.");
    if (!banglaName.trim()) errors.push("Bangla Name (বাংলা নাম) is required.");
    
    // Phone validation (Bangladesh format)
    const banglaPhoneRegex = /^(?:\+88|01)?\d{9}$/; // simple check, digit number check
    if (!phone.replace(/\s+/g, "")) {
      errors.push("Phone contact number is required.");
    } else if (phone.length < 10) {
      errors.push("Phone must be a valid Bangladeshi number (min 11 digits).");
    }

    // NID formatting validation
    if (!nid.trim()) {
      errors.push("National NID number is required.");
    } else if (nid.length !== 10 && nid.length !== 13 && nid.length !== 17) {
      errors.push("Bangladeshi NID must be 10 (Smart), 13 (Old), or 17 characters long.");
    }

    if (email.trim() && !email.includes("@")) {
      errors.push("Corporate Email pattern is invalid.");
    }

    if (basicSalary < 8000) {
      errors.push("Salary amount must comply with Minimum Wage regulations for RMG Sector (>= ৳8,000).");
    }

    setFormErrors(errors);
    return errors.length === 0;
  }

  function handleAddOrEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!validateForm()) return;

    if (isEditing) {
      const existing = employees.find(x => x.id === activeId);
      const updated: Employee = {
        ...existing,
        id: activeId,
        employeeId: existing?.employeeId || "OJ-000",
        name,
        banglaName,
        phone,
        email,
        nid,
        department,
        section,
        line,
        designation,
        grade,
        employeeType: empType,
        salaryType,
        gender,
        rfidCard,
        biometricId,
        joiningDate,
        status: existing?.status || "Active",
        basicSalary,
        houseRent: Math.round(basicSalary * 0.4),
        medicalAllowance: 2000,
        conveyance: 1500,
        foodAllowance: 2500,
        isDeleted: false
      } as Employee;
      
      // Inject branch
      (updated as any).branch = branch;

      onUpdateEmployee(updated);
      onAddAuditLog("Modify Employee Registry", "Employee Directory", `Modified parameters for employee card ${name} (ID: ${existing?.employeeId}).`);
    } else {
      const nextIdNum = employees.length + 1;
      const nextCode = `OJ-${String(nextIdNum * 4).padStart(3, "0")}`;
      const newly: Employee = {
        id: `emp-${Date.now()}`,
        employeeId: nextCode,
        name,
        banglaName,
        phone,
        email,
        nid,
        department,
        section,
        line,
        designation,
        grade,
        employeeType: empType,
        salaryType,
        gender,
        rfidCard: rfidCard || `RFID-OJ-${Date.now().toString().slice(-4)}`,
        biometricId: biometricId || `BIO-${Date.now().toString().slice(-3)}`,
        joiningDate,
        status: "Active",
        basicSalary,
        houseRent: Math.round(basicSalary * 0.4),
        medicalAllowance: 2000,
        conveyance: 1500,
        foodAllowance: 2500,
        isDeleted: false
      };
      
      (newly as any).branch = branch;

      onAddEmployee(newly);
      onAddAuditLog("Register New Employee", "Employee Directory", `Created complete profile for ${name} under ID ${nextCode}.`);
    }

    resetForm();
    setShowForm(false);
  }

  function handleTriggerEdit(e: Employee) {
    setIsEditing(true);
    setActiveId(e.id);
    setName(e.name);
    setBanglaName(e.banglaName || "");
    setPhone(e.phone);
    setEmail(e.email || "");
    setNid(e.nid || "");
    setDepartment(e.department);
    setBranch((e as any).branch || "Gazipur Plant");
    setSection(e.section || "");
    setLine(e.line || "");
    setDesignation(e.designation);
    setGrade(e.grade || "");
    setEmpType(e.employeeType);
    setSalaryType(e.salaryType);
    setGender(e.gender);
    setRfidCard(e.rfidCard || "");
    setBiometricId(e.biometricId || "");
    setBasicSalary(e.basicSalary);
    setJoiningDate(e.joiningDate);
    setShowForm(true);
  }

  // Restore Soft deleted Employee
  function handleRestoreEmployee(id: string) {
    const emp = employees.find(e => e.id === id);
    if (!emp) return;
    const restored = { ...emp, isDeleted: false, status: "Active" as const };
    onUpdateEmployee(restored);
    onAddAuditLog("Restore Employee", "Employee Directory", `Restored soft deleted worker profile: ${emp.name} (${emp.employeeId}).`);
  }

  // --- OCR SIMULATION GAME ENGINE ---
  function handleOCRStart() {
    const docData = sampleNIDDocuments.find(d => d.id === ocrSelectedDoc);
    if (!docData) return;

    setOcrScanning(true);
    setOcrProgress(15);
    setOcrSuccess(false);

    // Increment progress
    const steps = [
      { p: 40, label: "Scanning smartcard image matrix..." },
      { p: 70, label: "Recognizing Bangladesh National Election Commission OCR fonts..." },
      { p: 100, label: "Extracting metadata and date strings..." }
    ];

    steps.forEach((step, idx) => {
      setTimeout(() => {
        setOcrProgress(step.p);
        if (step.p === 100) {
          setOcrScanning(false);
          setOcrSuccess(true);
          setOcrResult(docData);
          onAddAuditLog("AI NID OCR Read", "OCR Systems", `AI successfully scanned paper card and extracted details for ${docData.nameSuffix}.`);
        }
      }, (idx + 1) * 900);
    });
  }

  function handleApplyOCRToForm() {
    if (!ocrResult) return;
    setName(ocrResult.nameSuffix);
    setBanglaName(ocrResult.nameBangla);
    setNid(ocrResult.nidNo);
    setJoiningDate(new Date().toISOString().split("T")[0]);
    // Mock Bangladeshi active SIM sequences
    const randomSuffix = Math.floor(1000000 + Math.random() * 9000000);
    setPhone("017" + randomSuffix);

    setEmpSubTab("roster");
    setShowForm(true);
    setOcrSuccess(false);
    setOcrResult(null);
  }

  // --- ZK BIOTIME SYNCHRONIZATION TESTER ---
  function pulseRFIDTester() {
    if (!rfidInputCode.trim()) return;
    setPulseActive(true);
    
    setTimeout(() => {
      setPulseActive(false);
      // Check if code is already registered
      const matchedEmp = employees.find(e => e.biometricId === rfidInputCode);
      const timestamp = new Date().toLocaleTimeString();
      let msg = "";

      if (matchedEmp) {
        msg = `[${timestamp}] 🟢 FOUND: Biometric ID '${rfidInputCode}' matches employee ${matchedEmp.name} (Code: ${matchedEmp.employeeId})`;
      } else {
        msg = `[${timestamp}] 🔴 UNLINKED: Biometric ID '${rfidInputCode}' is free. Link it to a worker profile.`;
      }

      setRfidPulseLogged([msg, ...rfidPulseLogged]);
      onAddAuditLog("ZK BioTime Log Sync", "Biometrics Dev Node", `Pulsed biometric ID registration check for code '${rfidInputCode}'.`);
    }, 800);
  }

  function handleMapRFIDToEmployee(e: React.FormEvent) {
    e.preventDefault();
    if (!rfidSelectedEmp || !rfidInputCode.trim()) return;

    const empObj = employees.find(x => x.id === rfidSelectedEmp);
    if (!empObj) return;

    const updated: Employee = {
      ...empObj,
      biometricId: rfidInputCode
    };

    onUpdateEmployee(updated);
    onAddAuditLog("Bind ZK Biometric ID", "Employee Directory", `Linked ZK BioTime device employee ID '${rfidInputCode}' to ${empObj.name}.`);
    setRfidInputCode("");
    setRfidSelectedEmp("");
    alert(`Success: ZK BioTime ID ${rfidInputCode} bound to ${empObj.name}`);
  }

  // --- BULK PREVIEW BULK IMPORT ENGINE ---
  function handleValidateImport() {
    if (!importText.trim()) return;
    setImportErrors([]);
    setParsedImportRows([]);
    setImportSuccessCount(null);

    try {
      // Allow clean JSON format array
      const parsed = JSON.parse(importText);
      if (!Array.isArray(parsed)) {
        setImportErrors(["CSV/JSON Import must declare a structured array of employee objects."]);
        return;
      }

      const tempRows: Employee[] = [];
      const errors: string[] = [];

      parsed.forEach((row: any, idx: number) => {
        const itemNum = idx + 1;
        if (!row.name) errors.push(`Row #${itemNum}: 'name' is mandatory.`);
        if (!row.nid) errors.push(`Row #${itemNum}: 'nid' national digit sequencing is missing.`);
        
        // Duplicate NID inside existing list trigger check
        if (employees.some(e => e.nid === row.nid)) {
          errors.push(`Row #${itemNum}: NID '${row.nid}' conflicts with an existing registered employee.`);
        }

        const validRow: Employee = {
          id: `emp-import-${Date.now()}-${idx}`,
          employeeId: row.employeeId || `OJ-IMP-${String(idx * 7 + 40).padStart(3, "0")}`,
          name: row.name || "Unknown Worker",
          banglaName: row.banglaName || "অজ্ঞাতনামা কর্মী",
          phone: row.phone || "01700000000",
          nid: row.nid || "",
          department: row.department || "Production",
          section: row.section || "Knitting Roster Plan",
          designation: row.designation || "Sweater Assembly Helper",
          employeeType: row.employeeType || "Worker",
          salaryType: row.salaryType || "Monthly",
          gender: row.gender || "Male",
          rfidCard: row.rfidCard || `RFID-IMP-${idx * 14 + 10}`,
          biometricId: row.biometricId || `BIO-IMP-${idx + 102}`,
          joiningDate: row.joiningDate || "2026-05-23",
          status: "Active" as const,
          basicSalary: Number(row.basicSalary) || 12000,
          houseRent: Math.round((Number(row.basicSalary) || 12000) * 0.4),
          medicalAllowance: 2000,
          conveyance: 1500,
          foodAllowance: 2500,
          isDeleted: false,
          email: row.email || "",
          line: row.line || "Line-A1 (12GG Stoll)",
          grade: row.grade || "Grade 2"
        };

        tempRows.push(validRow);
      });

      if (errors.length > 0) {
        setImportErrors(errors);
      } else {
        setParsedImportRows(tempRows);
      }

    } catch (e: any) {
      setImportErrors([`Failed to parse textual boundaries. Check bracket nesting. Error details: ${e.message}`]);
    }
  }

  function handleExecuteBulkImport() {
    if (parsedImportRows.length === 0) return;
    
    parsedImportRows.forEach(row => {
      onAddEmployee(row);
    });

    onAddAuditLog("Bulk Import Roster", "Employee Directory", `Integrated ${parsedImportRows.length} workers via CSV/JSON import.`);
    setImportSuccessCount(parsedImportRows.length);
    setParsedImportRows([]);
    setImportText("");
  }

  // Output custom bulk JSON sample for the user
  const sampleImportJSON = JSON.stringify([
    {
      "name": "FARHANA AKTER",
      "banglaName": "ফারহানা আক্তার",
      "phone": "01827615219",
      "nid": "5500214892",
      "department": "Production",
      "designation": "Mending Helper",
      "basicSalary": 12800
    },
    {
      "name": "MD. MEHEDI HASAN",
      "banglaName": "মোঃ মেহেদী হাসান",
      "phone": "01912481924",
      "nid": "1992261541029",
      "department": "Production",
      "designation": "Plat Knitter Operator",
      "basicSalary": 14900
    }
  ], null, 2);

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      
      {/* Tab select Header inside Employee directory */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-3 border-b border-slate-150 dark:border-slate-800 gap-4">
        <div className="flex items-center space-x-2">
          <div className="p-1 text-slate-100 bg-[#4f46e5] rounded-lg shadow-sm">
            <Scan size={16} />
          </div>
          <div>
            <h3 className="font-display font-extrabold text-sm text-slate-800 dark:text-white uppercase tracking-tight">
              OTTOMASS JACQUARD HR registry
            </h3>
            <p className="text-[11px] text-slate-500 font-sans">
              Control HR metrics, soft deleted archives, proximity cards, and automated Bangladesh NID scanning.
            </p>
          </div>
        </div>

        {/* Tab selection */}
        <div className="flex space-x-1 p-1 bg-slate-100 dark:bg-slate-900 rounded-lg max-w-max border border-slate-200 dark:border-slate-850">
          {[
            { id: "roster", title: "Roster Registry", icon: ClipboardCheck },
            { id: "ocr", title: "Smart NID OCR Scan", icon: UploadCloud },
            { id: "rfid", title: "ZK BioTime Sync", icon: Scan },
            { id: "import", title: "Bulk CSV/JSON Import", icon: FileSpreadsheet }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setEmpSubTab(tab.id as any);
                setFormErrors([]);
                setImportSuccessCount(null);
              }}
              className={`flex items-center space-x-1 px-3 py-1.5 rounded-md text-[11px] font-bold transition-all ${
                empSubTab === tab.id 
                  ? "bg-white dark:bg-slate-800 text-[#4f46e5] dark:text-emerald-400 shadow-sm"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-100"
              }`}
            >
              <tab.icon size={12} />
              <span>{tab.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* RENDER ACTIVE EMB-SUBTAB */}

      {empSubTab === "roster" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main employee listing section */}
          <div className="lg:col-span-2 space-y-4">
            
            {/* Table Controller bar with Search and Archived toggle */}
            <div className="bg-slate-50 dark:bg-[#111827]/40 border border-slate-205 dark:border-slate-850 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
              <div className="flex flex-1 gap-2">
                <div className="relative flex-1">
                  <Search size={14} className="absolute left-3 top-3.5 text-slate-400" />
                  <input 
                    type="text" 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search master list by Employee Name, O-J Code, NID or Phone..."
                    className="w-full pl-9 pr-3 py-2.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white rounded-lg focus:outline-hidden"
                  />
                </div>
                
                {/* Advanced departments and branch selective options */}
                <select 
                  value={filterDept}
                  onChange={(e) => setFilterDept(e.target.value)}
                  className="bg-white dark:bg-slate-900 p-2 text-[11px] border border-slate-200 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-300"
                >
                  <option value="All">All Departments</option>
                  <option value="Production">Production</option>
                  <option value="Management">Management</option>
                  <option value="HR & Compliance">HR & Compliance</option>
                  <option value="Finance">Finance</option>
                  <option value="Stores">Stores</option>
                </select>
              </div>

              {/* Archived Toggle */}
              <button 
                onClick={() => setShowArchived(!showArchived)}
                className={`px-3 py-2 text-xs font-bold rounded-lg border transition flex items-center space-x-1 ${
                  showArchived 
                    ? "bg-rose-50 text-rose-600 border-rose-200" 
                    : "bg-white dark:bg-slate-900 text-slate-500 border-slate-200 dark:border-slate-800"
                }`}
              >
                <span>{showArchived ? "Viewing: Suspended Workers" : "Viewing: Active Headcount"}</span>
              </button>
            </div>

            {/* List Table with Header Sorts */}
            <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-850 p-5 rounded-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs divide-y divide-slate-100 dark:divide-slate-805">
                  <thead>
                    <tr className="text-slate-400 dark:text-slate-500 text-[10px] uppercase font-bold tracking-wider">
                      <th className="py-2.5 cursor-pointer" onClick={() => handleSort("employeeId")}>
                        <span className="flex items-center space-x-1">
                          <span>OJ ID</span>
                          {sortField === "employeeId" && (sortAsc ? <ArrowUp size={10} /> : <ArrowDown size={10} />)}
                        </span>
                      </th>
                      <th className="py-2.5 cursor-pointer" onClick={() => handleSort("name")}>
                        <span className="flex items-center space-x-1">
                          <span>Name & Demographics</span>
                          {sortField === "name" && (sortAsc ? <ArrowUp size={10} /> : <ArrowDown size={10} />)}
                        </span>
                      </th>
                      <th className="py-2.5 font-bold">Structural mapping</th>
                      <th className="py-2.5 font-bold">Biometrics keys</th>
                      <th className="py-2.5 text-right cursor-pointer">Salary Parameters</th>
                      <th className="py-1 text-center">Desk Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-805 font-medium text-slate-700 dark:text-slate-300">
                    {displayedEmployees.map((e) => (
                      <tr key={e.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="py-3 font-mono font-bold text-[#4f46e5] dark:text-emerald-400">{e.employeeId}</td>
                        <td className="py-3">
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white">{e.name}</p>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500">{e.banglaName}</p>
                            <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-1 py-0.5 rounded font-mono">{e.nid}</span>
                          </div>
                        </td>
                        <td className="py-3">
                          <p className="font-semibold text-slate-700 dark:text-slate-300">{e.department}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{e.designation} • {e.line || "Line-A1"}</p>
                        </td>
                        <td className="py-3">
                          <div className="space-y-1">
                            <span className="inline-flex items-center space-x-1 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 font-mono text-[10px] px-1.5 py-0.5 rounded border border-slate-202 dark:border-slate-800">
                              <Scan size={9} className="text-emerald-500" />
                              <span>BioTime Link: {e.biometricId || "Unassigned"}</span>
                            </span>
                          </div>
                        </td>
                        <td className="py-3 text-right">
                          <p className="font-bold text-slate-900 dark:text-white">৳{(e.basicSalary || 15500).toLocaleString()}</p>
                          <p className="text-[9px] text-slate-400 dark:text-slate-500 font-mono">Month pay model</p>
                        </td>
                        <td className="py-3 text-center">
                          {showArchived ? (
                            <button 
                              onClick={() => handleRestoreEmployee(e.id)}
                              className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded text-[10px] flex items-center space-x-1 shadow-xs border border-emerald-250 ml-auto"
                            >
                              <RefreshCw size={9} />
                              <span>Restore Work</span>
                            </button>
                          ) : (
                            <div className="flex items-center justify-center space-x-1">
                              <button 
                                onClick={() => setSelectedProfile(e)}
                                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-blue-500 rounded"
                                title="View detailed profile card"
                              >
                                <Eye size={12} />
                              </button>
                              <button 
                                onClick={() => handleTriggerEdit(e)}
                                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 rounded"
                              >
                                <Edit3 size={12} />
                              </button>
                              <button 
                                onClick={() => {
                                  // Set isDeleted: true
                                  const updated = { ...e, isDeleted: true, status: "Resigned" as const };
                                  onUpdateEmployee(updated);
                                  onAddAuditLog("Soft Delete Employee", "Employee Directory", `Soft deleted and archived employee ${e.name} (${e.employeeId}).`);
                                }}
                                className="p-1 hover:bg-rose-50 text-[#f43f5e] rounded"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                    {displayedEmployees.length === 0 && (
                      <tr>
                        <td colSpan={6} className="text-center py-10 font-bold text-slate-300">
                          No matching employees located in this catalog.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Form Create/Edit Right sector drawer with validation feedback */}
          <div className="bg-slate-50 dark:bg-slate-950 border border-slate-205 dark:border-slate-850 p-5 rounded-2xl h-fit">
            <div className="flex items-center justify-between pb-3 border-b border-indigo-100 dark:border-slate-850">
              <h4 className="font-display font-black text-xs uppercase text-slate-450 tracking-wider flex items-center space-x-1">
                <span>{isEditing ? "Modify profile parameters" : "Complete profiling file"}</span>
              </h4>
              {(showForm || isEditing) && (
                <button 
                  onClick={() => { resetForm(); setShowForm(false); }}
                  className="text-[10px] uppercase font-bold text-rose-500"
                >
                  Close Form
                </button>
              )}
            </div>

            {formErrors.length > 0 && (
              <div className="bg-rose-50 dark:bg-rose-950/20 text-rose-800 dark:text-rose-450 p-2.5 rounded-lg text-[10px] mt-2 space-y-0.5">
                <p className="font-bold">Errors:</p>
                {formErrors.map((err, i) => <p key={i}>• {err}</p>)}
              </div>
            )}

            {showForm || isEditing ? (
              <form onSubmit={handleAddOrEdit} className="space-y-4 pt-3.5 text-xs font-sans">
                
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Worker English Name</label>
                  <input 
                    type="text" required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. MD. MEHEDI HASAN"
                    className="w-full border border-slate-220 dark:border-slate-800 rounded-lg p-2.5 bg-white dark:bg-slate-900 text-slate-850 dark:text-slate-100 placeholder-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Bangla Name (বাংলা নাম/রিপোর্ট)</label>
                  <input 
                    type="text" required
                    value={banglaName}
                    onChange={(e) => setBanglaName(e.target.value)}
                    placeholder="যেমনঃ মোঃ মেহেদী হাসান"
                    className="w-full border border-slate-220 dark:border-slate-800 rounded-lg p-2.5 bg-white dark:bg-slate-900 text-slate-850 dark:text-slate-100 placeholder-slate-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Mobile contact</label>
                    <input 
                      type="text" required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="01712xxxxxx"
                      className="w-full border border-slate-220 dark:border-slate-800 rounded-lg p-2 bg-white dark:bg-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">National NID NO</label>
                    <input 
                      type="text" required
                      value={nid}
                      onChange={(e) => setNid(e.target.value)}
                      placeholder="10 or 17 digits"
                      className="w-full border border-slate-220 dark:border-slate-800 rounded-lg p-2 bg-white dark:bg-slate-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Company / Unit</label>
                    <select 
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                      className="w-full border border-slate-200 dark:border-slate-800 rounded-lg p-2 bg-transparent text-slate-600"
                    >
                      <option value="OTTOMASS JACQUARD">OTTOMASS JACQUARD</option>
                      <option value="Gazipur Plant">Gazipur Unit 1</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">RMG Department</label>
                    <select 
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full border border-slate-200 dark:border-slate-800 rounded-lg p-2 bg-transparent text-slate-600"
                    >
                      <option value="Production">Production & Knitting</option>
                      <option value="Quality Assurance & Mending">QA & Mending</option>
                      <option value="HR & Leaves Portal">HR & Leaves</option>
                      <option value="Double Entry Ledger">Finance & Audit</option>
                      <option value="Yarn & Store Stock">Stores</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Designation</label>
                    <input 
                      type="text" required
                      value={designation}
                      onChange={(e) => setDesignation(e.target.value)}
                      placeholder="e.g. Master Knitter OPERATOR"
                      className="w-full border border-slate-220 dark:border-slate-800 rounded-lg p-2 bg-white dark:bg-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Worker Wage Grade</label>
                    <select 
                      value={grade}
                      onChange={(e) => setGrade(e.target.value)}
                      className="w-full border border-slate-200 dark:border-slate-800 rounded-lg p-2 bg-transparent text-slate-600"
                    >
                      <option value="Grade 1 (Senior Expert Operator)">Grade 1 (Senior)</option>
                      <option value="Grade 2 (Junior Operator)">Grade 2 (Junior)</option>
                      <option value="Grade 3 (Knitter Helper)">Grade 3 (Helper)</option>
                      <option value="Grade Alpha (Senior Staff)">Grade Alpha (Staff)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Basic Base Salary (৳)</label>
                    <input 
                      type="number" required
                      value={basicSalary}
                      onChange={(e) => setBasicSalary(Number(e.target.value))}
                      className="w-full border border-slate-220 dark:border-slate-800 rounded-lg p-2 bg-white dark:bg-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Joining Date</label>
                    <input 
                      type="date" required
                      value={joiningDate}
                      onChange={(e) => setJoiningDate(e.target.value)}
                      className="w-full border border-slate-220 dark:border-slate-800 rounded-lg p-2 bg-white dark:bg-slate-900 text-slate-500 font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Biometric ID (ZK BioTime Registration Key)</label>
                  <input 
                    type="text"
                    value={biometricId}
                    onChange={(e) => setBiometricId(e.target.value)}
                    placeholder="e.g. BIO-129"
                    className="w-full border border-slate-220 dark:border-slate-800 rounded-lg p-2 bg-white dark:bg-slate-900 font-mono text-xs"
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full bg-[#10b981] hover:bg-emerald-600 font-bold text-white uppercase text-xs py-3 rounded-lg shadow-sm transition"
                >
                  {isEditing ? "Commit changes" : "Confirm Profile"}
                </button>
              </form>
            ) : (
              <div className="text-center py-12">
                <UserCheck size={32} className="mx-auto text-slate-300 animate-pulse mb-2" />
                <p className="font-heading font-extrabold text-[11px] text-slate-400 uppercase tracking-widest leading-loose">
                  No Active Formulation Panel
                </p>
                <button 
                  onClick={() => setShowForm(true)}
                  className="mt-4 px-4 py-2 bg-[#4f46e5] text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition"
                >
                  Add Custom Employee Form
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUBTAB: NID SMART UPLOAD & OCR SCANNER */}
      {empSubTab === "ocr" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          
          {/* Visual card showing upload simulated environment */}
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-850 p-6 rounded-2xl space-y-5">
            <div className="text-left">
              <h4 className="font-display font-extrabold text-sm text-[#4f46e5] dark:text-emerald-450 uppercase flex items-center space-x-1.5">
                <UploadCloud size={16} />
                <span>Smart NID Scanner & OCR Extractor</span>
              </h4>
              <p className="font-sans text-xs text-slate-550 dark:text-slate-400 mt-1 leading-normal">
                Upload a clear front-side photograph of the employee's National ID Card (NID). Our AI Scanner will automatically read card details, query verify and populate the register employee profile box.
              </p>
            </div>

            {/* Custom Interactive Doc Picker */}
            <div className="space-y-3">
              <label className="block text-[10.5px] text-slate-400 font-black uppercase">
                Choose NID document template to scan:
              </label>
              <div className="grid grid-cols-2 gap-3">
                {sampleNIDDocuments.map((doc) => (
                  <button
                    key={doc.id}
                    onClick={() => {
                      setOcrSelectedDoc(doc.id);
                      setOcrSuccess(false);
                      setOcrResult(null);
                    }}
                    className={`p-3.5 border text-left rounded-xl transition ${
                      ocrSelectedDoc === doc.id 
                        ? "bg-slate-50 dark:bg-slate-900 border-[#4f46e5] dark:border-emerald-500 shadow-xs" 
                        : "border-slate-200 dark:border-slate-800 hover:bg-slate-50/50"
                    }`}
                  >
                    <p className="font-bold text-[11px] text-slate-800 dark:text-white uppercase">{doc.type}</p>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">Mock ID: {doc.nidNo}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Drag Drop simulated frame */}
            <div className="border-2 border-dashed border-slate-202 dark:border-slate-800 rounded-2xl p-7 text-center bg-slate-50/50 dark:bg-slate-900/30 flex flex-col items-center justify-center">
              <Scan size={36} className={`text-slate-300 ${ocrScanning ? "animate-spin text-[#4f46e5]" : ""}`} />
              <p className="font-sans font-extrabold text-[11px] text-slate-700 dark:text-slate-200 mt-3 uppercase tracking-wide">
                Drag front-side image scan here
              </p>
              <p className="text-[9.5px] text-slate-400 mt-1">
                Formats: JPG, PNG high definition scans.
              </p>
              
              {/* Scan simulation button */}
              <button 
                type="button"
                onClick={handleOCRStart}
                disabled={ocrScanning}
                className="mt-4 px-4 py-2 bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-700 text-white font-bold rounded-lg text-[10.5px] transition flex items-center space-x-1"
              >
                {ocrScanning ? "AI SmartScan Active..." : "Trigger AI SmartScan"}
              </button>
            </div>

            {/* Scanning Progress Bar */}
            {ocrScanning && (
              <div className="space-y-1 mt-4">
                <div className="flex justify-between items-center text-[10px] font-mono text-indigo-500 font-bold">
                  <span>Running National Identity Verification...</span>
                  <span>{ocrProgress}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-indigo-600 h-1.5 rounded-full transition-all duration-300" style={{ width: `${ocrProgress}%` }}></div>
                </div>
              </div>
            )}
          </div>

          {/* OCR RESULTS BOX AND FILL DELEGATOR */}
          <div className="bg-[#111827] border border-slate-800 text-slate-300 p-6 rounded-2xl h-fit shadow-lg relative overflow-hidden">
            <div className="absolute right-0 top-0 w-24 h-24 bg-indigo-500/10 blur-xl rounded-full"></div>
            
            <h4 className="font-display font-semibold text-xs tracking-widest text-slate-500 uppercase mb-4">
              OCR Verification Transcripts Terminal
            </h4>

            {ocrSuccess && ocrResult ? (
              <div className="space-y-4 font-mono text-xs">
                
                <div className="p-3.5 bg-indigo-950/40 border border-indigo-900/30 rounded-xl text-indigo-300 leading-normal">
                  <p className="font-bold mb-1">Verify Signature Match: OK</p>
                  <p className="text-[10.5px]">Extracting text data parameters succeeded using fine-tuned RMG ID layout modeling.</p>
                </div>

                <div className="grid grid-cols-2 gap-3 py-2 border-y border-slate-800 text-[11px]">
                  <div>
                    <span className="text-slate-550 block text-[9.5px] uppercase">Name (EN)</span>
                    <span className="text-white font-bold text-xs">{ocrResult.nameSuffix}</span>
                  </div>
                  <div>
                    <span className="text-slate-550 block text-[9.5px] uppercase">নাম (বাংলা)</span>
                    <span className="text-emerald-400 font-bold text-xs">{ocrResult.nameBangla}</span>
                  </div>
                  <div>
                    <span className="text-slate-550 block text-[9.5px] uppercase">NID Number</span>
                    <span className="text-indigo-400 font-bold">{ocrResult.nidNo}</span>
                  </div>
                  <div>
                    <span className="text-slate-550 block text-[9.5px] uppercase">Date of Birth</span>
                    <span className="font-semibold text-slate-200">{ocrResult.bday}</span>
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <button 
                    onClick={() => { setOcrSuccess(false); setOcrResult(null); }}
                    className="px-3.5 py-1.5 border border-slate-800 hover:border-slate-700 rounded text-slate-400"
                  >
                    Clear Results
                  </button>
                  <button 
                    onClick={handleApplyOCRToForm}
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded flex items-center space-x-1"
                  >
                    <Check size={11} />
                    <span>Apply details to Master Form</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-20 flex flex-col items-center justify-center">
                <Scan size={44} className="text-slate-400 dark:text-slate-600 animate-pulse mb-3" />
                <p className="font-semibold text-slate-500">
                  Awaiting scan pulse activation...
                </p>
                <p className="text-[10px] text-slate-400 mt-1.5">
                  Select a document on the left and trigger custom AI SmartScan.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUBTAB: BIOMETRIC PROXIMITY MAPPING & TESTER */}
      {empSubTab === "rfid" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          
          {/* Card Reader scan simulator */}
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-850 p-6 rounded-2xl space-y-5">
            <div className="text-left">
              <h4 className="font-display font-extrabold text-sm text-[#4f46e5] dark:text-emerald-450 uppercase flex items-center space-x-1.5">
                <Radio size={16} />
                <span>ZK BioTime Device ID Simulator & Sync Console</span>
              </h4>
              <p className="font-sans text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-1">
                Enter a Biometric Device registration number and simulate sensor detection pulse to verify active sync with the main ZK BioTime 8.5 database engine.
              </p>
            </div>

            {/* Simulator input console */}
            <div className="space-y-4">
              <div>
                <label className="block text-[10.5px] text-slate-400 font-bold uppercase mb-1">
                  Biometric Punch Card ID (From BioTime Web Port)
                </label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={rfidInputCode}
                    onChange={(e) => setRfidInputCode(e.target.value)}
                    placeholder="e.g. BIO-GZP-884"
                    className="flex-1 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 bg-transparent font-mono text-xs focus:outline-hidden text-slate-800 dark:text-slate-200"
                  />
                  <button 
                    onClick={pulseRFIDTester}
                    disabled={pulseActive}
                    className="bg-[#0ea5e9] text-white px-4 py-2 text-xs font-bold rounded-lg transition"
                  >
                    {pulseActive ? "Querying ADMS..." : "Pulse Biometric Sync"}
                  </button>
                </div>
              </div>

              {/* RFID Mapping Form */}
              <form onSubmit={handleMapRFIDToEmployee} className="pt-4 border-t border-slate-100 dark:border-slate-850 space-y-3 font-sans text-xs">
                <h5 className="font-bold text-[11px] text-slate-400 uppercase tracking-widest mb-1">
                  Biometric ID Mapping Link Tool
                </h5>

                <div>
                  <label className="block text-[10px] text-slate-400 font-black mb-1">SELECT FACTORY EMPLOYEE</label>
                  <select 
                    value={rfidSelectedEmp}
                    onChange={(e) => setRfidSelectedEmp(e.target.value)}
                    className="w-full border border-slate-200 dark:border-slate-800 rounded-lg p-2 bg-transparent text-slate-600 dark:text-slate-400 focus:outline-hidden"
                  >
                    <option value="">-- Choose employee to link --</option>
                    {employees.filter(e => !e.isDeleted).map(e => (
                      <option key={e.id} value={e.id}>{e.name} (Code: {e.employeeId} • Biometric ID: {e.biometricId})</option>
                    ))}
                  </select>
                </div>

                <button 
                  type="submit" 
                  disabled={!rfidInputCode || !rfidSelectedEmp}
                  className="w-full bg-[#4f46e5] text-white py-2 font-bold rounded-lg text-xs hover:bg-indigo-700 transition"
                >
                  Link Biometric ID Code
                </button>
              </form>
            </div>
          </div>

          {/* Diagnostic logs reader */}
          <div className="bg-[#111827] border border-slate-800 p-6 rounded-2xl h-fit text-slate-350 min-h-[340px]">
            <h4 className="font-display text-[10px] font-bold tracking-widest uppercase text-slate-500 mb-4 pb-2 border-b border-slate-800">
              Sensor Terminal Logging Registers
            </h4>

            <div className="space-y-2 max-h-[250px] overflow-y-auto font-mono text-[11px] leading-relaxed">
              {rfidPulseLogged.map((log, index) => (
                <div key={index} className="p-2 border-b border-slate-900 last:border-0 hover:bg-slate-900/50">
                  {log}
                </div>
              ))}
              {rfidPulseLogged.length === 0 && (
                <p className="text-center py-10 text-slate-600">
                  No scan pulse events tracked yet. Enter a card code and click "Pulse Card Sensor" to start.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB: BULK PORTERS */}
      {empSubTab === "import" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          
          {/* Parser console */}
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-850 p-6 rounded-2xl space-y-4">
            <div className="text-left">
              <h4 className="font-display font-extrabold text-sm text-[#4f46e5] uppercase flex items-center space-x-1.5">
                <FileSpreadsheet size={16} className="text-emerald-500" />
                <span>Bulk CSV/JSON Importer</span>
              </h4>
              <p className="font-sans text-xs text-slate-500 leading-normal mt-1">
                Paste structured roster array parameters in the box below and execute valid imports directly into OTTOMASS main database states.
              </p>
            </div>

            {/* Interactive textarea */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-[10.5px] font-bold text-slate-400">
                <span>PASTE JSON LOG ARRAY:</span>
                <button 
                  onClick={() => setImportText(sampleImportJSON)}
                  className="text-indigo-600 hover:underline hover:text-indigo-700"
                >
                  Load Sample Seed template
                </button>
              </div>

              <textarea 
                rows={9}
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder="[ { 'name': '...' } ]"
                className="w-full border border-slate-200 dark:border-slate-800 rounded-xl p-3 bg-slate-50 dark:bg-slate-900 font-mono text-[10.5px] leading-relaxed focus:outline-hidden focus:ring-1 focus:ring-slate-350"
              />
            </div>

            <button 
              type="button"
              onClick={handleValidateImport}
              className="w-full bg-slate-900 dark:bg-emerald-600 text-white font-bold py-2.5 rounded-lg text-xs"
            >
              Run Row parser validation checks
            </button>
          </div>

          {/* Validation analysis console list */}
          <div className="space-y-4 font-sans text-xs">
            <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-850 p-5 rounded-2xl">
              <h4 className="font-display font-black text-[10px] text-slate-400 uppercase tracking-widest mb-3">
                Pre-Execution Import Validator Checklist
              </h4>

              {/* Error checklists */}
              {importErrors.length > 0 && (
                <div className="bg-rose-50 dark:bg-rose-950/20 text-rose-800 dark:text-rose-400 p-3.5 rounded-xl border border-rose-250 mb-3 space-y-1 text-[11px]">
                  <p className="font-extrabold flex items-center space-x-1">
                    <AlertCircle size={12} />
                    <span>Import checks caught conflicting entries:</span>
                  </p>
                  {importErrors.map((err, i) => <p key={i}>• {err}</p>)}
                </div>
              )}

              {/* Successful result counts */}
              {importSuccessCount !== null && (
                <div className="bg-emerald-50 dark:bg-emerald-955/20 text-emerald-800 dark:text-emerald-400 p-3.5 rounded-xl border border-emerald-250 mb-3 text-[11px] font-bold">
                  🟢 Integration Successful: Added {importSuccessCount} RMG sweat plant worker profiles directly to active headcounts.
                </div>
              )}

              {/* Previews of valid parsed row records */}
              {parsedImportRows.length > 0 ? (
                <div className="space-y-3">
                  <div className="p-3 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400 rounded-xl font-bold flex justify-between items-center">
                    <span>Parsed {parsedImportRows.length} valid worker records. Ready to load!</span>
                    <button 
                      onClick={handleExecuteBulkImport}
                      className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded"
                    >
                      Confirm Bulk Save Integration
                    </button>
                  </div>

                  <div className="max-h-[180px] overflow-y-auto space-y-1">
                    {parsedImportRows.map((row, i) => (
                      <div key={i} className="p-2 border border-slate-200 rounded bg-slate-50 flex items-center justify-between text-[11px]">
                        <div>
                          <p className="font-bold text-slate-800">{row.name}</p>
                          <p className="text-[10px] text-slate-400">{row.department} • {row.designation}</p>
                        </div>
                        <span className="font-mono font-bold text-emerald-600">৳{row.basicSalary}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-10 text-slate-400">
                  <ClipboardCheck size={32} className="mx-auto text-slate-300 animate-pulse mb-2" />
                  <p className="font-bold text-xs">Awaiting row parsing validation checks...</p>
                  <p className="text-[10px] text-slate-400 mt-1 max-w-xs mx-auto">
                    Seed the template, run the parsed rules checks, and we will display the verified preview listing rows here.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* DETAILED PROFILE CARD VIEW MODAL */}
      {selectedProfile && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 p-6 rounded-2xl max-w-lg w-full space-y-5 animate-fade-in text-slate-800 dark:text-slate-100 shadow-xl max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-indigo-50 border flex items-center justify-center font-bold text-indigo-600 text-sm">
                  {selectedProfile.name[0]}
                </div>
                <div>
                  <h4 className="font-display font-black text-sm text-slate-900 dark:text-white uppercase">
                    {selectedProfile.name}
                  </h4>
                  <p className="font-mono text-[10.5px] text-[#4f46e5] dark:text-emerald-400 font-bold">{selectedProfile.employeeId}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedProfile(null)}
                className="px-2.5 py-1 text-slate-400 hover:text-rose-500 font-black text-xs uppercase"
              >
                Close Profile
              </button>
            </div>

            {/* Demographics grid */}
            <div className="grid grid-cols-2 gap-4 text-xs font-sans">
              <div>
                <span className="block text-[10px] text-slate-400 uppercase font-black tracking-wider">বাংলা নাম / Bangla Name</span>
                <span className="text-slate-700 dark:text-slate-200 font-bold">{selectedProfile.banglaName || "N/A"}</span>
              </div>
              <div>
                <span className="block text-[10px] text-slate-400 uppercase font-black tracking-wider">National ID Card (NID)</span>
                <span className="text-slate-700 dark:text-slate-200 font-bold font-mono">{selectedProfile.nid}</span>
              </div>
              <div>
                <span className="block text-[10px] text-slate-400 uppercase font-black tracking-wider">Phone contact</span>
                <span className="text-slate-700 dark:text-slate-200 font-bold">{selectedProfile.phone}</span>
              </div>
              <div>
                <span className="block text-[10px] text-slate-400 uppercase font-black tracking-wider">Company / Unit</span>
                <span className="text-indigo-600 dark:text-emerald-400 font-bold">{(selectedProfile as any).branch || "OTTOMASS JACQUARD"}</span>
              </div>
              <div>
                <span className="block text-[10px] text-slate-400 uppercase font-black tracking-wider">RMG Department Mapping</span>
                <span className="text-slate-700 dark:text-slate-200 font-bold">{selectedProfile.department} ({selectedProfile.designation})</span>
              </div>
              <div>
                <span className="block text-[10px] text-slate-400 uppercase font-black tracking-wider">Floor line</span>
                <span className="text-slate-700 dark:text-slate-200 font-bold">{selectedProfile.line || "Line-A1 (12GG Stoll)"}</span>
              </div>
              <div>
                <span className="block text-[10px] text-slate-400 uppercase font-black tracking-wider">ZK BioTime Sync Status</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold font-mono text-[10.5px] bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-transparent px-1.5 py-0.5 rounded">Linked ({selectedProfile.biometricId || "BIO-UN-00"})</span>
              </div>
            </div>

            {/* Allowance pay breakdown breakdown */}
            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-150 dark:border-slate-850 text-xs">
              <h5 className="font-black text-[10px] text-slate-400 uppercase tracking-widest mb-2 pb-1 border-b">
                Employee Allowance Breakdown Policy
              </h5>
              <div className="space-y-1.5 font-sans font-medium text-slate-600 dark:text-slate-300">
                <div className="flex justify-between">
                  <span>Basic Core Salary (Minimum Pay Grade):</span>
                  <span className="font-bold text-slate-900 dark:text-white font-mono">৳{selectedProfile.basicSalary.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>House Rent support allowance (40%):</span>
                  <span>৳{Math.round(selectedProfile.basicSalary * 0.4).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>Medical coverage allowance (fixed):</span>
                  <span>৳2,000</span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>Conveyance daily allowance (fixed):</span>
                  <span>৳1,500</span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>Food coverage support (fixed):</span>
                  <span>৳2,500</span>
                </div>
                <div className="flex justify-between pt-1.5 border-t text-sm font-extrabold text-slate-900 dark:text-white">
                  <span>Estimated Total gross paycheck:</span>
                  <span className="text-indigo-600 dark:text-emerald-400">৳{Math.round(selectedProfile.basicSalary + (selectedProfile.basicSalary * 0.4) + 6000).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Modal actions */}
            <div className="flex gap-2 justify-end pt-2 border-t">
              <button 
                onClick={() => setSelectedProfile(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded font-bold uppercase text-[11px]"
              >
                Done
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
