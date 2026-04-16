// src/workers/baseWorker.ts

import { initWhisper, transcribe } from "../pipeline/whisper";
import { processPipeline } from "../pipeline/pipeline";

// src/workers/baseWorker.ts

let model: ArrayBuffer | null = null;
let ready = false;
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
        await initWhisper(model); // ★ここ重要
        ready = true;
        log("INIT完了");
        log("model size: " + (model?.byteLength ?? 0));
        postMessage({ type: "READY" });
        break;

      case "PROCESS":
        log("PROCESS受信");
        if (!ready) return;
        
        if (!model) {
          throw new Error("model not initialized");
        }

        const chunk = msg.payload;
        
        log("音声処理中...");

        const result = await transcribe(chunk.data); // ★ここ

        if (result?.text) {
          postMessage({
            type: "TRANSCRIPT",
            payload: {
              text: result.text,
              speaker: chunk.source,
              timestamp: Date.now()
            }
          });
        }
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
