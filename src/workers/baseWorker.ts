// src/workers/baseWorker.ts

import type { AudioChunk } from "../types";
import { processPipeline } from "../pipeline/pipeline";

self.onmessage = async (e: MessageEvent) => {
  const msg = e.data;

  try {
    switch (msg.type) {

      case "INIT":
        (self as any).postMessage({ type: "READY" });
        break;

      case "PROCESS_CHUNK":
        const result = await processPipeline(msg.payload as AudioChunk);

        if (result) {
          (self as any).postMessage({
            type: "TRANSCRIPT",
            payload: result
          });
        }
        break;

      case "STOP":
        break;
    }

  } catch (err: any) {
    (self as any).postMessage({
      type: "ERROR",
      payload: err.message || "Worker error"
    });
  }
};
