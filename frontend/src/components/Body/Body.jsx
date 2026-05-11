// import React, { useEffect, useState } from "react";
// import { Line } from "react-chartjs-2";
// import { Container, Row, Col, Form, Card, Spinner } from "react-bootstrap";
// import { FaThermometerHalf, FaTint, FaCloudRain } from "react-icons/fa";
// import { BsSun } from "react-icons/bs";
// import axios from "axios";
// import "./Body.css";

// import {
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   Title,
//   Tooltip,
//   Legend,
//   Filler,
// } from "chart.js";

// ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

// const chartOptions = {
//   responsive: true,
//   maintainAspectRatio: false,
//   plugins: { legend: { position: "bottom" } },
//   scales: {
//     y: { beginAtZero: false, ticks: { color: "#555" } },
//     x: { ticks: { color: "#555" } },
//   },
// };

// const stationList = [
//   "Ambaganctg","Barisal","Bhola","Bogra","Chandpur","Chittagong","Chuadanga","Comilla","Coxsbazar",
//   "Dhaka","Dinajpur","Faridpur","Feni","Hatiya","Ishurdi","Jessore","Khepupara","Khulna","Kutubdia",
//   "Madaripur","Mcourt","Mongla","Mymensingh","Patuakhali","Rajshahi","Rangamati","Rangpur","Sandwip",
//   "Satkhira","Sitakunda","Srimangal","Sydpur","Sylhet","Tangail","Teknaf"
// ];

// function Body() {
//   const [station, setStation] = useState("Dhaka");
//   const [latestData, setLatestData] = useState(null);
//   const [tomorrowData, setTomorrowData] = useState(null);
//   const [loadingPred, setLoadingPred] = useState(false);
//   const [chartData, setChartData] = useState({
//     labels: [],
//     temperature: [],
//     humidity: [],
//     rain: [],
//     ldr: [],
//   });

//   const fetchData = async (selectedStation) => {
//     try {
//       const token = localStorage.getItem("access_token");

//       // latest row
//       const latestRes = await axios.get("http://localhost:8000/data/user/latest", {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       const latest = latestRes.data;
//       setLatestData({
//         temperature: latest.temperature,
//         humidity: latest.humidity,
//         rainDensity: latest.rain_density,
//         ldr: latest.ldr_value,
//         date: latest.created_at,
//       });

//       // last 10 readings
//       const allRes = await axios.get("http://localhost:8000/data/user", {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       const last10 = allRes.data.slice(0, 10).reverse();
//       setChartData({
//         labels: last10.map((d) => new Date(d.created_at).toLocaleTimeString()),
//         temperature: last10.map((d) => d.temperature),
//         humidity: last10.map((d) => d.humidity),
//         rain: last10.map((d) => d.rain_density),
//         ldr: last10.map((d) => d.ldr_value),
//       });

//       // prediction
// // ---------- prediction (build from `latest` object, not state) ----------
// setLoadingPred(true);

// // helper: safe numeric
// const toNum = (v, fallback = 0) => {
//   const n = Number(v);
//   return Number.isFinite(n) ? n : fallback;
// };

// // latest keys come from backend as snake_case
// const tempC          = toNum(latest.temperature);
// const humidityPct    = toNum(latest.humidity);
// const rainfallMm     = toNum(latest.rain_density);    // was causing NaN if you used latest.rainDensity
// const sunshineProxy  = toNum(latest.ldr_value);       // was causing NaN if you used latest.ldr

// const tomorrowReq = {
//   Station: [selectedStation],
//   Temp_C: [tempC],
//   Humidity_pct: [humidityPct],
//   Sunshine_hours: [sunshineProxy],    // mapping LDR → sunshine proxy
//   Rainfall_mm: [rainfallMm],
//   Date: [new Date().toISOString().slice(0, 10)],      // "YYYY-MM-DD"
// };

// const predRes = await axios.post("http://localhost:8000/predict-weather", tomorrowReq, {
//   headers: {
//     Authorization: `Bearer ${token}`,
//     "Content-Type": "application/json",
//   },
// });

// setTomorrowData(predRes.data[0]);  // backend returns a list
// setLoadingPred(false);


//     } catch (err) {
//       console.error("Error fetching data:", err);
//       setLoadingPred(false);
//     }
//   };

//   useEffect(() => {
//     fetchData(station);
//     const intervalId = setInterval(() => fetchData(station), 5000);
//     return () => clearInterval(intervalId);
//   }, [station]);

//   const combinedGraphData = {
//     labels: chartData.labels,
//     datasets: [
//       { label: "Temperature (°C)", data: chartData.temperature, borderColor: "#ff4500", backgroundColor: "rgba(255,69,0,0.2)", fill: true },
//       { label: "Humidity (%)", data: chartData.humidity, borderColor: "#1e90ff", backgroundColor: "rgba(30,144,255,0.2)", fill: true },
//       { label: "Rain Density", data: chartData.rain, borderColor: "#4682b4", backgroundColor: "rgba(70,130,180,0.2)", fill: true },
//       { label: "Sunshine (LDR)", data: chartData.ldr, borderColor: "#daa520", backgroundColor: "rgba(218,165,32,0.2)", fill: true },
//     ],
//   };

//   const infoBox = (icon, label, value, className) => (
//     <Card className={`info-card text-center ${className}`}>
//       <Card.Body>
//         <div className="icon">{icon}</div>
//         <h6 className="mt-2">{label}</h6>
//         <h4>{value}</h4>
//       </Card.Body>
//     </Card>
//   );

//   return (
//     <Container className="my-5">
//       <Card className="p-4 shadow-sm rounded dashboard-container">
//         <Form.Group className="mb-4">
//           <Form.Label className="fw-bold">Select Station</Form.Label>
//           <Form.Select value={station} onChange={(e) => setStation(e.target.value)}>
//             {stationList.map((s) => (
//               <option key={s} value={s}>{s}</option>
//             ))}
//           </Form.Select>
//         </Form.Group>

//         {latestData && (
//           <>
//             <h5 className="fw-bold mb-3">Today’s Observations</h5>
//             <Row className="mb-4">
//   <Col xs={12} md={3}>
//     {infoBox(
//       <FaThermometerHalf size={28} />,
//       "Temperature",
//       `${Number(latestData.temperature).toFixed(2)} °C`,
//       "temperature-box"
//     )}
//   </Col>
//   <Col xs={12} md={3}>
//     {infoBox(
//       <FaTint size={28} />,
//       "Humidity",
//       `${Number(latestData.humidity).toFixed(2)} %`,
//       "humidity-box"
//     )}
//   </Col>
//   <Col xs={12} md={3}>
//     {infoBox(
//       <FaCloudRain size={28} />,
//       "Rainfall",
//       `${Number(latestData.rainDensity).toFixed(2)} mm`,
//       "rain-box"
//     )}
//   </Col>
//   <Col xs={12} md={3}>
//     {infoBox(
//       <BsSun size={28} />,
//       "Sunshine (LDR)",
//       Number(latestData.ldr).toFixed(2),
//       "ldr-box"
//     )}
//   </Col>
// </Row>

//           </>
//         )}

//         {loadingPred && <Spinner animation="border" role="status"><span className="visually-hidden">Loading...</span></Spinner>}
//         {tomorrowData && !loadingPred && (
//           <>
//             <h5 className="fw-bold mb-3">Tomorrow’s Forecast</h5>
//             <Row className="mb-4">
//   <Col xs={12} md={4}>
//     {infoBox(
//       <FaThermometerHalf size={28} />,
//       "Temperature",
//       `${Number(tomorrowData.TempTomorrow_C).toFixed(2)} °C`,
//       "temperature-box"
//     )}
//   </Col>
//   <Col xs={12} md={4}>
//     {infoBox(
//       <FaTint size={28} />,
//       "Humidity",
//       `${Number(tomorrowData.HumidityTomorrow_pct).toFixed(2)} %`,
//       "humidity-box"
//     )}
//   </Col>
//   <Col xs={12} md={4}>
//     {infoBox(
//       <FaCloudRain size={28} />,
//       "Rain",
//       tomorrowData.RainTomorrow_pred
//         ? `Rain (${(tomorrowData.RainTomorrow_prob * 100).toFixed(0)}%)`
//         : `No Rain (${(tomorrowData.RainTomorrow_prob * 100).toFixed(0)}%)`,
//       "rain-box"
//     )}
//   </Col>
// </Row>

//           </>
//         )}

//         <h5 className="fw-bold mb-3">Recent Trends (last 10 readings)</h5>
//         <div className="graph-placeholder mb-3">
//           <Line data={combinedGraphData} options={chartOptions} style={{ height: "400px", width: "100%" }} />
//         </div>
//       </Card>
//     </Container>
//   );
// }

// export default Body;


import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import { Container, Row, Col, Form, Card, Spinner, Modal, Button, Badge } from "react-bootstrap";
import { FaThermometerHalf, FaTint, FaCloudRain } from "react-icons/fa";
import { BsSun, BsEye } from "react-icons/bs";
import axios from "axios";
import "./Body.css";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,

  plugins: {
    legend: {
      position: "bottom",
      labels: { font: { size: 20 } }, // Bigger legend
    },
    tooltip: {
      titleFont: { size: 20 },
      bodyFont: { size: 18 },
    },
  },

  scales: {
    y: {
      beginAtZero: false,
      ticks: {
        color: "#555",
        font: { size: 18 }, // Bigger numbers
      },
    },
    x: {
      ticks: {
        color: "#555",
        font: { size: 18 }, // Bigger numbers
      },
    },
  },
};

const stationList = [
  "Ambaganctg","Barisal","Bhola","Bogra","Chandpur","Chittagong","Chuadanga","Comilla","Coxsbazar",
  "Dhaka","Dinajpur","Faridpur","Feni","Hatiya","Ishurdi","Jessore","Khepupara","Khulna","Kutubdia",
  "Madaripur","Mcourt","Mongla","Mymensingh","Patuakhali","Rajshahi","Rangamati","Rangpur","Sandwip",
  "Satkhira","Sitakunda","Srimangal","Sydpur","Sylhet","Tangail","Teknaf"
];

function Body() {
  const [station, setStation] = useState("Dhaka");
  const [latestData, setLatestData] = useState(null);
  const [tomorrowData, setTomorrowData] = useState(null);
  const [impacts, setImpacts] = useState({ rain: [], temp: [], hum: [] }); // NEW
  const [loadingPred, setLoadingPred] = useState(false);
  const [chartData, setChartData] = useState({
    labels: [],
    temperature: [],
    humidity: [],
    rain: [],
    ldr: [],
  });

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [inspectType, setInspectType] = useState(null); // "temp" | "hum" | "rain"

  const fetchData = async (selectedStation) => {
    try {
      const token = localStorage.getItem("access_token");

      // latest row
      const latestRes = await axios.get("http://localhost:8000/data/user/latest", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const latest = latestRes.data;
      setLatestData({
        temperature: latest.temperature,
        humidity: latest.humidity,
        rainDensity: latest.rain_density,
        ldr: latest.ldr_value,
        date: latest.created_at,
      });

      // last 10 readings
      const allRes = await axios.get("http://localhost:8000/data/user", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const last10 = allRes.data.slice(0, 10).reverse();
      setChartData({
        labels: last10.map((d) => new Date(d.created_at).toLocaleTimeString()),
        temperature: last10.map((d) => d.temperature),
        humidity: last10.map((d) => d.humidity),
        rain: last10.map((d) => d.rain_density),
        ldr: last10.map((d) => d.ldr_value),
      });

      // ---------- prediction + explanations ----------
      setLoadingPred(true);

      const toNum = (v, fallback = 0) => {
        const n = Number(v);
        return Number.isFinite(n) ? n : fallback;
      };

      const tempC         = toNum(latest.temperature);
      const humidityPct   = toNum(latest.humidity);
      const rainfallMm    = toNum(latest.rain_density);
      const sunshineProxy = toNum(latest.ldr_value);

      const tomorrowReq = {
        Station: [selectedStation],
        Temp_C: [tempC],
        Humidity_pct: [humidityPct],
        Sunshine_hours: [sunshineProxy],
        Rainfall_mm: [rainfallMm],
        Date: [new Date().toISOString().slice(0, 10)],
      };

      // IMPORTANT: use /predict-explain to get both predictions and impacts in one response
      const predRes = await axios.post("http://localhost:8000/predict-explain", tomorrowReq, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const item = predRes.data[0];
      setTomorrowData(item);
      setImpacts(item.impacts || { rain: [], temp: [], hum: [] });

      setLoadingPred(false);
    } catch (err) {
      console.error("Error fetching data:", err);
      setLoadingPred(false);
    }
  };

  useEffect(() => {
    fetchData(station);
    const intervalId = setInterval(() => fetchData(station), 5000);
    return () => clearInterval(intervalId);
  }, [station]);

  const combinedGraphData = {
    labels: chartData.labels,
    datasets: [
      { label: "Temperature (°C)", data: chartData.temperature, borderColor: "#ff4500", backgroundColor: "rgba(255,69,0,0.2)", fill: true, borderWidth: 3,          // thicker lines (optional)
    pointRadius: 5,          // bigger points (optional)
    pointHoverRadius: 7 },
      { label: "Humidity (%)", data: chartData.humidity, borderColor: "#1e90ff", backgroundColor: "rgba(30,144,255,0.2)", fill: true, borderWidth: 3, pointRadius: 5, pointHoverRadius: 7 },
      { label: "Rain Density", data: chartData.rain, borderColor: "#4682b4", backgroundColor: "rgba(70,130,180,0.2)", fill: true, borderWidth: 3, pointRadius: 5, pointHoverRadius: 7 },
      { label: "Sunshine (LDR)", data: chartData.ldr, borderColor: "#daa520", backgroundColor: "rgba(218,165,32,0.2)", fill: true, borderWidth: 3, pointRadius: 5, pointHoverRadius: 7 },
    ],
  };

  // Badge color by impact level
  const levelBadge = (level) => {
    const lv = (level || "").toLowerCase();
    if (lv === "high") return <Badge bg="danger">High</Badge>;
    if (lv === "medium") return <Badge bg="warning" text="dark">Medium</Badge>;
    return <Badge bg="secondary">Low</Badge>;
  };

  // one card with an eye button
  const infoBox = (icon, label, value, className, onInspect) => (
    <Card className={`info-card text-center ${className}`}>
      <Card.Body>
        <div className="d-flex justify-content-between align-items-start">
          <div className="icon">{icon}</div>
          {onInspect && (
            <Button
              variant="outline-secondary"
              size="sm"
              className="rounded-circle"
              title="See reasons"
              onClick={onInspect}
            >
              <BsEye />
            </Button>
          )}
        </div>
        <h3 className="mt-2">{label}</h3>
        <h4 className="mb-0">{value}</h4>
      </Card.Body>
    </Card>
  );

  // Modal content for the selected type
  const renderImpactList = (list = []) => {
    if (!list.length) return <div className="text-muted">No explanation available.</div>;
    return (
      <div className="mt-2">
        {list.map((it, idx) => (
          <div key={idx} className="d-flex justify-content-between align-items-center py-1 border-bottom">
            <div className="text-truncate" style={{ maxWidth: 240 }}>
              {it.feature}
            </div>
            <div className="ms-2 small text-muted">{it.shap_value?.toFixed ? it.shap_value.toFixed(4) : it.shap_value}</div>
            <div className="ms-2">{levelBadge(it.impact_level)}</div>
          </div>
        ))}
      </div>
    );
  };

  const openReasons = (type) => {
    setInspectType(type);
    setShowModal(true);
  };

  return (
    <Container className="my-5">
      <Card className="p-4 shadow-sm rounded dashboard-container">
        <Form.Group className="mb-4">
          <Form.Label className="fw-bold">Select Station</Form.Label>
          <Form.Select value={station} onChange={(e) => setStation(e.target.value)}>
            {stationList.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </Form.Select>
        </Form.Group>

        {latestData && (
          <>
            <h5 className="fw-bold mb-3">Today’s Observations</h5>
            <Row className="mb-4">
              <Col xs={12} md={3}>
                {infoBox(<FaThermometerHalf size={28} />, "Temperature",
                  `${Number(latestData.temperature).toFixed(2)} °C`, "temperature-box")}
              </Col>
              <Col xs={12} md={3}>
                {infoBox(<FaTint size={28} />, "Humidity",
                  `${Number(latestData.humidity).toFixed(2)} %`, "humidity-box")}
              </Col>
              <Col xs={12} md={3}>
                {infoBox(<FaCloudRain size={28} />, "Rainfall",
                  `${Number(latestData.rainDensity).toFixed(2)} mm`, "rain-box")}
              </Col>
              <Col xs={12} md={3}>
                {infoBox(<BsSun size={28} />, "Sunshine (LDR)",
                  Number(latestData.ldr).toFixed(2), "ldr-box")}
              </Col>
            </Row>
          </>
        )}

        {loadingPred && <Spinner animation="border" role="status"><span className="visually-hidden">Loading...</span></Spinner>}

        {tomorrowData && !loadingPred && (
          <>
            <h5 className="fw-bold mb-3">Tomorrow’s Forecast</h5>
            <Row className="mb-4">
              <Col xs={12} md={4}>
                {infoBox(
                  <FaThermometerHalf size={28} />,
                  "Temperature",
                  `${Number(tomorrowData.TempTomorrow_C).toFixed(2)} °C`,
                  "temperature-box",
                  () => openReasons("temp")
                )}
              </Col>
              <Col xs={12} md={4}>
                {infoBox(
                  <FaTint size={28} />,
                  "Humidity",
                  `${Number(tomorrowData.HumidityTomorrow_pct).toFixed(2)} %`,
                  "humidity-box",
                  () => openReasons("hum")
                )}
              </Col>
              <Col xs={12} md={4}>
                {infoBox(
                  <FaCloudRain size={28} />,
                  "Rain",
                  tomorrowData.RainTomorrow_pred
                    ? `Rain (${(tomorrowData.RainTomorrow_prob * 100).toFixed(0)}%)`
                    : `No Rain (${(tomorrowData.RainTomorrow_prob * 100).toFixed(0)}%)`,
                  "rain-box",
                  () => openReasons("rain")
                )}
              </Col>
            </Row>
          </>
        )}

        <h5 className="fw-bold mb-3">Recent Trends (last 10 readings)</h5>
        <div className="graph-placeholder mb-3">
          <Line data={combinedGraphData} options={chartOptions} style={{ height: "400px", width: "100%" }} />
        </div>
      </Card>

      {/* Reasons Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {inspectType === "rain" && "Why this Rain prediction?"}
            {inspectType === "temp" && "Why this Temperature prediction?"}
            {inspectType === "hum"  && "Why this Humidity prediction?"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {inspectType === "rain" && renderImpactList(impacts.rain)}
          {inspectType === "temp" && renderImpactList(impacts.temp)}
          {inspectType === "hum"  && renderImpactList(impacts.hum)}
          <div className="small text-muted mt-3">
            Impact levels are based on each feature’s share of the total absolute SHAP contribution for this prediction.
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Close</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default Body;
