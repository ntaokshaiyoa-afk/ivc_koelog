// src/main/workerClient.ts

import type { AudioChunk, TranscriptSegment } from "../types";

export class WorkerClient {
  private worker: Worker;

  constructor(
    workerPath: URL,
    private onMessage: (data: any) => void,
    private modelBuffer?: ArrayBuffer
  ) {
    this.worker = new Worker(workerPath, { type: "module" });

    this.worker.onmessage = (e) => {
      this.onMessage(e.data);

      switch (msg.type) {
        case "READY":
          console.log("Worker ready");
          break;

        case "TRANSCRIPT":
          this.onTranscript(msg.payload);
          break;

        case "ERROR":
          console.error(msg.payload);
          break;
      }
    };

    this.worker.postMessage({
      type: "INIT",
      model: this.model   // ★追加
    });
  }

  async init() {
    if (this.modelBuffer) {
      this.worker.postMessage({
        type: "init",
        model: this.modelBuffer
      });
    }
  }

  process(chunk: any) {
    this.worker.postMessage({
      type: "audio",
      chunk
    });
  }

  stop() {
    this.worker.postMessage({ type: "STOP" });
    this.worker.terminate();
  }
}
