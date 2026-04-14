// src/pipeline/modelLoader.ts

export async function loadModel(model: "tiny" | "base") {
  const path = `/assets/models/ggml-${model}.bin`;

  const res = await fetch(path);

  if (!res.ok) {
    throw new Error(`Model not found: ${model}`);
  }

  const buffer = await res.arrayBuffer();
  return buffer;
}
