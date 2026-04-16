// src/workers/baseWorker.ts

import { initWhisper, whisperProcess } from "../pipeline/whisper";
import { processPipeline } from "../pipeline/pipeline";
import "/assets/wasm/whisper.js"; // ★絶対必要

let initialized = false;

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
        if (!initialized) {
          log("Whisper初期化中...");
          await initWhisper("tiny"); // ★まず固定
          initialized = true;
        }
        
        log("INIT完了");
        log("model size: " + (model?.byteLength ?? 0));
        postMessage({ type: "READY" });
        break;

      case "PROCESS":
        log("PROCESS受信");
        const result = await whisperProcess(msg.payload);
        log("音声処理中...");

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
