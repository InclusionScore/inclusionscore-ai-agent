import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient, createSupabaseServiceRoleClient, isSupabaseServiceRoleConfigured } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 48);
}

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ organizations: [] });
    }

    const { data, error } = await supabase
      .from("organizations")
      .select("id, tenant_id, name, slug, industry, employee_count_band, headquarters_country, status")
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({ organizations: data || [] });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not load organizations." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!isSupabaseServiceRoleConfigured()) {
      return NextResponse.json({ error: "Supabase service role is required to bootstrap an organization." }, { status: 500 });
    }

    const supabase = await createSupabaseServerClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Sign in before creating an organization." }, { status: 401 });
    }

    const body = (await request.json()) as {
      name?: string;
      industry?: string;
      employeeCountBand?: string;
      headquartersCountry?: string;
    };
    const name = body.name?.trim();

    if (!name) {
      return NextResponse.json({ error: "Organization name is required." }, { status: 400 });
    }

    const serviceRole = createSupabaseServiceRoleClient();
    const slug = `${slugify(name)}-${user.id.slice(0, 8)}`;

    const { data: tenant, error: tenantError } = await serviceRole
      .from("tenants")
      .insert({
        name,
        kind: "client",
        slug
      })
      .select("id")
      .single();

    if (tenantError) {
      throw new Error(`Could not create tenant: ${tenantError.message}`);
    }

    const { data: organization, error: organizationError } = await serviceRole
      .from("organizations")
      .insert({
        tenant_id: tenant.id,
        name,
        slug,
        industry: body.industry || null,
        employee_count_band: body.employeeCountBand || null,
        headquarters_country: body.headquartersCountry || null
      })
      .select("id, tenant_id, name, slug, industry, employee_count_band, headquarters_country, status")
      .single();

    if (organizationError) {
      throw new Error(`Could not create organization: ${organizationError.message}`);
    }

    const { error: membershipError } = await serviceRole.from("memberships").insert({
      tenant_id: tenant.id,
      organization_id: organization.id,
      user_id: user.id,
      role: "client_admin"
    });

    if (membershipError) {
      throw new Error(`Could not create membership: ${membershipError.message}`);
    }

    await serviceRole.from("profiles").upsert({
      id: user.id,
      tenant_id: tenant.id,
      organization_id: organization.id,
      email: user.email,
      default_role: "client_admin"
    });

    await serviceRole.from("audit_logs").insert({
      tenant_id: tenant.id,
      organization_id: organization.id,
      actor_user_id: user.id,
      action: "organization.bootstrap",
      resource_type: "organization",
      resource_id: organization.id,
      summary: "Client organization bootstrapped for Workforce Risk / DISM diagnostic.",
      metadata: { source: "mvp_demo_flow" }
    });

    return NextResponse.json({ organization });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not create organization." }, { status: 500 });
  }
}
