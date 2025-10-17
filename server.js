const express = require('express');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { v4: uuidv4 } = require('uuid');
const appwriteService = require('./appwrite.service');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(__dirname));

// Initialize Gemini AI
const apiKey = process.env.GEMINI_API_KEY || '';

if (!apiKey) {
    console.error('❌ Error: GEMINI_API_KEY is not set!');
    console.error('Please create a .env file with your API key:');
    console.error('GEMINI_API_KEY=your_api_key_here');
    process.exit(1);
}

console.log('✓ API Key loaded successfully!');

const ai = new GoogleGenerativeAI(apiKey);
const modelName = 'models/gemini-2.0-flash-exp';
const model = ai.getGenerativeModel({ model: modelName });

// In-memory storage for conversations (fallback if Appwrite is not configured)
const localConversations = new Map();

// Serve the HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Check Appwrite status
app.get('/api/status', (req, res) => {
    res.json({
        success: true,
        appwriteEnabled: appwriteService.isEnabled()
    });
});

// Get all conversations
app.get('/api/conversations', async (req, res) => {
    try {
        const userId = req.query.userId || 'guest';

        if (appwriteService.isEnabled()) {
            const conversations = await appwriteService.getConversations(userId);
            res.json({
                success: true,
                conversations: conversations
            });
        } else {
            // Use local storage
            const conversations = Array.from(localConversations.values())
                .filter(conv => conv.userId === userId)
                .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
            
            res.json({
                success: true,
                conversations: conversations
            });
        }
    } catch (error) {
        console.error('Error getting conversations:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get conversations'
        });
    }
});

// Create a new conversation
app.post('/api/conversations', async (req, res) => {
    try {
        const { title, userId = 'guest' } = req.body;

        if (appwriteService.isEnabled()) {
            const conversation = await appwriteService.createConversation(title, userId);
            res.json({
                success: true,
                conversation: conversation
            });
        } else {
            // Use local storage
            const conversation = {
                $id: uuidv4(),
                title: title || 'New Chat',
                userId: userId,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                messages: []
            };
            
            localConversations.set(conversation.$id, conversation);
            
            res.json({
                success: true,
                conversation: conversation
            });
        }
    } catch (error) {
        console.error('Error creating conversation:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create conversation'
        });
    }
});

// Get a single conversation with messages
app.get('/api/conversations/:id', async (req, res) => {
    try {
        const conversationId = req.params.id;

        if (appwriteService.isEnabled()) {
            const conversation = await appwriteService.getConversation(conversationId);
            const messages = await appwriteService.getMessages(conversationId);
            
            res.json({
                success: true,
                conversation: conversation,
                messages: messages
            });
        } else {
            // Use local storage
            const conversation = localConversations.get(conversationId);
            
            if (!conversation) {
                return res.status(404).json({
                    success: false,
                    error: 'Conversation not found'
                });
            }
            
            res.json({
                success: true,
                conversation: conversation,
                messages: conversation.messages || []
            });
        }
    } catch (error) {
        console.error('Error getting conversation:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get conversation'
        });
    }
});

// Update conversation title
app.patch('/api/conversations/:id', async (req, res) => {
    try {
        const conversationId = req.params.id;
        const { title } = req.body;

        if (appwriteService.isEnabled()) {
            const conversation = await appwriteService.updateConversation(conversationId, { title });
            res.json({
                success: true,
                conversation: conversation
            });
        } else {
            // Use local storage
            const conversation = localConversations.get(conversationId);
            
            if (!conversation) {
                return res.status(404).json({
                    success: false,
                    error: 'Conversation not found'
                });
            }
            
            conversation.title = title;
            conversation.updatedAt = new Date().toISOString();
            
            res.json({
                success: true,
                conversation: conversation
            });
        }
    } catch (error) {
        console.error('Error updating conversation:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update conversation'
        });
    }
});

// Delete a conversation
app.delete('/api/conversations/:id', async (req, res) => {
    try {
        const conversationId = req.params.id;

        if (appwriteService.isEnabled()) {
            await appwriteService.deleteConversation(conversationId);
            res.json({
                success: true
            });
        } else {
            // Use local storage
            const deleted = localConversations.delete(conversationId);
            
            if (!deleted) {
                return res.status(404).json({
                    success: false,
                    error: 'Conversation not found'
                });
            }
            
            res.json({
                success: true
            });
        }
    } catch (error) {
        console.error('Error deleting conversation:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete conversation'
        });
    }
});

// Chat endpoint
app.post('/api/chat', async (req, res) => {
    try {
        const { message, conversationId, history } = req.body;

        if (!message) {
            return res.status(400).json({
                success: false,
                error: 'Message is required'
            });
        }

        // Prepare contents for API (use provided history or fetch from storage)
        let conversationHistory = history || [];
        
        if (conversationId && !history) {
            if (appwriteService.isEnabled()) {
                const messages = await appwriteService.getMessages(conversationId);
                conversationHistory = messages.map(msg => ({
                    role: msg.role,
                    parts: msg.content
                }));
            } else {
                const conversation = localConversations.get(conversationId);
                if (conversation && conversation.messages) {
                    conversationHistory = conversation.messages;
                }
            }
        }

        // Add user message to history
        conversationHistory.push({
            role: 'user',
            parts: message
        });

        // Prepare contents for API
        const contents = conversationHistory.map(msg => ({
            role: msg.role,
            parts: [{ text: msg.parts }]
        }));

        const result = await model.generateContent({
            contents: contents
        });

        const botResponse = result.response.text() || "I'm sorry, I couldn't generate a response.";

        // Add bot response to history
        conversationHistory.push({
            role: 'model',
            parts: botResponse
        });

        // Save messages to storage if conversationId is provided
        if (conversationId) {
            if (appwriteService.isEnabled()) {
                // Save to Appwrite
                await appwriteService.createMessage(conversationId, 'user', message);
                await appwriteService.createMessage(conversationId, 'model', botResponse);
                
                // Update conversation title if it's the first message
                const messages = await appwriteService.getMessages(conversationId);
                if (messages.length === 2) { // First exchange
                    const title = message.substring(0, 50) + (message.length > 50 ? '...' : '');
                    await appwriteService.updateConversation(conversationId, { title });
                }
            } else {
                // Save to local storage
                const conversation = localConversations.get(conversationId);
                if (conversation) {
                    if (!conversation.messages) {
                        conversation.messages = [];
                    }
                    conversation.messages.push(
                        { role: 'user', parts: message, createdAt: new Date().toISOString() },
                        { role: 'model', parts: botResponse, createdAt: new Date().toISOString() }
                    );
                    conversation.updatedAt = new Date().toISOString();
                    
                    // Update title if it's the first message
                    if (conversation.messages.length === 2) {
                        conversation.title = message.substring(0, 50) + (message.length > 50 ? '...' : '');
                    }
                }
            }
        }

        res.json({
            success: true,
            response: botResponse,
            conversationHistory: conversationHistory
        });

    } catch (error) {
        console.error('Error during chat:', error);
        res.status(500).json({
            success: false,
            error: 'An error occurred while processing your request'
        });
    }
});

// Models endpoint
app.get('/api/models', async (req, res) => {
    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
        );

        if (!response.ok) {
            throw new Error(`Failed to fetch models: ${response.statusText}`);
        }

        const data = await response.json();

        res.json({
            success: true,
            models: data.models || [],
            currentModel: modelName
        });

    } catch (error) {
        console.error('Error fetching models:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch models'
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log('=================================');
    console.log('  AI Chatbot Web UI Started! 🚀');
    console.log('=================================');
    console.log(`🌐 Server running at: http://localhost:${PORT}`);
    console.log(`🤖 Using model: ${modelName}`);
    console.log(`💾 Storage: ${appwriteService.isEnabled() ? 'Appwrite' : 'Local (In-Memory)'}`);
    console.log('=================================\n');
});
