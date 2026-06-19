import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconBank, IconShield } from '../components/Icons.jsx';

const STEPS = [
  { time: '0s', traditional: 'Password accepted', traditionalOk: true, trustdna: 'Password accepted', trustdnaOk: true },
  { time: '1s', traditional: 'Logged in — full access granted', traditionalOk: true, trustdna: 'Evaluating device...', trustdnaOk: true },
  { time: '2s', traditional: 'Fraudster sees account balance', traditionalOk: false, trustdna: 'Device: UNKNOWN | Location: Mumbai (1,000+ km)', trustdnaOk: true },
  { time: '3s', traditional: 'Fraudster starts transferring money', traditionalOk: false, trustdna: 'Time: 3:47 AM | Behavior: ROBOTIC (120 WPM)', trustdnaOk: true },
  { time: '4s', traditional: '50,000 rupees transferred out', traditionalOk: false, trustdna: 'Trust Score: 18% — LOGIN BLOCKED', trustdnaOk: true },
  { time: '5s', traditional: 'Fraudster changes recovery email', traditionalOk: false, trustdna: 'SOC Alert #82194 dispatched', trustdnaOk: true },
  { time: '10s', traditional: 'Account drained: 2,45,380 rupees lost', traditionalOk: false, trustdna: 'Customer notified via SMS. Account secured.', trustdnaOk: true },
];

export default function ComparisonPage() {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!playing) return;
    if (step >= STEPS.length - 1) {
      setPlaying(false);
      return;
    }
    const timer = setTimeout(() => setStep((s) => Math.min(s + 1, STEPS.length - 1)), 1800);
    return () => clearTimeout(timer);
  }, [step, playing]);

  return (
    <div className="min-h-screen bg-bg-light flex flex-col">
      <header className="bg-navy text-white px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-lg">TrustDNA vs Traditional Auth</h1>
          <p className="text-xs text-white/40">Scenario: Attacker with stolen password, unknown device, Mumbai at 3:47 AM</p>
        </div>
        <button onClick={() => navigate('/')} className="text-xs text-white/50 hover:text-orange-accent transition">
          Back to Demo &rarr;
        </button>
      </header>

      <div className="flex-1 grid grid-cols-2 gap-4 p-6 max-w-7xl mx-auto w-full">
        <div className="bg-white rounded-2xl border border-alert-red/20 p-6">
          <div className="flex items-center gap-2 mb-6">
            <IconBank size={32} color="#FF4444" />
            <div>
              <h2 className="font-display font-bold text-xl text-navy">Traditional Auth</h2>
              <p className="text-xs text-alert-red">Password-only security</p>
            </div>
          </div>

          <div className="space-y-2 mb-8">
            {STEPS.map((s, i) => (
              <div
                key={i}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                  i <= step ? 'opacity-100' : 'opacity-0'
                } ${s.traditionalOk ? 'bg-trust-green/5 border border-trust-green/10' : 'bg-alert-red/5 border border-alert-red/10'}`}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={s.traditionalOk ? '#00C851' : '#FF4444'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  {s.traditionalOk ? (
                    <polyline points="20 6 9 17 4 12" />
                  ) : (
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  )}
                </svg>
                <div className="flex-1">
                  <span className="text-xs text-navy/30 font-mono mr-2">{s.time}</span>
                  <span className="text-sm text-navy/70">{s.traditional}</span>
                </div>
              </div>
            ))}
          </div>

          {step >= STEPS.length - 1 && (
            <div className="p-4 bg-alert-red/10 border border-alert-red/20 rounded-xl animate-slide-down">
              <p className="text-alert-red font-bold text-lg">2,45,380 rupees lost</p>
              <p className="text-xs text-alert-red/70 mt-1">
                Traditional auth stopped nothing. Password was enough.
              </p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-trust-green/20 p-6">
          <div className="flex items-center gap-2 mb-6">
            <IconShield size={32} color="#FF6B35" />
            <div>
              <h2 className="font-display font-bold text-xl text-navy">TrustDNA</h2>
              <p className="text-xs text-trust-green">Continuous Identity Trust</p>
            </div>
          </div>

          <div className="space-y-2 mb-8">
            {STEPS.map((s, i) => (
              <div
                key={i}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                  i <= step ? 'opacity-100' : 'opacity-0'
                } ${s.trustdnaOk ? 'bg-trust-green/5 border border-trust-green/10' : 'bg-warning-yellow/5 border border-warning-yellow/10'}`}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={s.trustdnaOk ? '#00C851' : '#FFBB33'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  {s.trustdnaOk ? (
                    <polyline points="20 6 9 17 4 12" />
                  ) : (
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  )}
                </svg>
                <div className="flex-1">
                  <span className="text-xs text-navy/30 font-mono mr-2">{s.time}</span>
                  <span className="text-sm text-navy/70">{s.trustdna}</span>
                </div>
              </div>
            ))}
          </div>

          {step >= STEPS.length - 1 && (
            <div className="p-4 bg-trust-green/10 border border-trust-green/20 rounded-xl animate-slide-down">
              <p className="text-trust-green font-bold text-lg">0 rupees lost — Attack blocked in 3s</p>
              <p className="text-xs text-trust-green/70 mt-1">
                TrustDNA detected the anomaly before any damage occurred.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="p-6 flex justify-center gap-4">
        {!playing && step < STEPS.length - 1 && (
          <button
            onClick={() => setPlaying(true)}
            className="px-8 py-3 bg-orange-accent text-white rounded-xl font-semibold hover:bg-orange-accent/90 transition active:scale-95"
          >
            Play Comparison
          </button>
        )}
        {step > 0 && (
          <button
            onClick={() => { setStep(0); setPlaying(false); }}
            className="px-8 py-3 bg-navy text-white rounded-xl font-semibold hover:bg-navy/90 transition active:scale-95"
          >
            Replay
          </button>
        )}
        {playing && (
          <p className="flex items-center gap-2 text-navy/40 text-sm">
            <span className="w-2 h-2 rounded-full bg-orange-accent animate-pulse" />
            Playing...
          </p>
        )}
      </div>
    </div>
  );
}
