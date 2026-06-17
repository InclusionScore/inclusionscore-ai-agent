import { createClient } from "@supabase/supabase-js";
import type { WorkforceIndexCompany } from "@/lib/workforce-index/sp500-index-data";

type WorkforceIndexCompanyRow = {
  ticker: string;
  company: string;
  sector: string;
  industry: string;
  headquarters_location: string | null;
  date_founded: string | null;
  cik: string | null;
  year_founded: string | null;
  governance_score: number | string;
  human_resources_score: number | string;
  product_service_delivery_score: number | string;
  supplier_diversity_score: number | string;
  inclusion_score: number | string;
  maturity_category: WorkforceIndexCompany["maturityCategory"];
};

export type WorkforceIndexLoadResult = {
  companies: WorkforceIndexCompany[];
  source: "supabase" | "local";
};

function toNumber(value: number | string) {
  return typeof value === "number" ? value : Number(value);
}

function mapCompany(row: WorkforceIndexCompanyRow): WorkforceIndexCompany {
  return {
    ticker: row.ticker,
    company: row.company,
    sector: row.sector,
    industry: row.industry,
    headquartersLocation: row.headquarters_location || "",
    dateFounded: row.date_founded || "",
    cik: row.cik || "",
    yearFounded: row.year_founded || "",
    governance: toNumber(row.governance_score),
    humanResources: toNumber(row.human_resources_score),
    productServiceDelivery: toNumber(row.product_service_delivery_score),
    supplierDiversity: toNumber(row.supplier_diversity_score),
    inclusionScore: toNumber(row.inclusion_score),
    maturityCategory: row.maturity_category
  };
}

export async function loadPublishedWorkforceIndexCompanies(): Promise<WorkforceIndexLoadResult> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return { companies: [], source: "local" };
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  const { data, error } = await supabase
    .from("workforce_index_companies")
    .select(
      "ticker, company, sector, industry, headquarters_location, date_founded, cik, year_founded, governance_score, human_resources_score, product_service_delivery_score, supplier_diversity_score, inclusion_score, maturity_category, workforce_index_datasets!inner(published_at)"
    )
    .not("workforce_index_datasets.published_at", "is", null)
    .order("company", { ascending: true });

  if (error || !data?.length) {
    return { companies: [], source: "local" };
  }

  return {
    companies: (data as unknown as WorkforceIndexCompanyRow[]).map(mapCompany),
    source: "supabase"
  };
}
