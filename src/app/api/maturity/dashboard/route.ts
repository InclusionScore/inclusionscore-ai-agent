import { NextResponse } from "next/server";
import { mockedMaturityDashboard, maturityLevelLabels, type MaturityDashboardData, type MaturityLevel } from "@/lib/maturity/mock-data";
import { createSupabaseServerClient, isSupabaseServerConfigured } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type StandardRow = {
  id: string;
  code: string;
  name: string;
};

type ScoreRow = {
  score: number;
  maturity_level: MaturityLevel;
  maturity_label: string;
  owner_name: string | null;
  standards: StandardRow | StandardRow[] | null;
  standard_domains: {
    name: string;
  } | Array<{ name: string }> | null;
};

function firstNested<T>(value: T | T[] | null | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export async function GET() {
  try {
    if (!isSupabaseServerConfigured()) {
      return NextResponse.json(mockedMaturityDashboard);
    }

    const supabase = await createSupabaseServerClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(mockedMaturityDashboard);
    }

    const { data: organization } = await supabase
      .from("organizations")
      .select("id, tenant_id, name, industry, employee_count_band, headquarters_country")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!organization) {
      return NextResponse.json(mockedMaturityDashboard);
    }

    const { data: assessment } = await supabase
      .from("maturity_assessments")
      .select("id")
      .eq("organization_id", organization.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!assessment) {
      return NextResponse.json({
        ...mockedMaturityDashboard,
        benchmarkComparison: {
          ...mockedMaturityDashboard.benchmarkComparison,
          client: organization.name
        },
        source: "supabase"
      } satisfies MaturityDashboardData);
    }

    const [{ data: scores }, { data: benchmark }, { data: recommendations }, { data: roadmap }] = await Promise.all([
      supabase
        .from("maturity_scores")
        .select("score, maturity_level, maturity_label, owner_name, standards(id, code, name), standard_domains(name)")
        .eq("maturity_assessment_id", assessment.id),
      supabase
        .from("benchmark_results")
        .select("client_score, peer_average, top_quartile, gap_to_top_quartile, recommended_next_actions, benchmark_groups(sector, industry, region, country, company_size, maturity_domain, standards(name))")
        .eq("organization_id", organization.id)
        .limit(1)
        .maybeSingle(),
      supabase
        .from("recommendations")
        .select("title")
        .eq("maturity_assessment_id", assessment.id)
        .order("priority", { ascending: true })
        .limit(5),
      supabase
        .from("roadmap_items")
        .select("current_level, next_level, required_tasks, evidence_needed, owner_name, due_date, ai_recommendation, standards(name), standard_domains(name)")
        .eq("maturity_assessment_id", assessment.id)
        .order("due_date", { ascending: true })
    ]);

    const groupedScores = ((scores || []) as unknown as ScoreRow[]).reduce<Record<string, ScoreRow[]>>((groups, score) => {
      const standardName = firstNested(score.standards)?.name || "Unknown";
      groups[standardName] = groups[standardName] || [];
      groups[standardName].push(score);
      return groups;
    }, {});

    const maturityStandards = Object.entries(groupedScores).map(([standardName, standardScores]) => {
      const average = standardScores.reduce((sum, score) => sum + Number(score.score), 0) / standardScores.length;
      const level = Math.max(0, Math.min(3, Math.round(average))) as MaturityLevel;
      return {
        id: standardName.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        name: standardName,
        enabled: true,
        overallScore: Number(average.toFixed(1)),
        level,
        levelLabel: maturityLevelLabels[level],
        color: mockedMaturityDashboard.maturityStandards.find((standard) => standard.name === standardName)?.color || "#126b7f",
        domains: standardScores.map((score) => ({
          name: firstNested(score.standard_domains)?.name || "Domain",
          score: Number(score.score),
          level: score.maturity_level,
          owner: score.owner_name || "Unassigned"
        }))
      };
    });

    const benchmarkGroup = firstNested(
      benchmark?.benchmark_groups as
        | {
            sector?: string;
            industry?: string;
            region?: string;
            country?: string;
            company_size?: string;
            maturity_domain?: string;
            standards?: { name?: string } | Array<{ name?: string }> | null;
          }
        | Array<{
            sector?: string;
            industry?: string;
            region?: string;
            country?: string;
            company_size?: string;
            maturity_domain?: string;
            standards?: { name?: string } | Array<{ name?: string }> | null;
          }>
        | undefined
    );

    const data: MaturityDashboardData = {
      benchmarkFilters: {
        sector: benchmarkGroup?.sector || "All",
        industry: benchmarkGroup?.industry || organization.industry || "All",
        region: benchmarkGroup?.region || "All",
        country: benchmarkGroup?.country || organization.headquarters_country || "All",
        companySize: benchmarkGroup?.company_size || organization.employee_count_band || "All",
        standard: firstNested(benchmarkGroup?.standards)?.name || "All",
        maturityDomain: benchmarkGroup?.maturity_domain || "All"
      },
      benchmarkComparison: {
        client: organization.name,
        maturityScore: Number(benchmark?.client_score || mockedMaturityDashboard.benchmarkComparison.maturityScore),
        peerAverage: Number(benchmark?.peer_average || mockedMaturityDashboard.benchmarkComparison.peerAverage),
        topQuartile: Number(benchmark?.top_quartile || mockedMaturityDashboard.benchmarkComparison.topQuartile),
        gapToBenchmark: Number(benchmark?.gap_to_top_quartile || mockedMaturityDashboard.benchmarkComparison.gapToBenchmark),
        recommendedNextActions: benchmark?.recommended_next_actions || mockedMaturityDashboard.benchmarkComparison.recommendedNextActions
      },
      maturityStandards: maturityStandards.length ? maturityStandards : mockedMaturityDashboard.maturityStandards,
      roadmapItems: (roadmap || []).map((item) => ({
        standard: firstNested(item.standards as { name?: string } | Array<{ name?: string }> | null)?.name || "Standard",
        domain: firstNested(item.standard_domains as { name?: string } | Array<{ name?: string }> | null)?.name || "Domain",
        currentLevel: item.current_level,
        nextLevel: item.next_level,
        requiredTasks: item.required_tasks || [],
        evidenceNeeded: item.evidence_needed || [],
        owner: item.owner_name || "Unassigned",
        dueDate: item.due_date || "TBD",
        aiRecommendation: item.ai_recommendation || "Review with advisor."
      })),
      topRecommendedActions: (recommendations || []).map((recommendation) => recommendation.title),
      source: "supabase"
    };

    return NextResponse.json({
      ...data,
      roadmapItems: data.roadmapItems.length ? data.roadmapItems : mockedMaturityDashboard.roadmapItems,
      topRecommendedActions: data.topRecommendedActions.length ? data.topRecommendedActions : mockedMaturityDashboard.topRecommendedActions
    } satisfies MaturityDashboardData);
  } catch {
    return NextResponse.json(mockedMaturityDashboard);
  }
}
