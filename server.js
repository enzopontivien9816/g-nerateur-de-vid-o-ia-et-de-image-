const express = require("express");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 3000;
let last = 0;

app.use(express.static(path.join(__dirname, "public")));

app.get("/api/image", async (req, res) => {
  const prompt = String(req.query.prompt || "").slice(0, 1200).trim();
  if (!prompt) return res.status(400).json({ error: "Écris un prompt." });
  const wait = 15000 - (Date.now() - last);
  if (wait > 0) return res.status(429).json({ error: "Patiente " + Math.ceil(wait / 1000) + " s, puis réessaie." });
  last = Date.now();
  const url = "https://image.pollinations.ai/prompt/" + encodeURIComponent(prompt) +
    "?model=flux&width=768&height=1344&seed=" + Math.floor(Math.random() * 1e6);
  try {
    const r = await fetch(url);
    if (!r.ok) return res.status(502).json({ error: "Le générateur a répondu " + r.status + ". Réessaie plus tard." });
    res.set("Content-Type", r.headers.get("content-type") || "image/jpeg");
    res.send(Buffer.from(await r.arrayBuffer()));
  } catch (e) {
    res.status(502).json({ error: "Générateur injoignable." });
  }
});

app.listen(PORT, () => console.log("Ouvre http://localhost:" + PORT));
