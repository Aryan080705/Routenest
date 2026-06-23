import React, { useEffect, useState, useMemo, useCallback, Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Link, NavLink, useNavigate, Navigate } from "react-router-dom";
import "./App.css";
import { I18nProvider, useI18n } from "./i18n";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { api } from "./lib/api";
import { getSocket } from "./lib/socket";

// Leaflet loaded lazily — only when user visits /planner
let _leafletLoaded = false;
let _MapContainer, _TileLayer, _Marker, _Polyline, _Popup, _useMap, _L;

async function loadLeaflet() {
  if (_leafletLoaded) return;
  const [RL, L] = await Promise.all([
    import("react-leaflet"),
    import("leaflet"),
  ]);
  await import("leaflet/dist/leaflet.css");
  _MapContainer = RL.MapContainer;
  _TileLayer = RL.TileLayer;
  _Marker = RL.Marker;
  _Polyline = RL.Polyline;
  _Popup = RL.Popup;
  _useMap = RL.useMap;
  _L = L.default;
  // fix leaflet icon
  delete _L.Icon.Default.prototype._getIconUrl;
  _L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  });
  _leafletLoaded = true;
}

// ─── Toast ───
const ToastCtx = React.createContext(null);
function ToastProvider({ children }) {
  const [t, setT] = useState(null);
  const show = useCallback((msg, type = "info") => { setT({ msg, type }); setTimeout(() => setT(null), 2800); }, []);
  return <ToastCtx.Provider value={show}>{children}{t && <div data-testid="toast" className={`toast ${t.type === "error" ? "error" : ""}`}>{t.msg}</div>}</ToastCtx.Provider>;
}
const useToast = () => React.useContext(ToastCtx);

// ─── Header ───
function Header() {
  const { t, lang, setLang, languages } = useI18n();
  const { theme, toggle } = useTheme();
  const { user, logout } = useAuth();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!user) { setUnread(0); return; }
    const load = () => api.get(`/api/notifications/unread-count/${user.id}`).then(r => setUnread(r.data.unreadCount)).catch(() => {});
    load();
    const id = setInterval(load, 60000); // reduced from 15s → 60s for mobile performance
    return () => clearInterval(id);
  }, [user]);

  return (
    <header className="hdr">
      <div className="container hdr-row">
        <Link to="/" className="brand" data-testid="brand-link"><span className="brand-dot" />{t("appName")}</Link>
        <nav className="nav">
          <NavLink to="/" end data-testid="nav-home">{t("nav.home")}</NavLink>
          <NavLink to="/planner" data-testid="nav-planner">{t("nav.planner")}</NavLink>
          <NavLink to="/community" data-testid="nav-community">{t("nav.community")}</NavLink>
          <NavLink to="/reviews" data-testid="nav-reviews">{t("nav.reviews")}</NavLink>
          {user && <NavLink to="/notifications" data-testid="nav-notifications">{t("nav.notifications")}{unread > 0 && <span style={{ marginLeft: 6, background: "var(--accent)", color: "white", padding: "1px 7px", borderRadius: 999, fontSize: 11 }}>{unread}</span>}</NavLink>}
          {user && <NavLink to="/profile" data-testid="nav-profile">{t("nav.profile")}</NavLink>}
          {user && <NavLink to="/moderation" data-testid="nav-moderation">{t("nav.admin")}</NavLink>}
        </nav>
        <div className="hdr-right">
          <select className="lang-sel" value={lang} onChange={e => setLang(e.target.value)} data-testid="lang-selector">
            {languages.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
          </select>
          <button className="icon-btn" onClick={toggle} title="Toggle theme" data-testid="theme-toggle">{theme === "dark" ? "☀" : "☾"}</button>
          {user ? (
            <>
              <Link to="/settings" className="icon-btn" data-testid="nav-settings">⚙</Link>
              <button className="btn" onClick={logout} data-testid="logout-btn">{t("nav.logout")}</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn" data-testid="nav-login">{t("nav.login")}</Link>
              <Link to="/register" className="btn btn-primary" data-testid="nav-register">{t("nav.register")}</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

// ─── Home ───
function Home() {
  const { t } = useI18n();
  return (
    <>
      <section className="hero container">
        <div>
          <h1>{t("home.hero").split(" ").slice(0, -2).join(" ")} <em>{t("home.hero").split(" ").slice(-2).join(" ")}</em></h1>
          <p>{t("home.sub")}</p>
          <div className="hero-actions">
            <Link to="/planner" className="btn btn-primary" data-testid="home-cta-planner">{t("home.cta")}</Link>
            <Link to="/community" className="btn" data-testid="home-cta-community">{t("home.cta2")}</Link>
          </div>
        </div>
        <div className="hero-art" style={{ background: "linear-gradient(135deg, color-mix(in srgb, var(--primary) 15%, transparent), transparent)" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%", height: "100%", justifyContent: "center", alignItems: "center", textAlign: "center" }}>
            <div style={{ padding: "20px", background: "var(--bg)", borderRadius: 16, boxShadow: "0 10px 30px rgba(0,0,0,0.1)", marginBottom: 12, width: "80%" }}>
              <h2 style={{ fontSize: "2.5rem", margin: 0, color: "var(--primary)" }}>50K+</h2>
              <p style={{ margin: 0, fontWeight: 600, color: "var(--muted)" }}>{t("home.activeTravelers")}</p>
            </div>
            <div style={{ padding: "20px", background: "var(--bg)", borderRadius: 16, boxShadow: "0 10px 30px rgba(0,0,0,0.1)", width: "80%" }}>
              <h2 style={{ fontSize: "2.5rem", margin: 0, color: "var(--accent)" }}>10K+</h2>
              <p style={{ margin: 0, fontWeight: 600, color: "var(--muted)" }}>{t("home.routesPlanned")}</p>
            </div>
          </div>
        </div>
      </section>
      
      <section className="section container">
        <h2>{t("home.featuresTitle")}</h2>
        <div className="grid-3">
          {[1, 2, 3].map(i => (
            <div className="feat" key={i}>
              <div className="feat-num">0{i}</div>
              <h3>{t(`home.f${i}Title`)}</h3>
              <p>{t(`home.f${i}`)}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section container" style={{ marginTop: 20, marginBottom: 80 }}>
        <div style={{ padding: "40px", background: "var(--bg-soft)", borderRadius: 24, textAlign: "center" }}>
          <div style={{ maxWidth: 700, margin: "0 auto" }}>
            <h2 style={{ fontSize: "2.2rem", marginBottom: 20 }}>{t("home.aboutUs")}</h2>
            <p style={{ fontSize: "1.1rem", lineHeight: 1.6, color: "var(--muted)", marginBottom: 30 }}>
              {t("home.aboutText")}
            </p>
            <div className="row" style={{ justifyContent: "center", gap: 16, flexWrap: "wrap" }}>
              <span style={{ padding: "10px 20px", background: "var(--bg)", borderRadius: 999, fontWeight: 600, border: "1px solid color-mix(in srgb, var(--primary) 20%, transparent)" }}>{t("home.globalReach")}</span>
              <span style={{ padding: "10px 20px", background: "var(--bg)", borderRadius: 999, fontWeight: 600, border: "1px solid color-mix(in srgb, var(--accent) 20%, transparent)" }}>{t("home.verifiedUsers")}</span>
              <span style={{ padding: "10px 20px", background: "var(--bg)", borderRadius: 999, fontWeight: 600, border: "1px solid color-mix(in srgb, var(--good) 20%, transparent)" }}>{t("home.realtimeData")}</span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

// ─── Auth pages ───
function LoginPage() {
  const { t } = useI18n(); const { login } = useAuth(); const nav = useNavigate(); const toast = useToast();
  const [email, setEmail] = useState(""); const [pw, setPw] = useState(""); const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault(); setBusy(true);
    try { await login(email, pw); toast(t("success.saved")); nav("/"); }
    catch (err) { toast(err.response?.data?.detail || err.response?.data?.error || t("errors.network"), "error"); }
    finally { setBusy(false); }
  };
  return (
    <div className="container auth-page">
      <div className="card">
        <h1>{t("auth.loginTitle")}</h1>
        <p className="muted" style={{ marginBottom: 24 }}>{t("auth.loginSub")}</p>
        <form onSubmit={submit}>
          <div className="field"><label>{t("auth.email")}</label><input className="input" type="email" required value={email} onChange={e => setEmail(e.target.value)} data-testid="login-email" /></div>
          <div className="field"><label>{t("auth.password")}</label><input className="input" type="password" required value={pw} onChange={e => setPw(e.target.value)} data-testid="login-password" /></div>
          <button className="btn btn-primary" type="submit" disabled={busy} data-testid="login-submit" style={{ width: "100%", marginTop: 6 }}>{busy ? <span className="spinner" /> : t("auth.login")}</button>
        </form>
        <p style={{ marginTop: 18, textAlign: "center" }} className="muted">{t("auth.needAccount")} <Link to="/register">{t("auth.register")}</Link></p>
      </div>
    </div>
  );
}
function RegisterPage() {
  const { t } = useI18n(); const { register } = useAuth(); const nav = useNavigate(); const toast = useToast();
  const [name, setName] = useState(""); const [email, setEmail] = useState(""); const [pw, setPw] = useState(""); const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    if (pw.length < 6) { toast(t("errors.short"), "error"); return; }
    setBusy(true);
    try { await register(name, email, pw); toast(t("success.saved")); nav("/"); }
    catch (err) { toast(err.response?.data?.detail || err.response?.data?.error || t("errors.network"), "error"); }
    finally { setBusy(false); }
  };
  return (
    <div className="container auth-page">
      <div className="card">
        <h1>{t("auth.registerTitle")}</h1>
        <p className="muted" style={{ marginBottom: 24 }}>{t("auth.registerSub")}</p>
        <form onSubmit={submit}>
          <div className="field"><label>{t("auth.name")}</label><input className="input" required value={name} onChange={e => setName(e.target.value)} data-testid="reg-name" /></div>
          <div className="field"><label>{t("auth.email")}</label><input className="input" type="email" required value={email} onChange={e => setEmail(e.target.value)} data-testid="reg-email" /></div>
          <div className="field"><label>{t("auth.password")}</label><input className="input" type="password" required value={pw} onChange={e => setPw(e.target.value)} data-testid="reg-password" /></div>
          <button className="btn btn-primary" type="submit" disabled={busy} data-testid="reg-submit" style={{ width: "100%", marginTop: 6 }}>{busy ? <span className="spinner" /> : t("auth.register")}</button>
        </form>
        <p style={{ marginTop: 18, textAlign: "center" }} className="muted">{t("auth.haveAccount")} <Link to="/login">{t("auth.login")}</Link></p>
      </div>
    </div>
  );
}

// ─── Planner ───
// Smoothly animates map to fit the active route
function FitBounds({ routes, activeId }) {
  const map = _useMap();
  useEffect(() => {
    const r = routes.find(x => x.id === activeId) || routes[0];
    if (r?.path?.length) {
      map.flyToBounds(r.path, { padding: [40, 40], animate: true, duration: 0.8, easeLinearity: 0.5 });
    }
  }, [routes, activeId, map]);
  return null;
}
function PlannerPage() {
  const { t } = useI18n(); const { user } = useAuth(); const toast = useToast();
  const [leafletReady, setLeafletReady] = useState(false);
  const [start, setStart] = useState(""); const [destination, setDestination] = useState("");
  const [waypoints, setWaypoints] = useState([""]);
  const [routes, setRoutes] = useState([]); const [activeId, setActiveId] = useState(null);
  const [busy, setBusy] = useState(false); const [saved, setSaved] = useState([]);
  const [sortBy, setSortBy] = useState("recommended");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const prevRecRef = React.useRef(null);

  // Load Leaflet lazily — only runs once when planner page is visited
  useEffect(() => {
    loadLeaflet().then(() => setLeafletReady(true));
  }, []);

  // Load saved routes: try API first, fall back to localStorage
  const loadSaved = useCallback(() => {
    if (!user) return;
    const lsKey = `routenest_saved_${user.id}`;
    // Immediately show locally cached routes
    try {
      const local = JSON.parse(localStorage.getItem(lsKey) || "[]");
      setSaved(local);
    } catch {}
    // Then sync from server
    api.get(`/api/planner/saved/${user.id}`)
      .then(r => {
        setSaved(r.data);
        try { localStorage.setItem(lsKey, JSON.stringify(r.data)); } catch {}
      })
      .catch(() => {});
  }, [user]);
  useEffect(() => { loadSaved(); }, [loadSaved]);

  const generate = async (e) => {
    e?.preventDefault();
    if (!start || !destination) { toast(t("errors.required"), "error"); return; }
    setBusy(true);
    try {
      const r = await api.post("/api/planner/plan", { start, destination, waypoints: waypoints.filter(Boolean) });
      setRoutes(r.data.routes);
      const rec = r.data.routes.find(x => x.recommended) || r.data.routes[0];
      setActiveId(rec?.id);
      prevRecRef.current = rec?.name;
    } catch (err) { toast(err.response?.data?.detail || err.response?.data?.error || t("errors.network"), "error"); }
    finally { setBusy(false); }
  };

  const refreshSilent = useCallback(async () => {
    if (!start || !destination || routes.length === 0) return;
    try {
      const r = await api.post("/api/planner/plan", { start, destination, waypoints: waypoints.filter(Boolean) });
      setRoutes(r.data.routes);
      const newRec = r.data.routes.find(x => x.recommended);
      if (newRec && prevRecRef.current && newRec.name !== prevRecRef.current) {
        toast(`Traffic changed — recommended route is now "${newRec.name}"`);
        prevRecRef.current = newRec.name;
      } else if (newRec) {
        prevRecRef.current = newRec.name;
      }
    } catch { }
  }, [start, destination, waypoints, routes.length, toast]);

  useEffect(() => {
    if (!autoRefresh || routes.length === 0) return;
    const id = setInterval(refreshSilent, 180000); // reduced from 60s → 3min for mobile performance
    return () => clearInterval(id);
  }, [autoRefresh, routes.length, refreshSilent]);

  const saveCurrent = async () => {
    if (!user) { toast(t("community.verifiedOnly"), "error"); return; }
    const active = routes.find(r => r.id === activeId); if (!active) return;
    const name = prompt(t("planner.saveAs"), `${start} → ${destination}`);
    if (!name) return;
    const lsKey = `routenest_saved_${user.id}`;
    // Optimistically save to localStorage first
    const newEntry = { id: Date.now(), name, start, destination, waypoints, route: active, savedAt: new Date().toISOString() };
    const current = (() => { try { return JSON.parse(localStorage.getItem(lsKey) || "[]"); } catch { return []; } })();
    const updated = [...current, newEntry];
    try { localStorage.setItem(lsKey, JSON.stringify(updated)); } catch {}
    setSaved(updated);
    toast(t("success.saved"));
    // Also try saving to server in background
    api.post(`/api/planner/saved/${user.id}`, { name, start, destination, waypoints, route: active })
      .then(() => loadSaved())
      .catch(() => {});
  };
  const removeSaved = async (id) => {
    if (!user) return;
    const lsKey = `routenest_saved_${user.id}`;
    // Remove locally first (instant feedback)
    const filtered = saved.filter(s => s.id !== id);
    setSaved(filtered);
    try { localStorage.setItem(lsKey, JSON.stringify(filtered)); } catch {}
    // Also try removing from server
    api.delete(`/api/planner/saved/${user.id}/${id}`).catch(() => {});
  };

  const trafficTag = (c) => c.delayMinutes <= 8 ? "tag-low" : c.delayMinutes <= 22 ? "tag-mid" : "tag-high";
  const center = useMemo(() => routes[0]?.path?.[0] || [20.5937, 78.9629], [routes]);

  const formatTime = (mins) => {
    if (!mins || isNaN(mins)) return "0m";
    if (mins < 60) return `${mins}m`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  };

  const sortedRoutes = useMemo(() => {
    const arr = [...routes];
    if (sortBy === "distance") arr.sort((a, b) => a.distanceKm - b.distanceKm);
    else if (sortBy === "time") arr.sort((a, b) => a.etaMinutes - b.etaMinutes);
    else if (sortBy === "traffic") arr.sort((a, b) => a.congestionPct - b.congestionPct);
    else arr.sort((a, b) => (b.recommended === true) - (a.recommended === true));
    return arr;
  }, [routes, sortBy]);

  const ComparisonTable = ({ items, activeId, onPick }) => (
    <div className="card compare-table-wrap" style={{ marginTop: 16, padding: 0, overflowX: "auto" }}>
      <table className="compare-table" data-testid="compare-table">
        <thead>
          <tr>
            <th>{t("planner.compare")}</th>
            <th>{t("planner.distance")}</th>
            <th>{t("planner.eta")}</th>
            <th>{t("planner.congestion")}</th>
            <th>{t("planner.delay")}</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {items.map((r) => (
            <tr key={r.id} className={`compare-row ${r.id === activeId ? "active" : ""} ${r.recommended ? "recommended" : ""}`} onClick={() => onPick(r.id)} data-testid={`compare-row-${r.id}`}>
              <td data-label={t("planner.compare")}>
                <div className="row" style={{ gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                  <strong>{r.name}</strong>
                  {r.recommended && <span className="tag tag-rec" data-testid={`compare-rec-${r.id}`}>{t("planner.recommended")}</span>}
                  {r.highTraffic && <span className="tag tag-high" data-testid={`compare-warn-${r.id}`}>⚠ High Traffic</span>}
                </div>
              </td>
              <td data-label={t("planner.distance")}>{r.distanceKm} km</td>
              <td data-label={t("planner.eta")}>{formatTime(r.etaMinutes)}</td>
              <td data-label={t("planner.congestion")}><span className={`tag ${trafficTag(r)}`} data-testid={`compare-cong-${r.id}`}>{r.congestion}</span></td>
              <td data-label={t("planner.delay")}>+{formatTime(r.delayMinutes)}</td>
              <td>
                <button type="button" className={`btn ${r.id === activeId ? "btn-accent" : ""}`} onClick={(e) => { e.stopPropagation(); onPick(r.id); }} data-testid={`compare-select-${r.id}`} style={{ padding: "6px 14px", fontSize: 13 }}>
                  {r.id === activeId ? "✓" : "Select"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="container">
      <h1 className="page-title">{t("planner.title")}</h1>
      <p className="page-sub">{t("planner.subtitle")}</p>
      <div className="planner-grid">
        <div>
          <form className="card" onSubmit={generate}>
            <div className="field"><label>{t("planner.start")}</label><input className="input" required value={start} onChange={e => setStart(e.target.value)} data-testid="planner-start" placeholder="Mumbai" /></div>
            <div className="field"><label>{t("planner.destination")}</label><input className="input" required value={destination} onChange={e => setDestination(e.target.value)} data-testid="planner-destination" placeholder="Pune" /></div>
            {waypoints.map((w, i) => (
              <div className="field" key={i}>
                <label>{t("planner.waypoint")} {i + 1}</label>
                <input className="input" value={w} onChange={e => setWaypoints(waypoints.map((x, j) => j === i ? e.target.value : x))} data-testid={`planner-waypoint-${i}`} />
              </div>
            ))}
            {waypoints.length < 3 && <button type="button" className="btn btn-ghost" onClick={() => setWaypoints([...waypoints, ""])} data-testid="planner-add-wp">{t("planner.addWaypoint")}</button>}
            <button className="btn btn-primary" type="submit" disabled={busy} data-testid="planner-generate" style={{ width: "100%", marginTop: 12 }}>{busy ? <span className="spinner" /> : t("planner.generate")}</button>
            {routes.length > 0 && (
              <div className="row" style={{ marginTop: 10, gap: 8 }}>
                <button type="button" className="btn" onClick={generate} data-testid="planner-refresh">{t("planner.refreshTraffic")}</button>
                {user && <button type="button" className="btn" onClick={saveCurrent} data-testid="planner-save">{t("planner.save")}</button>}
              </div>
            )}
          </form>
          {saved.length > 0 && (
            <div className="card" style={{ marginTop: 16 }}>
              <h3 style={{ marginTop: 0 }}>{t("planner.saved")}</h3>
              <div className="col">
                {saved.map(s => (
                  <div key={s.id} className="row between" style={{ padding: 8, background: "var(--bg-soft)", borderRadius: 10 }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 4 }}>
                      <button onClick={() => { setStart(s.start); setDestination(s.destination); setRoutes([s.route]); setActiveId(s.route.id); }} className="btn btn-ghost" style={{ padding: 0, textAlign: "left" }}>{s.name}</button>
                      {s.waypoints && s.waypoints.length > 0 && (
                        <div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 500 }}>Via: {s.waypoints.join(", ")}</div>
                      )}
                    </div>
                    <button className="action-btn btn-danger" onClick={() => removeSaved(s.id)} data-testid={`planner-saved-del-${s.id}`}>×</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div>
          <div className="map-wrap">
            {leafletReady && _MapContainer ? (
              <_MapContainer
                center={center}
                zoom={6}
                scrollWheelZoom={true}
                preferCanvas={true}
                tap={true}
                dragging={true}
                touchZoom={true}
                doubleClickZoom={true}
                zoomControl={true}
                attributionControl={false}
              >
                <_TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution="&copy; OpenStreetMap"
                  maxNativeZoom={18}
                  maxZoom={18}
                  keepBuffer={2}
                  updateWhenIdle={true}
                  updateWhenZooming={false}
                />
                {routes.map(r => (
                  <React.Fragment key={r.id}>
                    <_Polyline
                      positions={r.path}
                      pathOptions={{
                        color: r.id === activeId ? "#d44d2a" : "#aaa",
                        weight: r.id === activeId ? 6 : 3,
                        opacity: r.id === activeId ? 1 : 0.5,
                        lineCap: "round",
                        lineJoin: "round",
                      }}
                      eventHandlers={{ click: () => setActiveId(r.id) }}
                    />
                    {r.id === activeId && r.path.length > 0 && (<>
                      <_Marker position={r.path[0]}><_Popup>{t("planner.start")}: {start}</_Popup></_Marker>
                      <_Marker position={r.path[r.path.length - 1]}><_Popup>{t("planner.destination")}: {destination}</_Popup></_Marker>
                    </>)}
                  </React.Fragment>
                ))}
                {routes.length > 0 && <FitBounds routes={routes} activeId={activeId} />}
              </_MapContainer>
            ) : (
              <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-soft)", borderRadius: 16 }}>
                <span className="spinner" style={{ width: 28, height: 28, borderWidth: 3 }} />
              </div>
            )}
          </div>
          {routes.length === 0 ? <div className="empty">{t("planner.noRoutes")}</div> : (
            <>
              <div className="row" style={{ gap: 10, marginTop: 16, flexWrap: "wrap", alignItems: "center" }} data-testid="compare-controls">
                <span className="muted" style={{ fontSize: 13 }}>{t("planner.compare")}:</span>
                {[
                  { k: "recommended", label: t("planner.recommended") },
                  { k: "distance", label: t("planner.distance") },
                  { k: "time", label: t("planner.eta") },
                  { k: "traffic", label: t("planner.congestion") },
                ].map(opt => (
                  <button key={opt.k} onClick={() => setSortBy(opt.k)} data-testid={`sort-${opt.k}`} className={`btn ${sortBy === opt.k ? "btn-primary" : "btn-ghost"}`} style={{ padding: "6px 14px", fontSize: 13 }}>
                    {opt.label}
                  </button>
                ))}
                <div style={{ flex: 1 }} />
                <label className="checkbox" style={{ padding: 0, fontSize: 13 }}>
                  <input type="checkbox" checked={autoRefresh} onChange={(e) => setAutoRefresh(e.target.checked)} data-testid="auto-refresh-toggle" />
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                    <span style={{ width: 8, height: 8, borderRadius: 999, background: autoRefresh ? "var(--good)" : "var(--ink-mute)", boxShadow: autoRefresh ? "0 0 0 4px color-mix(in srgb, var(--good) 25%, transparent)" : "none" }} data-testid="live-indicator" />
                    {t("planner.liveTraffic")}
                  </span>
                </label>
              </div>
              <ComparisonTable items={sortedRoutes} activeId={activeId} onPick={setActiveId} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Community helpers ───
function normalizePost(raw) {
  const p = raw || {};
  const likes = Array.isArray(p.likes) ? p.likes : [];
  const comments = Array.isArray(p.comments) ? p.comments : [];
  return {
    ...p,
    id: p.id,
    title: p.title || "",
    body: p.body || "",
    text: p.text || p.body || "",
    likes,
    comments,
    likeCount: typeof p.likeCount === "number" ? p.likeCount : likes.length,
    commentCount: typeof p.commentCount === "number" ? p.commentCount : comments.length,
    reports: typeof p.reports === "number" ? p.reports : (Array.isArray(p.reports) ? p.reports.length : 0),
  };
}

function CommentBlock({ post, onChange }) {
  const { t } = useI18n(); const { user } = useAuth();
  const [text, setText] = useState(""); const [replyTo, setReplyTo] = useState(null); const [replyText, setReplyText] = useState("");
  const add = async (parentId, val) => {
    if (!user) return; if (!val.trim()) return;
    await api.post(`/api/community/${post.id}/comment`, { text: val, parentId });
    setText(""); setReplyText(""); setReplyTo(null); onChange();
  };
  return (
    <div className="comment-list">
      {(Array.isArray(post.comments) ? post.comments : []).map(c => (
        <div key={c.id} className="comment">
          <div className="comment-author">{c.author} {c.verified && "✓"}</div>
          <div>{c.text}</div>
          {user && <button className="action-btn" onClick={() => setReplyTo(replyTo === c.id ? null : c.id)} data-testid={`reply-btn-${c.id}`}>{t("community.reply")}</button>}
          {replyTo === c.id && (
            <div className="comment-form">
              <input className="input" placeholder={t("community.writeComment")} value={replyText} onChange={e => setReplyText(e.target.value)} data-testid={`reply-input-${c.id}`} />
              <button className="btn btn-primary" onClick={() => add(c.id, replyText)} data-testid={`reply-submit-${c.id}`}>{t("community.post")}</button>
            </div>
          )}
          {Array.isArray(c.replies) && c.replies.length > 0 && (
            <div className="reply-list">
              {c.replies.map(r => (<div key={r.id} className="comment"><div className="comment-author">{r.author} {r.verified && "✓"}</div><div>{r.text}</div></div>))}
            </div>
          )}
        </div>
      ))}
      {user && (
        <div className="comment-form">
          <input className="input" placeholder={t("community.writeComment")} value={text} onChange={e => setText(e.target.value)} data-testid={`comment-input-${post.id}`} />
          <button className="btn btn-primary" onClick={() => add(null, text)} data-testid={`comment-submit-${post.id}`}>{t("community.post")}</button>
        </div>
      )}
    </div>
  );
}

function CommunityPage() {
  const { t } = useI18n(); const { user } = useAuth(); const toast = useToast();
  const [posts, setPosts] = useState([]); const [tab, setTab] = useState("latest"); const [showNew, setShowNew] = useState(false);
  const [np, setNp] = useState({ title: "", body: "", topic: "travel-tips", photo: "" });
  const [editingId, setEditingId] = useState(null);
  const [editDraft, setEditDraft] = useState({ title: "", body: "", topic: "travel-tips", photo: "" });

  const TOPIC_OPTIONS = [
    { value: "routes", labelKey: "topics.routes" },
    { value: "destinations", labelKey: "topics.destinations" },
    { value: "travel-tips", labelKey: "topics.tips" },
  ];
  const topicLabel = (v) => { const opt = TOPIC_OPTIONS.find(o => o.value === v); return opt ? t(opt.labelKey) : v; };

  const load = useCallback(() => {
    const url = tab === "trending" ? "/api/community/trending" : "/api/community";
    api.get(url).then(r => {
      const raw = Array.isArray(r.data) ? r.data : [];
      setPosts(raw.map(normalizePost));
    }).catch(() => {});
  }, [tab]);
  useEffect(() => { load(); }, [load]);

  const create = async () => {
    if (!user) { toast(t("community.verifiedOnly"), "error"); return; }
    if (!np.title || !np.body) { toast(t("errors.required"), "error"); return; }
    try { await api.post("/api/community", np); toast(t("success.posted")); setShowNew(false); setNp({ title: "", body: "", topic: "travel-tips", photo: "" }); load(); }
    catch (err) { toast(err.response?.data?.detail || err.response?.data?.error || t("errors.network"), "error"); }
  };
  const startEdit = (p) => { setEditingId(p.id); setEditDraft({ title: p.title, body: p.body, topic: p.topic, photo: p.photo || "" }); };
  const saveEdit = async (p) => {
    if (!editDraft.title || !editDraft.body) { toast(t("errors.required"), "error"); return; }
    try { await api.patch(`/api/community/${p.id}`, editDraft); toast(t("success.saved")); setEditingId(null); load(); }
    catch (err) { toast(err.response?.data?.detail || err.response?.data?.error || t("errors.network"), "error"); }
  };
  const like = async (p) => {
    if (!user) { toast(t("community.verifiedOnly"), "error"); return; }
    try { await api.post(`/api/community/${p.id}/like`, {}); load(); }
    catch (err) { toast(err.response?.data?.detail || err.response?.data?.error || t("errors.network"), "error"); }
  };
  const report = async (p) => {
    const reason = prompt(t("community.reportReason") + " (spam/abusive/misleading/inappropriate)", "spam");
    if (!reason) return;
    try { await api.post(`/api/community/${p.id}/report`, { reason }); toast(t("success.saved")); }
    catch { toast(t("errors.network"), "error"); }
  };
  const share = async (p, platform) => {
    try {
      await api.post(`/api/community/${p.id}/share`, { platform });
      const url = window.location.origin + `/community#post-${p.id}`;
      const text = encodeURIComponent(p.title);
      const links = { twitter: `https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(url)}`, facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, whatsapp: `https://wa.me/?text=${text}%20${encodeURIComponent(url)}`, instagram: `https://www.instagram.com/?url=${encodeURIComponent(url)}` };
      if (links[platform]) window.open(links[platform], "_blank");
      load();
    } catch { toast(t("errors.network"), "error"); }
  };
  const del = async (p) => { if (!window.confirm(t("community.delete") + "?")) return; await api.delete(`/api/community/${p.id}`); load(); };

  return (
    <div className="container">
      <div className="row between" style={{ marginBottom: 8 }}>
        <h1 className="page-title">{t("community.title")}</h1>
        {user && user.verified && <button className="btn btn-primary" onClick={() => setShowNew(!showNew)} data-testid="new-post-btn">{t("community.new")}</button>}
        {user && !user.verified && <span className="muted" style={{ fontSize: 13, background: "var(--bg-soft)", padding: "6px 12px", borderRadius: 8 }}>{t("community.verifiedOnlyShort")}</span>}
      </div>
      <div className="tabs">
        <button className={`tab ${tab === "latest" ? "active" : ""}`} onClick={() => setTab("latest")} data-testid="tab-latest">{t("community.latest")}</button>
        <button className={`tab ${tab === "trending" ? "active" : ""}`} onClick={() => setTab("trending")} data-testid="tab-trending">{t("community.trending")}</button>
        <button className={`tab ${tab === "forums" ? "active" : ""}`} onClick={() => setTab("forums")} data-testid="tab-forums">{t("community.forums")}</button>
      </div>
      {tab === "forums" ? (
        <ForumsPanel />
      ) : (<>
        {showNew && (
          <div className="card" style={{ marginBottom: 20 }}>
            <div className="field"><label>{t("community.postTitle")}</label><input className="input" value={np.title} onChange={e => setNp({ ...np, title: e.target.value })} data-testid="np-title" /></div>
            <div className="field"><label>{t("community.topic")}</label>
              <select className="input" value={np.topic} onChange={e => setNp({ ...np, topic: e.target.value })} data-testid="np-topic">
                {TOPIC_OPTIONS.map(o => <option key={o.value} value={o.value}>{t(o.labelKey)}</option>)}
              </select>
            </div>
            <div className="field"><label>{t("community.postBody")}</label><textarea className="input" rows={4} value={np.body} onChange={e => setNp({ ...np, body: e.target.value })} data-testid="np-body" /></div>
            <div className="field"><label>{t("community.photo")}</label><input className="input" value={np.photo} onChange={e => setNp({ ...np, photo: e.target.value })} data-testid="np-photo" /></div>
            <button className="btn btn-primary" onClick={create} data-testid="np-submit">{t("community.post")}</button>
          </div>
        )}
        {posts.length === 0 ? <div className="empty">{t("community.noPosts")}</div> : posts.map((p, idx) => {
          const isTopTrending = tab === "trending" && idx < 3;
          const borderStyle = idx === 0 ? '#ffd700' : idx === 1 ? '#c0c0c0' : '#cd7f32';
          const bgGlow = idx === 0 ? 'rgba(255,215,0,0.05)' : idx === 1 ? 'rgba(192,192,192,0.05)' : 'rgba(205,127,50,0.05)';
          return (
          <div className="card post" key={p.id} id={`post-${p.id}`} data-testid={`post-${p.id}`} style={isTopTrending ? { border: `2px solid ${borderStyle}`, background: `linear-gradient(to bottom right, var(--bg-elev), ${bgGlow})`, position: 'relative', overflow: 'hidden' } : {}}>
            {isTopTrending && (
              <div style={{ position: "absolute", top: 0, right: 0, background: idx === 0 ? "linear-gradient(135deg, #ffd700, #ff8c00)" : idx === 1 ? "linear-gradient(135deg, #e6e6e6, #999)" : "linear-gradient(135deg, #ffb347, #cc5500)", color: "#111", padding: "6px 16px", borderBottomLeftRadius: 16, fontWeight: 800, fontSize: 13, boxShadow: "-2px 2px 10px rgba(0,0,0,0.2)", zIndex: 10 }}>
                🔥 Trending #{idx + 1}
              </div>
            )}
            <div className="post-head">
              <div className="avatar-fallback" data-testid={`post-avatar-${p.id}`}>{(p.author || "?").trim().split(" ").map(s => s[0]).join("").slice(0, 2).toUpperCase()}</div>
              <div style={{ flex: 1 }}>
                <div><strong data-testid={`post-author-${p.id}`}>{p.author}</strong> {p.verified && <span style={{ color: "var(--good)" }}>✓</span>}</div>
                <div className="post-meta" data-testid={`post-time-${p.id}`}>{new Date(p.createdAt).toLocaleString()}{p.updatedAt && ` · edited`}</div>
              </div>
              <span className="post-topic" data-testid={`post-topic-${p.id}`}>{topicLabel(p.topic)}</span>
            </div>
            {editingId === p.id ? (
              <div className="col">
                <div className="field"><label>{t("community.postTitle")}</label><input className="input" value={editDraft.title} onChange={e => setEditDraft({ ...editDraft, title: e.target.value })} data-testid={`edit-title-${p.id}`} /></div>
                <div className="field"><label>{t("community.topic")}</label>
                  <select className="input" value={editDraft.topic} onChange={e => setEditDraft({ ...editDraft, topic: e.target.value })} data-testid={`edit-topic-${p.id}`}>
                    {TOPIC_OPTIONS.map(o => <option key={o.value} value={o.value}>{t(o.labelKey)}</option>)}
                  </select>
                </div>
                <div className="field"><label>{t("community.postBody")}</label><textarea className="input" rows={4} value={editDraft.body} onChange={e => setEditDraft({ ...editDraft, body: e.target.value })} data-testid={`edit-body-${p.id}`} /></div>
                <div className="field"><label>{t("community.photo")}</label><input className="input" value={editDraft.photo} onChange={e => setEditDraft({ ...editDraft, photo: e.target.value })} data-testid={`edit-photo-${p.id}`} /></div>
                <div className="row" style={{ gap: 8 }}>
                  <button className="btn btn-primary" onClick={() => saveEdit(p)} data-testid={`edit-save-${p.id}`}>{t("common.save") || t("settings.saveProfile")}</button>
                  <button className="btn btn-ghost" onClick={() => setEditingId(null)} data-testid={`edit-cancel-${p.id}`}>×</button>
                </div>
              </div>
            ) : (
              <>
                <h3>{p.title}</h3>
                <p style={{ color: "var(--ink-soft)" }}>{p.body}</p>
                {p.photo && <img src={p.photo} alt="" className="post-photo" loading="lazy" decoding="async" />}
              </>
            )}
            <div className="post-actions">
              <button className={`action-btn ${user && Array.isArray(p.likes) && p.likes.includes(user.id) ? "liked" : ""}`} onClick={() => like(p)} data-testid={`like-${p.id}`}>♥ <span data-testid={`like-count-${p.id}`}>{p.likeCount}</span></button>
              <button className="action-btn" data-testid={`comment-count-${p.id}`}>💬 {p.commentCount}</button>
              <button className="action-btn" onClick={() => share(p, "twitter")} data-testid={`share-tw-${p.id}`}>↗ Twitter</button>
              <button className="action-btn" onClick={() => share(p, "whatsapp")} data-testid={`share-wa-${p.id}`}>↗ WhatsApp</button>
              <button className="action-btn" onClick={() => share(p, "facebook")} data-testid={`share-fb-${p.id}`}>↗ Facebook</button>
              <button className="action-btn" onClick={() => share(p, "instagram")} data-testid={`share-ig-${p.id}`}>↗ Instagram</button>
              {user && <button className="action-btn" onClick={() => report(p)} data-testid={`report-${p.id}`}>⚑ {t("community.report")}</button>}
              {user && p.authorId === user.id && editingId !== p.id && <button className="action-btn" onClick={() => startEdit(p)} data-testid={`edit-${p.id}`}>✎ {t("reviews.edit")}</button>}
              {user && p.authorId === user.id && <button className="action-btn btn-danger" onClick={() => del(p)} data-testid={`delete-${p.id}`}>{t("community.delete")}</button>}
            </div>
            <CommentBlock post={p} onChange={load} />
          </div>
          );
        })}
      </>)}
    </div>
  );
}

// ─── Forums ───
function ForumsPanel() {
  const { t } = useI18n();
  const [forums, setForums] = useState([]);
  const [selected, setSelected] = useState(null);
  const FALLBACK_EMOJI = { routes: "🛣️", "travel-tips": "✈️", destinations: "🗺️" };

  useEffect(() => { api.get("/api/forums").then(r => setForums(r.data)).catch(() => {}); }, []);

  const activeForum = selected ? forums.find(f => f.slug === selected) : null;

  if (activeForum) {
    return (
      <div data-testid="forums-topics-view">
        <button className="btn btn-ghost" onClick={() => setSelected(null)} data-testid="forums-back-btn" style={{ marginBottom: 14 }}>{t("forums.backToCategories")}</button>
        <div className="card">
          <div className="row" style={{ gap: 12, alignItems: "center", marginBottom: 4 }}>
            <span style={{ fontSize: 28 }}>{activeForum.emoji || FALLBACK_EMOJI[activeForum.slug] || "💬"}</span>
            <div>
              <h2 style={{ margin: 0, fontFamily: "Fraunces, serif" }}>{t(`forumsList.${activeForum.slug}.title`, activeForum.title)}</h2>
              <div className="muted" style={{ fontSize: 13 }}>{t(`forumsList.${activeForum.slug}.description`, activeForum.description)}</div>
            </div>
          </div>
          <div style={{ marginTop: 18 }}>
            {(activeForum.topics || []).length === 0 ? (
              <div className="empty">{t("forums.noTopics")}</div>
            ) : activeForum.topics.map((tp) => (
              <div key={tp.id} data-testid={`forum-topic-${tp.slug}`} style={{ padding: "14px 0", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between", gap: 16, alignItems: "center" }}>
                <div><strong>{t(`forumsList.${activeForum.slug}.topics.${tp.slug}.title`, tp.title)}</strong><div className="muted" style={{ fontSize: 13 }}>{t(`forumsList.${activeForum.slug}.topics.${tp.slug}.description`, tp.description)}</div></div>
                <span className="post-topic">{tp.postsCount || 0} {t("forums.posts")}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid-3" data-testid="forums-categories-grid">
      {forums.map(f => (
        <button key={f.id} className="feat" onClick={() => setSelected(f.slug)} data-testid={`forum-card-${f.slug}`}
          style={{ textAlign: "left", cursor: "pointer", border: "1px solid var(--border)", background: "var(--bg-elev)", color: "var(--ink)", transition: "transform .15s ease, border-color .15s ease" }}
          onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.borderColor = "var(--accent)"; }}
          onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.borderColor = "var(--border)"; }}
        >
          <div style={{ fontSize: 40, lineHeight: 1 }}>{f.emoji || FALLBACK_EMOJI[f.slug] || "💬"}</div>
          <h3 style={{ marginTop: 12 }}>{t(`forumsList.${f.slug}.title`, f.title)}</h3>
          <p>{t(`forumsList.${f.slug}.description`, f.description)}</p>
          <div className="muted" style={{ fontSize: 13, marginTop: 8 }}><strong style={{ color: "var(--accent)" }}>{f.topicCount ?? (f.topics || []).length}</strong>{" "}{t("forums.topics")}</div>
        </button>
      ))}
    </div>
  );
}

function ForumsPage() {
  const { t } = useI18n();
  return (
    <div className="container">
      <h1 className="page-title">{t("forums.title")}</h1>
      <p className="page-sub">{t("forums.subtitle")}</p>
      <ForumsPanel />
    </div>
  );
}

// ─── Reviews ───
function ReviewsPage() {
  const { t } = useI18n(); const { user } = useAuth(); const toast = useToast();
  const [items, setItems] = useState([]); const [stats, setStats] = useState({ averageRating: 0, total: 0 });
  const [form, setForm] = useState({ route: "", journeyId: "", rating: 5, text: "", completedJourney: true });
  const [editing, setEditing] = useState(null); const [editText, setEditText] = useState(""); const [editRating, setEditRating] = useState(5);
  const load = useCallback(() => { api.get("/api/reviews").then(r => setItems(r.data)); api.get("/api/reviews/stats").then(r => setStats(r.data)); }, []);
  useEffect(() => { load(); }, [load]);
  const submit = async (e) => {
    e.preventDefault();
    if (!user) { toast(t("community.verifiedOnly"), "error"); return; }
    if (form.text.length < 30) { toast(t("errors.required"), "error"); return; }
    try { await api.post("/api/reviews", form); toast(t("success.reviewed")); setForm({ route: "", journeyId: "", rating: 5, text: "", completedJourney: true }); load(); }
    catch (err) { toast(err.response?.data?.detail || err.response?.data?.error || t("errors.network"), "error"); }
  };
  const helpful = async (r) => { if (!user) return; await api.post(`/api/reviews/${r.id}/helpful`, {}); load(); };
  const report = async (r) => { await api.post(`/api/reviews/${r.id}/report`, {}); toast(t("success.saved")); load(); };
  const saveEdit = async (r) => {
    try { await api.patch(`/api/reviews/${r.id}`, { text: editText, rating: editRating }); setEditing(null); load(); toast(t("success.saved")); }
    catch (err) { toast(err.response?.data?.detail || err.response?.data?.error || t("errors.network"), "error"); }
  };
  const canEdit = (r) => user && (r.userId === user.id || r.user === user.name) && (Date.now() - new Date(r.createdAt).getTime()) < 24 * 3600 * 1000;
  const Stars = ({ n }) => <span className="stars">{"★".repeat(n)}{"☆".repeat(5 - n)}</span>;

  return (
    <div className="container">
      <h1 className="page-title">{t("reviews.title")}</h1>
      <p className="page-sub">{t("reviews.subtitle")}</p>
      <div className="split">
        <div className="card">
          <div style={{ fontSize: 56, fontFamily: "Fraunces, serif", lineHeight: 1 }}>{stats.averageRating?.toFixed(1)}</div>
          <Stars n={Math.round(stats.averageRating)} />
          <div className="muted">{t("reviews.basedOn", { n: stats.total })}</div>
        </div>
        {user && (
          <form className="card" onSubmit={submit}>
            <h3 style={{ marginTop: 0 }}>{t("reviews.write")}</h3>
            <div className="field"><label>{t("reviews.route")}</label><input className="input" required value={form.route} onChange={e => setForm({ ...form, route: e.target.value })} data-testid="rev-route" /></div>
            <div className="field"><label>{t("reviews.journeyId")}</label><input className="input" required value={form.journeyId} onChange={e => setForm({ ...form, journeyId: e.target.value })} data-testid="rev-journey" /></div>
            <div className="field"><label>{t("reviews.rating")}</label>
              <div className="rating-input">{[1, 2, 3, 4, 5].map(n => <button key={n} type="button" className={n <= form.rating ? "on" : ""} onClick={() => setForm({ ...form, rating: n })} data-testid={`rev-star-${n}`}>★</button>)}</div>
            </div>
            <div className="field"><label>{t("reviews.text")}</label><textarea className="input" rows={4} value={form.text} onChange={e => setForm({ ...form, text: e.target.value })} data-testid="rev-text" /></div>
            <label className="checkbox"><input type="checkbox" checked={form.completedJourney} onChange={e => setForm({ ...form, completedJourney: e.target.checked })} data-testid="rev-completed" />{t("reviews.completed")}</label>
            <button className="btn btn-primary" type="submit" data-testid="rev-submit" style={{ width: "100%", marginTop: 8 }}>{t("reviews.submit")}</button>
          </form>
        )}
      </div>
      <div className="card" style={{ marginTop: 20 }}>
        {items.length === 0 ? <div className="empty">{t("reviews.noReviews")}</div> : items.map(r => (
          <div className="review-card" key={r.id} data-testid={`review-${r.id}`}>
            <div className="review-head">
              <div className="avatar-fallback">{r.user[0]}</div>
              <div style={{ flex: 1 }}>
                <strong data-testid={`review-user-${r.id}`}>{r.user}</strong>{" "}
                {r.verified && <span title="Verified User" style={{ color: "var(--good)", fontSize: 13, fontWeight: 700 }}>⭐</span>}{" "}
                {r.trustedReviewer && (
                  <span data-testid={`review-trusted-${r.id}`} title="Trusted Reviewer" style={{ display: "inline-flex", alignItems: "center", gap: 4, marginLeft: 6, padding: "2px 8px", borderRadius: 999, background: "color-mix(in srgb, var(--warn) 18%, transparent)", color: "var(--warn)", fontSize: 11, fontWeight: 700 }}>⭐ Trusted</span>
                )}
                <div className="muted" style={{ fontSize: 12 }}>{r.route} · {new Date(r.createdAt).toLocaleDateString()}</div>
              </div>
              <Stars n={r.rating} />
            </div>
            {editing === r.id ? (<>
              <div className="field" style={{ marginBottom: 8 }}>
                <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 4, display: "block" }}>{t("reviews.rating")}</label>
                <div className="rating-input">
                  {[1,2,3,4,5].map(n => (
                    <button key={n} type="button" className={n <= editRating ? "on" : ""} onClick={() => setEditRating(n)} data-testid={`rev-edit-star-${r.id}-${n}`}>★</button>
                  ))}
                </div>
              </div>
              <textarea className="input" rows={3} value={editText} onChange={e => setEditText(e.target.value)} data-testid={`rev-edit-text-${r.id}`} />
              <div className="row" style={{ gap: 8 }}>
                <button className="btn btn-primary" onClick={() => saveEdit(r)} data-testid={`rev-edit-save-${r.id}`}>{t("reviews.save")}</button>
                <button className="btn btn-ghost" onClick={() => setEditing(null)}>×</button>
              </div>
            </>) : <p>{r.text}</p>}
            <div className="row" style={{ gap: 6, flexWrap: "wrap" }}>
              <button className="action-btn" onClick={() => helpful(r)} data-testid={`rev-helpful-${r.id}`}>👍 {t("reviews.helpful")} ({r.helpful})</button>
              {canEdit(r) && editing !== r.id && <button className="action-btn" onClick={() => { setEditing(r.id); setEditText(r.text); setEditRating(r.rating); }} data-testid={`rev-edit-${r.id}`}>{t("reviews.edit")}</button>}
              <button className="action-btn" onClick={() => report(r)} data-testid={`rev-report-${r.id}`}>⚑ {t("reviews.reportR")}</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Helper for VAPID key conversion
function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

// ─── Notifications ───
function NotificationsPage() {
  const { t } = useI18n(); const { user } = useAuth(); const toast = useToast();
  const [items, setItems] = useState([]);
  const [prefs, setPrefs] = useState(null);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [pushType, setPushType] = useState(null); // "vapid" | "browser-only"
  const [simOpen, setSimOpen] = useState(false);
  const [logs, setLogs] = useState([]);
  const [logsOpen, setLogsOpen] = useState(false);
  const [emailLog, setEmailLog] = useState([]); // simulated email log

  const SIM_PRESETS = [
    { key: "booking", label: "Simulate Booking", icon: "✓", title: "Booking Confirmed ✓", body: "Test: Your bus booking has been confirmed. Booking ID: #TEST-" + Math.floor(Math.random() * 9999) },
    { key: "cancellation", label: "Simulate Cancellation", icon: "❌", title: "Booking Cancelled ❌", body: "Test: Your bus booking has been cancelled. Refund will be processed within 3-5 days." },
    { key: "scheduleChange", label: "Simulate Delay", icon: "⚠️", title: "Schedule Update ⚠️", body: "Test: Your bus is now delayed by 12 minutes." },
    { key: "journeyReminder", label: "Simulate Reminder", icon: "🚌", title: "Journey Reminder 🚌", body: "Test: Your bus departs in 30 minutes. Head to the boarding gate." },
    { key: "promotional", label: "Simulate Offer", icon: "🎉", title: "Special Offer 🎉", body: "Test: 20% off all routes this week. Code: TEST20" },
    { key: "offers", label: "Simulate Discount", icon: "💰", title: "Flash Discount 💰", body: "Test: 50% off on Ahmedabad to Mumbai route. Limited seats — book now!" },
  ];

  const simulate = async (preset) => {
    setSimOpen(false);
    try {
      const res = await api.post("/api/notifications/send", {
        userId: user.id, type: preset.key, title: preset.title, body: preset.body,
        channels: ["email", "push", "inApp"],
      });
      // Show email delivery confirmation
      if (res.data?.delivery) {
        const emailDelivery = res.data.delivery.find(d => d.channel === "email");
        if (emailDelivery) {
          const entry = { title: preset.title, time: new Date().toLocaleTimeString(), status: emailDelivery.status };
          setEmailLog(prev => [entry, ...prev].slice(0, 5));
          toast(`📧 Email sent: ${preset.title}`, "info");
        }
      }
      // Show browser push notification if enabled
      if (pushEnabled) {
        try {
          const reg = await navigator.serviceWorker?.ready;
          if (reg) {
            await reg.showNotification(preset.title, { body: preset.body, icon: "/favicon.ico", badge: "/favicon.ico", tag: preset.key });
          } else {
            new Notification(preset.title, { body: preset.body, icon: "/favicon.ico" });
          }
        } catch {}
      }
      load();
    } catch (err) { toast(err.response?.data?.detail || err.response?.data?.error || t("errors.network"), "error"); }
  };

  const load = useCallback(() => {
    if (!user) return;
    api.get(`/api/notifications/history/${user.id}?limit=50`).then(r => setItems(r.data.notifications));
    api.get(`/api/notifications/preferences/${user.id}`).then(r => setPrefs(r.data)).catch(() => {});
    api.get(`/api/notifications/delivery-logs/${user.id}`).then(r => setLogs(r.data)).catch(() => {});
  }, [user]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    if (!user) return;
    const sock = getSocket();
    const onNew = (n) => { if (n && n.userId === user.id) { setItems((prev) => [n, ...prev]); load(); } };
    sock.on("notification:new", onNew);
    return () => { sock.off("notification:new", onNew); };
  }, [user, load]);
  useEffect(() => {
    setPushEnabled(typeof Notification !== "undefined" && Notification.permission === "granted");
    // Register service worker on mount
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);

  const markAll = async () => { await api.post("/api/notifications/mark-all-read", { userId: user.id }); load(); };
  const markRead = async (n) => { if (n.read) return; await api.post("/api/notifications/mark-read", { userId: user.id, notificationIds: [n.id] }); load(); };
  const savePrefs = async () => { await api.put(`/api/notifications/preferences/${user.id}`, prefs); toast(t("success.prefs")); };

  const enablePush = async () => {
    if (typeof Notification === "undefined") { toast("Push not supported in this browser", "error"); return; }
    const permission = await Notification.requestPermission();
    if (permission !== "granted") { toast("Permission denied", "error"); return; }

    setPushEnabled(true);
    let subscribed = false;

    // Try real VAPID push first
    try {
      const vapidRes = await api.get("/api/notifications/vapid-public-key");
      const vapidKey = vapidRes.data?.publicKey;

      if (vapidKey && "serviceWorker" in navigator) {
        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidKey),
        });
        await api.post("/api/notifications/push-subscribe", { userId: user.id, subscription: sub });
        setPushType("vapid");
        toast("🔔 Real push notifications enabled! (VAPID)");
        subscribed = true;
      }
    } catch {}

    // Fallback: browser Notification API
    if (!subscribed) {
      setPushType("browser-only");
      const reg = await navigator.serviceWorker?.ready;
      if (reg) {
        await reg.showNotification(t("appName"), { body: "✅ Push notifications enabled!", icon: "/favicon.ico" });
      } else {
        new Notification(t("appName"), { body: "✅ Push notifications enabled!" });
      }
      toast("🔔 Browser push notifications enabled!");
    }
  };

  const retryLog = async (logId) => {
    await api.post(`/api/notifications/retry/${logId}`);
    api.get(`/api/notifications/delivery-logs/${user.id}`).then(r => setLogs(r.data)).catch(() => {});
    toast("🔄 Retry successful");
  };

  if (!user) return <Navigate to="/login" />;
  return (
    <div className="container">
      <div className="row between">
        <h1 className="page-title">{t("notifications.title")}</h1>
        <div className="row" style={{ gap: 8, position: "relative" }}>
          <button className="btn" onClick={() => setSimOpen(o => !o)} data-testid="test-notifications-btn">🧪 Test Notifications</button>
          {simOpen && (
            <div data-testid="sim-dropdown" style={{ position: "absolute", top: 44, right: 100, zIndex: 20, background: "var(--bg-elev)", border: "1px solid var(--border)", borderRadius: 12, padding: 6, minWidth: 220, boxShadow: "var(--shadow)" }}>
              {SIM_PRESETS.map((p) => (
                <button key={p.key} onClick={() => simulate(p)} data-testid={`sim-${p.key}`} className="btn-ghost"
                  style={{ display: "flex", width: "100%", textAlign: "left", padding: "10px 12px", border: 0, background: "transparent", color: "var(--ink)", borderRadius: 8, fontSize: 14, gap: 10 }}
                  onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-soft)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                ><span>{p.icon}</span>{p.label}</button>
              ))}
            </div>
          )}
          <button className="btn" onClick={markAll} data-testid="mark-all-read">{t("notifications.markAll")}</button>
        </div>
      </div>
      <div className="split">
        <div className="card">
          {items.length === 0 ? <div className="empty">{t("notifications.empty")}</div> : items.map(n => (
            <div key={n.id} className={`notif-item ${n.read ? "" : "unread"}`} onClick={() => markRead(n)} data-testid={`notif-${n.id}`}>
              <div className={`notif-dot ${n.read ? "read" : ""}`} />
              <div className="notif-body">
                <div className="notif-title">{n.title}</div>
                <div className="notif-text">{n.body}</div>
                <div className="notif-time">{new Date(n.sentAt).toLocaleString()}</div>
              </div>
            </div>
          ))}
        </div>
        {prefs && (
          <div className="card">
            <h3 style={{ marginTop: 0 }}>{t("notifications.prefs")}</h3>
            <h4 style={{ marginBottom: 6 }}>{t("notifications.channels")}</h4>
            {["email", "push", "sms"].map(ch => (
              <label className="checkbox" key={ch}><input type="checkbox" checked={!!prefs.channels[ch]} onChange={e => setPrefs({ ...prefs, channels: { ...prefs.channels, [ch]: e.target.checked } })} data-testid={`pref-ch-${ch}`} />{t(`notifications.${ch}`)}</label>
            ))}
            <h4 style={{ marginTop: 16, marginBottom: 6 }}>{t("notifications.types")}</h4>
            {["booking", "cancellation", "scheduleChange", "journeyReminder", "promotional", "offers"].map(ty => (
              <label className="checkbox" key={ty}><input type="checkbox" checked={!!prefs.notificationTypes[ty]} onChange={e => setPrefs({ ...prefs, notificationTypes: { ...prefs.notificationTypes, [ty]: e.target.checked } })} data-testid={`pref-ty-${ty}`} />{t(`notifications.${ty}`)}</label>
            ))}
            <h4 style={{ marginTop: 16, marginBottom: 6 }}>{t("notifications.language")}</h4>
            <select className="input" value={prefs.language} onChange={e => setPrefs({ ...prefs, language: e.target.value })} data-testid="pref-lang"><option value="en">English</option><option value="hi">हिंदी</option><option value="es">Español</option></select>
            <label className="checkbox" style={{ marginTop: 12 }}><input type="checkbox" checked={!!prefs.quiet_hours_enabled} onChange={e => setPrefs({ ...prefs, quiet_hours_enabled: e.target.checked })} data-testid="pref-quiet" />{t("notifications.enableQuiet")}</label>
            {prefs.quiet_hours_enabled && (<div className="row" style={{ gap: 8 }}>
              <div className="field" style={{ flex: 1 }}><label>{t("notifications.from")}</label><input type="time" className="input" value={prefs.quiet_hours_start} onChange={e => setPrefs({ ...prefs, quiet_hours_start: e.target.value })} /></div>
              <div className="field" style={{ flex: 1 }}><label>{t("notifications.to")}</label><input type="time" className="input" value={prefs.quiet_hours_end} onChange={e => setPrefs({ ...prefs, quiet_hours_end: e.target.value })} /></div>
            </div>)}
            <button className="btn btn-primary" onClick={savePrefs} data-testid="save-prefs" style={{ marginTop: 12, width: "100%" }}>{t("notifications.save")}</button>
            <button className="btn" onClick={enablePush} disabled={pushEnabled} data-testid="enable-push" style={{ marginTop: 8, width: "100%" }}>{pushEnabled ? t("notifications.pushEnabled") : t("notifications.enablePush")}</button>
          </div>
        )}
      </div>

      {/* ── Email Log ── */}
      {emailLog.length > 0 && (
        <div className="card" style={{ marginTop: 16 }}>
          <h4 style={{ marginTop: 0, marginBottom: 10 }}>📧 Email Delivery Log</h4>
          {emailLog.map((e, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderTop: i > 0 ? "1px solid var(--border)" : "none", fontSize: 13 }}>
              <span>{e.title}</span>
              <span style={{ color: "var(--ink-soft)" }}>{e.time}</span>
              <span style={{ color: "var(--good)" }}>✅ {e.status}</span>
            </div>
          ))}
        </div>
      )}

      {/* ── Push Status ── */}
      {pushEnabled && (
        <div className="card" style={{ marginTop: 16, padding: "12px 16px" }}>
          <div className="row" style={{ gap: 8, alignItems: "center" }}>
            <span style={{ color: "var(--good)", fontSize: 18 }}>🔔</span>
            <div>
              <strong style={{ fontSize: 13 }}>Push Notifications Active</strong>
              <div className="muted" style={{ fontSize: 12 }}>
                {pushType === "vapid" ? "Real-time VAPID push enabled" : "Browser notifications enabled"}
              </div>
            </div>
            <span className="tag tag-low" style={{ marginLeft: "auto" }}>
              {pushType === "vapid" ? "VAPID" : "Browser"}
            </span>
          </div>
        </div>
      )}

      {/* ── Delivery Log ── */}
      <div className="card" style={{ marginTop: 20 }}>
        <button className="btn btn-ghost" onClick={() => setLogsOpen(o => !o)} data-testid="delivery-log-toggle" style={{ width: "100%", textAlign: "left", fontWeight: 700, fontSize: 15 }}>
          📋 Delivery Log {logsOpen ? "▲" : "▼"}
        </button>
        {logsOpen && (
          <div style={{ marginTop: 12, overflowX: "auto" }}>
            {logs.length === 0 ? (
              <div className="empty">{t("notifications.noDeliveryLogs")}</div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border)" }}>
                    <th style={{ padding: "8px", textAlign: "left" }}>Notif ID</th>
                    <th style={{ padding: "8px", textAlign: "left" }}>Channel</th>
                    <th style={{ padding: "8px", textAlign: "left" }}>Status</th>
                    <th style={{ padding: "8px", textAlign: "left" }}>Time</th>
                    <th style={{ padding: "8px", textAlign: "center" }}>Retries</th>
                    <th style={{ padding: "8px" }}></th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map(l => (
                    <tr key={l.id} style={{ borderBottom: "1px solid var(--border)" }} data-testid={`log-row-${l.id}`}>
                      <td style={{ padding: "8px" }}>#{l.notificationId}</td>
                      <td style={{ padding: "8px", textTransform: "capitalize" }}>{l.channel}</td>
                      <td style={{ padding: "8px" }}>
                        {l.status === "delivered" ? <span style={{ color: "var(--good)" }}>✅ Delivered</span> : <span style={{ color: "#e53" }}>❌ Failed</span>}
                      </td>
                      <td style={{ padding: "8px", color: "var(--ink-soft)", fontSize: 12 }}>{new Date(l.sentAt).toLocaleString()}</td>
                      <td style={{ padding: "8px", textAlign: "center" }}>{l.retryCount || 0}</td>
                      <td style={{ padding: "8px" }}>
                        {l.status === "failed" && (
                          <button className="btn" style={{ padding: "4px 10px", fontSize: 12 }} data-testid={`retry-btn-${l.id}`} onClick={() => retryLog(l.id)}>🔄 Retry</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Profile ───
function ProfilePage() {
  const { t } = useI18n(); const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [saved, setSaved] = useState([]);
  const [tab, setTab] = useState("posts");
  const [busy, setBusy] = useState(false);
  const toast = useToast();
  
  const loadProfile = useCallback(() => {
    if (!user) return;
    api.get(`/api/profiles/${user.id}`).then(r => setProfile(r.data)).catch(() => {});
    api.get(`/api/reviews?userId=${user.id}`).then(r => setReviews(r.data)).catch(() => {});
    api.get(`/api/planner/saved/${user.id}`).then(r => setSaved(r.data)).catch(() => {});
  }, [user]);

  useEffect(() => { loadProfile(); }, [loadProfile]);

  const requestVerification = async () => {
    setBusy(true);
    try {
      await api.post(`/api/profiles/${user.id}/verify`);
      toast("Verification successful! Please re-login to update your session.");
      loadProfile();
    } catch {
      toast("Failed to request verification.", "error");
    } finally {
      setBusy(false);
    }
  };
  if (!user) return <Navigate to="/login" />;
  if (!profile) return <div className="container"><div className="empty"><span className="spinner" /></div></div>;

  const Stars = ({ n }) => <span className="stars">{"★".repeat(n)}{"☆".repeat(5 - n)}</span>;

  const activity = [
    ...(profile.recentPosts || []).map((p) => ({ kind: "post", id: `post-${p.id}`, date: p.createdAt, title: p.title, body: p.body, topic: p.topic })),
    ...reviews.map((r) => ({ kind: "review", id: `review-${r.id}`, date: r.createdAt, title: r.route, body: r.text, rating: r.rating })),
    ...saved.map((s) => ({ kind: "route", id: `route-${s.id}`, date: s.savedAt, title: "🗺️ Saved Route: " + s.name, body: `${s.start} → ${s.destination}` }))
  ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 30);

  return (
    <div className="container">
      <div className="card">
        <div className="row" style={{ gap: 20 }}>
          <img src={profile.avatar} alt="" className="avatar" style={{ width: 88, height: 88 }} loading="lazy" decoding="async" />
          <div>
            <h1 style={{ margin: 0, fontFamily: "Fraunces, serif" }}>
              {profile.name}{" "}
              {profile.verified && <span title="Verified User" style={{ color: "var(--good)" }}>⭐</span>}
              {!profile.verified && user?.id === profile.userId && (
                <button className="btn btn-primary" onClick={requestVerification} disabled={busy} style={{ fontSize: 12, padding: "4px 10px", marginLeft: 10, verticalAlign: "middle" }}>
                  {busy ? "..." : "Request Verification"}
                </button>
              )}
              {profile.trustedReviewer && (
                <span data-testid="profile-trusted-badge" title="Trusted Reviewer" style={{ display: "inline-flex", alignItems: "center", gap: 4, marginLeft: 10, padding: "3px 10px", borderRadius: 999, background: "color-mix(in srgb, var(--warn) 18%, transparent)", color: "var(--warn)", fontSize: 12, fontWeight: 700, verticalAlign: "middle" }}>⭐ Trusted</span>
              )}
            </h1>
            <div className="muted">{profile.email}</div>
            <div className="row" style={{ gap: 20, marginTop: 10, flexWrap: "wrap" }}>
              <div><strong>{profile.postCount || 0}</strong> <span className="muted">{t("profile.posts")}</span></div>
              <div><strong>{profile.engagementStats?.totalPostLikes || 0}</strong> <span className="muted">Likes</span></div>
              <div><strong>{profile.engagementStats?.totalComments || 0}</strong> <span className="muted">Comments</span></div>
              <div><strong>{profile.followersCount || 0}</strong> <span className="muted">{t("profile.followers")}</span></div>
              <div><span className="muted">{t("profile.joined")}</span> {new Date(profile.joinedAt).toLocaleDateString()}</div>
            </div>
          </div>
        </div>
        {profile.bio && <p style={{ marginTop: 16 }}>{profile.bio}</p>}
      </div>

      <div className="tabs" style={{ marginTop: 20 }}>
        <button className={`tab ${tab === "posts" ? "active" : ""}`} onClick={() => setTab("posts")} data-testid="profile-tab-posts">{t("profile.posts")}</button>
        <button className={`tab ${tab === "reviews" ? "active" : ""}`} onClick={() => setTab("reviews")} data-testid="profile-tab-reviews">{t("reviews.title")}</button>
        <button className={`tab ${tab === "activity" ? "active" : ""}`} onClick={() => setTab("activity")} data-testid="profile-tab-activity">{t("profile.travelHistory")}</button>
      </div>

      {tab === "posts" && (
        <div className="card" data-testid="profile-pane-posts">
          {profile.recentPosts?.length === 0 ? <div className="empty">{t("profile.noPosts")}</div> : profile.recentPosts?.map(p => (
            <div key={p.id} style={{ padding: "10px 0", borderTop: "1px solid var(--border)" }} data-testid={`profile-post-${p.id}`}>
              <strong>{p.title}</strong><div className="muted" style={{ fontSize: 13 }}>{p.body.slice(0, 120)}…</div>
            </div>
          ))}
        </div>
      )}

      {tab === "reviews" && (
        <div className="card" data-testid="profile-pane-reviews">
          {reviews.length === 0 ? <div className="empty">{t("reviews.noReviews")}</div> : reviews.map(r => (
            <div key={r.id} className="review-card" data-testid={`profile-review-${r.id}`}>
              <div className="row between" style={{ alignItems: "center" }}>
                <div><strong>{r.route}</strong><div className="muted" style={{ fontSize: 12 }}>{new Date(r.createdAt).toLocaleDateString()}</div></div>
                <Stars n={r.rating} />
              </div>
              <p style={{ margin: "6px 0 0" }}>{r.text}</p>
            </div>
          ))}
        </div>
      )}

      {tab === "activity" && (
        <div className="card" data-testid="profile-pane-activity">
          {activity.length === 0 ? <div className="empty">{t("profile.noActivity")}</div> : activity.map(a => (
            <div key={a.id} style={{ padding: "12px 0", borderTop: "1px solid var(--border)" }} data-testid={`profile-activity-${a.id}`}>
              <div className="row" style={{ gap: 10, alignItems: "center", marginBottom: 4 }}>
                <span className="post-topic" data-testid={`activity-type-${a.id}`}>
                  {a.kind === "post" ? "📝 Post" : a.kind === "review" ? "⭐ Review" : "🗺️ Saved Route"}
                </span>
                <span className="muted" style={{ fontSize: 12 }}>{new Date(a.date).toLocaleString()}</span>
                {a.kind === "review" && <Stars n={a.rating} />}
              </div>
              <strong>{a.title}</strong>
              {a.body && <div className="muted" style={{ fontSize: 13, marginTop: 4 }}>{a.body.slice(0, 120)}{a.body.length > 120 ? "…" : ""}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Admin Moderation ───
function AdminModerationPage() {
  const { t } = useI18n();
  const { user } = useAuth();
  const toast = useToast();
  const [reports, setReports] = useState([]);
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    api.get("/api/moderation/queue/pending").then(r => setReports(r.data)).catch(() => {});
  }, []);

  useEffect(() => { load(); }, [load]);

  const reviewReport = async (reportId, action) => {
    if (!user) return;
    setBusy(true);
    try {
      await api.post("/api/moderation/review", { reportId, action, reviewedBy: user.id, reason: "Admin reviewed" });
      toast(`Report ${action}d successfully`);
      load();
    } catch (err) {
      toast(err.response?.data?.error || "Error", "error");
    } finally {
      setBusy(false);
    }
  };

  if (!user) return <Navigate to="/login" />;

  return (
    <div className="container">
      <h1 className="page-title">{t("moderation.title")}</h1>
      <p className="page-sub">{t("moderation.subtitle")}</p>
      <div className="card">
        {reports.length === 0 ? (
          <div className="empty">{t("moderation.noPending")}</div>
        ) : (
          reports.map(r => (
            <div key={r.id} style={{ borderBottom: "1px solid var(--border)", padding: "16px 0" }}>
              <div className="row between" style={{ marginBottom: 8 }}>
                <strong>{t("moderation.reportReason")}: <span style={{ color: "var(--warn)", textTransform: "capitalize" }}>{r.reason.replace("_", " ")}</span></strong>
                <span className="muted" style={{ fontSize: 13 }}>{t("moderation.reported")}: {new Date(r.reportedAt).toLocaleString()}</span>
              </div>
              <div style={{ background: "var(--bg-soft)", padding: 12, borderRadius: 8, marginBottom: 12 }}>
                {r.post ? (
                  <>
                    <h4 style={{ margin: "0 0 8px 0" }}>{r.post.title}</h4>
                    <p style={{ margin: 0, color: "var(--ink-soft)" }}>{r.post.body}</p>
                  </>
                ) : (
                  <span className="muted">{t("moderation.postRemoved")}</span>
                )}
              </div>
              <div className="row" style={{ gap: 10 }}>
                <button className="btn btn-primary" onClick={() => reviewReport(r.id, "remove")} disabled={busy}>{t("moderation.removePost")}</button>
                <button className="btn btn-ghost" onClick={() => reviewReport(r.id, "reject")} disabled={busy}>{t("moderation.rejectReport")}</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ─── Settings ───
function SettingsPage() {
  const { t, lang, setLang, languages } = useI18n(); const { theme, setTheme } = useTheme(); const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  return (
    <div className="container" style={{ maxWidth: 700 }}>
      <h1 className="page-title">{t("settings.title")}</h1>
      <div className="card">
        <div className="field"><label>{t("settings.language")}</label>
          <select className="input" value={lang} onChange={e => setLang(e.target.value)} data-testid="settings-lang">{languages.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}</select>
        </div>
        <div className="field"><label>{t("settings.theme")}</label>
          <div className="row" style={{ gap: 8 }}>
            <button className={`btn ${theme === "light" ? "btn-primary" : ""}`} onClick={() => setTheme("light")} data-testid="settings-theme-light">{t("settings.light")}</button>
            <button className={`btn ${theme === "dark" ? "btn-primary" : ""}`} onClick={() => setTheme("dark")} data-testid="settings-theme-dark">{t("settings.dark")}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Root ───
function Shell() {
  const { loading } = useAuth();
  if (loading) return <div className="empty" style={{ marginTop: 100 }}><span className="spinner" /></div>;
  return (
    <div className="shell">
      <Header />
      <main className="main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/planner" element={<PlannerPage />} />
          <Route path="/community" element={<CommunityPage />} />
          <Route path="/forums" element={<ForumsPage />} />
          <Route path="/reviews" element={<ReviewsPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/moderation" element={<AdminModerationPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider><I18nProvider><AuthProvider><ToastProvider><Shell /></ToastProvider></AuthProvider></I18nProvider></ThemeProvider>
    </BrowserRouter>
  );
}