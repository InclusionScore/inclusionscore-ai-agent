"use client";

import type { CSSProperties } from "react";
import { useMemo, useState } from "react";
import {
  domainAverage,
  formatScore,
  getWorkforceIndexCompanies,
  maturityCategories,
  overallAverage,
  topQuartileScore,
  uniqueSorted,
  workforceIndexDomains,
  workforceRiskScore,
  type WorkforceIndexDomainKey
} from "@/lib/workforce-index/analytics";
import type { WorkforceIndexCompany } from "@/lib/workforce-index/sp500-index-data";

type WorkforceRiskIndexDashboardProps = {
  mode: "public" | "benchmark";
  companies?: WorkforceIndexCompany[];
  source?: "supabase" | "local";
};

export function WorkforceRiskIndexDashboard({ companies, mode, source = "local" }: WorkforceRiskIndexDashboardProps) {
  const allCompanies = useMemo(() => (companies?.length ? companies : getWorkforceIndexCompanies()), [companies]);
  const [sector, setSector] = useState("All");
  const [industry, setIndustry] = useState("All");
  const [companyTicker, setCompanyTicker] = useState(allCompanies.find((company) => company.ticker === "AAPL")?.ticker || allCompanies[0]?.ticker || "");
  const [maturityCategory, setMaturityCategory] = useState("All");
  const [activeDomain, setActiveDomain] = useState<WorkforceIndexDomainKey | "overall">("overall");

  const sectors = useMemo(() => ["All", ...uniqueSorted(allCompanies.map((company) => company.sector))], [allCompanies]);
  const industries = useMemo(() => {
    const scopedCompanies = sector === "All" ? allCompanies : allCompanies.filter((company) => company.sector === sector);
    return ["All", ...uniqueSorted(scopedCompanies.map((company) => company.industry))];
  }, [allCompanies, sector]);

  const filteredCompanies = useMemo(() => {
    return allCompanies.filter((company) => {
      const sectorMatch = sector === "All" || company.sector === sector;
      const industryMatch = industry === "All" || company.industry === industry;
      const maturityMatch = maturityCategory === "All" || company.maturityCategory === maturityCategory;
      return sectorMatch && industryMatch && maturityMatch;
    });
  }, [allCompanies, industry, maturityCategory, sector]);

  const selectedCompany = useMemo(() => allCompanies.find((company) => company.ticker === companyTicker) || allCompanies[0], [allCompanies, companyTicker]);
  const sectorPeers = useMemo(() => allCompanies.filter((company) => company.sector === selectedCompany.sector), [allCompanies, selectedCompany]);
  const rankedCompanies = useMemo(() => [...filteredCompanies].sort((a, b) => b.inclusionScore - a.inclusionScore || a.company.localeCompare(b.company)), [filteredCompanies]);
  const distribution = useMemo(() => buildDistribution(filteredCompanies), [filteredCompanies]);
  const sectorBars = useMemo(() => buildSectorBars(filteredCompanies), [filteredCompanies]);
  const heatmap = useMemo(() => buildHeatmap(filteredCompanies), [filteredCompanies]);

  return (
    <section className="workforce-index-dashboard">
      <header className={mode === "public" ? "research-hero" : "page-header"}>
        <div>
          <p className="eyebrow">InclusionScore Workforce Risk Index</p>
          <h1>S&amp;P 500 ISO 30415 Index</h1>
          <p className="muted">
            Interactive benchmark dataset for Governance, Human Resources, Product / Service Delivery, and Supplier Diversity maturity across public
            companies.
          </p>
        </div>
        <div className="index-summary-card">
          <span className="muted">Public dataset v1</span>
          <strong>{allCompanies.length}</strong>
          <span>{source === "supabase" ? "companies from Supabase" : "deduplicated companies"}</span>
        </div>
      </header>

      <section className="panel panel-wide">
        <div className="section-heading">
          <div>
            <h2>Index Filters</h2>
            <p className="muted">Filter the public benchmark by sector, industry, company, and maturity category.</p>
          </div>
          <span className="status-chip">{filteredCompanies.length} companies in view</span>
        </div>
        <div className="index-filter-grid">
          <label>
            Sector
            <select
              value={sector}
              onChange={(event) => {
                setSector(event.target.value);
                setIndustry("All");
              }}
            >
              {sectors.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </label>
          <label>
            Industry
            <select value={industry} onChange={(event) => setIndustry(event.target.value)}>
              {industries.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </label>
          <label>
            Company
            <select value={companyTicker} onChange={(event) => setCompanyTicker(event.target.value)}>
              {allCompanies.map((company) => (
                <option key={company.ticker} value={company.ticker}>
                  {company.company}
                </option>
              ))}
            </select>
          </label>
          <label>
            Maturity category
            <select value={maturityCategory} onChange={(event) => setMaturityCategory(event.target.value)}>
              {maturityCategories.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </label>
          <label>
            Score lens
            <select value={activeDomain} onChange={(event) => setActiveDomain(event.target.value as WorkforceIndexDomainKey | "overall")}>
              <option value="overall">Overall InclusionScore</option>
              {workforceIndexDomains.map((domain) => (
                <option key={domain.key} value={domain.key}>
                  {domain.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className="index-kpi-grid">
        <IndexKpi label="S&P 500 average" value={formatScore(overallAverage(allCompanies))} note="0-8 total maturity" />
        <IndexKpi label="Filtered average" value={formatScore(overallAverage(filteredCompanies))} note="Current filter scope" />
        <IndexKpi label="Top quartile" value={formatScore(topQuartileScore(filteredCompanies))} note="Current filter scope" />
        <IndexKpi label="Leading companies" value={String(filteredCompanies.filter((company) => company.inclusionScore >= 7).length)} note="Score 7-8" />
      </section>

      <section className="dashboard-grid">
        <section className="panel">
          <div className="section-heading compact">
            <h2>Maturity Distribution</h2>
            <span className="pill">Pie</span>
          </div>
          <div className="pie-layout">
            <div className="index-pie" style={pieStyle(distribution)} aria-label="Maturity category pie chart" />
            <div className="legend-list">
              {distribution.map((slice) => (
                <div className="legend-item" key={slice.label}>
                  <span className="legend-swatch" style={{ background: slice.color }} />
                  <span>{slice.label}</span>
                  <strong>{slice.count}</strong>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="panel">
          <div className="section-heading compact">
            <h2>Sector Averages</h2>
            <span className="pill">Bar</span>
          </div>
          <div className="index-bar-list">
            {sectorBars.slice(0, 12).map((item) => (
              <div className="index-bar-row" key={item.sector}>
                <span>{item.sector}</span>
                <div className="index-bar-track">
                  <span style={{ width: `${(item.average / 8) * 100}%` }} />
                </div>
                <strong>{formatScore(item.average)}</strong>
              </div>
            ))}
          </div>
        </section>
      </section>

      <section className="panel panel-wide">
        <div className="section-heading">
          <div>
            <h2>Domain Heatmap</h2>
            <p className="muted">Average maturity by sector and ISO 30415-style category.</p>
          </div>
        </div>
        <div className="index-heatmap" role="table" aria-label="Sector maturity heatmap">
          <div className="heatmap-header">Sector</div>
          {workforceIndexDomains.map((domain) => (
            <div className="heatmap-header" key={domain.key}>
              {domain.shortLabel}
            </div>
          ))}
          {heatmap.map((row) => (
            <HeatmapRow key={row.sector} row={row} />
          ))}
        </div>
      </section>

      <section className="dashboard-grid">
        <CompanyComparison company={selectedCompany} sectorPeers={sectorPeers} activeDomain={activeDomain} marketCompanies={allCompanies} />
        <section className="panel">
          <div className="section-heading compact">
            <h2>Core Categories</h2>
            <span className="pill">ISO 30415 lens</span>
          </div>
          <div className="domain-card-grid">
            {workforceIndexDomains.map((domain) => (
              <div className="domain-mini-card" key={domain.key}>
                <span className="muted">{domain.label}</span>
                <strong>{formatScore(domainAverage(filteredCompanies, domain.key))}</strong>
                <span>Filtered average, 0-2 scale</span>
              </div>
            ))}
          </div>
        </section>
      </section>

      <section className="panel panel-wide">
        <div className="section-heading">
          <div>
            <h2>Company Rankings</h2>
            <p className="muted">Sorted by InclusionScore, with workforce risk score shown as the inverse maturity signal.</p>
          </div>
        </div>
        <div className="index-table-wrap">
          <table className="index-rankings-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Company</th>
                <th>Sector</th>
                <th>Industry</th>
                <th>Gov</th>
                <th>HR</th>
                <th>Product</th>
                <th>Supplier</th>
                <th>Score</th>
                <th>Risk</th>
              </tr>
            </thead>
            <tbody>
              {rankedCompanies.slice(0, 100).map((company, index) => (
                <tr key={company.ticker}>
                  <td>{index + 1}</td>
                  <td>
                    <strong>{company.company}</strong>
                    <span className="muted">{company.ticker}</span>
                  </td>
                  <td>{company.sector}</td>
                  <td>{company.industry}</td>
                  <td>{company.governance}</td>
                  <td>{company.humanResources}</td>
                  <td>{company.productServiceDelivery}</td>
                  <td>{company.supplierDiversity}</td>
                  <td>{company.inclusionScore}</td>
                  <td>{workforceRiskScore(company)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
}

function IndexKpi({ label, note, value }: { label: string; note: string; value: string }) {
  return (
    <div className="metric-card">
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{note}</small>
    </div>
  );
}

function CompanyComparison({
  activeDomain,
  company,
  marketCompanies,
  sectorPeers
}: {
  activeDomain: WorkforceIndexDomainKey | "overall";
  company: WorkforceIndexCompany;
  marketCompanies: WorkforceIndexCompany[];
  sectorPeers: WorkforceIndexCompany[];
}) {
  const companyScore = activeDomain === "overall" ? company.inclusionScore : company[activeDomain];
  const sectorAverage = activeDomain === "overall" ? overallAverage(sectorPeers) : domainAverage(sectorPeers, activeDomain);
  const marketAverage = activeDomain === "overall" ? overallAverage(marketCompanies) : domainAverage(marketCompanies, activeDomain);
  const denominator = activeDomain === "overall" ? 8 : 2;

  return (
    <section className="panel">
      <div className="section-heading compact">
        <h2>Company Benchmark</h2>
        <span className="status-chip">{company.ticker}</span>
      </div>
      <div className="company-benchmark-card">
        <div>
          <span className="muted">Selected company</span>
          <strong>{company.company}</strong>
          <span>{company.sector}</span>
        </div>
        <BenchmarkLine label="Company" value={companyScore} denominator={denominator} />
        <BenchmarkLine label="Sector average" value={sectorAverage} denominator={denominator} />
        <BenchmarkLine label="S&P 500 average" value={marketAverage} denominator={denominator} />
      </div>
    </section>
  );
}

function BenchmarkLine({ denominator, label, value }: { denominator: number; label: string; value: number }) {
  return (
    <div className="benchmark-line">
      <span>{label}</span>
      <div className="index-bar-track">
        <span style={{ width: `${Math.min(100, (value / denominator) * 100)}%` }} />
      </div>
      <strong>{formatScore(value)}</strong>
    </div>
  );
}

type DistributionSlice = {
  label: string;
  count: number;
  color: string;
};

function buildDistribution(companies: WorkforceIndexCompany[]) {
  const colors: Record<string, string> = {
    "No Observable Maturity": "#ef4444",
    Emerging: "#f59e0b",
    Developing: "#0ea5e9",
    Leading: "#0f766e"
  };

  return ["No Observable Maturity", "Emerging", "Developing", "Leading"].map((label) => ({
    label,
    count: companies.filter((company) => company.maturityCategory === label).length,
    color: colors[label]
  }));
}

function pieStyle(distribution: DistributionSlice[]): CSSProperties {
  const total = Math.max(
    1,
    distribution.reduce((sum, slice) => sum + slice.count, 0)
  );
  let cursor = 0;
  const stops = distribution.map((slice) => {
    const start = cursor;
    const end = cursor + (slice.count / total) * 100;
    cursor = end;
    return `${slice.color} ${start}% ${end}%`;
  });

  return { background: `conic-gradient(${stops.join(", ")})` };
}

function buildSectorBars(companies: WorkforceIndexCompany[]) {
  return uniqueSorted(companies.map((company) => company.sector))
    .map((sector) => {
      const sectorCompanies = companies.filter((company) => company.sector === sector);
      return {
        sector,
        average: overallAverage(sectorCompanies)
      };
    })
    .sort((a, b) => b.average - a.average);
}

function buildHeatmap(companies: WorkforceIndexCompany[]) {
  return uniqueSorted(companies.map((company) => company.sector)).map((sector) => {
    const sectorCompanies = companies.filter((company) => company.sector === sector);
    return {
      sector,
      values: workforceIndexDomains.map((domain) => ({
        domain: domain.key,
        value: domainAverage(sectorCompanies, domain.key)
      }))
    };
  });
}

function HeatmapRow({ row }: { row: ReturnType<typeof buildHeatmap>[number] }) {
  return (
    <>
      <div className="heatmap-sector">{row.sector}</div>
      {row.values.map((cell) => (
        <div
          className="heatmap-cell"
          key={cell.domain}
          style={{ "--heat": cell.value / 2 } as CSSProperties}
          title={`${row.sector}: ${formatScore(cell.value)} / 2`}
        >
          {formatScore(cell.value)}
        </div>
      ))}
    </>
  );
}
