// src/main/app.ts

import { AudioCapture } from "../audio/capture";
import { blobToFloat32Array } from "../audio/processor";
import type { AudioChunk } from "../types";

export class App {
  private micCapture?: AudioCapture;
  private desktopCapture?: AudioCapture;

  constructor(
    private onText: (text: string) => void
  ) {}

  async startMic() {
    this.micCapture = new AudioCapture(async (blob) => {
      const pcm = await blobToFloat32Array(blob);

      const chunk: AudioChunk = {
        data: pcm,
        timestamp: Date.now(),
        source: "mic"
      };

      // 仮：ログ出力
      this.onText(`[Mic chunk] ${pcm.length}`);
    });

    await this.micCapture.startMic();
  }

  async startDesktop() {
    this.desktopCapture = new AudioCapture(async (blob) => {
      const pcm = await blobToFloat32Array(blob);

      const chunk: AudioChunk = {
        data: pcm,
        timestamp: Date.now(),
        source: "desktop"
      };

      this.onText(`[Desktop chunk] ${pcm.length}`);
    });

    await this.desktopCapture.startDesktop();
  }

  stop() {
    this.micCapture?.stop();
    this.desktopCapture?.stop();
  }
}
