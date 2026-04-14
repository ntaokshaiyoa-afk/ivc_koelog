// src/pipeline/whisperLoader.ts

let Module: any;

export async function loadWhisper() {
  if (Module) return Module;

  // Emscriptenモジュール生成
  Module = await (window as any).Module({
    locateFile: (file: string) => {
      return `/assets/wasm/${file}`;
    }
  });

  return Module;
}
