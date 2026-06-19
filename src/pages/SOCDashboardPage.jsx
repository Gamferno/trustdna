import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSOCAlerts } from '../utils/api';
import AlertCard from '../components/AlertCard.jsx';

const STORAGE_KEY = 'trustdna_soc_alerts';

function loadStoredAlerts() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveAlerts(alerts) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(alerts.slice(0, 50)));
  } catch {}
}

function Skeleton({ className = '' }) {
  return <div className={`bg-gray-100 rounded-lg animate-pulse ${className}`} />;
}

const HEATMAP_DOTS = [
  { name: 'Ghaziabad', lat: 28.67, lng: 77.42, count: 12, severity: 'low' },
  { name: 'Delhi', lat: 28.61, lng: 77.23, count: 5, severity: 'low' },
  { name: 'Mumbai', lat: 19.08, lng: 72.88, count: 2, severity: 'critical' },
  { name: 'Noida', lat: 28.58, lng: 77.38, count: 3, severity: 'low' },
  { name: 'Faridabad', lat: 28.41, lng: 77.31, count: 1, severity: 'high' },
];

export default function SOCDashboardPage() {
  const [alerts, setAlerts] = useState(loadStoredAlerts);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();

  const fetchAlerts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getSOCAlerts(filter);
      const fetched = data.alerts || [];
      const existing = loadStoredAlerts();
      const lookup = new Map(existing.map((a) => [a.id, a]));
      for (const a of fetched) {
        lookup.set(a.id, a);
      }
      const merged = Array.from(lookup.values()).sort(
        (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
      );
      saveAlerts(merged);
      setAlerts(merged);
    } catch (err) {
      const stored = loadStoredAlerts();
      setAlerts(stored);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 5000);
    return () => clearInterval(interval);
  }, [fetchAlerts]);

  const filteredAlerts =
    filter === 'all' ? alerts : alerts.filter((a) => a.severity === filter);

  const counts = {
    all: alerts.length,
    critical: alerts.filter((a) => a.severity === 'critical').length,
    high: alerts.filter((a) => a.severity === 'high').length,
    low: alerts.filter((a) => a.severity === 'low').length,
  };

  return (
    <div className="min-h-screen bg-bg-light">
      <header className="bg-navy text-white px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-xl">SOC Dashboard</h1>
          <p className="text-xs text-white/50">Security Operations Center</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-trust-green animate-pulse" />
            <span className="text-xs text-white/60">LIVE</span>
          </span>
          <button
            onClick={() => localStorage.removeItem(STORAGE_KEY) || fetchAlerts()}
            className="text-xs text-white/30 hover:text-orange-accent transition"
          >
            Clear Log
          </button>
          <button onClick={() => navigate('/')} className="text-xs text-white/50 hover:text-orange-accent transition">
            Back to Demo →
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-6">
        <div className="grid grid-cols-5 gap-6 mb-6">
          <div className="col-span-3">
            <div className="flex gap-3 mb-4">
              {[
                { key: 'all', label: 'All Alerts' },
                { key: 'critical', label: 'Critical' },
                { key: 'high', label: 'High' },
                { key: 'low', label: 'Low' },
              ].map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                    filter === f.key
                      ? 'bg-navy text-white'
                      : 'bg-white text-navy/60 border border-border hover:border-navy/30'
                  }`}
                >
                  {f.label}
                  <span className="ml-1.5 opacity-60">({counts[f.key] || 0})</span>
                </button>
              ))}
            </div>
            <h2 className="font-semibold text-navy mb-1">LIVE ALERTS</h2>
            <p className="text-xs text-navy/40 mb-4">
              {loading ? 'Refreshing...' : `${filteredAlerts.length} alert${filteredAlerts.length !== 1 ? 's' : ''}${filter !== 'all' ? ` (${filter})` : ''}`}
            </p>

            {loading && filteredAlerts.length === 0 ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24" />)}
              </div>
            ) : filteredAlerts.length === 0 ? (
              <div className="bg-white rounded-xl border border-border p-8 text-center">
                <p className="text-navy/40">No alerts yet. Run a demo scenario and alerts will appear here persistently.</p>
                <button onClick={fetchAlerts} className="mt-3 text-xs text-orange-accent hover:underline">
                  Refresh
                </button>
              </div>
            ) : (
              <div>
                {filteredAlerts.map((alert) => (
                  <AlertCard key={alert.id} alert={alert} />
                ))}
              </div>
            )}
          </div>

          <div className="col-span-2">
            <div className="bg-white rounded-xl border border-border p-4">
              <h3 className="font-semibold text-navy text-sm mb-3">Risk Heatmap (India)</h3>
              <div className="relative bg-bg-light rounded-lg overflow-hidden" style={{ height: 220 }}>
                <svg viewBox="0 0 500 260" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
                  <defs>
                    <radialGradient id="lowDot" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#00C851" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="#00C851" stopOpacity="0" />
                    </radialGradient>
                    <radialGradient id="highDot" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#FFBB33" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="#FFBB33" stopOpacity="0" />
                    </radialGradient>
                    <radialGradient id="criticalDot" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#FF4444" stopOpacity="0.45" />
                      <stop offset="100%" stopColor="#FF4444" stopOpacity="0" />
                    </radialGradient>
                  </defs>

                  <rect x="60" y="15" width="380" height="190" fill="#F4F6F8" rx="10" stroke="#E0E0E0" strokeWidth="0.5" />

                  <text x="250" y="35" textAnchor="middle" className="text-[9px]" fill="#999" fontWeight="500">
                    NORTHERN INDIA — NCR REGION
                  </text>

                  {HEATMAP_DOTS.map((dot, i) => {
                    const x = 60 + ((dot.lng - 68.0) / (97.4 - 68.0)) * 380;
                    const y = 15 + ((37.0 - dot.lat) / (37.0 - 8.0)) * 190;
                    const gradientId = dot.severity === 'critical' ? 'criticalDot' : dot.severity === 'high' ? 'highDot' : 'lowDot';
                    const color = dot.severity === 'critical' ? '#FF4444' : dot.severity === 'high' ? '#FFBB33' : '#00C851';
                    const outerR = Math.max(14, Math.min(28, dot.count * 2.5));
                    const innerR = 4;

                    return (
                      <g key={i}>
                        <circle cx={x} cy={y} r={outerR} fill={`url(#${gradientId})`} opacity="0.7">
                          <animate attributeName="r" from={outerR * 0.8} to={outerR} dur="3s" repeatCount="indefinite" />
                          <animate attributeName="opacity" from="0.4" to="0.7" dur="3s" repeatCount="indefinite" />
                        </circle>
                        <circle cx={x} cy={y} r={innerR} fill={color} />
                        <text
                          x={x}
                          y={y - innerR - 6}
                          textAnchor="middle"
                          className="text-[9px]"
                          fill="#1A3A52"
                          fontWeight="bold"
                        >
                          {dot.name}
                        </text>
                        <text
                          x={x}
                          y={y + innerR + 12}
                          textAnchor="middle"
                          className="text-[8px]"
                          fill={color}
                          fontWeight="600"
                        >
                          {dot.count} alert{dot.count > 1 ? 's' : ''}
                        </text>
                      </g>
                    );
                  })}

                  <text x="250" y="218" textAnchor="middle" className="text-[8px]" fill="#CCC">
                    Mumbai · · · · · · · · · · · · · · · · · · · · · · · · · Delhi / Ghaziabad / Noida
                  </text>
                </svg>
              </div>

              <div className="flex items-center justify-between mt-3 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-trust-green" />
                  <span className="text-navy/40">Safe</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-warning-yellow" />
                  <span className="text-navy/40">Suspicious</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-alert-red" />
                  <span className="text-navy/40">Blocked</span>
                </div>
              </div>
            </div>

            <div className="bg-navy rounded-xl p-4 mt-4">
              <p className="text-white/60 text-xs mb-3">PROCESSING AT SCALE</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/50">Customers</span>
                  <span className="text-white font-bold font-mono">50M+</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50">Daily Transactions</span>
                  <span className="text-white font-bold font-mono">200M+</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50">Evaluation Latency</span>
                  <span className="text-trust-green font-bold font-mono">&lt;100ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50">False Positive Rate</span>
                  <span className="text-trust-green font-bold font-mono">0.03%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
