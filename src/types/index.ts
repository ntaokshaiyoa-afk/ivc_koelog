// src/types/index.ts

// src/types/index.ts

export interface AudioChunk {
  data: Float32Array;
  timestamp: number;
  source: "mic" | "desktop";
}

export interface TranscriptSegment {
  text: string;
  speaker: string;
  timestamp: number;
}
