import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "API Key missing in .env.local" }, { status: 500 });
    }

    const contentType = req.headers.get("content-type");

    // ==========================================
    // MODE 1: Text transcript
    // ==========================================
    if (contentType?.includes("application/json")) {
      const body = await req.json();
      const { transcript, language } = body; // <--- Capture language here

      if (!transcript?.trim()) {
        return NextResponse.json({ error: "No transcript provided" }, { status: 400 });
      }

      // Determine Language Style
      let langInstruction = "Standard English";
      if (language === "bangla") {
        langInstruction = "Bangla (Bengali) mixed with English technical terms. Explain concepts in Bangla but keep important keywords/definitions in English (Banglish style).";
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      const prompt = `Create comprehensive study notes from this lecture transcript.
      
      Language Requirement: ${langInstruction}

      Format as markdown with:
      ## 📝 Summary
      ## 🎯 Key Concepts
      ## 📌 Exam Focus
      ## ❓ Practice Questions
      
      Transcript: ${transcript}`;

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      
      return NextResponse.json({ result: text });
    }
    
    // ==========================================
    // MODE 2: Audio file
    // ==========================================
    else if (contentType?.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file");
      const language = formData.get("language"); // <--- Capture language here

      if (!file) {
        return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
      }

      // Vercel Limit Warning: files over 4.5MB will fail on deployed sites.
      // Works fine on localhost up to ~19MB.
      if (file.size > 19 * 1024 * 1024) {
         return NextResponse.json({ error: "File too large. Max 19MB for this method." }, { status: 400 });
      }

      console.log(`🎵 Processing Audio: ${file.name}`);

      // Determine Language Style
      let langInstruction = "Standard English";
      if (language === "bangla") {
        langInstruction = "Bangla (Bengali) mixed with English technical terms. Explain concepts in Bangla but keep important keywords/definitions in English (Banglish style).";
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const base64Audio = buffer.toString("base64");

      const genAI = new GoogleGenerativeAI(apiKey);
      
      // Using new Gemini 2.5 models
      const modelsToTry = [
        "gemini-2.5-flash",       // Best for speed/audio
        "gemini-2.5-pro",         // Best for reasoning
        "gemini-3-pro-preview"    // Latest experimental
      ];

      let finalResult = null;
      let errorLog = "";

      for (const modelName of modelsToTry) {
        try {
          console.log(`🔄 Attempting with model: ${modelName}...`);
          const model = genAI.getGenerativeModel({ model: modelName });

          const prompt = `Listen to this lecture audio and create comprehensive study notes.
          
          Language Requirement: ${langInstruction}

          Format exactly as markdown:
          ## 📝 Summary
          (Brief overview)
          ## 🎯 Key Concepts
          (Bullet points with definitions)
          ## 📌 Exam Focus
          (What students should memorize)
          ## ❓ Practice Questions
          (5 questions)
          `;

          const result = await model.generateContent([
            prompt,
            {
              inlineData: {
                mimeType: file.type || "audio/mp3",
                data: base64Audio,
              },
            },
          ]);

          finalResult = result.response.text();
          console.log(`✅ Success with ${modelName}`);
          break; // Stop loop if successful
          
        } catch (modelError) {
          console.log(`❌ ${modelName} Failed: ${modelError.message}`);
          errorLog += `[${modelName}: ${modelError.message}] `;
        }
      }
      
      if (!finalResult) {
        throw new Error(`All models failed. Details: ${errorLog}`);
      }

      return NextResponse.json({ result: finalResult });
    } 
    
    else {
      return NextResponse.json({ error: "Invalid Content-Type" }, { status: 400 });
    }

  } catch (error) {
    console.error("🔥 SERVER ERROR:", error);
    return NextResponse.json({ 
      error: error.message || "Internal Server Error" 
    }, { status: 500 });
  }
}