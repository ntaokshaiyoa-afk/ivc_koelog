// src/pipeline/whisper.ts

import type { AudioChunk } from "../types";
import { loadWhisper } from "./whisperLoader";
import { loadModel } from "./modelLoader";

let initialized = false;
let whisperInstance: any;
let modelBuffer: ArrayBuffer;

export async function initWhisper(model: "tiny" | "base") {
  if (initialized) return;

  whisperInstance = await loadWhisper();
  modelBuffer = await loadModel(model);

  await whisperInstance.init(modelBuffer);

  initialized = true;
}

export async function whisperProcess(chunk: AudioChunk) {
  if (!initialized) {
    throw new Error("Whisper not initialized");
  }

  const result = await whisperInstance.transcribe(chunk.data, {
    language: "ja",
    translate: false
  });

  return {
    text: result.text || ""
  };
}
