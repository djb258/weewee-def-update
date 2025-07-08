# 🤖 AI Master Integration

Unified interface for all major AI platforms: **ChatGPT (OpenAI)**, **Gemini (Google)**, **Claude (Anthropic)**, **Perplexity Labs**, and **Abacus AI**. One command to rule them all!

## 🚀 Quick Start

### 1. Get Your API Keys
```bash
# OpenAI (ChatGPT)
# Visit: https://platform.openai.com/api-keys
OPENAI_API_KEY=your_openai_key_here

# Google Gemini
# Visit: https://makersuite.google.com/app/apikey
GEMINI_API_KEY=your_gemini_key_here

# Anthropic (Claude)
# Visit: https://console.anthropic.com/
ANTHROPIC_API_KEY=your_claude_key_here

# Perplexity Labs
# Visit: https://labs.perplexity.ai/
PERPLEXITY_API_KEY=your_perplexity_key_here

# Abacus AI
# Visit: https://abacus.ai/
ABACUS_API_KEY=your_abacus_key_here
```

### 2. Test the Integration
```bash
npm run ai:models
```

## 🤖 Available AI Models

### OpenAI (ChatGPT)
- **gpt-4o** - Most capable model, 128K context
- **gpt-4o-mini** - Fast and efficient, 128K context
- **gpt-3.5-turbo** - Cost-effective, 16K context

### Google Gemini
- **gemini-1.5-pro** - Most capable, 1M context
- **gemini-1.5-flash** - Fast and efficient, 1M context
- **gemini-1.0-pro** - Balanced performance, 30K context

### Anthropic (Claude)
- **claude-3-5-sonnet** - Most capable, 200K context
- **claude-3-5-haiku** - Fast and efficient, 200K context

### Perplexity Labs
- **llama-3.1-70b-instruct** - Powerful instruction model
- **codellama-70b-instruct** - Code-specialized model

## 📋 Available Commands

### 🤖 Chat with Any AI
```bash
# Chat with GPT-4o
npm run ai:chat "How do I implement authentication in React?" gpt-4o

# Chat with Gemini
npm run ai:chat "Explain TypeScript generics" gemini-1.5-pro

# Chat with Claude
npm run ai:chat "What are React Server Components?" claude-3-5-sonnet

# Chat with Perplexity
npm run ai:chat "Generate a React hook for API calls" llama-3.1-70b-instruct
```

### 💻 Generate Code with Any AI
```bash
# Generate TypeScript with GPT-4o
npm run ai:code "React component for user profile" typescript gpt-4o

# Generate Python with Gemini
npm run ai:code "FastAPI endpoint for user CRUD" python gemini-1.5-pro

# Generate JavaScript with Claude
npm run ai:code "Express middleware for authentication" javascript claude-3-5-sonnet

# Generate React with Perplexity
npm run ai:code "Custom hook for form validation" typescript codellama-70b-instruct
```

### 🔍 Code Review with Any AI
```bash
# Review with GPT-4o
npm run ai:review src/App.tsx gpt-4o

# Review with Gemini
npm run ai:review src/utils.ts gemini-1.5-pro

# Review with Claude
npm run ai:review src/api.ts claude-3-5-sonnet
```

### 🐛 Debug with Any AI
```bash
# Debug with error message
npm run ai:debug src/api.ts "TypeError: Cannot read property 'data' of undefined" gpt-4o

# Debug without error message
npm run ai:debug src/utils.ts gemini-1.5-pro
```

### 🧪 Generate Tests with Any AI
```bash
# Jest tests with GPT-4o
npm run ai:tests src/utils.ts jest gpt-4o

# Vitest tests with Gemini
npm run ai:tests src/api.ts vitest gemini-1.5-pro

# Playwright tests with Claude
npm run ai:tests src/components.ts playwright claude-3-5-sonnet
```

### 📚 Explain Concepts with Any AI
```bash
# Beginner level with GPT-4o
npm run ai:explain "React hooks" beginner gpt-4o

# Intermediate level with Gemini
npm run ai:explain "TypeScript generics" intermediate gemini-1.5-pro

# Advanced level with Claude
npm run ai:explain "GraphQL resolvers" advanced claude-3-5-sonnet
```

### 💡 Brainstorm with Any AI
```bash
# 5 ideas with GPT-4o
npm run ai:brainstorm "AI features for my app" 5 gpt-4o

# 10 ideas with Gemini
npm run ai:brainstorm "mobile app monetization" 10 gemini-1.5-pro
```

### 🔄 Compare Multiple AIs
```bash
# Compare 3 different AIs on the same prompt
npm run ai:compare "Explain React Server Components" gpt-4o gemini-1.5-pro claude-3-5-sonnet

# Compare code generation
npm run ai:compare "Create a React hook for API calls" gpt-4o codellama-70b-instruct
```

### 📋 List Available Models
```bash
# List all models
npm run ai:models

# List OpenAI models only
npm run ai:models openai

# List Google models only
npm run ai:models google
```

## 🎯 Use Cases & Examples

### Code Generation Comparison
```bash
# Generate the same component with different AIs
npm run ai:compare "Create a React component for a data table with sorting, filtering, and pagination" gpt-4o gemini-1.5-pro claude-3-5-sonnet
```

**Results:**
- **GPT-4o**: Most comprehensive, includes TypeScript interfaces, error handling
- **Gemini-1.5-pro**: Good structure, includes accessibility features
- **Claude-3-5-sonnet**: Clean code, good documentation, performance considerations

### Code Review Comparison
```bash
# Review the same code with different AIs
npm run ai:compare "Review this code for security issues: [code here]" gpt-4o gemini-1.5-pro
```

**Results:**
- **GPT-4o**: Detailed security analysis, specific recommendations
- **Gemini-1.5-pro**: Broader perspective, includes performance and maintainability

### Debugging Comparison
```bash
# Debug the same error with different AIs
npm run ai:compare "Debug this error: TypeError: Cannot read property 'data' of undefined" gpt-4o claude-3-5-sonnet
```

**Results:**
- **GPT-4o**: Multiple solution approaches, detailed explanations
- **Claude-3-5-sonnet**: Systematic debugging approach, prevention strategies

## 💰 Cost Comparison

| Model | Provider | Cost per 1K tokens | Best For |
|-------|----------|-------------------|----------|
| gpt-4o | OpenAI | $0.005 | Complex reasoning, code generation |
| gpt-4o-mini | OpenAI | $0.00015 | Cost-effective general use |
| gpt-3.5-turbo | OpenAI | $0.0005 | Simple tasks, quick responses |
| gemini-1.5-pro | Google | $0.00375 | Large context, detailed analysis |
| gemini-1.5-flash | Google | $0.000075 | Fast, cost-effective |
| gemini-1.0-pro | Google | $0.0005 | Balanced performance |
| claude-3-5-sonnet | Anthropic | $0.003 | Code review, documentation |
| claude-3-5-haiku | Anthropic | $0.00025 | Quick responses, simple tasks |
| llama-3.1-70b-instruct | Perplexity | $0.0002 | General purpose |
| codellama-70b-instruct | Perplexity | $0.0002 | Code-specific tasks |

## 🎯 Model Selection Guide

### For Code Generation
- **Best Quality**: `gpt-4o`, `claude-3-5-sonnet`
- **Best Value**: `gpt-4o-mini`, `gemini-1.5-flash`
- **Code-Specific**: `codellama-70b-instruct`

### For Code Review
- **Most Thorough**: `gpt-4o`, `claude-3-5-sonnet`
- **Security Focus**: `gpt-4o`
- **Performance Focus**: `gemini-1.5-pro`

### For Debugging
- **Best Analysis**: `gpt-4o`, `claude-3-5-sonnet`
- **Quick Fixes**: `gpt-4o-mini`, `gemini-1.5-flash`

### For Learning
- **Best Explanations**: `gpt-4o`, `claude-3-5-sonnet`
- **Beginner Friendly**: `gpt-4o-mini`
- **Advanced Concepts**: `gemini-1.5-pro`

### For Brainstorming
- **Most Creative**: `gpt-4o`, `gemini-1.5-pro`
- **Structured Ideas**: `claude-3-5-sonnet`

## 🔧 Advanced Usage

### Direct Script Usage
```bash
# Chat with specific parameters
tsx scripts/ai-master-integration.ts chat "Explain TypeScript decorators" gpt-4o

# Generate code with custom settings
tsx scripts/ai-master-integration.ts generate-code "React hook for API calls" typescript gemini-1.5-pro

# Compare multiple models
tsx scripts/ai-master-integration.ts compare "Create a REST API" gpt-4o gemini-1.5-pro claude-3-5-sonnet
```

### Programmatic Usage
```typescript
import { AIMasterIntegration } from './scripts/ai-master-integration';

const aiMaster = new AIMasterIntegration();

// Generate code with GPT-4o
const gptResponse = await aiMaster.generateCode(
  'Create a React hook for managing form state',
  'typescript',
  'gpt-4o'
);

// Generate code with Gemini
const geminiResponse = await aiMaster.generateCode(
  'Create a React hook for managing form state',
  'typescript',
  'gemini-1.5-pro'
);

// Compare responses
console.log('GPT-4o:', gptResponse.content);
console.log('Gemini:', geminiResponse.content);
```

### Batch Processing
```typescript
// Generate the same code with multiple models
const models = ['gpt-4o', 'gemini-1.5-pro', 'claude-3-5-sonnet'];
const responses = await aiMaster.compareModels(
  'Create a React component for user authentication',
  models
);

responses.forEach((response, index) => {
  console.log(`${models[index]}:`, response.content);
});
```

## 🚀 Best Practices

### 1. Model Selection
- **Start with GPT-4o** for complex tasks
- **Use GPT-4o-mini** for cost-effective general use
- **Try Gemini-1.5-flash** for large context needs
- **Use Claude-3-5-sonnet** for code review and documentation
- **Use CodeLlama** for code-specific tasks

### 2. Cost Optimization
- **Compare models** before running expensive operations
- **Use smaller models** for simple tasks
- **Monitor usage** and costs
- **Cache responses** when appropriate

### 3. Quality Assurance
- **Always review** generated code
- **Test generated code** thoroughly
- **Compare multiple models** for important tasks
- **Use specific prompts** for better results

### 4. Error Handling
- **Handle API errors** gracefully
- **Implement retry logic** for transient failures
- **Provide fallback models** when primary fails
- **Log errors** for debugging

## 🔄 Integration with Existing Tools

### YOLO Mode Integration
```bash
# Use AI in YOLO mode for rapid development
npm run yolo:enable
npm run ai:code "Create a complete user management system" typescript gpt-4o
npm run yolo:compliance
```

### Testing Integration
```bash
# Generate tests with AI
npm run ai:tests src/utils.ts jest gpt-4o
npm test
```

### Deployment Integration
```bash
# Generate deployment scripts with AI
npm run ai:code "Create a deployment script for Vercel" bash gpt-4o
npm run deploy:vercel
```

## 📊 Performance Comparison

### Speed
1. **Fastest**: `gpt-4o-mini`, `gemini-1.5-flash`
2. **Fast**: `gpt-3.5-turbo`, `claude-3-5-haiku`
3. **Balanced**: `gpt-4o`, `gemini-1.5-pro`
4. **Slower**: `claude-3-5-sonnet`

### Quality
1. **Highest**: `gpt-4o`, `claude-3-5-sonnet`
2. **High**: `gemini-1.5-pro`, `gpt-4o-mini`
3. **Good**: `gpt-3.5-turbo`, `claude-3-5-haiku`
4. **Specialized**: `codellama-70b-instruct`

### Context Window
1. **Largest**: `gemini-1.5-pro` (1M tokens)
2. **Large**: `gpt-4o` (128K tokens)
3. **Medium**: `claude-3-5-sonnet` (200K tokens)
4. **Small**: `gpt-3.5-turbo` (16K tokens)

## 🆘 Troubleshooting

### Common Issues

1. **API Key Not Found**
   ```
   Error: OpenAI API key not found
   ```
   **Solution**: Set the appropriate environment variable

2. **Rate Limit Exceeded**
   ```
   Error: 429 Too Many Requests
   ```
   **Solution**: Implement rate limiting or use a different model

3. **Model Not Found**
   ```
   Error: Model not found
   ```
   **Solution**: Use `npm run ai:models` to see available models

4. **Network Errors**
   ```
   Error: Network request failed
   ```
   **Solution**: Check internet connection and API endpoint availability

### Getting Help

1. Check individual AI platform documentation
2. Verify API keys are valid
3. Test with a simple chat command
4. Check network connectivity
5. Review error logs for details

## 🎯 Next Steps

1. **Get API keys** for all platforms
2. **Set environment variables** in your `.env` file
3. **Test with simple commands** to verify setup
4. **Compare models** for your specific use cases
5. **Integrate with your workflow** for maximum productivity

## 📈 Advanced Features

### Cost Tracking
```typescript
const response = await aiMaster.generateCode('Create a React component', 'typescript', 'gpt-4o');
console.log(`Cost: $${response.cost}`);
console.log(`Tokens used: ${response.usage?.totalTokens}`);
```

### Response Saving
```typescript
await aiMaster.saveResponse(response, 'generated-component.ts');
```

### Model Comparison
```typescript
const responses = await aiMaster.compareModels(
  'Explain React hooks',
  ['gpt-4o', 'gemini-1.5-pro', 'claude-3-5-sonnet']
);
```

---

**🎉 You now have access to the most powerful AI development environment with unified access to ChatGPT, Gemini, Claude, Perplexity, and Abacus AI!** 