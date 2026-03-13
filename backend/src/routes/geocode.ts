import { Request, Response, Router } from "express";
import { autocomplete, reverseGeocode, searchAddress } from "../services/geocodeService";
import { semanticCache } from "../services/semanticCache";
import { GeocodeRequest, GeocodeResponse } from "../types/index";

const router = Router();

/**
 * POST /api/geocode
 * Body: { query: string }
 * Returns: geocoded + parsed address with cache metadata.
 */
router.post("/", async (req: Request<object, GeocodeResponse, GeocodeRequest>, res: Response) => {
  const { query } = req.body;

  if (!query || query.trim().length < 3) {
    res.status(400).json({ error: "query must be at least 3 characters" } as never);
    return;
  }

  // Check semantic cache (layers 1 + 2 sync, layer 3 Ollama async)
  const { entry, layer } = await semanticCache.getAsync(query);
  if (entry) {
    const response: GeocodeResponse = {
      results: entry.results,
      fromCache: true,
      cacheKey: layer ?? undefined,
    };
    res.json(response);
    return;
  }

  try {
    const results = await searchAddress(query);
    semanticCache.set(query, results);

    const response: GeocodeResponse = {
      results,
      fromCache: false,
    };
    res.json(response);
  } catch (err) {
    console.error("[geocode] search error:", err);
    res.status(502).json({ error: "Geocoding service unavailable" } as never);
  }
});

/**
 * POST /api/geocode/reverse
 * Body: { lat: number, lng: number }
 */
router.post("/reverse", async (req: Request, res: Response) => {
  const { lat, lng } = req.body as { lat: number; lng: number };

  if (typeof lat !== "number" || typeof lng !== "number") {
    res.status(400).json({ error: "lat and lng must be numbers" });
    return;
  }

  // Check proximity cache by coordinates
  const cached = semanticCache.getByCoordinates({ lat, lng });
  if (cached) {
    res.json({ result: cached.results[0], fromCache: true });
    return;
  }

  try {
    const result = await reverseGeocode(lat, lng);
    if (result) semanticCache.set(`reverse:${lat},${lng}`, [result]);
    res.json({ result, fromCache: false });
  } catch (err) {
    console.error("[geocode] reverse error:", err);
    res.status(502).json({ error: "Reverse geocoding service unavailable" });
  }
});

/**
 * GET /api/geocode/autocomplete?q=...
 */
router.get("/autocomplete", async (req: Request, res: Response) => {
  const q = req.query["q"] as string | undefined;

  if (!q || q.trim().length < 2) {
    res.status(400).json({ error: "q must be at least 2 characters" });
    return;
  }

  try {
    const results = await autocomplete(q);
    const suggestions = results.map((r) => ({
      displayName: r.display_name,
      placeId: r.place_id,
    }));
    res.json({ suggestions });
  } catch (err) {
    console.error("[geocode] autocomplete error:", err);
    res.status(502).json({ error: "Autocomplete service unavailable" });
  }
});

/**
 * GET /api/geocode/cache/stats
 */
router.get("/cache/stats", (_req: Request, res: Response) => {
  res.json({
    size: semanticCache.size,
    ollamaEnabled: process.env["OLLAMA_ENABLED"] === "true",
    ollamaModel: process.env["OLLAMA_MODEL"] ?? "nomic-embed-text",
  });
});

export default router;
