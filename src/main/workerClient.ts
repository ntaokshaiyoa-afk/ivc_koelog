// src/main/workerClient.ts

import type { AudioChunk, TranscriptSegment } from "../types";

export class WorkerClient {
  private worker: Worker;

  constructor(
    workerPath: URL,
    private onTranscript: (data: TranscriptSegment) => void,
    private modelBuffer?: ArrayBuffer
  ) {
    this.worker = new Worker(workerPath, { type: "module" });

    // =========================
    // 受信
    // =========================
    this.worker.onmessage = (e) => {
      const msg = e.data;

      switch (msg.type) {
        case "READY":
          console.log("✅ Worker ready");
          break;

        case "TRANSCRIPT":
          this.onTranscript(msg.payload);
          break;

        case "ERROR":
          console.error("❌ Worker error:", msg.payload);
          break;

        default:
          console.log("ℹ️ Unknown message:", msg);
      }
    };

    // =========================
    // 初期化
    // =========================
    if (this.modelBuffer) {
      this.worker.postMessage({
        type: "INIT",
        model: this.modelBuffer
      });
    }
  }

  // =========================
  // 音声送信
  // =========================
  process(chunk: AudioChunk) {
    this.worker.postMessage({
      type: "PROCESS",
      payload: chunk
    });
  }

  // =========================
  // 停止
  // =========================
  stop() {
    this.worker.postMessage({ type: "STOP" });
    this.worker.terminate();
  }
}
