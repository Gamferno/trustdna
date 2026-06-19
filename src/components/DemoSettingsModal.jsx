import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginCustom } from '../utils/api';

export default function DemoSettingsModal({ isOpen, onClose }) {
  const [device, setDevice] = useState('known');
  const [distance, setDistance] = useState(0);
  const [loginHour, setLoginHour] = useState(10);
  const [keystrokeWpm, setKeystrokeWpm] = useState(65);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleSimulate = async () => {
    setLoading(true);
    setResult(null);

    let deviceId, deviceName, deviceOs;
    if (device === 'known') {
      deviceId = 'DEVICE_HASH_123';
      deviceName = 'MacBook Pro';
      deviceOs = 'macOS';
    } else if (device === 'old') {
      deviceId = 'DEVICE_HASH_456';
      deviceName = 'iPhone 14';
      deviceOs = 'iOS';
    } else {
      deviceId = 'DEVICE_HASH_UNKNOWN';
      deviceName = 'Unknown Device';
      deviceOs = 'Unknown';
    }

    const lat = 28.5355 + (distance * 0.009);
    const lng = 77.3910 + (distance * 0.009);
    const hour = loginHour.toString().padStart(2, '0');

    try {
      const data = await loginCustom({
        username: 'om_sharma',
        device_id: deviceId,
        device_name: deviceName,
        device_os: deviceOs,
        location_lat: lat,
        location_lng: lng,
        location_name: distance === 0 ? 'Ghaziabad (Home)' : `${distance} km from home`,
        timezone: 'IST',
        timestamp: `2025-01-15T${hour}:00:00+05:30`,
        user_agent: 'Mozilla/5.0 (Custom Demo)',
        keystroke_timing: keystrokeWpm,
      });
      setResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const trustColor = result
    ? result.trust_score >= 80
      ? '#00C851'
      : result.trust_score >= 40
      ? '#FFBB33'
      : '#FF4444'
    : '#1A3A52';

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slide-down"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-border flex items-center justify-between">
          <h2 className="font-display font-bold text-xl text-navy">Demo Settings</h2>
          <button onClick={onClose} className="text-navy/30 hover:text-navy transition text-2xl leading-none">
            ×
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-navy mb-2">Device</label>
            <div className="flex gap-2">
              {[
                { value: 'known', label: 'Known (MacBook)' },
                { value: 'old', label: 'Old Device (iPhone)' },
                { value: 'new', label: 'New Device' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setDevice(opt.value)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
                    device === opt.value
                      ? 'bg-navy text-white'
                      : 'bg-bg-light text-navy/60 border border-border hover:border-navy/30'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-navy mb-2">
              Distance from Home: <span className="text-orange-accent">{distance} km</span>
            </label>
            <input
              type="range"
              min="0"
              max="1200"
              value={distance}
              onChange={(e) => setDistance(Number(e.target.value))}
              className="w-full h-2 bg-bg-light rounded-full appearance-none cursor-pointer accent-orange-accent"
            />
            <div className="flex justify-between text-xs text-navy/30 mt-1">
              <span>0 km (Home)</span>
              <span>1200 km</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-navy mb-2">
              Login Time: <span className="text-orange-accent">{loginHour}:00</span>
            </label>
            <input
              type="range"
              min="0"
              max="23"
              value={loginHour}
              onChange={(e) => setLoginHour(Number(e.target.value))}
              className="w-full h-2 bg-bg-light rounded-full appearance-none cursor-pointer accent-orange-accent"
            />
            <div className="flex justify-between text-xs text-navy/30 mt-1">
              <span>12 AM</span>
              <span>12 PM</span>
              <span>11 PM</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-navy mb-2">
              Keystroke Speed: <span className="text-orange-accent">{keystrokeWpm} WPM</span>
            </label>
            <input
              type="range"
              min="30"
              max="150"
              value={keystrokeWpm}
              onChange={(e) => setKeystrokeWpm(Number(e.target.value))}
              className="w-full h-2 bg-bg-light rounded-full appearance-none cursor-pointer accent-orange-accent"
            />
            <div className="flex justify-between text-xs text-navy/30 mt-1">
              <span>30 WPM (Slow)</span>
              <span>65 WPM (Baseline)</span>
              <span>150 WPM (Bot)</span>
            </div>
          </div>

          <button
            onClick={handleSimulate}
            disabled={loading}
            className="w-full py-4 rounded-xl font-semibold text-white bg-orange-accent hover:bg-orange-accent/90 transition active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? 'Evaluating...' : 'Simulate Login'}
          </button>

          {result && (
            <div
              className="rounded-xl p-6 animate-slide-down"
              style={{ backgroundColor: `${trustColor}10`, border: `2px solid ${trustColor}30` }}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="font-semibold text-navy">Result</span>
                <span className="font-display font-bold text-2xl" style={{ color: trustColor }}>
                  {result.trust_score}%
                </span>
              </div>
              <div className="space-y-2">
                {Object.entries(result.signals).map(([key, data]) => (
                  <div key={key} className="flex items-center justify-between text-sm">
                    <span className="text-navy/60 capitalize">{key.replace(/_/g, ' ')}</span>
                    <span className="font-medium" style={{ color: data.score >= 80 ? '#00C851' : data.score >= 50 ? '#FFBB33' : '#FF4444' }}>
                      {data.score}%
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-navy/40 mt-3 text-center">
                Decision: <strong className="text-navy capitalize">{result.decision.replace(/_/g, ' ')}</strong>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
