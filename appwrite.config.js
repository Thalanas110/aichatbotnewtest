// Appwrite Configuration
// This file contains the configuration for connecting to Appwrite

module.exports = {
    endpoint: process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1',
    projectId: process.env.APPWRITE_PROJECT_ID || '',
    apiKey: process.env.APPWRITE_API_KEY || '',
    databaseId: process.env.APPWRITE_DATABASE_ID || '',
    conversationsCollectionId: process.env.APPWRITE_CONVERSATIONS_COLLECTION_ID || '',
    messagesCollectionId: process.env.APPWRITE_MESSAGES_COLLECTION_ID || ''
};
