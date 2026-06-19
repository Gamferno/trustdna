import { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getDashboard, getSessionMonitor } from '../utils/api';
import { formatCurrency, getTrustColor } from '../utils/scenarios';
import { IconWallet, IconSend, IconFile, IconLoan } from '../components/Icons.jsx';

const QUICK_ACTIONS = [
  { label: 'Check Balance', action: 'balance', Icon: IconWallet },
  { label: 'Send Money', action: 'send', Icon: IconSend },
  { label: 'Pay Bills', action: 'pay', Icon: IconFile },
  { label: 'Apply for Loan', action: 'loan', Icon: IconLoan },
];

function Skeleton({ className = '' }) {
  return <div className={`bg-bg-light rounded-lg animate-pulse ${className}`} />;
}

export default function DashboardPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBalance, setShowBalance] = useState(false);
  const [flashAmount, setFlashAmount] = useState(null);
  const [liveTrust, setLiveTrust] = useState(95);
  const [sessionAge, setSessionAge] = useState(0);
  const [liveSignals, setLiveSignals] = useState(null);
  const pollRef = useRef(null);

  const sessionToken = location.state?.sessionToken;

  useEffect(() => {
    if (!sessionToken) {
      navigate('/');
      return;
    }

    getDashboard(sessionToken)
      .then(setDashboard)
      .catch(() => navigate('/'))
      .finally(() => setLoading(false));

    const poll = async () => {
      try {
        const data = await getSessionMonitor(sessionToken);
        if (data) {
          setLiveTrust(data.current_trust);
          setSessionAge(data.session_age_seconds);
          setLiveSignals(data.signals_active);
        }
      } catch {}
    };

    poll();
    pollRef.current = setInterval(poll, 3000);
    return () => clearInterval(pollRef.current);
  }, [sessionToken, navigate]);

  const handleQuickAction = (action) => {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-light">
        <header className="bg-white border-b border-border px-6 py-4 flex items-center justify-between">
          <div>
            <Skeleton className="h-7 w-32 mb-1" />
            <Skeleton className="h-3 w-20" />
          </div>
          <div className="flex gap-4">
            <Skeleton className="h-8 w-24 rounded-full" />
            <Skeleton className="h-4 w-10" />
          </div>
        </header>
        <div className="max-w-5xl mx-auto p-6">
          <Skeleton className="h-6 w-48 mb-2" />
          <Skeleton className="h-10 w-36 mb-4" />
          <Skeleton className="h-5 w-64 mb-8" />
          <div className="grid grid-cols-4 gap-4 mb-8">
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
          </div>
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    );
  }

  const user = dashboard?.user;
  const balance = dashboard?.balance;
  const transactions = dashboard?.recent_transactions;
  const trustColor = getTrustColor(liveTrust);
  const ageFormatted = `${Math.floor(sessionAge / 60)}m ${sessionAge % 60}s`;

  return (
    <div className="min-h-screen bg-bg-light">
      <header className="bg-white border-b border-border px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-xl text-navy">
            Trust<span className="text-orange-accent">DNA</span>
          </h1>
          <p className="text-xs text-navy/40">Bank of Baroda</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 bg-bg-light rounded-full px-3 py-1.5">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: trustColor }} />
              <span className="text-xs text-navy/40 font-mono">Session: {ageFormatted}</span>
            </div>
            <span
              className="text-sm font-bold"
              style={{ color: trustColor }}
            >
              {liveTrust}%
            </span>
          </div>
          <button onClick={() => navigate('/soc')} className="text-xs text-navy/40 hover:text-orange-accent transition">SOC →</button>
          <button onClick={() => navigate('/')} className="text-xs text-navy/40 hover:text-alert-red transition">Logout</button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto p-6">
        <div className="grid grid-cols-5 gap-6 mb-8">
          <div className="col-span-3 animate-fade-in">
            <p className="text-xs text-navy/40 uppercase tracking-wide font-semibold mb-1">Welcome back</p>
            <h2 className="font-display font-bold text-2xl text-navy">{user?.name}</h2>
            <p className="text-sm text-navy/40">{user?.account_type} • {user?.account_number}</p>
          </div>
          <div className="col-span-2 bg-white rounded-xl border border-border p-4 animate-fade-in stagger-1">
            <p className="text-xs text-navy/40 font-semibold mb-3">LIVE TRUST MONITOR</p>
            <div className="space-y-2.5">
              {liveSignals ? Object.entries(liveSignals).map(([key, data]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-xs text-navy/50 capitalize">{key.replace(/_/g, ' ')}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(data.deviation * 2, 100)}%`,
                          backgroundColor: data.status === 'stable' || data.status === 'normal' ? '#00C851' : data.status === 'degrading' ? '#FFBB33' : '#FF4444',
                        }}
                      />
                    </div>
                    <span className={`text-[10px] font-bold ${
                      data.status === 'stable' || data.status === 'normal' ? 'text-trust-green' :
                      data.status === 'degrading' ? 'text-warning-yellow' : 'text-alert-red'
                    }`}>
                      {data.deviation}%
                    </span>
                  </div>
                </div>
              )) : (
                <div className="space-y-2">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-3 w-full" />)}
                </div>
              )}
            </div>
          </div>
        </div>

        {flashAmount && (
          <div className="mb-4 p-4 bg-trust-green/10 border border-trust-green/20 rounded-xl text-trust-green font-medium animate-slide-down">
            OK &mdash; {flashAmount}
          </div>
        )}

        <div className="grid grid-cols-4 gap-4 mb-8">
          {QUICK_ACTIONS.map((item, i) => {
            const ActionIcon = item.Icon;
            return (
              <button
                key={item.action}
                onClick={() => handleQuickAction(item.action)}
                className="bg-white rounded-xl border border-border p-5 text-center hover:shadow-md hover:border-orange-accent/30 transition-all active:scale-95"
                style={{ animation: 'fadeIn 0.4s ease-out forwards', animationDelay: `${(i + 2) * 0.1}s`, opacity: 0 }}
              >
                <div className="flex justify-center mb-2">
                  <ActionIcon size={28} color="#1A3A52" />
                </div>
                <p className="font-semibold text-sm text-navy">{item.label}</p>
              </button>
            );
          })}
        </div>

        {showBalance && (
          <div className="bg-navy rounded-2xl p-6 mb-8 text-white animate-slide-down">
            <p className="text-white/60 text-sm mb-1">Current Balance</p>
            <p className="font-mono text-4xl font-bold">{formatCurrency(balance?.current)}</p>
            <p className="text-white/40 text-xs mt-2">Last updated: {balance?.last_updated}</p>
          </div>
        )}

        <div className="bg-white rounded-xl border border-border overflow-hidden animate-fade-in">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <h3 className="font-semibold text-navy">Recent Transactions</h3>
            <span className="text-xs text-navy/30">All transactions verified at {liveTrust}% trust</span>
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
                      {txn.type === 'transfer' ? `→ ${txn.to}` : txn.to}
                    </td>
                    <td className="px-6 py-3 text-sm font-mono text-navy">{formatCurrency(txn.amount)}</td>
                    <td className="px-6 py-3">
                      <span className="text-xs font-semibold text-trust-green px-2 py-0.5 bg-trust-green/10 rounded-full">
                        ✓ {txn.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
