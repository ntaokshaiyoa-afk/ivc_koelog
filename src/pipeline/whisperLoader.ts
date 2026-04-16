let Module: any;

export async function loadWhisper() {
  if (Module) return Module;

  const ctx: any = self; // ★ここ重要

  if (!ctx.Module) {
    throw new Error("Module not found (WASM未ロード)");
  }

  Module = await ctx.Module({
    locateFile: (file: string) => {
      return `/assets/wasm/${file}`;
    }
  });

  return Module;
}
