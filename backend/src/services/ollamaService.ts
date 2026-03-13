/**
 * Ollama embedding service (optional).
 *
 * Set OLLAMA_ENABLED=true in .env and ensure `ollama serve` is running
 * with the model:  ollama pull nomic-embed-text
 *
 * Falls back gracefully (returns null) on any error so the rest of the
 * geocoding pipeline is never blocked.
 */

const OLLAMA_URL   = process.env["OLLAMA_URL"]   ?? "http://localhost:11434";
const OLLAMA_MODEL = process.env["OLLAMA_MODEL"] ?? "nomic-embed-text";
const EMBED_TIMEOUT_MS = 4_000;

interface OllamaEmbeddingResponse {
  embedding: number[];
}

/**
 * Returns the embedding vector for a given text, or null if unavailable.
 */
export async function getEmbedding(text: string): Promise<number[] | null> {
  if (process.env["OLLAMA_ENABLED"] !== "true") return null;

  try {
    const res = await fetch(`${OLLAMA_URL}/api/embeddings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: OLLAMA_MODEL, prompt: text }),
      signal: AbortSignal.timeout(EMBED_TIMEOUT_MS),
    });

    if (!res.ok) return null;

    const data = (await res.json()) as OllamaEmbeddingResponse;
    return Array.isArray(data.embedding) ? data.embedding : null;
  } catch {
    // Ollama not running or model not loaded — degrade silently
    return null;
  }
}

/**
 * Cosine similarity between two equal-length embedding vectors (range 0..1).
 */
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
