// src/main/index.ts

import { App } from "./app";
import { initToast } from "./ui/toast";

initToast();

const transcriptEl = document.getElementById("transcript")!;
const statusEl = document.getElementById("status")!;

function appendText(text: string) {
  const div = document.createElement("div");
  div.textContent = `[${new Date().toLocaleTimeString()}] ${text}`;
  transcriptEl.appendChild(div);
  transcriptEl.scrollTop = transcriptEl.scrollHeight;
}

const app = new App(appendText);

// ボタン接続
document.getElementById("btnStartMic")!.onclick = async () => {
  statusEl.textContent = "状態: マイク録音中...";
  await app.startMic();
};

document.getElementById("btnStartDesktop")!.onclick = async () => {
  statusEl.textContent = "状態: デスクトップ音声取得中...";
  await app.startDesktop();
};

document.getElementById("btnStop")!.onclick = () => {
  statusEl.textContent = "状態: 停止";
  app.stop();
};

const buildInfoEl = document.getElementById("buildInfo");

if (buildInfoEl) {
  buildInfoEl.textContent = `ビルド: ${__BUILD_TIME__} (${__COMMIT_HASH__})`;
}

