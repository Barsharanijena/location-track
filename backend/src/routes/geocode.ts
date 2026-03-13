import { Request, Response, Router } from "express";
import { autocomplete, reverseGeocode, searchAddress } from "../services/geocodeService";
import { semanticCache } from "../services/semanticCache";
import { GeocodeRequest, GeocodeResponse } from "../types/index";

const router = Router();

router.post("/", async (req: Request<object, GeocodeResponse, GeocodeRequest>, res: Response) => {
  const { query } = req.body;

  if (!query || query.trim().length < 3) {
    res.status(400).json({ error: "query must be at least 3 characters" } as never);
    return;
  }

  const { entry, layer } = await semanticCache.getAsync(query);
  if (entry) {
    res.json({ results: entry.results, fromCache: true, cacheKey: layer ?? undefined } as GeocodeResponse);
    return;
  }

  try {
    const results = await searchAddress(query);
    semanticCache.set(query, results);
    res.json({ results, fromCache: false } as GeocodeResponse);
  } catch {
    res.status(502).json({ error: "Geocoding service unavailable" } as never);
  }
});

router.post("/reverse", async (req: Request, res: Response) => {
  const { lat, lng } = req.body as { lat: number; lng: number };

  if (typeof lat !== "number" || typeof lng !== "number") {
    res.status(400).json({ error: "lat and lng must be numbers" });
    return;
  }

  const cached = semanticCache.getByCoordinates({ lat, lng });
  if (cached) { res.json({ result: cached.results[0], fromCache: true }); return; }

  try {
    const result = await reverseGeocode(lat, lng);
    if (result) semanticCache.set(`reverse:${lat},${lng}`, [result]);
    res.json({ result, fromCache: false });
  } catch {
    res.status(502).json({ error: "Reverse geocoding service unavailable" });
  }
});

router.get("/autocomplete", async (req: Request, res: Response) => {
  const q = req.query["q"] as string | undefined;

  if (!q || q.trim().length < 2) {
    res.status(400).json({ error: "q must be at least 2 characters" });
    return;
  }

  try {
    const results = await autocomplete(q);
    res.json({ suggestions: results.map((r) => ({ displayName: r.display_name, placeId: r.place_id })) });
  } catch {
    res.status(502).json({ error: "Autocomplete service unavailable" });
  }
});

router.get("/cache/stats", (_req: Request, res: Response) => {
  res.json({
    size: semanticCache.size,
    ollamaEnabled: process.env["OLLAMA_ENABLED"] === "true",
    ollamaModel: process.env["OLLAMA_MODEL"] ?? "nomic-embed-text",
  });
});

export default router;
