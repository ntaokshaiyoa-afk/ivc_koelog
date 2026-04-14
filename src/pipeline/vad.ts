// src/pipeline/vad.ts

import type { AudioChunk } from "../types";

const THRESHOLD = 0.01;

export async function vadProcess(chunk: AudioChunk): Promise<AudioChunk | null> {
  const data = chunk.data;

  let sum = 0;
  for (let i = 0; i < data.length; i++) {
    sum += Math.abs(data[i]);
  }

  const avg = sum / data.length;

  // 無音判定
  if (avg < THRESHOLD) {
    return null;
  }

  return chunk;
}
