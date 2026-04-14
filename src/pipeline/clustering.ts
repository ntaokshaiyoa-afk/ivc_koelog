// src/pipeline/clustering.ts

let speakerMap: Float32Array[] = [];

function distance(a: Float32Array, b: Float32Array): number {
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    const d = a[i] - b[i];
    sum += d * d;
  }
  return Math.sqrt(sum);
}

export function clusteringProcess(
  emb: Float32Array,
  source: "mic" | "desktop"
): string {

  const THRESHOLD = 1.5;

  for (let i = 0; i < speakerMap.length; i++) {
    const dist = distance(emb, speakerMap[i]);

    if (dist < THRESHOLD) {
      return `${source}_S${i + 1}`;
    }
  }

  speakerMap.push(emb);
  return `${source}_S${speakerMap.length}`;
}
