import express from "express";
import fs from "fs";
import formidable from "formidable";
import path from "path";
import vision from "@google-cloud/vision";
import { fileURLToPath } from "url";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["POST"],
    allowedHeaders: ["Content-Type"],
  })
);

const keyFilePath = path.join(__dirname, "service-account-key.json");

if (process.env.GOOGLE_CLOUD_KEY) {
  fs.writeFileSync(
    keyFilePath,
    Buffer.from(process.env.GOOGLE_CLOUD_KEY, "base64")
  );
}

const client = new vision.ImageAnnotatorClient({
  keyFilename: keyFilePath,
});

app.post("/detect-mood", async (req, res) => {
  const form = formidable({
    uploadDir: path.join(__dirname, "../uploads"),
    keepExtensions: true,
    maxFileSize: 5 * 1024 * 1024,
  });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(400).json({ error: "File parsing error" });
    }

    if (!files.selfie) {
      return res.status(400).json({ error: "No image file provided" });
    }

    const imagePath = files.selfie[0].filepath;

    try {
      const [result] = await client.faceDetection(imagePath);
      const faces = result.faceAnnotations;

      if (!faces || faces.length === 0) {
        return res.json({ mood: "neutral" });
      }

      const face = faces[0];
      const moods = {
        Joy: face.joyLikelihood,
        Sorrow: face.sorrowLikelihood,
        Anger: face.angerLikelihood,
        Surprise: face.surpriseLikelihood,
      };

      const likelihoodValues = {
        VERY_UNLIKELY: 1,
        UNLIKELY: 2,
        POSSIBLE: 3,
        LIKELY: 4,
        VERY_LIKELY: 5,
      };

      let mostProminentMood = "Neutral";
      let highestLikelihood = 0;

      for (const [mood, likelihood] of Object.entries(moods)) {
        const value = likelihoodValues[likelihood] || 0;
        if (value > highestLikelihood) {
          highestLikelihood = value;
          mostProminentMood = mood;
        }
      }

      //    fs.unlinkSync(imagePath);

      res.json({ mood: mostProminentMood });
    } catch (error) {
      console.error("Error:", error);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
      res.status(500).json({ error: "Error analyzing image" });
    }
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

export default app;
