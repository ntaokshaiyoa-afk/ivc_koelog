// src/workers/baseWorker.ts

import { initWhisper } from "../pipeline/whisper";
import { processPipeline } from "../pipeline/pipeline";

self.onmessage = async (e: MessageEvent) => {
  const msg = e.data;

  try {
    switch (msg.type) {

      case "INIT":
        await initWhisper(msg.model); // ★追加
        (self as any).postMessage({ type: "READY" });
        break;

      case "PROCESS_CHUNK":
        const result = await processPipeline(msg.payload);

        if (result) {
          (self as any).postMessage({
            type: "TRANSCRIPT",
            payload: result
          });
        }
        break;

    }

  } catch (err: any) {
    (self as any).postMessage({
      type: "ERROR",
      payload: err.message
    });
  }
};
