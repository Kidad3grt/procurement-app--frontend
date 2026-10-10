// src/pages/ReviewPOsPage.jsx
import { useState, useEffect } from "react";
import api from "../api/api";
import { Loader, Modal, StatusBadge, EmptyState, toast, formatDate, formatCurrency, timeAgo } from "../components/UI";
import POPreview from "../components/PoPreview";
import Icon from "../components/Icons";
import T from "../styles/tokens";

export default function ReviewPOsPage() {
  const [pos, setPos]             = useState([]);
  const [loading, setLoading]     = useState(true);
  const [activeTab, setActiveTab] = useState("SUBMITTED");
  const [selectedPO, setSelectedPO] = useState(null);
  const [changeLog, setChangeLog] = useState([]);
  const [actionModal, setActionModal] = useState(null); // { po, mode: "approve"|"edit" }
  const [approveForm, setApproveForm] = useState({ action: "approve", notes: "" });
  const [editForm, setEditForm]   = useState({ return_notes: "" });
  const [editLines, setEditLines] = useState([]);
  const [acting, setActing]       = useState(false);
  const [previewPO, setPreviewPO] = useState(null);

  const load = async () => {
    setLoading(true);
    try { const d = await api.poList(); setPos(d.results || d); } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openDetail = async (po) => {
    const [d, cl] = await Promise.all([api.poDetail(po.id), api.poChanges(po.id)]);
    setSelectedPO(d);
    setChangeLog(cl.results || cl || []);
  };

  const openEdit = (po) => {
    setEditLines(po.line_items?.map((li) => ({ ...li })) || []);
    setEditForm({ return_notes: "" });
    setActionModal({ po, mode: "edit" });
  };

  const handleApprove = async () => {
    setActing(true);
    try {
      await api.poApprove(actionModal.po.id, approveForm.action, approveForm.notes);
      toast(`PO ${approveForm.action === "approve" ? "approved" : "rejected"}`, "success");
      setActionModal(null); setSelectedPO(null); load();
    } catch (e) {
      toast(e?.detail || "Action failed", "error");
    } finally { setActing(false); }
  };

  const handleEditReturn = async () => {
    if (!editForm.return_notes.trim()) { toast("Return notes are required", "error"); return; }
    setActing(true);
    try {
      await api.poEditReturn(actionModal.po.id, {
        ...editForm,
        line_items: editLines.filter((li) => li.description),
      });
      toast("Changes sent back to Procurement Officer", "success");
      setActionModal(null); setSelectedPO(null); load();
    } catch (e) {
      toast(e?.detail || "Failed to return PO", "error");
    } finally { setActing(false); }
  };

  const updateEditLine = (i, field, val) =>
    setEditLines((p) => p.map((li, idx) => idx === i ? { ...li, [field]: val } : li));

  const filtered = pos.filter((p) => p.status === activeTab);

  return (
    <div>
      <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.4rem", fontWeight: 800, marginBottom: 20 }}>
        Review Purchase Orders
      </h2>

      {/* Status tabs */}
      <div className="tabs">
        {["SUBMITTED","CHANGES_REQUESTED","APPROVED","REJECTED"].map((s) => (
          <div key={s} className={`tab ${activeTab === s ? "active" : ""}`}
            onClick={() => setActiveTab(s)}>
            {s.replace(/_/g, " ")}
            <span style={{
              marginLeft: 6, borderRadius: 99, padding: "1px 7px",
              fontSize: "0.7rem", fontWeight: 700,
              background: activeTab === s ? T.orange : T.gray,
              color: activeTab === s ? "white" : T.grayDk,
            }}>
              {pos.filter((p) => p.status === s).length}
            </span>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: selectedPO ? "1fr 380px" : "1fr", gap: 20 }}>
        {/* List */}
        <div className="card">
          {loading ? (
            <div style={{ padding: 60, textAlign: "center" }}><Loader size={32} /></div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>PO Number</th><th>Title</th><th>From</th><th>Amount</th><th>Date</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {filtered.length === 0 && (
                    <tr><td colSpan={6}>
                      <EmptyState icon="✅" title="Nothing here"
                        message={`No POs with status "${activeTab.replace(/_/g," ")}"`} />
                    </td></tr>
                  )}
                  {filtered.map((po) => (
                    <tr key={po.id}>
                      <td onClick={() => openDetail(po)} style={{ cursor: "pointer" }}>
                        <strong style={{ color: T.navy }}>{po.po_number}</strong>
                      </td>
                      <td onClick={() => openDetail(po)} style={{ cursor: "pointer" }}>{po.title}</td>
                      <td style={{ color: T.grayDk, fontSize: "0.82rem" }}>
                        {po.created_by?.full_name || po.created_by?.email}
                      </td>
                      <td style={{ fontWeight: 600 }}>{formatCurrency(po.grand_total, po.currency)}</td>
                      <td style={{ color: T.grayDk }}>{formatDate(po.created_at)}</td>
                      <td>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button className="btn btn-ghost btn-sm" onClick={() => openDetail(po)}>
                            <Icon.Eye />
                          </button>
                          {po.status === "SUBMITTED" && (
                            <>
                              <button className="btn btn-outline btn-sm" onClick={() => openEdit(po)}>
                                <Icon.Return /> Return
                              </button>
                              <button className="btn btn-success btn-sm"
                                onClick={() => { setApproveForm({ action: "approve", notes: "" }); setActionModal({ po, mode: "approve" }); }}>
                                <Icon.Check />
                              </button>
                              <button className="btn btn-danger btn-sm"
                                onClick={() => { setApproveForm({ action: "reject", notes: "" }); setActionModal({ po, mode: "approve" }); }}>
                                <Icon.X />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Detail side panel */}
        {selectedPO && (
          <div className="card" style={{ maxHeight: "calc(100vh - 140px)", overflowY: "auto" }}>
            <div className="card-header">
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "0.95rem" }}>
                {selectedPO.po_number}
              </span>
              <button className="icon-btn" onClick={() => setSelectedPO(null)} style={{ background: T.gray }}>
                <Icon.X />
              </button>
            </div>
            <div style={{ padding: 20 }}>
              <StatusBadge status={selectedPO.status} />
              <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, margin: "12px 0 4px" }}>
                {selectedPO.title}
              </h3>
              <p style={{ fontSize: "0.85rem", color: T.grayDk, marginBottom: 16 }}>{selectedPO.description}</p>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                <div style={{ padding: 12, background: T.offWhite, borderRadius: 8 }}>
                  <div style={{ fontSize: "0.7rem", fontWeight: 700, color: T.purple, textTransform: "uppercase", marginBottom: 4 }}>Vendor</div>
                  <div style={{ fontSize: "0.85rem", fontWeight: 600 }}>{selectedPO.vendor_name || "—"}</div>
                  <div style={{ fontSize: "0.78rem", color: T.grayDk }}>{selectedPO.vendor_email}</div>
                </div>
                <div style={{ padding: 12, background: T.offWhite, borderRadius: 8 }}>
                  <div style={{ fontSize: "0.7rem", fontWeight: 700, color: T.purple, textTransform: "uppercase", marginBottom: 4 }}>Amount</div>
                  <div style={{ fontSize: "1rem", fontWeight: 800, color: T.orange }}>
                    {formatCurrency(selectedPO.grand_total, selectedPO.currency)}
                  </div>
                  <div style={{ fontSize: "0.78rem", color: T.grayDk }}>Tax: {formatCurrency(selectedPO.tax_amount, selectedPO.currency)}</div>
                </div>
              </div>

              {/* Line items */}
              {selectedPO.line_items?.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: "0.72rem", fontWeight: 700, color: T.purple, textTransform: "uppercase", marginBottom: 8 }}>
                    Line Items
                  </div>
                  <table style={{ width: "100%", fontSize: "0.82rem", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ background: T.navy, color: "white" }}>
                        <th style={{ padding: "7px 10px", textAlign: "left" }}>Item</th>
                        <th style={{ padding: "7px 10px", textAlign: "center" }}>Qty</th>
                        <th style={{ padding: "7px 10px", textAlign: "right" }}>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedPO.line_items.map((li, i) => (
                        <tr key={i} style={{ borderBottom: `1px solid ${T.gray}` }}>
                          <td style={{ padding: "7px 10px" }}>{li.description}</td>
                          <td style={{ padding: "7px 10px", textAlign: "center" }}>{li.quantity} {li.unit}</td>
                          <td style={{ padding: "7px 10px", textAlign: "right", fontWeight: 600 }}>
                            {formatCurrency(li.total_price, selectedPO.currency)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Change log */}
              {changeLog.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: "0.72rem", fontWeight: 700, color: T.purple, textTransform: "uppercase", marginBottom: 10 }}>
                    Change History
                  </div>
                  {changeLog.map((cl) => (
                    <div key={cl.id} className="change-log-item">
                      <div className="change-log-dot" />
                      <div>
                        <div className="change-log-field">{cl.field_name.replace(/_/g, " ")}</div>
                        <div className="change-log-vals">
                          <span style={{ color: T.danger }}>{cl.old_value || "—"}</span>
                          <span style={{ margin: "0 6px", color: T.grayDk }}>→</span>
                          <span style={{ color: T.success }}>{cl.new_value || "—"}</span>
                        </div>
                        <div className="change-log-who">
                          {cl.changed_by?.full_name || cl.changed_by?.email} · {timeAgo(cl.timestamp)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {selectedPO.approval_notes && (
                <div style={{ padding: "12px 16px", background: "rgba(243,156,18,0.08)",
                  borderLeft: `3px solid ${T.warning}`, borderRadius: 6, marginBottom: 16, fontSize: "0.85rem" }}>
                  <strong>Notes:</strong> {selectedPO.approval_notes}
                </div>
              )}

              <button className="btn btn-outline btn-sm" onClick={() => setPreviewPO(selectedPO)}>
                <Icon.Eye /> Full Preview
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Approve / Reject modal */}
      <Modal
        open={actionModal?.mode === "approve"}
        onClose={() => setActionModal(null)}
        title={approveForm.action === "approve" ? "Approve Purchase Order" : "Reject Purchase Order"}
        footer={
          <>
            <button className="btn btn-outline" onClick={() => setActionModal(null)}>Cancel</button>
            <button className={`btn ${approveForm.action === "approve" ? "btn-success" : "btn-danger"}`}
              onClick={handleApprove} disabled={acting}>
              {acting ? <Loader size={16} /> : approveForm.action === "approve"
                ? <><Icon.Check /> Approve</> : <><Icon.X /> Reject</>}
            </button>
          </>
        }
      >
        <div style={{ padding: "12px 16px", background: T.offWhite, borderRadius: 8, marginBottom: 16, fontSize: "0.88rem" }}>
          <strong>{actionModal?.po?.po_number}</strong> — {actionModal?.po?.title}<br />
          <span style={{ color: T.grayDk }}>Value: {formatCurrency(actionModal?.po?.grand_total, actionModal?.po?.currency)}</span>
        </div>
        <div className="form-group" style={{ marginBottom: 8 }}>
          <label className="form-label">Decision</label>
          <div style={{ display: "flex", gap: 10 }}>
            {["approve","reject"].map((a) => (
              <label key={a} style={{
                display: "flex", alignItems: "center", gap: 8, cursor: "pointer",
                padding: "8px 16px", borderRadius: 8,
                border: `2px solid ${approveForm.action === a ? T.orange : T.gray}`,
                background: approveForm.action === a ? "rgba(241,138,78,0.08)" : "white",
              }}>
                <input type="radio" name="action" value={a} checked={approveForm.action === a}
                  onChange={() => setApproveForm((f) => ({ ...f, action: a }))} />
                {a.charAt(0).toUpperCase() + a.slice(1)}
              </label>
            ))}
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Notes (optional)</label>
          <textarea className="form-control" value={approveForm.notes}
            onChange={(e) => setApproveForm((f) => ({ ...f, notes: e.target.value }))}
            placeholder="Add any notes or comments..." />
        </div>
      </Modal>

      {/* Edit & Return modal */}
      <Modal
        open={actionModal?.mode === "edit"}
        onClose={() => setActionModal(null)}
        title="Edit & Return to Procurement Officer"
        size="lg"
        footer={
          <>
            <button className="btn btn-outline" onClick={() => setActionModal(null)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleEditReturn} disabled={acting}>
              {acting ? <Loader size={16} /> : <><Icon.Return /> Return with Changes</>}
            </button>
          </>
        }
      >
        <div style={{ padding: "10px 14px", background: "rgba(243,156,18,0.08)",
          borderLeft: `3px solid ${T.warning}`, borderRadius: 6, marginBottom: 18, fontSize: "0.85rem" }}>
          ✏️ All changes are tracked in the audit log. The Procurement Officer will be notified.
        </div>
        <div className="form-group">
          <label className="form-label">Return Notes *</label>
          <textarea className="form-control" value={editForm.return_notes}
            onChange={(e) => setEditForm((f) => ({ ...f, return_notes: e.target.value }))}
            placeholder="Explain what was changed and why..." />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label className="form-label">Line Items</label>
          <table className="line-items-table">
            <thead>
              <tr><th>Description</th><th>Qty</th><th>Unit</th><th>Unit Price</th><th></th></tr>
            </thead>
            <tbody>
              {editLines.map((li, i) => (
                <tr key={i}>
                  <td><input value={li.description} onChange={(e) => updateEditLine(i, "description", e.target.value)} /></td>
                  <td><input type="number" value={li.quantity} onChange={(e) => updateEditLine(i, "quantity", e.target.value)} /></td>
                  <td><input value={li.unit} onChange={(e) => updateEditLine(i, "unit", e.target.value)} /></td>
                  <td><input type="number" value={li.unit_price} onChange={(e) => updateEditLine(i, "unit_price", e.target.value)} /></td>
                  <td>
                    {editLines.length > 1 && (
                      <button onClick={() => setEditLines((p) => p.filter((_, idx) => idx !== i))}
                        style={{ background: "none", border: "none", cursor: "pointer", color: T.danger }}>
                        <Icon.Trash />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button className="btn btn-outline btn-sm add-line-btn"
            onClick={() => setEditLines((p) => [...p, { description: "", quantity: 1, unit_price: 0, unit: "pcs" }])}>
            <Icon.Plus /> Add Line
          </button>
        </div>
      </Modal>

      {/* Full preview */}
      <Modal open={!!previewPO} onClose={() => setPreviewPO(null)} title="PO Full Preview" size="lg">
        {previewPO && <POPreview po={previewPO} />}
      </Modal>
    </div>
  );
}