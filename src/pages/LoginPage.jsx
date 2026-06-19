import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SCENARIO_META } from '../utils/scenarios';
import { IconHome, IconLocation, IconShield, IconRefresh } from '../components/Icons.jsx';
import DemoSettingsModal from '../components/DemoSettingsModal.jsx';

const ICON_MAP = {
  home: IconHome,
  location: IconLocation,
  shield: IconShield,
  refresh: IconRefresh,
};

const SCENARIOS = [
  { id: 1, ...SCENARIO_META[1] },
  { id: 2, ...SCENARIO_META[2] },
  { id: 3, ...SCENARIO_META[3] },
  { id: 4, ...SCENARIO_META[4] },
];

export default function LoginPage() {
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const navigate = useNavigate();

  const handleScenarioSelect = (id) => {
    setSelectedScenario(id);
  };

  const handleLogin = () => {
    if (!selectedScenario) return;
    setLoading(true);
    navigate(`/evaluate/${selectedScenario}`);
  };

  return (
    <div className="min-h-screen bg-bg-light flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="font-display font-bold text-3xl text-navy mb-2">
            Trust<span className="text-orange-accent">DNA</span>
          </h1>
          <p className="text-navy/50 text-sm">Continuous Adaptive Identity Trust</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-border p-6 mb-4">
          <div className="mb-4">
            <label className="block text-xs font-semibold text-navy/60 uppercase tracking-wide mb-1">Username</label>
            <input
              type="text"
              defaultValue="om_sharma"
              className="w-full px-4 py-3 rounded-lg border border-border bg-bg-light text-navy font-medium focus:outline-none focus:ring-2 focus:ring-orange-accent/30 focus:border-orange-accent transition"
            />
          </div>
          <div className="mb-2">
            <label className="block text-xs font-semibold text-navy/60 uppercase tracking-wide mb-1">Password</label>
            <input
              type="password"
              defaultValue="••••••••"
              className="w-full px-4 py-3 rounded-lg border border-border bg-bg-light text-navy font-medium focus:outline-none focus:ring-2 focus:ring-orange-accent/30 focus:border-orange-accent transition"
            />
          </div>
        </div>

        <div className="mb-4">
          <h3 className="font-semibold text-sm text-navy/60 mb-3 uppercase tracking-wide">Select Demo Scenario</h3>
          <div className="space-y-2.5">
            {SCENARIOS.map((scenario) => {
              const IconComp = ICON_MAP[scenario.icon] || IconHome;
              return (
                <button
                  key={scenario.id}
                  onClick={() => handleScenarioSelect(scenario.id)}
                  className={`w-full text-left p-3.5 rounded-xl border-2 transition-all duration-200 hover:shadow-md ${
                    selectedScenario === scenario.id
                      ? 'border-orange-accent bg-orange-accent/5 shadow-md'
                      : 'border-border bg-white hover:border-orange-accent/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      <IconComp
                        size={28}
                        color={selectedScenario === scenario.id ? '#FF6B35' : '#1A3A52'}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-navy text-sm">
                        Scenario {scenario.id}: {scenario.title}
                      </h4>
                      <p className="text-xs text-navy/40 mt-0.5 truncate">{scenario.context}</p>
                    </div>
                    {selectedScenario === scenario.id && (
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#FF6B35"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <button
          onClick={handleLogin}
          disabled={!selectedScenario || loading}
          className={`w-full py-4 rounded-xl font-semibold text-white text-lg transition-all duration-200 ${
            selectedScenario && !loading
              ? 'bg-navy hover:bg-navy/90 hover:shadow-lg active:scale-[0.98]'
              : 'bg-navy/30 cursor-not-allowed'
          }`}
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>

        <div className="flex items-center justify-between mt-4">
          <button onClick={() => navigate('/soc')} className="text-xs text-navy/40 hover:text-orange-accent transition">
            Security Operations →
          </button>
          <button onClick={() => navigate('/compare')} className="text-xs text-navy/40 hover:text-trust-green transition">
            Compare: Traditional vs TrustDNA →
          </button>
          <button onClick={() => setShowSettings(true)} className="text-xs text-navy/40 hover:text-orange-accent transition">
            Demo Settings
          </button>
        </div>
      </div>

      <DemoSettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
    </div>
  );
}
