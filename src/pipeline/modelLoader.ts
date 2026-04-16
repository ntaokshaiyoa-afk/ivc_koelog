import { loadModelFromCache, saveModelToCache } from "../storage/modelCache";

function log(msg: string) {
  console.log("[MODEL]", msg);

  const el = document.getElementById("transcript");
  if (!el) return;

  const div = document.createElement("div");
  div.textContent = `[MODEL] ${msg}`;
  el.appendChild(div);
}

// ==============================
// メイン処理
// ==============================
export async function loadModel(model: "tiny" | "base") {
  // ① キャッシュ確認
  log("キャッシュ確認中...");
  const cached = await loadModelFromCache(model);

  if (cached) {
    log("キャッシュからロード");
    return cached;
  }

  const paths = [
    `./assets/models/ggml-${model}.bin`, // ② ローカル
    //`https://your-internal-server/models/ggml-${model}.bin`, // ③ 社内
    `https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-${model}.bin` // ④ CDN
  ];

  for (let i = 0; i < paths.length; i++) {
    const path = paths[i];

    try {
      log(`取得試行: ${path}`);

      // CDN時は確認
      if (i === 2) {
        const ok = confirm("モデル（約75MB）をダウンロードします。よろしいですか？");
        if (!ok) throw new Error("user cancel");
      }

      const res = await fetch(path);

      if (!res.ok) throw new Error("not found");

      const buffer = await res.arrayBuffer();

      log("取得成功 → キャッシュ保存");

      // ★ キャッシュ保存
      await saveModelToCache(model, buffer);

      return buffer;

    } catch (e) {
      log(`失敗: ${path}`);
    }
  }

  throw new Error("モデルが見つかりません");
}
