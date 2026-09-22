# Kyro — Centralized ISP Operations Platform

**Kyro** is a centralized ISP Operations & NOC Management platform frontend built for high-scale network visibility, incident intelligence, subscriber lifecycle management, and field operations.

![Kyro Network Operations Platform](https://img.shields.shields.io/badge/Platform-Kyro%20NOC-161b1d?style=for-the-badge&logo=react)
![License](https://img.shields.shields.io/badge/License-MIT-orange?style=for-the-badge)

---

## 🌟 Key Features & Operational Workflows

### 🛰️ Spatial 3D Network Twin & Digital Twin Telemetry
- **Interactive 3D Topology**: Render core routers, POP locations (Gulshan, Banani, Dhanmondi, Uttara), and fiber uplinks using Three.js.
- **Layer Toggles**: Real-time visualization overlays for **Health**, **Bandwidth Utilization**, and **Latency**.
- **Incident Inspection**: Node-level inspector with uplink metrics, packet loss indicators, affected subscriber counts, and 1-click incident escalation to NOC support.

### 👤 Subscriber Lifecycle & Directory Management
- **Centralized Customer Profiles**: Complete customer records with service plan details, IP allocations, service areas, and real-time status (`Active`, `Pending`, `Suspended`).
- **Actionable Drawers**: Quick-action drawers for plan modifications, service suspension/activation, linked invoices, support ticket history, and auto-saved internal team notes.
- **Batch Operations**: Bulk selection, filtering by service status, and CSV export capabilities.

### 🛠️ Support Ticket Management & SLA Tracking
- **NOC Support Desk**: Ticket tracking grouped by priority (`Critical`, `High`, `Normal`) and status (`Open`, `In progress`, `Pending customer`, `Resolved`).
- **Agent Allocation**: Assign cases to network engineers (e.g., Raihan Ahmed, Nusrat Jahan).
- **Incident Escalation Flow**: Directly escalate POP incidents into linked support tickets with pre-filled context.

### 🚜 Field Operations & Technical Dispatch
- **Kanban Dispatch Board**: Workflow lanes for `Scheduled`, `In progress`, and `Completed` field jobs.
- **Installation & Maintenance Checklists**: Step-by-step 4-point verification checklist (Location, Equipment, Signal Test, Customer Confirmation). Completing installation automatically provisions and activates customer connectivity.

### 💳 Billing, Invoicing & Financial Operations
- **Invoice Tracking**: Real-time status for `Paid`, `Due`, and `Overdue` invoices.
- **Payment Processing Simulation**: Recording payments automatically reactivates suspended customer accounts.
- **CSV Exports**: Generate receipt and invoice records in CSV format.

### 📦 Inventory & Equipment Assignment
- **Warehouse & Field Inventory**: Track ONT devices, routers, switches (Huawei EchoLife, TP-Link Archer, MikroTik CRS).
- **Dynamic Equipment Allocation**: Assign devices directly to customer profiles from the inventory grid.

### 🚀 Sales Pipeline & Growth Operations
- **Lead Kanban Board**: Conversion funnel from `New Lead` to `Qualified` to `Proposal`.
- **1-Click Customer Conversion**: Move winning proposals directly into customer creation with automated field installation job scheduling.

### ⌨️ Global Command Center (`⌘ K`)
- **Instant Search**: Command palette to jump across pages, search customers, or execute operational tasks instantly.

---

## 🛠️ Technology Stack

- **Framework**: React 18 & Vite
- **3D Visualization**: Three.js & OrbitControls
- **UI & Iconography**: Lucide React
- **Animations**: Framer Motion
- **Data Analytics**: Recharts
- **Styling**: Modern Vanilla CSS Design System with dark surface aesthetics, glassmorphism, and custom HSL color tokens.

---

## ⚡ Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation & Local Run

```sh
# Clone the repository
git clone https://github.com/nibir404/Kyro.git

# Navigate into the workspace
cd Kyro

# Install dependencies
npm install

# Start the Vite development server
npm run dev
```

The application will be running locally at `http://localhost:5173/`.

### Production Build

```sh
npm run build
```

The optimized production bundle will be generated in the `dist/` directory.

---

## 💾 State & Data Persistence

- All operational changes (customers, tickets, invoices, field jobs, equipment assignments, notes) persist locally in browser `localStorage` under `kyro-*` keys.
- To reset to the initial Dhaka ISP seed dataset, clear your browser's local storage for `localhost`.

---

## 📄 License

This project is licensed under the MIT License.

