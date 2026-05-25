import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  RadialBarChart, RadialBar, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from "recharts";
import {
  FaShieldAlt, FaCheckCircle, FaTimesCircle, FaServer,
  FaLock, FaNetworkWired, FaDownload, FaUserShield,
  FaKey, FaHistory, FaBug, FaUnlockAlt, FaCode, FaGlobe, FaSearch
} from "react-icons/fa";

// ─── CANVAS MATRIX EFFECT BACKGROUND ───
const MatrixBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);

    const chars = '0101010101ABCDEFGHIJKLMNOPQRSTUVWXYZ𝝿𝝼𝝮𝝯';
    const charArray = chars.split('');
    const fontSize = 14;
    const columns = Math.ceil(canvas.width / fontSize);
    const drops = new Array(columns).fill(0);

    const drawMatrix = () => {
      ctx.fillStyle = 'rgba(2, 6, 23, 0.15)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = charArray[Math.floor(Math.random() * charArray.length)];

        if (Math.random() > 0.98) {
          ctx.fillStyle = '#ffffff';
        } else {
          ctx.fillStyle = Math.random() > 0.5 ? 'rgba(0, 240, 255, 0.12)' : 'rgba(15, 23, 42, 0.1)';
        }

        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };

    const matrixInterval = setInterval(drawMatrix, 50);
    return () => {
      clearInterval(matrixInterval);
      window.removeEventListener('resize', setCanvasSize);
    };
  }, []);

  return <canvas ref={canvasRef} className="matrix-canvas fixed inset-0 pointer-events-none z-0" />;
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    localStorage.getItem("token") ? true : false
  );
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [target, setTarget] = useState("");
  const [scanResult, setScanResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("");
  const [progress, setProgress] = useState(0);
  const [scanHistory, setScanHistory] = useState([]);

  const API_BASE_URL = import.meta.env.VITE_API_URL || "https://vulnscan-lite-ah64.onrender.com";

  const fetchHistory = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/history`);
      setScanHistory(response.data.history || []);
    } catch (error) {
      console.error("Database tracker trace error:", error);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchHistory();
    }
  }, [isAuthenticated]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError("");
    try {
      const response = await axios.post(`${API_BASE_URL}/login`, {
        username,
        password,
      });
      localStorage.setItem("token", response.data.token);
      setIsAuthenticated(true);
    } catch (err) {
      console.error(err);
      setAuthError("Authentication failed. Check your credentials.");
    }
  };

const pollResult = (taskId) => {
    let currentProgress = 10;
    setProgress(currentProgress);
    setLoadingText("Establishing remote footprint channel connection...");

    // 1. Progress simulator increment rules
    const logLoader = setInterval(() => {
      currentProgress = Math.min(currentProgress + Math.floor(Math.random() * 12) + 2, 95);
      setProgress(currentProgress);
      if (currentProgress > 40 && currentProgress < 75) {
        setLoadingText("Querying passive DNS frameworks and zone files...");
      } else if (currentProgress >= 75) {
        setLoadingText("Analyzing target frame security response layers...");
      }
    }, 800);

    // 2. Active backend verification tracker loop
    const tracker = setInterval(async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/scan/${taskId}`);
        const data = response.data;

        // FIXED: Flexible check that matches standard wrapper OR direct data payloads
        if (data && (data.status === "completed" || data.result || data.total_score !== undefined)) {
          clearInterval(logLoader);
          clearInterval(tracker);
          setProgress(100);
          
          // Fallback extraction check to grab data no matter how the API structures it
          const finalResult = data.result || data;
          setScanResult(finalResult);
          setLoading(false);
          fetchHistory(); // Sync up bottom history window panel instantly
        } else if (data && data.status === "failed") {
          clearInterval(logLoader);
          clearInterval(tracker);
          setLoading(false);
          alert("Upstream telemetry pipeline reported a processing scan failure.");
        }
      } catch (error) {
        clearInterval(logLoader);
        clearInterval(tracker);
        setLoading(false);
        console.error("Polling error:", error);
      }
    }, 2000);
  };

  const startScan = async () => {
    if (!target) return alert("Please specify a target vector path URL.");
    try {
      setLoading(true);
      setScanResult(null);
      setProgress(5);
      setLoadingText("Initializing asynchronous scanning core workflow...");

      const response = await axios.post(`${API_BASE_URL}/scan`, { url: target });
      const taskId = response.data.task_id;

      if (taskId) {
        pollResult(taskId);
      } else if (response.data.result) {
        setScanResult(response.data.result);
        setProgress(100);
        setLoading(false);
        fetchHistory();
      } else {
        setLoading(false);
        alert("Unexpected baseline tracking interface payload received.");
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
      alert("Failed to establish handshake pipeline context with remote server application.");
    }
  };

const downloadPDF = async () => {
    try {
      if (!scanResult) return alert("No active target footprint metrics loaded to export.");
      
      console.log("Initiating PDF compile payload export stream to backend...");
      
      const response = await axios.post(
        `${API_BASE_URL}/download-report`, 
        scanResult, 
        { responseType: "blob" }
      );
      
      // Verification check to make sure a valid binary block came through
      const blob = new Blob([response.data], { type: "application/pdf" });
      
      // Create an internal transient layout container to fire download link
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = `VULNSCAN_REPORT_${Date.now()}.pdf`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log("PDF generation stream pipeline completed successfully.");
    } catch (error) {
      console.error("PDF download stream error tracking log:", error);
      
      if (error.response) {
        // The server responded with a status code outside the 2xx range
        alert(`Backend Compilation Error: Server returned status code ${error.response.status}`);
      } else if (error.request) {
        // The request was made but no response was received
        alert("Network Handshake Error: No response received from server endpoint. Check CORS policies.");
      } else {
        // Something happened in setting up the request
        alert(`Stream block processing engine exception: ${error.message}`);
      }
    }
  };

  const chartData = scanResult ? [{ name: "Score", score: scanResult.total_score ?? 0, fill: "#00f0ff" }] : [];

  const getBarData = () => {
    if (!scanResult) return [];
    return [
      { name: "Passed Audits", count: scanResult?.headers?.passed?.length ?? 0, fill: "#10b981" },
      { name: "Missing Headers", count: scanResult?.headers?.failed?.length ?? 0, fill: "#ef4444" },
      { name: "Subdomains", count: scanResult?.subdomains?.length ?? 0, fill: "#00f0ff" }
    ];
  };

  return (
    <div className="min-h-screen w-full relative bg-slate-950 text-slate-100 overflow-x-hidden flex flex-col font-mono">
      <MatrixBackground />

      {/* ─── STATUS TOP HEADER CONTROL BAR ─── */}
      <div className="w-full bg-black border-b border-cyan-500/40 px-8 py-3.5 mercantile-header z-50 flex justify-between items-center backdrop-blur-md text-xs font-bold tracking-widest text-cyan-400">
        <div className="flex items-center gap-3">
          <FaBug className="animate-pulse text-sm text-cyan-400" />
          <span>CYBER COMMAND SYSTEM LAYER: TARGET INTELLIGENCE PROFILE SCANNER</span>
        </div>
        {isAuthenticated && (
          <button onClick={() => { localStorage.removeItem("token"); setIsAuthenticated(false); }} className="bg-cyan-950/60 border border-cyan-400/50 text-cyan-400 px-4 py-1.5 rounded font-bold tracking-wider hover:bg-cyan-400 hover:text-black transition-all">
            TERMINATE ACCESS
          </button>
        )}
      </div>

      {/* ─── ENLARGED AUTHENTICATION GATE PANEL ─── */}
      {!isAuthenticated ? (
        <div className="flex-grow flex items-center justify-center z-10 p-6">
          <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-lg bg-black/95 border-2 border-cyan-500/40 rounded-xl p-10 backdrop-blur-xl cyber-panel-glow">
            <div className="text-center mb-10">
              <FaShieldAlt className="text-cyan-400 text-6xl mx-auto mb-4 filter drop-shadow-[0_0_15px_rgba(0,240,255,0.5)]" />
              <h2 className="text-3xl font-black uppercase text-cyan-400 tracking-wide cyber-glow-cyan">Operator Identity Matrix</h2>
              <p className="text-xs text-slate-500 uppercase mt-2 tracking-widest">// ATTACH PERMITTED OPERATOR CIPHER</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6 text-left">
              <div>
                <label className="block text-xs text-slate-400 uppercase tracking-widest mb-2 font-bold">// IDENTITY ACCOUNT ID</label>
                <div className="relative">
                  <FaUserShield className="absolute left-4 top-4 text-slate-400 text-base" />
                  <input
                    type="text"
                    placeholder="admin"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="w-full bg-slate-950 border-2 border-slate-800 rounded-lg pl-12 pr-4 py-4 text-white focus:border-cyan-400 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-400 uppercase tracking-widest mb-2 font-bold">// SECURE ACCESS KEYWORD</label>
                <div className="relative">
                  <FaKey className="absolute left-4 top-4 text-slate-400 text-base" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full bg-slate-950 border-2 border-slate-800 rounded-lg pl-12 pr-4 py-4 text-white focus:border-cyan-400 outline-none"
                  />
                </div>
              </div>

              {authError && <div className="text-sm text-rose-400 bg-rose-950/40 border border-rose-900/60 p-4 rounded-lg font-bold">{authError}</div>}

              <button type="submit" className="w-full py-4 bg-cyan-500 hover:bg-cyan-400 text-black font-black uppercase tracking-widest text-sm rounded-lg transition-all transform active:scale-95 shadow-lg shadow-cyan-500/20">
                BOOT SYSTEM CHANNELS
              </button>
            </form>
          </motion.div>
        </div>
      ) : (
        // ─── FULL EXTRA-WIDE MONITOR HIGH VISIBILITY DASHBOARD ───
        <div className="flex-grow w-full max-w-[1850px] mx-auto px-8 py-8 z-10 flex flex-col gap-8">
          
          {/* Main Top Header Controls Area */}
          <header className="flex flex-col xl:flex-row xl:justify-between xl:items-center border-b-2 border-slate-900 pb-6 gap-6">
            <div>
              <h1 className="text-4xl font-black text-cyan-400 tracking-tight cyber-glow-cyan uppercase">
                VULNSCAN<span className="text-white">LITE</span>
              </h1>
              <p className="text-xs text-emerald-400 tracking-widest font-bold uppercase mt-1">// AUTOMATED EXTENDED FOOTPRINT EXPLORER PIPELINE</p>
            </div>

            {/* Input target control box panel expanded */}
            <div className="bg-black/80 border border-cyan-500/30 rounded-xl p-3 flex flex-col sm:flex-row gap-4 xl:w-auto w-full items-center backdrop-blur-md">
              <div className="relative w-full sm:w-[450px]">
                <FaNetworkWired className="absolute left-4 top-4 text-slate-400 text-sm" />
                <input
                  type="text"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  placeholder="https://target-endpoint.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:border-cyan-400 outline-none"
                />
              </div>
              <button onClick={startScan} disabled={loading} className="w-full sm:w-auto px-6 py-3.5 bg-cyan-500 hover:bg-cyan-400 text-black font-black uppercase tracking-widest text-xs rounded-lg disabled:opacity-40 transition-all whitespace-nowrap">
                {loading ? "FETCHING TELEMETRY..." : "EXECUTE TARGET RECON ANALYSIS"}
              </button>
            </div>
          </header>

          {/* Loader Progress Status bar */}
          <AnimatePresence>
            {loading && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="w-full bg-slate-900/90 border-2 border-cyan-400/40 rounded-xl p-5 flex items-center justify-between text-sm backdrop-blur-md">
                <div className="flex items-center gap-4">
                  <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                  <span className="text-slate-200 font-bold tracking-wide">{loadingText}</span>
                </div>
                <div className="text-cyan-400 font-black tracking-widest text-base">{progress}% DATA STREAMED</div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Grid Layout Container */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* ─── LEFT PANEL WRAPPER: TELEMETRY GRAPHS & RECON CHARTS (7 / 12) ─── */}
            <div className="lg:col-span-7 flex flex-col gap-8">
              {scanResult ? (
                <>
                  {/* Performance Analysis Scorecards and Layout */}
                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-8">
                    {/* Threat Score */}
                    <div className="sm:col-span-2 bg-black/85 border-2 border-slate-800 rounded-xl p-6 flex flex-col justify-between items-center text-center cyber-panel-glow">
                      <span className="text-xs text-slate-400 font-bold tracking-widest uppercase self-start border-l-2 border-cyan-400 pl-2">
                        // AUDIT THREAT DEGREE
                      </span>
                      <h2 className="text-8xl font-black text-cyan-400 cyber-glow-cyan my-3">
                        {scanResult.grade || "F"}
                      </h2>
                      <div className="w-full h-32 flex items-center justify-center relative">
                        <ResponsiveContainer width="100%" height="100%">
                          <RadialBarChart innerRadius="78%" outerRadius="105%" data={chartData} startAngle={180} endAngle={0}>
                            <RadialBar background clockWise dataKey="score" />
                          </RadialBarChart>
                        </ResponsiveContainer>
                        <div className="absolute font-black text-2xl text-slate-100">
                          {scanResult.total_score ?? 0}
                          <span className="text-xs text-slate-500 font-normal"> PTS</span>
                        </div>
                      </div>
                      <button onClick={downloadPDF} className="w-full py-3 bg-slate-950 border border-slate-800 rounded-lg text-[11px] text-slate-400 hover:text-cyan-400 hover:border-cyan-400 transition-all flex items-center justify-center gap-2 font-bold">
                        <FaDownload /> EXPORT DEFENSIVE SYSTEM REPORT
                      </button>
                    </div>

                    {/* Bar Metrics */}
                    <div className="sm:col-span-3 bg-black/85 border-2 border-slate-800 rounded-xl p-6 flex flex-col justify-between cyber-panel-glow">
                      <span className="text-xs text-slate-400 font-bold tracking-widest uppercase block mb-4 border-l-2 border-cyan-400 pl-2">
                        // AUDITED FRAME METRICS
                      </span>
                      <div className="w-full h-44">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={getBarData()} margin={{ left: -20, right: 10, bottom: 0 }}>
                            <CartesianGrid stroke="#1e293b" vertical={false} strokeDasharray="4 4" />
                            <XAxis dataKey="name" stroke="#64748b" fontSize={11} fontWeight="bold" tickLine={false} />
                            <YAxis stroke="#64748b" fontSize={11} fontWeight="bold" allowDecimals={false} tickLine={false} />
                            <Tooltip contentStyle={{ backgroundColor: "#020617", borderColor: "#475569", borderRadius: "8px", fontSize: "13px" }} />
                            <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={42}>
                              {getBarData().map((entry, index) => (
                                <Cell key={index} fill={entry.fill} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>

                  {/* SUBDOMAINS */}
                  <div className="bg-black/75 border-2 border-slate-800 rounded-xl p-6 cyber-panel-glow">
                    <span className="text-xs text-slate-400 font-bold tracking-widest uppercase block mb-4 border-l-2 border-cyan-400 pl-2">
                      // DISCOVERED CLOUD SUBDOMAINS VECTOR INDEX
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-48 overflow-y-auto pr-1">
                      {scanResult?.subdomains?.length > 0 ? (
                        scanResult.subdomains.map((sub, i) => (
                          <div key={i} className="p-3 bg-slate-950 border border-slate-900 rounded-lg flex items-center gap-2.5 text-xs font-bold text-cyan-300">
                            <FaGlobe className="text-slate-500 text-sm shrink-0" />
                            <span className="truncate">{sub}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-slate-600 italic py-2 col-span-full">
                          No adjacent hosting subdomain mappings detected.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* TECHNOLOGIES */}
                  <div className="bg-black/75 border-2 border-slate-800 rounded-xl p-6 cyber-panel-glow">
                    <span className="text-xs text-slate-400 font-bold tracking-widest uppercase block mb-4 border-l-2 border-cyan-400 pl-2">
                      // INFRASTRUCTURE TECHNOLOGY LOG PRINT STACK
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {scanResult?.technologies?.length > 0 ? (
                        scanResult.technologies.map((tech, i) => (
                          <div key={i} className="bg-slate-950 border-2 border-slate-900 rounded-xl p-4 text-center">
                            <div className="text-sm font-black text-cyan-400">
                              {tech?.name || tech}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-4 bg-slate-950 border border-slate-900 rounded-xl text-xs text-slate-600 italic col-span-full text-center">
                          Technologies fingerprint obscured by edge container protections.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* OPEN PORTS */}
                  <div className="bg-black/60 border-2 border-slate-800 rounded-xl p-6 cyber-panel-glow">
                    <span className="text-xs text-slate-400 font-bold tracking-widest uppercase block mb-4 border-l-2 border-cyan-400 pl-2">
                      // TARGET OPEN LISTENING PORTS LOG ENTRY MAP
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
                      {scanResult?.ports?.length > 0 ? (
                        scanResult.ports.map((p, i) => (
                          <div key={i} className="bg-slate-950 border-2 border-slate-900 rounded-xl p-4">
                            <div className="text-sm font-black text-cyan-400">PORT: {p.port}</div>
                            <div className="text-[11px] text-slate-500 uppercase font-bold mt-1">
                              SERVICE: <span className="text-slate-300 font-bold">{p.service}</span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-slate-600 italic col-span-full text-center py-2">
                          No active listening ports identified.
                        </p>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div className="bg-black/50 border-2 border-slate-900 rounded-xl p-20 text-center text-slate-500 text-sm tracking-widest uppercase font-bold">
                  // ENTER SYSTEM COMPONENT TO POPULATE EXTRANET TELEMETRY BOARDS...
                </div>
              )}
            </div>

            {/* ─── RIGHT PANEL WRAPPER: WHOIS DATA, REMEDIATIONS, & ARCHIVE LOGS (5 / 12) ─── */}
            <div className="lg:col-span-5 flex flex-col gap-8">
              {/* WHOIS */}
              {scanResult && (
                <div className="bg-black/85 border-2 border-slate-800 rounded-xl p-6 cyber-panel-glow">
                  <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-widest mb-4 flex items-center gap-2 border-l-2 border-cyan-400 pl-2">
                    <FaSearch className="text-xs" /> HOST INFRASTRUCTURE WHOIS DOSSIER
                  </h3>
                  <div className="bg-slate-950 border-2 border-slate-900 rounded-xl p-4 font-mono text-[11px] leading-relaxed max-h-56 overflow-y-auto text-slate-300 space-y-1">
                    {scanResult?.whois && Object.keys(scanResult.whois).length > 0 ? (
                      Object.entries(scanResult.whois).map(([key, val]) => (
                        <div key={key} className="truncate">
                          <span className="text-slate-500 uppercase font-bold">{key.replace(/_/g, " ")}: </span>
                          <span className="text-cyan-300 font-semibold">
                            {Array.isArray(val) ? val.join(", ") : String(val || "N/A")}
                          </span>
                        </div>
                      ))
                    ) : (
                      <pre className="text-slate-600 italic whitespace-pre-wrap font-sans">
                        WHOIS lookup mapping block active on upstream network node.
                      </pre>
                    )}
                  </div>
                </div>
              )}

              {/* REMEDIATION */}
              {scanResult && (
                <div className="bg-black/85 border-2 border-slate-800 rounded-xl p-6 cyber-panel-glow">
                  <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-widest mb-4 flex items-center gap-2 border-l-2 border-cyan-400 pl-2">
                    <FaUnlockAlt className="text-sm" /> SECURITY RECOMMENDATIONS & DEFENSIVE REMEDIATIONS
                  </h3>
                  <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
                    {scanResult?.reremediation?.length > 0 || scanResult?.remediation?.length > 0 ? (
                      (scanResult.reremediation || scanResult.remediation).map((item, index) => (
                        <div key={index} className="bg-slate-950 border border-slate-900 rounded-xl p-4 space-y-3 text-xs leading-relaxed">
                          <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                            <h4 className="font-bold text-slate-100 text-sm tracking-tight">
                              {item?.header || "Security"} Configuration
                            </h4>
                            <span className="px-2.5 py-0.5 rounded text-[10px] font-black uppercase border bg-amber-950/50 text-amber-400 border-amber-900">
                              {item?.severity || "Medium"}
                            </span>
                          </div>
                          <p className="text-slate-400">
                            <strong className="text-slate-500 uppercase tracking-wider text-[10px]">Threat Risk Matrix: </strong>
                            {item?.risk || "Potential infrastructure exposure detected."}
                          </p>
                          <div className="space-y-1">
                            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">
                              // Applied Mitigation Configuration Fix:
                            </span>
                            <pre className="bg-black border border-slate-900 p-3 rounded-lg text-cyan-400 font-mono overflow-x-auto text-[11px] leading-normal shadow-inner">
                              {item?.fix || "No automated fix recommendation generated."}
                            </pre>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-emerald-400 bg-emerald-950/10 border border-emerald-900/40 p-4 rounded-xl text-center font-bold">
                        ✓ Zero structural security vulnerabilities flagged for remediation updates.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* HISTORY */}
              <div className="bg-black/85 border-2 border-slate-800 rounded-xl p-6 backdrop-blur-md flex-grow cyber-panel-glow">
                <h3 className="text-xs font-bold text-slate-300 mb-4 flex items-center gap-2 border-l-2 border-cyan-400 pl-2">
                  <FaHistory className="text-cyan-400 text-sm" /> Historical Security Footprints
                </h3>
                <div className="overflow-x-auto rounded-xl border border-slate-900 bg-slate-950/40 max-h-64 overflow-y-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-900 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-800 sticky top-0">
                        <th className="py-4 px-5">Target Vector Address URL</th>
                        <th className="py-4 px-5 text-center">Score</th>
                        <th className="py-4 px-5 text-center">Grade</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900 text-slate-200">
                      {scanHistory?.length > 0 ? (
                        scanHistory.map((log) => (
                          <tr key={log.id || log._id || Math.random()} className="hover:bg-slate-900/30 transition-all">
                            <td className="py-4 px-5 text-cyan-400/90 font-black max-w-[220px] truncate text-sm">
                              {log.url}
                            </td>
                            <td className="py-4 px-5 text-center text-cyan-400 font-black text-sm">
                              {log.total_score}
                              <span className="text-[10px] text-slate-600 font-normal"> pts</span>
                            </td>
                            <td className="py-4 px-5 text-center">
                              <span className="px-3 py-1 rounded font-black text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-900/50">
                                {log.grade || "N/A"}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="3" className="py-8 text-center text-slate-600 italic font-bold">
                            No tracking records logged inside database layer.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          </div>

        </div>
      )}
    </div>
  );
}

export default App;
