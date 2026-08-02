import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini Client server-side
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// API Route for AI reaction explanations
app.post("/api/explain-reaction", async (req, res) => {
  try {
    const { rxnName, equation, reactivity, product, reactants, temp, byproducts } = req.body;

    const reactantsFormatted = Array.isArray(reactants)
      ? reactants.map((r: { amount: number; name: string; sym: string }) => `${r.amount} moles of ${r.name} (${r.sym})`).join(", ")
      : "selected elements";

    const byproductsText = Array.isArray(byproducts) && byproducts.length > 0 
      ? byproducts.join(", ") 
      : "heat release";

    const prompt = `You are a distinguished research chemist explaining a chemical reaction occurring inside a laboratory vessel.
Input Reactants: ${reactantsFormatted}
Reaction Name: ${rxnName}
Chemical Equation: ${equation}
Reactivity Level: ${reactivity}
Primary Product: ${product}
Byproducts / Energy: ${byproductsText}
Estimated Thermal Output: ${temp || 300} K

Task: Write a clear, grammatically impeccable, 2-3 sentence scientific narrative explaining the chemical mechanism, stoichiometric ratio significance, molecular bonding shifts, and thermal behavior.
Requirements:
- Ensure smooth, natural, human-like English.
- DO NOT use LaTeX formatting like $H_2O$ or $h_03$. DO NOT use underscore notation like H_2O or HO_2.
- Use standard clean chemical symbols and Unicode subscripts (e.g. H₂O, H₂O₂, HO₂, Ho₂O₃, CO₂, Fe₂O₃, NaCl, 2H₂ + O₂ → 2H₂O).
- Clearly mention why the specific ratio of reactants forms this exact product (e.g., distinguishing H₂O vs H₂O₂ vs HO₂, or Holmium oxide Ho₂O₃ vs Water).
- Keep it educational, engaging, and professional.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
    });

    let explanation = response.text?.trim() || null;
    if (explanation) {
      explanation = explanation
        .replace(/\$([^\$]+)\$/g, "$1")
        .replace(/_(\d+)/g, (_, n) => ["₀","₁","₂","₃","₄","₅","₆","₇","₈","₉"][n] || n)
        .replace(/([A-Z][a-z]?|\))(\d+)/g, (_, s, n) => s + n.split("").map((digit: string) => ["₀","₁","₂","₃","₄","₅","₆","₇","₈","₉"][parseInt(digit, 10)] || digit).join(""));
    }
    res.json({ success: true, explanation });
  } catch (error) {
    console.error("Error generating reaction explanation:", error);
    res.status(500).json({ success: false, error: "Failed to generate narrative" });
  }
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
