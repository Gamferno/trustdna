import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { loginWithScenario } from '../utils/api';
import TrustScoreCircle from '../components/TrustScoreCircle.jsx';
import SignalCard from '../components/SignalCard.jsx';

export default function TrustEvaluationPage() {
  const { scenarioId } = useParams();
  const navigate = useNavigate();
  const [phase, setPhase] = useState('loading');
  const [score, setScore] = useState(0);
  const [signals, setSignals] = useState(null);
  const [scenarioName, setScenarioName] = useState('');
  const [sessionToken, setSessionToken] = useState('');
  const [decision, setDecision] = useState('');
  const [isHijackScenario, setIsHijackScenario] = useState(false);
  const [autoAdvance, setAutoAdvance] = useState(true);
  const animFrame = useRef(null);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        const data = await loginWithScenario(scenarioId);
        if (cancelled) return;

        setScenarioName(data.scenario_name);
        setSessionToken(data.session_token);
        setDecision(data.decision);
        setIsHijackScenario(!!data.is_hijack_scenario);

        const targetScore = data.trust_score;
        const duration = 1500;
        const start = performance.now();

        const animate = (now) => {
          const elapsed = now - start;
          const progress = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          const current = Math.round(eased * targetScore);
          setScore(current);

          if (progress < 1) {
            animFrame.current = requestAnimationFrame(animate);
          } else {
            setPhase('done');
            setSignals(data.signals);
          }
        };

        setPhase('animating');
        animFrame.current = requestAnimationFrame(animate);
      } catch (err) {
        console.error(err);
        if (!cancelled) setPhase('error');
      }
    };

    run();

    return () => {
      cancelled = true;
      if (animFrame.current) cancelAnimationFrame(animFrame.current);
    };
  }, [scenarioId]);

  useEffect(() => {
    if (phase === 'done' && autoAdvance) {
      const timer = setTimeout(() => {
        navigate('/decision', {
          state: { score, signals, decision, sessionToken, scenarioName, scenarioId, isHijackScenario },
        });
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [phase, navigate, score, signals, decision, sessionToken, scenarioName, scenarioId, isHijackScenario, autoAdvance]);

  const signalEntries = signals ? Object.entries(signals) : [];

  if (phase === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-light">
        <div className="text-center">
          <p className="text-alert-red font-semibold mb-4">Something went wrong</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-navy text-white rounded-lg hover:bg-navy/90 transition"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-light flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md text-center">
        <p className="text-sm text-navy/40 mb-6 animate-pulse-slow">
          {phase === 'loading' ? 'Initializing...' : 'Evaluating identity signals...'}
        </p>

        <div className="mb-8 flex justify-center">
          <TrustScoreCircle score={score} animated={true} size={200} />
        </div>

        {signals && (
          <div className="space-y-2.5 mb-4">
            {signalEntries.map(([key, data], i) => (
              <SignalCard key={key} signalKey={key} signalData={data} delay={i * 150} />
            ))}
          </div>
        )}

        {phase === 'done' && (
          <div className="flex items-center justify-center gap-4 mt-4">
            <p className="text-xs text-navy/30">Auto-advancing...</p>
            <button
              onClick={() => setAutoAdvance(false)}
              className="text-xs text-orange-accent hover:underline"
            >
              See Explanation
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
