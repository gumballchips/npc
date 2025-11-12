import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

// memory store per player
const sessions = {};

app.post("/chat", async (req, res) => {
  const { prompt, playerId } = req.body;
  if (!prompt) return res.status(400).json({ error: "Missing prompt" });

  // initialize session
  if (!sessions[playerId]) sessions[playerId] = [];

  // keep last few messages only
  const history = sessions[playerId];
  history.push({ role: "user", content: prompt });
  if (history.length > 6) history.shift();

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a friendly, helpful Roblox NPC who remembers short conversations." },
        ...history
      ],
      max_tokens: 120
    })
  });

  const data = await response.json();
  const reply = data.choices?.[0]?.message?.content || "I'm not sure what to say.";

  // save AI reply into history
  history.push({ role: "assistant", content: reply });

  res.json({ reply });
});

app.listen(3000, () => console.log("AI proxy with memory running on port 3000"));
