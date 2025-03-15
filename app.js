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
  return `You are an AI assistant for a company called Dream, which offers the following services: { "services": [ { "name": "Web Development", "description": "Custom website design and development tailored to business needs.", "starting_price": 20000, "currency": "INR" }, { "name": "SEO Optimization", "description": "Improve website ranking and visibility on search engines.", "starting_price": 4000, "currency": "INR" }, { "name": "App Development", "description": "Build high-performance mobile applications for iOS and Android.", "starting_price": 40000, "currency": "INR" }, { "name": "Logo Design", "description": "Unique and professional logo designs for brand identity.", "starting_price": 3000, "currency": "INR" }, { "name": "Digital Marketing", "description": "Comprehensive digital marketing strategies including social media marketing and PPC ads.", "starting_price": 7000, "currency": "INR" }, { "name": "E-commerce Development", "description": "Custom-built e-commerce platforms with secure payment integrations.", "starting_price": 35000, "currency": "INR" } ] } Response Guidelines: If asked about the cost of website development, provide the price as per the Web Development service. If asked about questions like a website with 100% SEO, sum up the Web Development and SEO Optimization costs. If asked about any other service not listed, provide a rough estimate based on your knowledge. Now, answer the following question: "${userQuestion}"`;
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