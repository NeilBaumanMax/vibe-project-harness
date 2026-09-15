import { useEffect, useState } from "react";

import type {
  MemoryItemSnapshot,
  MemoryLayerId,
  MemoryRuntimeSnapshot,
} from "../../shared/project";

interface MemoryCorePanelProps {
  projectRoot: string;
  runtime: MemoryRuntimeSnapshot;
}

type LayerFilter = "all" | MemoryLayerId;
type ItemState =
  | { status: "idle" | "loading" }
  | { status: "ready"; items: MemoryItemSnapshot[] }
  | { status: "error"; message: string };

const layerLabels: Record<MemoryLayerId, string> = {
  working_set: "Working Set",
  active_memory: "Active",
  consolidated_memory: "Consolidated",
  indexed_archive: "Archive",
  expired: "Expired",
};

const layerIds = Object.keys(layerLabels) as MemoryLayerId[];

export function MemoryCorePanel({ projectRoot, runtime }: MemoryCorePanelProps) {
  const [selectedLayer, setSelectedLayer] = useState<LayerFilter>("all");
  const [itemState, setItemState] = useState<ItemState>({ status: "idle" });

  useEffect(() => {
    if (runtime.status !== "ready") {
      setItemState({ status: "idle" });
      return;
    }

    let isMounted = true;
    setItemState({ status: "loading" });

    window.harness.listMemoryItems(selectedLayer === "all" ? undefined : selectedLayer).then(
      (items) => {
        if (isMounted) setItemState({ status: "ready", items });
      },
      (error: unknown) => {
        if (isMounted) {
          setItemState({
            status: "error",
            message: error instanceof Error ? error.message : "Memory items could not be loaded.",
          });
        }
      },
    );

    return () => {
      isMounted = false;
    };
  }, [projectRoot, runtime.status, selectedLayer]);

  const totalCount =
    runtime.status === "ready"
      ? Object.values(runtime.itemCounts).reduce((total, count) => total + count, 0)
      : 0;

  return (
    <section className="memory-panel">
      <div className="panel-heading">
        <div>
          <p className="section-label">MEMORY CORE</p>
          <h2>Knowledge layers</h2>
        </div>
        <span className="memory-total">{totalCount} ITEMS</span>
      </div>

      {runtime.status === "unavailable" && (
        <p className="telemetry-message">Initialize this project to activate its Memory Core.</p>
      )}
      {runtime.status === "error" && (
        <p className="telemetry-message telemetry-message--error">{runtime.message}</p>
      )}
      {runtime.status === "ready" && (
        <>
          <div className="layer-filters" aria-label="Memory layer filter">
            <button
              aria-pressed={selectedLayer === "all"}
              className="layer-filter"
              onClick={() => setSelectedLayer("all")}
              type="button"
            >
              All <span>{totalCount}</span>
            </button>
            {layerIds.map((layer) => (
              <button
                aria-pressed={selectedLayer === layer}
                className="layer-filter"
                key={layer}
                onClick={() => setSelectedLayer(layer)}
                type="button"
              >
                {layerLabels[layer]} <span>{runtime.itemCounts[layer]}</span>
              </button>
            ))}
          </div>

          {itemState.status === "loading" && (
            <p className="telemetry-message">Reading local memory…</p>
          )}
          {itemState.status === "error" && (
            <p className="telemetry-message telemetry-message--error">{itemState.message}</p>
          )}
          {itemState.status === "ready" && itemState.items.length === 0 && (
            <p className="memory-empty">No knowledge items in this layer.</p>
          )}
          {itemState.status === "ready" && itemState.items.length > 0 && (
            <div className="memory-list">
              {itemState.items.map((item) => (
                <article className="memory-item" key={item.id}>
                  <div className="memory-item__meta">
                    <span>{layerLabels[item.layer]}</span>
                    <time dateTime={item.updatedAt}>
                      {new Date(item.updatedAt).toLocaleString()}
                    </time>
                  </div>
                  <p>{item.content}</p>
                  <code>{item.id}</code>
                </article>
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}
