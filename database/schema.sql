-- Dominion Home Deals — Google Ads Operator System Schema
-- Supabase / Postgres

-- ============================================================
-- ENUMS
-- ============================================================

create type market as enum ('spokane', 'kootenai');

create type seller_situation as enum (
  'inherited',
  'probate',
  'tired_landlord',
  'tenant_issues',
  'major_repairs',
  'foundation_mold_damage',
  'divorce',
  'foreclosure',
  'relocation',
  'vacant_property',
  'low_intent',
  'unknown'
);

create type risk_level as enum ('green', 'yellow', 'red');

create type recommendation_status as enum (
  'pending',
  'approved',
  'testing',
  'ignored',
  'implemented',
  'expired'
);

create type deal_stage as enum (
  'lead',
  'qualified',
  'appointment',
  'offer',
  'contract',
  'closed',
  'lost'
);

create type approval_decision as enum ('approved', 'rejected', 'deferred');

-- ============================================================
-- GOOGLE ADS DATA
-- ============================================================

create table campaigns (
  id bigint primary key generated always as identity,
  google_campaign_id text not null unique,
  name text not null,
  market market not null,
  status text not null default 'unknown',
  campaign_type text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table ad_groups (
  id bigint primary key generated always as identity,
  google_ad_group_id text not null unique,
  campaign_id bigint not null references campaigns(id),
  name text not null,
  status text not null default 'unknown',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table keywords (
  id bigint primary key generated always as identity,
  google_keyword_id text not null unique,
  ad_group_id bigint not null references ad_groups(id),
  text text not null,
  match_type text not null,
  status text not null default 'unknown',
  seller_situation seller_situation,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table search_terms (
  id bigint primary key generated always as identity,
  search_term text not null,
  campaign_id bigint references campaigns(id),
  ad_group_id bigint references ad_groups(id),
  keyword_id bigint references keywords(id),
  market market,
  seller_situation seller_situation,
  intent_label text,
  impressions integer not null default 0,
  clicks integer not null default 0,
  cost_micros bigint not null default 0,
  conversions numeric(10, 2) not null default 0,
  conversion_value_micros bigint not null default 0,
  is_waste boolean default false,
  is_opportunity boolean default false,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  unique(search_term, campaign_id, ad_group_id)
);

create table daily_metrics (
  id bigint primary key generated always as identity,
  report_date date not null,
  campaign_id bigint references campaigns(id),
  ad_group_id bigint references ad_groups(id),
  keyword_id bigint references keywords(id),
  market market,
  impressions integer not null default 0,
  clicks integer not null default 0,
  cost_micros bigint not null default 0,
  conversions numeric(10, 2) not null default 0,
  conversion_value_micros bigint not null default 0,
  created_at timestamptz not null default now(),
  unique(report_date, campaign_id, ad_group_id, keyword_id)
);

-- ============================================================
-- LEADS AND ATTRIBUTION
-- ============================================================

create table leads (
  id bigint primary key generated always as identity,
  external_id text unique,
  first_name text,
  last_name text,
  phone text,
  email text,
  property_address text,
  property_city text,
  property_state text,
  property_zip text,
  market market,
  seller_situation seller_situation default 'unknown',
  motivation_score integer,
  urgency_score integer,
  lead_score integer,
  deal_probability numeric(5, 4),
  stage deal_stage not null default 'lead',
  source text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table lead_attribution (
  id bigint primary key generated always as identity,
  lead_id bigint not null references leads(id),
  gclid text,
  campaign_id bigint references campaigns(id),
  ad_group_id bigint references ad_groups(id),
  keyword_id bigint references keywords(id),
  search_term_id bigint references search_terms(id),
  landing_page text,
  landing_domain text,
  source_channel text not null default 'google_ads',
  market market,
  created_at timestamptz not null default now()
);

-- ============================================================
-- DEALS
-- ============================================================

create table deals (
  id bigint primary key generated always as identity,
  lead_id bigint not null references leads(id),
  market market not null,
  stage deal_stage not null default 'lead',
  property_address text,
  offer_amount_cents bigint,
  contract_amount_cents bigint,
  assignment_fee_cents bigint,
  revenue_cents bigint,
  closed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table deal_stage_history (
  id bigint primary key generated always as identity,
  deal_id bigint not null references deals(id),
  from_stage deal_stage,
  to_stage deal_stage not null,
  changed_by text,
  notes text,
  changed_at timestamptz not null default now()
);

-- ============================================================
-- RECOMMENDATIONS
-- ============================================================

create table recommendations (
  id bigint primary key generated always as identity,
  recommendation_type text not null,
  reason text not null,
  expected_impact text,
  risk_level risk_level not null,
  approval_required boolean not null default true,
  status recommendation_status not null default 'pending',
  market market,
  seller_situation seller_situation,
  related_campaign_id bigint references campaigns(id),
  related_ad_group_id bigint references ad_groups(id),
  related_keyword_id bigint references keywords(id),
  related_search_term_id bigint references search_terms(id),
  related_lead_id bigint references leads(id),
  metadata jsonb default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- APPROVALS AND AUDIT
-- ============================================================

create table approvals (
  id bigint primary key generated always as identity,
  recommendation_id bigint not null references recommendations(id),
  decision approval_decision not null,
  decided_by text not null,
  reason text,
  decided_at timestamptz not null default now()
);

create table implementation_logs (
  id bigint primary key generated always as identity,
  recommendation_id bigint references recommendations(id),
  approval_id bigint references approvals(id),
  action_taken text not null,
  result text,
  implemented_by text not null,
  implemented_at timestamptz not null default now(),
  notes text
);

-- ============================================================
-- SYNC TRACKING
-- ============================================================

create table sync_logs (
  id bigint primary key generated always as identity,
  sync_type text not null,
  status text not null,
  records_fetched integer default 0,
  records_upserted integer default 0,
  date_range_start date,
  date_range_end date,
  error_message text,
  duration_ms integer,
  started_at timestamptz not null default now(),
  completed_at timestamptz
);

-- ============================================================
-- LANDING PAGES (schema-ready for Phase 6)
-- ============================================================

create table landing_page_variants (
  id bigint primary key generated always as identity,
  url text not null,
  domain text not null,
  market market,
  variant_name text,
  is_active boolean not null default true,
  form_conversions integer not null default 0,
  call_conversions integer not null default 0,
  qualified_lead_rate numeric(5, 4),
  contract_rate numeric(5, 4),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- INDEXES
-- ============================================================

create index idx_campaigns_market on campaigns(market);
create index idx_search_terms_market on search_terms(market);
create index idx_search_terms_waste on search_terms(is_waste) where is_waste = true;
create index idx_search_terms_opportunity on search_terms(is_opportunity) where is_opportunity = true;
create index idx_daily_metrics_date on daily_metrics(report_date);
create index idx_daily_metrics_campaign on daily_metrics(campaign_id);
create index idx_leads_market on leads(market);
create index idx_leads_stage on leads(stage);
create index idx_leads_seller_situation on leads(seller_situation);
create index idx_lead_attribution_gclid on lead_attribution(gclid) where gclid is not null;
create index idx_deals_market on deals(market);
create index idx_deals_stage on deals(stage);
create index idx_recommendations_status on recommendations(status);
create index idx_recommendations_risk on recommendations(risk_level);
create index idx_recommendations_market on recommendations(market);
create index idx_sync_logs_type on sync_logs(sync_type);
