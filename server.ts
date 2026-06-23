import dotenv from "dotenv";
dotenv.config(); // Load .env
dotenv.config({ path: ".env.example" }); // Fallback to .env.example
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Parse JSON bodies (as sent by API clients)
  app.use(express.json());

  // API routes
  app.get("/api/leaderboard", async (req, res) => {
    const GAS_URL = process.env.VITE_GAS_URL || process.env.GAS_URL;
    const API_SECRET = process.env.VITE_API_SECRET || process.env.API_SECRET;
    
    if (!GAS_URL || !API_SECRET) {
      return res.status(500).json({ status: "error", message: "Internal Server Error: Missing environment variables" });
    }
  
    try {
      const payload = { action: 'read', secret: API_SECRET };
      const response = await fetch(GAS_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
  
      const responseText = await response.text();
      try {
        const data = JSON.parse(responseText);
        return res.status(200).json(data);
      } catch (parseError) {
        console.error("Failed to parse GAS response:", responseText);
        return res.status(502).json({ status: "error", message: "Invalid response from GAS: " + responseText.substring(0, 100) });
      }
    } catch (error: any) {
      console.error("Leaderboard API Error:", error);
      return res.status(500).json({ status: "error", message: error.message });
    }
  });

  app.post("/api/leaderboard", async (req, res) => {
    const GAS_URL = process.env.VITE_GAS_URL || process.env.GAS_URL;
    const API_SECRET = process.env.VITE_API_SECRET || process.env.API_SECRET;
    
    if (!GAS_URL || !API_SECRET) {
      return res.status(500).json({ status: "error", message: "Internal Server Error: Missing environment variables" });
    }
  
    try {
      // 3 [방어] 클라이언트 body에서 action과 secret 필드는 반드시 제거 후 병합
      const { action, secret, ...safeBody } = req.body || {};
      const payload = {
        action: 'write',
        secret: API_SECRET,
        ...safeBody
      };
  
      const response = await fetch(GAS_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
  
      const responseText = await response.text();
      try {
        const data = JSON.parse(responseText);
        return res.status(200).json(data);
      } catch (parseError) {
        console.error("Failed to parse GAS response:", responseText);
        return res.status(502).json({ status: "error", message: "Invalid response from GAS: " + responseText.substring(0, 100) });
      }
    } catch (error: any) {
      console.error("Leaderboard API Error:", error);
      return res.status(500).json({ status: "error", message: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
