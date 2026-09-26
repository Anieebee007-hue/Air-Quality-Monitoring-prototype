# Ward Shift-Handoff Console
### Theme: CIT-03 Air Quality Monitoring & Health Alert System
**Team: The Brainiacs (G1T3)**

An intelligent hospital ward shift-handoff console and air quality monitoring prototype designed to safeguard vulnerable inpatient populations by evaluating outdoor Air Quality Index (AQI) alongside internal HVAC/HEPA filtration status.

---

## 📌 Table of Contents
- [Overview](#-overview)
- [Key Features](#-key-features)
- [Clinical & Operational Logic](#-clinical--operational-logic)
- [Project Structure](#-project-structure)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [API Integration](#-api-integration)
- [Team & Module Ownership](#-team--module-ownership)

---

## 🏥 Overview

Air pollution is a major environmental threat to hospital inpatients, particularly those suffering from respiratory or post-operative conditions (e.g., COPD, acute bronchitis, thoracic surgeries). 

The **Ward Shift-Handoff Console** bridges environmental data with hospital operational protocols. It computes air quality risk bands in real time and automatically updates patient care advisories, respirator mandates (such as N95 protocols), and corridor transit precautions during clinical shift handoffs.

---

## ⚡ Key Features

- **🌐 Live Open-Meteo API Feed (Mode 1)**:
  - Fetches real-time hourly US AQI data based on GPS coordinates for key metropolitan hubs:
    - **Kolkata / Howrah** (`22.57° N, 88.36° E`)
    - **Delhi Central** (`28.61° N, 77.20° E`)
    - **Mumbai Coastal** (`19.07° N, 72.87° E`)
  - Includes adaptive city-themed visual backgrounds with automatic overlay adjustments.
- **🎛️ Manual Evaluator Override (Mode 2)**:
  - Designed for instructor testing and clinical drill simulations.
  - Allows manual AQI inputs (0–500) and HVAC failure simulations with quick-action presets:
    - **Safe** (AQI: 35)
    - **Caution** (AQI: 115)
    - **High** (AQI: 190)
- **🚨 Contextual Shift Alert Banner**:
  - Dynamically updates warning status bands (**Safe**, **Caution**, **High**) with specific clinical instructions.
- **🛏️ Active Ward Shift Bed-Board**:
  - Tracks inpatients with bed numbers, acuity levels (High, Medium, Low), clinical diagnoses, and automatically tagged respiratory precautions.
- **📊 24-Hour Historical Analytics**:
  - Interactive distribution bar chart powered by Chart.js displaying hourly AQI risk distribution.
  - Displays statistical percentages for Safe, Caution, and High risk hours observed over the last 24 hours.
- **📐 Interactive Decision Rule Modal**:
  - Built-in popup modal explaining the exact decision trees and algorithmic thresholds.

---

## 🧠 Clinical & Operational Logic

The core logic engine evaluates environmental particulate indices against hospital infrastructure integrity:

```
                      +-------------------+
                      |   Outdoor AQI     |
                      |   & HVAC Status   |
                      +---------+---------+
                                |
               +----------------+----------------+
               |                                 |
       AQI < 50 AND HVAC OK              AQI > 150 OR HVAC Offline?
               |                                 |
        +------+------+                   +------+------+
        |             |                   |             |
       YES            NO                 YES            NO
        |             |                   |             |
        v             v                   v             v
    [ SAFE ]    Check AQI <= 150       [ HIGH ]    [ CAUTION ]
```

### Risk Bands & Protocols

| Status | AQI Threshold | HVAC Filtration | Clinical Protocol & Precaution |
| :--- | :---: | :---: | :--- |
| <span style="color:#10b981; font-weight:bold;">Safe</span> | `< 50` | Operational | Ward routine normal. No additional respiratory PPE required. |
| <span style="color:#f59e0b; font-weight:bold;">Caution</span> | `50 – 150` | Offline / Clogged | Elevated particulate index or compromised filtration. Mask precautions advised for patient transfers; verify corridor doors are sealed. |
| <span style="color:#ef4444; font-weight:bold;">High</span> | `> 150` | Any Status | Hazardous outdoor spike. Mandate strict N95 respirators for all transit; hold non-urgent patient movement. |
| **Offline** | Missing / NaN | Any Status | Precautionary default to Caution; inspect sensor and local HVAC filtration immediately. |

---

## 📂 Project Structure

```plaintext
Air-Quality-Monitoring-prototype/
├── index.html        # Console UI structure, panels, and layouts
├── style.css         # Styling, CSS grid, dark theme, and status colors
├── app.js            # Core computational engine, API handlers, Chart.js logic
├── sounak-notes.js   # Module attribution notes
├── delhi.jpeg        # Background asset for Delhi hub
├── kolkataa.jpeg     # Background asset for Kolkata hub
├── mumbaii.jpeg      # Background asset for Mumbai hub
└── README.md         # Project documentation and specifications
```

---

## 🛠️ Tech Stack

- **Frontend**: HTML5, Modern CSS3 (CSS Grid, Flexbox, CSS Variables)
- **Programming Language**: Vanilla JavaScript (ES6+, Async/Await, Fetch API)
- **Data Visualization**: [Chart.js](https://www.chartjs.org/) (via CDN)
- **External API**: [Open-Meteo Air Quality API](https://open-meteo.com/en/docs/air-quality-api) (Free, no API key required)

---

## 🚀 Getting Started

### Prerequisites
No package manager or server runtime (Node.js/Python) is strictly required. A modern web browser with JavaScript enabled is sufficient.

### Installation & Execution

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Anieebee007-hue/Air-Quality-Monitoring-prototype.git
   cd Air-Quality-Monitoring-prototype
   ```

2. **Open in browser:**
   - Double-click `index.html` to open it directly in Google Chrome, Firefox, Safari, or Microsoft Edge.
   - Or serve with a local development server:
     ```bash
     # Using Python 3
     python -m http.server 8000

     # Using Node.js (npx)
     npx serve .
     ```
   - Navigate to `http://localhost:8000`.

---

## 📡 API Integration

The live telemetry feed pulls 24-hour hourly particulate and US AQI indices from the Open-Meteo Air Quality API:

```http
GET https://air-quality-api.open-meteo.com/v1/air-quality?latitude={LAT}&longitude={LON}&hourly=us_aqi&timezone=auto
```

If the network connection is unavailable or the API call fails, the dashboard automatically engages a graceful fallback to a synthetic dataset to guarantee high availability during critical medical operations.

---

## 👥 Team & Module Ownership

**Team: The Brainiacs (`G1T3`)**  
*Theme: CIT-03 Air Quality Monitoring & Health Alert System*

| Team Member | Role / Ownership | Primary Responsibilities |
| :--- | :--- | :--- |
| **Anirban** | **Surface Owner** | UI/UX console design, responsive styling, interactive layout, and visual city themes |
| **Sounak** | **Computation & Analysis Owner** | Algorithmic logic (`get_aq_status`), AQI risk categorization, and 24-hr Chart.js analytics |
| **Suprajit** | **Data Owner** | Inpatient dataset modeling, acuity classifications, and clinical precaution schemes |
| **Souryajit** | **Integration & Demo Owner** | Open-Meteo live API integration, data synchronization, and fail-safe cache mechanisms |
