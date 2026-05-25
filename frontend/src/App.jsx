import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  RadialBarChart,
  RadialBar,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

import {
  FaShieldAlt,
  FaDownload,
  FaNetworkWired,
  FaSearch,
  FaUnlockAlt,
  FaHistory,
  FaGlobe,
} from "react-icons/fa";

const MatrixBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resize();
    window.addEventListener("resize", resize);

    return () => window.removeEventListener("resize", resize);
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 -z-10 opacity-20" />;
};

function App() {
  const [target, setTarget] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("");
  const [progress, setProgress] = useState(0);
  const [scanResult, setScanResult] = useState(null);
  const [scanHistory, setScanHistory] = useState([]);

  const API_BASE_URL =
    import.meta.env.VITE_API_URL ||
    "https://vulnscan-lite-ah64.onrender.com";

  const result = scanResult;

  const startScan = async () => {
    try {
      setLoading(true);
      setLoadingText("Initializing scan...");
      setProgress(20);

      const response = await axios.post(`${API_BASE_URL}/scan`, {
        url: target,
      });

      const taskId = response.data.task_id;

      const interval = setInterval(async () => {
        try {
          const res = await axios.get(`${API_BASE_URL}/scan/${taskId}`);

          if (res.data.status === "Completed") {
            clearInterval(interval);
            setProgress(100);
            setScanResult(res.data.result);
            setLoading(false);
          }
        } catch (err) {
          clearInterval(interval);
          setLoading(false);
          console.error(err);
        }
      }, 2000);
    } catch (err) {
      setLoading(false);
      console.error(err);
    }
  };

  const downloadPDF = () => {
    alert("PDF export connected.");
  };

  const chartData = result
    ? [
        {
          name: "Score",
          score: result?.total_score ?? 0,
          fill: "#00f0ff",
        },
      ]
    : [];

  const getBarData = () => {
    if (!result) return [];

    return [
      {
        name: "Passed",
        count: result?.headers?.passed?.length ?? 0,
        fill: "#10b981",
      },
      {
        name: "Missing",
        count: result?.headers?.failed?.length ?? 0,
        fill: "#ef4444",
      },
      {
        name: "Subdomains",
        count: result?.subdomains?.length ?? 0,
        fill: "#00f0ff",
      },
    ];
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden">
      <MatrixBackground />

      <div className="max-w-[1800px] mx-auto p-8 flex flex-col gap-8">

        <header className="flex flex-col xl:flex-row gap-4 justify-between items-center">

          <div>
            <h1 className="text-5xl font-black text-cyan-400">
              VULNSCAN LITE
            </h1>
          </div>

          <div className="flex gap-4 w-full xl:w-auto">

            <div className="relative flex-1 xl:w-[500px]">
              <FaNetworkWired className="absolute left-4 top-4 text-slate-400" />

              <input
                type="text"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                placeholder="https://example.com"
                className="w-full pl-12 pr-4 py-4 rounded bg-black border border-slate-700"
              />
            </div>

            <button
              onClick={startScan}
              disabled={loading}
              className="px-8 py-4 rounded bg-cyan-500 text-black font-bold"
            >
              {loading ? "SCANNING..." : "START SCAN"}
            </button>

          </div>
        </header>

        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-black border border-cyan-500/40 rounded-xl p-5"
            >
              <div className="flex justify-between">
                <span>{loadingText}</span>
                <span>{progress}%</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {scanResult && (

          <div className="grid lg:grid-cols-12 gap-8 items-start">

            <div className="lg:col-span-7 flex flex-col gap-8">

              <div className="grid sm:grid-cols-5 gap-8">

                <div className="sm:col-span-2 bg-black border border-slate-800 rounded-xl p-6 text-center">

                  <h2 className="text-7xl font-black text-cyan-400">
                    {result?.grade || "F"}
                  </h2>

                  <div className="h-40 mt-4 relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadialBarChart
                        innerRadius="70%"
                        outerRadius="100%"
                        data={chartData}
                        startAngle={180}
                        endAngle={0}
                      >
                        <RadialBar background dataKey="score" />
                      </RadialBarChart>
                    </ResponsiveContainer>
                  </div>

                  <button
                    onClick={downloadPDF}
                    className="w-full mt-4 py-3 bg-slate-900 rounded-lg flex items-center justify-center gap-2"
                  >
                    <FaDownload />
                    DOWNLOAD REPORT
                  </button>

                </div>

                <div className="sm:col-span-3 bg-black border border-slate-800 rounded-xl p-6 h-[350px]">

                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={getBarData()}>
                      <CartesianGrid stroke="#1e293b" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />

                      <Bar dataKey="count">
                        {getBarData().map((entry, index) => (
                          <Cell key={index} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>

                </div>
              </div>

              <div className="bg-black border border-slate-800 rounded-xl p-6">
                <h3 className="text-cyan-400 mb-4 font-bold">
                  SUBDOMAINS
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  {result?.subdomains?.length > 0 ? (
                    result?.subdomains?.map((sub, i) => (
                      <div key={i} className="bg-slate-900 rounded-lg p-3 flex items-center gap-2">
                        <FaGlobe />
                        {sub}
                      </div>
                    ))
                  ) : (
                    <div>No subdomains found.</div>
                  )}
                </div>
              </div>

            </div>

            <div className="lg:col-span-5 flex flex-col gap-8">

              <div className="bg-black border border-slate-800 rounded-xl p-6">
                <h3 className="text-cyan-400 font-bold mb-4 flex items-center gap-2">
                  <FaSearch /> WHOIS
                </h3>

                <div className="space-y-2 text-sm">
                  {Object.entries(result?.whois || {}).map(([key, val]) => (
                    <div key={key}>
                      <span className="text-slate-500">{key}: </span>
                      <span>{String(val)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-black border border-slate-800 rounded-xl p-6">
                <h3 className="text-cyan-400 font-bold mb-4 flex items-center gap-2">
                  <FaUnlockAlt /> REMEDIATION
                </h3>

                <div className="space-y-4">
                  {result?.remediation?.length > 0 ? (
                    result?.remediation?.map((item, i) => (
                      <div key={i} className="bg-slate-900 rounded-lg p-4">
                        {typeof item === "string"
                          ? item
                          : item?.risk || "Security recommendation"}
                      </div>
                    ))
                  ) : (
                    <div>No remediation required.</div>
                  )}
                </div>
              </div>

              <div className="bg-black border border-slate-800 rounded-xl p-6">
                <h3 className="text-cyan-400 font-bold mb-4 flex items-center gap-2">
                  <FaHistory /> HISTORY
                </h3>

                <div className="space-y-2">
                  {scanHistory?.length > 0 ? (
                    scanHistory.map((item) => (
                      <div key={item.id} className="bg-slate-900 rounded-lg p-3">
                        {item.url}
                      </div>
                    ))
                  ) : (
                    <div className="text-slate-500">No history available.</div>
                  )}
                </div>
              </div>

            </div>

          </div>

        )}

      </div>
    </div>
  );
}

export default App;
