// src/workers/baseWorker.ts

import { initWhisper } from "../pipeline/whisper";
import { processPipeline } from "../pipeline/pipeline";

self.onmessage = async (e: MessageEvent) => {
  const msg = e.data;

  try {
    switch (msg.type) {

      case "INIT":
        await initWhisper();
        postMessage({ type: "READY" });
        break;
      
      case "PROCESS_CHUNK":
        const result = await whisperProcess(msg.payload);
      
        if (result.text) {
          postMessage({
            type: "TRANSCRIPT",
            payload: {
              text: result.text,
              speaker: msg.payload.source,
              timestamp: Date.now()
            }
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
