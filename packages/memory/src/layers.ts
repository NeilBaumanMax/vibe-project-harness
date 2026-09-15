export const MEMORY_LAYERS = [
  "working_set",
  "active_memory",
  "consolidated_memory",
  "indexed_archive",
  "expired",
] as const;

export type MemoryLayer = (typeof MEMORY_LAYERS)[number];

export function isMemoryLayer(value: string): value is MemoryLayer {
  return MEMORY_LAYERS.some((layer) => layer === value);
}
