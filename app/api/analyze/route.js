import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "API Key missing in .env.local" }, { status: 500 });
    }

    const contentType = req.headers.get("content-type");

    // --- HELPER: Fix MIME Types for Gemini ---
    const getGeminiMimeType = (file) => {
      const ext = file.name.split('.').pop().toLowerCase();
      
      // Force correct MIME types for Gemini compatibility
      const typeMap = {
        'm4a': 'audio/mp4',
        'mp4': 'audio/mp4',
        'mp3': 'audio/mp3',
        'wav': 'audio/wav',
        'aac': 'audio/aac',
        'flac': 'audio/flac',
        'ogg': 'audio/ogg',
        'oga': 'audio/ogg',
        'opus': 'audio/opus',
        'webm': 'audio/webm'
      };

      // Return mapped type or fallback to browser's detected type
      return typeMap[ext] || file.type || 'audio/mp3';
    };

    // --- HELPER: Parse JSON Response ---
    const parseGeminiJson = (text) => {
      try {
        const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();
        return JSON.parse(cleanText);
      } catch (e) {
        return { title: "Lecture Analysis", markdown: text };
      }
    };

    const genAI = new GoogleGenerativeAI(apiKey);
    const modelConfig = {
      model: "gemini-2.5-flash",
      generationConfig: { responseMimeType: "application/json" }
    };

    // ==========================================
    // MODE 1: Text transcript
    // ==========================================
    if (contentType?.includes("application/json")) {
      const body = await req.json();
      const { transcript, language } = body;

      if (!transcript?.trim()) {
        return NextResponse.json({ error: "No transcript provided" }, { status: 400 });
      }

      let langInstruction = "Standard English";
      if (language === "bangla") {
        langInstruction = "Bangla (Bengali) mixed with English technical terms.";
      }

      const model = genAI.getGenerativeModel(modelConfig);
      const prompt = `Analyze this transcript. Language: ${langInstruction}. Return JSON with "title" and "markdown" notes. Transcript: ${transcript}`;

      const result = await model.generateContent(prompt);
      const data = parseGeminiJson(result.response.text());
      
      return NextResponse.json({ result: data.markdown, title: data.title });
    }
    
    // ==========================================
    // MODE 2: Audio file
    // ==========================================
    else if (contentType?.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file");
      const language = formData.get("language");

      if (!file) return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
      if (file.size > 20 * 1024 * 1024) return NextResponse.json({ error: "File too large. Max 20MB." }, { status: 400 });

      console.log(`🎵 Processing Audio: ${file.name}`);

      let langInstruction = "Standard English";
      if (language === "bangla") {
        langInstruction = "Bangla (Bengali) mixed with English technical terms.";
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const base64Audio = buffer.toString("base64");
      
      // Calculate correct MIME type
      const mimeType = getGeminiMimeType(file);
      console.log(`ℹ️ Using MIME Type: ${mimeType}`);

      // Robust model list (added 1.5-flash as fallback for wider audio support)
      const modelsToTry = ["gemini-2.5-flash", "gemini-1.5-pro", "gemini-1.5-flash"];
      let finalData = null;
      const modelErrors = [];

      for (const modelName of modelsToTry) {
        try {
          const model = genAI.getGenerativeModel({ ...modelConfig, model: modelName });
          
          const prompt = `Listen to this lecture.
          Language: ${langInstruction}

          Return a JSON object with:
          1. "title": A short, professional title summarizing the Concept.
          2. "markdown": The comprehensive study notes in Markdown.

          Markdown Structure:
          ## 📝 Summary
          ## 🎯 Key Concepts
          ## 📌 Exam Focus
          ## ❓ Practice Questions
          `;

          const result = await model.generateContent([
            prompt,
            { inlineData: { mimeType: mimeType, data: base64Audio } },
          ]);

          finalData = parseGeminiJson(result.response.text());
          console.log(`✅ Success with ${modelName}`);
          break; 
        } catch (e) {
          console.log(`❌ ${modelName} failed: ${e.message}`);
          modelErrors.push({ model: modelName, error: e.message });
        }
      }

      if (!finalData) {
        console.error("All model attempts failed:", modelErrors);
        return NextResponse.json({ error: "Failed to analyze audio. The format might not be supported.", details: modelErrors }, { status: 502 });
      }

      return NextResponse.json({ result: finalData.markdown, title: finalData.title });
    } 
    else {
      return NextResponse.json({ error: "Invalid Content-Type" }, { status: 400 });
    }

  } catch (error) {
    console.error("🔥 SERVER ERROR:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}