// ============================================================
// TrustDNA Standalone — Full Backend Simulation
// All data is generated client-side, no server needed.
// ============================================================

// ── Helpers ────────────────────────────────────────────────
const rand = (seed) => {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
};

function makeToken() {
  const hex = () => Math.random().toString(16).slice(2, 8);
  return `SESSION_${hex()}${hex()}${hex()}`.toUpperCase().slice(0, 24);
}

function haversine(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dlat = ((lat2 - lat1) * Math.PI) / 180;
  const dlng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dlat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dlng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function extractHour(ts) {
  try {
    const d = new Date(ts.replace(' ', 'T').replace(' IST', '+05:30'));
    return d.getHours();
  } catch {
    return 12;
  }
}

// ── User Profiles ─────────────────────────────────────────
const USER_PROFILES = {
  om_sharma: {
    name: 'Om Sharma',
    account_type: 'Premium Checking',
    account_number: 'XXXX-XXXX-XXXX-4289',
    balance: 245380,
    currency: 'INR',
    recent_transactions: [
      { id: 'TXN_001', type: 'transfer', amount: 5000, to: 'Rahul (ICIC...8234)', timestamp: '2025-01-15T10:30:00Z', status: 'success' },
      { id: 'TXN_002', type: 'bill_payment', amount: 1200, to: 'Jio Postpaid', timestamp: '2025-01-15T09:15:00Z', status: 'success' },
      { id: 'TXN_003', type: 'deposit', amount: 50000, to: 'Salary Credit', timestamp: '2025-01-14T11:00:00Z', status: 'success' },
      { id: 'TXN_004', type: 'bill_payment', amount: 850, to: 'BSNL Broadband', timestamp: '2025-01-13T16:45:00Z', status: 'success' },
    ],
    security_alerts: 0,
    baseline: {
      known_devices: [
        { id: 'DEVICE_HASH_123', name: 'MacBook Pro', os: 'macOS', last_used: '2025-01-15' },
        { id: 'DEVICE_HASH_456', name: 'iPhone 14', os: 'iOS', last_used: '2025-01-14' },
      ],
      known_locations: [
        { name: 'Ghaziabad (Home)', lat: 28.5355, lng: 77.391, radius_km: 5 },
        { name: 'Delhi (Office)', lat: 28.6139, lng: 77.209, radius_km: 8 },
      ],
      normal_login_times: { start_hour: 9, end_hour: 23, peak_hours: [9, 10, 11, 14, 18, 21], preferred_timezone: 'IST' },
      keystroke_baseline: { avg_wpm: 65, std_dev: 8, avg_error_rate: 0.05 },
    },
  },
  demo_user: {
    name: 'Demo User',
    account_type: 'Savings Account',
    account_number: 'XXXX-XXXX-XXXX-7821',
    balance: 128500,
    currency: 'INR',
    recent_transactions: [
      { id: 'TXN_101', type: 'transfer', amount: 2500, to: 'Priya (HDFC...9012)', timestamp: '2025-01-15T14:00:00Z', status: 'success' },
      { id: 'TXN_102', type: 'bill_payment', amount: 2400, to: 'Electricity Bill', timestamp: '2025-01-14T10:00:00Z', status: 'success' },
    ],
    security_alerts: 0,
    baseline: {
      known_devices: [{ id: 'DEVICE_HASH_789', name: 'Dell XPS 15', os: 'Windows', last_used: '2025-01-15' }],
      known_locations: [{ name: 'Mumbai (Home)', lat: 19.076, lng: 72.8777, radius_km: 8 }],
      normal_login_times: { start_hour: 8, end_hour: 22, peak_hours: [9, 10, 14, 15, 16], preferred_timezone: 'IST' },
      keystroke_baseline: { avg_wpm: 55, std_dev: 6, avg_error_rate: 0.03 },
    },
  },
};

// ── Scenarios ─────────────────────────────────────────────
const SCENARIOS = {
  1: {
    scenario_id: 1,
    scenario_name: 'Normal Login',
    device_id: 'DEVICE_HASH_123',
    device_name: 'MacBook Pro',
    device_os: 'macOS',
    location: { lat: 28.5355, lng: 77.391, name: 'Ghaziabad (Home)' },
    time: '10:30 AM IST, Wednesday',
    timestamp: '2025-01-15T10:32:00+05:30',
    keystroke_timing: 65,
    user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    expected_trust_score: 94,
    expected_decision: 'approve',
    description: 'User logs in from home on a known device during normal hours',
  },
  2: {
    scenario_id: 2,
    scenario_name: 'Unusual Location',
    device_id: 'DEVICE_HASH_NEW',
    device_name: 'Redmi Note 10',
    device_os: 'Android',
    location: { lat: 28.7041, lng: 77.1025, name: 'Delhi (22 km from home)' },
    time: '02:15 PM IST, Wednesday',
    timestamp: '2025-01-15T14:15:00+05:30',
    keystroke_timing: 72,
    user_agent: 'Mozilla/5.0 (Linux; Android 12; Redmi Note 10) AppleWebKit/537.36',
    expected_trust_score: 62,
    expected_decision: 'step_up_auth_required',
    description: 'User logs in from new location on new device — could be legitimate travel',
  },
  3: {
    scenario_id: 3,
    scenario_name: 'Obvious Attack',
    device_id: 'DEVICE_HASH_UNKNOWN',
    device_name: 'Generic Android (Rooted)',
    device_os: 'Android',
    location: { lat: 19.076, lng: 72.8777, name: 'Mumbai, Maharashtra' },
    time: '03:47 AM IST, Wednesday',
    timestamp: '2025-01-15T03:47:00+05:30',
    keystroke_timing: 120,
    user_agent: 'Mozilla/5.0 (Linux; Android 9; Generic_Android) AppleWebKit/537.36',
    expected_trust_score: 18,
    expected_decision: 'block',
    description: 'Attacker with stolen password, unknown device, impossible travel distance, 3:47 AM, robotic typing',
  },
  4: {
    scenario_id: 4,
    scenario_name: 'Session Hijack',
    device_id: 'DEVICE_HASH_123',
    device_name: 'MacBook Pro',
    device_os: 'macOS',
    location: { lat: 28.5355, lng: 77.391, name: 'Ghaziabad (Home)' },
    time: '10:30 AM IST, Wednesday',
    timestamp: '2025-01-15T10:32:00+05:30',
    keystroke_timing: 65,
    user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    expected_trust_score: 94,
    expected_decision: 'approve',
    is_hijack: true,
    description: 'User logs in normally, then session is hijacked mid-browsing',
  },
};

// ── Scoring Engine (replicates backend baselines.py) ──────
function scoreDevice(knownDevices, deviceId) {
  for (const d of knownDevices) {
    if (d.id === deviceId) {
      const daysSince = Math.floor((Date.now() - new Date(d.last_used).getTime()) / 86400000);
      if (daysSince < 7) return 95;
      if (daysSince < 30) return 80;
      return 65;
    }
  }
  return 30;
}

function scoreLocation(knownLocs, lat, lng) {
  let best = 10;
  for (const loc of knownLocs) {
    const dist = haversine(loc.lat, loc.lng, lat, lng);
    if (dist < 5) best = Math.max(best, 98);
    else if (dist < 20) best = Math.max(best, 85);
    else if (dist < 100) best = Math.max(best, 60);
    else if (dist < 500) best = Math.max(best, 35);
    else best = Math.max(best, 20);
  }
  return best;
}

function scoreTime(loginTimes, timestamp) {
  const hour = extractHour(timestamp);
  if (loginTimes.peak_hours.includes(hour)) return 95;
  if (hour >= loginTimes.start_hour && hour <= loginTimes.end_hour) return 80;
  if (hour >= 0 && hour < 6) return 25;
  return 60;
}

function scoreBehavior(baseline, wpm) {
  const deviation = Math.abs(wpm - baseline.avg_wpm) / baseline.avg_wpm;
  if (deviation < 0.1) return 95;
  if (deviation < 0.2) return 85;
  if (deviation < 0.4) return 65;
  return 35;
}

function detectImpossibleTravel(knownLocs, lat, lng, timestamp, lastInfo) {
  if (!lastInfo) return null;
  const lastDt = new Date(lastInfo.timestamp.replace(' ', 'T').replace(' IST', '+05:30'));
  const curDt = new Date(timestamp.replace(' ', 'T').replace(' IST', '+05:30'));
  const hoursDiff = Math.abs((curDt - lastDt) / 3600000);
  if (hoursDiff <= 0) return null;
  const distKm = haversine(lastInfo.location.lat, lastInfo.location.lng, lat, lng);
  const speedKmh = distKm / Math.max(hoursDiff, 0.25);
  if (speedKmh > 500 || (distKm > 500 && hoursDiff < 1)) {
    return {
      detected: true,
      distance_km: Math.round(distKm * 10) / 10,
      time_hours: Math.round(hoursDiff * 100) / 100,
      speed_kmh: Math.round(speedKmh * 10) / 10,
      reasoning: `Impossible travel: ${Math.round(distKm)} km in ${Math.round(hoursDiff * 60)} minutes (${Math.round(speedKmh)} km/h). Physically impossible.`,
    };
  }
  if (speedKmh > 300) {
    return { detected: false, suspicious: true, reasoning: `Suspicious travel: ${Math.round(distKm)} km in ${Math.round(hoursDiff * 60)} minutes.` };
  }
  return null;
}

function calculateTrust(username, requestData, scenarioId) {
  const profile = USER_PROFILES[username];
  if (!profile) return null;

  const baseline = profile.baseline;
  const deviceScore = scoreDevice(baseline.known_devices, requestData.device_id);
  const locationScore = scoreLocation(baseline.known_locations, requestData.location_lat, requestData.location_lng);
  const timeScore = scoreTime(baseline.normal_login_times, requestData.timestamp);
  const wpm = requestData.keystroke_timing || baseline.keystroke_baseline.avg_wpm;
  const behaviorScore = scoreBehavior(baseline.keystroke_baseline, wpm);

  const homeLoc = baseline.known_locations[0];
  const lastInfo =
    scenarioId === '3'
      ? { timestamp: '2025-01-15T03:30:00+05:30', location: { lat: homeLoc.lat, lng: homeLoc.lng, name: homeLoc.name } }
      : { timestamp: '2025-01-15T09:00:00+05:30', location: { lat: homeLoc.lat, lng: homeLoc.lng, name: homeLoc.name } };

  const travelResult = detectImpossibleTravel(
    baseline.known_locations,
    requestData.location_lat,
    requestData.location_lng,
    requestData.timestamp,
    lastInfo,
  );

  let travelPenalty = 0;
  let travelReasoning = null;
  if (travelResult) {
    if (travelResult.detected) {
      travelPenalty = 30;
      travelReasoning = travelResult.reasoning;
    } else if (travelResult.suspicious) {
      travelPenalty = 10;
      travelReasoning = travelResult.reasoning;
    }
  }

  const weights = { device: 0.2, location: 0.2, time: 0.2, behavior: 0.3, travel: 0.1 };
  const rawTrust =
    weights.device * deviceScore +
    weights.location * locationScore +
    weights.time * timeScore +
    weights.behavior * behaviorScore +
    weights.travel * (100 - travelPenalty);

  const trustScore = Math.max(5, Math.round(rawTrust));
  const behaviorDeviation = (Math.abs(wpm - baseline.keystroke_baseline.avg_wpm) / baseline.keystroke_baseline.avg_wpm) * 100;

  const mkReasoning = (signal, score) => {
    if (signal === 'impossible_travel') return travelReasoning || 'No unusual travel pattern detected.';
    const r = {
      device_recognition:
        score >= 90
          ? 'Known device (registered 3 months ago, used in last 7 days)'
          : score >= 70
            ? 'Known device but hasn\'t been used recently (over 7 days)'
            : score <= 30
              ? 'Unknown device — no match in registered device database'
              : 'Device has limited recognition history',
      location_anomaly:
        score >= 95
          ? 'Exact match with home location. 100% consistency with baseline.'
          : score >= 60
            ? `Near familiar area (${score}% match). Within expected travel range.`
            : 'Location is far from any known baseline. No previous visits recorded.',
      time_pattern:
        score >= 90
          ? 'Peak login hour. 87% of historical logins occur at this time window.'
          : score >= 70
            ? 'Within normal operating hours. Consistent with user patterns.'
            : score <= 30
              ? 'Unusual time window. Only 3% of logins occur between 12 AM-6 AM.'
              : 'Slightly outside normal login schedule.',
      behavioral_baseline:
        behaviorDeviation < 8
          ? `Keystroke timing matches baseline perfectly (deviation: ${behaviorDeviation.toFixed(0)}%)`
          : behaviorDeviation < 15
            ? `Keystroke timing matches baseline (deviation: ${behaviorDeviation.toFixed(0)}%)`
            : behaviorDeviation < 35
              ? `Keystroke timing off baseline (deviation: ${behaviorDeviation.toFixed(0)}%). Possible fatigue or unfamiliar device.`
              : `Robotic keystroke speed detected (${behaviorDeviation.toFixed(0)}% deviation). Pattern matches automated scripts.`,
    };
    return r[signal] || 'Signal analyzed.';
  };

  const signals = {
    device_recognition: { score: deviceScore, reasoning: mkReasoning('device_recognition', deviceScore) },
    location_anomaly: { score: locationScore, reasoning: mkReasoning('location_anomaly', locationScore) },
    time_pattern: { score: timeScore, reasoning: mkReasoning('time_pattern', timeScore) },
    behavioral_baseline: { score: behaviorScore, reasoning: mkReasoning('behavioral_baseline', behaviorScore) },
    impossible_travel: {
      score: 100 - travelPenalty,
      reasoning: mkReasoning('impossible_travel', 100 - travelPenalty),
      flagged: travelResult?.detected || false,
    },
  };

  let decision, nextAction;
  if (trustScore >= 80) {
    decision = 'approve';
    nextAction = 'dashboard';
  } else if (trustScore >= 40) {
    decision = 'step_up_auth_required';
    nextAction = 'verify';
  } else {
    decision = 'block';
    nextAction = 'blocked';
  }

  return { signals, trust_score: trustScore, decision, next_action: nextAction };
}

// ── In-memory Session Store ──────────────────────────────
const sessions = {};
let socAlerts = [];

// ── Mock API Functions ───────────────────────────────────
export async function loginWithScenario(scenarioId, username = 'om_sharma') {
  const scenario = SCENARIOS[scenarioId];
  if (!scenario) throw new Error(`Scenario ${scenarioId} not found`);

  const requestData = {
    device_id: scenario.device_id,
    device_name: scenario.device_name,
    device_os: scenario.device_os,
    location_lat: scenario.location.lat,
    location_lng: scenario.location.lng,
    location_name: scenario.location.name,
    timezone: 'IST',
    timestamp: scenario.timestamp,
    user_agent: scenario.user_agent,
    keystroke_timing: scenario.keystroke_timing,
  };

  const result = calculateTrust(username, requestData, scenarioId);
  if (!result) throw new Error('User not found');

  const token = makeToken();
  sessions[token] = { username, scenario_id: scenarioId, trust_score: result.trust_score, decision: result.decision, created_at: new Date().toISOString() };

  const alertEntry = {
    id: `ALERT_${(socAlerts.length + 1).toString().padStart(3, '0')}`,
    severity: result.decision === 'block' ? 'critical' : result.decision === 'step_up_auth_required' ? 'high' : 'low',
    user: username,
    event: result.decision === 'block' ? 'Login attempt blocked — high-risk activity' : result.decision === 'step_up_auth_required' ? 'Login requires step-up authentication' : 'Normal login — no anomalies detected',
    device_id: scenario.device_id,
    location: scenario.location.name,
    timestamp: scenario.timestamp,
    risk_score: result.trust_score,
    action_taken: result.decision === 'block' ? 'blocked' : result.decision === 'step_up_auth_required' ? 'step_up_auth_required' : 'approved',
    device_info: { os: scenario.device_os, browser: 'Chrome', first_seen: null },
    signals: result.signals,
  };
  socAlerts.push(alertEntry);

  return {
    status: 'success',
    trust_score: result.trust_score,
    decision: result.decision,
    signals: result.signals,
    next_action: result.next_action,
    session_token: token,
    scenario_name: scenario.scenario_name,
    scenario_id: scenarioId,
    is_hijack_scenario: !!scenario.is_hijack,
  };
}

export async function loginCustom(data) {
  const username = data.username || 'om_sharma';
  const requestData = {
    device_id: data.device_id,
    device_name: data.device_name,
    device_os: data.device_os,
    location_lat: data.location_lat,
    location_lng: data.location_lng,
    location_name: data.location_name,
    timezone: data.timezone || 'IST',
    timestamp: data.timestamp || new Date().toISOString(),
    user_agent: data.user_agent || 'Mozilla/5.0',
    keystroke_timing: data.keystroke_timing || 65,
  };

  const result = calculateTrust(username, requestData, null);
  if (!result) throw new Error('User not found');

  const token = makeToken();
  sessions[token] = { username, scenario_id: null, trust_score: result.trust_score, decision: result.decision, created_at: new Date().toISOString() };

  return {
    status: 'success',
    trust_score: result.trust_score,
    decision: result.decision,
    signals: result.signals,
    next_action: result.next_action,
    session_token: token,
  };
}

export async function verifyStepUp(sessionToken, method, result = 'success') {
  const session = sessions[sessionToken];
  if (!session) throw new Error('Invalid session');

  if (result !== 'success') throw new Error('Verification failed');

  const boost = method === 'selfie' ? 25 : 18;
  const newScore = Math.min(session.trust_score + boost, 100);
  session.trust_score = newScore;
  session.decision = 'approve';
  delete session.hijack_active;

  const methodNames = { fingerprint: 'Fingerprint verified', email: 'Email verified', selfie: 'Face verified' };
  const newToken = makeToken();
  sessions[newToken] = { ...session };
  delete sessions[sessionToken];

  return {
    status: 'success',
    updated_trust_score: newScore,
    message: `${methodNames[method] || 'Verification'} successfully. Trust Score updated to ${newScore}%.`,
    next_action: 'dashboard',
    new_session_token: newToken,
  };
}

export async function getDashboard(sessionToken) {
  const session = sessions[sessionToken];
  if (!session) throw new Error('Invalid session token');

  const profile = USER_PROFILES[session.username];
  if (!profile) throw new Error('User not found');

  return {
    user: { name: profile.name, account_type: profile.account_type, account_number: profile.account_number },
    balance: { current: profile.balance, currency: profile.currency, last_updated: '2025-01-15T10:32:00Z' },
    recent_transactions: profile.recent_transactions,
    trust_score: session.trust_score,
    security_alerts: profile.security_alerts,
  };
}

export async function getSOCAlerts(filterSeverity = 'all', limit = 20) {
  let alerts = [...socAlerts];
  if (filterSeverity !== 'all') {
    alerts = alerts.filter((a) => a.severity === filterSeverity);
  }
  alerts.sort((a, b) => (b.timestamp || '').localeCompare(a.timestamp || ''));
  return { alerts: alerts.slice(0, limit).map((a) => ({ ...a })) };
}

function computeHijackSignals(trust) {
  const scale = Math.max(0, Math.min(1, (94 - trust) / 64));
  const templates = {
    keystroke_rhythm: { stableLo: 1.5, stableHi: 3.8, badLo: 15, badHi: 40 },
    mouse_patterns:    { stableLo: 2.0, stableHi: 5.1, badLo: 20, badHi: 55 },
    navigation_flow:   { stableLo: 0.5, stableHi: 2.2, badLo: 10, badHi: 35 },
  };
  const signals = {};
  for (const [key, t] of Object.entries(templates)) {
    const lo = t.stableLo + (t.badLo - t.stableLo) * scale;
    const hi = t.stableHi + (t.badHi - t.stableHi) * scale;
    const deviation = Math.round((lo + Math.random() * (hi - lo)) * 10) / 10;
    let status;
    if (trust >= 85)            status = 'stable';
    else if (trust >= 70)       status = 'degrading';
    else if (trust >= 50)       status = 'erratic';
    else                        status = 'critical';
    signals[key] = { status, deviation };
  }
  return signals;
}

export async function getSessionMonitor(sessionToken) {
  const session = sessions[sessionToken];
  if (!session) throw new Error('Invalid session token');

  const seed = sessionToken.split('').reduce((s, c) => s + c.charCodeAt(0), 0);
  const rng = rand(seed);

  let currentTrust = session.trust_score;
  if (session.scenario_id === '4' && session.hijack_active) {
    const elapsed = session.hijack_elapsed || 0;
    const degradation = Math.min(60, elapsed * 2);
    currentTrust = Math.max(session.initial_trust || 95 - degradation, 30);
  }

  // During active hijack, return actual trust without fluctuation so it decreases monotonically.
  // Signals degrade immediately as trust drops — the changing signals ARE why trust decreases.
  if (session.hijack_active) {
    const trust = currentTrust;
    return {
      current_trust: trust,
      session_age_seconds: Math.floor(Math.random() * 480) + 120,
      signals_active: computeHijackSignals(trust),
    };
  }

  const fluctuation = Math.floor(rng() * 5) - 2;
  const displayTrust = Math.max(0, Math.min(100, currentTrust + fluctuation));
  const isBad = displayTrust <= 60;

  return {
    current_trust: displayTrust,
    session_age_seconds: Math.floor(Math.random() * 480) + 120,
    signals_active: {
      keystroke_rhythm: { status: isBad ? 'degrading' : 'stable', deviation: Math.round((isBad ? rng() * 25 + 15 : rng() * 2.3 + 1.5) * 10) / 10 },
      mouse_patterns: { status: isBad ? 'erratic' : 'normal', deviation: Math.round((isBad ? rng() * 35 + 20 : rng() * 3.1 + 2) * 10) / 10 },
      navigation_flow: { status: isBad ? 'anomalous' : 'normal', deviation: Math.round((isBad ? rng() * 25 + 10 : rng() * 1.7 + 0.5) * 10) / 10 },
    },
  };
}

export async function triggerHijack(sessionToken) {
  const session = sessions[sessionToken];
  if (!session) throw new Error('Invalid session token');

  session.hijack_active = true;
  session.initial_trust = session.trust_score;
  session.hijack_elapsed = 0;

  return { status: 'hijack_started', initial_trust: session.initial_trust };
}

export async function advanceHijack(sessionToken) {
  const session = sessions[sessionToken];
  if (!session || !session.hijack_active) throw new Error('No active hijack');

  session.hijack_elapsed = (session.hijack_elapsed || 0) + 5;
  const elapsed = session.hijack_elapsed;
  const degradation = Math.min(60, elapsed * 2);
  const newScore = Math.max((session.initial_trust || 95) - degradation, 30);
  session.trust_score = newScore;

  const sessionStatus = newScore >= 80 ? 'normal' : newScore >= 50 ? 'degrading' : 'critical';

  return {
    elapsed_seconds: elapsed,
    current_trust: newScore,
    status: sessionStatus,
    next_action: newScore >= 80 ? 'continue' : newScore >= 50 ? 'step_up_required' : 'session_terminated',
    signals_active: computeHijackSignals(newScore),
  };
}
