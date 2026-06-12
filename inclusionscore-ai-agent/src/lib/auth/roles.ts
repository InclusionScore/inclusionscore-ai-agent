export const platformRoles = [
  "platform_super_admin",
  "tenant_admin",
  "client_admin",
  "client_contributor",
  "client_viewer",
  "advisor_admin",
  "advisor_consultant",
  "certification_reviewer",
  "insurance_broker",
  "mga_underwriter",
  "auditor",
  "executive_viewer"
] as const;

export type PlatformRole = (typeof platformRoles)[number];

export const rolePermissions: Record<PlatformRole, string[]> = {
  platform_super_admin: ["*"],
  tenant_admin: ["tenant.manage", "users.manage", "reports.read", "audit.read"],
  client_admin: ["assessment.write", "evidence.write", "tasks.manage", "reports.read"],
  client_contributor: ["assessment.write", "evidence.write", "tasks.write"],
  client_viewer: ["assessment.read", "evidence.read", "reports.read"],
  advisor_admin: ["portfolio.manage", "assessment.read", "evidence.review", "tasks.manage"],
  advisor_consultant: ["portfolio.read", "assessment.read", "evidence.review", "tasks.write"],
  certification_reviewer: ["certification.review", "evidence.review", "reports.read"],
  insurance_broker: ["insurance.submit", "insurance.read", "reports.read"],
  mga_underwriter: ["insurance.review", "insurance.read", "reports.read"],
  auditor: ["audit.read", "evidence.read", "reports.read"],
  executive_viewer: ["dashboard.read", "reports.read"]
};

export function hasPermission(role: PlatformRole, permission: string) {
  const permissions = rolePermissions[role];
  return permissions.includes("*") || permissions.includes(permission);
}

