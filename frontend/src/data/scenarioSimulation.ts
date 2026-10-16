export type EventScenarioId = '2019' | '2023' | '2024';

export interface SegmentCollection {
  type: 'FeatureCollection';
  features: Array<{
    type: 'Feature';
    geometry: any;
    properties: Record<string, any>;
  }>;
  [key: string]: any;
}

const riskClass = (score: number) => {
  if (score >= 65) return 'severe';
  if (score >= 40) return 'high';
  if (score >= 20) return 'moderate';
  return 'low';
};

function coordinates(feature: SegmentCollection['features'][number]) {
  // GeoJSON lines may be LineStrings or MultiLineStrings. Flatten all coordinate
  // pairs before averaging; treating a nested line as a point produced NaN scores.
  const points: number[][] = [];
  const visit = (value: unknown) => {
    if (!Array.isArray(value)) return;
    if (value.length >= 2 && typeof value[0] === 'number' && typeof value[1] === 'number') {
      points.push(value as number[]);
      return;
    }
    value.forEach(visit);
  };
  visit(feature.geometry?.coordinates);
  if (!points.length) return [73.85, 18.52];
  const center = points.reduce((acc, point) => [acc[0] + point[0] / points.length, acc[1] + point[1] / points.length], [0, 0]);
  return center.every(Number.isFinite) ? center : [73.85, 18.52];
}

function getScenarioScore(id: EventScenarioId, hour: number, lon: number, lat: number, props: Record<string, any>) {
  const underpassBoost = props.is_underpass || props.is_tunnel ? 15 : 0;
  const lowRoadBoost = ['primary', 'secondary', 'trunk'].includes(props.road_class) ? 5 : 0;
  const vulnerability = underpassBoost + lowRoadBoost;

  if (id === '2019') {
    // A deliberately hypothetical west-to-east citywide rain pulse.
    const band = lon < 73.835 ? 0 : lon < 73.875 ? 1 : 2;
    const profile = [
      [72, 88, 68, 44, 26, 14],
      [34, 60, 86, 72, 48, 26],
      [18, 34, 58, 82, 68, 42],
    ][band];
    return Math.max(0, Math.min(100, profile[hour - 1] + vulnerability));
  }

  const origin = id === '2023' ? [73.83, 18.49] : [73.821, 18.478];
  // Move the rainfall/flood wave east each hour: roads behind it recede while
  // the advancing edge intensifies, so playback visibly changes spatially.
  const waveCenter = [origin[0] + (hour - 1) * 0.006, origin[1] - (hour - 1) * 0.001];
  const dx = (lon - waveCenter[0]) * 111 * Math.cos((lat * Math.PI) / 180);
  const dy = (lat - waveCenter[1]) * 111;
  const distanceKm = Math.sqrt(dx * dx + dy * dy);
  const reach = id === '2023' ? 6.8 : 5.8;
  const spatialWeight = Math.max(0, 1 - distanceKm / reach);
  const signal = id === '2023'
    ? [72, 84, 92, 82, 66, 48][hour - 1]
    : [78, 90, 96, 82, 62, 42][hour - 1];

  // The advancing edge can increase while the origin is already receding.
  const downstreamWave = lon > origin[0] + 0.01 && hour >= 2
    ? Math.min(14, (hour - 1) * 3)
    : 0;
  const floor = spatialWeight > 0 ? 4 : 0;
  return Math.max(0, Math.min(100, floor + signal * spatialWeight + downstreamWave * spatialWeight + vulnerability * spatialWeight));
}

/**
 * Produces an illustrative what-if sequence from road geometry and fixed rules.
 * It is explicitly not a historical flood map, trained-model forecast, or label.
 */
export function simulateEventScenario(roads: SegmentCollection, scenario: EventScenarioId, hour: number) {
  const safeHour = Math.max(1, Math.min(6, Math.round(hour)));
  const previousHour = Math.max(0, safeHour - 1);
  let scoreTotal = 0;
  let increasing = 0;
  let easing = 0;
  const counts = { low: 0, moderate: 0, high: 0, severe: 0 };

  const features = roads.features.map((feature) => {
    const [lon, lat] = coordinates(feature);
    const score = getScenarioScore(scenario, safeHour, lon, lat, feature.properties);
    const previousScore = previousHour === 0 ? 0 : getScenarioScore(scenario, previousHour, lon, lat, feature.properties);
    const direction = score > previousScore + 0.5 ? 'increasing' : score < previousScore - 0.5 ? 'easing' : 'steady';
    if (direction === 'increasing') increasing += 1;
    if (direction === 'easing') easing += 1;
    scoreTotal += score;
    const currentClass = riskClass(score) as keyof typeof counts;
    counts[currentClass] += 1;

    return {
      ...feature,
      properties: {
        ...feature.properties,
        horizon_h: safeHour,
        risk_class: currentClass,
        probability: Number((score / 100).toFixed(3)),
        simulation_score: Math.round(score),
        change_from_previous_hour: Math.round(score - previousScore),
        trend: direction,
        confidence_level: 'Low',
        top_reasons: [
          'Illustrative rainfall-wave scenario; not an observed flood report',
          feature.properties.is_underpass ? 'Underpass vulnerability boost in the scenario rule' : 'Risk changes with the hypothetical regional rainfall wave',
          `Scenario step +${safeHour} hour of 6`,
        ],
        is_simulation: true,
        model_type: 'hypothetical_rule_baseline',
        source_event_context: scenario,
      },
    };
  });

  return {
    type: 'FeatureCollection',
    name: `hypothetical_${scenario}_hour_${safeHour}`,
    is_simulation: true,
    simulation_notice: 'Illustrative what-if scenario only; not a reconstruction of observed flood extent or a trained model prediction.',
    scenario_id: scenario,
    hour: safeHour,
    summary: {
      mean_risk_score: roads.features.length ? Math.round(scoreTotal / roads.features.length) : 0,
      increasing_segments: increasing,
      easing_segments: easing,
      counts,
    },
    features,
  };
}
