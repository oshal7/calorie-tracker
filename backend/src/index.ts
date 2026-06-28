import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";

export interface Env {
  ANTHROPIC_API_KEY: string;
  APP_SHARED_SECRET: string;
}

const MEAL_TYPES = ["breakfast", "lunch", "dinner", "snack"] as const;

const ParsedMealSchema = z.object({
  items: z.array(
    z.object({
      name: z.string(),
      quantity: z.string(),
      estimatedCalories: z.number(),
    }),
  ),
  totalCalories: z.number(),
  mealType: z.enum(MEAL_TYPES),
  confidence: z.enum(["high", "medium", "low"]),
});

const RequestBodySchema = z.object({
  text: z.string().min(1).max(2000),
  mealType: z.enum(MEAL_TYPES),
});

const SYSTEM_PROMPT = `You estimate calories for meals described in casual, everyday language by a person living in Bangalore, India. Food descriptions will often be Indian dishes (idli, dosa, sambar, filter coffee, poha, upma, paratha, dal, roti, biryani, etc.) described informally, sometimes in Hindi/Kannada-English mixed phrasing, often as quick bachelor meals or restaurant/swiggy-style orders.

For each distinct food/drink item mentioned:
- Infer a reasonable typical serving size if not stated (e.g. "idli" defaults to a standard ~75g idli, "filter coffee" defaults to a standard ~150ml cup with milk and sugar).
- Estimate calories using standard Indian nutrition references (e.g. IFCT 2017 values) as your mental anchor for common Indian foods, not generic Western equivalents.
- Keep "quantity" human-readable (e.g. "2", "1 bowl", "1 cup").

Set "confidence" to "low" if quantities or portion sizes are vague or ambiguous, "medium" if mostly clear but with some assumptions, "high" if explicit and unambiguous.

"totalCalories" must equal the sum of all item estimatedCalories, rounded to the nearest 10.

Use the mealType the user specified unless the text clearly describes a different meal (e.g. text says "for dinner" but mealType says lunch) — in that case prefer what the text says.`;

function corsHeaders(): HeadersInit {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders() },
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders() });
    }

    const url = new URL(request.url);
    if (url.pathname !== "/parse-meal" || request.method !== "POST") {
      return jsonResponse({ error: "Not found" }, 404);
    }

    const authHeader = request.headers.get("Authorization") ?? "";
    if (authHeader !== `Bearer ${env.APP_SHARED_SECRET}`) {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }

    let body: z.infer<typeof RequestBodySchema>;
    try {
      body = RequestBodySchema.parse(await request.json());
    } catch (err) {
      return jsonResponse({ error: "Invalid request body" }, 400);
    }

    const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });

    try {
      const response = await client.beta.messages.parse({
        model: "claude-haiku-4-5",
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: "user",
            content: `Meal type: ${body.mealType}\nDescription: ${body.text}`,
          },
        ],
        output_format: betaZodOutputFormat(ParsedMealSchema),
      });

      if (!response.parsed_output) {
        return jsonResponse({ error: "Failed to parse meal" }, 502);
      }

      return jsonResponse(response.parsed_output);
    } catch (err) {
      console.error("Claude request failed:", err);
      return jsonResponse({ error: "Meal parsing service unavailable" }, 502);
    }
  },
};
