import React, { useState, useEffect, useMemo } from 'react';
import { 
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, Cell 
} from 'recharts';
import { 
  Wind, Activity, AlertTriangle, Shield, Users, 
  Leaf, Info, Settings, Bell, Search, Share2, Upload, Navigation,
  Droplets, Thermometer, Gauge, MapPin, Crosshair
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Global Styles ---
const GlobalStyles = () => (
  <style>{`
    .glass-panel {
      background: rgba(15, 23, 42, 0.6);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.08);
      box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
    }
    .neon-text { text-shadow: 0 0 10px rgba(52, 211, 153, 0.5); }
    
    /* Scrollbar */
    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: #0f172a; }
    ::-webkit-scrollbar-thumb { background: #334155; border-radius: 3px; }
    ::-webkit-scrollbar-thumb:hover { background: #475569; }

    /* Animation Utilities */
    @keyframes float {
      0% { transform: translateY(0px); }
      50% { transform: translateY(-10px); }
      100% { transform: translateY(0px); }
    }
    .floating-orb { animation: float 6s ease-in-out infinite; }
    
    .map-grid {
      background-image: 
        linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
      background-size: 40px 40px;
    }
  `}</style>
);

// --- Types ---
interface Pollutant {
  name: string;
  value: number;
  unit: string;
  status: 'Good' | 'Moderate' | 'Unhealthy' | 'Hazardous';
  color: string;
}

interface AQIData {
  aqi: number;
  city: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  lastUpdated: string;
  pollutants: Pollutant[];
}

// --- Mock Data Generators ---
const generateHistoricalData = () => {
  return Array.from({ length: 24 }, (_, i) => ({
    time: `${i}:00`,
    pm25: Math.floor(Math.random() * 50) + 10,
    pm10: Math.floor(Math.random() * 40) + 20,
    aqi: Math.floor(Math.random() * 60) + 30,
  }));
};

// Default locations set to Delhi context as requested
const DEFAULT_LOCATIONS = [
  { id: 1, name: "Connaught Place", x: 45, y: 30, aqi: 145 },
  { id: 2, name: "Okhla Ind. Area", x: 72, y: 55, aqi: 212 },
  { id: 3, name: "Lodhi Garden", x: 30, y: 25, aqi: 85 },
  { id: 4, name: "Nehru Place", x: 55, y: 80, aqi: 168 },
];

// --- Components ---

// 1. 3D Visual "Hologram" Component
const HolographicOrb = ({ aqi }: { aqi: number }) => {
  // Determine color based on AQI
  let color = "from-emerald-400 to-teal-600";
  let shadow = "shadow-emerald-500/50";
  
  if (aqi > 50) { color = "from-yellow-400 to-orange-600"; shadow = "shadow-yellow-500/50"; }
  if (aqi > 100) { color = "from-rose-500 to-red-700"; shadow = "shadow-rose-500/50"; }
  if (aqi > 200) { color = "from-purple-500 to-indigo-900"; shadow = "shadow-purple-500/50"; }

  return (
    <div className="relative flex items-center justify-center w-64 h-64 mx-auto perspective-1000">
      {/* Core Orb */}
      <motion.div
        animate={{ 
          scale: [1, 1.05, 1],
          rotate: [0, 360],
        }}
        transition={{ 
          scale: { duration: 4, repeat: Infinity, ease: "easeInOut" },
          rotate: { duration: 20, repeat: Infinity, ease: "linear" }
        }}
        className={`w-40 h-40 rounded-full bg-gradient-to-br ${color} relative z-10 blur-sm opacity-90`}
      />
      
      {/* Outer Rings */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        className="absolute w-56 h-56 rounded-full border border-white/20 border-dashed"
      />
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        className="absolute w-48 h-48 rounded-full border border-white/10"
      />

      {/* Numerical Display Overlay */}
      <div className="absolute z-20 flex flex-col items-center justify-center">
        <span className="text-6xl font-bold text-white tracking-tighter drop-shadow-lg">{aqi}</span>
        <span className="text-xs uppercase tracking-widest text-white/80 font-medium">US AQI</span>
      </div>
      
      {/* Glow Effect */}
      <div className={`absolute w-full h-full rounded-full ${shadow} shadow-[0_0_100px_rgba(0,0,0,0)] z-0 mix-blend-screen opacity-40`} />
    </div>
  );
};

// 2. Metric Card
const MetricCard = ({ label, value, unit, status, trend }: any) => {
  const getStatusColor = (s: string) => {
    switch(s) {
      case 'Good': return 'text-emerald-400';
      case 'Moderate': return 'text-yellow-400';
      case 'Unhealthy': return 'text-rose-400';
      case 'Hazardous': return 'text-purple-400';
      default: return 'text-slate-400';
    }
  };

  return (
    <motion.div 
      whileHover={{ scale: 1.02 }}
      className="glass-panel p-4 rounded-2xl flex flex-col justify-between h-32"
    >
      <div className="flex justify-between items-start">
        <span className="text-slate-400 text-sm font-medium">{label}</span>
        <div className={`text-xs px-2 py-1 rounded-full bg-slate-800/50 ${getStatusColor(status)}`}>
          {status}
        </div>
      </div>
      <div>
        <div className="flex items-end gap-1">
          <span className="text-3xl font-semibold text-white">{value}</span>
          <span className="text-sm text-slate-500 mb-1">{unit}</span>
        </div>
        {trend && (
          <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
            <Activity size={12} /> {trend} vs last hour
          </div>
        )}
      </div>
    </motion.div>
  );
};

// 3. Cyber Map Component
const CyberMap = ({ locations }: { locations: any[] }) => {
  const [selected, setSelected] = useState<number | null>(null);

  const getColor = (aqi: number) => {
    if (aqi <= 50) return "bg-emerald-400 shadow-emerald-500/50"; 
    if (aqi <= 100) return "bg-yellow-400 shadow-yellow-500/50"; 
    if (aqi <= 150) return "bg-orange-400 shadow-orange-500/50"; 
    return "bg-rose-500 shadow-rose-500/50"; 
  };

  return (
    <div className="w-full h-full rounded-3xl overflow-hidden relative border border-white/10 bg-slate-900 map-grid">
      {/* Map Background Details */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <svg width="100%" height="100%">
          <path d="M0 50 Q 150 150, 300 50 T 600 50" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-700" />
          <path d="M0 250 Q 250 150, 400 350 T 800 250" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-700" />
        </svg>
      </div>

      {locations.map(loc => (
        <div 
          key={loc.id}
          className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
          style={{ left: `${loc.x}%`, top: `${loc.y}%` }}
          onClick={() => setSelected(loc.id)}
        >
          {/* Pulse Effect */}
          <div className={`absolute w-12 h-12 -ml-6 -mt-6 rounded-full opacity-20 animate-ping ${getColor(loc.aqi).split(' ')[0]}`} />
          
          {/* Marker */}
          <div className={`w-4 h-4 rounded-full border-2 border-white shadow-lg ${getColor(loc.aqi)} transition-all duration-300 group-hover:scale-125`} />

          {/* Tooltip */}
          <AnimatePresence>
            {(selected === loc.id) && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute bottom-8 left-1/2 -translate-x-1/2 w-48 z-50"
              >
                <div className="glass-panel p-3 rounded-xl border border-white/20">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-white text-sm font-bold">{loc.name}</span>
                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${loc.aqi > 100 ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'}`}>
                      {loc.aqi}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400">Sensor ID: #829{loc.id}</div>
                </div>
                {/* Arrow */}
                <div className="w-2 h-2 bg-slate-800 border-r border-b border-white/10 rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2"></div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
      
      {/* Map Overlay Controls */}
      <div className="absolute top-4 left-4 z-10 bg-slate-900/80 backdrop-blur-md p-2 rounded-xl border border-white/10 flex items-center gap-2">
         <Search size={16} className="text-slate-400" />
         <input type="text" placeholder="Search zone..." className="bg-transparent border-none outline-none text-white text-sm w-32 placeholder:text-slate-600" />
      </div>
      
      <div className="absolute bottom-4 right-4 z-10 bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10 text-[10px] text-slate-400 font-mono">
        LAT: 28.6139 | LNG: 77.2090
      </div>
    </div>
  );
};

// 4. Trend Chart
const TrendsSection = ({ data }: { data: any[] }) => {
  return (
    <div className="glass-panel p-6 rounded-3xl h-full">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-white">24h Pollutant Trends</h3>
        <select className="bg-slate-800 text-slate-300 text-xs p-2 rounded-lg border-none outline-none">
          <option>PM2.5</option>
          <option>PM10</option>
          <option>NO2</option>
        </select>
      </div>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#34d399" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#34d399" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis dataKey="time" stroke="#64748b" tick={{fontSize: 12}} axisLine={false} tickLine={false} />
            <YAxis stroke="#64748b" tick={{fontSize: 12}} axisLine={false} tickLine={false} />
            <RechartsTooltip 
              contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
              itemStyle={{ color: '#fff' }}
            />
            <Area type="monotone" dataKey="pm25" stroke="#34d399" strokeWidth={3} fillOpacity={1} fill="url(#colorPv)" />
            <Line type="monotone" dataKey="aqi" stroke="#f43f5e" strokeWidth={2} dot={false} strokeDasharray="5 5" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// 5. Health Insight Component
const HealthInsight = ({ aqi }: { aqi: number }) => {
  const insights = useMemo(() => {
    if (aqi < 50) return { 
      msg: "Perfect for outdoor activities.", 
      icon: <Users className="text-emerald-400" />,
      risk: "Low Risk"
    };
    if (aqi < 100) return { 
      msg: "Sensitive groups should reduce exertion.", 
      icon: <Shield className="text-yellow-400" />,
      risk: "Moderate Risk"
    };
    return { 
      msg: "Wear a mask. Avoid outdoor exercise.", 
      icon: <AlertTriangle className="text-rose-400" />,
      risk: "High Risk"
    };
  }, [aqi]);

  return (
    <div className="glass-panel p-6 rounded-3xl relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <Leaf size={120} />
      </div>
      <div className="flex items-center gap-4 mb-4">
        <div className="p-3 bg-white/5 rounded-xl border border-white/10">
          {insights.icon}
        </div>
        <div>
          <h4 className="text-white font-semibold">Health Impact</h4>
          <span className="text-sm text-slate-400">{insights.risk}</span>
        </div>
      </div>
      <p className="text-slate-300 text-sm leading-relaxed relative z-10">
        {insights.msg} Currently, asthma risk is {aqi > 100 ? "elevated" : "low"}. 
        Keep windows {aqi > 100 ? "closed" : "open"} for ventilation.
      </p>
      
      <div className="mt-6 flex gap-3">
        <button className="flex-1 bg-slate-800 hover:bg-slate-700 text-white text-xs py-2 px-4 rounded-lg transition-colors border border-white/5">
          Recommendations
        </button>
        <button className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs py-2 px-4 rounded-lg transition-colors shadow-lg shadow-emerald-500/20">
          Set Alert
        </button>
      </div>
    </div>
  );
};

// --- Main Application ---
const App = () => {
  // State
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AQIData | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [locations, setLocations] = useState(DEFAULT_LOCATIONS);
  
  // Handlers
  const handleLocateMe = () => {
    setLoading(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // Simulate fetching local data
          setTimeout(() => {
            setData(prev => prev ? ({
              ...prev,
              city: "Current Location", // In a real app, use Reverse Geocoding API
              aqi: 35, // Simulated 'cleaner' air for demo
              temperature: 21,
              pollutants: prev.pollutants.map(p => ({ ...p, value: p.value * 0.5 }))
            }) : null);
            setLoading(false);
          }, 1500);
        },
        (error) => {
          // Fallback if denied
          alert("Location access denied or unavailable. Showing default view.");
          setLoading(false);
        }
      );
    } else {
      alert("Geolocation is not supported by your browser");
      setLoading(false);
    }
  };

  // Simulation Engine
  useEffect(() => {
    // Initial Load - Defaulting to India
    setTimeout(() => {
      setData({
        aqi: 152, // Higher AQI for realistic Delhi simulation
        city: "New Delhi, India", 
        temperature: 32,
        humidity: 65,
        windSpeed: 8,
        lastUpdated: new Date().toLocaleTimeString(),
        pollutants: [
          { name: 'PM2.5', value: 85, unit: 'µg/m³', status: 'Unhealthy', color: 'rose' },
          { name: 'PM10', value: 120, unit: 'µg/m³', status: 'Unhealthy', color: 'rose' },
          { name: 'O3', value: 45, unit: 'ppb', status: 'Moderate', color: 'yellow' },
          { name: 'NO2', value: 34, unit: 'ppb', status: 'Moderate', color: 'yellow' },
          { name: 'SO2', value: 5, unit: 'ppb', status: 'Good', color: 'emerald' },
          { name: 'CO', value: 850, unit: 'µg/m³', status: 'Moderate', color: 'yellow' },
        ]
      });
      setHistory(generateHistoricalData());
      setLoading(false);
    }, 1500);

    // Live Ticker Simulation
    const interval = setInterval(() => {
      setData(prev => {
        if (!prev) return null;
        const volatility = Math.random() > 0.5 ? 1 : -1;
        const newAqi = Math.max(10, Math.min(500, prev.aqi + volatility));
        
        return {
          ...prev,
          aqi: newAqi,
          lastUpdated: new Date().toLocaleTimeString(),
          pollutants: prev.pollutants.map(p => ({
            ...p,
            value: Math.max(0, p.value + (Math.random() - 0.5) * 2)
          }))
        };
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white gap-4">
        <GlobalStyles />
        <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-emerald-500/80 tracking-widest text-xs font-bold uppercase">Calibrating Sensors...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500/30">
      <GlobalStyles />
      
      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[128px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[128px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-6 md:px-8">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-emerald-400 to-teal-600 p-2.5 rounded-xl shadow-lg shadow-emerald-500/20">
              <Wind size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">AeroSense<span className="text-emerald-500">.ai</span></h1>
              <p className="text-xs text-slate-400">Global Air Quality Monitor v2.4</p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-slate-900/50 p-2 rounded-2xl border border-white/5 backdrop-blur-sm">
            
            {/* Location Section with Detection */}
            <div className="flex items-center gap-3 px-2 border-r border-white/10 pr-4">
               <div className="flex items-center gap-2 text-sm text-white">
                <Navigation size={14} className="text-emerald-400" />
                <span className="hidden md:inline">{data?.city}</span>
              </div>
              <button 
                onClick={handleLocateMe}
                className="flex items-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border border-emerald-500/20 group"
              >
                <Crosshair size={14} className="group-hover:animate-spin" />
                <span>Locate Me</span>
              </button>
            </div>

            <div className="flex gap-2">
              <button className="p-2 hover:bg-white/5 rounded-lg transition-colors"><Bell size={18} /></button>
              <button className="p-2 hover:bg-white/5 rounded-lg transition-colors"><Settings size={18} /></button>
              <div className="w-8 h-8 bg-gradient-to-tr from-slate-700 to-slate-600 rounded-lg border border-white/10 flex items-center justify-center font-bold text-xs">
                JD
              </div>
            </div>
          </div>
        </header>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Visuals & Core Stats (4 Cols) */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            
            {/* 3D Main Display */}
            <div className="glass-panel rounded-3xl p-8 text-center relative overflow-hidden min-h-[400px] flex flex-col items-center justify-center">
              <div className="absolute top-4 left-4 flex flex-col items-start z-20">
                <span className="text-xs text-slate-400 uppercase tracking-wider font-bold">Real-time Index</span>
                <span className="text-emerald-400 text-sm font-medium animate-pulse">● Live Updating</span>
              </div>
              
              <HolographicOrb aqi={data?.aqi || 0} />
              
              <div className="mt-8 grid grid-cols-3 w-full gap-2 z-20">
                <div className="flex flex-col items-center p-2 rounded-xl bg-white/5">
                  <Thermometer size={16} className="text-slate-400 mb-1" />
                  <span className="text-lg font-bold">{data?.temperature}°</span>
                </div>
                <div className="flex flex-col items-center p-2 rounded-xl bg-white/5">
                  <Droplets size={16} className="text-slate-400 mb-1" />
                  <span className="text-lg font-bold">{data?.humidity}%</span>
                </div>
                <div className="flex flex-col items-center p-2 rounded-xl bg-white/5">
                  <Wind size={16} className="text-slate-400 mb-1" />
                  <span className="text-lg font-bold">{data?.windSpeed} <span className="text-[10px]">km/h</span></span>
                </div>
              </div>
            </div>

            {/* Health Card */}
            <HealthInsight aqi={data?.aqi || 0} />
            
            {/* Gamification / Social */}
            <div className="glass-panel p-5 rounded-3xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-emerald-500/20 p-2 rounded-lg text-emerald-400">
                  <Leaf size={20} />
                </div>
                <div>
                  <div className="text-sm font-semibold">Weekly Eco Goal</div>
                  <div className="w-24 h-1.5 bg-slate-800 rounded-full mt-1.5 overflow-hidden">
                    <div className="h-full w-[70%] bg-emerald-500 rounded-full" />
                  </div>
                </div>
              </div>
              <span className="text-xl font-bold font-mono">70%</span>
            </div>

          </div>

          {/* Right Column: Data & Maps (8 Cols) */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            
            {/* Pollutant Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {data?.pollutants.map((pollutant) => (
                <MetricCard 
                  key={pollutant.name}
                  label={pollutant.name}
                  value={pollutant.value.toFixed(1)}
                  unit={pollutant.unit}
                  status={pollutant.status}
                  trend={Math.random() > 0.5 ? "+2%" : "-1%"}
                />
              ))}
            </div>

            {/* Map & Trends Split */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[400px]">
              <TrendsSection data={history} />
              <CyberMap locations={locations} />
            </div>

            {/* Forecast Row */}
            <div className="glass-panel p-6 rounded-3xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                   AI Forecast <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/30">Beta</span>
                </h3>
                <span className="text-xs text-slate-500">Confidence Score: 94%</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 {[
                   { day: 'Tomorrow', aqi: data ? Math.max(20, data.aqi - 10) : 45, status: 'Moderate' },
                   { day: 'Friday', aqi: data ? Math.max(20, data.aqi + 15) : 52, status: 'Unhealthy' },
                   { day: 'Saturday', aqi: data ? Math.max(20, data.aqi - 25) : 38, status: 'Good' }
                 ].map((forecast, idx) => (
                   <div key={idx} className="bg-slate-900/50 rounded-xl p-4 flex justify-between items-center border border-white/5">
                      <div>
                        <div className="text-sm text-slate-400 mb-1">{forecast.day}</div>
                        <div className={`text-sm font-medium ${forecast.status === 'Good' ? 'text-emerald-400' : (forecast.status === 'Moderate' ? 'text-yellow-400' : 'text-rose-400')}`}>
                          {forecast.status}
                        </div>
                      </div>
                      <div className="text-right">
                         <div className="text-2xl font-bold text-white">{forecast.aqi}</div>
                         <div className="text-xs text-slate-500">AQI</div>
                      </div>
                   </div>
                 ))}
              </div>
            </div>

          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 border-t border-white/10 pt-8 pb-4 text-center text-slate-500 text-sm">
          <div className="flex justify-center gap-6 mb-4">
            <span className="hover:text-emerald-400 cursor-pointer transition-colors">Data Sources</span>
            <span className="hover:text-emerald-400 cursor-pointer transition-colors">API Docs</span>
            <span className="hover:text-emerald-400 cursor-pointer transition-colors">Privacy Policy</span>
          </div>
          <p>© 2024 AeroSense Analytics. Powered by OpenWeather.</p>
        </footer>

      </div>
    </div>
  );
};

export default App;