export const SCENARIO_META = {
  1: {
    title: 'Normal Login',
    subtitle: 'Om logs in from home on his MacBook',
    context: 'Known device \u2022 Home location \u2022 Normal hours',
    icon: 'home',
  },
  2: {
    title: 'Unusual Location',
    subtitle: 'Om is traveling to Delhi for work',
    context: 'New device \u2022 New location \u2022 Still probably Om',
    icon: 'location',
  },
  3: {
    title: 'Obvious Attack',
    subtitle: 'Attacker with stolen password',
    context: 'Unknown device \u2022 Impossible travel \u2022 3:47 AM \u2022 Robotic typing',
    icon: 'shield',
  },
  4: {
    title: 'Session Hijack',
    subtitle: 'Continuous trust monitoring in action',
    context: 'Normal login \u2192 session hijacked mid-browse \u2192 trust score crashes',
    icon: 'refresh',
  },
};

export function getTrustColor(score) {
  if (score >= 80) return '#00C851';
  if (score >= 50) return '#FFBB33';
  return '#FF4444';
}

export function getTrustLabel(score) {
  if (score >= 80) return 'HIGH TRUST';
  if (score >= 50) return 'MEDIUM TRUST';
  return 'LOW TRUST';
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
  }).format(amount);
}
