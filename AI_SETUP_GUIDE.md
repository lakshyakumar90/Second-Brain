# AI Integration Setup Guide

This guide will help you set up the AI integration for your Second Brain application.

## 🚀 Quick Setup

### 1. Get a Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key

### 2. Configure Environment Variables

Create a `.env` file in your `backend` directory with the following content:

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/second-brain

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=3000
NODE_ENV=development

# AI Configuration (Google Gemini)
GEMINI_API_KEY=your-gemini-api-key-here
GEMINI_API_ENDPOINT=https://generativelanguage.googleapis.com/v1beta/models

# Optional: Custom API URL for frontend
VITE_API_URL=http://localhost:3000/api/v1
```

**Important**: Replace `your-gemini-api-key-here` with the actual API key you got from Google AI Studio.

### 3. Restart Your Backend Server

After adding the environment variables, restart your backend server:

```bash
cd backend
npm run dev
```

### 4. Test the AI Integration

1. Open your application
2. Navigate to the AI Demo page
3. You should see "AI API Connected" status
4. Try the AI features like summarization, tag suggestions, etc.

## 🔧 Troubleshooting

### Issue: "Gemini API Key Not Configured"

**Solution**: Make sure you have:
1. Added the `GEMINI_API_KEY` to your `.env` file
2. Restarted the backend server after adding the key
3. The key is valid and not expired

### Issue: "Invalid Gemini API Key"

**Solution**: 
1. Check if your API key is correct
2. Make sure you copied the entire key without extra spaces
3. Verify the key is active in Google AI Studio

### Issue: "Rate Limit Exceeded"

**Solution**: 
1. Wait a few minutes before making more requests
2. Check your usage in Google AI Studio
3. Consider upgrading your plan if you're hitting limits

## 🎯 AI Features Available

Once configured, you'll have access to:

- **Content Summarization**: Generate concise summaries of long content
- **Auto Tagging**: Automatically suggest relevant tags
- **Smart Categorization**: Categorize content into relevant categories
- **AI Chat**: Have conversations with AI about your content
- **Content Analysis**: Get insights about themes, sentiment, and complexity
- **AI Suggestions**: Real-time suggestions while writing

## 📊 Usage Limits

The AI integration includes usage tracking and limits:
- **Free Tier**: Limited daily requests
- **Pro Tier**: Higher limits
- **Enterprise Tier**: Unlimited usage

## 🔒 Security

- API keys are stored securely in environment variables
- All AI requests are logged for monitoring
- User authentication is required for all AI features
- Rate limiting prevents abuse

## 🆘 Need Help?

If you encounter any issues:

1. Check the browser console for error messages
2. Verify your environment variables are set correctly
3. Ensure your backend server is running
4. Check the AI Demo page status indicator

For more detailed information, see the main [README.md](README.md) file.
