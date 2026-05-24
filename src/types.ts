/**
 * OTTOMASS JACQUARD ERP - Core Type Definitions
 * Designed for sweater knitting and apparel parts manufacturing context in Bangladesh.
 */

export interface CompanySettings {
  name: string;
  banglaName: string;
  code: string;
  phone: string;
  email: string;
  address: string;
  branch: string;
  factoryLocation: string;
  floor: string;
  weekend: string;
  otRate: number;
}

export type EmployeeStatus = "Active" | "Inactive" | "Resigned" | "Terminated" | "Left";

export interface Employee {
  id: string; // Document key / UUID
  employeeId: string; // e.g. OJ-1002
  name: string;
  banglaName: string;
  phone: string;
  email: string;
  nid: string;
  department: string;
  section: string;
  line: string;
  designation: string;
  grade: string; // A, B, C, D
  employeeType: "Worker" | "Staff" | "Management";
  salaryType: "Monthly" | "Hourly" | "Piece-rate";
  gender: "Male" | "Female";
  biometricId: string;
  joiningDate: string;
  status: EmployeeStatus;
  basicSalary: number;
  houseRent: number;
  medicalAllowance: number;
  conveyance: number;
  foodAllowance: number;
  image?: string;
  isDeleted?: boolean;
  rfidCard?: string;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string; // YYYY-MM-DD
  checkIn: string; // HH:MM
  checkOut: string; // HH:MM
  otHours: number;
  status: "Present" | "Absent" | "Leave" | "Late" | "Holiday";
  verificationMethod: "Fingerprint" | "BioTime-IP" | "Manual";
  approvalStatus: "Approved" | "Pending Approval";
  approvedBy?: string;
}

export interface LeaveApplication {
  id: string;
  employeeId: string;
  employeeName: string;
  leaveType: "Casual Leave" | "Sick Leave" | "Earned Leave" | "Maternity Leave" | "Without Pay";
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: "Pending" | "Approved" | "Rejected";
  appliedAt: string;
}

export interface PayrollRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  month: string; // e.g., "May 2026"
  workedDays: number;
  absentDays: number;
  leaveDays: number;
  holidayDays: number;
  weekendDays: number;
  lateMinutes: number;
  earlyOutMinutes: number;
  missingPunchesApproved: number;
  missingPunchesUnapproved: number;
  approvedManualCorrections: number;
  normalOtHours: number;
  festiveOtHours: number;
  nightShiftDays: number;
  nightShiftPremium: number;
  basicSalary: number;
  grossSalary: number;
  otPayment: number;
  attendanceBonus: number;
  canteenAllowance: number;
  nightShiftAllowance: number;
  otherAllowance: number;
  allowances: number; // total allowances sum
  deductions: number; // absent deduction sum
  lateDeduction: number;
  earlyOutDeduction: number;
  advanceDeduction: number;
  taxDeduction: number;
  netPayable: number;
  status: "Draft" | "Approved" | "Paid";
  paymentMethod: "Bank" | "bKash" | "Cash";
}

export type OrderStatus = "Sampling" | "Approved" | "Planning" | "Knitting" | "Washing" | "Finishing" | "Shipped";

export interface BuyerOrder {
  id: string;
  orderNo: string;
  styleNo: string;
  buyerName: string;
  productType: string; // Sweater, Cardigan, Pull-Over, etc.
  gauge: "1.5GG" | "3GG" | "5GG" | "7GG" | "12GG" | "14GG";
  yarnCount: string; // e.g. 2/32, 2/15 nm
  colorCode: string;
  sizeRange: string; // e.g. S-XXL
  orderQty: number;
  deliveryDate: string;
  image?: string;
  samplingStatus: string;
  status: OrderStatus;
  profitabilityRatio: number; // e.g., 18 for 18%
  fob?: number;
}

export interface KnittingRecord {
  id: string;
  date: string;
  shift: "Day" | "Night";
  machineId: string;
  operatorName: string;
  orderNo: string;
  styleNo: string;
  bodyPart: "Front" | "Back" | "Sleeve" | "Collar" | "Cuff";
  targetQty: number;
  achievedQty: number;
  reworkQty: number;
  rejectQty: number;
  downtimeMinutes: number;
  downtimeReason?: string;
  checkedBy: string;
}

export interface InventoryItem {
  id: string;
  itemCode: string; // e.g., OJ-YRN-001
  category: "Yarn" | "Accessories" | "Spare Parts" | "Consumables";
  name: string;
  countOrSpec: string; // e.g., 2/32 Acrylic, Cotton 100%
  shadeNo?: string;
  supplierName: string;
  uom: string; // Kg, Pcs, Box, Cones
  currentQty: number;
  allocatedQty: number;
  reorderLevel: number;
  averageRate: number; // in BDT
  lastReceiveDate: string;
}

export interface Machine {
  id: string;
  machineNo: string; // e.g., Jacquard-01
  brand: "Stoll" | "Shima Seiki" | "Kauo Heng";
  gauge: "3GG" | "5GG" | "7GG" | "12GG" | "14GG";
  capacityPcsPerDay: number;
  location: string; // Floor 1, Floor 2
  status: "Running" | "Under Maintenance" | "Idle" | "Broken";
}

export interface VoucherItem {
  accountCode: string;
  accountName: string;
  debit: number;
  credit: number;
  narration?: string;
}

export interface JournalVoucher {
  id: string;
  voucherNo: string; // e.g., JV-202605001
  date: string;
  narration: string;
  status: "Draft" | "Pending Approval" | "Approved" | "Posted";
  items: VoucherItem[];
  createdBy: string;
  approvedBy?: string;
}

export interface ChartOfAccount {
  code: string;
  name: string;
  group: "Asset" | "Liability" | "Equity" | "Revenue" | "Expense" | "Cost of Goods Sold" | "Income";
  balance: number;
  type?: string;
  parentGroup?: "Assets" | "Liabilities" | "Equity" | "Income" | "Cost of Goods Sold" | "Expenses";
  openingBalance?: number;
  normalBalance?: "Debit" | "Credit";
  status?: "Active" | "Inactive";
}

export interface AuditLog {
  id: string;
  userId: string;
  userEmail: string;
  action: string;
  target: string;
  details: string;
  timestamp: string;
}

export interface Branch {
  id: string;
  name: string;
  code: string;
  address: string;
  status: "Active" | "Inactive";
  isDeleted?: boolean;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  branchId: string; // Linked branch
  status: "Active" | "Inactive";
  isDeleted?: boolean;
}

export interface Section {
  id: string;
  name: string;
  code: string;
  departmentId: string; // Linked department
  status: "Active" | "Inactive";
  isDeleted?: boolean;
}

export interface Line {
  id: string;
  name: string;
  code: string;
  sectionId: string; // Linked section
  capacityPcsPerDay: number;
  status: "Active" | "Inactive";
  isDeleted?: boolean;
}

export interface Designation {
  id: string;
  name: string;
  code: string;
  gradeId: string; // Linked grade
  departmentId: string;
  status: "Active" | "Inactive";
  isDeleted?: boolean;
}

export interface Grade {
  id: string;
  name: string; // e.g. Grade 1, Grade A
  basicSalary: number;
  otRateMultiplier: number;
  status: "Active" | "Inactive";
  isDeleted?: boolean;
}

export interface Shift {
  id: string;
  name: string;
  code: string;
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  graceMinutes: number;
  weekendDay: string; // e.g. "Friday"
  status: "Active" | "Inactive";
  isDeleted?: boolean;
}

export interface UserRolePermission {
  id: string;
  roleName: string;
  allowedModules: string[]; // List of tab titles authorized
  isDeleted?: boolean;
}

export interface DailyProductionEntry {
  id: string;
  date: string;
  buyer: string;
  style: string;
  cfmRate: number;
  orderQty: number;
  prevProdQty: number;
  dayMachine: number;
  dayProdQty: number;
  nightMachine: number;
  nightProdQty: number;
  totalUsedMachine: number;
  totalProdQty: number;
  grandTotalProd: number;
  balanceQty: number;
  totalMachineQty: number;
  productionAmount: number;
  stopMachine: number;
  stopHour: number;
  lostMinute: number;
  remarks: string;
  status: "Draft" | "Submitted" | "Approved" | "Posted to Accounts";
  createdBy: string;
  approvedBy?: string;
  postedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductionSetting {
  productionAccountingMode: "Auto-post after approval" | "Post manually after approval" | "Do not post automatically";
  allowNegativeBalanceOverride: boolean;
  autoPostApprovedEntries: boolean;
}

export interface BuyerSummary {
  buyerName: string;
  style: string;
  billNo?: string;
  rate: number;
  quantity: number;
  productionAmount: number;
  totalAmount: number;
  receivedAmount: number;
  balance: number;
  dueAmount: number;
  lastReceivedDate?: string;
}


