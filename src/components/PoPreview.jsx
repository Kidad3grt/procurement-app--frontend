// src/components/POPreview.jsx
// Printable / downloadable PO layout.
// Used inside a Modal in MyPOsPage, ReviewPOsPage, and POHistoryPage.

import { StatusBadge, formatDate, formatCurrency } from "./UI";
import T from "../styles/tokens";

export default function POPreview({ po }) {
  return (
    <div className="po-preview">
      {/* Header */}
      <div className="po-preview-header">
        <div>
          <div className="po-preview-title">PURCHASE ORDER</div>
          <div className="po-preview-number">{po.po_number}</div>
          <StatusBadge status={po.status} />
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: "1.4rem", fontWeight: 800, color: T.navy }}>
            DIVCON
          </div>
          <div style={{ fontSize: "0.8rem", color: T.grayDk, marginTop: 4 }}>
            Procurement Management System
          </div>
          <div style={{ fontSize: "0.82rem", marginTop: 8 }}>
            Date: <strong>{formatDate(po.created_at)}</strong>
          </div>
          {po.delivery_date && (
            <div style={{ fontSize: "0.82rem" }}>
              Delivery: <strong>{formatDate(po.delivery_date)}</strong>
            </div>
          )}
        </div>
      </div>

      {/* Meta grid */}
      <div className="po-meta-grid">
        <div className="po-meta-box">
          <div className="po-meta-box-title">Vendor Details</div>
          <div style={{ fontWeight: 700 }}>{po.vendor_name || "—"}</div>
          {po.vendor_email && (
            <div style={{ fontSize: "0.85rem", color: T.grayDk }}>{po.vendor_email}</div>
          )}
          {po.vendor_address && (
            <div style={{ fontSize: "0.82rem", color: T.grayDk, marginTop: 4, lineHeight: 1.5 }}>
              {po.vendor_address}
            </div>
          )}
        </div>
        <div className="po-meta-box">
          <div className="po-meta-box-title">PO Information</div>
          <div style={{ fontSize: "0.88rem" }}><strong>Title:</strong> {po.title}</div>
          {po.description && (
            <div style={{ fontSize: "0.82rem", color: T.grayDk, marginTop: 4 }}>{po.description}</div>
          )}
          {po.created_by && (
            <div style={{ fontSize: "0.82rem", marginTop: 8 }}>
              <strong>Created by:</strong> {po.created_by?.full_name || po.created_by?.email}
            </div>
          )}
          {po.assigned_to && (
            <div style={{ fontSize: "0.82rem" }}>
              <strong>Reviewed by:</strong> {po.assigned_to?.full_name || po.assigned_to?.email}
            </div>
          )}
        </div>
      </div>

      {/* Line items */}
      {po.line_items?.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.88rem" }}>
            <thead>
              <tr style={{ background: T.navy, color: "white" }}>
                <th style={{ padding: "10px 14px", textAlign: "left" }}>Description</th>
                <th style={{ padding: "10px 14px", textAlign: "center" }}>Qty</th>
                <th style={{ padding: "10px 14px", textAlign: "center" }}>Unit</th>
                <th style={{ padding: "10px 14px", textAlign: "right" }}>Unit Price</th>
                <th style={{ padding: "10px 14px", textAlign: "right" }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {po.line_items.map((li, i) => (
                <tr
                  key={i}
                  style={{
                    borderBottom: `1px solid ${T.gray}`,
                    background: i % 2 === 0 ? "white" : T.offWhite,
                  }}
                >
                  <td style={{ padding: "10px 14px" }}>{li.description}</td>
                  <td style={{ padding: "10px 14px", textAlign: "center" }}>{li.quantity}</td>
                  <td style={{ padding: "10px 14px", textAlign: "center" }}>{li.unit}</td>
                  <td style={{ padding: "10px 14px", textAlign: "right" }}>
                    {formatCurrency(li.unit_price, po.currency)}
                  </td>
                  <td style={{ padding: "10px 14px", textAlign: "right", fontWeight: 600 }}>
                    {formatCurrency(
                      parseFloat(li.total_price || 0) ||
                      parseFloat(li.quantity) * parseFloat(li.unit_price),
                      po.currency
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Totals */}
      <div className="po-total-row">
        <div className="po-total-box">
          <div className="po-total-line">
            <span>Subtotal</span>
            <span>{formatCurrency(po.total_amount, po.currency)}</span>
          </div>
          <div className="po-total-line">
            <span>Tax</span>
            <span>{formatCurrency(po.tax_amount, po.currency)}</span>
          </div>
          <div className="po-total-line grand">
            <span>Grand Total</span>
            <span style={{ color: T.orange }}>{formatCurrency(po.grand_total, po.currency)}</span>
          </div>
        </div>
      </div>

      {/* Approval notes */}
      {po.approval_notes && (
        <div style={{
          marginTop: 24, padding: "14px 18px", background: T.offWhite,
          borderRadius: 8, borderLeft: `4px solid ${T.orange}`, fontSize: "0.85rem",
        }}>
          <strong>Approval Notes:</strong> {po.approval_notes}
        </div>
      )}

      {/* Signature section */}
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32,
        marginTop: 40, paddingTop: 20, borderTop: `2px solid ${T.gray}`,
      }}>
        {["Prepared By (Procurement Officer)", "Approved By (Managerial Officer)"].map((label) => (
          <div key={label}>
            <div style={{
              fontSize: "0.75rem", color: T.grayDk, marginBottom: 32,
              textTransform: "uppercase", letterSpacing: "0.08em",
            }}>
              {label}
            </div>
            <div style={{ borderTop: `1px solid ${T.navy}`, paddingTop: 8, fontSize: "0.78rem", color: T.grayDk }}>
              Signature &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Date
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}