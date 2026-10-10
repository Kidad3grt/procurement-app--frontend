// src/pages/CreatePOPage.jsx
import { useState } from "react";
import api from "../api/api";
import { Loader, Modal, toast, formatCurrency } from "../components/UI";
import POPreview from "../components/PoPreview";
import Icon from "../components/Icons";
import T from "../styles/tokens";

export default function CreatePOPage({ editPO, onSaved }) {
  const isEdit = !!editPO;

  const [form, setForm] = useState({
    title:          isEdit ? editPO.title          : "",
    description:    isEdit ? editPO.description    : "",
    vendor_name:    isEdit ? editPO.vendor_name    : "",
    vendor_address: isEdit ? editPO.vendor_address : "",
    vendor_email:   isEdit ? editPO.vendor_email   : "",
    currency:       isEdit ? editPO.currency       : "NGN",
    tax_amount:     isEdit ? editPO.tax_amount      : 0,
    delivery_date:  isEdit ? (editPO.delivery_date || "") : "",
  });

  const [lineItems, setLineItems] = useState(
    isEdit && editPO.line_items?.length
      ? editPO.line_items.map((li) => ({
          description: li.description,
          quantity:    li.quantity,
          unit_price:  li.unit_price,
          unit:        li.unit || "pcs",
        }))
      : [{ description: "", quantity: 1, unit_price: 0, unit: "pcs" }]
  );

  const [saving, setSaving]       = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  const f = (field, val) => setForm((p) => ({ ...p, [field]: val }));

  const subTotal   = lineItems.reduce((s, li) =>
    s + (parseFloat(li.quantity) || 0) * (parseFloat(li.unit_price) || 0), 0);
  const grandTotal = subTotal + parseFloat(form.tax_amount || 0);

  const addLine    = () => setLineItems((p) => [...p, { description: "", quantity: 1, unit_price: 0, unit: "pcs" }]);
  const removeLine = (i) => setLineItems((p) => p.filter((_, idx) => idx !== i));
  const updateLine = (i, field, val) =>
    setLineItems((p) => p.map((li, idx) => idx === i ? { ...li, [field]: val } : li));

  const handleSave = async () => {
    if (!form.title) { toast("Title is required", "error"); return; }
    setSaving(true);
    try {
      const payload = {
        ...form,
        total_amount: subTotal,
        grand_total:  grandTotal,
        line_items:   lineItems.filter((li) => li.description),
      };
      if (isEdit) {
        await api.poUpdate(editPO.id, payload);
        toast("PO updated successfully", "success");
      } else {
        await api.poCreate(payload);
        toast("PO created successfully", "success");
      }
      if (onSaved) onSaved();
    } catch (e) {
      toast(e?.detail || "Failed to save PO", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      {/* Page header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.4rem", fontWeight: 800, color: T.navy }}>
            {isEdit ? "Edit Purchase Order" : "Create Purchase Order"}
          </h2>
          {isEdit && <p style={{ color: T.grayDk, fontSize: "0.85rem", marginTop: 4 }}>{editPO.po_number}</p>}
        </div>
        <button className="btn btn-outline" onClick={() => setPreviewOpen(true)}>
          <Icon.Eye /> Preview
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 24 }}>
        {/* ── Left: form ── */}
        <div>
          {/* PO Details */}
          <div className="card" style={{ marginBottom: 20 }}>
            <div className="card-header">
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 700 }}>PO Details</span>
            </div>
            <div className="card-body">
              <div className="form-group">
                <label className="form-label">Title *</label>
                <input className="form-control" value={form.title}
                  onChange={(e) => f("title", e.target.value)} placeholder="Purchase Order title" />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-control" value={form.description}
                  onChange={(e) => f("description", e.target.value)}
                  placeholder="Purpose / details of this PO" />
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Currency</label>
                  <select className="form-control" value={form.currency} onChange={(e) => f("currency", e.target.value)}>
                    <option value="NGN">NGN – Nigerian Naira</option>
                    <option value="USD">USD – US Dollar</option>
                    <option value="EUR">EUR – Euro</option>
                    <option value="GBP">GBP – British Pound</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Delivery Date</label>
                  <input className="form-control" type="date" value={form.delivery_date}
                    onChange={(e) => f("delivery_date", e.target.value)} />
                </div>
              </div>
            </div>
          </div>

          {/* Vendor */}
          <div className="card" style={{ marginBottom: 20 }}>
            <div className="card-header">
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 700 }}>Vendor Information</span>
            </div>
            <div className="card-body">
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Vendor Name</label>
                  <input className="form-control" value={form.vendor_name}
                    onChange={(e) => f("vendor_name", e.target.value)} placeholder="Supplier / vendor name" />
                </div>
                <div className="form-group">
                  <label className="form-label">Vendor Email</label>
                  <input className="form-control" type="email" value={form.vendor_email}
                    onChange={(e) => f("vendor_email", e.target.value)} placeholder="vendor@company.com" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Vendor Address</label>
                <textarea className="form-control" style={{ minHeight: 70 }}
                  value={form.vendor_address}
                  onChange={(e) => f("vendor_address", e.target.value)}
                  placeholder="Full vendor address" />
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div className="card">
            <div className="card-header">
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 700 }}>Line Items</span>
            </div>
            <div className="card-body">
              <div style={{ overflowX: "auto" }}>
                <table className="line-items-table">
                  <thead>
                    <tr>
                      <th style={{ width: "35%" }}>Description</th>
                      <th>Qty</th><th>Unit</th>
                      <th>Unit Price ({form.currency})</th>
                      <th>Total</th><th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {lineItems.map((li, i) => (
                      <tr key={i}>
                        <td>
                          <input value={li.description}
                            onChange={(e) => updateLine(i, "description", e.target.value)}
                            placeholder="Item description" />
                        </td>
                        <td>
                          <input type="number" value={li.quantity} min="0"
                            onChange={(e) => updateLine(i, "quantity", e.target.value)} />
                        </td>
                        <td>
                          <input value={li.unit}
                            onChange={(e) => updateLine(i, "unit", e.target.value)} placeholder="pcs" />
                        </td>
                        <td>
                          <input type="number" value={li.unit_price} min="0"
                            onChange={(e) => updateLine(i, "unit_price", e.target.value)} />
                        </td>
                        <td style={{ fontWeight: 600, whiteSpace: "nowrap" }}>
                          {formatCurrency(
                            (parseFloat(li.quantity) || 0) * (parseFloat(li.unit_price) || 0),
                            form.currency
                          )}
                        </td>
                        <td>
                          {lineItems.length > 1 && (
                            <button onClick={() => removeLine(i)}
                              style={{ background: "none", border: "none", cursor: "pointer", color: T.danger }}>
                              <Icon.Trash />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button className="btn btn-outline btn-sm add-line-btn" onClick={addLine}>
                <Icon.Plus /> Add Line Item
              </button>
            </div>
          </div>
        </div>

        {/* ── Right: summary ── */}
        <div>
          <div className="card" style={{ position: "sticky", top: 80 }}>
            <div className="card-header">
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 700 }}>Summary</span>
            </div>
            <div className="card-body">
              <div className="po-total-line">
                <span>Subtotal</span>
                <span style={{ fontWeight: 600 }}>{formatCurrency(subTotal, form.currency)}</span>
              </div>
              <div className="po-total-line">
                <span>Tax</span>
                <input
                  type="number"
                  style={{ width: 100, padding: "4px 8px", border: `1px solid ${T.gray}`,
                    borderRadius: 4, textAlign: "right", fontSize: "0.88rem" }}
                  value={form.tax_amount}
                  min="0"
                  onChange={(e) => f("tax_amount", e.target.value)}
                />
              </div>
              <div className="po-total-line grand">
                <span>Grand Total</span>
                <span style={{ color: T.orange }}>{formatCurrency(grandTotal, form.currency)}</span>
              </div>

              <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 10 }}>
                <button
                  className="btn btn-primary"
                  style={{ justifyContent: "center" }}
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? <Loader size={16} /> : <><Icon.Save /> Save as Draft</>}
                </button>
              </div>

              {isEdit && (editPO.status === "DRAFT" || editPO.status === "CHANGES_REQUESTED") && (
                <div style={{
                  marginTop: 12, padding: 12, background: T.offWhite,
                  borderRadius: 8, fontSize: "0.8rem", color: T.grayDk, lineHeight: 1.5,
                }}>
                  💡 After saving, go to <strong>My POs</strong> to forward this PO for approval.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Preview modal */}
      <Modal open={previewOpen} onClose={() => setPreviewOpen(false)} title="PO Preview" size="lg">
        <POPreview po={{
          ...form,
          line_items:   lineItems,
          total_amount: subTotal,
          grand_total:  grandTotal,
          po_number:    isEdit ? editPO.po_number : "DRAFT",
          created_at:   new Date().toISOString(),
        }} />
      </Modal>
    </div>
  );
}