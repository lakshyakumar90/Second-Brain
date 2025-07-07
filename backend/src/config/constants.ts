export const AI_LIMITS = {
    FREE_DAILY_REQUESTS: 5,
    PRO_DAILY_REQUESTS: 100,
    ENTERPRISE_DAILY_REQUESTS: 500,
    FREE_MONTHLY_REQUESTS: 50,  
    PRO_MONTHLY_REQUESTS: 2000,
    ENTERPRISE_MONTHLY_REQUESTS: 10000
  } as const;
  
  export const COLLABORATION_LIMITS = {
    FREE_COLLABORATORS: 0,
    PRO_COLLABORATORS: 10,
    ENTERPRISE_COLLABORATORS: 50
  } as const;
  
  export const STORAGE_LIMITS = {
    FREE_STORAGE: 1024 * 1024 * 100, // 100MB
    PRO_STORAGE: 1024 * 1024 * 1024 * 10, // 10GB
    ENTERPRISE_STORAGE: 1024 * 1024 * 1024 * 100 // 100GB
  } as const;
  
  export const FILE_LIMITS = {
    MAX_FILE_SIZE: 1024 * 1024 * 50, // 50MB
    MAX_FILES_PER_ITEM: 10,
    ALLOWED_FILE_TYPES: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'video/mp4',
      'video/webm',
      'audio/mp3',
      'audio/wav',
      'application/pdf',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]
  } as const;
  
  export const RATE_LIMITS = {
    API_REQUESTS_PER_MINUTE: 60,
    AI_REQUESTS_PER_HOUR: 20,
    SHARE_LINKS_PER_DAY: 100
  } as const;
  
  export const CACHE_TTL = {
    USER_SESSION: 60 * 60 * 24, // 24 hours
    AI_RESPONSES: 60 * 60 * 2, // 2 hours
    SEARCH_RESULTS: 60 * 15, // 15 minutes
    STATIC_CONTENT: 60 * 60 * 24 * 7 // 7 days
  } as const;
  
  export const EMAIL_TEMPLATES = {
    WELCOME: 'welcome',
    VERIFICATION: 'verification',
    PASSWORD_RESET: 'password-reset',
    COLLABORATION_INVITE: 'collaboration-invite',
    SHARE_NOTIFICATION: 'share-notification'
  } as const;
  
  export const DEFAULTS = {
    ITEMS_PER_PAGE: 20,
    SEARCH_RESULTS_LIMIT: 100,
    ACTIVITY_LOG_RETENTION_DAYS: 90,
    SESSION_TIMEOUT_MINUTES: 30
  } as const;
  
  export const AI_MODELS = {
    SUMMARIZATION: 'gpt-3.5-turbo',
    TAG_SUGGESTION: 'gpt-3.5-turbo',
    CHAT: 'gpt-4',
    SEMANTIC_SEARCH: 'text-embedding-ada-002'
  } as const;
  
  export const ERROR_MESSAGES = {
    UNAUTHORIZED: 'Unauthorized access',
    FORBIDDEN: 'Access forbidden',
    NOT_FOUND: 'Resource not found',
    RATE_LIMITED: 'Rate limit exceeded',
    QUOTA_EXCEEDED: 'Quota exceeded',
    INVALID_INPUT: 'Invalid input provided',
    SERVER_ERROR: 'Internal server error'
  } as const;
  
  export const SUCCESS_MESSAGES = {
    CREATED: 'Successfully created',
    UPDATED: 'Successfully updated',
    DELETED: 'Successfully deleted',
    SHARED: 'Successfully shared',
    INVITED: 'Invitation sent successfully'
  } as const;