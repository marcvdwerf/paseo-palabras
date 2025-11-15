import express from "express";
import multer from "multer";
import OpenAI from "openai";
import cors from "cors";
import fs from "fs";

const app = express();
app.use(cors());

// foto uploaden
const upload = multer({ dest: "uploads/" });

// OpenAI client
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// AI endpoint
app.post("/api/analyze", upload.single("photo"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No image provided" });

    const imgBuffer = fs.readFileSync(req.file.path);

    const result = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            { type: "input_image", image_url: req.file.path },
            {
              type: "text",
              text: "Identify the object and translate it into Spanish. Return JSON with label, translation, description."
            }
          ]
        }
      ]
    });

    const json = JSON.parse(result.choices[0].message.content);
    res.json({ labels: [json] });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.toString() });
  }
});

export default app;
