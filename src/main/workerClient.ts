// src/main/workerClient.ts

import type { AudioChunk, TranscriptSegment } from "../types";
import { logUI } from "../utils/logger";

export class WorkerClient {
  private worker: Worker;

  constructor(
    worker: Worker,
    private onTranscript: (data: TranscriptSegment) => void,
    private modelBuffer?: ArrayBuffer
  ) {
    this.worker = worker;

this.worker.onerror = (e) => {
  this.onTranscript({
    speaker: "ERR",
    text: `Worker error: ${e.message}`,
    timestamp: Date.now()
  });
};

this.worker.onmessageerror = (e) => {
  this.onTranscript({
    speaker: "ERR",
    text: `Message error`,
    timestamp: Date.now()
  });
};
    
    // =========================
    // 受信
    // =========================
    this.worker.onmessage = (e) => {
      const msg = e.data;

      switch (msg.type) {
        case "READY":
          this.onTranscript({
            speaker: "SYS",
            text: "Worker ready",
            timestamp: Date.now()
          });
          break;

        case "TRANSCRIPT":
          this.onTranscript(msg.payload);
          break;

        case "LOG":
          this.onTranscript({
            speaker: "LOG",
            text: msg.payload,
            timestamp: Date.now()
          });
          break;

        case "ERROR":
          this.onTranscript({
            speaker: "ERR",
            text: msg.payload,
            timestamp: Date.now()
          });
          break;
      }
    }

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
