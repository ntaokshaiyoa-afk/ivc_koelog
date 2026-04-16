// src/audio/capture.ts
import { logUI } from "../utils/logger";

export interface CaptureOptions {
  bufferSize?: number;
}

export class AudioCapture {
  private stream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private processor: ScriptProcessorNode | null = null;

  constructor(private onChunk: (pcm: Float32Array) => void) {}

  // 🎤 マイク
  async startMic(options: CaptureOptions = {}) {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    this.start(stream, options);
  }

  // 🖥 デスクトップ
  async startDesktop(options: CaptureOptions = {}) {
    const stream = await navigator.mediaDevices.getDisplayMedia({
      audio: true,
      video: true
    });

    if (stream.getAudioTracks().length === 0) {
      logUI("❌ デスクトップ音声なし");
      return;
    }

    this.start(stream, options);
  }

  private start(stream: MediaStream, options: CaptureOptions) {
    this.stream = stream;

    const audioContext = new AudioContext({ sampleRate: 16000 });
    this.audioContext = audioContext;

    const source = audioContext.createMediaStreamSource(stream);

    const bufferSize = options.bufferSize ?? 4096;
    const processor = audioContext.createScriptProcessor(bufferSize, 1, 1);
    this.processor = processor;

    source.connect(processor);
    processor.connect(audioContext.destination);

    processor.onaudioprocess = (e) => {
      const input = e.inputBuffer.getChannelData(0);

      // コピー（重要）
      const pcm = new Float32Array(input);

      logUI("🎤 PCM chunk: " + pcm.length);

      this.onChunk(pcm);
    };
  }

  stop() {
    this.processor?.disconnect();
    this.audioContext?.close();

    this.stream?.getTracks().forEach((t) => t.stop());

    this.processor = null;
    this.audioContext = null;
    this.stream = null;
  }
}
