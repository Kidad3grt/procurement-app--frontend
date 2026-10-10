// src/pages/MyPOsPage.jsx
import { useState, useEffect } from "react";
import api from "../api/api";
import { Loader, Modal, StatusBadge, EmptyState, toast, formatDate, formatCurrency } from "../components/UI";
import POPreview from "../components/PoPreview";
import Icon from "../components/Icons";
import T from "../styles/tokens";

export default function MyPOsPage({ setPage, setActivePO }) {
  const [pos, setPos]               = useState([]);
  const [loading, setLoading]       = useState(true);
  const [filterStatus, setFilter]   = useState("");
  const [forwardModal, setForwardModal] = useState(null);
  const [managers, setManagers]     = useState([]);
  const [selectedMgr, setSelectedMgr] = useState("");
  const [forwarding, setForwarding] = useState(false);
  const [saveConfirm, setSaveConfirm] = useState(null);
  const [previewPO, setPreviewPO]   = useState(null);

  const load = async () => {
    setLoading(true);
    try { const d = await api.poList(); setPos(d.results || d); } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openForward = async (po) => {
    setForwardModal(po);
    try { const m = await api.managerialList(); setManagers(m.results || m); } catch {}
  };

  const handleForward = async () => {
    if (!selectedMgr) { toast("Select a Managerial Officer", "error"); return; }
    setForwarding(true);
    try {
      await api.poForward(forwardModal.id, selectedMgr);
      toast("PO forwarded successfully", "success");
      setForwardModal(null); setSelectedMgr(""); load();
    } catch (e) {
      toast(e?.detail || "Failed to forward", "error");
    } finally { setForwarding(false); }
  };

  const handleSaveToDB = async () => {
    try {
      await api.poSaveToDB(saveConfirm.id);
      toast("PO saved to database", "success");
      setSaveConfirm(null); load();
    } catch (e) {
      toast(e?.detail || "Failed to save", "error");
    }
  };

  const filtered = filterStatus ? pos.filter((p) => p.status === filterStatus) : pos;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.4rem", fontWeight: 800 }}>
          My Purchase Orders
        </h2>
        <button className="btn btn-primary" onClick={() => { setActivePO(null); setPage("create-po"); }}>
          <Icon.Plus /> Create PO
        </button>
      </div>

      <div className="filter-row">
        <select value={filterStatus} onChange={(e) => setFilter(e.target.value)}>
          <option value="">All Statuses</option>
          {["DRAFT","SUBMITTED","CHANGES_REQUESTED","APPROVED","REJECTED","SAVED_TO_DB"].map((s) => (
            <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
          ))}
        </select>
      </div>

      <div className="card">
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: 60 }}><Loader size={32} /></div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>PO Number</th><th>Title</th><th>Vendor</th>
                  <th>Amount</th><th>Status</th><th>Date</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr><td colSpan={7}>
                    <EmptyState icon="📋" title="No POs found" message="Create your first purchase order to get started." />
                  </td></tr>
                )}
                {filtered.map((po) => (
                  <tr key={po.id}>
                    <td><span style={{ fontWeight: 700, color: T.navy }}>{po.po_number}</span></td>
                    <td style={{ maxWidth: 200 }}>
                      <span style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {po.title}
                      </span>
                    </td>
                    <td>{po.vendor_name || "—"}</td>
                    <td style={{ fontWeight: 600 }}>{formatCurrency(po.grand_total, po.currency)}</td>
                    <td><StatusBadge status={po.status} /></td>
                    <td style={{ color: T.grayDk }}>{formatDate(po.created_at)}</td>
                    <td>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button className="btn btn-ghost btn-sm" title="Preview"
                          onClick={async () => { const d = await api.poDetail(po.id); setPreviewPO(d); }}>
                          <Icon.Eye />
                        </button>
                        {(po.status === "DRAFT" || po.status === "CHANGES_REQUESTED") && (
                          <>
                            <button className="btn btn-ghost btn-sm" title="Edit"
                              onClick={() => { setActivePO(po); setPage("create-po"); }}>
                              <Icon.Edit />
                            </button>
                            <button className="btn btn-secondary btn-sm" title="Forward"
                              onClick={() => openForward(po)}>
                              <Icon.Send />
                            </button>
                          </>
                        )}
                        {po.status === "APPROVED" && (
                          <button className="btn btn-success btn-sm" onClick={() => setSaveConfirm(po)}>
                            <Icon.Save /> Save to DB
                          </button>
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

      {/* Forward modal */}
      <Modal
        open={!!forwardModal}
        onClose={() => setForwardModal(null)}
        title={`Forward PO: ${forwardModal?.po_number}`}
        footer={
          <>
            <button className="btn btn-outline" onClick={() => setForwardModal(null)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleForward} disabled={forwarding}>
              {forwarding ? <Loader size={16} /> : <><Icon.Send /> Forward PO</>}
            </button>
          </>
        }
      >
        <div style={{ padding: 14, background: T.offWhite, borderRadius: 8, marginBottom: 16, fontSize: "0.88rem" }}>
          <strong>{forwardModal?.title}</strong>
          <div style={{ color: T.grayDk, marginTop: 4 }}>
            Value: {formatCurrency(forwardModal?.grand_total, forwardModal?.currency)}
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Select Managerial Officer</label>
          <select className="form-control" value={selectedMgr}
            onChange={(e) => setSelectedMgr(e.target.value)}>
            <option value="">— Choose an officer —</option>
            {managers.map((m) => (
              <option key={m.id} value={m.id}>
                {m.full_name || m.email} {m.department ? `(${m.department})` : ""}
              </option>
            ))}
          </select>
        </div>
      </Modal>

      {/* Save to DB confirm */}
      <Modal
        open={!!saveConfirm}
        onClose={() => setSaveConfirm(null)}
        title="Save Approved PO to Database"
        footer={
          <>
            <button className="btn btn-outline" onClick={() => setSaveConfirm(null)}>Cancel</button>
            <button className="btn btn-success" onClick={handleSaveToDB}>
              <Icon.Save /> Confirm Save
            </button>
          </>
        }
      >
        <div style={{ fontSize: "0.9rem", lineHeight: 1.6 }}>
          <p>You are about to permanently save this approved Purchase Order:</p>
          <div style={{ padding: "12px 16px", background: T.offWhite, borderRadius: 8, margin: "14px 0" }}>
            <strong>{saveConfirm?.po_number}</strong> — {saveConfirm?.title}<br />
            <span style={{ color: T.grayDk }}>Value: {formatCurrency(saveConfirm?.grand_total, saveConfirm?.currency)}</span>
          </div>
          <p style={{ color: T.warning }}>⚠️ This action cannot be undone.</p>
        </div>
      </Modal>

      {/* Preview modal */}
      <Modal open={!!previewPO} onClose={() => setPreviewPO(null)} title="Purchase Order Preview" size="lg"
        footer={
          <button className="btn btn-primary" onClick={() => {
            const el = document.getElementById("my-po-print");
            if (!el) return;
            const w = window.open("", "_blank");
            w.document.write(`<html><head><title>${previewPO?.po_number}</title>
              <style>body{font-family:sans-serif;padding:32px;}table{width:100%;border-collapse:collapse;}
              th,td{padding:8px 12px;border:1px solid #ddd;}th{background:#f4f4f4;}</style>
              </head><body>${el.innerHTML}</body></html>`);
            w.document.close(); w.print(); w.close();
          }}>
            <Icon.Download /> Download / Print
          </button>
        }
      >
        {previewPO && <div id="my-po-print"><POPreview po={previewPO} /></div>}
      </Modal>
    </div>
  );
}