import { sp500WorkforceIndexCompanies, type WorkforceIndexCompany } from "@/lib/workforce-index/sp500-index-data";

export type WorkforceIndexDomainKey = "governance" | "humanResources" | "productServiceDelivery" | "supplierDiversity";

export const workforceIndexDomains: Array<{
  key: WorkforceIndexDomainKey;
  label: string;
  shortLabel: string;
}> = [
  { key: "governance", label: "Governance", shortLabel: "Gov" },
  { key: "humanResources", label: "Human Resources", shortLabel: "HR" },
  { key: "productServiceDelivery", label: "Product / Service Delivery", shortLabel: "Product" },
  { key: "supplierDiversity", label: "Supplier Diversity", shortLabel: "Supplier" }
];

export const maturityCategories = ["All", "No Observable Maturity", "Emerging", "Developing", "Leading"] as const;

export function getWorkforceIndexCompanies() {
  return sp500WorkforceIndexCompanies;
}

export function average(values: number[]) {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function scoreForDomain(company: WorkforceIndexCompany, domain: WorkforceIndexDomainKey) {
  return company[domain];
}

export function overallAverage(companies: WorkforceIndexCompany[]) {
  return average(companies.map((company) => company.inclusionScore));
}

export function domainAverage(companies: WorkforceIndexCompany[], domain: WorkforceIndexDomainKey) {
  return average(companies.map((company) => scoreForDomain(company, domain)));
}

export function topQuartileScore(companies: WorkforceIndexCompany[]) {
  if (companies.length === 0) return 0;
  const sorted = companies.map((company) => company.inclusionScore).sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length * 0.75)] ?? sorted.at(-1) ?? 0;
}

export function uniqueSorted(values: string[]) {
  return [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b));
}

export function maturityCategoryForScore(score: number) {
  if (score >= 7) return "Leading";
  if (score >= 3) return "Developing";
  if (score >= 1) return "Emerging";
  return "No Observable Maturity";
}

export function workforceRiskScore(company: WorkforceIndexCompany) {
  return Math.round(100 - (company.inclusionScore / 8) * 100);
}

export function formatScore(value: number, decimals = 1) {
  return value.toFixed(decimals);
}
