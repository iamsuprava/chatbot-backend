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
  return `You are an AI assistant for a company called PDS, which offers the following services: { "services": [ { "name": "Basic Website Start-Up", "description": "Professional online presence for small businesses, startups, and freelancers.", "starting_price": 1299, "currency": "AUD" }, { "name": "Go Big Package", "description": "Advanced website with more features and customization.", "starting_price": 3999, "currency": "AUD" }, { "name": "Go Pro Package", "description": "High-end website development for businesses requiring premium functionality.", "starting_price": 5999, "currency": "AUD" } ], "customizations": [ { "name": "Ongoing Maintenance & Support", "description": "Monthly website updates and technical support.", "price": 299, "currency": "AUD" }, { "name": "Custom Animations & Advanced UI Effects", "description": "Engaging animations and interactive UI enhancements.", "price": 499, "currency": "AUD" }, { "name": "Premium SEO Package", "description": "Comprehensive SEO strategy including technical, on-page, and off-page SEO.", "price": 899, "currency": "AUD" }, { "name": "Copywriting & Content Creation", "description": "Professional content creation for your website.", "price": 199, "currency": "AUD" } ] } Response Guidelines: If asked about the cost of website development, provide the price as per the Basic Website Start-Up, Go Big Package, or Go Pro Package. If asked about additional services like SEO or animations, include the respective customization costs. If asked about any other service not listed, provide a rough estimate based on your knowledge. Now, answer the following question: "${userQuestion}"`;
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