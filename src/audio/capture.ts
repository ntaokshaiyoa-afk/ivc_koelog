// src/audio/capture.ts

export interface CaptureOptions {
  timeslice?: number; // ms
}

export class AudioCapture {
  private stream: MediaStream | null = null;
  private recorder: MediaRecorder | null = null;

  constructor(private onChunk: (blob: Blob) => void) {}

  // 🎤 マイク
  async startMic(options: CaptureOptions = {}) {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    this.start(stream, options);
  }

  // 🖥 デスクトップ
  async startDesktop(options: CaptureOptions = {}) {
    const stream = await navigator.mediaDevices.getDisplayMedia({
      audio: {
        echoCancellation: false,
        noiseSuppression: false,
        sampleRate: 48000
      },
      video: true
    });
    
    // ★ audioトラックがないケース対策
    const audioTracks = stream.getAudioTracks();
  
    if (audioTracks.length === 0) {
      console.warn("デスクトップ音声なし → スキップ");
      return; // ★落とさない
    }
    
    this.start(stream, options);
  }

  // 共通処理
  private start(stream: MediaStream, options: CaptureOptions) {
    this.stream = stream;
    const mimeTypes = [
      "audio/webm;codecs=opus",
      "audio/webm",
      "audio/ogg"
    ];
    
    const supported = mimeTypes.find(t => MediaRecorder.isTypeSupported(t));
    
    const recorderOptions = supported ? { mimeType: supported } : {};
  
    this.recorder = new MediaRecorder(stream, recorderOptions);
  
    this.recorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        this.onChunk(e.data);
      }
    };
  
    // 1秒ごとchunk
    this.recorder.start(options.timeslice ?? 1000);
  }

  stop() {
    this.recorder?.stop();
    this.stream?.getTracks().forEach(t => t.stop());
    this.recorder = null;
    this.stream = null;
  }
}
