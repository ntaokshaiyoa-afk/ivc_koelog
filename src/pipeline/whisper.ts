// src/pipeline/whisper.ts

import type { AudioChunk } from "../types";

export async function whisperProcess(chunk: AudioChunk) {
  // 仮処理（後でWASMに置き換え）

  return {
    text: `音声(${chunk.source})を解析中...`
  };
}
