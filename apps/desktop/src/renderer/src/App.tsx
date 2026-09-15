import { useEffect, useState } from "react";

import type { ProjectSnapshot } from "../../shared/project";
import { MemoryCorePanel } from "./MemoryCorePanel";

type SnapshotState =
  | { status: "loading" }
  | { status: "ready"; snapshot: ProjectSnapshot }
  | { status: "error"; message: string };

type ProjectAction = "idle" | "selecting" | "initializing";

const systems = [
  { name: "Blueprint", detail: "Project intent available", phase: "READY" },
  { name: "Memory Core", detail: "Local store and read view online", phase: "PHASE 2" },
  { name: "Harness Agent", detail: "Adapter boundary reserved", phase: "PHASE 3" },
  { name: "Health Center", detail: "Analysis boundary reserved", phase: "PHASE 4" },
];

function App() {
  const [snapshotState, setSnapshotState] = useState<SnapshotState>({ status: "loading" });
  const [projectAction, setProjectAction] = useState<ProjectAction>("idle");
  const [actionMessage, setActionMessage] = useState<string>();

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
    snapshotState.status !== "ready"
      ? "scanning"
      : snapshotState.snapshot.vibeDirectoryStatus === "missing"
        ? "missing"
        : snapshotState.snapshot.memoryRuntime.status;

  const memoryItemTotal =
    snapshotState.status === "ready" && snapshotState.snapshot.memoryRuntime.status === "ready"
      ? Object.values(snapshotState.snapshot.memoryRuntime.itemCounts).reduce(
          (total, count) => total + count,
          0,
        )
      : undefined;

  async function selectProject(): Promise<void> {
    setProjectAction("selecting");
    setActionMessage(undefined);

    try {
      const result = await window.harness.selectProject();

      if (result.status === "selected") {
        setSnapshotState({ status: "ready", snapshot: result.snapshot });
      }
    } catch (error) {
      setActionMessage(error instanceof Error ? error.message : "Project selection failed");
    } finally {
      setProjectAction("idle");
    }
  }

  async function initializeProject(): Promise<void> {
    setProjectAction("initializing");
    setActionMessage(undefined);

    try {
      const result = await window.harness.initializeProject();
      setSnapshotState({ status: "ready", snapshot: result.snapshot });
      setActionMessage(
        result.status === "initialized"
          ? "Project memory metadata initialized."
          : "This project already has a .vibe directory.",
      );
    } catch (error) {
      setActionMessage(error instanceof Error ? error.message : "Project initialization failed");
    } finally {
      setProjectAction("idle");
    }
  }

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
          <div className="panel-actions">
            {snapshotState.status === "ready" && (
              <span className={`status-chip status-chip--${snapshotState.snapshot.vibeDirectoryStatus}`}>
                .vibe {snapshotState.snapshot.vibeDirectoryStatus}
              </span>
            )}
            <button
              className="control-button control-button--secondary"
              data-testid="select-project"
              disabled={projectAction !== "idle"}
              onClick={() => void selectProject()}
              type="button"
            >
              {projectAction === "selecting" ? "Opening…" : "Open project"}
            </button>
            {snapshotState.status === "ready" &&
              snapshotState.snapshot.vibeDirectoryStatus === "missing" && (
                <button
                  className="control-button"
                  data-testid="initialize-project"
                  disabled={projectAction !== "idle"}
                  onClick={() => void initializeProject()}
                  type="button"
                >
                  {projectAction === "initializing" ? "Initializing…" : "Initialize .vibe"}
                </button>
              )}
          </div>
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
            {snapshotState.snapshot.memoryRuntime.status === "ready" && (
              <>
                <div>
                  <dt>Memory schema</dt>
                  <dd>Version {snapshotState.snapshot.memoryRuntime.schemaVersion}</dd>
                </div>
                <div>
                  <dt>Knowledge items</dt>
                  <dd>{memoryItemTotal}</dd>
                </div>
              </>
            )}
          </dl>
        )}
        {snapshotState.status === "ready" && snapshotState.snapshot.memoryRuntime.status === "error" && (
          <p className="telemetry-message telemetry-message--error">
            {snapshotState.snapshot.memoryRuntime.message}
          </p>
        )}
        {actionMessage && <p className="action-message">{actionMessage}</p>}
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

      {snapshotState.status === "ready" && (
        <MemoryCorePanel
          onProjectSnapshotChange={(snapshot) =>
            setSnapshotState({ status: "ready", snapshot })
          }
          projectRoot={snapshotState.snapshot.projectRoot}
          runtime={snapshotState.snapshot.memoryRuntime}
        />
      )}
    </main>
  );
}

export { App };
