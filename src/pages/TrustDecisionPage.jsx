import { useLocation, useNavigate } from 'react-router-dom';
import { getTrustColor } from '../utils/scenarios';
import { IconCheck, IconAlert, IconLock, IconFingerprint, IconMail, IconCamera } from '../components/Icons.jsx';

export default function TrustDecisionPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const state = location.state;
  if (!state) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-light">
        <button onClick={() => navigate('/')} className="text-navy underline">
          Back to Login
        </button>
      </div>
    );
  }

  const { score, signals, decision, sessionToken, isHijackScenario } = state;
  const color = getTrustColor(score);

  const handleContinue = () => {
    if (isHijackScenario) {
      navigate('/hijack-dashboard', { state: { sessionToken } });
    } else {
      navigate('/dashboard', { state: { sessionToken } });
    }
  };

  const handleVerify = (method) => {
    navigate(`/verify/${method}`, { state: { sessionToken, score } });
  };

  if (decision === 'approve' || score >= 80) {
    return (
      <div className="min-h-screen bg-bg-light flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-border p-8 text-center animate-slide-down">
          <div className="flex justify-center mb-4">
            <IconCheck size={48} />
          </div>
          <h2 className="font-display font-bold text-2xl text-navy mb-1">Trust Verified</h2>
          <p className="text-navy/50 mb-6">Welcome, om_sharma</p>

          <div className="flex justify-center mb-6">
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full font-bold text-lg"
              style={{ backgroundColor: `${color}15`, color }}
            >
              Trust Score: {score}%
            </div>
          </div>

          <div className="bg-bg-light rounded-lg p-4 mb-6 text-left space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-navy/60">Device</span>
              <span className="text-trust-green font-medium">Your MacBook (Known)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-navy/60">Location</span>
              <span className="text-trust-green font-medium">Ghaziabad (Home)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-navy/60">Time</span>
              <span className="text-trust-green font-medium">10:30 AM (Normal)</span>
            </div>
          </div>

          <button
            onClick={handleContinue}
            className="w-full py-4 rounded-xl font-semibold text-white text-lg bg-navy hover:bg-navy/90 hover:shadow-lg transition-all active:scale-[0.98]"
          >
            Continue to Dashboard
          </button>

          <p className="text-xs text-navy/30 mt-4">
            This login required no additional verification. Legitimate behavior.
          </p>
        </div>
      </div>
    );
  }

  if (decision === 'block' || score < 40) {
    return (
      <div className="min-h-screen bg-bg-light flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-alert-red/20 p-8 animate-slide-down">
          <div className="text-center mb-6">
            <div className="flex justify-center mb-4">
              <IconAlert size={48} />
            </div>
            <h2 className="font-display font-bold text-2xl text-alert-red mb-1">Login Blocked</h2>
            <p className="text-navy/50">High-risk activity detected</p>
          </div>

          <div className="flex justify-center mb-6">
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full font-bold text-lg"
              style={{ backgroundColor: `${color}15`, color }}
            >
              Trust Score: {score}%
            </div>
          </div>

          <div className="space-y-2 mb-6">
            <div className="flex items-start gap-2 text-sm">
              <span className="text-alert-red mt-0.5">•</span>
              <span className="text-navy/70">Unknown device</span>
            </div>
            <div className="flex items-start gap-2 text-sm">
              <span className="text-alert-red mt-0.5">•</span>
              <span className="text-navy/70">Impossible travel (Mumbai to Singapore in 15 min)</span>
            </div>
            <div className="flex items-start gap-2 text-sm">
              <span className="text-alert-red mt-0.5">•</span>
              <span className="text-navy/70">Unusual time (3:47 AM)</span>
            </div>
            <div className="flex items-start gap-2 text-sm">
              <span className="text-alert-red mt-0.5">•</span>
              <span className="text-navy/70">New recovery email added 2 hours ago</span>
            </div>
          </div>

          <p className="text-sm text-navy/60 mb-6 text-center">
            This looks like unauthorized access. Your account is locked.
          </p>

          <div className="space-y-3">
            <button
              onClick={() => navigate('/')}
              className="w-full py-3 rounded-xl font-semibold text-white bg-alert-red hover:bg-alert-red/90 transition"
            >
              Contact Support
            </button>
            <button
              onClick={() => navigate('/soc')}
              className="w-full py-3 rounded-xl font-semibold text-navy border-2 border-navy hover:bg-navy/5 transition"
            >
              View SOC Alert
            </button>
          </div>

          <p className="text-xs text-navy/30 mt-4 text-center">
            SOC Alert #82194 dispatched
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-light flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-warning-yellow/20 p-8 animate-slide-down">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <IconLock size={48} color="#FFBB33" />
          </div>
          <h2 className="font-display font-bold text-2xl text-navy mb-1">Identity Verification Needed</h2>
          <p className="text-navy/50">Something's slightly different about this login</p>
        </div>

        <div className="flex justify-center mb-6">
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full font-bold text-lg"
            style={{ backgroundColor: `${color}15`, color }}
          >
            Trust Score: {score}%
          </div>
        </div>

        <div className="bg-bg-light rounded-lg p-4 mb-6">
          <p className="text-sm text-navy/60 mb-2 font-medium">What triggered verification:</p>
          <ul className="space-y-1 text-sm text-navy/70">
            {signals?.device_recognition?.score < 80 && (
              <li>• New device detected</li>
            )}
            {signals?.location_anomaly?.score < 90 && (
              <li>• You're logging in from a new location</li>
            )}
          </ul>
        </div>

        <p className="text-sm text-navy/60 mb-4 font-medium">Please verify to continue:</p>

        <div className="space-y-3 mb-6">
          <button
            onClick={() => handleVerify('fingerprint')}
            className="w-full p-4 rounded-xl border-2 border-border hover:border-orange-accent hover:bg-orange-accent/5 text-left transition flex items-center gap-3"
          >
            <IconFingerprint size={28} color="#1A3A52" />
            <div>
              <p className="font-semibold text-navy">Fingerprint Verification</p>
              <p className="text-xs text-navy/40">Use your device fingerprint sensor</p>
            </div>
          </button>
          <button
            onClick={() => handleVerify('email')}
            className="w-full p-4 rounded-xl border-2 border-border hover:border-orange-accent hover:bg-orange-accent/5 text-left transition flex items-center gap-3"
          >
            <IconMail size={28} color="#1A3A52" />
            <div>
              <p className="font-semibold text-navy">Email Confirmation</p>
              <p className="text-xs text-navy/40">Send code to om****@gmail.com</p>
            </div>
          </button>
          <button
            onClick={() => handleVerify('selfie')}
            className="w-full p-4 rounded-xl border-2 border-border hover:border-orange-accent hover:bg-orange-accent/5 text-left transition flex items-center gap-3"
          >
            <IconCamera size={28} color="#1A3A52" />
            <div>
              <p className="font-semibold text-navy">Video Selfie</p>
              <p className="text-xs text-navy/40">Match your face with ID photo</p>
            </div>
          </button>
        </div>

        <p className="text-xs text-navy/30 text-center">Estimated time: &lt;1 minute</p>
      </div>
    </div>
  );
}
