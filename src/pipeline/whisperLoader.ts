// src/pipeline/whisperLoader.ts

let Module: any = null;

export async function loadWhisper() {
  if (Module) return Module;

  Module = await (window as any).Module({
    locateFile: (file: string) => {
      return `/assets/wasm/${file}`;
    }
  });

  return Module;
}
