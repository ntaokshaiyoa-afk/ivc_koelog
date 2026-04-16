// src/workers/micWorker.ts

let model: ArrayBuffer | null = null;

self.onmessage = async (e) => {
  const msg = e.data;

  switch (msg.type) {
    case "INIT":
      // モデル初期化
      self.postMessage({ type: "READY" });
      break;

    case "PROCESS":
      const chunk = msg.payload;

      // ★ここにWhisper処理入れる
      self.postMessage({
        type: "TRANSCRIPT",
        payload: {
          speaker: "A",
          text: "テスト文字起こし"
        }
      });
      break;

    case "STOP":
      close();
      break;
  }
};
