const { Client, Databases, ID, Query } = require('node-appwrite');
const config = require('./appwrite.config');

class AppwriteService {
    constructor() {
        this.client = new Client();
        this.databases = null;
        this.isConfigured = false;

        // Check if Appwrite is configured
        if (config.projectId && config.apiKey && config.databaseId) {
            this.client
                .setEndpoint(config.endpoint)
                .setProject(config.projectId)
                .setKey(config.apiKey);

            this.databases = new Databases(this.client);
            this.isConfigured = true;
            console.log('✓ Appwrite initialized successfully!');
        } else {
            console.log('⚠ Appwrite not configured. Using local storage fallback.');
        }
    }

    // Check if Appwrite is configured
    isEnabled() {
        return this.isConfigured;
    }

    // Create a new conversation
    async createConversation(title, userId = 'guest') {
        if (!this.isConfigured) {
            throw new Error('Appwrite is not configured');
        }

        try {
            const conversation = await this.databases.createDocument(
                config.databaseId,
                config.conversationsCollectionId,
                ID.unique(),
                {
                    title: title || 'New Chat',
                    userId: userId,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                }
            );
            return conversation;
        } catch (error) {
            console.error('Error creating conversation:', error);
            throw error;
        }
    }

    // Get all conversations for a user
    async getConversations(userId = 'guest', limit = 50) {
        if (!this.isConfigured) {
            throw new Error('Appwrite is not configured');
        }

        try {
            const conversations = await this.databases.listDocuments(
                config.databaseId,
                config.conversationsCollectionId,
                [
                    Query.equal('userId', userId),
                    Query.orderDesc('updatedAt'),
                    Query.limit(limit)
                ]
            );
            return conversations.documents;
        } catch (error) {
            console.error('Error getting conversations:', error);
            throw error;
        }
    }

    // Get a single conversation
    async getConversation(conversationId) {
        if (!this.isConfigured) {
            throw new Error('Appwrite is not configured');
        }

        try {
            const conversation = await this.databases.getDocument(
                config.databaseId,
                config.conversationsCollectionId,
                conversationId
            );
            return conversation;
        } catch (error) {
            console.error('Error getting conversation:', error);
            throw error;
        }
    }

    // Update conversation
    async updateConversation(conversationId, data) {
        if (!this.isConfigured) {
            throw new Error('Appwrite is not configured');
        }

        try {
            const conversation = await this.databases.updateDocument(
                config.databaseId,
                config.conversationsCollectionId,
                conversationId,
                {
                    ...data,
                    updatedAt: new Date().toISOString()
                }
            );
            return conversation;
        } catch (error) {
            console.error('Error updating conversation:', error);
            throw error;
        }
    }

    // Delete a conversation
    async deleteConversation(conversationId) {
        if (!this.isConfigured) {
            throw new Error('Appwrite is not configured');
        }

        try {
            // First delete all messages in the conversation
            await this.deleteMessagesByConversation(conversationId);
            
            // Then delete the conversation
            await this.databases.deleteDocument(
                config.databaseId,
                config.conversationsCollectionId,
                conversationId
            );
            return true;
        } catch (error) {
            console.error('Error deleting conversation:', error);
            throw error;
        }
    }

    // Create a message
    async createMessage(conversationId, role, content) {
        if (!this.isConfigured) {
            throw new Error('Appwrite is not configured');
        }

        try {
            const message = await this.databases.createDocument(
                config.databaseId,
                config.messagesCollectionId,
                ID.unique(),
                {
                    conversationId: conversationId,
                    role: role,
                    content: content,
                    createdAt: new Date().toISOString()
                }
            );

            // Update conversation's updatedAt
            await this.updateConversation(conversationId, {});

            return message;
        } catch (error) {
            console.error('Error creating message:', error);
            throw error;
        }
    }

    // Get messages for a conversation
    async getMessages(conversationId, limit = 100) {
        if (!this.isConfigured) {
            throw new Error('Appwrite is not configured');
        }

        try {
            const messages = await this.databases.listDocuments(
                config.databaseId,
                config.messagesCollectionId,
                [
                    Query.equal('conversationId', conversationId),
                    Query.orderAsc('createdAt'),
                    Query.limit(limit)
                ]
            );
            return messages.documents;
        } catch (error) {
            console.error('Error getting messages:', error);
            throw error;
        }
    }

    // Delete all messages in a conversation
    async deleteMessagesByConversation(conversationId) {
        if (!this.isConfigured) {
            throw new Error('Appwrite is not configured');
        }

        try {
            const messages = await this.getMessages(conversationId);
            
            for (const message of messages) {
                await this.databases.deleteDocument(
                    config.databaseId,
                    config.messagesCollectionId,
                    message.$id
                );
            }
            
            return true;
        } catch (error) {
            console.error('Error deleting messages:', error);
            throw error;
        }
    }
}

module.exports = new AppwriteService();
