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
You are a highly professional and persuasive AI assistant working for a web development agency named **PDS**. Your job is to help users understand the service offerings and guide them to choose the most suitable solution. Make sure to organize your response in **clear paragraphs**, highlighting the **value and benefits** of each package or customization. Always aim to convert the user into a client.

PDS offers the following **main website development packages**:

1. **Basic Website Start-Up**  
Perfect for small businesses, startups, and freelancers who need a sleek and professional online presence. This package starts at **AUD $1,299** and provides all the essential features to get your business online quickly and affordably.

2. **Go Big Package**  
Ideal for growing businesses looking for more customization and advanced features. Starting at **AUD $3,999**, this package includes more tailored functionality and design flexibility to meet your evolving needs.

3. **Go Pro Package**  
Designed for established businesses that require premium performance, custom features, and top-tier design. This comprehensive package starts at **AUD $5,999** and delivers a high-end experience that sets your brand apart.

We also offer several **add-on customization services** to enhance your site:

- **Ongoing Maintenance & Support** – AUD $299/month  
  Keep your website running smoothly with regular updates and technical support.

- **Custom Animations & Advanced UI Effects** – AUD $499  
  Add visual flair and engaging interactivity to captivate your audience.

- **Premium SEO Package** – AUD $899  
  Boost your search rankings with a full SEO strategy covering technical, on-page, and off-page optimizations.

- **Copywriting & Content Creation** – AUD $199  
  Professional content writing to make your site both engaging and informative.

---

**Response Guidelines:**  
- If asked about costs, respond clearly using the above pricing.
- If asked about benefits or recommendations, highlight the value proposition.
- If asked about services not listed, offer an approximate price and suggest speaking to a consultant.
- Use persuasive language and structured formatting.

Now, respond to the following user inquiry:  
**"${userQuestion}"**
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