create table workforce_index_datasets (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  source_filename text,
  company_count integer not null default 0,
  methodology_version text not null default 'public-v1',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table workforce_index_categories (
  id uuid primary key default gen_random_uuid(),
  dataset_id uuid not null references workforce_index_datasets(id) on delete cascade,
  category_key text not null,
  label text not null,
  source_column text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (dataset_id, category_key)
);

create table workforce_index_companies (
  id uuid primary key default gen_random_uuid(),
  dataset_id uuid not null references workforce_index_datasets(id) on delete cascade,
  ticker text not null,
  company text not null,
  sector text not null,
  industry text not null,
  headquarters_location text,
  date_founded text,
  cik text,
  year_founded text,
  governance_score numeric(3,1) not null check (governance_score between 0 and 2),
  human_resources_score numeric(3,1) not null check (human_resources_score between 0 and 2),
  product_service_delivery_score numeric(3,1) not null check (product_service_delivery_score between 0 and 2),
  supplier_diversity_score numeric(3,1) not null check (supplier_diversity_score between 0 and 2),
  inclusion_score numeric(4,1) not null check (inclusion_score between 0 and 8),
  maturity_category text not null check (maturity_category in ('No Observable Maturity', 'Emerging', 'Developing', 'Leading')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (dataset_id, ticker)
);

create index workforce_index_companies_dataset_idx on workforce_index_companies(dataset_id);
create index workforce_index_companies_sector_idx on workforce_index_companies(sector, industry);
create index workforce_index_companies_company_idx on workforce_index_companies(company);
create index workforce_index_companies_score_idx on workforce_index_companies(inclusion_score desc);

create trigger workforce_index_datasets_set_updated_at
before update on workforce_index_datasets
for each row execute function set_updated_at();

create trigger workforce_index_companies_set_updated_at
before update on workforce_index_companies
for each row execute function set_updated_at();

alter table workforce_index_datasets enable row level security;
alter table workforce_index_categories enable row level security;
alter table workforce_index_companies enable row level security;

create policy "public can read published workforce index datasets"
on workforce_index_datasets for select
to anon, authenticated
using (published_at is not null);

create policy "authenticated users can manage workforce index datasets"
on workforce_index_datasets for all
to authenticated
using (true)
with check (true);

create policy "public can read workforce index categories"
on workforce_index_categories for select
to anon, authenticated
using (
  exists (
    select 1
    from workforce_index_datasets
    where workforce_index_datasets.id = workforce_index_categories.dataset_id
      and workforce_index_datasets.published_at is not null
  )
);

create policy "authenticated users can manage workforce index categories"
on workforce_index_categories for all
to authenticated
using (true)
with check (true);

create policy "public can read workforce index companies"
on workforce_index_companies for select
to anon, authenticated
using (
  exists (
    select 1
    from workforce_index_datasets
    where workforce_index_datasets.id = workforce_index_companies.dataset_id
      and workforce_index_datasets.published_at is not null
  )
);

create policy "authenticated users can manage workforce index companies"
on workforce_index_companies for all
to authenticated
using (true)
with check (true);

create trigger workforce_index_datasets_audit_log
after insert or update or delete on workforce_index_datasets
for each row execute function audit_sensitive_workflow_change();

create trigger workforce_index_categories_audit_log
after insert or update or delete on workforce_index_categories
for each row execute function audit_sensitive_workflow_change();

create trigger workforce_index_companies_audit_log
after insert or update or delete on workforce_index_companies
for each row execute function audit_sensitive_workflow_change();
