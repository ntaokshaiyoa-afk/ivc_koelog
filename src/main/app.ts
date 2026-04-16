// src/main/app.ts

import { AudioCapture } from "../audio/capture";
import { blobToFloat32Array } from "../audio/processor";
import { WorkerClient } from "./workerClient";
import type { AudioChunk, TranscriptSegment } from "../types";

export class App {
  private micCapture?: AudioCapture;
  private desktopCapture?: AudioCapture;

  private micWorker?: WorkerClient;
  private desktopWorker?: WorkerClient;

  constructor(
    private onText: (text: string) => void
  ) };

  const model = (document.getElementById("modelSelect") as HTMLSelectElement).value as "tiny" | "base";
  
  this.micWorker = new WorkerClient(
    new URL("../workers/micWorker.ts", import.meta.url),
    (seg) => this.onText(`[${seg.speaker}] ${seg.text}`),
    model
  );
  
  async startMic() {
    this.micWorker = new WorkerClient(
      new URL("../workers/micWorker.ts", import.meta.url),
      (seg: TranscriptSegment) => {
        this.onText(`[${seg.speaker}] ${seg.text}`);
      }
    );

    this.micCapture = new AudioCapture(async (blob) => {
      const pcm = await blobToFloat32Array(blob);

      const chunk: AudioChunk = {
        data: pcm,
        timestamp: Date.now(),
        source: "mic"
      };

      this.micWorker?.process(chunk);
    });

    await this.micCapture.startMic();
  }

  async startDesktop() {
    this.desktopWorker = new WorkerClient(
      new URL("../workers/desktopWorker.ts", import.meta.url),
      (seg: TranscriptSegment) => {
        this.onText(`[${seg.speaker}] ${seg.text}`);
      }
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

  stop() {
    this.micCapture?.stop();
    this.desktopCapture?.stop();

    this.micWorker?.stop();
    this.desktopWorker?.stop();
  }
}
