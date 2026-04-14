// src/pipeline/whisperLoader.ts

let whisper: any = null;

export async function loadWhisper() {
  if (whisper) return whisper;

  // WASMロード
  whisper = await (window as any).createWhisper({
    wasmPath: "/assets/wasm/whisper.wasm"
  });

  return whisper;
}
