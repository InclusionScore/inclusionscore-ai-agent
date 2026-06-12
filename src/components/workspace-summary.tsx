import { workspaceProfile } from "@/lib/mvp-data";

export function WorkspaceSummary() {
  const profileRows = [
    ["Company type", workspaceProfile.companyType],
    ["Industry", workspaceProfile.industry],
    ["Employee band", workspaceProfile.employeeBand],
    ["Audit standard", workspaceProfile.auditStandard],
    ["Advisor", workspaceProfile.advisor],
    ["Stage", workspaceProfile.stage]
  ] as const;

  return (
    <section className="panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Organization Workspace</p>
          <h2>{workspaceProfile.organization}</h2>
          <p className="muted">Single client workspace for the DISM audit, evidence review, advisor decisions, and reporting.</p>
        </div>
        <span className="status-chip">{workspaceProfile.stage}</span>
      </div>
      <div className="profile-grid">
        {profileRows.map(([label, value]) => (
          <div className="profile-cell" key={label}>
            <span className="muted">{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}
