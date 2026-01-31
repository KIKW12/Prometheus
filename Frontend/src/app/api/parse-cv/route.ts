import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const MODEL = process.env.GENAI_MODEL || "gemini-3-flash-preview";
const MAX_RETRIES = 3;

const CODE_FENCE_PATTERN = /^\s*```(?:json)?\s*|\s*```\s*$/gi;
const EXTRACT_PROMPT = `Extract the following information from the CV PDF and return ONLY valid JSON (no markdown, no extra text). DO NOT extract email address:
{
  "personal_info": {"name": "", "location": "", "image": ""},
  "education": [{"degree": "", "school": "", "start_date": "", "end_date": ""}],
  "job_experience": [{"role": "", "company": "", "description": "", "start_date": "", "end_date": ""}],
  "projects": [{"name": "", "description": "", "technologies": ""}],
  "skills": ""
}`;

function parseJsonResponse(text: string) {
  const cleaned = text.replace(CODE_FENCE_PATTERN, "").trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    // Single recovery attempt for common issues
    const recovered = cleaned
      .replace(/,([}\]])/g, "$1")      // trailing commas
      .replace(/:\s*'/g, ': "')         // single quotes in values
      .replace(/',/g, '",')             // single quotes before commas
      .replace(/'\s*}/g, '"}');         // single quotes before braces

    try {
      return JSON.parse(recovered);
    } catch {
      throw new Error(`Failed to parse JSON: ${cleaned.substring(0, 100)}`);
    }
  }
}

async function generateWithRetry(payload: { model: string; contents: Array<{ role: string; parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> }> }, retries = MAX_RETRIES) {
  let lastErr = null;
  for (let i = 0; i < retries; i++) {
    try {
      return await ai.models.generateContent(payload);
    } catch (err) {
      lastErr = err;
      if (i < retries - 1) {
        const waitMs = (1 << i) * 250;
        await new Promise((r) => setTimeout(r, waitMs));
      }
    }
  }
  throw lastErr;
}

async function extractCVData(base64Data: string) {
  const response = await generateWithRetry({
    model: MODEL,
    contents: [{
      role: "user",
      parts: [
        { text: EXTRACT_PROMPT },
        { inlineData: { mimeType: "application/pdf", data: base64Data } }
      ]
    }]
  });

  const rawText = response.text || response?.candidates?.[0]?.content?.parts?.[0]?.text || "";
  return parseJsonResponse(rawText);
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("cv") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No CV file provided" },
        { status: 400 }
      );
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Data = buffer.toString("base64");

    // Parse CV with Gemini
    const parsed = await extractCVData(base64Data);

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("CV parsing error:", error);
    return NextResponse.json(
      { error: "Failed to parse CV" },
      { status: 500 }
    );
  }
}
