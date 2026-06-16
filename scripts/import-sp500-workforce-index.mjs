import fs from "node:fs";

const sourcePath = process.argv[2];

if (!sourcePath) {
  console.error("Usage: node scripts/import-sp500-workforce-index.mjs <csv-path>");
  process.exit(1);
}

const maturityCategories = [
  { key: "governance", label: "Governance", sourceColumn: "Gov IMMI" },
  { key: "humanResources", label: "Human Resources", sourceColumn: "HR IMMI" },
  { key: "productServiceDelivery", label: "Product / Service Delivery", sourceColumn: "Prod IMMI" },
  { key: "supplierDiversity", label: "Supplier Diversity", sourceColumn: "SD IMMI" }
];

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (char === '"' && inQuotes && next === '"') {
      cell += '"';
      index += 1;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      row.push(cell);
      cell = "";
    } else if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") {
        index += 1;
      }
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }

  if (cell.length > 0 || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }

  const [headers, ...dataRows] = rows.filter((candidate) => candidate.some((value) => value.trim().length > 0));
  return dataRows.map((dataRow) =>
    Object.fromEntries(headers.map((header, index) => [header.trim(), dataRow[index] === undefined ? "" : dataRow[index].trim()]))
  );
}

function normalizeNumber(value) {
  if (value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function scoreBand(score) {
  if (score >= 7) return "Leading";
  if (score >= 3) return "Developing";
  if (score >= 1) return "Emerging";
  return "No Observable Maturity";
}

function scoreRows(records) {
  const usableRows = records
    .filter((record) => record.Ticker && record.Company && record.Sector)
    .map((record) => {
      const governance = normalizeNumber(record["Gov IMMI"]) ?? 0;
      const humanResources = normalizeNumber(record["HR IMMI"]) ?? 0;
      const productServiceDelivery = normalizeNumber(record["Prod IMMI"]) ?? 0;
      const supplierDiversity = normalizeNumber(record["SD IMMI"]) ?? 0;
      const inclusionScore = normalizeNumber(record.InclusionScore) ?? governance + humanResources + productServiceDelivery + supplierDiversity;

      return {
        ticker: record.Ticker,
        company: record.Company,
        sector: record.Sector === "software and services" ? "Information Technology" : record.Sector === "Telecommunications" ? "Communication Services" : record.Sector,
        industry: record.Industry,
        headquartersLocation: record["Headquarters Location"],
        dateFounded: record["Date Founded"],
        cik: record["CIK (Central Index Key)"],
        yearFounded: record["Year Founded"],
        governance,
        humanResources,
        productServiceDelivery,
        supplierDiversity,
        inclusionScore,
        maturityCategory: scoreBand(inclusionScore)
      };
    });

  const bestByTicker = new Map();

  for (const row of usableRows) {
    const existing = bestByTicker.get(row.ticker);
    if (!existing || row.inclusionScore > existing.inclusionScore) {
      bestByTicker.set(row.ticker, row);
    }
  }

  return [...bestByTicker.values()].sort((a, b) => a.company.localeCompare(b.company));
}

function sqlString(value) {
  if (value === null || value === undefined || value === "") return "null";
  return `'${String(value).replaceAll("'", "''")}'`;
}

function sqlNumber(value) {
  return value === null || value === undefined || value === "" ? "null" : String(value);
}

function buildTypeScript(rows) {
  return `export const workforceIndexMaturityCategories = ${JSON.stringify(maturityCategories, null, 2)} as const;

export type WorkforceIndexCompany = {
  ticker: string;
  company: string;
  sector: string;
  industry: string;
  headquartersLocation: string;
  dateFounded: string;
  cik: string;
  yearFounded: string;
  governance: number;
  humanResources: number;
  productServiceDelivery: number;
  supplierDiversity: number;
  inclusionScore: number;
  maturityCategory: "No Observable Maturity" | "Emerging" | "Developing" | "Leading";
};

export const sp500WorkforceIndexCompanies = ${JSON.stringify(rows, null, 2)} satisfies WorkforceIndexCompany[];
`;
}

function buildSeedSql(rows) {
  const datasetId = "b0000000-0000-4000-8000-000000000001";
  const statements = [
    `insert into workforce_index_datasets (id, slug, name, description, source_filename, company_count, methodology_version, published_at)
values (
  '${datasetId}',
  'sp500-iso-30415-v1',
  'S&P 500 ISO 30415 Workforce Risk Index',
  'First public S&P 500 InclusionScore Workforce Risk Index dataset generated from ISO 30415 maturity indicators.',
  'Merged_SP500_DEI_Index.xlsx - Index.csv',
  ${rows.length},
  'public-v1',
  now()
)
on conflict (slug) do update set
  company_count = excluded.company_count,
  updated_at = now();`
  ];

  for (const category of maturityCategories) {
    statements.push(`insert into workforce_index_categories (dataset_id, category_key, label, source_column, sort_order)
values ('${datasetId}', '${category.key}', ${sqlString(category.label)}, ${sqlString(category.sourceColumn)}, ${
      maturityCategories.findIndex((candidate) => candidate.key === category.key) + 1
    })
on conflict (dataset_id, category_key) do update set
  label = excluded.label,
  source_column = excluded.source_column,
  sort_order = excluded.sort_order;`);
  }

  for (const row of rows) {
    statements.push(`insert into workforce_index_companies (
  dataset_id,
  ticker,
  company,
  sector,
  industry,
  headquarters_location,
  date_founded,
  cik,
  year_founded,
  governance_score,
  human_resources_score,
  product_service_delivery_score,
  supplier_diversity_score,
  inclusion_score,
  maturity_category
) values (
  '${datasetId}',
  ${sqlString(row.ticker)},
  ${sqlString(row.company)},
  ${sqlString(row.sector)},
  ${sqlString(row.industry)},
  ${sqlString(row.headquartersLocation)},
  ${sqlString(row.dateFounded)},
  ${sqlString(row.cik)},
  ${sqlString(row.yearFounded)},
  ${sqlNumber(row.governance)},
  ${sqlNumber(row.humanResources)},
  ${sqlNumber(row.productServiceDelivery)},
  ${sqlNumber(row.supplierDiversity)},
  ${sqlNumber(row.inclusionScore)},
  ${sqlString(row.maturityCategory)}
)
on conflict (dataset_id, ticker) do update set
  company = excluded.company,
  sector = excluded.sector,
  industry = excluded.industry,
  headquarters_location = excluded.headquarters_location,
  date_founded = excluded.date_founded,
  cik = excluded.cik,
  year_founded = excluded.year_founded,
  governance_score = excluded.governance_score,
  human_resources_score = excluded.human_resources_score,
  product_service_delivery_score = excluded.product_service_delivery_score,
  supplier_diversity_score = excluded.supplier_diversity_score,
  inclusion_score = excluded.inclusion_score,
  maturity_category = excluded.maturity_category,
  updated_at = now();`);
  }

  return `${statements.join("\n\n")}\n`;
}

const csvText = fs.readFileSync(sourcePath, "utf8");
const rows = scoreRows(parseCsv(csvText));

fs.mkdirSync("src/lib/workforce-index", { recursive: true });
fs.writeFileSync("src/lib/workforce-index/sp500-index-data.ts", buildTypeScript(rows));
fs.writeFileSync("supabase/seed_sp500_workforce_index.sql", buildSeedSql(rows));

console.log(`Imported ${rows.length} S&P 500 Workforce Risk Index companies.`);
console.log("Wrote src/lib/workforce-index/sp500-index-data.ts");
console.log("Wrote supabase/seed_sp500_workforce_index.sql");
