"use client";

import { useState } from "react";
import { evidenceRecords, type EvidenceRecord } from "@/lib/mvp-data";

const statuses: EvidenceRecord["status"][] = ["Requested", "Submitted", "Needs review", "Accepted"];

export function EvidenceTable() {
  const [records, setRecords] = useState(evidenceRecords);

  function updateStatus(id: string, status: EvidenceRecord["status"]) {
    setRecords((current) => current.map((record) => (record.id === id ? { ...record, status } : record)));
  }

  return (
    <section className="panel panel-wide">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Evidence Table</p>
          <h2>Evidence requests and sufficiency</h2>
          <p className="muted">Track the proof needed to satisfy DISM, ISO readiness, and workforce risk indicators.</p>
        </div>
        <button className="secondary-action" type="button">
          Add evidence request
        </button>
      </div>

      <div className="data-table evidence-table">
        <div className="table-row table-head">
          <span>ID</span>
          <span>Evidence</span>
          <span>Mapped standards</span>
          <span>Owner</span>
          <span>Status</span>
          <span>Advisor notes</span>
        </div>
        {records.map((record) => (
          <div className="table-row" key={record.id}>
            <strong>{record.id}</strong>
            <span>{record.title}</span>
            <span>{record.mappedStandards.join(", ")}</span>
            <span>
              {record.owner}
              <br />
              <span className="muted">Due {record.due}</span>
            </span>
            <label className="compact-label">
              <span className="sr-only">Status</span>
              <select value={record.status} onChange={(event) => updateStatus(record.id, event.target.value as EvidenceRecord["status"])}>
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>
            <span className="muted">{record.advisorNotes}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
