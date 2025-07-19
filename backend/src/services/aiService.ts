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

export async function summarizeContent(content: string): Promise<any> {
  const prompt = `You are an expert content summarizer. Read the following content and provide a concise, clear summary that captures the main points and key details.\n\nContent:\n${content}\n\nSummary:`;
  const response = await geminiApi.post(`/gemini-2.0-flash:generateContent`, {
    contents: [{ parts: [{ text: prompt }] }],
  });
  return response.data;
}

export async function suggestTags(content: string): Promise<any> {
  const prompt = `Based on the following content, suggest 5-10 relevant tags that would help categorize and find this content later. Return them as a comma-separated list.\n\nContent:\n${content}\n\nTags:`;
  const response = await geminiApi.post(`/gemini-2.0-flash:generateContent`, {
    contents: [{ parts: [{ text: prompt }] }],
  });
  return response.data;
}

export async function categorizeContent(content: string): Promise<any> {
  const prompt = `Analyze the following content and categorize it into one of these categories: Work, Personal, Learning, Projects, Ideas, or Other. Provide a brief explanation for your choice.\n\nContent:\n${content}\n\nCategory and explanation:`;
  const response = await geminiApi.post(`/gemini-2.0-flash:generateContent`, {
    contents: [{ parts: [{ text: prompt }] }],
  });
  return response.data;
}

export async function chatWithAI(messages: any[]): Promise<any> {
  const response = await geminiApi.post(`/gemini-2.0-flash:generateContent`, {
    contents: messages.map(msg => ({ parts: [{ text: msg.content }] })),
  });
  return response.data;
}

export async function getAIInsights(itemId: string): Promise<any> {
  // This would typically fetch the item content and provide insights
  const prompt = `Provide insights and analysis for the content with ID: ${itemId}. Include key themes, important points, and actionable insights.`;
  const response = await geminiApi.post(`/gemini-2.0-flash:generateContent`, {
    contents: [{ parts: [{ text: prompt }] }],
  });
  return response.data;
}

export async function generateContent(prompt: string, type: string): Promise<any> {
  const fullPrompt = `Generate ${type} content based on the following prompt:\n\n${prompt}`;
  const response = await geminiApi.post(`/gemini-2.0-flash:generateContent`, {
    contents: [{ parts: [{ text: fullPrompt }] }],
  });
  return response.data;
}

export async function extractText(fileId: string): Promise<{ text: string }> {
  // This would typically fetch the file path from database using fileId
  const filePath = `/path/to/file/${fileId}`; // Replace with actual file path logic
  
  if (!fs.existsSync(filePath)) {
    throw new Error("File not found");
  }
  
  const ext = filePath.split(".").pop()?.toLowerCase();
  
  if (ext === "pdf") {
    const data = await pdfParse(fs.readFileSync(filePath));
    return { text: data.text };
  } else if (["docx", "txt"].includes(ext || "")) {
    return new Promise((resolve, reject) => {
      textract.fromFileWithPath(filePath, (err: Error | null, text?: string) => {
        if (err) return reject(err);
        resolve({ text: text || '' });
      });
    });
  } else {
    throw new Error("Unsupported file type for text extraction");
  }
}

export async function analyzeContent(content: string): Promise<any> {
  const prompt = `Analyze the following content and provide:\n1. Key themes and topics\n2. Sentiment analysis\n3. Complexity level\n4. Potential improvements or insights\n\nContent:\n${content}\n\nAnalysis:`;
  const response = await geminiApi.post(`/gemini-2.0-flash:generateContent`, {
    contents: [{ parts: [{ text: prompt }] }],
  });
  return response.data;
} 