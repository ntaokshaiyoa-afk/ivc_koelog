// src/main/workerClient.ts

import type { AudioChunk, TranscriptSegment } from "../types";
import { logUI } from "../utils/logger";

export class WorkerClient {
  private worker: Worker;

  constructor(
    workerPath: URL,
    private onTranscript: (data: TranscriptSegment) => void,
    private modelBuffer?: ArrayBuffer
  ) {
    this.worker = new WorkerClass();

    // =========================
    // 受信
    // =========================
    this.worker.onmessage = (e) => {

  const msg = e.data;

  switch (msg.type) {

    case "READY":

      logUI("✅ Worker ready");

      break;

    case "TRANSCRIPT":

      this.onTranscript(msg.payload);

      break;

    case "ERROR":

      logUI("❌ Worker error: " + msg.payload, true);

      break;

    case "LOG": // ★追加

      logUI("[Worker] " + msg.payload);

      break;

    default:

      logUI("ℹ️ Unknown message: " + JSON.stringify(msg));

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
    logUI("📤 chunk送信");
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
