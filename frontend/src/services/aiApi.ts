const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

// Mock responses for when backend is not available
const MOCK_RESPONSES = {
  summarize: {
    summary: "This is a mock summary of the provided content. The AI service is currently unavailable.",
    keyPoints: ["Mock point 1", "Mock point 2", "Mock point 3"],
    wordCount: 15
  },
  tags: {
    tags: ["mock", "ai", "test", "content"],
    confidence: 0.8
  },
  categorize: {
    category: "Technology",
    confidence: 0.9,
    explanation: "This content appears to be related to technology based on the keywords and context."
  },
  analyze: {
    themes: ["technology", "innovation", "development"],
    sentiment: "positive" as const,
    complexity: "medium" as const,
    insights: ["Content shows positive outlook on technology", "Well-structured information"],
    suggestions: ["Consider adding more specific examples", "Include technical details"]
  },
  chat: {
    message: "I'm currently in mock mode. The AI service is not available, but I can help you with basic responses.",
    chatId: "mock-chat-id",
    usage: {
      promptTokens: 10,
      completionTokens: 20,
      totalTokens: 30
    }
  }
};

// AI Request/Response Types
export interface AISummarizeRequest {
  itemId?: string;
  content: string;
}

export interface AISuggestTagsRequest {
  itemId?: string;
  content: string;
}

export interface AICategorizeRequest {
  itemId?: string;
  content: string;
}

export interface AIChatRequest {
  chatId?: string;
  message: string;
  contextItemIds?: string[];
}

export interface AIGenerateRequest {
  prompt: string;
  type: 'text' | 'image' | 'code';
}

export interface AIAnalyzeRequest {
  itemId?: string;
  content: string;
}

export interface AIExtractTextRequest {
  fileId: string;
}

export interface AIUsageStatsRequest {
  period: 'day' | 'month' | 'all';
}

export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
}

export interface AIChatResponse {
  message: string;
  chatId: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface AIUsageStats {
  totalRequests: number;
  requestsByType: Record<string, number>;
  tokensUsed: number;
  period: string;
}

export interface AISummarizeResponse {
  summary: string;
  keyPoints: string[];
  wordCount: number;
}

export interface AISuggestTagsResponse {
  tags: string[];
  confidence: number;
}

export interface AICategorizeResponse {
  category: string;
  confidence: number;
  explanation: string;
}

export interface AIGenerateResponse {
  content: string;
  type: string;
}

export interface AIAnalyzeResponse {
  themes: string[];
  sentiment: 'positive' | 'negative' | 'neutral';
  complexity: 'low' | 'medium' | 'high';
  insights: string[];
  suggestions: string[];
}

export interface AIExtractTextResponse {
  text: string;
  wordCount: number;
}

class AIApiService {
  private useMockMode = false;

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    // If in mock mode, return mock responses
    if (this.useMockMode) {
      console.log('Using mock mode for AI API request');
      return this.getMockResponse(endpoint) as T;
    }

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include',
      ...options,
    };

    try {
      console.log(`Making AI API request to: ${API_BASE_URL}/ai${endpoint}`);
      console.log('Request config:', { 
        method: config.method, 
        body: config.body,
        headers: config.headers 
      });
      
      const response = await fetch(`${API_BASE_URL}/ai${endpoint}`, config);
      
      console.log(`AI API response status: ${response.status}`);
      
      if (!response.ok) {
        let errorData: any = {};
        try {
          errorData = await response.json();
          console.error('AI API error response:', errorData);
        } catch (e) {
          console.warn('Could not parse error response as JSON');
          errorData = { message: `HTTP ${response.status}: ${response.statusText}` };
        }
        
        // If it's a 400 or 500 error, switch to mock mode
        if (response.status >= 400) {
          console.log('Switching to mock mode due to API error');
          this.useMockMode = true;
          return this.getMockResponse(endpoint) as T;
        }
        
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('AI API success response:', data);
      return data;
    } catch (error) {
      console.error('AI API request failed:', error);
      
      // Switch to mock mode on any error
      console.log('Switching to mock mode due to request failure');
      this.useMockMode = true;
      return this.getMockResponse(endpoint) as T;
    }
  }

  private getMockResponse(endpoint: string): any {
    const endpointKey = endpoint.replace('/', '') as keyof typeof MOCK_RESPONSES;
    return MOCK_RESPONSES[endpointKey] || MOCK_RESPONSES.chat;
  }

  // Method to reset mock mode and try real API again
  resetMockMode(): void {
    this.useMockMode = false;
    console.log('Mock mode reset, will try real API calls again');
  }

  // Method to check if currently in mock mode
  isInMockMode(): boolean {
    return this.useMockMode;
  }

  // Summarize content
  async summarizeContent(data: AISummarizeRequest): Promise<AISummarizeResponse> {
    return this.request<AISummarizeResponse>('/summarize', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Suggest tags
  async suggestTags(data: AISuggestTagsRequest): Promise<AISuggestTagsResponse> {
    return this.request<AISuggestTagsResponse>('/suggest-tags', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Categorize content
  async categorizeContent(data: AICategorizeRequest): Promise<AICategorizeResponse> {
    return this.request<AICategorizeResponse>('/categorize', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Chat with AI
  async chatWithAI(data: AIChatRequest): Promise<AIChatResponse> {
    // Validate the request data
    if (!data.message || data.message.trim() === '') {
      throw new Error('Message is required');
    }
    
    // Ensure contextItemIds is always an array
    const requestData = {
      ...data,
      contextItemIds: data.contextItemIds || []
    };
    
    return this.request<AIChatResponse>('/chat', {
      method: 'POST',
      body: JSON.stringify(requestData),
    });
  }

  // Generate content
  async generateContent(data: AIGenerateRequest): Promise<AIGenerateResponse> {
    return this.request<AIGenerateResponse>('/generate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Analyze content
  async analyzeContent(data: AIAnalyzeRequest): Promise<AIAnalyzeResponse> {
    return this.request<AIAnalyzeResponse>('/analyze', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Extract text from files
  async extractText(data: AIExtractTextRequest): Promise<AIExtractTextResponse> {
    return this.request<AIExtractTextResponse>('/extract-text', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Get AI insights for an item
  async getAIInsights(itemId: string): Promise<AIAnalyzeResponse> {
    return this.request<AIAnalyzeResponse>('/insights', {
      method: 'POST',
      body: JSON.stringify({ itemId }),
    });
  }

  // Get AI usage statistics
  async getUsageStats(data: AIUsageStatsRequest = { period: 'day' }): Promise<AIUsageStats> {
    return this.request<AIUsageStats>('/usage-stats', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

export const aiApi = new AIApiService();
