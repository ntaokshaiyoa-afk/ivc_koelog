// src/workers/baseWorker.ts

import type { AudioChunk, TranscriptSegment } from "../types";

// 仮パイプライン（後で差し替え）
async function processChunk(chunk: AudioChunk): Promise<TranscriptSegment> {
  // ダミー（後でWhisperに置き換え）
  return {
    text: `(${chunk.source}) 音声処理中...`,
    speaker: chunk.source === "mic" ? "Mic_S1" : "Desktop_S1",
    timestamp: chunk.timestamp
  };
}

// Workerメイン
self.onmessage = async (e: MessageEvent) => {
  const msg = e.data;

  try {
    switch (msg.type) {

      case "INIT":
        (self as any).postMessage({ type: "READY" });
        break;

      case "PROCESS_CHUNK":
        const result = await processChunk(msg.payload);

        (self as any).postMessage({
          type: "TRANSCRIPT",
          payload: result
        });
        break;

      case "STOP":
        // 必要ならクリーンアップ
        break;
    }

  } catch (err: any) {
    (self as any).postMessage({
      type: "ERROR",
      payload: err.message || "Worker error"
    });
  }
};
