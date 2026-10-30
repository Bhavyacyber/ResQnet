
import { useEffect, useState } from "react";
import "./App.css";
import { dashboardDataSource } from "./data/dashboardDataSource";
import type {
  AlertPriority,
  DashboardData,
} from "./types/dashboard";

function App() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [alerts, setAlerts] = useState<DashboardData["alerts"]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [filter, setFilter] = useState<AlertPriority | "All">("All");

  useEffect(() => {
    let cancelled = false;

    dashboardDataSource.getDashboardData().then(
      (data) => {
        if (!cancelled) {
          setDashboardData(data);
          setAlerts(data.alerts);
        }
      },
      (error: unknown) => {
        if (!cancelled) {
          setLoadError(
            error instanceof Error ? error.message : "Unable to load dashboard data.",
          );
        }
      },
    );

    return () => {
      cancelled = true;
    };
  }, []);

  const visibleAlerts =
    filter === "All"
      ? alerts
      : alerts.filter((alert) => alert.priority === filter);
  const securityFeedStatusLabels = {
    connected: "Feed connected",
    "not-connected": "Feed not connected",
    unknown: "Feed status unknown",
  };
  const securityFeedStatus = dashboardData
    ? securityFeedStatusLabels[dashboardData.securityFeedStatus]
    : loadError
      ? "Feed unavailable"
      : "Checking feed";

  function dismissDemoAlert(id: string) {
    setAlerts((current) =>
      current.filter((alert) => alert.id !== id),
    );
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">R</div>
          <div>
            <h1>RESQNET</h1>
            <span>EMERGENCY NETWORK</span>
          </div>
        </div>

        <div className="sidebar-label">COMMAND CENTER</div>

        <nav className="navigation">
          <a className="nav-link active" href="#overview">▦ Overview</a>
          <a className="nav-link" href="#alerts">⚠ SOS Alerts</a>
          <a className="nav-link" href="#nodes">◉ Network Nodes</a>
          <a className="nav-link" href="#map">⌖ Incident Map</a>
          <a className="nav-link" href="#security">⬡ Security Events</a>
        </nav>

        <div className="sidebar-footer">
          <span className="status-dot green" />
          <div>
            <strong>Local dashboard</strong>
            <small>
              {dashboardData?.source === "demo"
                ? "Demo mode · Not connected"
                : "Dashboard data source"}
            </small>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <span className="eyebrow">RESQNET / OPERATIONS</span>
            <h2>Emergency Command Center</h2>
          </div>
          <div className="system-status">
            <span className="status-dot green" />
            UI running locally
          </div>
        </header>

        <section className="welcome" id="overview">
          <div>
            <span className="eyebrow light">OFFLINE EMERGENCY RESPONSE</span>
            <h2>Every alert matters.</h2>
            <p>
              Monitor SOS reports, network readiness and security events
              from one command center.
            </p>
          </div>
          <div className="welcome-symbol" aria-hidden="true">⌁</div>
        </section>

        <section className="metrics-grid" aria-label="Dashboard summary">
          <article className="metric-card">
            <span className="metric-label">SOS ALERTS</span>
            <strong>{alerts.length.toString().padStart(2, "0")}</strong>
            <span className="metric-note">
              {dashboardData?.source === "demo"
                ? "Sample dashboard records"
                : "Alert records supplied"}
            </span>
          </article>

          <article className="metric-card" id="nodes">
            <span className="metric-label">NETWORK NODES</span>
            <strong>{dashboardData?.networkNodes.length || "—"}</strong>
            <span className="metric-note">
              {dashboardData?.networkNodes.length
                ? "Node records supplied"
                : "Awaiting real node data"}
            </span>
          </article>

          <article className="metric-card">
            <span className="metric-label">GATEWAY STATUS</span>
            <strong className="metric-word">
              {dashboardData?.gatewayStatus?.connectionState ?? "—"}
            </strong>
            <span className="metric-note">
              {dashboardData?.gatewayStatus?.detail ?? "Awaiting gateway data"}
            </span>
          </article>

          <article className="metric-card">
            <span className="metric-label">SECURITY EVENTS</span>
            <strong>{dashboardData?.securityEvents.length || "—"}</strong>
            <span className="metric-note">
              {dashboardData?.securityEvents.length
                ? "Security event records supplied"
                : "Awaiting security event data"}
            </span>
          </article>
        </section>

        <section className="content-grid">
          <article className="panel alerts-panel" id="alerts">
            <div className="panel-heading">
              <div>
                <span className="eyebrow">INCIDENT MANAGEMENT</span>
                <h3>Incoming SOS alerts</h3>
              </div>
              {dashboardData?.source === "demo" && (
                <span className="demo-badge">DEMO DATA</span>
              )}
            </div>

            <div className="filter-row">
              <label htmlFor="priority-filter">Filter by priority</label>
              <select
                id="priority-filter"
                value={filter}
                onChange={(event) => {
                  const value = event.target.value;
                  setFilter(
                    value === "Critical" ||
                      value === "High" ||
                      value === "Medium"
                      ? value
                      : "All",
                  );
                }}
              >
                <option value="All">All priorities</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
              </select>
            </div>

            <div className="alert-list">
              {visibleAlerts.map((alert) => (
                <div className="alert-row" key={alert.id}>
                  <div className="alert-marker">!</div>
                  <div className="alert-details">
                    <strong>{alert.type}</strong>
                    <span>{alert.id} · {alert.location}</span>
                    <span>{alert.time}</span>
                  </div>
                  <div className="alert-actions">
                    <span className={`priority ${alert.priority.toLowerCase()}`}>
                      {alert.priority}
                    </span>
                    {alert.verificationStatus && (
                      <span
                        className={`verification ${alert.verificationStatus.toLowerCase()}`}
                      >
                        {alert.verificationStatus}
                      </span>
                    )}
                    {dashboardData?.source === "demo" && (
                      <button
                        className="acknowledge-button"
                        onClick={() => dismissDemoAlert(alert.id)}
                      >
                        Dismiss demo
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {loadError && <p className="empty-state">{loadError}</p>}
              {!dashboardData && !loadError && (
                <p className="empty-state">Loading dashboard data…</p>
              )}
              {dashboardData && visibleAlerts.length === 0 && (
                <p className="empty-state">No alerts match this filter.</p>
              )}
            </div>

            {dashboardData?.source === "demo" && (
              <p className="demo-notice">
                These are illustrative records, not real emergency reports.
                Dismissing one only changes this temporary screen.
              </p>
            )}
          </article>

          <article className="panel map-panel" id="map">
            <div className="panel-heading">
              <div>
                <span className="eyebrow">GEOGRAPHIC OVERVIEW</span>
                <h3>Incident map</h3>
              </div>
            </div>
            <div className="map-placeholder">
              <span className="map-cross">⌖</span>
              <strong>Map integration pending</strong>
              <p>Leaflet and OpenStreetMap will be added in a later step.</p>
              <span className="map-caption">NO LIVE LOCATIONS</span>
            </div>
          </article>
        </section>

        <section className="panel security-panel" id="security">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">TRUST & VERIFICATION</span>
              <h3>Security event monitoring</h3>
            </div>
            <span className="waiting-badge">
              {dashboardData?.source === "demo"
                ? `Demo data · ${securityFeedStatus}`
                : securityFeedStatus}
            </span>
          </div>

          <div className="security-empty">
            {dashboardData?.securityEvents.length ? (
              <div>
                {dashboardData.securityEvents.map((event) => (
                  <p key={event.id}>
                    <strong>{event.description}</strong> · {event.time}
                  </p>
                ))}
              </div>
            ) : (
              <>
                <span className="security-icon">✓</span>
                <div>
                  <strong>
                    {loadError
                      ? "Security event data unavailable"
                      : dashboardData?.securityFeedStatus === "connected"
                        ? "Security feed connected; no events reported"
                        : dashboardData?.source === "demo"
                          ? "Demo data; no live security feed connected"
                          : "No security events received"}
                  </strong>
                  <p>
                    Replay detections, invalid signatures, expired packets and
                    suspicious-node events will appear here when supplied by
                    the RESQNET data source.
                  </p>
                </div>
              </>
            )}
          </div>
        </section>

        <footer className="footer">
          <span>RESQNET · Command & Control</span>
          <span>Prototype UI · Local development</span>
        </footer>
      </main>
    </div>
  );
}

export default App;
