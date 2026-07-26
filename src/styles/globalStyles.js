// src/styles/globalStyles.js
// Injected once into <head> by App.jsx on mount.
import T from "./tokens";

const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --navy: ${T.navy}; --navy-dk: ${T.navyDk}; --navy-md: ${T.navyMd};
    --purple: ${T.purple}; --purple-l: ${T.purpleL};
    --orange: ${T.orange}; --orange-d: ${T.orangeD}; --orange-l: ${T.orangeL};
    --white: ${T.white}; --off-white: ${T.offWhite};
    --gray: ${T.gray}; --gray-md: ${T.grayMd}; --gray-dk: ${T.grayDk};
    --success: ${T.success}; --warning: ${T.warning}; --danger: ${T.danger}; --info: ${T.info};
    --font-display: 'Syne', sans-serif;
    --font-body: 'DM Sans', sans-serif;
    --radius: 10px; --radius-lg: 16px; --radius-sm: 6px;
    --shadow: 0 2px 16px rgba(33,28,90,0.10);
    --shadow-lg: 0 8px 32px rgba(33,28,90,0.16);
    --transition: 0.18s cubic-bezier(.4,0,.2,1);
  }
  body { font-family: var(--font-body); background: var(--off-white); color: var(--navy); }
  h1,h2,h3,h4,h5,h6 { font-family: var(--font-display); }
  input, select, textarea, button { font-family: var(--font-body); }
  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--purple); border-radius: 99px; }

  /* ── Sidebar ── */
  .sidebar { width: 200px; min-height: 100vh; background: var(--navy-dk);
    display: flex; flex-direction: column; position: fixed; left: 0; top: 0; bottom: 0;
    z-index: 100; transition: width var(--transition); overflow: hidden; }
  .sidebar.collapsed { width: 64px; }
  .sidebar-logo { display: flex; align-items: center; gap: 12px; padding: 16px 14px;
    border-bottom: 1px solid rgba(114,110,158,0.25); min-height: 68px;
    overflow: hidden; flex-shrink: 0; }
  .sidebar-section { font-size: 0.68rem; font-weight: 700; letter-spacing: 0.14em;
    color: var(--purple-l); text-transform: uppercase; padding: 18px 16px 6px;
    white-space: nowrap; }
  .sidebar-nav { flex: 1; padding: 6px 0; overflow-y: auto; overflow-x: hidden; }
  .nav-item { display: flex; align-items: center; gap: 12px; padding: 11px 16px;
    color: var(--gray-md); cursor: pointer; transition: all var(--transition);
    border-left: 3px solid transparent; white-space: nowrap;
    text-decoration: none; font-size: 0.88rem; font-weight: 500; }
  .nav-item:hover { background: rgba(114,110,158,0.15); color: var(--white); }
  .nav-item.active { background: rgba(241,138,78,0.15); color: var(--orange);
    border-left-color: var(--orange); }
  .nav-item svg { flex-shrink: 0; width: 18px; height: 18px; }
  .nav-item-label { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .sidebar-avatar { width: 32px; height: 32px; border-radius: 50%;
    background: var(--orange); display: flex; align-items: center; justify-content: center;
    font-weight: 700; font-size: 0.85rem; color: white; flex-shrink: 0; }

  /* ── Layout ── */
  .main-layout {
  margin-left: 180px;
  width: calc(100% - 180px);   /* 🔥 THIS FIXES IT */
  transition: margin-left var(--transition);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  }
  .main-layout.collapsed {
    margin-left: 62px;
    width: calc(100% - 62px);   /* 🔥 IMPORTANT */
  }

  /* ── Topbar ── */
  .topbar { height: 64px; background: var(--navy); display: flex; align-items: center;
    justify-content: space-between; padding: 0 28px; position: sticky; top: 0; z-index: 90;
    box-shadow: 0 2px 12px rgba(33,28,90,0.18); }
  .topbar-title { font-family: var(--font-display); font-size: 1.05rem; font-weight: 700;
    color: var(--white); letter-spacing: 0.02em; }
  .topbar-actions { display: flex; align-items: center; gap: 16px; }
  .icon-btn { width: 20px; height: 20px; border-radius: 50%; background: rgba(114,110,158,0.2);
    border: none; cursor: pointer; display: flex; align-items: center; justify-content: center;
    color: var(--white); transition: background var(--transition); position: relative; }
  .icon-btn:hover { background: rgba(241,138,78,0.25); }
  .badge { position: absolute; top: 4px; right: 4px; width: 16px; height: 16px;
    background: var(--orange); border-radius: 50%; font-size: 0.6rem; font-weight: 700;
    color: white; display: flex; align-items: center; justify-content: center; }
  .icon-sm {
  width: 16px;
  height: 16px;
  }

  .icon-md {
    width: 18px;
    height: 18px;
  }

  .icon-lg {
    width: 22px;
    height: 22px;
  }

  /* ── Page content ── */
  .page-content { padding: 28px; flex: 1; }

  /* ── Cards ── */
  .card { background: white; border-radius: var(--radius-lg); box-shadow: var(--shadow); overflow: hidden; }
  .card-header { padding: 18px 24px; border-bottom: 1px solid var(--gray); display: flex;
    align-items: center; justify-content: space-between; }
  .card-body { padding: 24px; }

  /* ── Buttons ── */
  .btn { display: inline-flex; align-items: center; gap: 8px; padding: 9px 20px;
    border-radius: var(--radius); font-family: var(--font-display); font-weight: 600;
    font-size: 0.88rem; cursor: pointer; border: none; transition: all var(--transition);
    letter-spacing: 0.04em; text-transform: uppercase; white-space: nowrap; }
  .btn-primary { background: var(--orange); color: white; }
  .btn-primary:hover { background: var(--orange-d); transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(241,138,78,0.35); }
  .btn-secondary { background: var(--navy); color: white; }
  .btn-secondary:hover { background: var(--navy-md); }
  .btn-outline { background: transparent; color: var(--navy); border: 1.5px solid var(--purple); }
  .btn-outline:hover { background: var(--gray); }
  .btn-danger { background: var(--danger); color: white; }
  .btn-success { background: var(--success); color: white; }
  .btn-ghost { background: transparent; color: var(--gray-dk); padding: 6px 12px; }
  .btn-ghost:hover { background: var(--gray); }
  .btn-sm { padding: 6px 14px; font-size: 0.78rem; }
  .btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

  /* ── Forms ── */
  .form-group { margin-bottom: 18px; }
  .form-label { display: block; font-size: 0.8rem; font-weight: 600; color: var(--navy);
    margin-bottom: 6px; letter-spacing: 0.04em; text-transform: uppercase; }
  .form-control { width: 100%; padding: 10px 14px; border: 1.5px solid var(--gray);
    border-radius: var(--radius-sm); font-size: 0.92rem; color: var(--navy);
    background: white; transition: border-color var(--transition); outline: none; }
  .form-control:focus { border-color: var(--orange); box-shadow: 0 0 0 3px rgba(241,138,78,0.12); }
  select.form-control { cursor: pointer; }
  textarea.form-control { resize: vertical; min-height: 90px; }

  /* ── Table ── */
  .table-wrap { overflow-x: auto; }
  table { width: 100%; border-collapse: collapse; }
  th { padding: 12px 16px; text-align: left; font-size: 0.72rem; font-weight: 700;
    letter-spacing: 0.1em; text-transform: uppercase; color: var(--purple);
    background: var(--off-white); border-bottom: 2px solid var(--gray); white-space: nowrap; }
  td { padding: 13px 16px; font-size: 0.88rem; border-bottom: 1px solid var(--gray); color: var(--navy); }
  tr:hover td { background: rgba(241,138,78,0.04); }
  tr:last-child td { border-bottom: none; }

  /* ── Status badges ── */
  .status-badge { display: inline-flex; align-items: center; gap: 5px; padding: 3px 10px;
    border-radius: 99px; font-size: 0.75rem; font-weight: 600; letter-spacing: 0.04em; }
  .status-DRAFT { background: rgba(113,113,113,0.12); color: #555; }
  .status-SUBMITTED { background: rgba(52,152,219,0.14); color: #1a6fa8; }
  .status-CHANGES_REQUESTED { background: rgba(243,156,18,0.14); color: #b8730e; }
  .status-APPROVED { background: rgba(46,204,113,0.14); color: #1a8a4a; }
  .status-REJECTED { background: rgba(231,76,60,0.14); color: #a93226; }
  .status-SAVED_TO_DB { background: rgba(33,28,90,0.12); color: var(--navy); }

  /* ── Modal ── */
  .modal-overlay { position: fixed; inset: 0; background: rgba(33,28,90,0.55);
    backdrop-filter: blur(4px); z-index: 200; display: flex; align-items: center;
    justify-content: center; padding: 20px; animation: fadeIn 0.18s ease; }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  .modal { background: white; border-radius: var(--radius-lg); box-shadow: var(--shadow-lg);
    width: 100%; max-width: 720px; max-height: 90vh; overflow-y: auto;
    animation: slideUp 0.22s cubic-bezier(.4,0,.2,1); }
  .modal-lg { max-width: 960px; }
  @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  .modal-header { padding: 20px 24px; border-bottom: 1px solid var(--gray);
    display: flex; align-items: center; justify-content: space-between;
    background: var(--navy); color: white;
    border-radius: var(--radius-lg) var(--radius-lg) 0 0; }
  .modal-header h3 { font-family: var(--font-display); font-size: 1.05rem; font-weight: 700; }
  .modal-body { padding: 24px; }
  .modal-footer { padding: 16px 24px; border-top: 1px solid var(--gray);
    display: flex; gap: 10px; justify-content: flex-end; background: var(--off-white);
    border-radius: 0 0 var(--radius-lg) var(--radius-lg); }

  /* ── Toast ── */
  .toast-container { position: fixed; bottom: 24px; right: 24px; z-index: 500;
    display: flex; flex-direction: column; gap: 10px; }
  .toast { background: var(--navy); color: white; padding: 12px 18px;
    border-radius: var(--radius); box-shadow: var(--shadow-lg);
    display: flex; align-items: center; gap: 10px; font-size: 0.88rem;
    min-width: 280px; max-width: 380px;
    animation: slideInRight 0.25s cubic-bezier(.4,0,.2,1);
    border-left: 4px solid var(--orange); }
  .toast.success { border-left-color: var(--success); }
  .toast.error   { border-left-color: var(--danger);  }
  .toast.warning { border-left-color: var(--warning); }
  @keyframes slideInRight {
    from { transform: translateX(60px); opacity: 0; }
    to   { transform: translateX(0);    opacity: 1; }
  }

  /* ── Stat cards ── */
  .stat-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 18px; margin-bottom: 28px; }
  .stat-card { background: white; border-radius: var(--radius-lg); padding: 20px 22px;
    box-shadow: var(--shadow); border-top: 4px solid var(--orange);
    position: relative; overflow: hidden; }
  .stat-card::after { content: ''; position: absolute; right: -16px; top: -16px;
    width: 72px; height: 72px; border-radius: 50%; background: rgba(241,138,78,0.08); }
  .stat-card-label { font-size: 0.72rem; font-weight: 700; letter-spacing: 0.1em;
    text-transform: uppercase; color: var(--purple); margin-bottom: 8px; }
  .stat-card-value { font-family: var(--font-display); font-size: 1.8rem;
    font-weight: 800; color: var(--navy); line-height: 1; }
  .stat-card-sub { font-size: 0.78rem; color: var(--gray-dk); margin-top: 4px; }

  /* ── Notification panel ── */
  .notif-panel { position: absolute; top: 50px; right: 0; width: 340px; background: white;
    border-radius: var(--radius-lg); box-shadow: var(--shadow-lg); z-index: 300;
    animation: slideUp 0.18s ease; overflow: hidden; max-height: 480px;
    display: flex; flex-direction: column; }
  .notif-header { padding: 14px 18px; background: var(--navy); color: white;
    font-family: var(--font-display); font-size: 0.9rem; font-weight: 700;
    display: flex; justify-content: space-between; align-items: center; }
  .notif-list { overflow-y: auto; flex: 1; }
  .notif-item { padding: 12px 18px; border-bottom: 1px solid var(--gray);
    cursor: pointer; transition: background var(--transition); }
  .notif-item:hover { background: var(--off-white); }
  .notif-item.unread { background: rgba(241,138,78,0.05); border-left: 3px solid var(--orange); }
  .notif-item-title { font-size: 0.82rem; font-weight: 600; color: var(--navy); margin-bottom: 3px; }
  .notif-item-msg   { font-size: 0.78rem; color: var(--gray-dk); line-height: 1.4; }
  .notif-item-time  { font-size: 0.7rem; color: var(--purple); margin-top: 4px; }

  /* ── PO Preview / print ── */
  .po-preview { padding: 32px; background: white; }
  .po-preview-header { display: flex; justify-content: space-between; align-items: flex-start;
    margin-bottom: 32px; padding-bottom: 20px; border-bottom: 3px solid var(--navy); }
  .po-preview-title  { font-family: var(--font-display); font-size: 2rem; font-weight: 800; color: var(--navy); }
  .po-preview-number { font-size: 1rem; color: var(--purple); margin-top: 4px; }
  .po-meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 28px; }
  .po-meta-box { padding: 16px; background: var(--off-white); border-radius: var(--radius); }
  .po-meta-box-title { font-size: 0.72rem; font-weight: 700; letter-spacing: 0.1em;
    text-transform: uppercase; color: var(--purple); margin-bottom: 10px; }
  .po-total-row  { display: flex; justify-content: flex-end; }
  .po-total-box  { width: 260px; }
  .po-total-line { display: flex; justify-content: space-between; padding: 6px 0;
    font-size: 0.88rem; border-bottom: 1px solid var(--gray); }
  .po-total-line.grand { font-family: var(--font-display); font-weight: 800;
    font-size: 1.05rem; color: var(--navy); border-bottom: none; padding-top: 10px; }

  /* ── Search bar ── */
  .search-bar { display: flex; align-items: center; background: white;
    border: 1.5px solid var(--gray); border-radius: var(--radius); overflow: hidden; }
  .search-bar input { flex: 1; padding: 9px 14px; border: none; outline: none;
    font-size: 0.9rem; color: var(--navy); background: transparent; }
  .search-bar-btn { padding: 9px 16px; background: var(--orange); border: none;
    cursor: pointer; color: white; transition: background var(--transition); }
  .search-bar-btn:hover { background: var(--orange-d); }

  /* ── Filter row ── */
  .filter-row { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 18px; }
  .filter-row select,
  .filter-row input[type=date] { padding: 8px 12px; border: 1.5px solid var(--gray);
    border-radius: var(--radius-sm); font-size: 0.85rem; color: var(--navy);
    background: white; outline: none; cursor: pointer; }
  .filter-row select:focus,
  .filter-row input[type=date]:focus { border-color: var(--orange); }

  /* ── Change log ── */
  .change-log-item { display: flex; gap: 12px; padding: 12px 0; border-bottom: 1px solid var(--gray); }
  .change-log-dot   { width: 10px; height: 10px; border-radius: 50%; background: var(--orange);
    flex-shrink: 0; margin-top: 4px; }
  .change-log-field { font-size: 0.78rem; font-weight: 700; color: var(--navy);
    text-transform: uppercase; letter-spacing: 0.06em; }
  .change-log-vals  { font-size: 0.82rem; color: var(--gray-dk); margin-top: 2px; }
  .change-log-who   { font-size: 0.75rem; color: var(--purple); margin-top: 3px; }

  /* ── Tabs ── */
  .tabs { display: flex; gap: 0; border-bottom: 2px solid var(--gray); margin-bottom: 24px; }
  .tab { padding: 10px 20px; font-family: var(--font-display); font-size: 0.85rem;
    font-weight: 600; color: var(--purple); cursor: pointer;
    border-bottom: 3px solid transparent; margin-bottom: -2px;
    transition: all var(--transition); letter-spacing: 0.04em; }
  .tab.active { color: var(--orange); border-bottom-color: var(--orange); }
  .tab:hover  { color: var(--navy); }

  /* ── Empty state ── */
  .empty-state { text-align: center; padding: 60px 20px; color: var(--gray-dk); }
  .empty-state svg { opacity: 0.3; margin-bottom: 16px; }
  .empty-state h3  { font-family: var(--font-display); font-size: 1.1rem;
    color: var(--navy); margin-bottom: 8px; }

  /* ── Loader ── */
  .loader { display: inline-block; border: 3px solid rgba(241,138,78,0.3);
    border-top-color: var(--orange); border-radius: 50%;
    animation: spin 0.7s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* ── Login page ── */
  .login-page { min-height: 100vh; background: var(--navy-dk); display: flex;
    align-items: center; justify-content: center; position: relative; overflow: hidden; }
  .login-page::before { content: ''; position: absolute; width: 500px; height: 500px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(241,138,78,0.15) 0%, transparent 70%);
    top: -100px; right: -100px; }
  .login-page::after  { content: ''; position: absolute; width: 400px; height: 400px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(114,110,158,0.2) 0%, transparent 70%);
    bottom: -80px; left: -80px; }
  .login-card { background: white; border-radius: 20px; padding: 44px 48px;
    width: 100%; max-width: 440px; box-shadow: 0 24px 64px rgba(0,0,0,0.4);
    position: relative; z-index: 1; }
  .login-logo { text-align: center; margin-bottom: 32px; }
  .login-logo-icon { width: 64px; height: 64px; background: var(--navy);
    border-radius: 16px; display: flex; align-items: center; justify-content: center;
    margin: 0 auto 12px; }
  .login-logo h1 { font-family: var(--font-display); font-size: 1.6rem;
    font-weight: 800; color: var(--navy); }
  .login-logo p  { font-size: 0.85rem; color: var(--gray-dk); margin-top: 4px; }

  /* ── Grid helpers ── */
  .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; }

  /* ── Line items table (form) ── */
  .line-items-table { width: 100%; border-collapse: collapse; margin-top: 12px; }
  .line-items-table th { background: var(--navy); color: white; padding: 9px 12px;
    font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; }
  .line-items-table td { padding: 8px 10px; border-bottom: 1px solid var(--gray); }
  .line-items-table input { width: 100%; padding: 6px 8px; border: 1px solid var(--gray);
    border-radius: 4px; font-size: 0.85rem; }
  .line-items-table input:focus { outline: none; border-color: var(--orange); }
  .add-line-btn { margin-top: 10px; font-size: 0.8rem; padding: 6px 14px; }

  /* ── Responsive ── */
  @media (max-width: 768px) {
    .sidebar { width: 64px; }
    .main-layout { margin-left: 64px; }
    .grid-2, .grid-3 { grid-template-columns: 1fr; }
    .stat-grid { grid-template-columns: 1fr 1fr; }
  }
`;

export default GLOBAL_CSS;