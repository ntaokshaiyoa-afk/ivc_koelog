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
  
  if (!module) {
    throw new Error("module undefined");
  }
  
  if (!module._malloc) {
    console.error(module);
    throw new Error("_malloc missing → wasmロード失敗");
  }

  const modelBuffer = await loadModel(model);

  // WASMにモデルを渡す（環境に応じて調整）

  const ptr = module._malloc(modelBuffer.byteLength);

  new Uint8Array(module.HEAPU8.buffer, ptr, modelBuffer.byteLength)

    .set(new Uint8Array(modelBuffer));

  module.ccall(

    "whisper_init_from_buffer",

    "number",

    ["number", "number"],

    [ptr, modelBuffer.byteLength]

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
