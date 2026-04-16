// src/workers/micWorker.ts

let model: ArrayBuffer | null = null;

self.onmessage = async (e: MessageEvent) => {
  const { type, chunk } = e.data;

  if (type === "init") {
    model = e.data.model;

    console.log("model loaded");
    return;
  }

  if (type === "audio") {
    // ★ 仮実装（テスト用）
    self.postMessage({
      speaker: "A",
      text: `音声受信 ${chunk.data.length}`
    });
  }
};
