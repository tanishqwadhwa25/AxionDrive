import express from "express";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  app.post("/api/query", async (req, res) => {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ error: "Query is required" });
    }
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 60000);

      const response = await fetch("http://localhost:5678/webhook/car-query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: query }),
        signal: controller.signal
      });
      clearTimeout(timeout);

      const text = await response.text();
    console.log("Raw n8n response:", text.substring(0, 200));
    let answer = "";
    let csv = "";
    try {
      const parsed = JSON.parse(text);
      answer = parsed.answer || "";
      csv = parsed.csv || "";
    } catch {
      answer = text;
    }
    if (!answer || !answer.trim()) {
      res.json({
        type: "text",
        answer: "Sorry, I couldn't process your request. Please try again.",
        html: "",
        csv: "",
        metadata: { title: query.substring(0, 50), timestamp: new Date().toISOString() }
      });
      return;
    }
    const trimmed = answer.trim().toLowerCase();
    const isHtml = trimmed.startsWith("<!doctype") || trimmed.startsWith("<html");
    res.json({
      type: isHtml ? "dashboard" : "text",
      answer: isHtml ? "" : answer,
      html: isHtml ? answer : "",
      csv: isHtml ? csv : "",
      metadata: { title: query.substring(0, 50), timestamp: new Date().toISOString() }
    });
    } catch (error: any) {
      console.error("n8n Error:", error);
      res.status(500).json({ error: "Failed to connect to n8n workflow." });
    }
  });

  app.post("/api/send-email", async (req, res) => {
    const { email, html } = req.body;
    if (!email || !html) {
      return res.status(400).json({ error: "Email and html are required" });
    }
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000);
      const response = await fetch("http://localhost:5678/webhook/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, html }),
        signal: controller.signal
      });
      clearTimeout(timeout);
      res.json({ success: true, message: `Report sent to ${email}` });
    } catch (error: any) {
      console.error("Email Error:", error);
      res.status(500).json({ error: "Failed to send email" });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();