// 1. Synthetic Hospital Patient Records (Data Owner SD)
const wardPatients = [
  { bed: "301-A", name: "K. Sengupta", acuity: "High", diagnosis: "COPD Exacerbation", precaution: "Strict N95 respirator during corridor transit" },
  { bed: "301-B", name: "R. Sharma", acuity: "Medium", diagnosis: "Post-Op Thoracic", precaution: "Routine ward air monitoring" },
  { bed: "302-A", name: "D. Mukherjee", acuity: "Low", diagnosis: "Stable Observation", precaution: "Standard precaution" },
  { bed: "303-A", name: "P. Agarwal", acuity: "High", diagnosis: "Acute Bronchitis", precaution: "Keep near HEPA terminal; seal entryway" }
];

let currentMode = "live";
let hourlyAqiSeries = [45, 48, 52, 65, 88, 115, 140, 168, 185, 172, 145, 130, 120, 110, 105, 95, 88, 122, 148, 162, 138, 92, 65, 48];
let chartInstance = null;

const cityBackgrounds = {
  kolkata: "kolkataa.jpeg",
  delhi: "delhi.jpeg",
  mumbai: "mumbaii.jpeg"
};

function applyCityBackground(city) {
  const selectedCity = cityBackgrounds[city] || cityBackgrounds.kolkata;
  document.body.style.backgroundImage = `linear-gradient(rgba(11, 19, 41, 0.74), rgba(11, 19, 41, 0.74)), url("${selectedCity}")`;
  document.body.style.backgroundSize = "cover";
  document.body.style.backgroundPosition = "center";
  document.body.style.backgroundRepeat = "no-repeat";
  document.body.style.backgroundAttachment = "fixed";
}

// 2. Programmatic Processing Function (Computation Owner SoG - Lab 6 B4 & Lab 7 B1)
function get_aq_status(outdoor_aqi, filtration_ok) {
  if (outdoor_aqi === "" || isNaN(outdoor_aqi)) {
    return {
      band: "Caution",
      heading: "Sensor Offline / Input Missing",
      sub: "Precautionary default: Inspect local HVAC filtration immediately.",
      color: "var(--caution)"
    };
  }
  const val = parseFloat(outdoor_aqi);
  if (val < 50 && filtration_ok) {
    return {
      band: "Safe",
      heading: "Air Quality: Safe",
      sub: "Ward routine normal. No additional respiratory PPE required.",
      color: "var(--safe)"
    };
  } else if (val <= 150 || !filtration_ok) {
    return {
      band: "Caution",
      heading: "Air Quality: Caution — check mask supply",
      sub: !filtration_ok
        ? "Ward filtration offline or clogged! Keep corridor access doors closed."
        : "Elevated particulate index. Mask precautions advised for transfers.",
      color: "var(--caution)"
    };
  } else {
    return {
      band: "High",
      heading: "Air Quality: High — avoid corridor if possible",
      sub: "Hazardous outdoor air spike. Mandate N95 for all transit; hold non-urgent movement.",
      color: "var(--high)"
    };
  }
}

// 3. UI Synchronization
function updateHandoffBoard(aqiValue, isFiltrationOk, sourceLabel) {
  const result = get_aq_status(aqiValue, isFiltrationOk);

  const banner = document.getElementById("statusBanner");
  banner.className = `banner ${result.band}`;
  document.getElementById("badgeText").textContent = result.band;
  document.getElementById("bannerTitle").textContent = result.heading;
  document.getElementById("bannerSub").textContent = result.sub;
  document.getElementById("feedModeTag").textContent = sourceLabel;

  document.getElementById("patientTable").innerHTML = wardPatients.map(p => `
    <tr>
      <td><strong>${p.bed}</strong></td>
      <td>${p.name}</td>
      <td><span class="acuity acuity-${p.acuity}">${p.acuity}</span></td>
      <td>${p.diagnosis}</td>
      <td>
        <span style="font-weight:700; color:${result.color};">● [${result.band}]</span>
        <span style="color:var(--muted); font-size:0.85rem; margin-left:4px;">
          ${result.band === "High" ? "Urgent respiratory precautions applied" : p.precaution}
        </span>
      </td>
    </tr>
  `).join("");
}

// 4. Data Science Chart Rendering
function renderAnalyticsChart() {
  let counts = { safe: 0, caution: 0, high: 0 };
  hourlyAqiSeries.forEach(v => {
    if (v < 50) counts.safe++;
    else if (v <= 150) counts.caution++;
    else counts.high++;
  });

  const total = hourlyAqiSeries.length;
  document.getElementById("safePercent").textContent = Math.round((counts.safe / total) * 100) + "%";
  document.getElementById("cautionPercent").textContent = Math.round((counts.caution / total) * 100) + "%";
  document.getElementById("highPercent").textContent = Math.round((counts.high / total) * 100) + "%";

  const ctx = document.getElementById("distributionChart");
  if (typeof Chart !== "undefined" && ctx) {
    if (chartInstance) chartInstance.destroy();
    chartInstance = new Chart(ctx, {
      type: "bar",
      data: {
        labels: ["Safe (<50)", "Caution (50-150)", "High (>150)"],
        datasets: [{
          label: "Hours Observed",
          data: [counts.safe, counts.caution, counts.high],
          backgroundColor: ["#10b981", "#f59e0b", "#ef4444"],
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, grid: { color: "#263859" }, ticks: { color: "#94a3b8" } },
          x: { grid: { display: false }, ticks: { color: "#94a3b8" } }
        }
      }
    });
  }
}

// 5. Mode Switching & Event Logic
function switchMode(mode) {
  currentMode = mode;
  document.getElementById("btnTabLive").className = `tab-btn ${mode === 'live' ? 'active' : ''}`;
  document.getElementById("btnTabManual").className = `tab-btn ${mode === 'manual' ? 'active' : ''}`;
  document.getElementById("sectionLive").className = `panel mode-section ${mode === 'live' ? 'active' : ''}`;
  document.getElementById("sectionManual").className = `panel mode-section ${mode === 'manual' ? 'active' : ''}`;

  if (mode === "manual") {
    triggerManualCalculation();
  } else {
    fetchLiveAirQuality();
  }
}

function setPreset(val, filter) {
  document.getElementById("manualAqi").value = val;
  document.getElementById("manualFiltration").value = filter ? "true" : "false";
  triggerManualCalculation();
}

function triggerManualCalculation() {
  const val = document.getElementById("manualAqi").value;
  const filter = document.getElementById("manualFiltration").value === "true";

  if (val === "" || isNaN(val)) {
    hourlyAqiSeries = [45, 48, 52, 65, 88, 115, 140, 168, 185, 172, 145, 130, 120, 110, 105, 95, 88, 122, 148, 162, 138, 92, 65, 48];
  } else {
    const numericVal = Number(val);
    hourlyAqiSeries = Array(24).fill(numericVal);
  }

  updateHandoffBoard(val, filter, "Manual Evaluator Override");
  renderAnalyticsChart();
}

// Live Open-Meteo API query
async function fetchLiveAirQuality() {
  const btn = document.getElementById("btnRefreshLive");
  btn.textContent = "Querying Live API...";
  
  const city = document.getElementById("liveCitySelect").value;
  applyCityBackground(city);

  const coords = {
    kolkata: { lat: 22.5726, lon: 88.3639 },
    delhi: { lat: 28.6139, lon: 77.2090 },
    mumbai: { lat: 19.0760, lon: 72.8777 }
  }[city];

  try {
    const res = await fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${coords.lat}&longitude=${coords.lon}&hourly=us_aqi&timezone=auto`);
    const data = await res.json();
    if (data.hourly && data.hourly.us_aqi) {
      const valid = data.hourly.us_aqi.filter(v => v !== null);
      hourlyAqiSeries = valid.slice(-24);
      const currentAqi = Math.round(hourlyAqiSeries[hourlyAqiSeries.length - 1]);
      const filter = document.getElementById("liveFiltration").value === "true";

      updateHandoffBoard(currentAqi, filter, `Live API (${city.toUpperCase()}: ${currentAqi} AQI)`);
      renderAnalyticsChart();
    }
  } catch (err) {
    alert("Live API call failed. Using offline synthetic dataset cache.");
    triggerManualCalculation();
  } finally {
    btn.textContent = "Query Live Air Quality API";
  }
}

// Event Listeners
document.getElementById("btnRefreshLive").addEventListener("click", fetchLiveAirQuality);
document.getElementById("liveFiltration").addEventListener("change", fetchLiveAirQuality);
document.getElementById("liveCitySelect").addEventListener("change", fetchLiveAirQuality);

document.getElementById("manualAqi").addEventListener("input", triggerManualCalculation);
document.getElementById("manualFiltration").addEventListener("change", triggerManualCalculation);

const formulaToggleBtn = document.getElementById("formulaToggleBtn");
const formulaPopup = document.getElementById("formulaPopup");
const formulaCloseBtn = document.getElementById("formulaCloseBtn");

if (formulaToggleBtn && formulaPopup && formulaCloseBtn) {
  formulaToggleBtn.addEventListener("click", () => {
    formulaPopup.classList.toggle("hidden");
  });

  formulaCloseBtn.addEventListener("click", () => {
    formulaPopup.classList.add("hidden");
  });

  formulaPopup.addEventListener("click", (event) => {
    if (event.target === formulaPopup) {
      formulaPopup.classList.add("hidden");
    }
  });
}

window.addEventListener("DOMContentLoaded", () => {
  const initialCity = document.getElementById("liveCitySelect").value;
  applyCityBackground(initialCity);
  fetchLiveAirQuality();
  renderAnalyticsChart();
});