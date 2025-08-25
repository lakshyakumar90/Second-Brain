// Export all API services
export { authApi } from './authApi';
export { itemApi } from './itemApi';
export { pageApi } from './pageApi';
export { tagApi } from './tagApi';
export { categoryApi } from './categoryApi';
export { commentApi } from './commentApi';
export { searchApi } from './searchApi';
export { aiApi } from './aiApi';

// Export AI types
export type {
  AISummarizeRequest,
  AISuggestTagsRequest,
  AICategorizeRequest,
  AIChatRequest,
  AIGenerateRequest,
  AIAnalyzeRequest,
  AIExtractTextRequest,
  AIUsageStatsRequest,
  AIMessage,
  AIChatResponse,
  AIUsageStats,
  AISummarizeResponse,
  AISuggestTagsResponse,
  AICategorizeResponse,
  AIGenerateResponse,
  AIAnalyzeResponse,
  AIExtractTextResponse,
} from './aiApi';
