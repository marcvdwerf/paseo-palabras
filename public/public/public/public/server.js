import express from "express";
import multer from "multer";
import OpenAI from "openai";
import cors from "cors";
import fs from "fs";

const app = express();
app.use(cors());

const upload = multer({ dest: "uploads/" });

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.post("/api/analyze", upload.single("photo"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image uploaded" });
    }

    // lees afbeelding als buffer
    const imageBuffer = fs.readFileSync(req.file.path);
    const base64Image = imageBuffer.toString("base64");

    // stuur naar vision model
    const result = await client.chat.completions.create({
      model: "gpt-4o", // Vision werkt PERFECT op dit model
      messages: [
        {
          role: "user",
          content: [
            {
              type: "input_image",
              image_url: `data:image/jpeg;base64,${base64Image}`
            },
            {
              type: "text",
              text: `Identify the main object. Return JSON only:

{
  "label": "object label",
  "translation": "Spanish translation",
  "description": "very short description"
}`
            }
          ]
        }
      ]
    });

    // parse AI output
    const json = JSON.parse(result.choices[0].message.content);

    res.json({
      labels: [json]
    });

  } catch (err) {
    console.error("SERVER ERROR:", err);
    res.status(500).json({ error: err.toString() });
  }
});

export default app;
