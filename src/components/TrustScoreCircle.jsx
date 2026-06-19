import { getTrustColor } from '../utils/scenarios';

export default function TrustScoreCircle({ score, animated = true, size = 180 }) {
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const color = getTrustColor(score);
  const offset = animated ? circumference : circumference * (1 - score / 100);

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#E0E0E0"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            transition: animated ? 'stroke-dashoffset 1.5s ease-in-out' : 'none',
          }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span
          className="font-display font-bold"
          style={{
            fontSize: size * 0.28,
            color,
            transition: 'color 0.5s',
          }}
        >
          {score}%
        </span>
        <span className="text-xs font-medium text-navy/60 mt-1">Trust Score</span>
      </div>
    </div>
  );
}
