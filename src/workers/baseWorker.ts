// src/workers/baseWorker.ts

import "/assets/wasm/main.js"; // ★これが本体（超重要）

let instance: any = null;
let audioBuffer: Float32Array[] = [];
let initialized = false;

function log(msg: string) {
  (self as any).postMessage({
    type: "LOG",
    payload: msg
  });
}

function storeFS(fname: string, buf: ArrayBuffer) {
  (self as any).Module.FS_createDataFile("/", fname, new Uint8Array(buf), true, true);
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

        // WASM ready待ち
        while (!(self as any).Module || !(self as any).Module.init) {
          await new Promise(r => setTimeout(r, 100));
        }

        log("WASM ready");

        // モデル受け取り
        const modelBuffer = msg.model;

        log("モデルロード中...");
        storeFS("whisper.bin", modelBuffer);

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

        // 3秒貯める
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
