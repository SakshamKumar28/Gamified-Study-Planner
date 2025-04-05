const express = require("express");
const { GoogleGenAI } = require("@google/genai");
require("dotenv").config();

const router = express.Router();

const cors = require("cors");
const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:3000", // Fallback to localhost if FRONTEND_URL is not set
  methods: ["POST"],
  credentials: true,
};
router.use(cors(corsOptions));

// Ensure the API key is provided
if (!process.env.GEMINI_API_KEY) {
  console.error("Error: GEMINI_API_KEY is not set in the environment variables.");
  throw new Error("Missing GEMINI_API_KEY in environment variables.");
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

router.post("/assistant", async (req, res) => {
  const { message } = req.body;

  if (!message || typeof message !== "string") {
    return res.status(400).json({ error: "Invalid or missing 'message' in request body." });
  }

  try {
    const chatCompletion = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [message], // Ensure this matches the API's expected format
    });

    if (!chatCompletion || !chatCompletion.choices || !chatCompletion.choices[0]) {
      throw new Error("Invalid response from AI model.");
    }

    const reply = chatCompletion.choices[0].content;
    console.log("AI Assistant Reply:", reply);
    res.json({ reply });
  } catch (error) {
    console.error("AI Assistant Error:", error.message || error);
    res.status(500).json({ error: error.message || "Something went wrong with the assistant." });
  }
});

module.exports = router;