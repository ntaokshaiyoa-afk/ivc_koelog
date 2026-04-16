// src/workers/baseWorker.ts

import { initWhisper } from "../pipeline/whisper";
import { processPipeline } from "../pipeline/pipeline";

// src/workers/baseWorker.ts

let model: ArrayBuffer | null = null;
function log(msg: string) {
  (self as any).postMessage({
    type: "LOG",
    payload: msg
  });
}

self.onmessage = async (e: MessageEvent) => {
  const msg = e.data;

  try {
    switch (msg.type) {
      case "INIT":
        model = msg.model; // ★受け取る
        log("INIT完了");
        postMessage({ type: "READY" });
        break;

      case "PROCESS":
        log("PROCESS受信");
        
        if (!model) {
          throw new Error("model not initialized");
        }

        const chunk = msg.payload;
        
        log("音声処理中...");

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
        log("停止");
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
