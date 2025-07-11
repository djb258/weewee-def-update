# 🤖 Perplexity Labs Integration

Complete integration with Perplexity Labs AI platform for advanced code generation, analysis, and development assistance.

## 🚀 Quick Start

### 1. Get Your API Key
1. Visit [Perplexity Labs](https://labs.perplexity.ai/)
2. Sign up for an account
3. Navigate to API settings
4. Generate your API key

### 2. Set Environment Variable
```bash
# Add to your .env file
PERPLEXITY_API_KEY=your_api_key_here
```

### 3. Test the Integration
```bash
npm run perplexity:models
```

## 📋 Available Commands

### 🤖 Chat with AI
```bash
npm run perplexity:chat "How do I implement authentication in React?"
```

### 💻 Generate Code
```bash
# Generate TypeScript code
npm run perplexity:code "React component for user profile" typescript

# Generate Python code
npm run perplexity:code "FastAPI endpoint for user CRUD" python

# Generate JavaScript code
npm run perplexity:code "Express middleware for authentication" javascript
```

### 🔍 Code Analysis
```bash
# Security analysis
npm run perplexity:analyze src/App.tsx security

# Performance analysis
npm run perplexity:analyze src/utils.ts performance

# Best practices review
npm run perplexity:analyze src/api.ts best-practices

# Refactoring suggestions
npm run perplexity:analyze src/components.ts refactor
```

### 🧪 Generate Tests
```bash
# Jest tests
npm run perplexity:tests src/utils.ts jest

# Vitest tests
npm run perplexity:tests src/api.ts vitest

# Playwright tests
npm run perplexity:tests src/components.ts playwright
```

### 🐛 Debug Code
```bash
# Debug with error message
npm run perplexity:debug src/api.ts "TypeError: Cannot read property 'data' of undefined"

# Debug without error message
npm run perplexity:debug src/utils.ts
```

### 📚 Explain Concepts
```bash
# Beginner level
npm run perplexity:explain "React hooks" beginner

# Intermediate level
npm run perplexity:explain "TypeScript generics" intermediate

# Advanced level
npm run perplexity:explain "GraphQL resolvers" advanced
```

### 💡 Brainstorm Ideas
```bash
# Generate 5 ideas
npm run perplexity:brainstorm "AI features for my app"

# Generate 10 ideas
npm run perplexity:brainstorm "mobile app monetization" 10
```

### 📋 List Available Models
```bash
npm run perplexity:models
```

## 🤖 Available Models

- **llama-3.1-8b-online** - Fast, online-capable model
- **llama-3.1-70b-online** - Powerful, online-capable model
- **llama-3.1-8b-instruct** - Instruction-tuned model
- **llama-3.1-70b-instruct** - Powerful instruction-tuned model
- **mixtral-8x7b-instruct** - Mixture of experts model
- **codellama-70b-instruct** - Code-specialized model
- **mistral-7b-instruct** - Efficient instruction model

## 🎯 Use Cases

### Code Generation
```bash
# Generate a complete React component
npm run perplexity:code "Create a React component for a shopping cart with add/remove items, quantity controls, and total calculation" typescript

# Generate API endpoints
npm run perplexity:code "Create Express.js API endpoints for user management with JWT authentication" javascript

# Generate database schemas
npm run perplexity:code "Create Prisma schema for e-commerce with users, products, orders, and reviews" prisma
```

### Code Review & Analysis
```bash
# Security audit
npm run perplexity:analyze src/auth.ts security

# Performance optimization
npm run perplexity:analyze src/dataProcessing.ts performance

# Code quality review
npm run perplexity:analyze src/components.ts best-practices
```

### Testing
```bash
# Generate comprehensive tests
npm run perplexity:tests src/utils.ts jest

# Generate integration tests
npm run perplexity:tests src/api.ts vitest

# Generate E2E tests
npm run perplexity:tests src/components.ts playwright
```

### Learning & Documentation
```bash
# Learn new concepts
npm run perplexity:explain "React Server Components" intermediate

# Generate documentation
npm run perplexity:code "Generate JSDoc documentation for this function" jsdoc

# Brainstorm features
npm run perplexity:brainstorm "social media features" 15
```

## 🔧 Advanced Usage

### Direct Script Usage
```bash
# Chat with specific model
tsx scripts/perplexity-integration.ts chat "Explain TypeScript decorators" --model llama-3.1-70b-instruct

# Generate code with custom parameters
tsx scripts/perplexity-integration.ts generate-code "React hook for API calls" typescript --temperature 0.2

# Analyze with custom settings
tsx scripts/perplexity-integration.ts analyze src/App.tsx security --max-tokens 4096
```

### Programmatic Usage
```typescript
import { PerplexityLabsIntegration } from './scripts/perplexity-integration';

const perplexity = new PerplexityLabsIntegration({
  apiKey: process.env.PERPLEXITY_API_KEY,
  defaultModel: 'llama-3.1-70b-instruct',
  maxTokens: 4096,
  temperature: 0.7
});

// Generate code
const code = await perplexity.generateCode(
  'Create a React hook for managing form state',
  'typescript'
);

// Analyze code
const analysis = await perplexity.analyzeCode(
  code,
  'best-practices'
);

// Generate tests
const tests = await perplexity.generateTests(
  code,
  'jest'
);
```

## 🎨 Code Generation Examples

### React Component
```bash
npm run perplexity:code "Create a React component for a data table with sorting, filtering, and pagination" typescript
```

**Generated Output:**
```typescript
interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  pageSize?: number;
  onSort?: (column: keyof T, direction: 'asc' | 'desc') => void;
  onFilter?: (filters: Filter[]) => void;
}

export function DataTable<T>({
  data,
  columns,
  pageSize = 10,
  onSort,
  onFilter
}: DataTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState<keyof T | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filters, setFilters] = useState<Filter[]>([]);

  // Implementation details...
}
```

### API Endpoint
```bash
npm run perplexity:code "Create a FastAPI endpoint for user registration with email validation and password hashing" python
```

**Generated Output:**
```python
from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext
from sqlalchemy.orm import Session
import re

app = FastAPI()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str

@app.post("/users/register")
async def register_user(user: UserCreate, db: Session = Depends(get_db)):
    # Implementation details...
```

## 🔍 Analysis Examples

### Security Analysis
```bash
npm run perplexity:analyze src/auth.ts security
```

**Sample Output:**
```
🔍 Security Analysis:

1. **SQL Injection Risk**: Line 15 - Direct string concatenation in SQL query
   - Recommendation: Use parameterized queries or ORM

2. **Password Storage**: Line 23 - Passwords stored in plain text
   - Recommendation: Use bcrypt or Argon2 for hashing

3. **JWT Secret**: Line 8 - Hardcoded JWT secret
   - Recommendation: Use environment variable

4. **Input Validation**: Missing validation for user input
   - Recommendation: Add input sanitization
```

### Performance Analysis
```bash
npm run perplexity:analyze src/dataProcessing.ts performance
```

**Sample Output:**
```
🔍 Performance Analysis:

1. **N+1 Query Problem**: Lines 12-18 - Database queries in loop
   - Recommendation: Use eager loading or batch queries

2. **Memory Leak**: Line 25 - Event listeners not cleaned up
   - Recommendation: Remove listeners in cleanup function

3. **Inefficient Algorithm**: Lines 30-45 - O(n²) complexity
   - Recommendation: Use Map or Set for O(1) lookups
```

## 🧪 Test Generation Examples

### Jest Tests
```bash
npm run perplexity:tests src/utils.ts jest
```

**Generated Output:**
```typescript
import { formatCurrency, validateEmail, debounce } from './utils';

describe('formatCurrency', () => {
  it('should format positive numbers correctly', () => {
    expect(formatCurrency(1234.56)).toBe('$1,234.56');
    expect(formatCurrency(0)).toBe('$0.00');
  });

  it('should handle negative numbers', () => {
    expect(formatCurrency(-1234.56)).toBe('-$1,234.56');
  });

  it('should handle edge cases', () => {
    expect(formatCurrency(NaN)).toBe('$0.00');
    expect(formatCurrency(Infinity)).toBe('$0.00');
  });
});

describe('validateEmail', () => {
  it('should validate correct email formats', () => {
    expect(validateEmail('test@example.com')).toBe(true);
    expect(validateEmail('user.name+tag@domain.co.uk')).toBe(true);
  });

  it('should reject invalid email formats', () => {
    expect(validateEmail('invalid-email')).toBe(false);
    expect(validateEmail('@domain.com')).toBe(false);
    expect(validateEmail('user@')).toBe(false);
  });
});
```

## 🐛 Debugging Examples

### Debug with Error
```bash
npm run perplexity:debug src/api.ts "TypeError: Cannot read property 'data' of undefined"
```

**Sample Output:**
```
🐛 Debug Analysis:

The error indicates that you're trying to access the 'data' property of an undefined object. This typically happens when:

1. **API Response Structure**: The response doesn't have the expected structure
2. **Async/Await Issue**: Not properly awaiting the API call
3. **Error Handling**: Missing error handling for failed requests

**Potential Fixes:**

1. Add null checking:
```typescript
const response = await apiCall();
if (response && response.data) {
  return response.data;
}
```

2. Use optional chaining:
```typescript
const data = response?.data;
```

3. Add proper error handling:
```typescript
try {
  const response = await apiCall();
  return response.data;
} catch (error) {
  console.error('API call failed:', error);
  throw error;
}
```
```

## 📚 Learning Examples

### Concept Explanation
```bash
npm run perplexity:explain "React Server Components" intermediate
```

**Sample Output:**
```
📚 intermediate explanation of React Server Components:

React Server Components (RSC) are a new paradigm in React that allows components to run on the server instead of the client.

**Key Concepts:**

1. **Server-Side Rendering**: Components render on the server and send HTML to client
2. **No JavaScript Bundle**: Server components don't add to client bundle size
3. **Direct Database Access**: Can access databases and APIs directly
4. **Streaming**: Support for streaming server-rendered content

**Example:**
```typescript
// Server Component
async function UserProfile({ userId }: { userId: string }) {
  const user = await db.users.findUnique({ where: { id: userId } });
  
  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  );
}

// Client Component
'use client';
function UserActions({ userId }: { userId: string }) {
  const [liked, setLiked] = useState(false);
  
  return (
    <button onClick={() => setLiked(!liked)}>
      {liked ? 'Unlike' : 'Like'}
    </button>
  );
}
```

**Benefits:**
- Smaller client bundles
- Better SEO
- Faster initial page loads
- Direct server resource access
```

## 💡 Brainstorming Examples

### Feature Ideas
```bash
npm run perplexity:brainstorm "AI-powered features for my e-commerce app" 10
```

**Sample Output:**
```
💡 10 ideas for AI-powered features for my e-commerce app:

1. **Smart Product Recommendations**
   - AI analyzes user behavior and purchase history
   - Suggests personalized product recommendations
   - Increases conversion rates and average order value

2. **Visual Search**
   - Users can upload product images to find similar items
   - Uses computer vision to identify products
   - Improves user experience and discovery

3. **Chatbot Customer Support**
   - AI-powered chatbot for 24/7 customer support
   - Handles common questions and order tracking
   - Reduces support costs and improves response time

4. **Dynamic Pricing**
   - AI adjusts prices based on demand, competition, and inventory
   - Optimizes profit margins and sales volume
   - Real-time price optimization

5. **Fraud Detection**
   - AI analyzes transaction patterns to detect fraud
   - Reduces chargebacks and fraudulent orders
   - Improves security and trust

6. **Inventory Prediction**
   - AI predicts demand and optimizes inventory levels
   - Reduces stockouts and overstock situations
   - Improves cash flow and efficiency

7. **Personalized Marketing**
   - AI creates personalized email campaigns and ads
   - Targets users based on behavior and preferences
   - Increases engagement and conversion rates

8. **Voice Shopping**
   - Voice-enabled product search and ordering
   - Hands-free shopping experience
   - Accessibility improvement

9. **AR Product Visualization**
   - AR try-on for clothing and accessories
   - Virtual furniture placement
   - Reduces returns and increases confidence

10. **Smart Reviews Analysis**
    - AI analyzes customer reviews for sentiment and insights
    - Identifies product issues and improvement opportunities
    - Helps with product development and quality control
```

## 🔧 Configuration

### Environment Variables
```bash
# Required
PERPLEXITY_API_KEY=your_api_key_here

# Optional
PERPLEXITY_BASE_URL=https://api.perplexity.ai
PERPLEXITY_DEFAULT_MODEL=llama-3.1-8b-online
PERPLEXITY_MAX_TOKENS=4096
PERPLEXITY_TEMPERATURE=0.7
```

### Custom Configuration
```typescript
const perplexity = new PerplexityLabsIntegration({
  apiKey: process.env.PERPLEXITY_API_KEY,
  baseUrl: 'https://api.perplexity.ai',
  defaultModel: 'llama-3.1-70b-instruct',
  maxTokens: 8192,
  temperature: 0.3
});
```

## 🚀 Best Practices

### 1. API Key Security
- Never commit API keys to version control
- Use environment variables
- Rotate keys regularly
- Monitor usage and costs

### 2. Prompt Engineering
- Be specific and detailed in prompts
- Include context and requirements
- Specify the desired output format
- Use examples when possible

### 3. Error Handling
- Always handle API errors gracefully
- Implement retry logic for transient failures
- Log errors for debugging
- Provide fallback behavior

### 4. Rate Limiting
- Respect API rate limits
- Implement exponential backoff
- Cache responses when appropriate
- Monitor usage patterns

### 5. Code Quality
- Review generated code before using
- Test generated code thoroughly
- Refactor and optimize as needed
- Maintain consistent coding standards

## 🆘 Troubleshooting

### Common Issues

1. **API Key Not Found**
   ```
   Error: Perplexity API key is required
   ```
   **Solution**: Set `PERPLEXITY_API_KEY` environment variable

2. **Rate Limit Exceeded**
   ```
   Error: 429 Too Many Requests
   ```
   **Solution**: Implement rate limiting and retry logic

3. **Invalid Model**
   ```
   Error: Model not found
   ```
   **Solution**: Use `npm run perplexity:models` to see available models

4. **Network Errors**
   ```
   Error: Network request failed
   ```
   **Solution**: Check internet connection and API endpoint availability

### Getting Help

1. Check the [Perplexity Labs documentation](https://docs.perplexity.ai/)
2. Verify your API key is valid
3. Test with a simple chat command
4. Check network connectivity
5. Review error logs for details

## 📈 Performance Tips

1. **Use Appropriate Models**
   - Use smaller models for simple tasks
   - Use larger models for complex reasoning
   - Consider cost vs. performance trade-offs

2. **Optimize Prompts**
   - Be concise but specific
   - Include relevant context
   - Use clear instructions

3. **Batch Requests**
   - Combine related requests
   - Use streaming for long responses
   - Cache frequently used responses

4. **Monitor Usage**
   - Track API calls and costs
   - Monitor response times
   - Optimize based on usage patterns

---

**🎉 You're now ready to leverage the power of Perplexity Labs for your development workflow!** 