import { useEffect, useState } from "react";

import type { ProjectSnapshot } from "../../shared/project";

type SnapshotState =
  | { status: "loading" }
  | { status: "ready"; snapshot: ProjectSnapshot }
  | { status: "error"; message: string };

const systems = [
  { name: "Blueprint", detail: "Project intent available", phase: "READY" },
  { name: "Memory Core", detail: "Storage engine reserved", phase: "PHASE 2" },
  { name: "Harness Agent", detail: "Adapter boundary reserved", phase: "PHASE 3" },
  { name: "Health Center", detail: "Analysis boundary reserved", phase: "PHASE 4" },
];

function App() {
  const [snapshotState, setSnapshotState] = useState<SnapshotState>({ status: "loading" });

  useEffect(() => {
    let isMounted = true;

    window.harness.getProjectSnapshot().then(
      (snapshot) => {
        if (isMounted) setSnapshotState({ status: "ready", snapshot });
      },
      (error: unknown) => {
        if (isMounted) {
          const message = error instanceof Error ? error.message : "Project inspection failed";
          setSnapshotState({ status: "error", message });
        }
      },
    );

    return () => {
      isMounted = false;
    };
  }, []);

  const memoryStatus =
    snapshotState.status === "ready" ? snapshotState.snapshot.vibeDirectoryStatus : "scanning";

  return (
    <main className="mission-control">
      <header className="topbar">
        <div className="brand-mark" aria-hidden="true">
          VH
        </div>
        <div>
          <p className="eyebrow">VIBE PROJECT HARNESS</p>
          <h1>Mission Control</h1>
        </div>
        <div className="system-state">
          <span className="pulse" aria-hidden="true" />
          LOCAL SYSTEM ONLINE
        </div>
      </header>

      <section className="hero-panel">
        <div>
          <p className="section-label">PROJECT LINK</p>
          <h2>Engineering continuity, held locally.</h2>
          <p className="hero-copy">
            The desktop core is connected. Project memory status is inspected on this machine and
            remains under human control.
          </p>
        </div>
        <div className={`memory-orb memory-orb--${memoryStatus}`} aria-label={`Memory ${memoryStatus}`}>
          <span>MEMORY</span>
          <strong>{memoryStatus.toUpperCase()}</strong>
        </div>
      </section>

      <section className="project-panel" aria-live="polite">
        <div className="panel-heading">
          <div>
            <p className="section-label">ACTIVE PROJECT</p>
            <h2>Local project telemetry</h2>
          </div>
          {snapshotState.status === "ready" && (
            <span className={`status-chip status-chip--${snapshotState.snapshot.vibeDirectoryStatus}`}>
              .vibe {snapshotState.snapshot.vibeDirectoryStatus}
            </span>
          )}
        </div>

        {snapshotState.status === "loading" && <p className="telemetry-message">Scanning project root…</p>}
        {snapshotState.status === "error" && (
          <p className="telemetry-message telemetry-message--error">{snapshotState.message}</p>
        )}
        {snapshotState.status === "ready" && (
          <dl className="telemetry-grid">
            <div>
              <dt>Project root</dt>
              <dd>{snapshotState.snapshot.projectRoot}</dd>
            </div>
            <div>
              <dt>Memory directory</dt>
              <dd>{snapshotState.snapshot.vibeDirectoryPath}</dd>
            </div>
          </dl>
        )}
      </section>

      <section className="systems-section">
        <div className="section-heading">
          <p className="section-label">CORE SYSTEMS</p>
          <span>BOOTSTRAP / 01</span>
        </div>
        <div className="systems-grid">
          {systems.map((system, index) => (
            <article className="system-card" key={system.name}>
              <span className="system-index">0{index + 1}</span>
              <h3>{system.name}</h3>
              <p>{system.detail}</p>
              <span className="phase-tag">{system.phase}</span>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

export { App };
