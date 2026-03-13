const OLLAMA_URL   = process.env["OLLAMA_URL"]   ?? "http://localhost:11434";
const OLLAMA_MODEL = process.env["OLLAMA_MODEL"] ?? "nomic-embed-text";
const EMBED_TIMEOUT_MS = 4_000;

interface OllamaEmbeddingResponse {
  embedding: number[];
}

export async function getEmbedding(text: string): Promise<number[] | null> {
  if (process.env["OLLAMA_ENABLED"] !== "true") return null;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), EMBED_TIMEOUT_MS);

    const res = await fetch(`${OLLAMA_URL}/api/embeddings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: OLLAMA_MODEL, prompt: text }),
      signal: controller.signal,
    });
    clearTimeout(timer);

    if (!res.ok) return null;

    const data = (await res.json()) as OllamaEmbeddingResponse;
    return Array.isArray(data.embedding) ? data.embedding : null;
  } catch {
    return null;
  }
}

export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0;
  let dot = 0, magA = 0, magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot  += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  const denom = Math.sqrt(magA) * Math.sqrt(magB);
  return denom === 0 ? 0 : dot / denom;
}
