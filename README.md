# AI Chatbot 🤖

A fully-fledged interactive chatbot powered by Google's Gemini AI.

## Features

- 💬 Interactive conversation with context awareness
- 📝 Maintains conversation history
- 🎯 Commands for managing chat sessions
- 🛡️ Error handling and graceful responses
- 🎨 User-friendly terminal interface

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file and add your Gemini API key:
```bash
GEMINI_API_KEY=your_api_key_here
```

Get your API key from: https://aistudio.google.com/app/apikey

3. Run the chatbot:
```bash
npm start
```

## Available Commands

- `exit`, `quit`, `bye` - End the conversation
- `clear` - Clear conversation history
- `history` - View conversation history

## Usage Example

```
You: Hello!
Bot: Hi there! How can I help you today?

You: Tell me a joke
Bot: Why did the programmer quit his job? Because he didn't get arrays! 😄

You: history
--- Conversation History ---
1. You: Hello!
2. Bot: Hi there! How can I help you today?
3. You: Tell me a joke
4. Bot: Why did the programmer quit his job? Because he didn't get arrays! 😄
---------------------------
```

## Technologies Used

- TypeScript
- Google Gemini AI
- Node.js
