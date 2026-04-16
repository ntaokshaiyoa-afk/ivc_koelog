import { loadModelFromCache, saveModelToCache } from "../storage/modelCache";
import { logUI } from "../utils/logger";
import { showToast } from "../main/ui/toast";

export async function loadModel(model: "tiny" | "base") {
  // ======================
  // ① キャッシュ
  // ======================
  logUI("キャッシュ確認中...");

  const cached = await loadModelFromCache(model);
  if (cached) {
    logUI("キャッシュからロード", true);
    return cached;
  }

  // ======================
  // パス定義
  // ======================
  const paths = [
    `./assets/models/ggml-${model}.bin`,
    `https://your-internal-server/models/ggml-${model}.bin`,
    `https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-${model}.bin`
  ];

  // ======================
  // フォールバック
  // ======================
  for (let i = 0; i < paths.length; i++) {
    const path = paths[i];

    try {
      logUI(`取得試行: ${path}`);

      if (i === 2) {
        showToast("モデルDL開始（初回のみ・時間かかります）");
      }

      const res = await fetch(path);

      if (!res.ok) throw new Error();

      // ======================
      // 進捗付きDL
      // ======================
      const reader = res.body?.getReader();
      const contentLength = Number(res.headers.get("Content-Length")) || 0;

      let received = 0;
      const chunks: Uint8Array[] = [];

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          chunks.push(value);
          received += value.length;

          if (contentLength) {
            const percent = Math.floor((received / contentLength) * 100);
            logUI(`DL中... ${percent}%`);
          }
        }
      }

      const blob = new Blob(chunks);
      const buffer = await blob.arrayBuffer();

      logUI("取得成功 → キャッシュ保存", true);

      await saveModelToCache(model, buffer);

      return buffer;

    } catch (e) {
      logUI(`失敗: ${path}`);
    }
  }

  showToast("モデル取得失敗", 3000);
  throw new Error("model load failed");
}
