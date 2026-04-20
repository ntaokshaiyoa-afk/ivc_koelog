// src/workers/baseWorker.ts

declare const self: any;

importScripts("./assets/wasm/helpers.js");
importScripts("./assets/wasm/main.js");

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
// loadRemoteラッパ
// =========================
function loadModelRemote(): Promise<void> {
  return new Promise((resolve, reject) => {

    const Module = (self as any).Module;

    function cbProgress(p: number) {
      log("モデルDL: " + Math.round(p * 100) + "%");
    }

    function cbReady(dst: string, data: ArrayBuffer) {
      log("モデルDL完了");

      Module.FS_createDataFile("/", dst, new Uint8Array(data), true, true);

      resolve();
    }

    function cbCancel() {
      reject("model load canceled");
    }

    (self as any).loadRemote(
      "https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-tiny-q5_1.bin",
      "whisper.bin",
      31,
      cbProgress,
      cbReady,
      cbCancel,
      log
    );
  });
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
