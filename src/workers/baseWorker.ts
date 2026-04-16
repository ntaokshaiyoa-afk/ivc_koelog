// src/workers/baseWorker.ts

import { initWhisper } from "../pipeline/whisper";
import { processPipeline } from "../pipeline/pipeline";

// src/workers/baseWorker.ts

let model: ArrayBuffer | null = null;

self.onmessage = async (e: MessageEvent) => {
  const msg = e.data;

  try {
    switch (msg.type) {
      case "INIT":
        model = msg.model; // ★受け取る
        postMessage({ type: "READY" });
        break;

      case "PROCESS":
        if (!model) {
          throw new Error("model not initialized");
        }

        const chunk = msg.payload;

        // ★ 仮の処理（ここにWhisper入れる）
        postMessage({
          type: "TRANSCRIPT",
          payload: {
            text: "音声認識中...",
            speaker: chunk.source,
            timestamp: Date.now()
          }
        });
        break;

      case "STOP":
        close();
        break;
    }
  } catch (err: any) {
    postMessage({
      type: "ERROR",
      payload: err.message
    });
  }
};
