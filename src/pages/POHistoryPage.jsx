// src/pages/POHistoryPage.jsx
import { useState, useEffect } from "react";
import api from "../api/api";
import {
  Loader, Modal, StatusBadge, EmptyState,
  toast, formatDate, formatCurrency,
} from "../components/UI";
import POPreview from "../components/PoPreview";
import Icon from "../components/Icons";
import T from "../styles/tokens";

export default function POHistoryPage() {
  const [results, setResults] = useState([]);
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(false);
  const [previewPO, setPreviewPO] = useState(null);

  const [params, setParams] = useState({
    q: "", status: "", date_from: "", date_to: "",
    vendor: "", currency: "", amount_min: "", amount_max: "",
    ordering: "-created_at",
  });

  const p = (field, val) => setParams((prev) => ({ ...prev, [field]: val }));

  const search = async (overrides = {}) => {
    setLoading(true);
    try {
      const merged = { ...params, ...overrides };
      const clean  = Object.fromEntries(
        Object.entries(merged).filter(([, v]) => v !== "")
      );
      const data = await api.poHistory(clean);
      setResults(data.results || data);
      setStats(data.stats || null);
    } catch (e) {
      toast("Search failed: " + (e?.detail || "Unknown error"), "error");
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => { search(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const clearFilters = () => {
    const reset = {
      q: "", status: "", date_from: "", date_to: "",
      vendor: "", currency: "", amount_min: "", amount_max: "",
      ordering: "-created_at",
    };
    setParams(reset);
    search(reset);
  };

  return (
    <div>
      <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.4rem", fontWeight: 800, marginBottom: 20 }}>
        PO History &amp; Search
      </h2>

      {/* ── Search card ── */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header">
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 700 }}>Search Filters</span>
        </div>
        <div className="card-body">

          {/* Row 1 – free text + status */}
          <div className="grid-2" style={{ marginBottom: 14 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Search</label>
              <div className="search-bar">
                <input
                  value={params.q}
                  onChange={(e) => p("q", e.target.value)}
                  placeholder="PO number, title, vendor…"
                  onKeyDown={(e) => e.key === "Enter" && search()}
                />
                <button className="search-bar-btn" onClick={() => search()}>
                  <Icon.Search />
                </button>
              </div>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Status</label>
              <select className="form-control" value={params.status} onChange={(e) => p("status", e.target.value)}>
                <option value="">All Statuses</option>
                {["DRAFT","SUBMITTED","CHANGES_REQUESTED","APPROVED","REJECTED","SAVED_TO_DB"].map((s) => (
                  <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2 – dates + vendor */}
          <div className="grid-3" style={{ marginBottom: 14 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Date From</label>
              <input className="form-control" type="date" value={params.date_from}
                onChange={(e) => p("date_from", e.target.value)} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Date To</label>
              <input className="form-control" type="date" value={params.date_to}
                onChange={(e) => p("date_to", e.target.value)} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Vendor</label>
              <input className="form-control" value={params.vendor}
                onChange={(e) => p("vendor", e.target.value)} placeholder="Vendor name" />
            </div>
          </div>

          {/* Row 3 – amounts + sort */}
          <div className="grid-3" style={{ marginBottom: 14 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Min Amount</label>
              <input className="form-control" type="number" value={params.amount_min}
                onChange={(e) => p("amount_min", e.target.value)} placeholder="0" />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Max Amount</label>
              <input className="form-control" type="number" value={params.amount_max}
                onChange={(e) => p("amount_max", e.target.value)} placeholder="No limit" />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Sort By</label>
              <select className="form-control" value={params.ordering}
                onChange={(e) => p("ordering", e.target.value)}>
                <option value="-created_at">Newest First</option>
                <option value="created_at">Oldest First</option>
                <option value="-grand_total">Highest Value</option>
                <option value="grand_total">Lowest Value</option>
                <option value="-approved_at">Recently Approved</option>
                <option value="po_number">PO Number A–Z</option>
              </select>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn btn-primary" onClick={() => search()} disabled={loading}>
              {loading ? <Loader size={16} /> : <><Icon.Search /> Search</>}
            </button>
            <button className="btn btn-outline" onClick={clearFilters}>
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* ── Stats summary ── */}
      {stats && (
        <div className="stat-grid" style={{ marginBottom: 20 }}>
          <div className="stat-card">
            <div className="stat-card-label">Results</div>
            <div className="stat-card-value">{stats.result_count}</div>
            <div className="stat-card-sub">Matching POs</div>
          </div>
          <div className="stat-card" style={{ borderTopColor: T.purple }}>
            <div className="stat-card-label" style={{ color: T.purple }}>Total Value</div>
            <div className="stat-card-value" style={{ fontSize: "1.2rem" }}>
              {formatCurrency(stats.total_value)}
            </div>
            <div className="stat-card-sub">Combined grand total</div>
          </div>
          {stats.earliest_po && (
            <div className="stat-card" style={{ borderTopColor: T.info }}>
              <div className="stat-card-label" style={{ color: T.info }}>Date Range</div>
              <div className="stat-card-value" style={{ fontSize: "0.95rem" }}>
                {formatDate(stats.earliest_po)}
              </div>
              <div className="stat-card-sub">to {formatDate(stats.latest_po)}</div>
            </div>
          )}
        </div>
      )}

      {/* ── Results table ── */}
      <div className="card">
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
            <Loader size={32} />
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>PO Number</th><th>Title</th><th>Vendor</th><th>Amount</th>
                  <th>Status</th><th>Assigned To</th><th>Created</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {results.length === 0 && (
                  <tr><td colSpan={8}>
                    <EmptyState
                      icon="🔍"
                      title="No results found"
                      message="Try adjusting your search filters."
                    />
                  </td></tr>
                )}
                {results.map((po) => (
                  <tr key={po.id}>
                    <td><strong style={{ color: T.navy }}>{po.po_number}</strong></td>
                    <td style={{ maxWidth: 180 }}>
                      <span style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {po.title}
                      </span>
                    </td>
                    <td>{po.vendor_name || "—"}</td>
                    <td style={{ fontWeight: 600 }}>{formatCurrency(po.grand_total, po.currency)}</td>
                    <td><StatusBadge status={po.status} /></td>
                    <td style={{ fontSize: "0.82rem", color: T.grayDk }}>
                      {po.assigned_to?.full_name || po.assigned_to?.email || "—"}
                    </td>
                    <td style={{ color: T.grayDk }}>{formatDate(po.created_at)}</td>
                    <td>
                      <button
                        className="btn btn-ghost btn-sm"
                        title="Preview"
                        onClick={async () => {
                          const d = await api.poDetail(po.id);
                          setPreviewPO(d);
                        }}
                      >
                        <Icon.Eye />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Preview + print modal ── */}
      <Modal
        open={!!previewPO}
        onClose={() => setPreviewPO(null)}
        title="Purchase Order Preview"
        size="lg"
        footer={
          <button
            className="btn btn-primary"
            onClick={() => {
              const el = document.getElementById("hist-print-area");
              if (!el) return;
              const w = window.open("", "_blank");
              w.document.write(
                `<html><head><title>${previewPO?.po_number}</title>
                <style>
                  body{font-family:sans-serif;padding:32px;}
                  table{width:100%;border-collapse:collapse;}
                  th,td{padding:8px 12px;border:1px solid #ddd;}
                  th{background:#f4f4f4;}
                </style></head><body>${el.innerHTML}</body></html>`
              );
              w.document.close();
              w.focus();
              w.print();
              w.close();
            }}
          >
            <Icon.Download /> Download / Print
          </button>
        }
      >
        {previewPO && (
          <div id="hist-print-area">
            <POPreview po={previewPO} />
          </div>
        )}
      </Modal>
    </div>
  );
}