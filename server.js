import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

// Replace with your OpenAI API key or any AI service you use
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

app.post("/chat", async (req, res) => {
  const { prompt, playerId } = req.body;

  if (!prompt) {
    return res.json({ reply: "No prompt received." });
  }

  try {
    // Call OpenAI API (ChatGPT)
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are a friendly Roblox NPC with personality. Loves white, hates black, wears a ghost dunce cap." },
          { role: "user", content: prompt }
        ],
        max_tokens: 50
      })
    });

    const data = await response.json();
    const aiReply = data.choices?.[0]?.message?.content || "Hmm... I have no idea.";

    res.json({ reply: aiReply });

  } catch (err) {
    console.error(err);
    res.json({ reply: "I'm having trouble thinking right now." });
  }
});

// Health check endpoint
app.get("/", (req, res) => res.send("Proxy running"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Proxy running on port ${PORT}`);
});

