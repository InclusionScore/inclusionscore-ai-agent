export type MaturityLevel = 0 | 1 | 2 | 3;

export type MaturityStandard = {
  id: string;
  name: string;
  enabled: boolean;
  overallScore: number;
  level: MaturityLevel;
  levelLabel: string;
  color: string;
  domains: Array<{
    name: string;
    score: number;
    level: MaturityLevel;
    owner: string;
  }>;
};

export type BenchmarkFilter = {
  sector: string;
  industry: string;
  region: string;
  country: string;
  companySize: string;
  standard: string;
  maturityDomain: string;
};

export type BenchmarkComparison = {
  client: string;
  maturityScore: number;
  peerAverage: number;
  topQuartile: number;
  gapToBenchmark: number;
  recommendedNextActions: string[];
};

export type RoadmapItem = {
  standard: string;
  domain: string;
  currentLevel: string;
  nextLevel: string;
  requiredTasks: string[];
  evidenceNeeded: string[];
  owner: string;
  dueDate: string;
  aiRecommendation: string;
};

export type MaturityDashboardData = {
  benchmarkFilters: BenchmarkFilter;
  benchmarkComparison: BenchmarkComparison;
  maturityStandards: MaturityStandard[];
  roadmapItems: RoadmapItem[];
  topRecommendedActions: string[];
  source: "mock" | "supabase";
};

export const maturityLevelLabels: Record<MaturityLevel, string> = {
  0: "Ad Hoc",
  1: "Learning",
  2: "Under Control",
  3: "Measured"
};

export const benchmarkFilters: BenchmarkFilter = {
  sector: "Professional Services",
  industry: "Consulting and assurance",
  region: "North America",
  country: "Canada",
  companySize: "10,001+",
  standard: "ISO 30415",
  maturityDomain: "Governance"
};

export const benchmarkComparison = {
  client: "Deloitte Canada Demo",
  maturityScore: 2.1,
  peerAverage: 1.8,
  topQuartile: 2.7,
  gapToBenchmark: 0.6,
  recommendedNextActions: [
    "Approve workforce governance RACI and executive review cadence.",
    "Centralize evidence ownership for ISO 30415 and ISO 30201 controls.",
    "Move service request handling from regional practice to measured workflow."
  ]
};

export const maturityStandards: MaturityStandard[] = [
  {
    id: "iso-30415",
    name: "ISO 30415",
    enabled: true,
    overallScore: 2.2,
    level: 2,
    levelLabel: maturityLevelLabels[2],
    color: "#126b7f",
    domains: [
      { name: "Governance", score: 2.4, level: 2, owner: "Executive Sponsor" },
      { name: "Inclusive Culture", score: 2.0, level: 2, owner: "People & Purpose" },
      { name: "Competence", score: 1.7, level: 1, owner: "Learning Lead" },
      { name: "Procurement", score: 2.1, level: 2, owner: "Supplier Risk" }
    ]
  },
  {
    id: "iso-30414",
    name: "ISO 30414",
    enabled: true,
    overallScore: 1.9,
    level: 1,
    levelLabel: maturityLevelLabels[1],
    color: "#13795b",
    domains: [
      { name: "Workforce Availability", score: 2.0, level: 2, owner: "People Analytics" },
      { name: "Leadership", score: 1.8, level: 1, owner: "HR Strategy" },
      { name: "Skills", score: 1.6, level: 1, owner: "Talent" },
      { name: "Productivity", score: 2.1, level: 2, owner: "Operations" }
    ]
  },
  {
    id: "iso-37401",
    name: "ISO 37401",
    enabled: true,
    overallScore: 1.6,
    level: 1,
    levelLabel: maturityLevelLabels[1],
    color: "#a86500",
    domains: [
      { name: "Compliance Context", score: 1.5, level: 1, owner: "Ethics Office" },
      { name: "Obligations", score: 1.7, level: 1, owner: "Legal" },
      { name: "Controls", score: 1.4, level: 1, owner: "Risk" },
      { name: "Monitoring", score: 1.8, level: 1, owner: "Compliance" }
    ]
  },
  {
    id: "iso-30201",
    name: "ISO 30201",
    enabled: true,
    overallScore: 2.0,
    level: 2,
    levelLabel: maturityLevelLabels[2],
    color: "#6f4fb2",
    domains: [
      { name: "Process Ownership", score: 2.2, level: 2, owner: "Transformation Office" },
      { name: "Documented Information", score: 2.0, level: 2, owner: "Compliance Lead" },
      { name: "Management Review", score: 1.8, level: 1, owner: "Executive Sponsor" },
      { name: "Improvement", score: 2.0, level: 2, owner: "PMO" }
    ]
  }
];

export const roadmapItems: RoadmapItem[] = [
  {
    standard: "ISO 30415",
    domain: "Governance",
    currentLevel: "2 Under Control",
    nextLevel: "3 Measured",
    requiredTasks: ["Approve governance charter", "Schedule quarterly management review"],
    evidenceNeeded: ["Signed RACI", "Executive review minutes"],
    owner: "Executive Sponsor",
    dueDate: "Jul 15",
    aiRecommendation: "Move governance from documented accountability to measurable review cadence."
  },
  {
    standard: "ISO 30414",
    domain: "Skills",
    currentLevel: "1 Learning",
    nextLevel: "2 Under Control",
    requiredTasks: ["Refresh skills taxonomy", "Map training completion by region"],
    evidenceNeeded: ["Skills report", "LMS export"],
    owner: "Talent Lead",
    dueDate: "Jul 22",
    aiRecommendation: "Use skills evidence to connect workforce reporting to measurable capability risk."
  },
  {
    standard: "ISO 37401",
    domain: "Monitoring",
    currentLevel: "1 Learning",
    nextLevel: "2 Under Control",
    requiredTasks: ["Define compliance monitoring cadence", "Assign control reviewers"],
    evidenceNeeded: ["Monitoring plan", "Reviewer assignment log"],
    owner: "Compliance",
    dueDate: "Aug 02",
    aiRecommendation: "Create a compliance monitoring loop before certification readiness review."
  },
  {
    standard: "ISO 30201",
    domain: "Documented Information",
    currentLevel: "2 Under Control",
    nextLevel: "3 Measured",
    requiredTasks: ["Centralize evidence register", "Add freshness and sufficiency scoring"],
    evidenceNeeded: ["Evidence register", "Monthly sufficiency review"],
    owner: "Compliance Lead",
    dueDate: "Jul 29",
    aiRecommendation: "Treat evidence management as the backbone for multi-standard readiness."
  }
];

export const topRecommendedActions = [
  "Create a multi-standard evidence register for all active standards.",
  "Prioritize governance, skills, monitoring, and documented information gaps.",
  "Assign owners and due dates to every roadmap item.",
  "Use quarterly management review to prove controls are operating.",
  "Prepare an advisor review package for certification readiness."
];

export const mockedMaturityDashboard: MaturityDashboardData = {
  benchmarkFilters,
  benchmarkComparison,
  maturityStandards,
  roadmapItems,
  topRecommendedActions,
  source: "mock"
};
