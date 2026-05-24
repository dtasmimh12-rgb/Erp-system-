import React, { useState } from "react";
import { 
  Building2, GitBranch, Layers, Grid3X3, Milestone, Award, Sliders, Clock, Lock, 
  Plus, Edit2, Trash2, RotateCcw, Search, ArrowUp, ArrowDown, Check, AlertCircle, Eye
} from "lucide-react";
import { 
  Branch, Department, Section, Line, Designation, Grade, Shift, UserRolePermission 
} from "../types";

interface Phase1MasterSetupProps {
  isDark: boolean;
  lang: "EN" | "BN";
  onAddAuditLog: (action: string, target: string, details: string) => void;
}

// Concrete Seed Data for OTTOMASS JACQUARD (Gazipur Plant)
const initialBranches: Branch[] = [
  { id: "br-1", name: "Gazipur Knitting & Sewing Plant", code: "GZP-MAIN", address: "Plot B-14, BSCIC Industrial Area, Konabari, Gazipur", status: "Active", isDeleted: false },
  { id: "br-2", name: "Dhaka Head Office", code: "DHK-HQ", address: "House 45, Road 11, Banani, Dhaka-1213", status: "Active", isDeleted: false },
  { id: "br-3", name: "Chittagong Warehouse & Port Hub", code: "CTG-PORT", address: "CEPZ, Halishahar, Chittagong", status: "Inactive", isDeleted: false }
];

const initialDepartments: Department[] = [
  { id: "dept-1", name: "Production & Knitting", code: "KNIT-DEPT", branchId: "br-1", status: "Active", isDeleted: false },
  { id: "dept-2", name: "Quality Assurance & Mending", code: "QA-DEPT", branchId: "br-1", status: "Active", isDeleted: false },
  { id: "dept-3", name: "HR, Admin & Lefts Management", code: "HR-DEPT", branchId: "br-2", status: "Active", isDeleted: false },
  { id: "dept-4", name: "Finance & Double Entry Accounts", code: "FIN-DEPT", branchId: "br-2", status: "Active", isDeleted: false },
  { id: "dept-5", name: "Yarn & Accessories Store", code: "STOR-DEPT", branchId: "br-1", status: "Active", isDeleted: false }
];

const initialSections: Section[] = [
  { id: "sec-1", name: "Computerized Flat Jacquard", code: "JACQ-SEC", departmentId: "dept-1", status: "Active", isDeleted: false },
  { id: "sec-2", name: "Manual Linking Section", code: "LINK-SEC", departmentId: "dept-1", status: "Active", isDeleted: false },
  { id: "sec-3", name: "First Stage Inspection", code: "INSP-SEC", departmentId: "dept-2", status: "Active", isDeleted: false },
  { id: "sec-4", name: "Wage Accounting Office", code: "WAGE-SEC", departmentId: "dept-4", status: "Active", isDeleted: false }
];

const initialLines: Line[] = [
  { id: "line-1", name: "Knitting Floor Line-A1 (12GG Stoll)", code: "L-A1", sectionId: "sec-1", capacityPcsPerDay: 450, status: "Active", isDeleted: false },
  { id: "line-2", name: "Knitting Floor Line-A2 (14GG Stoll)", code: "L-A2", sectionId: "sec-1", capacityPcsPerDay: 400, status: "Active", isDeleted: false },
  { id: "line-3", name: "Linking Assembly Line 01", code: "L-LINK1", sectionId: "sec-2", capacityPcsPerDay: 800, status: "Active", isDeleted: false },
  { id: "line-4", name: "HQ Audit Desk", code: "L-HQ-AUDIT", sectionId: "sec-4", capacityPcsPerDay: 0, status: "Inactive", isDeleted: false }
];

const initialGrades: Grade[] = [
  { id: "gr-1", name: "Grade 1 (Senior Expert Operator)", basicSalary: 18500, otRateMultiplier: 2.0, status: "Active", isDeleted: false },
  { id: "gr-2", name: "Grade 2 (Junior Operator)", basicSalary: 14200, otRateMultiplier: 1.8, status: "Active", isDeleted: false },
  { id: "gr-3", name: "Grade 3 (Knitter Helper)", basicSalary: 12500, otRateMultiplier: 1.5, status: "Active", isDeleted: false },
  { id: "gr-4", name: "Grade Alpha (Senior Staff)", basicSalary: 45000, otRateMultiplier: 0, status: "Active", isDeleted: false }
];

const initialDesignations: Designation[] = [
  { id: "desig-1", name: "Jacquard Machine Operator", code: "OP-JACQ", gradeId: "gr-1", departmentId: "dept-1", status: "Active", isDeleted: false },
  { id: "desig-2", name: "Mending Technician", code: "TECH-MEND", gradeId: "gr-2", departmentId: "dept-2", status: "Active", isDeleted: false },
  { id: "desig-3", name: "Floor QC Supervisor", code: "SUP-QC", gradeId: "gr-4", departmentId: "dept-2", status: "Active", isDeleted: false },
  { id: "desig-4", name: "Executive Accountant", code: "EXEC-ACC", gradeId: "gr-4", departmentId: "dept-4", status: "Active", isDeleted: false }
];

const initialShifts: Shift[] = [
  { id: "sh-1", name: "Morning General Knitting", code: "M-KNIT", startTime: "08:00", endTime: "17:00", graceMinutes: 15, weekendDay: "Friday", status: "Active", isDeleted: false },
  { id: "sh-2", name: "Night Double Overtime Shift", code: "N-KNIT", startTime: "20:00", endTime: "05:00", graceMinutes: 15, weekendDay: "Friday", status: "Active", isDeleted: false },
  { id: "sh-3", name: "Administrative Office Shift", code: "ADMIN-OFFICE", startTime: "09:00", endTime: "18:50", graceMinutes: 10, weekendDay: "Friday", status: "Active", isDeleted: false }
];

const initialRoles: UserRolePermission[] = [
  { id: "role-1", roleName: "Office Manager", allowedModules: ["owner-dash", "hr-dash", "attendance", "employees-setup", "company-setup", "audit-log"], isDeleted: false },
  { id: "role-2", roleName: "Executive Owner (Tariqul)", allowedModules: ["owner-dash"], isDeleted: false },
  { id: "role-3", roleName: "Store Keeper Auditor", allowedModules: ["store", "purchase"], isDeleted: false }
];

export default function Phase1MasterSetup({ isDark, lang, onAddAuditLog }: Phase1MasterSetupProps) {
  // Current Configuration Section tab selection
  const [subTab, setSubTab] = useState<
    "company" | "branch" | "department" | "section" | "line" | "designation" | "grade" | "shift" | "roles"
  >("company");

  // Local States derived from seed data
  const [branches, setBranches] = useState<Branch[]>(initialBranches);
  const [departments, setDepartments] = useState<Department[]>(initialDepartments);
  const [sections, setSections] = useState<Section[]>(initialSections);
  const [lines, setLines] = useState<Line[]>(initialLines);
  const [grades, setGrades] = useState<Grade[]>(initialGrades);
  const [designations, setDesignations] = useState<Designation[]>(initialDesignations);
  const [shifts, setShifts] = useState<Shift[]>(initialShifts);
  const [roles, setRoles] = useState<UserRolePermission[]>(initialRoles);

  // Global Company Profile Fields
  const [companyProfile, setCompanyProfile] = useState({
    name: "OTTOMASS JACQUARD LTD",
    banglaName: "অটোমাস জ্যাকার্ড লিমিটেড",
    binNo: "001248924-0102",
    address: "Plot B-14, BSCIC Industrial Area, Konabari, Gazipur, Bangladesh",
    phone: "+88029241029",
    email: "info@ottomass.com.bd",
    contactPerson: "Mr. Tariqul Islam",
    weekendDay: "Friday",
    otCalculationRate: 2.0
  });

  // Table manipulation states
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [showArchived, setShowArchived] = useState(false);
  
  // Validation, message, and Edit index hooks
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [activeMessage, setActiveMessage] = useState({ text: "", type: "success" });
  const [editingId, setEditingId] = useState<string | null>(null);

  // Dynamic state hooks for forms
  // 1. Branch Form
  const [branchName, setBranchName] = useState("");
  const [branchCode, setBranchCode] = useState("");
  const [branchAddress, setBranchAddress] = useState("");
  const [branchStatus, setBranchStatus] = useState<"Active" | "Inactive">("Active");

  // 2. Department Form
  const [deptName, setDeptName] = useState("");
  const [deptCode, setDeptCode] = useState("");
  const [deptBranch, setDeptBranch] = useState("br-1");
  const [deptStatus, setDeptStatus] = useState<"Active" | "Inactive">("Active");

  // 3. Section Form
  const [secName, setSecName] = useState("");
  const [secCode, setSecCode] = useState("");
  const [secDept, setSecDept] = useState("dept-1");
  const [secStatus, setSecStatus] = useState<"Active" | "Inactive">("Active");

  // 4. Line Form
  const [lineName, setLineName] = useState("");
  const [lineCode, setLineCode] = useState("");
  const [lineSection, setLineSection] = useState("sec-1");
  const [lineCapacity, setLineCapacity] = useState(400);
  const [lineStatus, setLineStatus] = useState<"Active" | "Inactive">("Active");

  // 5. Designation Form
  const [desigName, setDesigName] = useState("");
  const [desigCode, setDesigCode] = useState("");
  const [desigGrade, setDesigGrade] = useState("gr-1");
  const [desigDept, setDesigDept] = useState("dept-1");
  const [desigStatus, setDesigStatus] = useState<"Active" | "Inactive">("Active");

  // 6. Grade Form
  const [gradName, setGradName] = useState("");
  const [gradBasic, setGradBasic] = useState(13000);
  const [gradOtMultiplier, setGradOtMultiplier] = useState(2.0);
  const [gradStatus, setGradStatus] = useState<"Active" | "Inactive">("Active");

  // 7. Shift Form
  const [shName, setShName] = useState("");
  const [shCode, setShCode] = useState("");
  const [shStart, setShStart] = useState("08:00");
  const [shEnd, setShEnd] = useState("17:00");
  const [shGrace, setShGrace] = useState(15);
  const [shWeekend, setShWeekend] = useState("Friday");
  const [shStatus, setShStatus] = useState<"Active" | "Inactive">("Active");

  // 8. User Roles Form
  const [roleTitle, setRoleTitle] = useState("");
  const [rolePermissions, setRolePermissions] = useState<string[]>(["owner-dash"]);

  // Set message trigger
  function triggerMessage(text: string, type: "success" | "error" = "success") {
    setActiveMessage({ text, type });
    setTimeout(() => setActiveMessage({ text: "", type: "success" }), 4000);
  }

  // Handle Sort Toggle
  function handleSort(field: string) {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  }

  // --- SUBMISSION LOGIC WITH TIGHT FORM VALIDATIONS ---

  // Save Company settings
  function saveCompany(e: React.FormEvent) {
    e.preventDefault();
    const errors: string[] = [];
    if (!companyProfile.name.trim()) errors.push("Company Name is required.");
    if (!companyProfile.email.includes("@")) errors.push("Please provide a valid company email address.");
    if (companyProfile.binNo.length < 5) errors.push("Business Identification Number (BIN) is invalid.");
    if (!companyProfile.phone) errors.push("Phone number is required.");
    
    if (errors.length > 0) {
      setValidationErrors(errors);
      triggerMessage("Failure to validate Company Profile parameters", "error");
      return;
    }

    setValidationErrors([]);
    onAddAuditLog("Save Company Setup", "Company settings", `Updated general profile parameters for ${companyProfile.name}.`);
    triggerMessage("Company settings successfully locked.");
  }

  // Save Branch Setup
  function saveBranch(e: React.FormEvent) {
    e.preventDefault();
    const errors: string[] = [];
    if (!branchName.trim()) errors.push("Branch title is required.");
    if (!branchCode.trim()) errors.push("Branch designation code is required.");
    if (!branchAddress.trim()) errors.push("Branch physical location is required.");
    
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    setValidationErrors([]);
    if (editingId) {
      setBranches(branches.map(b => b.id === editingId ? { ...b, name: branchName, code: branchCode, address: branchAddress, status: branchStatus } : b));
      onAddAuditLog("Update Branch", "Branch Setup", `Updated branch details for ${branchName}.`);
      triggerMessage("Branch parameters upgraded successfully.");
    } else {
      const newB: Branch = {
        id: `br-${Date.now()}`,
        name: branchName,
        code: branchCode,
        address: branchAddress,
        status: branchStatus,
        isDeleted: false
      };
      setBranches([newB, ...branches]);
      onAddAuditLog("Create Branch", "Branch Setup", `Added new branch ${branchName} (${branchCode}).`);
      triggerMessage("New branch added successfully.");
    }

    // Reset Form
    setBranchName("");
    setBranchCode("");
    setBranchAddress("");
    setBranchStatus("Active");
    setEditingId(null);
  }

  // Save Department Setup
  function saveDepartment(e: React.FormEvent) {
    e.preventDefault();
    const errors: string[] = [];
    if (!deptName.trim()) errors.push("Department name is required.");
    if (!deptCode.trim()) errors.push("Department identification code is required.");

    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    setValidationErrors([]);
    if (editingId) {
      setDepartments(departments.map(d => d.id === editingId ? { ...d, name: deptName, code: deptCode, branchId: deptBranch, status: deptStatus } : d));
      onAddAuditLog("Update Department", "Department Setup", `Updated department ${deptName}.`);
      triggerMessage("Department upgraded successfully.");
    } else {
      const newD: Department = {
        id: `dept-${Date.now()}`,
        name: deptName,
        code: deptCode,
        branchId: deptBranch,
        status: deptStatus,
        isDeleted: false
      };
      setDepartments([newD, ...departments]);
      onAddAuditLog("Create Department", "Department Setup", `Added branch department ${deptName}.`);
      triggerMessage("Department cataloged successfully.");
    }

    setDeptName("");
    setDeptCode("");
    setEditingId(null);
  }

  // Save Section Setup
  function saveSection(e: React.FormEvent) {
    e.preventDefault();
    const errors: string[] = [];
    if (!secName.trim()) errors.push("Section title is required.");
    if (!secCode.trim()) errors.push("Section reference code is required.");

    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    setValidationErrors([]);
    if (editingId) {
      setSections(sections.map(s => s.id === editingId ? { ...s, name: secName, code: secCode, departmentId: secDept, status: secStatus } : s));
      onAddAuditLog("Update Section", "Section Setup", `Updated section ${secName}.`);
      triggerMessage("Section details updated.");
    } else {
      const newS: Section = {
        id: `sec-${Date.now()}`,
        name: secName,
        code: secCode,
        departmentId: secDept,
        status: secStatus,
        isDeleted: false
      };
      setSections([newS, ...sections]);
      onAddAuditLog("Create Section", "Section Setup", `Organized section ${secName}.`);
      triggerMessage("Section successfully registered.");
    }

    setSecName("");
    setSecCode("");
    setEditingId(null);
  }

  // Save Line Setup
  function saveLine(e: React.FormEvent) {
    e.preventDefault();
    const errors: string[] = [];
    if (!lineName.trim()) errors.push("Line name/descriptor is required.");
    if (!lineCode.trim()) errors.push("Line reference code is required.");
    if (lineCapacity < 0) errors.push("Capacity pieces value must be zero or positive.");

    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    setValidationErrors([]);
    if (editingId) {
      setLines(lines.map(l => l.id === editingId ? { ...l, name: lineName, code: lineCode, sectionId: lineSection, capacityPcsPerDay: lineCapacity, status: lineStatus } : l));
      onAddAuditLog("Update Line", "Line Setup", `Updated floor line details for ${lineName}.`);
      triggerMessage("Factory Line successfully modified.");
    } else {
      const newL: Line = {
        id: `line-${Date.now()}`,
        name: lineName,
        code: lineCode,
        sectionId: lineSection,
        capacityPcsPerDay: lineCapacity,
        status: lineStatus,
        isDeleted: false
      };
      setLines([newL, ...lines]);
      onAddAuditLog("Create Line", "Line Setup", `Added floor line ${lineName} with capacity ${lineCapacity} pcs.`);
      triggerMessage("New Line successfully established.");
    }

    setLineName("");
    setLineCode("");
    setLineCapacity(400);
    setEditingId(null);
  }

  // Save Designation Setup
  function saveDesignation(e: React.FormEvent) {
    e.preventDefault();
    const errors: string[] = [];
    if (!desigName.trim()) errors.push("Designation name is required.");
    if (!desigCode.trim()) errors.push("Designation shorthand code is required.");

    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    setValidationErrors([]);
    if (editingId) {
      setDesignations(designations.map(d => d.id === editingId ? { ...d, name: desigName, code: desigCode, gradeId: desigGrade, departmentId: desigDept, status: desigStatus } : d));
      onAddAuditLog("Update Designation", "Designation Setup", `Updated designation designation ${desigName}.`);
      triggerMessage("Designation updated successfully.");
    } else {
      const newD: Designation = {
        id: `desig-${Date.now()}`,
        name: desigName,
        code: desigCode,
        gradeId: desigGrade,
        departmentId: desigDept,
        status: desigStatus,
        isDeleted: false
      };
      setDesignations([newD, ...designations]);
      onAddAuditLog("Create Designation", "Designation Setup", `Added designative job role ${desigName}.`);
      triggerMessage("Designation registered.");
    }

    setDesigName("");
    setDesigCode("");
    setEditingId(null);
  }

  // Save Grade Setup
  function saveGrade(e: React.FormEvent) {
    e.preventDefault();
    const errors: string[] = [];
    if (!gradName.trim()) errors.push("Grade title is required.");
    if (gradBasic < 5000) errors.push("Basic minimum wage must meet Bangladesh standards (>= 5,000 BDT).");
    if (gradOtMultiplier < 0) errors.push("OT multiplier must be a non-negative scale.");

    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    setValidationErrors([]);
    if (editingId) {
      setGrades(grades.map(g => g.id === editingId ? { ...g, name: gradName, basicSalary: gradBasic, otRateMultiplier: gradOtMultiplier, status: gradStatus } : g));
      onAddAuditLog("Update Grade", "Grade Setup", `Updated salary grade scale for ${gradName}.`);
      triggerMessage("Grade scale successfully updated.");
    } else {
      const newG: Grade = {
        id: `gr-${Date.now()}`,
        name: gradName,
        basicSalary: gradBasic,
        otRateMultiplier: gradOtMultiplier,
        status: gradStatus,
        isDeleted: false
      };
      setGrades([newG, ...grades]);
      onAddAuditLog("Create Grade", "Grade Setup", `Added new worker grade ${gradName} (Basic: ৳${gradBasic}).`);
      triggerMessage("New Wage Grade scale registered.");
    }

    setGradName("");
    setGradBasic(13000);
    setGradOtMultiplier(2.0);
    setEditingId(null);
  }

  // Save Shift Setup
  function saveShift(e: React.FormEvent) {
    e.preventDefault();
    const errors: string[] = [];
    if (!shName.trim()) errors.push("Shift title is required.");
    if (!shCode.trim()) errors.push("Shift identifier code is required.");
    if (!shStart || !shEnd) errors.push("Shift start and end times must be defined.");

    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    setValidationErrors([]);
    if (editingId) {
      setShifts(shifts.map(s => s.id === editingId ? { ...s, name: shName, code: shCode, startTime: shStart, endTime: shEnd, graceMinutes: shGrace, weekendDay: shWeekend, status: shStatus } : s));
      onAddAuditLog("Update Shift", "Shift Setup", `Updated shift timing logs for ${shName}.`);
      triggerMessage("Shift timeline adjusted successfully.");
    } else {
      const newS: Shift = {
        id: `sh-${Date.now()}`,
        name: shName,
        code: shCode,
        startTime: shStart,
        endTime: shEnd,
        graceMinutes: shGrace,
        weekendDay: shWeekend,
        status: shStatus,
        isDeleted: false
      };
      setShifts([newS, ...shifts]);
      onAddAuditLog("Create Shift", "Shift Setup", `Added shift schedule ${shName} (${shStart} to ${shEnd}).`);
      triggerMessage("Plant Shift timeline registered.");
    }

    setShName("");
    setShCode("");
    setShStart("08:00");
    setShEnd("17:00");
    setShGrace(15);
    setEditingId(null);
  }

  // Save Roles Permission
  function saveRole(e: React.FormEvent) {
    e.preventDefault();
    const errors: string[] = [];
    if (!roleTitle.trim()) errors.push("Role Title descriptor is required.");
    if (rolePermissions.length === 0) errors.push("Please check at least one permitted workspace tab module.");

    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    setValidationErrors([]);
    if (editingId) {
      setRoles(roles.map(r => r.id === editingId ? { ...r, roleName: roleTitle, allowedModules: rolePermissions } : r));
      onAddAuditLog("Update Role Permissions", "Security Roles", `Modified system access levels for ${roleTitle}.`);
      triggerMessage("Role parameters upgraded successfully.");
    } else {
      const newR: UserRolePermission = {
        id: `role-${Date.now()}`,
        roleName: roleTitle,
        allowedModules: rolePermissions,
        isDeleted: false
      };
      setRoles([newR, ...roles]);
      onAddAuditLog("Create Role", "Security Roles", `Registered system access role profile ${roleTitle}.`);
      triggerMessage("Access Role initialized.");
    }

    setRoleTitle("");
    setRolePermissions(["owner-dash"]);
    setEditingId(null);
  }

  // Soft Deletes (Mark isDeleted = true)
  function handleSoftDelete(id: string, module: string) {
    if (module === "branch") {
      setBranches(branches.map(b => b.id === id ? { ...b, isDeleted: true } : b));
      const n = branches.find(x => x.id === id)?.name || "";
      onAddAuditLog("Soft Delete Branch", "Branch Setup", `Suspended branch access for ${n}.`);
    } else if (module === "department") {
      setDepartments(departments.map(d => d.id === id ? { ...d, isDeleted: true } : d));
      const n = departments.find(x => x.id === id)?.name || "";
      onAddAuditLog("Soft Delete Department", "Department Setup", `Suspended department access for ${n}.`);
    } else if (module === "section") {
      setSections(sections.map(s => s.id === id ? { ...s, isDeleted: true } : s));
      const n = sections.find(x => x.id === id)?.name || "";
      onAddAuditLog("Soft Delete Section", "Section Setup", `Deleted section ${n}.`);
    } else if (module === "line") {
      setLines(lines.map(l => l.id === id ? { ...l, isDeleted: true } : l));
      const n = lines.find(x => x.id === id)?.name || "";
      onAddAuditLog("Soft Delete Line", "Line Setup", `Archived plant line ${n}.`);
    } else if (module === "designation") {
      setDesignations(designations.map(d => d.id === id ? { ...d, isDeleted: true } : d));
      const n = designations.find(x => x.id === id)?.name || "";
      onAddAuditLog("Soft Delete Designation", "Designation Setup", `Archived designation ${n}.`);
    } else if (module === "grade") {
      setGrades(grades.map(g => g.id === id ? { ...g, isDeleted: true } : g));
      const n = grades.find(x => x.id === id)?.name || "";
      onAddAuditLog("Soft Delete Grade", "Grade Setup", `Archived grade tier ${n}.`);
    } else if (module === "shift") {
      setShifts(shifts.map(s => s.id === id ? { ...s, isDeleted: true } : s));
      const n = shifts.find(x => x.id === id)?.name || "";
      onAddAuditLog("Soft Delete Shift", "Shift Setup", `Archived shift code ${n}.`);
    } else if (module === "roles") {
      setRoles(roles.map(r => r.id === id ? { ...r, isDeleted: true } : r));
      const n = roles.find(x => x.id === id)?.roleName || "";
      onAddAuditLog("Soft Delete Role", "Security Roles", `Removed access profile for ${n}.`);
    }
    triggerMessage("Item soft deleted successfully (Can restore).");
  }

  // Restore Soft Deleted items
  function handleRestore(id: string, module: string) {
    if (module === "branch") {
      setBranches(branches.map(b => b.id === id ? { ...b, isDeleted: false } : b));
      const n = branches.find(x => x.id === id)?.name || "";
      onAddAuditLog("Restore Branch", "Branch Setup", `Restored branch access for ${n}.`);
    } else if (module === "department") {
      setDepartments(departments.map(d => d.id === id ? { ...d, isDeleted: false } : d));
      const n = departments.find(x => x.id === id)?.name || "";
      onAddAuditLog("Restore Department", "Department Setup", `Restored department ${n}.`);
    } else if (module === "section") {
      setSections(sections.map(s => s.id === id ? { ...s, isDeleted: false } : s));
      const n = sections.find(x => x.id === id)?.name || "";
      onAddAuditLog("Restore Section", "Section Setup", `Restored section ${n}.`);
    } else if (module === "line") {
      setLines(lines.map(l => l.id === id ? { ...l, isDeleted: false } : l));
      const n = lines.find(x => x.id === id)?.name || "";
      onAddAuditLog("Restore Line", "Line Setup", `Restored factory knitting line ${n}.`);
    } else if (module === "designation") {
      setDesignations(designations.map(d => d.id === id ? { ...d, isDeleted: false } : d));
      const n = designations.find(x => x.id === id)?.name || "";
      onAddAuditLog("Restore Designation", "Designation Setup", `Restored job designation role ${n}.`);
    } else if (module === "grade") {
      setGrades(grades.map(g => g.id === id ? { ...g, isDeleted: false } : g));
      const n = grades.find(x => x.id === id)?.name || "";
      onAddAuditLog("Restore Grade", "Grade Setup", `Restored grade structure for ${n}.`);
    } else if (module === "shift") {
      setShifts(shifts.map(s => s.id === id ? { ...s, isDeleted: false } : s));
      const n = shifts.find(x => x.id === id)?.name || "";
      onAddAuditLog("Restore Shift", "Shift Setup", `Restored shift schedule ${n}.`);
    } else if (module === "roles") {
      setRoles(roles.map(r => r.id === id ? { ...r, isDeleted: false } : r));
      const n = roles.find(x => x.id === id)?.roleName || "";
      onAddAuditLog("Restore Role", "Security Roles", `Restored system access profile ${n}.`);
    }
    triggerMessage("Archived item restored to active roster.");
  }

  // Edit triggers (load data to form)
  function startEdit(item: any, module: string) {
    setEditingId(item.id);
    setValidationErrors([]);
    
    if (module === "branch") {
      setBranchName(item.name);
      setBranchCode(item.code);
      setBranchAddress(item.address);
      setBranchStatus(item.status);
    } else if (module === "department") {
      setDeptName(item.name);
      setDeptCode(item.code);
      setDeptBranch(item.branchId);
      setDeptStatus(item.status);
    } else if (module === "section") {
      setSecName(item.name);
      setSecCode(item.code);
      setSecDept(item.departmentId);
      setSecStatus(item.status);
    } else if (module === "line") {
      setLineName(item.name);
      setLineCode(item.code);
      setLineSection(item.sectionId);
      setLineCapacity(item.capacityPcsPerDay);
      setLineStatus(item.status);
    } else if (module === "designation") {
      setDesigName(item.name);
      setDesigCode(item.code);
      setDesigGrade(item.gradeId);
      setDesigDept(item.departmentId);
      setDesigStatus(item.status);
    } else if (module === "grade") {
      setGradName(item.name);
      setGradBasic(item.basicSalary);
      setGradOtMultiplier(item.otRateMultiplier);
      setGradStatus(item.status);
    } else if (module === "shift") {
      setShName(item.name);
      setShCode(item.code);
      setShStart(item.startTime);
      setShEnd(item.endTime);
      setShGrace(item.graceMinutes);
      setShWeekend(item.weekendDay);
      setShStatus(item.status);
    } else if (module === "roles") {
      setRoleTitle(item.roleName);
      setRolePermissions(item.allowedModules);
    }
  }

  // Permission selection toggle
  function togglePermission(perm: string) {
    if (rolePermissions.includes(perm)) {
      setRolePermissions(rolePermissions.filter(p => p !== perm));
    } else {
      setRolePermissions([...rolePermissions, perm]);
    }
  }

  // --- RENDERING VIEWS BASED ON SELECTED SUB-TAB ---

  return (
    <div className={`space-y-6 animate-fade-in ${isDark ? "text-slate-100" : "text-slate-800"}`}>
      
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="font-display font-extrabold text-2xl tracking-tight">
            {lang === "EN" ? "Factory & Plant Configuration Hub" : "কারখানা ও গেট আপ সেটআপ সেন্টার"}
          </h2>
          <p className="font-sans text-xs text-slate-500 dark:text-slate-400 mt-1">
            {lang === "EN" 
              ? "Comprehensive settings for branches, machinery lines, grading wage scales, and user role authorizations." 
              : "পোস্ট-সেটআপ এবং মাস্টার প্যারামিটার এন্ট্রি স্ক্রিন সমূহ।"}
          </p>
        </div>

        {/* Global info sticker */}
        <div className="mt-3 md:mt-0 flex items-center space-x-2">
          <span className="font-mono text-[10px] bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-slate-800 px-3 py-1.5 rounded-lg flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping"></span>
            <span>OTTOMASS Core Engine v1.5</span>
          </span>
        </div>
      </div>

      {/* Subtab Carousel */}
      <div className="overflow-x-auto pb-1 no-print">
        <div className="flex space-x-1 bg-slate-100 dark:bg-slate-900 p-1.5 rounded-xl border border-slate-200 dark:border-slate-850 w-max min-w-full">
          {[
            { id: "company", title: "Company Profile", icon: Building2 },
            { id: "branch", title: "Factory Units", icon: GitBranch },
            { id: "department", title: "Departments", icon: Layers },
            { id: "section", title: "Sections", icon: Grid3X3 },
            { id: "line", title: "Knitting Lines", icon: Milestone },
            { id: "designation", title: "Designations", icon: Award },
            { id: "grade", title: "Grades & Wages", icon: Sliders },
            { id: "shift", title: "Shift Calendar", icon: Clock },
            { id: "roles", title: "User Roles & Check", icon: Lock }
          ].map((tab) => {
            const Icon = tab.icon;
            const isTabActive = subTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setSubTab(tab.id as any);
                  setSearchTerm("");
                  setEditingId(null);
                  setValidationErrors([]);
                }}
                className={`flex items-center space-x-2 px-3.5 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                  isTabActive 
                    ? "bg-slate-900 dark:bg-emerald-600 text-white shadow-md border hover:border-transparent" 
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800/60"
                }`}
              >
                <Icon size={13} className={isTabActive ? "text-emerald-400 dark:text-slate-100 animate-pulse" : ""} />
                <span>{tab.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* State Feedback Banners */}
      {activeMessage.text && (
        <div className={`p-3.5 border rounded-xl text-xs font-medium flex items-center space-x-2.5 animate-bounce ${
          activeMessage.type === "error" 
            ? "bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/30 text-rose-800 dark:text-rose-400" 
            : "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-250 dark:border-emerald-900/30 text-emerald-800 dark:text-emerald-400"
        }`}>
          <Check size={14} className="animate-spin" />
          <span>{activeMessage.text}</span>
        </div>
      )}

      {/* Validation Messages list */}
      {validationErrors.length > 0 && (
        <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-250 rounded-xl p-4 text-xs text-rose-800 dark:text-rose-400">
          <p className="font-bold mb-1.5 flex items-center space-x-1.5 text-rose-900 dark:text-white">
            <AlertCircle size={14} />
            <span>Form validation constraints failed:</span>
          </p>
          <ul className="list-disc pl-5 space-y-1">
            {validationErrors.map((err, i) => <li key={i}>{err}</li>)}
          </ul>
        </div>
      )}

      {/* --- RENDER SPECIFIC SUBTAB SECTIONS --- */}

      {subTab === "company" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <form onSubmit={saveCompany} className="lg:col-span-2 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-850 p-6 rounded-2xl shadow-sm space-y-5">
            
            <div className="flex items-center space-x-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <Building2 size={16} className="text-emerald-500" />
              <h3 className="font-display font-black text-xs uppercase tracking-wider text-slate-400">
                Company Master settings (OTTOMASS JACQUARD LTD)
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-[11px] text-slate-400 font-bold uppercase mb-1">Company Registered Name (EN)</label>
                <input 
                  type="text" 
                  value={companyProfile.name}
                  onChange={(e) => setCompanyProfile({...companyProfile, name: e.target.value})}
                  className="w-full mt-1 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 bg-transparent focus:ring-1 focus:ring-slate-400 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 font-bold uppercase mb-1">Registered Name (Bangla / বাংলা)</label>
                <input 
                  type="text" 
                  value={companyProfile.banglaName}
                  onChange={(e) => setCompanyProfile({...companyProfile, banglaName: e.target.value})}
                  className="w-full mt-1 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 bg-transparent focus:ring-1 focus:ring-slate-400 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 font-bold uppercase mb-1">BIN Registration Number</label>
                <input 
                  type="text" 
                  value={companyProfile.binNo}
                  onChange={(e) => setCompanyProfile({...companyProfile, binNo: e.target.value})}
                  className="w-full mt-1 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 bg-transparent focus:ring-1 focus:ring-slate-400 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 font-bold uppercase mb-1">Corporate Physical Address</label>
                <input 
                  type="text" 
                  value={companyProfile.address}
                  onChange={(e) => setCompanyProfile({...companyProfile, address: e.target.value})}
                  className="w-full mt-1 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 bg-transparent focus:ring-1 focus:ring-slate-400 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 font-bold uppercase mb-1">Central Hot Contact Phone</label>
                <input 
                  type="text" 
                  value={companyProfile.phone}
                  onChange={(e) => setCompanyProfile({...companyProfile, phone: e.target.value})}
                  className="w-full mt-1 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 bg-transparent focus:ring-1 focus:ring-slate-400 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 font-bold uppercase mb-1">Official Inquiry Email</label>
                <input 
                  type="email" 
                  value={companyProfile.email}
                  onChange={(e) => setCompanyProfile({...companyProfile, email: e.target.value})}
                  className="w-full mt-1 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 bg-transparent focus:ring-1 focus:ring-slate-400 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 font-bold uppercase mb-1">Executive General Manager / Owner</label>
                <input 
                  type="text" 
                  value={companyProfile.contactPerson}
                  onChange={(e) => setCompanyProfile({...companyProfile, contactPerson: e.target.value})}
                  className="w-full mt-1 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 bg-transparent focus:ring-1 focus:ring-slate-400 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 font-bold uppercase mb-1">Weekend (Factory General Holiday)</label>
                <select 
                  value={companyProfile.weekendDay}
                  onChange={(e) => setCompanyProfile({...companyProfile, weekendDay: e.target.value})}
                  className="w-full mt-1 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 bg-transparent focus:outline-hidden"
                >
                  <option value="Friday">Friday (শুক্রবার)</option>
                  <option value="Thursday">Thursday (বৃহস্পতিবার)</option>
                  <option value="Sunday">Sunday (রোববার)</option>
                </select>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end space-x-2">
              <button 
                type="button" 
                onClick={() => setCompanyProfile({
                  name: "OTTOMASS JACQUARD LTD",
                  banglaName: "অটোমাস জ্যাকার্ড লিমিটেড",
                  binNo: "001248924-0102",
                  address: "Plot B-14, BSCIC Industrial Area, Konabari, Gazipur, Bangladesh",
                  phone: "+88029241029",
                  email: "info@ottomass.com.bd",
                  contactPerson: "Mr. Tariqul Islam",
                  weekendDay: "Friday",
                  otCalculationRate: 2.0
                })}
                className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-lg font-bold text-[#f43f5e] hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Reset Default
              </button>
              <button 
                type="submit" 
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg font-bold transition shadow-sm"
              >
                Save Factory Profile Settings
              </button>
            </div>
          </form>

          {/* Company Side cards */}
          <div className="space-y-4">
            <div className="bg-slate-900 border border-slate-850 p-5 rounded-2xl text-white">
              <h4 className="font-display font-extrabold text-xs text-slate-400 uppercase tracking-widest mb-3">
                Executive Overview Profile
              </h4>
              <p className="font-sans text-[11.5px] leading-relaxed text-slate-300">
                "OTTOMASS JACQUARD LTD is fully registered under BGMEA and compliant to the Gazipur factory regulatory laws. Company setup sets critical global states including holiday weekend (Fridays) and over-time calculation rate multipliers."
              </p>
              <div className="mt-4 pt-3 border-t border-slate-850 flex justify-between font-mono text-[9px] text-slate-500">
                <span>Registrar: Gazipur Joint Stock</span>
                <span>Active Code: OJ-MAIN</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB: BRANCH SETUP */}
      {subTab === "branch" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Branch Setup Form */}
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-850 p-5 rounded-2xl h-fit">
            <h4 className="font-display font-extrabold text-sm text-slate-800 dark:text-white mb-4 flex items-center space-x-2">
              <Plus size={14} className="text-emerald-500" />
              <span>{editingId ? "Edit Plant Branch" : "Add Plant Branch"}</span>
            </h4>

            <form onSubmit={saveBranch} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block text-[10.5px] text-slate-400 font-bold mb-1">Branch Name</label>
                <input 
                  type="text" 
                  value={branchName}
                  onChange={(e) => setBranchName(e.target.value)}
                  placeholder="e.g. Gazipur Knitting & Sewing Plant"
                  className="w-full mt-1 border border-slate-200 dark:border-slate-800 rounded-lg p-2 bg-transparent text-slate-800 dark:text-slate-100 placeholder-slate-400"
                />
              </div>

              <div>
                <label className="block text-[10.5px] text-slate-400 font-bold mb-1">Branch Designation Code</label>
                <input 
                  type="text" 
                  value={branchCode}
                  onChange={(e) => setBranchCode(e.target.value)}
                  placeholder="e.g. GZP-MAIN"
                  className="w-full mt-1 border border-slate-200 dark:border-slate-800 rounded-lg p-2 bg-transparent text-slate-800 dark:text-slate-100 placeholder-slate-400"
                />
              </div>

              <div>
                <label className="block text-[10.5px] text-slate-400 font-bold mb-1">Physical Address</label>
                <input 
                  type="text" 
                  value={branchAddress}
                  onChange={(e) => setBranchAddress(e.target.value)}
                  placeholder="Plot B-14, BSCIC, Konabari"
                  className="w-full mt-1 border border-slate-200 dark:border-slate-800 rounded-lg p-2 bg-transparent text-slate-800 dark:text-slate-100 placeholder-slate-400"
                />
              </div>

              <div>
                <label className="block text-[10.5px] text-slate-400 font-bold mb-1">Roster Status</label>
                <select 
                  value={branchStatus}
                  onChange={(e) => setBranchStatus(e.target.value as any)}
                  className="w-full mt-1 border border-slate-200 dark:border-slate-800 rounded-lg p-2 bg-transparent text-slate-800 dark:text-slate-100"
                >
                  <option value="Active">Active (সচল)</option>
                  <option value="Inactive">Inactive (বন্ধ)</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end space-x-1.5">
                {editingId && (
                  <button 
                    type="button" 
                    onClick={() => {
                      setEditingId(null);
                      setBranchName("");
                      setBranchCode("");
                      setBranchAddress("");
                    }}
                    className="px-3 py-1.5 border border-slate-200 dark:border-slate-850 rounded-lg font-bold"
                  >
                    Cancel
                  </button>
                )}
                <button 
                  type="submit" 
                  className="bg-[#0ea5e9] hover:bg-sky-600 text-white px-4 py-1.5 rounded-lg font-bold"
                >
                  {editingId ? "Upgrade Branch" : "Confirm Branch"}
                </button>
              </div>
            </form>
          </div>

          {/* Branch setup table (2 columns) */}
          <div className="lg:col-span-2 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-850 p-5 rounded-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-2.5 top-3.5 text-slate-400" />
                <input 
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search branches by title, code or address..."
                  className="w-full pl-8 py-2.5 text-xs text-slate-800 dark:text-white bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-hidden"
                />
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setShowArchived(!showArchived)}
                  className={`px-3 py-2 text-xs font-semibold rounded-lg border transition ${
                    showArchived 
                      ? "bg-rose-50 dark:bg-rose-950/30 text-rose-600 border-rose-200" 
                      : "bg-slate-50 dark:bg-slate-900 text-slate-500 border-slate-200 dark:border-slate-800"
                  }`}
                >
                  {showArchived ? "Archived (Show Soft Deleted)" : "Show Active Only"}
                </button>
              </div>
            </div>

            {/* Table layout with soft delete restore */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs divide-y divide-slate-100 dark:divide-slate-800">
                <thead>
                  <tr className="text-slate-400 dark:text-slate-500 text-[10px] uppercase font-bold tracking-wider">
                    <th className="py-2 cursor-pointer" onClick={() => handleSort("name")}>Branch Title</th>
                    <th className="py-2 cursor-pointer" onClick={() => handleSort("code")}>Code</th>
                    <th className="py-2">Physical Location</th>
                    <th className="py-2 text-center">Status</th>
                    <th className="py-2 text-right">Actions Valve</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-700 dark:text-slate-300">
                  {branches
                    .filter(b => !!b.isDeleted === showArchived)
                    .filter(b => b.name.toLowerCase().includes(searchTerm.toLowerCase()) || b.code.toLowerCase().includes(searchTerm.toLowerCase()))
                    .sort((a,b) => {
                      if (!sortField) return 0;
                      const valA = (a as any)[sortField];
                      const valB = (b as any)[sortField];
                      return sortDirection === "asc" ? String(valA).localeCompare(String(valB)) : String(valB).localeCompare(String(valA));
                    })
                    .map((b) => (
                      <tr key={b.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="py-3 font-bold text-slate-800 dark:text-white">{b.name}</td>
                        <td className="py-3 font-mono text-indigo-500 font-bold">{b.code}</td>
                        <td className="py-3 text-slate-500 dark:text-slate-400 text-[11px] font-sans">{b.address}</td>
                        <td className="py-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                            b.status === "Active" ? "bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600" : "bg-slate-50 text-slate-500"
                          }`}>
                            {b.status}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          {showArchived ? (
                            <button 
                              onClick={() => handleRestore(b.id, "branch")}
                              className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[10px] rounded border border-emerald-200 flex items-center space-x-1 ml-auto"
                            >
                              <RotateCcw size={10} />
                              <span>Restore</span>
                            </button>
                          ) : (
                            <div className="flex justify-end space-x-1">
                              <button 
                                onClick={() => startEdit(b, "branch")}
                                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 rounded"
                              >
                                <Edit2 size={11} />
                              </button>
                              <button 
                                onClick={() => handleSoftDelete(b.id, "branch")}
                                className="p-1.5 hover:bg-rose-50 text-[#f43f5e] rounded"
                              >
                                <Trash2 size={11} />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB: DEPARTMENTS */}
      {subTab === "department" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Department setup form */}
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-850 p-5 rounded-2xl h-fit">
            <h4 className="font-display font-extrabold text-sm text-slate-800 dark:text-white mb-4">
              {editingId ? "Edit Department" : "Add Department"}
            </h4>

            <form onSubmit={saveDepartment} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block text-[10.5px] text-slate-400 font-bold mb-1">Department Title</label>
                <input 
                  type="text" 
                  value={deptName}
                  onChange={(e) => setDeptName(e.target.value)}
                  placeholder="e.g. Production & Knitting"
                  className="w-full mt-1 border border-slate-200 dark:border-slate-800 rounded-lg p-2 bg-transparent text-slate-800 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-[10.5px] text-slate-400 font-bold mb-1">Department Identifier Code</label>
                <input 
                  type="text" 
                  value={deptCode}
                  onChange={(e) => setDeptCode(e.target.value)}
                  placeholder="e.g. KNIT-DEPT"
                  className="w-full mt-1 border border-slate-200 dark:border-slate-800 rounded-lg p-2 bg-transparent text-slate-800 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-[10.5px] text-slate-400 font-bold mb-1">Associated Corporate Branch</label>
                <select 
                  value={deptBranch}
                  onChange={(e) => setDeptBranch(e.target.value)}
                  className="w-full mt-1 border border-slate-200 dark:border-slate-800 rounded-lg p-2 bg-transparent text-slate-800 dark:text-slate-100"
                >
                  {branches.filter(b => !b.isDeleted).map(b => (
                    <option key={b.id} value={b.id}>{b.name} ({b.code})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10.5px] text-slate-400 font-bold mb-1">Setup Status</label>
                <select 
                  value={deptStatus}
                  onChange={(e) => setDeptStatus(e.target.value as any)}
                  className="w-full mt-1 border border-slate-200 dark:border-slate-800 rounded-lg p-2 bg-transparent text-slate-800 dark:text-slate-100"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end space-x-1.5">
                {editingId && (
                  <button 
                    type="button" 
                    onClick={() => {
                      setEditingId(null);
                      setDeptName("");
                      setDeptCode("");
                    }}
                    className="px-3 py-1.5 border border-slate-200 dark:border-slate-850 rounded-lg font-bold"
                  >
                    Cancel
                  </button>
                )}
                <button type="submit" className="bg-[#0ea5e9] hover:bg-sky-600 text-white px-4 py-1.5 rounded-lg font-bold">
                  Save Department
                </button>
              </div>
            </form>
          </div>

          {/* Department setup Table */}
          <div className="lg:col-span-2 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-850 p-5 rounded-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-2.5 top-3.5 text-slate-400" />
                <input 
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search departments..."
                  className="w-full pl-8 py-2.5 text-xs text-slate-800 dark:text-white bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg"
                />
              </div>
              <button
                type="button"
                onClick={() => setShowArchived(!showArchived)}
                className={`px-3 py-2 text-xs font-semibold rounded-lg border transition ${
                  showArchived ? "bg-rose-50 text-rose-600 border-rose-250" : "bg-slate-50 dark:bg-slate-900 text-slate-500 border-slate-200 dark:border-slate-800"
                }`}
              >
                {showArchived ? "Show Soft Deleted" : "Show Active Only"}
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs divide-y divide-slate-100 dark:divide-slate-800">
                <thead>
                  <tr className="text-slate-400 dark:text-slate-500 text-[10px] uppercase font-bold tracking-wider">
                    <th className="py-2 cursor-pointer" onClick={() => handleSort("name")}>Department Title</th>
                    <th className="py-2">Code</th>
                    <th className="py-2">Linked Branch</th>
                    <th className="py-2 text-center">Status</th>
                    <th className="py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-700 dark:text-slate-300">
                  {departments
                    .filter(d => !!d.isDeleted === showArchived)
                    .filter(d => d.name.toLowerCase().includes(searchTerm.toLowerCase()) || d.code.toLowerCase().includes(searchTerm.toLowerCase()))
                    .sort((a,b) => sortField ? String((a as any)[sortField]).localeCompare(String((b as any)[sortField])) * (sortDirection === "asc" ? 1 : -1) : 0)
                    .map((d) => {
                      const bName = branches.find(b => b.id === d.branchId)?.name || "Central Branch";
                      return (
                        <tr key={d.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                          <td className="py-3 font-bold text-slate-800 dark:text-white">{d.name}</td>
                          <td className="py-3 font-mono font-semibold text-emerald-600">{d.code}</td>
                          <td className="py-3 text-slate-500 dark:text-slate-400 text-[11px]">{bName}</td>
                          <td className="py-3 text-center">
                            <span className="px-2 py-0.5 rounded-full text-[9px] bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-bold">
                              {d.status}
                            </span>
                          </td>
                          <td className="py-3 text-right">
                            {showArchived ? (
                              <button 
                                onClick={() => handleRestore(d.id, "department")}
                                className="px-2 py-1 bg-emerald-50 text-emerald-700 font-mono text-[10px] rounded border border-emerald-250 flex items-center ml-auto"
                              >
                                Restore
                              </button>
                            ) : (
                              <div className="flex justify-end space-x-1">
                                <button onClick={() => startEdit(d, "department")} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 rounded"><Edit2 size={11} /></button>
                                <button onClick={() => handleSoftDelete(d.id, "department")} className="p-1 hover:bg-rose-50 text-[#f43f5e] rounded"><Trash2 size={11} /></button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB: SECTIONS */}
      {subTab === "section" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Section Setup Form */}
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-850 p-5 rounded-2xl h-fit">
            <h4 className="font-display font-extrabold text-sm text-slate-800 dark:text-white mb-4">
              {editingId ? "Edit Factory Section" : "Add Factory Section"}
            </h4>

            <form onSubmit={saveSection} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block text-[10.5px] text-slate-400 font-bold mb-1">Section Name</label>
                <input 
                  type="text" 
                  value={secName}
                  onChange={(e) => setSecName(e.target.value)}
                  placeholder="e.g. Computerized Flat Jacquard"
                  className="w-full mt-1 border border-slate-200 dark:border-slate-800 rounded-lg p-2 bg-transparent text-slate-800 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-[10.5px] text-slate-400 font-bold mb-1">Section Code Reference</label>
                <input 
                  type="text" 
                  value={secCode}
                  onChange={(e) => setSecCode(e.target.value)}
                  placeholder="e.g. JACQ-SEC"
                  className="w-full mt-1 border border-slate-200 dark:border-slate-800 rounded-lg p-2 bg-transparent text-slate-800 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-[10.5px] text-slate-400 font-bold mb-1">Parent Hierarchy Department</label>
                <select 
                  value={secDept}
                  onChange={(e) => setSecDept(e.target.value)}
                  className="w-full mt-1 border border-slate-200 dark:border-slate-800 rounded-lg p-2 bg-transparent text-slate-800 dark:text-slate-100"
                >
                  {departments.filter(d => !d.isDeleted).map(d => (
                    <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10.5px] text-slate-400 font-bold mb-1">Section Status</label>
                <select 
                  value={secStatus}
                  onChange={(e) => setSecStatus(e.target.value as any)}
                  className="w-full mt-1 border border-slate-200 dark:border-slate-800 rounded-lg p-2 bg-transparent text-slate-800 dark:text-slate-100"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end space-x-1.5">
                {editingId && (
                  <button 
                    type="button" 
                    onClick={() => {
                      setEditingId(null);
                      setSecName("");
                      setSecCode("");
                    }}
                    className="px-3 py-1.5 border border-slate-200 dark:border-slate-850 rounded-lg font-bold"
                  >
                    Cancel
                  </button>
                )}
                <button type="submit" className="bg-[#0ea5e9] hover:bg-sky-600 text-white px-4 py-1.5 rounded-lg font-bold">
                  Save Section
                </button>
              </div>
            </form>
          </div>

          {/* Section Setup Table */}
          <div className="lg:col-span-2 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-850 p-5 rounded-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-2.5 top-3.5 text-slate-400" />
                <input 
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search plant sections..."
                  className="w-full pl-8 py-2.5 text-xs text-slate-800 dark:text-white bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg"
                />
              </div>
              <button
                type="button"
                onClick={() => setShowArchived(!showArchived)}
                className={`px-3 py-2 text-xs font-semibold rounded-lg border transition ${
                  showArchived ? "bg-rose-50 text-rose-600 border-rose-250" : "bg-slate-50 dark:bg-slate-900 text-slate-500 border-slate-200 dark:border-slate-800"
                }`}
              >
                {showArchived ? "Show Soft Deleted" : "Show Active Only"}
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs divide-y divide-slate-100 dark:divide-slate-800">
                <thead>
                  <tr className="text-slate-400 dark:text-slate-500 text-[10px] uppercase font-bold tracking-wider">
                    <th className="py-2 cursor-pointer" onClick={() => handleSort("name")}>Section Grid</th>
                    <th className="py-2">Code</th>
                    <th className="py-2">Department Path</th>
                    <th className="py-2 text-center">Status</th>
                    <th className="py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-700 dark:text-slate-300">
                  {sections
                    .filter(s => !!s.isDeleted === showArchived)
                    .filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.code.toLowerCase().includes(searchTerm.toLowerCase()))
                    .sort((a,b) => sortField ? String((a as any)[sortField]).localeCompare(String((b as any)[sortField])) * (sortDirection === "asc" ? 1 : -1) : 0)
                    .map((s) => {
                      const dName = departments.find(d => d.id === s.departmentId)?.name || "Corporate Admin";
                      return (
                        <tr key={s.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                          <td className="py-3 font-bold text-slate-800 dark:text-white">{s.name}</td>
                          <td className="py-3 font-mono font-bold text-indigo-500">{s.code}</td>
                          <td className="py-3 text-slate-500 dark:text-slate-400 text-[11px]">{dName}</td>
                          <td className="py-3 text-center">
                            <span className="px-2 py-0.5 rounded shadow-xs text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                              {s.status}
                            </span>
                          </td>
                          <td className="py-3 text-right">
                            {showArchived ? (
                              <button 
                                onClick={() => handleRestore(s.id, "section")}
                                className="px-2 py-1 bg-emerald-50 text-emerald-700 font-bold rounded text-[10px] ml-auto border border-emerald-250 flex items-center"
                              >
                                Restore
                              </button>
                            ) : (
                              <div className="flex justify-end space-x-1">
                                <button onClick={() => startEdit(s, "section")} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 rounded"><Edit2 size={11} /></button>
                                <button onClick={() => handleSoftDelete(s.id, "section")} className="p-1 hover:bg-rose-50 text-[#f43f5e] rounded"><Trash2 size={11} /></button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB: KNITTING LINES */}
      {subTab === "line" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Line Setup Form */}
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-850 p-5 rounded-2xl h-fit">
            <h4 className="font-display font-extrabold text-sm text-slate-800 dark:text-white mb-4">
              {editingId ? "Edit Machinery Line" : "Add Machinery Line"}
            </h4>

            <form onSubmit={saveLine} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block text-[10.5px] text-slate-400 font-bold mb-1">Line Name / Title</label>
                <input 
                  type="text" 
                  value={lineName}
                  onChange={(e) => setLineName(e.target.value)}
                  placeholder="e.g. Line-A1 (12GG Stoll)"
                  className="w-full mt-1 border border-slate-200 dark:border-slate-800 rounded-lg p-2 bg-transparent text-slate-800 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-[10.5px] text-slate-400 font-bold mb-1">Line Code</label>
                <input 
                  type="text" 
                  value={lineCode}
                  onChange={(e) => setLineCode(e.target.value)}
                  placeholder="e.g. L-A1"
                  className="w-full mt-1 border border-slate-200 dark:border-slate-800 rounded-lg p-2 bg-transparent text-slate-800 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-[10.5px] text-slate-400 font-bold mb-1">Associated Section</label>
                <select 
                  value={lineSection}
                  onChange={(e) => setLineSection(e.target.value)}
                  className="w-full mt-1 border border-slate-200 dark:border-slate-800 rounded-lg p-2 bg-transparent text-slate-800 dark:text-slate-100"
                >
                  {sections.filter(s => !s.isDeleted).map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10.5px] text-slate-400 font-bold mb-1">Estimated Output Capacity (Pcs/Day)</label>
                <input 
                  type="number" 
                  value={lineCapacity}
                  onChange={(e) => setLineCapacity(Number(e.target.value))}
                  placeholder="e.g. 450"
                  className="w-full mt-1 border border-slate-200 dark:border-slate-800 rounded-lg p-2 bg-transparent text-slate-800 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-[10.5px] text-slate-400 font-bold mb-1">Active Status</label>
                <select 
                  value={lineStatus}
                  onChange={(e) => setLineStatus(e.target.value as any)}
                  className="w-full mt-1 border border-slate-200 dark:border-slate-800 rounded-lg p-2 bg-transparent text-slate-800 dark:text-slate-100"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end space-x-1.5">
                {editingId && (
                  <button 
                    type="button" 
                    onClick={() => {
                      setEditingId(null);
                      setLineName("");
                      setLineCode("");
                    }}
                    className="px-3 py-1.5 border border-slate-200 dark:border-slate-850 rounded-lg font-bold"
                  >
                    Cancel
                  </button>
                )}
                <button type="submit" className="bg-[#0ea5e9] hover:bg-sky-600 text-white px-4 py-1.5 rounded-lg font-bold">
                  Save Line Parameters
                </button>
              </div>
            </form>
          </div>

          {/* Knitting Line setup table */}
          <div className="lg:col-span-2 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-850 p-5 rounded-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-2.5 top-3.5 text-slate-400" />
                <input 
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search plant floor lines..."
                  className="w-full pl-8 py-2.5 text-xs text-slate-800 dark:text-white bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg"
                />
              </div>
              <button
                type="button"
                onClick={() => setShowArchived(!showArchived)}
                className={`px-3 py-2 text-xs font-semibold rounded-lg border transition ${
                  showArchived ? "bg-rose-50 text-rose-600 border-rose-250" : "bg-slate-50 dark:bg-slate-900 text-slate-500 border-slate-200 dark:border-slate-800"
                }`}
              >
                {showArchived ? "Show Soft Deleted" : "Show Active Only"}
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs divide-y divide-slate-100 dark:divide-slate-800">
                <thead>
                  <tr className="text-slate-400 dark:text-slate-500 text-[10px] uppercase font-bold tracking-wider">
                    <th className="py-2 cursor-pointer" onClick={() => handleSort("name")}>Line Desk</th>
                    <th className="py-2">Code</th>
                    <th className="py-2">Parent Section</th>
                    <th className="py-2">Est Capacity</th>
                    <th className="py-2 text-center">Status</th>
                    <th className="py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-700 dark:text-slate-300">
                  {lines
                    .filter(l => !!l.isDeleted === showArchived)
                    .filter(l => l.name.toLowerCase().includes(searchTerm.toLowerCase()) || l.code.toLowerCase().includes(searchTerm.toLowerCase()))
                    .sort((a,b) => sortField ? String((a as any)[sortField]).localeCompare(String((b as any)[sortField])) * (sortDirection === "asc" ? 1 : -1) : 0)
                    .map((l) => {
                      const sName = sections.find(s => s.id === l.sectionId)?.name || "Sweater Floor Hub";
                      return (
                        <tr key={l.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                          <td className="py-3 font-bold text-slate-800 dark:text-white">{l.name}</td>
                          <td className="py-3 font-mono text-emerald-500 font-bold">{l.code}</td>
                          <td className="py-3 text-slate-500 dark:text-slate-400 text-[11px]">{sName}</td>
                          <td className="py-3 text-slate-900 dark:text-slate-200 font-mono font-bold">{l.capacityPcsPerDay} pcs/day</td>
                          <td className="py-3 text-center">
                            <span className="px-2 py-0.5 rounded-full text-[9px] bg-rose-50 text-rose-600 font-semibold">
                              {l.status}
                            </span>
                          </td>
                          <td className="py-3 text-right">
                            {showArchived ? (
                              <button 
                                onClick={() => handleRestore(l.id, "line")}
                                className="px-2 py-1 bg-emerald-50 text-emerald-700 font-mono text-[10px] rounded border border-emerald-250 flex ml-auto"
                              >
                                Restore
                              </button>
                            ) : (
                              <div className="flex justify-end space-x-1">
                                <button onClick={() => startEdit(l, "line")} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 rounded"><Edit2 size={11} /></button>
                                <button onClick={() => handleSoftDelete(l.id, "line")} className="p-1 hover:bg-rose-50 text-[#f43f5e] rounded"><Trash2 size={11} /></button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB: DESIGNATIONS */}
      {subTab === "designation" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Designation Setup Form */}
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-850 p-5 rounded-2xl h-fit">
            <h4 className="font-display font-extrabold text-sm text-slate-800 dark:text-white mb-4">
              {editingId ? "Edit Designation" : "Add Designation"}
            </h4>

            <form onSubmit={saveDesignation} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block text-[10.5px] text-slate-400 font-bold mb-1">Designation Title</label>
                <input 
                  type="text" 
                  value={desigName}
                  onChange={(e) => setDesigName(e.target.value)}
                  placeholder="e.g. Jacquard Machine Operator"
                  className="w-full mt-1 border border-slate-200 dark:border-slate-800 rounded-lg p-2 bg-transparent text-slate-800 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-[10.5px] text-slate-400 font-bold mb-1">Designation Registry Code</label>
                <input 
                  type="text" 
                  value={desigCode}
                  onChange={(e) => setDesigCode(e.target.value)}
                  placeholder="e.g. OP-JACQ"
                  className="w-full mt-1 border border-slate-200 dark:border-slate-800 rounded-lg p-2 bg-transparent text-slate-800 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-[10.5px] text-slate-400 font-bold mb-1">Linked Pay Grade</label>
                <select 
                  value={desigGrade}
                  onChange={(e) => setDesigGrade(e.target.value)}
                  className="w-full mt-1 border border-slate-200 dark:border-slate-800 rounded-lg p-2 bg-transparent text-slate-800 dark:text-slate-100"
                >
                  {grades.filter(g => !g.isDeleted).map(g => (
                    <option key={g.id} value={g.id}>{g.name} (Min Pay: ৳{g.basicSalary.toLocaleString()})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10.5px] text-slate-400 font-bold mb-1">Department Mapping</label>
                <select 
                  value={desigDept}
                  onChange={(e) => setDesigDept(e.target.value)}
                  className="w-full mt-1 border border-slate-200 dark:border-slate-800 rounded-lg p-2 bg-transparent text-slate-800 dark:text-slate-100"
                >
                  {departments.filter(d => !d.isDeleted).map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10.5px] text-slate-400 font-bold mb-1">Roster Status</label>
                <select 
                  value={desigStatus}
                  onChange={(e) => setDesigStatus(e.target.value as any)}
                  className="w-full mt-1 border border-slate-200 dark:border-slate-800 rounded-lg p-2 bg-transparent text-slate-800 dark:text-slate-100"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end space-x-1.5">
                {editingId && (
                  <button 
                    type="button" 
                    onClick={() => {
                      setEditingId(null);
                      setDesigName("");
                      setDesigCode("");
                    }}
                    className="px-3 py-1.5 border border-slate-200 dark:border-slate-850 rounded-lg font-bold"
                  >
                    Cancel
                  </button>
                )}
                <button type="submit" className="bg-[#0ea5e9] hover:bg-sky-600 text-white px-4 py-1.5 rounded-lg font-bold">
                  Save Designation
                </button>
              </div>
            </form>
          </div>

          {/* Designation Setup Table */}
          <div className="lg:col-span-2 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-850 p-5 rounded-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-2.5 top-3.5 text-slate-400" />
                <input 
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search designations..."
                  className="w-full pl-8 py-2.5 text-xs text-slate-800 dark:text-white bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg"
                />
              </div>
              <button
                type="button"
                onClick={() => setShowArchived(!showArchived)}
                className={`px-3 py-2 text-xs font-semibold rounded-lg border transition ${
                  showArchived ? "bg-rose-50 text-rose-600 border-rose-250" : "bg-slate-50 dark:bg-slate-900 text-slate-500 border-slate-200 dark:border-slate-800"
                }`}
              >
                {showArchived ? "Show Soft Deleted" : "Show Active Only"}
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs divide-y divide-slate-100 dark:divide-slate-800">
                <thead>
                  <tr className="text-slate-400 dark:text-slate-500 text-[10px] uppercase font-bold tracking-wider">
                    <th className="py-2 cursor-pointer" onClick={() => handleSort("name")}>Designation Roster</th>
                    <th className="py-2">Code</th>
                    <th className="py-2">Mapped Grade</th>
                    <th className="py-2">Department Path</th>
                    <th className="py-2 text-center">Status</th>
                    <th className="py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-700 dark:text-slate-300">
                  {designations
                    .filter(d => !!d.isDeleted === showArchived)
                    .filter(d => d.name.toLowerCase().includes(searchTerm.toLowerCase()) || d.code.toLowerCase().includes(searchTerm.toLowerCase()))
                    .sort((a,b) => sortField ? String((a as any)[sortField]).localeCompare(String((b as any)[sortField])) * (sortDirection === "asc" ? 1 : -1) : 0)
                    .map((d) => {
                      const gName = grades.find(g => g.id === d.gradeId)?.name || "N/A";
                      const dName = departments.find(dep => dep.id === d.departmentId)?.name || "General Roster";
                      return (
                        <tr key={d.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                          <td className="py-3 font-bold text-slate-800 dark:text-white">{d.name}</td>
                          <td className="py-3 font-mono text-emerald-500 font-bold">{d.code}</td>
                          <td className="py-3 text-slate-500 dark:text-slate-400 text-[11.5px] font-semibold">{gName}</td>
                          <td className="py-3 text-slate-500 dark:text-slate-400 text-[11px]">{dName}</td>
                          <td className="py-3 text-center">
                            <span className="px-2 py-0.5 rounded shadow-xs text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                              {d.status}
                            </span>
                          </td>
                          <td className="py-3 text-right">
                            {showArchived ? (
                              <button 
                                onClick={() => handleRestore(d.id, "designation")}
                                className="px-2 py-1 bg-emerald-50 text-emerald-700 font-bold rounded text-[10px] ml-auto border border-emerald-250 flex"
                              >
                                Restore
                              </button>
                            ) : (
                              <div className="flex justify-end space-x-1">
                                <button onClick={() => startEdit(d, "designation")} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 rounded"><Edit2 size={11} /></button>
                                <button onClick={() => handleSoftDelete(d.id, "designation")} className="p-1 hover:bg-rose-50 text-[#f43f5e] rounded"><Trash2 size={11} /></button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB: GRADES & WAGES */}
      {subTab === "grade" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Grade Setup Form */}
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-850 p-5 rounded-2xl h-fit">
            <h4 className="font-display font-extrabold text-sm text-slate-800 dark:text-white mb-4">
              {editingId ? "Edit Grade Scale" : "Add Wage Grade Scale"}
            </h4>

            <form onSubmit={saveGrade} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block text-[10.5px] text-slate-400 font-bold mb-1">Grade Scale Name</label>
                <input 
                  type="text" 
                  value={gradName}
                  onChange={(e) => setGradName(e.target.value)}
                  placeholder="e.g. Grade 1 (Senior Operator)"
                  className="w-full mt-1 border border-slate-200 dark:border-slate-800 rounded-lg p-2 bg-transparent text-slate-800 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-[10.5px] text-slate-400 font-bold mb-1">Basic Minimum Salary (BDT/Month)</label>
                <input 
                  type="number" 
                  value={gradBasic}
                  onChange={(e) => setGradBasic(Number(e.target.value))}
                  placeholder="12500"
                  className="w-full mt-1 border border-slate-200 dark:border-slate-800 rounded-lg p-2 bg-transparent text-slate-800 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-[10.5px] text-slate-400 font-bold mb-1">Overtime Hourly Rate Multiplier</label>
                <input 
                  type="number" 
                  step="0.1"
                  value={gradOtMultiplier}
                  onChange={(e) => setGradOtMultiplier(Number(e.target.value))}
                  placeholder="2.0"
                  className="w-full mt-1 border border-slate-200 dark:border-slate-800 rounded-lg p-2 bg-transparent text-slate-800 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-[10.5px] text-slate-400 font-bold mb-1">Active wage policy</label>
                <select 
                  value={gradStatus}
                  onChange={(e) => setGradStatus(e.target.value as any)}
                  className="w-full mt-1 border border-slate-200 dark:border-slate-800 rounded-lg p-2 bg-transparent text-slate-800 dark:text-slate-100"
                >
                  <option value="Active">Active (পাবলিশড)</option>
                  <option value="Inactive">Inactive (ড্রাফট)</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end space-x-1.5">
                {editingId && (
                  <button 
                    type="button" 
                    onClick={() => {
                      setEditingId(null);
                      setGradName("");
                    }}
                    className="px-3 py-1.5 border border-slate-200 dark:border-slate-850 rounded-lg font-bold"
                  >
                    Cancel
                  </button>
                )}
                <button type="submit" className="bg-[#0ea5e9] hover:bg-sky-600 text-white px-4 py-1.5 rounded-lg font-bold">
                  Save Wage Policy
                </button>
              </div>
            </form>
          </div>

          {/* Grade setup Table */}
          <div className="lg:col-span-2 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-850 p-5 rounded-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-2.5 top-3.5 text-slate-400" />
                <input 
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search grades..."
                  className="w-full pl-8 py-2.5 text-xs text-slate-800 dark:text-white bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg"
                />
              </div>
              <button
                type="button"
                onClick={() => setShowArchived(!showArchived)}
                className={`px-3 py-2 text-xs font-semibold rounded-lg border transition ${
                  showArchived ? "bg-rose-50 text-rose-600 border-rose-250" : "bg-slate-50 dark:bg-slate-900 text-slate-500 border-slate-200 dark:border-slate-800"
                }`}
              >
                {showArchived ? "Show Soft Deleted" : "Show Active Only"}
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs divide-y divide-slate-100 dark:divide-slate-800">
                <thead>
                  <tr className="text-slate-400 dark:text-slate-500 text-[10px] uppercase font-bold tracking-wider">
                    <th className="py-2 cursor-pointer" onClick={() => handleSort("name")}>Grade Structure Scale</th>
                    <th className="py-2 text-right">Basic Wage (BDT)</th>
                    <th className="py-2 text-right">OT Hourly Factor</th>
                    <th className="py-2 text-center">Status</th>
                    <th className="py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-700 dark:text-slate-300">
                  {grades
                    .filter(g => !!g.isDeleted === showArchived)
                    .filter(g => g.name.toLowerCase().includes(searchTerm.toLowerCase()))
                    .sort((a,b) => sortField ? String((a as any)[sortField]).localeCompare(String((b as any)[sortField])) * (sortDirection === "asc" ? 1 : -1) : 0)
                    .map((g) => {
                      return (
                        <tr key={g.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                          <td className="py-3 font-bold text-slate-800 dark:text-white">{g.name}</td>
                          <td className="py-3 text-right font-mono font-bold text-slate-900 dark:text-white">৳{g.basicSalary.toLocaleString()}</td>
                          <td className="py-3 text-right font-mono font-bold text-indigo-600">{g.otRateMultiplier}x basic rate</td>
                          <td className="py-3 text-center">
                            <span className="px-2 py-0.5 rounded shadow-xs text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                              {g.status}
                            </span>
                          </td>
                          <td className="py-3 text-right">
                            {showArchived ? (
                              <button 
                                onClick={() => handleRestore(g.id, "grade")}
                                className="px-2 py-1 bg-emerald-50 text-emerald-700 font-bold rounded text-[10px] ml-auto border border-emerald-250 flex"
                              >
                                Restore
                              </button>
                            ) : (
                              <div className="flex justify-end space-x-1">
                                <button onClick={() => startEdit(g, "grade")} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 rounded"><Edit2 size={11} /></button>
                                <button onClick={() => handleSoftDelete(g.id, "grade")} className="p-1 hover:bg-rose-50 text-[#f43f5e] rounded"><Trash2 size={11} /></button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB: SHIFT CALENDAR */}
      {subTab === "shift" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Shift setup Form */}
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-850 p-5 rounded-2xl h-fit">
            <h4 className="font-display font-extrabold text-sm text-slate-800 dark:text-white mb-4">
              {editingId ? "Edit Shift Timeline" : "Add Shift Timeline"}
            </h4>

            <form onSubmit={saveShift} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block text-[10.5px] text-slate-400 font-bold mb-1">Shift Name / Title</label>
                <input 
                  type="text" 
                  value={shName}
                  onChange={(e) => setShName(e.target.value)}
                  placeholder="e.g. Morning General Knitting"
                  className="w-full mt-1 border border-slate-200 dark:border-slate-800 rounded-lg p-2 bg-transparent text-slate-800 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-[10.5px] text-slate-400 font-bold mb-1">Shift Code</label>
                <input 
                  type="text" 
                  value={shCode}
                  onChange={(e) => setShCode(e.target.value)}
                  placeholder="e.g. M-KNIT"
                  className="w-full mt-1 border border-slate-200 dark:border-slate-800 rounded-lg p-2 bg-transparent text-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10.5px] text-slate-400 font-bold mb-1">Check-In Time</label>
                  <input 
                    type="time" 
                    value={shStart}
                    onChange={(e) => setShStart(e.target.value)}
                    className="w-full mt-1 border border-slate-200 dark:border-slate-800 rounded-lg p-2 bg-transparent text-slate-800 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-[10.5px] text-slate-400 font-bold mb-1">Check-Out time</label>
                  <input 
                    type="time" 
                    value={shEnd}
                    onChange={(e) => setShEnd(e.target.value)}
                    className="w-full mt-1 border border-slate-200 dark:border-slate-800 rounded-lg p-2 bg-transparent text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10.5px] text-slate-400 font-bold mb-1">Grace Allowed (Mins)</label>
                  <input 
                    type="number" 
                    value={shGrace}
                    onChange={(e) => setShGrace(Number(e.target.value))}
                    className="w-full mt-1 border border-slate-200 dark:border-slate-800 rounded-lg p-2 bg-transparent text-slate-800 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-[10.5px] text-slate-400 font-bold mb-1">Shift Weekend Holiday</label>
                  <select 
                    value={shWeekend}
                    onChange={(e) => setShWeekend(e.target.value)}
                    className="w-full mt-1 border border-slate-200 dark:border-slate-800 rounded-lg p-2 bg-transparent text-slate-800 dark:text-slate-100"
                  >
                    <option value="Friday">Friday (শুক্রবার)</option>
                    <option value="Thursday">Thursday (বৃহস্পতিবার)</option>
                    <option value="Sunday">Sunday (রোববার)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10.5px] text-slate-400 font-bold mb-1">Shift Status</label>
                <select 
                  value={shStatus}
                  onChange={(e) => setShStatus(e.target.value as any)}
                  className="w-full mt-1 border border-slate-200 dark:border-slate-800 rounded-lg p-2 bg-transparent text-slate-800 dark:text-slate-100"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end space-x-1.5">
                {editingId && (
                  <button 
                    type="button" 
                    onClick={() => {
                      setEditingId(null);
                      setShName("");
                    }}
                    className="px-3 py-1.5 border border-slate-200 dark:border-slate-850 rounded-lg font-bold"
                  >
                    Cancel
                  </button>
                )}
                <button type="submit" className="bg-[#0ea5e9] hover:bg-sky-600 text-white px-4 py-1.5 rounded-lg font-bold">
                  Save Shift Details
                </button>
              </div>
            </form>
          </div>

          {/* Shift Setup Table */}
          <div className="lg:col-span-2 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-850 p-5 rounded-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-2.5 top-3.5 text-slate-400" />
                <input 
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search Shifts..."
                  className="w-full pl-8 py-2.5 text-xs text-slate-800 dark:text-white bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg"
                />
              </div>
              <button
                type="button"
                onClick={() => setShowArchived(!showArchived)}
                className={`px-3 py-2 text-xs font-semibold rounded-lg border transition ${
                  showArchived ? "bg-rose-50 text-rose-600 border-rose-250" : "bg-slate-50 dark:bg-slate-900 text-slate-500 border-slate-200 dark:border-slate-800"
                }`}
              >
                {showArchived ? "Show Soft Deleted" : "Show Active Only"}
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs divide-y divide-slate-100 dark:divide-slate-800">
                <thead>
                  <tr className="text-slate-400 dark:text-slate-500 text-[10px] uppercase font-bold tracking-wider">
                    <th className="py-2 cursor-pointer" onClick={() => handleSort("name")}>Shift Frame</th>
                    <th className="py-2">Code</th>
                    <th className="py-2">Check-In / Out</th>
                    <th className="py-2">Weekend</th>
                    <th className="py-2 text-center">Status</th>
                    <th className="py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-700 dark:text-slate-300">
                  {shifts
                    .filter(s => !!s.isDeleted === showArchived)
                    .filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.code.toLowerCase().includes(searchTerm.toLowerCase()))
                    .sort((a,b) => sortField ? String((a as any)[sortField]).localeCompare(String((b as any)[sortField])) * (sortDirection === "asc" ? 1 : -1) : 0)
                    .map((s) => {
                      return (
                        <tr key={s.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                          <td className="py-3 font-bold text-slate-800 dark:text-white">{s.name}</td>
                          <td className="py-3 font-mono font-bold text-indigo-500">{s.code}</td>
                          <td className="py-3">
                            <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-[11px] font-mono text-slate-700 dark:text-slate-300">
                              {s.startTime} - {s.endTime} (+{s.graceMinutes}m Grace)
                            </span>
                          </td>
                          <td className="py-3 font-semibold text-rose-500 dark:text-rose-400">{s.weekendDay}</td>
                          <td className="py-3 text-center">
                            <span className="px-2 py-0.5 rounded-full text-[9px] bg-indigo-50 text-indigo-700 font-bold">
                              {s.status}
                            </span>
                          </td>
                          <td className="py-3 text-right">
                            {showArchived ? (
                              <button 
                                onClick={() => handleRestore(s.id, "shift")}
                                className="px-2 py-1 bg-emerald-50 text-emerald-700 font-bold rounded text-[10px] ml-auto border border-emerald-250 flex"
                              >
                                Restore
                              </button>
                            ) : (
                              <div className="flex justify-end space-x-1">
                                <button onClick={() => startEdit(s, "shift")} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 rounded"><Edit2 size={11} /></button>
                                <button onClick={() => handleSoftDelete(s.id, "shift")} className="p-1 hover:bg-rose-50 text-[#f43f5e] rounded"><Trash2 size={11} /></button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB: USER ROLES SETUP */}
      {subTab === "roles" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Roles Form */}
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-850 p-5 rounded-2xl h-fit">
            <h4 className="font-display font-extrabold text-sm text-slate-800 dark:text-white mb-4">
              {editingId ? "Edit System Access Role" : "Create System Access Role"}
            </h4>

            <form onSubmit={saveRole} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block text-[10.5px] text-slate-400 font-bold mb-1">Role Title Descriptor</label>
                <input 
                  type="text" 
                  value={roleTitle}
                  onChange={(e) => setRoleTitle(e.target.value)}
                  placeholder="e.g. HR Junior Clerk"
                  className="w-full mt-1 border border-slate-200 dark:border-slate-800 rounded-lg p-2 bg-transparent text-slate-800 dark:text-slate-100"
                />
              </div>

              {/* Module Checkbox Grid */}
              <div className="space-y-2">
                <label className="block text-[10.5px] text-slate-400 font-bold">Permitted Workspace Tab Modules</label>
                <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 p-3 rounded-xl max-h-[180px] overflow-y-auto space-y-1">
                  {[
                    { id: "owner-dash", name: "Owner Dashboard" },
                    { id: "hr-dash", name: "HR & Leaves Portal" },
                    { id: "attendance", name: "RFID Biometric Attendance" },
                    { id: "company-setup", name: "Company Master Settings" },
                    { id: "employees-setup", name: "Employee Directory Database" },
                    { id: "audit-log", name: "System Securities Audit Logs" }
                  ].map((mod) => (
                    <label key={mod.id} className="flex items-center space-x-2 p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={rolePermissions.includes(mod.id)}
                        onChange={() => togglePermission(mod.id)}
                        className="rounded text-indigo-600 focus:ring-0 focus:ring-offset-0"
                      />
                      <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300">{mod.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-end space-x-1.5">
                {editingId && (
                  <button 
                    type="button" 
                    onClick={() => {
                      setEditingId(null);
                      setRoleTitle("");
                      setRolePermissions(["owner-dash"]);
                    }}
                    className="px-3 py-1.5 border border-slate-200 dark:border-slate-850 rounded-lg font-bold"
                  >
                    Cancel
                  </button>
                )}
                <button type="submit" className="bg-[#0ea5e9] hover:bg-sky-600 text-white px-4 py-1.5 rounded-lg font-bold">
                  Lock Role Authorizations
                </button>
              </div>
            </form>
          </div>

          {/* Secure access list */}
          <div className="lg:col-span-2 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-850 p-5 rounded-2xl">
            <h4 className="font-display font-extrabold text-xs uppercase text-slate-400 mb-4 tracking-wider">
              Active Security Access Levels
            </h4>

            <div className="space-y-3">
              {roles
                .filter(r => !!r.isDeleted === showArchived)
                .map((r) => (
                  <div key={r.id} className="p-4 border border-slate-205 dark:border-slate-850 rounded-xl bg-slate-50/40 dark:bg-slate-900/40 flex flex-col justify-between sm:flex-row sm:items-center gap-3">
                    <div>
                      <h5 className="font-sans font-bold text-slate-800 dark:text-white text-xs uppercase">{r.roleName}</h5>
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {r.allowedModules.map((m) => (
                          <span key={m} className="px-1.5 py-0.5 rounded-sm bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 text-[9px] font-mono font-bold uppercase border border-indigo-100 dark:border-transparent">
                            {m}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-end space-x-1">
                      {showArchived ? (
                        <button 
                          onClick={() => handleRestore(r.id, "roles")}
                          className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold rounded flex items-center gap-1 ml-auto"
                        >
                          <RotateCcw size={10} />
                          <span>Restore</span>
                        </button>
                      ) : (
                        <>
                          <button onClick={() => startEdit(r, "roles")} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 rounded"><Edit2 size={11} /></button>
                          <button onClick={() => handleSoftDelete(r.id, "roles")} className="p-1 hover:bg-rose-50 text-[#f43f5e] rounded"><Trash2 size={11} /></button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
