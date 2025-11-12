import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 10000; // Use Render’s detected port
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  console.error("ERROR: OPENAI_API_KEY not set!");
}

app.post("/chat", async (req, res) => {
  const { prompt, playerId } = req.body;

  console.log("[Proxy] Received prompt:", prompt, "from playerId:", playerId);

  if (!prompt) {
    return res.json({ reply: "No prompt received." });
  }

  try {
    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are a friendly Roblox NPC. You love white, hate black, and wear a ghost dunce cap. Be lively, creative, and respond to the player naturally." },
          { role: "user", content: prompt }
        ],
        max_tokens: 100
      })
    });

    const data = await openaiResponse.json();
    console.log("[Proxy] OpenAI raw response:", data);

    // Extract reply safely
    const aiReply = data.choices?.[0]?.message?.content?.trim() || "Hmm... I have no idea.";

    console.log("[Proxy] Replying to Roblox:", aiReply);
    res.json({ reply: aiReply });

  } catch (err) {
    console.error("[Proxy] Error calling OpenAI:", err);
    res.json({ reply: "I'm having trouble thinking right now." });
  }
});

// Simple health check
app.get("/", (req, res) => {
  res.send("AI proxy running and ready.");
});

app.listen(PORT, () => {
  console.log(`[Proxy] AI proxy running on port ${PORT}`);
  console.log(`[Proxy] Available at: https://npc-zwou.onrender.com`);
});

