# AI Chatbot with Chat History 🤖💬

A fully-featured AI chatbot web application powered by Google Gemini with ChatGPT-like chat history management. Built with vanilla HTML, CSS, and JavaScript - no frameworks needed!

## ✨ Features

- 💬 **Natural Conversations**: Powered by Google Gemini AI
- 📱 **Mobile Friendly**: Responsive design that works on all devices
- 💾 **Chat History**: Save and manage multiple conversations (ChatGPT-style)
- 🗂️ **Sidebar Navigation**: Easy access to past conversations
- ✏️ **Rename & Delete**: Manage your chat history
- 🎨 **Beautiful UI**: Modern gradient design with smooth animations
- ⚡ **Real-time Typing Indicator**: See when the AI is thinking
- 🔄 **Auto-save**: Conversations are automatically saved
- 🌐 **Appwrite Integration**: Optional cloud database for persistent storage
- 📦 **Local Fallback**: Works without Appwrite using in-memory storage

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- A Google Gemini API key ([Get one here](https://makersuite.google.com/app/apikey))

### Installation

1. **Clone or download this repository**

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up your environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   PORT=3000
   ```

4. **Start the server**
   ```bash
   npm start
   ```

5. **Open your browser**
   
   Navigate to `http://localhost:3000`

That's it! You're ready to chat! 🎉

## 📚 Storage Options

### Option 1: Local Storage (Default)

By default, the app uses in-memory storage. This means:
- ✅ No additional setup required
- ✅ Works immediately
- ❌ Data is lost when server restarts
- ❌ Not suitable for production

### Option 2: Appwrite Database (Recommended)

For persistent storage across server restarts:

1. **Follow the setup guide**: See [APPWRITE_SETUP.md](APPWRITE_SETUP.md) for detailed instructions
2. **Add Appwrite credentials** to your `.env` file
3. **Restart the server**

Benefits:
- ✅ Persistent storage
- ✅ Scalable
- ✅ Free tier available
- ✅ Production-ready

## 🎯 Usage

### Creating a New Chat

- Click the **"New Chat"** button in the sidebar
- Start typing your message
- The conversation title will be auto-generated from your first message

### Managing Conversations

- Click on any conversation in the sidebar to open it
- Click the menu button (⋮) to:
  - Rename the conversation
  - Delete the conversation
  - View available AI models

### Mobile Experience

- Tap the hamburger menu (☰) to toggle the sidebar
- Sidebar automatically closes after selecting a conversation
- Fully responsive design optimized for touch

## 📁 Project Structure

```
aichatbotnewtest/
├── index.html              # Main HTML file with chat interface
├── styles.css              # Comprehensive styling (no frameworks!)
├── client.js               # Frontend JavaScript logic
├── server.js               # Express backend server
├── app.js                  # Legacy frontend (deprecated)
├── chatbot.ts              # CLI version (optional)
├── appwrite.service.js     # Appwrite database service
├── appwrite.config.js      # Appwrite configuration
├── package.json            # Dependencies
├── .env                    # Environment variables (create this)
├── .env.example            # Environment template
├── APPWRITE_SETUP.md       # Detailed Appwrite setup guide
└── README.md               # This file
```

## 🛠️ Available Scripts

- `npm start` - Start the web server
- `npm run cli` - Run the CLI version (terminal-based chatbot)
- `npm run dev` - Start in development mode
- `npm run build` - Compile TypeScript files

## 🎨 Customization

### Changing Colors

Edit the CSS variables in `styles.css`:

```css
:root {
    --primary-color: #667eea;      /* Main theme color */
    --secondary-color: #764ba2;     /* Gradient secondary */
    --background: #f7fafc;          /* Page background */
    --user-msg-bg: #667eea;         /* User message bubble */
    /* ... more variables */
}
```

### Changing AI Model

Edit `server.js` to use a different Gemini model:

```javascript
const modelName = 'models/gemini-2.0-flash-exp';  // Change this
```

Available models:
- `gemini-2.0-flash-exp` (current)
- `gemini-1.5-pro`
- `gemini-1.5-flash`

## 📱 Features Comparison

| Feature | Web UI | CLI Version |
|---------|--------|-------------|
| Chat Interface | ✅ Modern UI | ✅ Terminal |
| Chat History | ✅ Yes | ❌ No |
| Mobile Friendly | ✅ Yes | ❌ No |
| Appwrite Support | ✅ Yes | ❌ No |
| Rename Chats | ✅ Yes | ❌ No |
| Delete Chats | ✅ Yes | ✅ Yes (clear) |
| View Models | ✅ Yes | ✅ Yes |

## 🔒 Security Notes

⚠️ **Important for Production:**

1. Never commit your `.env` file
2. Use environment variables for sensitive data
3. Implement user authentication before deploying
4. Set up proper CORS policies
5. Use HTTPS in production
6. Rotate API keys regularly

## 🐛 Troubleshooting

### Server won't start
- Check that port 3000 is not in use
- Verify your `.env` file exists and has the correct format
- Ensure all dependencies are installed: `npm install`

### "API Key not set" error
- Make sure your `.env` file contains `GEMINI_API_KEY`
- Check for typos in the variable name
- Restart the server after creating `.env`

### Conversations not saving
- Check if Appwrite is configured correctly (see APPWRITE_SETUP.md)
- Look for error messages in the console
- Verify all Appwrite environment variables are set
- The app will fall back to local storage if Appwrite fails

### Sidebar not showing on mobile
- Tap the hamburger menu icon (☰) in the header
- Make sure JavaScript is enabled in your browser

## 🤝 Contributing

Feel free to fork this project and make it your own! Some ideas:
- Add user authentication
- Implement message search
- Add file upload support
- Create conversation folders
- Add export chat functionality
- Implement markdown rendering for messages

## 📄 License

ISC License - Feel free to use this project for learning and personal projects!

## 🙏 Acknowledgments

- **Google Gemini**: For the powerful AI model
- **Appwrite**: For the backend-as-a-service platform
- **Express.js**: For the simple web server framework

## 📞 Support

If you encounter any issues:
1. Check the [APPWRITE_SETUP.md](APPWRITE_SETUP.md) guide
2. Review the troubleshooting section above
3. Check the console for error messages
4. Make sure all dependencies are installed

---

Made with ❤️ using vanilla HTML, CSS, and JavaScript - no frameworks needed!

Enjoy chatting with your AI assistant! 🚀
