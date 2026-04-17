// src/main/app.ts

import { AudioCapture } from "../audio/capture";
import { blobToFloat32Array } from "../audio/processor";
import { WorkerClient } from "./workerClient";
import { loadModel } from "../pipeline/modelLoader";
import type { AudioChunk, TranscriptSegment } from "../types";
import MicWorker from "../workers/micWorker.ts";
import DesktopWorker from "../workers/desktopWorker.ts";

export class App {
  private micCapture?: AudioCapture;
  private desktopCapture?: AudioCapture;

  private micWorker?: WorkerClient;
  private desktopWorker?: WorkerClient;

  constructor(
    private onText: (text: string) => void
  ) {}

  // =========================
  // マイク
  // =========================
  async startMic() {
    const model = (document.getElementById("modelSelect") as HTMLSelectElement)
      .value as "tiny" | "base";
  
    const modelBuffer = await loadModel(model);
  
    this.micWorker = new WorkerClient(
      new MicWorker(),
      (seg) => {
        this.onText(`[${seg.speaker}] ${seg.text}`);
      },
      modelBuffer
    );
  
    this.micCapture = new AudioCapture((pcm) => {
      const chunk: AudioChunk = {
        data: pcm,
        timestamp: Date.now(),
        source: "mic"
      };
    
      this.micWorker?.process(chunk);
    });
  
    await this.micCapture.startMic();
  }

  // =========================
  // デスクトップ音声
  // =========================
  async startDesktop() {
    const model = (document.getElementById("modelSelect") as HTMLSelectElement)
      .value as "tiny" | "base";

    const modelBuffer = await loadModel(model);

    this.desktopWorker = new WorkerClient(
      new DesktopWorker(),
      (seg) => {
        this.onText(`[${seg.speaker}] ${seg.text}`);
      },
      modelBuffer
    );

    this.desktopCapture = new AudioCapture(async (blob) => {
      const pcm = await blobToFloat32Array(blob);

      const chunk: AudioChunk = {
        data: pcm,
        timestamp: Date.now(),
        source: "desktop"
      };

      this.desktopWorker?.process(chunk);
    });

    await this.desktopCapture.startDesktop();
  }

  // =========================
  // 停止
  // =========================
  stop() {
    this.micCapture?.stop();
    this.desktopCapture?.stop();

    this.micWorker?.stop();
    this.desktopWorker?.stop();
  }
}
