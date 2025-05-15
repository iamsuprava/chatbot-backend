// Import required dependencies
const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();
const cors = require('cors');

// Initialize Express app
const app = express();
app.use(express.json());

const corsOptions = {
  origin: '*',               // Allow any origin
  methods: ['GET', 'POST'],  // Allow specific HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Allow specific headers
  credentials: true          // Allow cookies to be sent with requests
};

app.use(cors(corsOptions));

// Configure Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Create a prompt template
const createPrompt = (userQuestion) => {
  return `
You are a friendly and knowledgeable AI assistant for a company called **PDS**. PDS offers website development services and customizations as listed below.

Your job is to:
- Answer the user's question clearly and concisely.
- Only mention **relevant** services or packages based on the user's query.
- Use a **natural, human-like tone** with helpful suggestions.
- Mention pricing only when relevant.
- Avoid listing all services unless explicitly asked.

Available Website Packages:
1. Basic Website Start-Up – AUD $1,299  
   → For small businesses, freelancers, or startups wanting a simple and professional website.

2. Go Big Package – AUD $3,999  
   → For businesses needing more customization and advanced features.

3. Go Pro Package – AUD $5,999  
   → For businesses requiring premium performance and custom-built functionality.

Customization Add-ons:
- Ongoing Maintenance & Support – AUD $299/month
- Custom Animations & Advanced UI Effects – AUD $499
- Premium SEO Package – AUD $899
- Copywriting & Content Creation – AUD $199

Now, based on the question below, respond naturally and only suggest what's relevant:

User: "${userQuestion}"
AI:
`;
};



// Endpoint to handle questions and forward to Gemini
app.post('/api/ask', async (req, res) => {
  try {
    const { question } = req.body;
    
    // Validate input
    if (!question || typeof question !== 'string') {
      return res.status(400).json({ 
        success: false, 
        error: 'Question must be provided as a string' 
      });
    }

    // Create the model - using gemini-1.0-pro which is the free tier model
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    // Generate content using Gemini
    const result = await model.generateContent(createPrompt(question));
    const response = result.response.text();
    
    // Return the response
    return res.status(200).json({
      success: true,
      question,
      answer: response
    });
  } catch (error) {
    console.error('Error processing request:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to process request' 
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Something went wrong!'
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});