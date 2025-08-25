import axios from "axios";
import { GEMINI_CONFIG } from "../config/constants";
import textract from "textract";
import pdfParse from "pdf-parse";
import fs from "fs";

// Check if Gemini API key is configured
const isGeminiConfigured = () => {
  return GEMINI_CONFIG.API_KEY && GEMINI_CONFIG.API_KEY.trim() !== '';
};

const geminiApi = axios.create({
  baseURL: GEMINI_CONFIG.API_ENDPOINT,
  headers: {
    "Content-Type": "application/json",
    "x-goog-api-key": GEMINI_CONFIG.API_KEY,
  },
});

// Helper function to handle API calls with proper error handling
async function makeGeminiRequest(prompt: string, operation: string) {
  if (!isGeminiConfigured()) {
    throw new Error(`Gemini API key not configured. Please set GEMINI_API_KEY environment variable for ${operation}.`);
  }

  try {
    const response = await geminiApi.post(`/gemini-2.0-flash:generateContent`, {
      contents: [{ parts: [{ text: prompt }] }],
    });
    
    // Extract the generated text from Gemini response
    const generatedText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!generatedText) {
      throw new Error('Invalid response format from Gemini API');
    }
    
    return generatedText;
  } catch (error: any) {
    if (error.response?.status === 401) {
      throw new Error('Invalid Gemini API key. Please check your configuration.');
    } else if (error.response?.status === 429) {
      throw new Error('Gemini API rate limit exceeded. Please try again later.');
    } else if (error.response?.status >= 400) {
      throw new Error(`Gemini API error: ${error.response?.data?.error?.message || error.message}`);
    }
    throw new Error(`Failed to call Gemini API: ${error.message}`);
  }
}

export async function summarizeContent(content: string): Promise<any> {
  const prompt = `You are an expert content summarizer. Read the following content and provide a concise, clear summary that captures the main points and key details.\n\nContent:\n${content}\n\nSummary:`;
  const summary = await makeGeminiRequest(prompt, 'summarization');
  
  return {
    summary,
    keyPoints: summary.split('. ').slice(0, 3), // Extract first 3 sentences as key points
    wordCount: summary.split(' ').length
  };
}

export async function suggestTags(content: string): Promise<any> {
  const prompt = `Based on the following content, suggest 5-10 relevant tags that would help categorize and find this content later. Return them as a comma-separated list.\n\nContent:\n${content}\n\nTags:`;
  const tagsText = await makeGeminiRequest(prompt, 'tag suggestion');
  
  // Parse comma-separated tags and clean them
  const tags = tagsText
    .split(',')
    .map((tag: string) => tag.trim())
    .filter((tag: string) => tag.length > 0)
    .slice(0, 10); // Limit to 10 tags
  
  return {
    tags,
    confidence: 0.8 // Default confidence
  };
}

export async function categorizeContent(content: string): Promise<any> {
  const prompt = `Analyze the following content and categorize it into one of these categories: Work, Personal, Learning, Projects, Ideas, or Other. Provide a brief explanation for your choice.\n\nContent:\n${content}\n\nCategory and explanation:`;
  const response = await makeGeminiRequest(prompt, 'categorization');
  
  // Extract category from response (first word before any punctuation)
  const categoryMatch = response.match(/^(Work|Personal|Learning|Projects|Ideas|Other)/i);
  const category = categoryMatch ? categoryMatch[1] : 'Other';
  
  return {
    category,
    confidence: 0.7, // Default confidence
    explanation: response
  };
}

export async function chatWithAI(messages: any[]): Promise<any> {
  if (!isGeminiConfigured()) {
    throw new Error('Gemini API key not configured. Please set GEMINI_API_KEY environment variable for chat functionality.');
  }

  try {
    const response = await geminiApi.post(`/gemini-2.0-flash:generateContent`, {
      contents: messages.map(msg => ({ parts: [{ text: msg.content }] })),
    });
    
    const generatedText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!generatedText) {
      throw new Error('Invalid response format from Gemini API');
    }
    
    return {
      message: generatedText,
      chatId: `chat_${Date.now()}`,
      usage: {
        promptTokens: 0, // Gemini doesn't provide token usage in this format
        completionTokens: 0,
        totalTokens: 0
      }
    };
  } catch (error: any) {
    if (error.response?.status === 401) {
      throw new Error('Invalid Gemini API key. Please check your configuration.');
    }
    throw new Error(`Failed to chat with AI: ${error.message}`);
  }
}

export async function getAIInsights(itemId: string): Promise<any> {
  const prompt = `Provide insights and analysis for the content with ID: ${itemId}. Include key themes, important points, and actionable insights.`;
  const insights = await makeGeminiRequest(prompt, 'insights');
  
  return {
    themes: insights.split('. ').slice(0, 3),
    sentiment: 'neutral', // Default sentiment
    complexity: 'medium', // Default complexity
    insights: [insights],
    suggestions: []
  };
}

export async function generateContent(prompt: string, type: string): Promise<any> {
  const fullPrompt = `Generate ${type} content based on the following prompt:\n\n${prompt}`;
  const content = await makeGeminiRequest(fullPrompt, 'content generation');
  
  return {
    content,
    type
  };
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
  const prompt = `Analyze the following content and provide:\n1. Key themes and topics\n2. Sentiment analysis (positive/negative/neutral)\n3. Complexity level (low/medium/high)\n4. Potential improvements or insights\n\nContent:\n${content}\n\nAnalysis:`;
  const analysis = await makeGeminiRequest(prompt, 'content analysis');
  
  // Parse the analysis to extract structured data
  const lines = analysis.split('\n').filter((line: string) => line.trim());
  const themes = lines.filter((line: string) => line.includes('theme') || line.includes('topic')).slice(0, 3);
  const sentiment = analysis.toLowerCase().includes('positive') ? 'positive' : 
                   analysis.toLowerCase().includes('negative') ? 'negative' : 'neutral';
  const complexity = analysis.toLowerCase().includes('high') ? 'high' :
                    analysis.toLowerCase().includes('low') ? 'low' : 'medium';
  
  return {
    themes: themes.length > 0 ? themes : ['general'],
    sentiment,
    complexity,
    insights: [analysis],
    suggestions: []
  };
} 