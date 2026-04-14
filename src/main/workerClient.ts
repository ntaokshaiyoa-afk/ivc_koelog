// src/main/workerClient.ts

import type { AudioChunk, TranscriptSegment } from "../types";

export class WorkerClient {
  private worker: Worker;

  constructor(
    workerPath: string,
    private onTranscript: (seg: TranscriptSegment) => void
  ) {
    this.worker = new Worker(workerPath, { type: "module" });

    this.worker.onmessage = (e) => {
      const msg = e.data;

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

    this.worker.postMessage({ type: "INIT" });
  }

  process(chunk: AudioChunk) {
    this.worker.postMessage({
      type: "PROCESS_CHUNK",
      payload: chunk
    });
  }

  stop() {
    this.worker.postMessage({ type: "STOP" });
    this.worker.terminate();
  }
}
