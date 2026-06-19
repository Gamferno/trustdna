import { useState } from 'react';
import { getSignalIcon } from './Icons.jsx';

const SEVERITY_CONFIG = {
  critical: { color: '#FF4444', bg: '#FF444410', label: 'CRITICAL' },
  high: { color: '#FFBB33', bg: '#FFBB3310', label: 'HIGH' },
  low: { color: '#00C851', bg: '#00C85110', label: 'LOW' },
};

export default function AlertCard({ alert }) {
  const [expanded, setExpanded] = useState(false);
  const config = SEVERITY_CONFIG[alert.severity] || SEVERITY_CONFIG.low;
  const signals = alert.signals;

  return (
    <div
      className="bg-white rounded-lg border border-border mb-3 hover:shadow-md transition-shadow cursor-pointer overflow-hidden"
      onClick={() => setExpanded(!expanded)}
    >
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span
            className="text-xs font-bold px-2 py-0.5 rounded-full"
            style={{ backgroundColor: config.bg, color: config.color }}
          >
            {config.label}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-navy/40">{alert.timestamp}</span>
            {signals && (
              <span className="text-xs text-navy/20 select-none">
                {expanded ? '\u25B2' : '\u25BC'}
              </span>
            )}
          </div>
        </div>
        <h4 className="font-semibold text-navy mb-2">{alert.event}</h4>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-navy/60">
          <span>User: <strong className="text-navy">{alert.user}</strong></span>
          <span>Risk Score: <strong style={{ color: config.color }}>{alert.risk_score}%</strong></span>
          {alert.device_id && <span>Device: {alert.device_id}</span>}
          {alert.location && <span>Location: {alert.location}</span>}
          <span>Action: <strong className="text-navy capitalize">{alert.action_taken?.replace(/_/g, ' ')}</strong></span>
        </div>
      </div>

      {expanded && signals && (
        <div className="border-t border-border p-4 bg-bg-light">
          <h5 className="text-xs font-semibold text-navy/40 uppercase mb-3">Signal Breakdown</h5>
          <div className="space-y-2.5">
            {Object.entries(signals).map(([key, data]) => {
              const scoreColor = data.score >= 80 ? '#00C851' : data.score >= 50 ? '#FFBB33' : '#FF4444';
              const IconComp = getSignalIcon(key);
              return (
                <div key={key} className="flex items-start gap-3">
                  <div className="mt-0.5 flex-shrink-0">
                    <IconComp size={18} color={scoreColor} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-navy capitalize">{key.replace(/_/g, ' ')}</span>
                      <span className="text-xs font-bold" style={{ color: scoreColor }}>{data.score}%</span>
                    </div>
                    <div className="w-full h-1 bg-gray-200 rounded-full mb-1">
                      <div className="h-full rounded-full" style={{ width: `${data.score}%`, backgroundColor: scoreColor }} />
                    </div>
                    <p className="text-[10px] text-navy/40 leading-relaxed">{data.reasoning}</p>
                    {data.flagged && (
                      <span className="inline-block mt-1 text-[10px] font-bold text-alert-red bg-alert-red/10 px-1.5 py-0.5 rounded">
                        FLAGGED
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
