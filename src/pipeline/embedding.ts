// src/pipeline/embedding.ts

import type { AudioChunk } from "../types";

export async function embeddingProcess(chunk: AudioChunk): Promise<Float32Array> {
  // 仮：ランダムベクトル
  const vec = new Float32Array(16);

  for (let i = 0; i < vec.length; i++) {
    vec[i] = Math.random();
  }

  return vec;
}
