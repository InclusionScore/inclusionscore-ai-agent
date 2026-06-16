export const acmeWorkforceDemo = {
  organizationName: "Acme Workforce Demo",
  industry: "UK financial services and operations",
  employeeCountBand: "1,001-5,000",
  headquartersCountry: "GB",
  presenterContext:
    "Acme Workforce Demo is a UK-based workforce risk sample client preparing for DISM maturity review, ISO 30415 readiness, and ISO 30201-style management system evidence review.",
  answers: {
    "governance-accountability":
      "Partially. The executive sponsor owns inclusion governance, but the accountability model is split across HR, Legal, and regional operations. We have a draft governance charter and a DEI council deck, but no approved RACI or recurring management review record.",
    "workforce-service-requests":
      "No single workflow exists today. Accommodation requests and employee relations issues are handled in separate tools, and escalation depends on the region. We need one documented intake, escalation, closure, and evidence process.",
    "training-competence":
      "Partially. Manager training exists and completion is tracked in the LMS, but the export is stale and we cannot yet show completion by business unit or location for the latest review cycle.",
    "pay-benefits":
      "Not consistently. Legal and People Analytics run periodic pay equity analysis, but the cadence is not documented as a control and corrective actions are not linked to a workforce governance action tracker.",
    "evidence-management":
      "Evidence is spread across SharePoint, HR systems, and advisor notes. We do not have a single evidence register showing owner, freshness, mapped standard, sufficiency, and review status.",
    "risk-reporting":
      "Leadership receives quarterly workforce updates, but risk indicators are mostly narrative. We need a board-ready dashboard covering maturity, evidence blockers, service request exposure, and implementation tasks."
  }
} as const;
