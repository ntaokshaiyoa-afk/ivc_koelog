// src/pipeline/whisper.ts

import type { AudioChunk } from "../types";
import { loadWhisper } from "./whisperLoader";
import { loadModel } from "./modelLoader";

let module: any;
let initialized = false;
let whisperInstance: any;
let modelBuffer: ArrayBuffer;
let audioBuffer: Float32Array[] = [];


export async function initWhisper(model: "tiny" | "base") {
  if (initialized) return;

  module = await loadWhisper();

  // ★ stream初期化
  module.ccall(
    "whisper_init_from_file",
    "number",
    ["string"],
    ["/assets/models/ggml-tiny.bin"]
  );

  initialized = true;
}

export async function whisperProcess(chunk: AudioChunk) {
  audioBuffer.push(chunk.data);

  // 3秒たまったら処理
  const total = audioBuffer.reduce((sum, b) => sum + b.length, 0);

  if (total < 16000 * 3) {
    return { text: "" };
  }

  // マージ
  const merged = new Float32Array(total);
  let offset = 0;

  for (const b of audioBuffer) {
    merged.set(b, offset);
    offset += b.length;
  }

  audioBuffer = [];

  // ★ WASMに渡す（ここが重要）
  const ptr = module._malloc(merged.length * 4);
  module.HEAPF32.set(merged, ptr / 4);

  // 推論
  module.ccall(
    "whisper_full",
    "number",
    ["number", "number"],
    [ptr, merged.length]
  );

  // 結果取得
  const text = module.ccall(
    "whisper_get_text",
    "string",
    [],
    []
  );

  module._free(ptr);

  return { text };
}
