"use client";

import type { CSSProperties } from "react";
import { useMemo, useState } from "react";
import {
  benchmarkComparison,
  benchmarkFilters,
  maturityLevelLabels,
  maturityStandards,
  roadmapItems,
  topRecommendedActions,
  type MaturityStandard
} from "@/lib/maturity/mock-data";

export function ClientMaturityDashboard() {
  const [enabledStandards, setEnabledStandards] = useState<Record<string, boolean>>(
    Object.fromEntries(maturityStandards.map((standard) => [standard.id, standard.enabled]))
  );

  const activeStandards = useMemo(() => maturityStandards.filter((standard) => enabledStandards[standard.id]), [enabledStandards]);
  const radarPoints = useMemo(() => buildRadarPoints(activeStandards), [activeStandards]);

  function toggleStandard(id: string) {
    setEnabledStandards((current) => ({
      ...current,
      [id]: !current[id]
    }));
  }

  return (
    <section className="maturity-dashboard" id="client-maturity-dashboard">
      <header className="page-header">
        <div>
          <p className="eyebrow">Client Maturity Dashboard</p>
          <h1>{benchmarkComparison.client}</h1>
          <p className="muted">
            Benchmark maturity, multi-standard readiness, execution roadmap, and AI next-best actions for workforce governance.
          </p>
        </div>
        <div className="header-actions">
          <a className="secondary-action" href="#maturity-roadmap">
            View roadmap
          </a>
          <a className="primary-action" href="#ai-next-actions">
            What should we do next?
          </a>
        </div>
      </header>

      <BenchmarkComparison />

      <section className="panel panel-wide">
        <div className="section-heading">
          <div>
            <h2>Multi-Standard Maturity</h2>
            <p className="muted">Toggle standards on or off based on the client’s scope.</p>
          </div>
          <div className="toggle-row" aria-label="Standard toggles">
            {maturityStandards.map((standard) => (
              <label className="toggle-pill" key={standard.id}>
                <input checked={enabledStandards[standard.id]} onChange={() => toggleStandard(standard.id)} type="checkbox" />
                {standard.name}
              </label>
            ))}
          </div>
        </div>

        {activeStandards.length === 0 ? (
          <p className="empty-state">No standards selected. Turn on at least one standard to view maturity.</p>
        ) : (
          <div className="standard-grid">
            {activeStandards.map((standard) => (
              <StandardMaturityCard key={standard.id} standard={standard} />
            ))}
          </div>
        )}
      </section>

      <section className="dashboard-grid">
        <section className="panel">
          <div className="section-heading">
            <div>
              <h2>Radar View</h2>
              <p className="muted">Average domain maturity across selected standards.</p>
            </div>
          </div>
          <div className="radar-wrap" aria-label="Maturity radar chart">
            <svg viewBox="0 0 220 220" role="img">
              <title>Maturity radar chart</title>
              <polygon className="radar-ring" points="110,20 195,80 162,180 58,180 25,80" />
              <polygon className="radar-ring inner" points="110,50 166,90 144,155 76,155 54,90" />
              <polygon className="radar-fill" points={radarPoints} />
              <circle cx="110" cy="110" r="3" />
            </svg>
          </div>
        </section>

        <section className="panel" id="ai-next-actions">
          <div className="section-heading">
            <div>
              <h2>What should we do next?</h2>
              <p className="muted">Mocked AI recommendation panel. Server-side AI is wired in the next commit.</p>
            </div>
          </div>
          <div className="recommendation-list">
            {topRecommendedActions.map((action, index) => (
              <div className="recommendation" key={action}>
                <span className="pill">Priority {index + 1}</span>
                <strong>{action}</strong>
              </div>
            ))}
          </div>
        </section>
      </section>

      <MaturityRoadmap />
    </section>
  );
}

function BenchmarkComparison() {
  const filters = [
    ["Sector", benchmarkFilters.sector],
    ["Industry", benchmarkFilters.industry],
    ["Region", benchmarkFilters.region],
    ["Country", benchmarkFilters.country],
    ["Company size", benchmarkFilters.companySize],
    ["Standard", benchmarkFilters.standard],
    ["Maturity domain", benchmarkFilters.maturityDomain]
  ] as const;

  return (
    <section className="panel panel-wide">
      <div className="section-heading">
        <div>
          <h2>Benchmark Comparison</h2>
          <p className="muted">Compare client maturity against peer groups and top quartile performers.</p>
        </div>
      </div>

      <div className="benchmark-filter-grid">
        {filters.map(([label, value]) => (
          <label key={label}>
            {label}
            <select defaultValue={value}>
              <option>{value}</option>
              <option>All</option>
            </select>
          </label>
        ))}
      </div>

      <div className="benchmark-grid">
        <BenchmarkMetric label="Client maturity" value={benchmarkComparison.maturityScore} />
        <BenchmarkMetric label="Peer average" value={benchmarkComparison.peerAverage} />
        <BenchmarkMetric label="Top quartile" value={benchmarkComparison.topQuartile} />
        <BenchmarkMetric label="Gap to top quartile" value={benchmarkComparison.gapToBenchmark} tone="warning" />
      </div>

      <div className="benchmark-bars">
        <BenchmarkBar label="Client" value={benchmarkComparison.maturityScore} />
        <BenchmarkBar label="Peer average" value={benchmarkComparison.peerAverage} />
        <BenchmarkBar label="Top quartile" value={benchmarkComparison.topQuartile} />
      </div>

      <div className="recommendation-list">
        {benchmarkComparison.recommendedNextActions.map((action) => (
          <div className="recommendation" key={action}>
            <span className="pill">Next action</span>
            <strong>{action}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}

function BenchmarkMetric({ label, value, tone = "accent" }: { label: string; value: number; tone?: "accent" | "warning" }) {
  return (
    <section className="metric-card" data-tone={tone}>
      <div className="muted">{label}</div>
      <div className="metric-value">{value.toFixed(1)}</div>
      <div className="muted">Scale 0-3</div>
    </section>
  );
}

function BenchmarkBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="benchmark-bar">
      <span>{label}</span>
      <div className="progress-track">
        <span style={{ width: `${(value / 3) * 100}%` }} />
      </div>
      <strong>{value.toFixed(1)}</strong>
    </div>
  );
}

function StandardMaturityCard({ standard }: { standard: MaturityStandard }) {
  return (
    <article className="standard-card">
      <div className="section-heading compact">
        <div>
          <h3>{standard.name}</h3>
          <p className="muted">
            {standard.level} {standard.levelLabel}
          </p>
        </div>
        <div className="pie-chart" style={{ "--pie-value": `${(standard.overallScore / 3) * 100}%`, "--pie-color": standard.color } as CSSProperties}>
          <span>{standard.overallScore.toFixed(1)}</span>
        </div>
      </div>
      <div className="domain-bars">
        {standard.domains.map((domain) => (
          <div className="domain-bar" key={domain.name}>
            <div>
              <strong>{domain.name}</strong>
              <span className="muted">
                {domain.level} {maturityLevelLabels[domain.level]} • {domain.owner}
              </span>
            </div>
            <div className="progress-track">
              <span style={{ width: `${(domain.score / 3) * 100}%`, background: standard.color }} />
            </div>
            <strong>{domain.score.toFixed(1)}</strong>
          </div>
        ))}
      </div>
    </article>
  );
}

function MaturityRoadmap() {
  return (
    <section className="panel panel-wide" id="maturity-roadmap">
      <div className="section-heading">
        <div>
          <h2>Maturity Roadmap Map</h2>
          <p className="muted">Current State → Next Action → Evidence → Improved Maturity → Certification Readiness</p>
        </div>
      </div>

      <div className="roadmap-map">
        {roadmapItems.map((item) => (
          <article className="roadmap-item" key={`${item.standard}-${item.domain}`}>
            <div>
              <span className="pill">{item.standard}</span>
              <h3>{item.domain}</h3>
              <p className="muted">{item.aiRecommendation}</p>
            </div>
            <div className="roadmap-chain">
              <RoadmapNode label="Current State" value={item.currentLevel} />
              <RoadmapNode label="Next Action" value={item.requiredTasks.join("; ")} />
              <RoadmapNode label="Evidence" value={item.evidenceNeeded.join("; ")} />
              <RoadmapNode label="Improved Maturity" value={item.nextLevel} />
              <RoadmapNode label="Certification Readiness" value={`${item.owner} • ${item.dueDate}`} />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function RoadmapNode({ label, value }: { label: string; value: string }) {
  return (
    <div className="roadmap-node">
      <span className="muted">{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function buildRadarPoints(standards: MaturityStandard[]) {
  const fallback = "110,110 110,110 110,110 110,110 110,110";
  if (standards.length === 0) {
    return fallback;
  }

  const averages = [0, 1, 2, 3, 4].map((index) => {
    const values = standards.map((standard) => standard.domains[index % standard.domains.length]?.score || standard.overallScore);
    return values.reduce((sum, value) => sum + value, 0) / values.length;
  });

  const angles = [-90, -18, 54, 126, 198];
  return averages
    .map((score, index) => {
      const radius = (score / 3) * 88;
      const angle = (angles[index] * Math.PI) / 180;
      const x = 110 + radius * Math.cos(angle);
      const y = 110 + radius * Math.sin(angle);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}
