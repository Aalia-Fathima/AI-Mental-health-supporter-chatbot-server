
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const app = express();
app.use(express.json());
app.use(cors());

let chatHistory = [];

app.post('/api/chat', async (req, res) => {
  const { message } = req.body;
  try {

    chatHistory.push({ role: 'user', content: message });// Update chat history with the new user message
    const context = chatHistory.map(chat => `${chat.role === 'user' ? 'User' : 'Bot'}: ${chat.content}`).join('\n'); // Prepare the context for the AI by concatenating all previous messages
    // Classify messages 
    const classificationPrompt = `Classify the following message into one of three categories: "Mental Health Support: Provides emotional support and coping strategies", or "unrelated". Message: "${message}". Respond with the category name only.`;
    const classificationResult = await model.generateContent(classificationPrompt);
    const classificationResponse = await classificationResult.response;
    const classification = (await classificationResponse.text()).trim().toLowerCase();

    let responseText;

      const supportPrompt = `you are a Mental Health Support: Provides emotional support and coping strategies chatbot so answer things politely that can heal them answer for things that is related to mental health, sick, patient, psycology doctor related to medical and avoid unrelated things by saying i am mental health supporter and more content. Continue the conversation naturally based on the following context:\n${context}`;
      const supportResult = await model.generateContent(supportPrompt);
      const supportResponse = await supportResult.response;
      responseText = (await supportResponse.text()).trim();
   
    chatHistory.push({ role: 'bot', content: responseText });// Update chat history with the AI response
    res.json({ response: responseText, chatHistory });
  } catch (err) {
      // console.error(err);
      res.status(500).send('Server error');
  }
});

app.post('/api/clear', (req, res) => {
  chatHistory = [];
  res.sendStatus(200);
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});






