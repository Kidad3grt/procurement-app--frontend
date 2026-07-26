// src/pages/HomePage.jsx
import { useState, useEffect } from "react";
import api from "../api/api";
import { Loader, StatusBadge, formatDate, formatCurrency } from "../components/UI";
import Icon from "../components/Icons";
import T from "../styles/tokens";
import DivconGlobe from "../components/DivconGlobe";

export default function HomePage({ user, setPage }) {
  const [stats, setStats]       = useState(null);
  const [recentPos, setRecentPos] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await api.poList();
        const list = data.results || data;
        setRecentPos(list.slice(0, 5));

        const byStatus = {};
        list.forEach((p) => { byStatus[p.status] = (byStatus[p.status] || 0) + 1; });

        setStats({
          total:      list.length,
          draft:      byStatus.DRAFT || 0,
          submitted:  byStatus.SUBMITTED || 0,
          approved:   byStatus.APPROVED || 0,
          changes:    byStatus.CHANGES_REQUESTED || 0,
          saved:      byStatus.SAVED_TO_DB || 0,
          totalValue: list.reduce((s, p) => s + parseFloat(p.grand_total || 0), 0),
        });
      } catch {}
      setLoading(false);
    })();
  }, []);

  const isProcurement = user?.role === "PROCUREMENT_OFFICER";

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
      <Loader size={36} />
    </div>
  );

  return (
    <div>
      {/* Welcome banner */}
      <div style={{
        background: `linear-gradient(135deg, ${T.navy} 0%, ${T.navyMd} 60%, ${T.purple} 100%)`,
        borderRadius: 16, padding: "28px 32px", marginBottom: 28, color: "white",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", right: 32, top: "50%", transform: "translateY(-50%)",
          opacity: 0.55,
        }}>
          <DivconGlobe size={110} bgColor="transparent" />
        </div>
        <div style={{ fontFamily: "var(--font-display)", fontSize: "0.75rem", fontWeight: 700,
          letterSpacing: "0.12em", textTransform: "uppercase", color: T.orangeL, marginBottom: 8 }}>
          Welcome back
        </div>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.7rem", fontWeight: 800, marginBottom: 6 }}>
          {user?.first_name ? `${user.first_name} ${user.last_name}` : user?.email}
        </h2>
        <p style={{ fontSize: "0.9rem", opacity: 0.7 }}>
          {user?.role?.replace(/_/g, " ")} · {user?.department || "Procurement Dept"}
        </p>
        {isProcurement && (
          <button className="btn btn-primary" style={{ marginTop: 18 }} onClick={() => setPage("create-po")}>
            <Icon.Plus /> Create New PO
          </button>
        )}
      </div>

      {/* Stats */}
      {stats && (
        <div className="stat-grid">
          <div className="stat-card">
            <div className="stat-card-label">Total POs</div>
            <div className="stat-card-value">{stats.total}</div>
            <div className="stat-card-sub">All time</div>
          </div>
          <div className="stat-card" style={{ borderTopColor: T.info }}>
            <div className="stat-card-label" style={{ color: T.info }}>Submitted</div>
            <div className="stat-card-value">{stats.submitted}</div>
            <div className="stat-card-sub">Awaiting review</div>
          </div>
          <div className="stat-card" style={{ borderTopColor: T.success }}>
            <div className="stat-card-label" style={{ color: T.success }}>Approved</div>
            <div className="stat-card-value">{stats.approved}</div>
            <div className="stat-card-sub">Ready to save</div>
          </div>
          <div className="stat-card" style={{ borderTopColor: T.warning }}>
            <div className="stat-card-label" style={{ color: T.warning }}>Needs Changes</div>
            <div className="stat-card-value">{stats.changes}</div>
            <div className="stat-card-sub">Returned for edits</div>
          </div>
          {isProcurement && (
            <div className="stat-card" style={{ borderTopColor: T.purple }}>
              <div className="stat-card-label" style={{ color: T.purple }}>Total Value</div>
              <div className="stat-card-value" style={{ fontSize: "1.2rem" }}>
                {formatCurrency(stats.totalValue)}
              </div>
              <div className="stat-card-sub">All POs combined</div>
            </div>
          )}
        </div>
      )}

      {/* Recent POs table */}
      <div className="card">
        <div className="card-header">
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1rem", fontWeight: 700 }}>
            {isProcurement ? "Recent Purchase Orders" : "Forwarded to You"}
          </h3>
          <button
            className="btn btn-outline btn-sm"
            onClick={() => setPage(isProcurement ? "my-pos" : "review-pos")}
          >
            View All
          </button>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>PO Number</th><th>Title</th><th>Vendor</th>
                <th>Amount</th><th>Status</th><th>Date</th>
              </tr>
            </thead>
            <tbody>
              {recentPos.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: 32, color: T.grayDk }}>
                    No purchase orders yet
                  </td>
                </tr>
              )}
              {recentPos.map((po) => (
                <tr key={po.id}>
                  <td><span style={{ fontWeight: 700, color: T.navy }}>{po.po_number}</span></td>
                  <td>{po.title}</td>
                  <td>{po.vendor_name || "—"}</td>
                  <td style={{ fontWeight: 600 }}>{formatCurrency(po.grand_total, po.currency)}</td>
                  <td><StatusBadge status={po.status} /></td>
                  <td style={{ color: T.grayDk }}>{formatDate(po.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}