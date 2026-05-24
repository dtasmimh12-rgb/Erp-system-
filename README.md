# OTTOMASS JACQUARD ERP: Firebase Integration Guide (Phase 1)

This repository contains the full integration of **Firebase Authentication** and **Cloud Firestore** for Phase 1 of the OTTOMASS JACQUARD Factory ERP system.

---

## 🛠️ Environment Setup

All Firebase Web SDK configuration keys and database identifiers are managed automatically inside `/firebase-applet-config.json` at the root of the project. This config structure was safely provisioned using the native AI Studio Firebase tools.

### `.env.example`
For dynamic service endpoints and runtime secrets, we support standard client/server options:
```env
# GEMINI_API_KEY: Required for Gemini AI API calls.
# AI Studio automatically injects this at runtime from user secrets.
GEMINI_API_KEY="MY_GEMINI_API_KEY"

# APP_URL: The URL where this applet is hosted.
# AI Studio automatically injects this at runtime with the Cloud Run service URL.
APP_URL="MY_APP_URL"
```

---

## 🔐 Authentication & Role-Based Access Control (RBAC)

We support **Email & Password Authentication** fully integrated with localized Firestore profiles.

### Administrative Structure
1. **Super Administrator (`dtasmimh18@gmail.com`)**:
   - The user's primary email has been fast-tracked in `firestore.rules` as the designated root administrator.
   - Root admins bypass standard lockouts and have read and write privileges across all collections (`companies`, `branches`, `vouchers`, etc.).

2. **System Roles (Stored in `/users/{userId}`)**:
   - **Office Manager (Employee)**: Full management credentials to edit/update all datasets, registers, and configurations.
   - **Executive Owner (Tariqul)**: Read-only dashboards containing factory state indicators and finances without write permissions.

---

## 💾 Firestore Collections Layout

The Firestore instance is organized with the following collection map (Phase 1 compliant):

1. **`/companies/{companyId}`**: General corporate profile parameters (Corporate Name, physical address, BIN register codes).
2. **`/companies/{companyId}/branches/{branchId}`**: Factory knitting plants.
3. **`/companies/{companyId}/departments/{departmentId}`**: Unit departments.
4. **`/employees/{employeeId}`**: Worker demographics, RFID cards, and biometric index files.
5. **`/attendance_logs/{logId}`**: Biometric shift events.
6. **`/orders/{orderId}`**: Style specifications and quantities.
7. **`/vouchers/{voucherId}`**: Double entry journal accounts ledgers.
8. **`/audit_logs/{logId}`**: Sealed immutable security logs.
9. **`/users/{userId}`**: User profile registry mapping Firebase Authentication UIDs to their RBAC Roles.

---

## 🚀 Getting Started

1. **Dynamic Seeding**:
   - On the absolute first boot, the system automatically checks if `/companies/ottomass-jacquard` exists.
   - If missing, the bootstrapper automatically seeds default branches, expert grades, shift structures, orders, and initial employee profiles into Firestore.

2. **Sign In / Registration**:
   - Toggle "Create one" under the login form to register a new tenant account with any customized role.
   - Use **Bootstrap Demo Profiles** on the landing screen to instantly log in as pre-seeded sandbox characters using secure live Firebase Auth.
