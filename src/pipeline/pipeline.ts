// src/pipeline/pipeline.ts

import type { AudioChunk, TranscriptSegment } from "../types";
import { vadProcess } from "./vad";
import { whisperProcess } from "./whisper";
import { embeddingProcess } from "./embedding";
import { clusteringProcess } from "./clustering";

export async function processPipeline(
  chunk: AudioChunk
): Promise<TranscriptSegment | null> {

  // ① VAD（無音スキップ）
  const speech = await vadProcess(chunk);
  if (!speech) return null;

  // ② Whisper（文字起こし）
  const textResult = await whisperProcess(speech);

  // ③ Embedding（話者特徴）
  const embedding = await embeddingProcess(speech);

  // ④ Clustering（話者判定）
  const speaker = clusteringProcess(embedding, chunk.source);

  return {
    text: textResult.text,
    speaker,
    timestamp: chunk.timestamp
  };
}
