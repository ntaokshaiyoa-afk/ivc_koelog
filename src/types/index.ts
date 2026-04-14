// src/types/index.ts

export interface AudioChunk {
  data: Float32Array;
  timestamp: number;
  source: "mic" | "desktop";
}
