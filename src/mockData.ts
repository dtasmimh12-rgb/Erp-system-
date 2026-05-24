/**
 * OTTOMASS JACQUARD ERP - High-fidelity Pre-seeded Database Snapshot
 */

import { 
  Employee, 
  AttendanceRecord, 
  BuyerOrder, 
  KnittingRecord, 
  InventoryItem, 
  Machine, 
  JournalVoucher, 
  ChartOfAccount, 
  LeaveApplication,
  PayrollRecord,
  CompanySettings
} from "./types";

export const initialCompanySettings: CompanySettings = {
  name: "OTTOMASS JACQUARD",
  banglaName: "অটোমাস জ্যাকার্ড",
  code: "OMJ",
  phone: "+880 1711-223344",
  email: "info@ottomass-jacquard.com.bd",
  address: "Plot B-14, BSCIC Industrial Area, Konabari, Gazipur, Bangladesh",
  branch: "Gazipur Unit 1",
  factoryLocation: "Gazipur, Bangladesh",
  floor: "Floor 3 & 4 (Jacquard Section)",
  weekend: "Friday",
  otRate: 1.5
};

export const initialEmployees: Employee[] = [
  {
    id: "emp-001",
    employeeId: "OJ-001",
    name: "Tariqul Islam",
    banglaName: "তারিকুল ইসলাম",
    phone: "01712345678",
    email: "tariq@ottomass.com",
    nid: "19912638475920193",
    department: "Management",
    section: "Main Office",
    line: "Office Desk",
    designation: "General Manager",
    grade: "Grade A",
    employeeType: "Management",
    salaryType: "Monthly",
    gender: "Male",
    rfidCard: "RFID-9028A",
    biometricId: "BIO-101",
    joiningDate: "2020-01-15",
    status: "Active",
    basicSalary: 85000,
    houseRent: 25000,
    medicalAllowance: 5000,
    conveyance: 5000,
    foodAllowance: 4000
  },
  {
    id: "emp-002",
    employeeId: "OJ-021",
    name: "Abdul Karim",
    banglaName: "আব্দুল করিম",
    phone: "01811223344",
    email: "karim.jacquard@ottomass.com",
    nid: "19883492857483921",
    department: "Production",
    section: "Jacquard knitting",
    line: "Line-A1 Machine 1-10",
    designation: "Senior Jacquard Operator",
    grade: "Grade B",
    employeeType: "Worker",
    salaryType: "Piece-rate",
    gender: "Male",
    rfidCard: "RFID-4421B",
    biometricId: "BIO-121",
    joiningDate: "2021-06-10",
    status: "Active",
    basicSalary: 22000,
    houseRent: 8000,
    medicalAllowance: 2000,
    conveyance: 1500,
    foodAllowance: 2500
  },
  {
    id: "emp-003",
    employeeId: "OJ-045",
    name: "Nazma Begum",
    banglaName: "নাজমা বেগম",
    phone: "01999887766",
    email: "nazma.mending@gmail.com",
    nid: "19942738495019384",
    department: "Production",
    section: "Linking & Mending",
    line: "Line-B2",
    designation: "Linking Mender",
    grade: "Grade C",
    employeeType: "Worker",
    salaryType: "Piece-rate",
    gender: "Female",
    rfidCard: "RFID-1029C",
    biometricId: "BIO-145",
    joiningDate: "2022-03-01",
    status: "Active",
    basicSalary: 18000,
    houseRent: 7000,
    medicalAllowance: 2000,
    conveyance: 1500,
    foodAllowance: 2500
  },
  {
    id: "emp-004",
    employeeId: "OJ-082",
    name: "Rafiqul Hasan",
    banglaName: "রফিকুল হাসান",
    phone: "01512349876",
    email: "rafiq.maintenance@ottomass.com",
    nid: "19853928174950183",
    department: "Maintenance",
    section: "Mechanical Store",
    line: "W/shop Floor 2",
    designation: "Senior Mechanic",
    grade: "Grade B",
    employeeType: "Worker",
    salaryType: "Monthly",
    gender: "Male",
    rfidCard: "RFID-7281D",
    biometricId: "BIO-182",
    joiningDate: "2021-11-20",
    status: "Active",
    basicSalary: 35000,
    houseRent: 12000,
    medicalAllowance: 3000,
    conveyance: 2000,
    foodAllowance: 3000
  },
  {
    id: "emp-005",
    employeeId: "OJ-003",
    name: "Sumi Akter",
    banglaName: "সুমি আক্তার",
    phone: "01722334455",
    email: "sumi.hr@ottomass.com",
    nid: "19965219482739482",
    department: "HR & Compliance",
    section: "Admin Office",
    line: "Office Desk 2",
    designation: "HR Officer",
    grade: "Grade B",
    employeeType: "Staff",
    salaryType: "Monthly",
    gender: "Female",
    rfidCard: "RFID-6251A",
    biometricId: "BIO-103",
    joiningDate: "2023-02-12",
    status: "Active",
    basicSalary: 28000,
    houseRent: 10000,
    medicalAllowance: 2000,
    conveyance: 2000,
    foodAllowance: 3000
  }
];

export const initialAttendanceRecords: AttendanceRecord[] = [
  {
    id: "att-001",
    employeeId: "OJ-001",
    employeeName: "Tariqul Islam",
    date: "2026-05-23",
    checkIn: "08:45",
    checkOut: "17:15",
    otHours: 0,
    status: "Present",
    verificationMethod: "BioTime-IP",
    approvalStatus: "Approved"
  },
  {
    id: "att-002",
    employeeId: "OJ-021",
    employeeName: "Abdul Karim",
    date: "2026-05-23",
    checkIn: "07:55",
    checkOut: "20:00",
    otHours: 4,
    status: "Present",
    verificationMethod: "Fingerprint",
    approvalStatus: "Approved"
  },
  {
    id: "att-003",
    employeeId: "OJ-045",
    employeeName: "Nazma Begum",
    date: "2026-05-23",
    checkIn: "08:00",
    checkOut: "19:00",
    otHours: 3,
    status: "Present",
    verificationMethod: "Fingerprint",
    approvalStatus: "Approved"
  },
  {
    id: "att-004",
    employeeId: "OJ-082",
    employeeName: "Rafiqul Hasan",
    date: "2026-05-23",
    checkIn: "08:15",
    checkOut: "17:00",
    otHours: 0,
    status: "Present",
    verificationMethod: "Fingerprint",
    approvalStatus: "Approved"
  },
  {
    id: "att-005",
    employeeId: "OJ-003",
    employeeName: "Sumi Akter",
    date: "2026-05-23",
    checkIn: "09:05",
    checkOut: "17:30",
    otHours: 0,
    status: "Late", // Late threshold is 09:00
    verificationMethod: "BioTime-IP",
    approvalStatus: "Pending Approval"
  }
];

export const initialLeaveApplications: LeaveApplication[] = [
  {
    id: "leave-001",
    employeeId: "OJ-045",
    employeeName: "Nazma Begum",
    leaveType: "Sick Leave",
    startDate: "2026-05-18",
    endDate: "2026-05-20",
    totalDays: 3,
    reason: "Fever and cold, doctor advised rest.",
    status: "Approved",
    appliedAt: "2026-05-17"
  },
  {
    id: "leave-002",
    employeeId: "OJ-021",
    employeeName: "Abdul Karim",
    leaveType: "Casual Leave",
    startDate: "2026-05-26",
    endDate: "2026-05-27",
    totalDays: 2,
    reason: "Family urgent program in village.",
    status: "Pending",
    appliedAt: "2026-05-22"
  }
];

export const initialBuyerOrders: BuyerOrder[] = [
  {
    id: "ord-001",
    orderNo: "ORD-2026-801",
    styleNo: "STY-HM-221",
    buyerName: "H&M Global",
    productType: "V-Neck Pullover Sweater Part",
    gauge: "12GG",
    yarnCount: "2/32 Cashmere Soft",
    colorCode: "Navy Blue Solid",
    sizeRange: "S - XXL",
    orderQty: 25000,
    deliveryDate: "2026-06-30",
    samplingStatus: "Approved",
    status: "Knitting",
    profitabilityRatio: 22
  },
  {
    id: "ord-002",
    orderNo: "ORD-2026-802",
    styleNo: "STY-ZRA-09),",
    buyerName: "Zara Tech",
    productType: "Jacquard Pattern Sleeve Sweaters",
    gauge: "7GG",
    yarnCount: "1/15 Cashlike Acrylic",
    colorCode: "Melange Multi-Tone",
    sizeRange: "M - XL",
    orderQty: 12000,
    deliveryDate: "2026-07-15",
    samplingStatus: "Approved",
    status: "Knitting",
    profitabilityRatio: 18
  },
  {
    id: "ord-003",
    orderNo: "ORD-2026-803",
    styleNo: "STY-C&A-404",
    buyerName: "C&A Europe",
    productType: "Hooded Kids Sweater Cardigan",
    gauge: "3GG",
    yarnCount: "2/12 Wool Mix",
    colorCode: "Sunset Orange",
    sizeRange: "4Y - 12Y",
    orderQty: 18000,
    deliveryDate: "2026-08-05",
    samplingStatus: "Sampling Phase",
    status: "Sampling",
    profitabilityRatio: 15
  },
  {
    id: "ord-004",
    orderNo: "ORD-2026-804",
    styleNo: "STY-UNQ-552",
    buyerName: "UNIQLO JP",
    productType: "High-Neck Turtleneck Sleeveless Panel",
    gauge: "12GG",
    yarnCount: "2/40 Cotton Mercerized",
    colorCode: "Off-White Pristine",
    sizeRange: "S - L",
    orderQty: 30000,
    deliveryDate: "2026-06-20", // Close to deadline
    samplingStatus: "Approved",
    status: "Knitting",
    profitabilityRatio: 24
  }
];

export const initialKnittingRecords: KnittingRecord[] = [
  {
    id: "knit-001",
    date: "2026-05-23",
    shift: "Day",
    machineId: "OJ-ST-05",
    operatorName: "Abdul Karim",
    orderNo: "ORD-2026-801",
    styleNo: "STY-HM-221",
    bodyPart: "Front",
    targetQty: 120,
    achievedQty: 118,
    reworkQty: 2,
    rejectQty: 0,
    downtimeMinutes: 15,
    downtimeReason: "Yarn breakage due to cone tension",
    checkedBy: "Saddat Rahman"
  },
  {
    id: "knit-002",
    date: "2026-05-23",
    shift: "Day",
    machineId: "OJ-SM-12",
    operatorName: "Hasibul Alam",
    orderNo: "ORD-2026-802",
    styleNo: "STY-ZRA-092",
    bodyPart: "Back",
    targetQty: 95,
    achievedQty: 92,
    reworkQty: 1,
    rejectQty: 2,
    downtimeMinutes: 20,
    downtimeReason: "Pattern file reload and program buffer calibration",
    checkedBy: "Saddat Rahman"
  }
];

export const initialInventoryItems: InventoryItem[] = [
  {
    id: "inv-001",
    itemCode: "YRN-ACY-32",
    category: "Yarn",
    name: "Acrylic Cashlike 2/32 Yarn",
    countOrSpec: "Col. Navy Blue Cone 1.4Kg",
    shadeNo: "Shade Navy-102",
    supplierName: "Dhaka Spinners Ltd.",
    uom: "Kg",
    currentQty: 14200,
    allocatedQty: 11500,
    reorderLevel: 5000,
    averageRate: 380, // BDT
    lastReceiveDate: "2026-05-15"
  },
  {
    id: "inv-002",
    itemCode: "YRN-COT-40",
    category: "Yarn",
    name: "Mercerized Cotton 2/40 Yarn",
    countOrSpec: "Col. Bleached Off-White",
    shadeNo: "Shade WHT-01",
    supplierName: "Narayanganj Dyed Yarn Co.",
    uom: "Kg",
    currentQty: 3200, // VERY LOW STOCK compared to allocated
    allocatedQty: 12000,
    reorderLevel: 4000,
    averageRate: 460, // BDT
    lastReceiveDate: "2026-05-18"
  },
  {
    id: "inv-003",
    itemCode: "ACC-ZIPP-05",
    category: "Accessories",
    name: "YKK Sweatpart Metal Zipper 6-inch",
    countOrSpec: "Nickel Finish Dark Blue Ribbon",
    supplierName: "YKK Bangladesh Co.",
    uom: "Pcs",
    currentQty: 28000,
    allocatedQty: 25000,
    reorderLevel: 10000,
    averageRate: 42, // BDT
    lastReceiveDate: "2026-05-02"
  },
  {
    id: "inv-004",
    itemCode: "MST-NDL-07",
    category: "Spare Parts",
    name: "Stoll Stoll-12GG Knitting Needles Voigt-02",
    countOrSpec: "Gauge 12 Groz-Beckert Hooks",
    supplierName: "Euro Machinery Gazipur",
    uom: "Box",
    currentQty: 85,
    allocatedQty: 20,
    reorderLevel: 50,
    averageRate: 1250, // BDT
    lastReceiveDate: "2026-05-10"
  }
];

export const initialMachines: Machine[] = [
  { id: "mac-001", machineNo: "OJ-ST-05", brand: "Stoll", gauge: "12GG", capacityPcsPerDay: 130, location: "Floor 3 West Wing", status: "Running" },
  { id: "mac-002", machineNo: "OJ-ST-06", brand: "Stoll", gauge: "12GG", capacityPcsPerDay: 130, location: "Floor 3 West Wing", status: "Under Maintenance" },
  { id: "mac-003", machineNo: "OJ-SM-12", brand: "Shima Seiki", gauge: "7GG", capacityPcsPerDay: 100, location: "Floor 3 East Wing", status: "Running" },
  { id: "mac-004", machineNo: "OJ-SM-13", brand: "Shima Seiki", gauge: "7GG", capacityPcsPerDay: 100, location: "Floor 4 Central Hall", status: "Running" },
  { id: "mac-005", machineNo: "OJ-KH-02", brand: "Kauo Heng", gauge: "3GG", capacityPcsPerDay: 80, location: "Floor 4 Central Hall", status: "Idle" }
];

export const initialChartOfAccounts: ChartOfAccount[] = [
  // Assets
  { code: "1001", name: "Cash in Hand", group: "Asset", balance: 500000, type: "Current Asset", parentGroup: "Assets", openingBalance: 500000, normalBalance: "Debit", status: "Active" },
  { code: "1101", name: "Bank Account", group: "Asset", balance: 14500000, type: "Current Asset", parentGroup: "Assets", openingBalance: 14500000, normalBalance: "Debit", status: "Active" },
  { code: "1201", name: "Accounts Receivable", group: "Asset", balance: 3500000, type: "Current Asset", parentGroup: "Assets", openingBalance: 3500000, normalBalance: "Debit", status: "Active" },
  { code: "1202", name: "Buyer Receivable", group: "Asset", balance: 5200000, type: "Current Asset", parentGroup: "Assets", openingBalance: 5200000, normalBalance: "Debit", status: "Active" },
  { code: "1301", name: "Employee Advance", group: "Asset", balance: 180000, type: "Current Asset", parentGroup: "Assets", openingBalance: 180000, normalBalance: "Debit", status: "Active" },
  { code: "1401", name: "Inventory - Yarn", group: "Asset", balance: 4500000, type: "Inventory Asset", parentGroup: "Assets", openingBalance: 4500000, normalBalance: "Debit", status: "Active" },
  { code: "1402", name: "Inventory - Accessories", group: "Asset", balance: 650000, type: "Inventory Asset", parentGroup: "Assets", openingBalance: 650000, normalBalance: "Debit", status: "Active" },
  { code: "1403", name: "Inventory - Spare Parts", group: "Asset", balance: 300000, type: "Inventory Asset", parentGroup: "Assets", openingBalance: 300000, normalBalance: "Debit", status: "Active" },
  { code: "1404", name: "Inventory - Packing Material", group: "Asset", balance: 250000, type: "Inventory Asset", parentGroup: "Assets", openingBalance: 250000, normalBalance: "Debit", status: "Active" },
  { code: "1501", name: "Fixed Assets", group: "Asset", balance: 1200000, type: "Fixed Asset", parentGroup: "Assets", openingBalance: 1200000, normalBalance: "Debit", status: "Active" },
  { code: "1502", name: "Machinery", group: "Asset", balance: 28000000, type: "Fixed Asset", parentGroup: "Assets", openingBalance: 28000000, normalBalance: "Debit", status: "Active" },
  { code: "1503", name: "Office Equipment", group: "Asset", balance: 750050, type: "Fixed Asset", parentGroup: "Assets", openingBalance: 750050, normalBalance: "Debit", status: "Active" },

  // Liabilities
  { code: "2001", name: "Accounts Payable", group: "Liability", balance: 2400000, type: "Current Liability", parentGroup: "Liabilities", openingBalance: 2400000, normalBalance: "Credit", status: "Active" },
  { code: "2002", name: "Supplier Payable", group: "Liability", balance: 1200000, type: "Current Liability", parentGroup: "Liabilities", openingBalance: 1200000, normalBalance: "Credit", status: "Active" },
  { code: "2101", name: "Salary Payable", group: "Liability", balance: 680000, type: "Current Liability", parentGroup: "Liabilities", openingBalance: 680000, normalBalance: "Credit", status: "Active" },
  { code: "2201", name: "Loan Payable", group: "Liability", balance: 5000000, type: "Long Term Liability", parentGroup: "Liabilities", openingBalance: 5000000, normalBalance: "Credit", status: "Active" },
  { code: "2301", name: "Tax Payable", group: "Liability", balance: 450000, type: "Current Liability", parentGroup: "Liabilities", openingBalance: 450000, normalBalance: "Credit", status: "Active" },
  { code: "2401", name: "Utility Payable", group: "Liability", balance: 115000, type: "Current Liability", parentGroup: "Liabilities", openingBalance: 115000, normalBalance: "Credit", status: "Active" },

  // Equity
  { code: "3001", name: "Owner Capital", group: "Equity", balance: 30000005, type: "Equity", parentGroup: "Equity", openingBalance: 30000005, normalBalance: "Credit", status: "Active" },
  { code: "3101", name: "Retained Earnings", group: "Equity", balance: 17714595, type: "Equity", parentGroup: "Equity", openingBalance: 17714595, normalBalance: "Credit", status: "Active" },

  // Income
  { code: "4001", name: "Sales Income", group: "Revenue", balance: 12450000, type: "Operating Revenue", parentGroup: "Income", openingBalance: 12450000, normalBalance: "Credit", status: "Active" },
  { code: "4002", name: "Buyer Order Income", group: "Revenue", balance: 0, type: "Operating Revenue", parentGroup: "Income", openingBalance: 0, normalBalance: "Credit", status: "Active" },
  { code: "4003", name: "Other Income", group: "Revenue", balance: 65000, type: "Other Revenue", parentGroup: "Income", openingBalance: 65000, normalBalance: "Credit", status: "Active" },

  // Cost Of Goods Sold
  { code: "5001", name: "Yarn Consumption Cost", group: "Expense", balance: 4200000, type: "COGS", parentGroup: "Cost of Goods Sold", openingBalance: 4200000, normalBalance: "Debit", status: "Active" },
  { code: "5002", name: "Accessories Consumption Cost", group: "Expense", balance: 350000, type: "COGS", parentGroup: "Cost of Goods Sold", openingBalance: 350000, normalBalance: "Debit", status: "Active" },
  { code: "5003", name: "Packing Material Cost", group: "Expense", balance: 180000, type: "COGS", parentGroup: "Cost of Goods Sold", openingBalance: 180000, normalBalance: "Debit", status: "Active" },
  { code: "5004", name: "Direct Labour Cost", group: "Expense", balance: 2800000, type: "COGS", parentGroup: "Cost of Goods Sold", openingBalance: 2800000, normalBalance: "Debit", status: "Active" },
  { code: "5005", name: "Production Cost", group: "Expense", balance: 120000, type: "COGS", parentGroup: "Cost of Goods Sold", openingBalance: 120000, normalBalance: "Debit", status: "Active" },

  // Expenses
  { code: "6001", name: "Salary Expense", group: "Expense", balance: 950550, type: "Operating Expense", parentGroup: "Expenses", openingBalance: 950550, normalBalance: "Debit", status: "Active" },
  { code: "6002", name: "Overtime Expense", group: "Expense", balance: 145000, type: "Operating Expense", parentGroup: "Expenses", openingBalance: 145000, normalBalance: "Debit", status: "Active" },
  { code: "6003", name: "Rent Expense", group: "Expense", balance: 400000, type: "Operating Expense", parentGroup: "Expenses", openingBalance: 400000, normalBalance: "Debit", status: "Active" },
  { code: "6004", name: "Utility Expense", group: "Expense", balance: 280000, type: "Operating Expense", parentGroup: "Expenses", openingBalance: 280000, normalBalance: "Debit", status: "Active" },
  { code: "6005", name: "Machine Maintenance Expense", group: "Expense", balance: 195000, type: "Operating Expense", parentGroup: "Expenses", openingBalance: 195000, normalBalance: "Debit", status: "Active" },
  { code: "6006", name: "Transport Expense", group: "Expense", balance: 65000, type: "Operating Expense", parentGroup: "Expenses", openingBalance: 65000, normalBalance: "Debit", status: "Active" },
  { code: "6007", name: "Food/Canteen Expense", group: "Expense", balance: 45000, type: "Operating Expense", parentGroup: "Expenses", openingBalance: 45000, normalBalance: "Debit", status: "Active" },
  { code: "6008", name: "Office Expense", group: "Expense", balance: 52000, type: "Operating Expense", parentGroup: "Expenses", openingBalance: 52000, normalBalance: "Debit", status: "Active" },
  { code: "6009", name: "Factory Overhead", group: "Expense", balance: 750000, type: "Operating Expense", parentGroup: "Expenses", openingBalance: 750000, normalBalance: "Debit", status: "Active" },
  { code: "6010", name: "Miscellaneous Expense", group: "Expense", balance: 12000, type: "Operating Expense", parentGroup: "Expenses", openingBalance: 12000, normalBalance: "Debit", status: "Active" }
];

export const initialJournalVouchers: JournalVoucher[] = [
  {
    id: "jv-001",
    voucherNo: "JV-202605-001",
    date: "2026-05-23",
    narration: "Yarn purchase from Dhaka Spinners Ltd. for HM Solid order",
    status: "Posted",
    items: [
      { accountCode: "5001", accountName: "Yarn Consumption Cost", debit: 450000, credit: 0 },
      { accountCode: "2001", accountName: "Accounts Payable", debit: 0, credit: 450000 }
    ],
    createdBy: "Kamran Hassan"
  },
  {
    id: "jv-002",
    voucherNo: "JV-202605-002",
    date: "2026-05-22",
    narration: "Urgent cash advance for custom Stoll machine needle spares",
    status: "Approved",
    items: [
      { accountCode: "1001", accountName: "Cash in Hand", debit: 0, credit: 35000 },
      { accountCode: "6005", accountName: "Machine Maintenance Expense", debit: 35000, credit: 0 }
    ],
    createdBy: "Kamran Hassan",
    approvedBy: "Tariqul Islam"
  }
];

export const initialPayrollRecords: PayrollRecord[] = [
  {
    id: "pay-101",
    employeeId: "OJ-001",
    employeeName: "Tariqul Islam",
    department: "Management",
    month: "May 2026",
    workedDays: 23,
    absentDays: 0,
    leaveDays: 0,
    holidayDays: 2,
    weekendDays: 4,
    lateMinutes: 15,
    earlyOutMinutes: 0,
    missingPunchesApproved: 0,
    missingPunchesUnapproved: 0,
    approvedManualCorrections: 0,
    normalOtHours: 0,
    festiveOtHours: 0,
    nightShiftDays: 0,
    nightShiftPremium: 0,
    basicSalary: 85000,
    grossSalary: 124000,
    otPayment: 0,
    attendanceBonus: 1000,
    canteenAllowance: 2000,
    nightShiftAllowance: 0,
    otherAllowance: 1000,
    allowances: 39000,
    deductions: 0,
    lateDeduction: 0,
    earlyOutDeduction: 0,
    advanceDeduction: 0,
    taxDeduction: 5200,
    netPayable: 119800,
    status: "Draft",
    paymentMethod: "Bank"
  },
  {
    id: "pay-102",
    employeeId: "OJ-021",
    employeeName: "Abdul Karim",
    department: "Production",
    month: "May 2026",
    workedDays: 22,
    absentDays: 1,
    leaveDays: 0,
    holidayDays: 2,
    weekendDays: 4,
    lateMinutes: 120,
    earlyOutMinutes: 15,
    missingPunchesApproved: 1,
    missingPunchesUnapproved: 0,
    approvedManualCorrections: 0,
    normalOtHours: 42,
    festiveOtHours: 0,
    nightShiftDays: 10,
    nightShiftPremium: 100,
    basicSalary: 22000,
    grossSalary: 36000,
    otPayment: 7850,
    attendanceBonus: 1500,
    canteenAllowance: 1500,
    nightShiftAllowance: 1000,
    otherAllowance: 500,
    allowances: 14000,
    deductions: 500,
    lateDeduction: 0,
    earlyOutDeduction: 0,
    advanceDeduction: 1000,
    taxDeduction: 0,
    netPayable: 45850,
    status: "Draft",
    paymentMethod: "Cash"
  }
];
