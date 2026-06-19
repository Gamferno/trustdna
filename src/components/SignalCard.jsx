import { getTrustColor } from '../utils/scenarios';
import { getSignalIcon } from './Icons.jsx';

export default function SignalCard({ signalKey, signalData, delay = 0 }) {
  if (!signalData) return null;

  const { score, reasoning } = signalData;
  const color = getTrustColor(score);
  const IconComp = getSignalIcon(signalKey);

  return (
    <div
      className="bg-white rounded-lg border border-border p-4 flex items-start gap-3 opacity-0"
      style={{
        animation: 'fadeIn 0.4s ease-out forwards',
        animationDelay: `${delay}ms`,
      }}
    >
      <div className="flex-shrink-0 mt-0.5">
        <IconComp size={22} color={color} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h4 className="font-semibold text-sm text-navy capitalize">{signalKey.replace(/_/g, ' ')}</h4>
          <span
            className="text-xs font-bold px-2 py-0.5 rounded-full"
            style={{ backgroundColor: `${color}20`, color }}
          >
            {score}%
          </span>
        </div>
        <div className="w-full h-1.5 bg-gray-100 rounded-full mb-1.5">
          <div
            className="h-full rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${score}%`, backgroundColor: color }}
          />
        </div>
        <p className="text-xs text-navy/60 leading-relaxed">{reasoning}</p>
      </div>
    </div>
  );
}
