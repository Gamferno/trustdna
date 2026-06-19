import { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getDashboard, triggerHijack, advanceHijack, getSessionMonitor } from '../utils/api';
import TrustScoreCircle from '../components/TrustScoreCircle.jsx';
import { IconKeyboard, IconMouse, IconCompass, IconWallet, IconSend, IconFile, IconLoan } from '../components/Icons.jsx';
import { getTrustColor, formatCurrency } from '../utils/scenarios';

const SIGNAL_ICONS = {
  keystroke_rhythm: IconKeyboard,
  mouse_patterns: IconMouse,
  navigation_flow: IconCompass,
};

const QUICK_ACTIONS = [
  { label: 'Check Balance', action: 'balance', Icon: IconWallet },
  { label: 'Send Money', action: 'send', Icon: IconSend },
  { label: 'Pay Bills', action: 'pay', Icon: IconFile },
  { label: 'Apply for Loan', action: 'loan', Icon: IconLoan },
];

export default function HijackDashboardPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [hijackState, setHijackState] = useState('pre');
  const [trustScore, setTrustScore] = useState(94);
  const [hijackControlActive, setHijackControlActive] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [signals, setSignals] = useState({});
  const [showBalance, setShowBalance] = useState(false);
  const [flashAmount, setFlashAmount] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const sessionToken = location.state?.sessionToken;
  const intervalRef = useRef(null);
  const hijackIntervalRef = useRef(null);

  const hijackStateRef = useRef(hijackState);
  hijackStateRef.current = hijackState;

  useEffect(() => {
    if (!sessionToken) {
      navigate('/');
      return;
    }

    getDashboard(sessionToken)
      .then(setDashboard)
      .catch(() => navigate('/'));

    const poll = async () => {
      try {
        const data = await getSessionMonitor(sessionToken);
        if (data) {
          // Once hijack is active, only advanceHijack controls the trust score
          if (!hijackControlActive) {
            setTrustScore(data.current_trust);
          }
          setSignals(data.signals_active || {});
        }
      } catch {}
    };

    poll();
    intervalRef.current = setInterval(poll, 2000);
    return () => clearInterval(intervalRef.current);
  }, [sessionToken, navigate, hijackControlActive]);

  const startHijack = async () => {
    try {
      await triggerHijack(sessionToken);
      setHijackControlActive(true);
      setHijackState('active');
      setElapsed(0);

      hijackIntervalRef.current = setInterval(async () => {
        try {
          const result = await advanceHijack(sessionToken);
          if (result) {
            setElapsed(result.elapsed_seconds);
            setTrustScore(result.current_trust);

            if (result.current_trust < 50) {
              setHijackState('critical');
              clearInterval(hijackIntervalRef.current);
            } else if (result.current_trust < 80 && hijackStateRef.current === 'active') {
              setHijackState('degrading');
            }
          }
        } catch (err) {
          console.error(err);
        }
      }, 3000);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    return () => clearInterval(hijackIntervalRef.current);
  }, []);

  const handleQuickAction = (action) => {
    if (hijackState === 'critical') return;
    switch (action) {
      case 'balance':
        setShowBalance(!showBalance);
        break;
      case 'send':
        setFlashAmount('₹5,000 transferred to Rahul (ICIC...8234)');
        setTimeout(() => setFlashAmount(null), 3000);
        break;
      case 'pay':
        setFlashAmount('Bill paid: Jio Postpaid ₹1,200');
        setTimeout(() => setFlashAmount(null), 3000);
        break;
      case 'loan':
        setFlashAmount('Loan application submitted. Pending review.');
        setTimeout(() => setFlashAmount(null), 3000);
        break;
    }
  };

  const color = getTrustColor(trustScore);

  const statusMeta = {
    pre: { label: 'Trust monitoring active', barColor: '#00C851' },
    active: { label: 'Behavior changing...', barColor: '#FFBB33' },
    degrading: { label: 'Trust degrading', barColor: '#FFBB33' },
    critical: { label: 'CRITICAL', barColor: '#FF4444' },
  };

  const meta = statusMeta[hijackState];
  const user = dashboard?.user;
  const balance = dashboard?.balance;
  const transactions = dashboard?.recent_transactions;

  return (
    <div className="min-h-screen bg-bg-light">
      <header className="bg-white border-b border-border px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-xl text-navy">
            Trust<span className="text-orange-accent">DNA</span>
          </h1>
          <p className="text-xs text-navy/40">Session Hijack Simulation</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 bg-bg-light rounded-full px-3 py-1.5">
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: color }} />
            <span className="text-sm font-bold" style={{ color }}>{trustScore}%</span>
          </div>
          <button onClick={() => navigate('/soc')} className="text-xs text-navy/40 hover:text-orange-accent transition">SOC &rarr;</button>
          <button onClick={() => navigate('/')} className="text-xs text-navy/40 hover:text-alert-red transition">Logout</button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto p-6">
        <div className="grid grid-cols-5 gap-6 mb-8">
          <div className="col-span-3">
            <p className="text-xs text-navy/40 uppercase tracking-wide font-semibold mb-1">Welcome back</p>
            <h2 className="font-display font-bold text-2xl text-navy">{user?.name || 'Om Sharma'}</h2>
            <p className="text-sm text-navy/40">{user?.account_type || 'Premium Checking'} &bull; {user?.account_number || 'XXXX-XXXX-XXXX-4289'}</p>
          </div>
          <div className="col-span-2 bg-white rounded-xl border border-border p-4">
            <p className="text-xs text-navy/40 font-semibold mb-3">LIVE TRUST MONITOR</p>
            <div className="space-y-2.5">
              {Object.keys(signals).length > 0 ? Object.entries(signals).map(([key, data]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-xs text-navy/50 capitalize">{key.replace(/_/g, ' ')}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-500" style={{
                        width: `${Math.min((data.deviation || 0) * 2, 100)}%`,
                        backgroundColor: data.status === 'stable' || data.status === 'normal' ? '#00C851' : data.status === 'degrading' ? '#FFBB33' : '#FF4444',
                      }} />
                    </div>
                    <span className={`text-[10px] font-bold ${
                      data.status === 'stable' || data.status === 'normal' ? 'text-trust-green' :
                      data.status === 'degrading' ? 'text-warning-yellow' : 'text-alert-red'
                    }`}>{data.deviation}%</span>
                  </div>
                </div>
              )) : (
                <p className="text-xs text-navy/20 italic">Waiting for signals...</p>
              )}
            </div>
          </div>
        </div>

        {flashAmount && (
          <div className="mb-4 p-4 bg-trust-green/10 border border-trust-green/20 rounded-xl text-trust-green font-medium animate-slide-down">
            OK &mdash; {flashAmount}
          </div>
        )}

        {hijackState !== 'critical' && (
          <div className="grid grid-cols-4 gap-4 mb-8">
            {QUICK_ACTIONS.map((item) => {
              const ActionIcon = item.Icon;
              return (
                <button
                  key={item.action}
                  onClick={() => handleQuickAction(item.action)}
                  className="bg-white rounded-xl border border-border p-5 text-center hover:shadow-md hover:border-orange-accent/30 transition-all active:scale-95"
                >
                  <div className="flex justify-center mb-2">
                    <ActionIcon size={28} color="#1A3A52" />
                  </div>
                  <p className="font-semibold text-sm text-navy">{item.label}</p>
                </button>
              );
            })}
          </div>
        )}

        {showBalance && hijackState !== 'critical' && (
          <div className="bg-navy rounded-2xl p-6 mb-8 text-white animate-slide-down">
            <p className="text-white/60 text-sm mb-1">Current Balance</p>
            <p className="font-mono text-4xl font-bold">{formatCurrency(balance?.current || 245380)}</p>
            <p className="text-white/40 text-xs mt-2">Last updated: {balance?.last_updated || '10:32 AM'}</p>
          </div>
        )}

        {/* Hijack Simulation Controls */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="col-span-1 bg-white rounded-2xl border border-border p-6 flex flex-col items-center">
            <TrustScoreCircle score={trustScore} animated={true} size={120} />
            <p className="text-xs text-navy/40 mt-3 text-center">{meta.label}</p>
            {hijackState === 'pre' && (
              <button
                onClick={startHijack}
                className="mt-4 px-5 py-2 bg-alert-red text-white rounded-xl text-sm font-semibold hover:bg-alert-red/80 transition active:scale-95"
              >
                Simulate Session Hijack
              </button>
            )}
          </div>

          <div className="col-span-2 bg-white rounded-2xl border border-border p-6">
            <h3 className="font-semibold text-navy mb-4">Live Behavioral Signals</h3>
            <div className="space-y-5">
              {Object.keys(signals).length > 0 ? (
                Object.entries(signals).map(([key, data]) => {
                  const IconComp = SIGNAL_ICONS[key] || IconKeyboard;
                  const signalColor =
                    data.status === 'stable' || data.status === 'normal'
                      ? '#00C851' : data.status === 'degrading' ? '#FFBB33' : '#FF4444';
                  return (
                    <div key={key} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <IconComp size={22} color={signalColor} />
                        <div>
                          <p className="text-sm font-medium text-navy capitalize">{key.replace(/_/g, ' ')}</p>
                          <p className="text-xs text-navy/40">Deviation: {data.deviation}%</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ backgroundColor: `${signalColor}10`, color: signalColor }}>
                        {data.status.toUpperCase()}
                      </span>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-navy/20 italic text-center py-4">Waiting for session data...</p>
              )}
            </div>

            {hijackState !== 'pre' && (
              <div className="mt-6 p-4 rounded-xl" style={{ backgroundColor: `${color}10`, border: `1px solid ${color}30` }}>
                <p className="text-sm font-semibold text-navy mb-1">
                  {hijackState === 'active'
                    ? 'Session behavior anomaly detected'
                    : hijackState === 'degrading'
                    ? 'Trust score degrading — step-up auth pending'
                    : 'Session terminated — high-risk activity'}
                </p>
                <p className="text-xs text-navy/50">
                  {hijackState === 'active'
                    ? 'Keystroke rhythm shifting. Mouse patterns erratic. Possible session takeover in progress.'
                    : hijackState === 'degrading'
                    ? 'Rapid behavior change detected. Continuous monitoring flagged this within seconds.'
                    : 'Automated scripts detected. Session forcibly terminated. SOC alerted.'}
                </p>
                {elapsed > 0 && (
                  <p className="text-xs text-navy/30 mt-2">Elapsed since hijack: {elapsed}s</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Critical State Overlay */}
        {hijackState === 'critical' && (
          <div className="mb-8 p-6 bg-alert-red/10 border-2 border-alert-red/30 rounded-2xl animate-slide-down">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-full bg-alert-red/20 flex items-center justify-center">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FF4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </div>
              <div>
                <h3 className="font-display font-bold text-xl text-alert-red">Session Terminated</h3>
                <p className="text-sm text-alert-red/70">High-risk activity detected — account access revoked</p>
              </div>
            </div>
            <div className="bg-white/50 rounded-xl p-4">
              <p className="text-sm font-semibold text-navy mb-2">What happened</p>
              <ul className="text-xs text-navy/60 space-y-1.5 list-disc list-inside">
                <li>Trust score dropped below 50% — critical threshold crossed</li>
                <li>Behavioral signals deviated beyond acceptable limits</li>
                <li>All banking actions have been suspended</li>
                <li>SOC team has been notified (Alert dispatched)</li>
              </ul>
            </div>
          </div>
        )}

        {/* Transactions Table */}
        {hijackState !== 'critical' && (
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <h3 className="font-semibold text-navy">Recent Transactions</h3>
              <span className="text-xs text-navy/30">All transactions verified at {trustScore}% trust</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs text-navy/40 uppercase tracking-wide">
                    <th className="px-6 py-3 font-medium">Time</th>
                    <th className="px-6 py-3 font-medium">Action</th>
                    <th className="px-6 py-3 font-medium">Amount</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions?.map((txn) => (
                    <tr key={txn.id} className="border-t border-border hover:bg-bg-light/50 transition">
                      <td className="px-6 py-3 text-sm text-navy/60">
                        {new Date(txn.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-6 py-3 text-sm text-navy font-medium">
                        {txn.type === 'transfer' ? `\u2192 ${txn.to}` : txn.to}
                      </td>
                      <td className="px-6 py-3 text-sm font-mono text-navy">{formatCurrency(txn.amount)}</td>
                      <td className="px-6 py-3">
                        <span className="text-xs font-semibold text-trust-green px-2 py-0.5 bg-trust-green/10 rounded-full">
                          \u2713 {txn.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Critical State Actions */}
        {hijackState === 'critical' && (
          <div className="flex justify-center gap-4">
            <button onClick={() => navigate('/soc')} className="px-6 py-3 bg-alert-red text-white rounded-xl font-semibold hover:bg-alert-red/80 transition text-sm">
              View SOC Alert
            </button>
            <button onClick={() => navigate('/compare')} className="px-6 py-3 rounded-xl font-semibold text-navy border-2 border-navy/20 hover:bg-navy/5 transition text-sm">
              See how TrustDNA caught it &rarr;
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
