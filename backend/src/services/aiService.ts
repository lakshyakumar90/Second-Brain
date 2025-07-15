import axios from "axios";
import { GEMINI_CONFIG } from "../config/constants";
import textract from "textract";
import pdfParse from "pdf-parse";
import fs from "fs";

const geminiApi = axios.create({
  baseURL: GEMINI_CONFIG.API_ENDPOINT,
  headers: {
    "Content-Type": "application/json",
    "x-goog-api-key": GEMINI_CONFIG.API_KEY,
  },
});

export async function summarizeContent(content: string) {
  const prompt = `You are an expert content summarizer. Read the following content and provide a concise, clear summary that captures the main points and key details.\n\nContent:\n${content}\n\nSummary:`;
  const response = await geminiApi.post(`/gemini-2.0-flash:generateContent`, {
    contents: [{ parts: [{ text: prompt }] }],
  });
  return response.data;
}

export async function suggestTags(content: string) {
  const prompt = `You are an intelligent assistant for content organization. Read the following content and suggest 5-10 relevant, concise tags (comma-separated) that best describe its topics, themes, and key concepts.\n\nContent:\n${content}\n\nTags:`;
  const response = await geminiApi.post(`/gemini-2.0-flash:generateContent`, {
    contents: [{ parts: [{ text: prompt }] }],
  });
  return response.data;
}

export async function categorizeContent(content: string) {
  const prompt = `You are an expert in content classification. Read the following content and suggest the most appropriate categories or topics it belongs to. Provide a short list of categories.\n\nContent:\n${content}\n\nCategories:`;
  const response = await geminiApi.post(`/gemini-2.0-flash:generateContent`, {
    contents: [{ parts: [{ text: prompt }] }],
  });
  return response.data;
}

export async function chatWithAI(
  messages: { role: string; content: string }[]
) {
  const systemPrompt = {
    role: "system",
    parts: [
      {
        text: "You are a helpful, knowledgeable AI assistant. Respond clearly, concisely, and contextually to the user’s questions or requests.",
      },
    ],
  };
  const formatted = [
    systemPrompt,
    ...messages.map((m) => ({ role: m.role, parts: [{ text: m.content }] })),
  ];
  const response = await geminiApi.post(`/gemini-2.0-flash:generateContent`, {
    contents: formatted,
  });
  return response.data;
}

export async function getAIInsights(content: string) {
  const prompt = `You are an AI insights engine. Analyze the following content and provide actionable insights, key takeaways, and any interesting patterns or observations.\n\nContent:\n${content}\n\nInsights:`;
  const response = await geminiApi.post(`/gemini-2.0-flash:generateContent`, {
    contents: [{ parts: [{ text: prompt }] }],
  });
  return response.data;
}

export async function extractText(filePath: string) {
  if (!fs.existsSync(filePath)) {
    throw new Error("File not found");
  }
  const ext = filePath.split(".").pop()?.toLowerCase();
  if (ext === "pdf") {
    const data = await pdfParse(fs.readFileSync(filePath));
    return { text: data.text };
  } else if (["docx", "txt"].includes(ext || "")) {
    return new Promise((resolve, reject) => {
      textract.fromFileWithPath(filePath, (err, text) => {
        if (err) return reject(err);
        resolve({ text });
      });
    });
  } else {
    throw new Error("Unsupported file type for text extraction");
  }
}

export async function generateContent(promptInput: string, type: string) {
  const prompt = `You are a creative AI assistant. Based on the following prompt, generate high-quality ${type} content. Be original, relevant, and engaging.\n\nPrompt:\n${promptInput}\n\n${
    type.charAt(0).toUpperCase() + type.slice(1)
  }:`;
  const response = await geminiApi.post(`/gemini-2.0-flash:generateContent`, {
    contents: [{ parts: [{ text: prompt }] }],
  });
  return response.data;
}

export async function analyzeContent(content: string) {
  const prompt = `You are an advanced content analysis AI. Analyze the following content for sentiment, tone, complexity, and key topics. Provide a structured analysis.\n\nContent:\n${content}\n\nAnalysis:`;
  const response = await geminiApi.post(`/gemini-2.0-flash:generateContent`, {
    contents: [{ parts: [{ text: prompt }] }],
  });
  return response.data;
}
