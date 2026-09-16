import { useEffect, useState } from "react";

import type {
  MemoryItemSnapshot,
  MemoryLayerId,
  MemoryRuntimeSnapshot,
  ProjectSnapshot,
} from "../../shared/project";

interface MemoryCorePanelProps {
  projectRoot: string;
  runtime: MemoryRuntimeSnapshot;
  onProjectSnapshotChange: (snapshot: ProjectSnapshot) => void;
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

export function MemoryCorePanel({
  projectRoot,
  runtime,
  onProjectSnapshotChange,
}: MemoryCorePanelProps) {
  const [selectedLayer, setSelectedLayer] = useState<LayerFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [itemState, setItemState] = useState<ItemState>({ status: "idle" });
  const [draftContent, setDraftContent] = useState("");
  const [captureState, setCaptureState] = useState<"idle" | "saving">("idle");
  const [captureMessage, setCaptureMessage] = useState<string>();
  const [promotingItemId, setPromotingItemId] = useState<string>();
  const [editingItemId, setEditingItemId] = useState<string>();
  const [editDraft, setEditDraft] = useState("");
  const [savingItemId, setSavingItemId] = useState<string>();
  const [deletingItemId, setDeletingItemId] = useState<string>();
  const [promotionMessage, setPromotionMessage] = useState<string>();
  const [refreshVersion, setRefreshVersion] = useState(0);

  useEffect(() => {
    if (runtime.status !== "ready") {
      setItemState({ status: "idle" });
      return;
    }

    let isMounted = true;
    setItemState({ status: "loading" });

    window.harness.listMemoryItems(
      selectedLayer === "all" ? undefined : selectedLayer,
      searchQuery,
    ).then(
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
  }, [projectRoot, runtime.status, selectedLayer, searchQuery, refreshVersion]);

  async function captureWorkingSetItem(): Promise<void> {
    setCaptureState("saving");
    setCaptureMessage(undefined);

    try {
      const result = await window.harness.createWorkingSetItem(draftContent);
      setDraftContent("");
      setCaptureMessage("Captured in Working Set.");
      onProjectSnapshotChange(result.snapshot);
      setRefreshVersion((version) => version + 1);
    } catch (error) {
      setCaptureMessage(error instanceof Error ? error.message : "Knowledge Item could not be saved.");
    } finally {
      setCaptureState("idle");
    }
  }

  async function promoteWorkingSetItem(itemId: string): Promise<void> {
    setPromotingItemId(itemId);
    setPromotionMessage(undefined);

    try {
      const result = await window.harness.promoteWorkingSetItem(itemId);
      setPromotionMessage("Promoted to Active Memory.");
      onProjectSnapshotChange(result.snapshot);
      setRefreshVersion((version) => version + 1);
    } catch (error) {
      setPromotionMessage(
        error instanceof Error ? error.message : "Knowledge Item could not be promoted.",
      );
    } finally {
      setPromotingItemId(undefined);
    }
  }

  function beginEditing(item: MemoryItemSnapshot): void {
    setEditingItemId(item.id);
    setEditDraft(item.content);
    setPromotionMessage(undefined);
  }

  function cancelEditing(): void {
    setEditingItemId(undefined);
    setEditDraft("");
  }

  async function saveItemEdit(itemId: string): Promise<void> {
    setSavingItemId(itemId);
    setPromotionMessage(undefined);

    try {
      const result = await window.harness.updateKnowledgeItemContent(itemId, editDraft);
      setPromotionMessage("Knowledge Item saved.");
      cancelEditing();
      onProjectSnapshotChange(result.snapshot);
      setRefreshVersion((version) => version + 1);
    } catch (error) {
      setPromotionMessage(
        error instanceof Error ? error.message : "Knowledge Item could not be saved.",
      );
    } finally {
      setSavingItemId(undefined);
    }
  }

  async function deleteKnowledgeItem(itemId: string): Promise<void> {
    if (!window.confirm("Delete this Knowledge Item permanently?")) return;

    setDeletingItemId(itemId);
    setPromotionMessage(undefined);

    try {
      const result = await window.harness.deleteKnowledgeItem(itemId);
      setPromotionMessage("Knowledge Item deleted.");
      onProjectSnapshotChange(result.snapshot);
      setRefreshVersion((version) => version + 1);
    } catch (error) {
      setPromotionMessage(
        error instanceof Error ? error.message : "Knowledge Item could not be deleted.",
      );
    } finally {
      setDeletingItemId(undefined);
    }
  }

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
          <form
            className="memory-capture"
            onSubmit={(event) => {
              event.preventDefault();
              void captureWorkingSetItem();
            }}
          >
            <label htmlFor="working-set-content">Capture working context</label>
            <div className="memory-capture__controls">
              <textarea
                data-testid="working-set-content"
                disabled={captureState === "saving"}
                id="working-set-content"
                onChange={(event) => setDraftContent(event.target.value)}
                placeholder="Record the current task context, constraint, or discovery…"
                rows={3}
                value={draftContent}
              />
              <button
                className="control-button"
                data-testid="capture-working-set"
                disabled={captureState === "saving" || draftContent.trim().length === 0}
                type="submit"
              >
                {captureState === "saving" ? "Capturing…" : "Capture"}
              </button>
            </div>
            {captureMessage && (
              <p className="capture-message" role="status">
                {captureMessage}
              </p>
            )}
          </form>

          {promotionMessage && (
            <p className="memory-action-message" role="status">
              {promotionMessage}
            </p>
          )}

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

          <label className="memory-search">
            <span>Search content</span>
            <input
              data-testid="memory-search"
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Find text in Knowledge Items"
              type="search"
              value={searchQuery}
            />
          </label>

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
                  {editingItemId === item.id ? (
                    <textarea
                      className="memory-item__editor"
                      data-testid={`edit-content-${item.id}`}
                      disabled={
                        promotingItemId !== undefined ||
                        savingItemId !== undefined ||
                        deletingItemId !== undefined
                      }
                      onChange={(event) => setEditDraft(event.target.value)}
                      rows={4}
                      value={editDraft}
                    />
                  ) : (
                    <p>{item.content}</p>
                  )}
                  <div className="memory-item__footer">
                    <code>{item.id}</code>
                    <div className="memory-item__actions">
                      {editingItemId === item.id ? (
                        <>
                          <button
                            className="control-button"
                            data-testid={`save-edit-${item.id}`}
                            disabled={
                              promotingItemId !== undefined ||
                              savingItemId !== undefined ||
                              deletingItemId !== undefined ||
                              editDraft.trim().length === 0
                            }
                            onClick={() => void saveItemEdit(item.id)}
                            type="button"
                          >
                            {savingItemId === item.id ? "Saving…" : "Save"}
                          </button>
                          <button
                            className="control-button control-button--secondary"
                            data-testid={`cancel-edit-${item.id}`}
                            disabled={
                              promotingItemId !== undefined ||
                              savingItemId !== undefined ||
                              deletingItemId !== undefined
                            }
                            onClick={cancelEditing}
                            type="button"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button
                          className="control-button control-button--secondary"
                          data-testid={`edit-${item.id}`}
                          disabled={
                            promotingItemId !== undefined ||
                            editingItemId !== undefined ||
                            savingItemId !== undefined ||
                            deletingItemId !== undefined
                          }
                          onClick={() => beginEditing(item)}
                          type="button"
                        >
                          Edit
                        </button>
                      )}
                    {item.layer === "working_set" && editingItemId !== item.id && (
                      <button
                        className="control-button control-button--secondary"
                        data-testid={`promote-${item.id}`}
                        disabled={
                          promotingItemId !== undefined ||
                          editingItemId !== undefined ||
                          savingItemId !== undefined ||
                          deletingItemId !== undefined
                        }
                        onClick={() => void promoteWorkingSetItem(item.id)}
                        type="button"
                      >
                        {promotingItemId === item.id ? "Promoting…" : "Promote to Active"}
                      </button>
                    )}
                    {editingItemId !== item.id && (
                      <button
                        className="control-button control-button--danger"
                        data-testid={`delete-${item.id}`}
                        disabled={
                          promotingItemId !== undefined ||
                          editingItemId !== undefined ||
                          savingItemId !== undefined ||
                          deletingItemId !== undefined
                        }
                        onClick={() => void deleteKnowledgeItem(item.id)}
                        type="button"
                      >
                        {deletingItemId === item.id ? "Deleting…" : "Delete"}
                      </button>
                    )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}
