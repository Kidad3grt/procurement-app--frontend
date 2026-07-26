// src/pages/ManageUsersPage.jsx
import { useState, useEffect } from "react";
import api from "../api/api";
import { Loader, Modal, EmptyState, toast, formatDate } from "../components/UI";
import Icon from "../components/Icons";
import T from "../styles/tokens";

const ROLE_STYLE = {
  PROCUREMENT_OFFICER: { bg: "rgba(241,138,78,0.15)", color: T.orangeD },
  MANAGERIAL_OFFICER:  { bg: "rgba(114,110,158,0.15)", color: T.purple },
  SUPERUSER:           { bg: "rgba(33,28,90,0.12)",    color: T.navy  },
};

const EMPTY_FORM = {
  email: "", first_name: "", last_name: "",
  role: "PROCUREMENT_OFFICER", department: "",
  password: "", password2: "",
};

export default function ManageUsersPage() {
  const [users, setUsers]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [roleFilter, setRoleFilter] = useState("");
  const [createModal, setCreateModal] = useState(false);
  const [form, setForm]             = useState(EMPTY_FORM);
  const [saving, setSaving]         = useState(false);

  const f = (field, val) => setForm((p) => ({ ...p, [field]: val }));

  const load = async () => {
    setLoading(true);
    try { const d = await api.users(roleFilter); setUsers(d.results || d); } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, [roleFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCreate = async () => {
    if (!form.email || !form.password) { toast("Email and password are required", "error"); return; }
    if (form.password !== form.password2) { toast("Passwords do not match", "error"); return; }
    setSaving(true);
    try {
      await api.registerUser(form);
      toast("User created successfully", "success");
      setCreateModal(false);
      setForm(EMPTY_FORM);
      load();
    } catch (e) {
      const msg = Object.values(e || {}).flat().join(" · ");
      toast(msg || "Failed to create user", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.4rem", fontWeight: 800 }}>
          Manage Users
        </h2>
        <button className="btn btn-primary" onClick={() => setCreateModal(true)}>
          <Icon.Plus /> Add User
        </button>
      </div>

      {/* Role filter */}
      <div className="filter-row">
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
          <option value="">All Roles</option>
          <option value="PROCUREMENT_OFFICER">Procurement Officers</option>
          <option value="MANAGERIAL_OFFICER">Managerial Officers</option>
          <option value="SUPERUSER">Superusers</option>
        </select>
      </div>

      {/* Table */}
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
                  <th>Name</th><th>Email</th><th>Role</th>
                  <th>Department</th><th>Status</th><th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 && (
                  <tr><td colSpan={6}>
                    <EmptyState
                      icon="👤"
                      title="No users found"
                      message="Create the first user to get started."
                    />
                  </td></tr>
                )}
                {users.map((u) => {
                  const rs = ROLE_STYLE[u.role] || {};
                  return (
                    <tr key={u.id}>
                      <td><strong>{u.first_name} {u.last_name}</strong></td>
                      <td style={{ color: T.grayDk }}>{u.email}</td>
                      <td>
                        <span style={{
                          padding: "3px 10px", borderRadius: 99,
                          fontSize: "0.75rem", fontWeight: 600,
                          background: rs.bg, color: rs.color,
                        }}>
                          {u.role.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td>{u.department || "—"}</td>
                      <td>
                        <span style={{
                          width: 8, height: 8, borderRadius: "50%",
                          display: "inline-block", marginRight: 6,
                          background: u.is_active ? T.success : T.danger,
                        }} />
                        {u.is_active ? "Active" : "Inactive"}
                      </td>
                      <td style={{ color: T.grayDk }}>{formatDate(u.date_joined)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create user modal */}
      <Modal
        open={createModal}
        onClose={() => { setCreateModal(false); setForm(EMPTY_FORM); }}
        title="Create New User"
        footer={
          <>
            <button className="btn btn-outline" onClick={() => { setCreateModal(false); setForm(EMPTY_FORM); }}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleCreate} disabled={saving}>
              {saving ? <Loader size={16} /> : "Create User"}
            </button>
          </>
        }
      >
        <div className="grid-2">
          <div className="form-group">
            <label className="form-label">First Name</label>
            <input className="form-control" value={form.first_name}
              onChange={(e) => f("first_name", e.target.value)} placeholder="John" />
          </div>
          <div className="form-group">
            <label className="form-label">Last Name</label>
            <input className="form-control" value={form.last_name}
              onChange={(e) => f("last_name", e.target.value)} placeholder="Doe" />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Email Address</label>
          <input className="form-control" type="email" value={form.email}
            onChange={(e) => f("email", e.target.value)} placeholder="user@company.com" />
        </div>

        <div className="grid-2">
          <div className="form-group">
            <label className="form-label">Role</label>
            <select className="form-control" value={form.role}
              onChange={(e) => f("role", e.target.value)}>
              <option value="PROCUREMENT_OFFICER">Procurement Officer</option>
              <option value="MANAGERIAL_OFFICER">Managerial Officer</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Department</label>
            <input className="form-control" value={form.department}
              onChange={(e) => f("department", e.target.value)} placeholder="e.g. Finance" />
          </div>
        </div>

        <div className="grid-2">
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-control" type="password" value={form.password}
              onChange={(e) => f("password", e.target.value)} placeholder="Min. 8 characters" />
          </div>
          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <input className="form-control" type="password" value={form.password2}
              onChange={(e) => f("password2", e.target.value)} placeholder="Re-enter password" />
          </div>
        </div>
      </Modal>
    </div>
  );
}