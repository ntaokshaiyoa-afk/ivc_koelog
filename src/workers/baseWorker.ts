// src/workers/baseWorker.ts

declare const self: any;

function loadScript(url: string) {
  try {
    importScripts(url);
    log("✔ load: " + url);
  } catch (e) {
    log("❌ load失敗: " + url);
    throw e;
  }
}

const BASE = self.location.origin + "/ivc_koelog";

log(main.js 読み込み開始");
//loadScript(BASE + "/assets/wasm/helpers.js");
loadScript(BASE + "/assets/wasm/main.js");

let instance: any = null;
let audioBuffer: Float32Array[] = [];
let initialized = false;
let modelLoaded = false;

function log(msg: string) {
  (self as any).postMessage({
    type: "LOG",
    payload: msg
  });
}

// =========================
// fetchでモデル取得
// =========================
async function loadModelRemote(): Promise<void> {
  const url =
    "https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-tiny-q5_1.bin";

  log("モデルDL開始...");

  const res = await fetch(url);

  if (!res.ok) {
    throw new Error("model download failed");
  }

  const buffer = await res.arrayBuffer();

  log("モデルDL完了");

  const Module = (self as any).Module;

  Module.FS_createDataFile(
    "/",
    "whisper.bin",
    new Uint8Array(buffer),
    true,
    true
  );
}
self.onmessage = async (e: MessageEvent) => {
  const msg = e.data;

  try {
    switch (msg.type) {

      // =========================
      // 初期化
      // =========================
      case "INIT":
        log("WASM初期化待ち...");

        // Module待ち
        while (!(self as any).Module || !(self as any).Module.init) {
          await new Promise(r => setTimeout(r, 100));
        }

        log("WASM ready");

        // ★ モデルDL（ここが変更点）
        if (!modelLoaded) {
          log("モデルロード開始...");
          await loadModelRemote();
          modelLoaded = true;
        }

        log("モデル初期化中...");

        instance = (self as any).Module.init("whisper.bin");

        log("モデル初期化完了");

        initialized = true;

        postMessage({ type: "READY" });
        break;

      // =========================
      // 音声処理
      // =========================
      case "PROCESS":
        if (!initialized) return;

        const chunk = msg.payload;
        audioBuffer.push(chunk.data);

        const total = audioBuffer.reduce((s, b) => s + b.length, 0);

        if (total < 16000 * 3) return;

        const merged = new Float32Array(total);
        let offset = 0;

        for (const b of audioBuffer) {
          merged.set(b, offset);
          offset += b.length;
        }

        audioBuffer = [];

        log("推論中...");

        const text = (self as any).Module.full_default(
          instance,
          merged,
          "ja",
          4,
          false
        );

        postMessage({
          type: "TRANSCRIPT",
          payload: {
            text,
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
