# AI Chatbot - Appwrite Setup Guide

This guide will help you set up Appwrite for your AI Chatbot to enable persistent chat history storage.

## What is Appwrite?

Appwrite is an open-source backend-as-a-service platform that provides you with a set of APIs and tools to build secure and scalable applications. We'll use it to store conversation history.

## Prerequisites

- An Appwrite Cloud account (free tier available) OR
- Self-hosted Appwrite instance

## Step-by-Step Setup

### 1. Create an Appwrite Account

1. Go to [https://cloud.appwrite.io](https://cloud.appwrite.io)
2. Click "Sign Up" and create a free account
3. Verify your email address

### 2. Create a New Project

1. After logging in, click "Create Project"
2. Enter a name for your project (e.g., "AI Chatbot")
3. Enter a Project ID (or let it auto-generate)
4. Click "Create"

### 3. Get Your Project Credentials

1. In your project dashboard, click on "Settings" in the left sidebar
2. Copy the following values:
   - **Project ID**: Found under "Project ID"
   - **API Endpoint**: Usually `https://cloud.appwrite.io/v1`

### 4. Create an API Key

1. In your project, go to "Overview" → "Integrate with your server"
2. Click on "API Keys" tab
3. Click "Create API Key"
4. Name it "Chatbot Server"
5. Set the following scopes:
   - `databases.read`
   - `databases.write`
   - `collections.read`
   - `collections.write`
   - `attributes.read`
   - `attributes.write`
   - `documents.read`
   - `documents.write`
6. Click "Create"
7. **IMPORTANT**: Copy the API key immediately and save it securely (you won't be able to see it again)

### 5. Create a Database

1. In the left sidebar, click "Databases"
2. Click "Create database"
3. Enter a name: "chatbot_db"
4. Enter a Database ID: "chatbot_db" (or let it auto-generate)
5. Click "Create"
6. **Copy the Database ID** for later

### 6. Create Collections

Now we need to create two collections: one for conversations and one for messages.

#### Collection 1: Conversations

1. Inside your database, click "Create collection"
2. Enter name: "conversations"
3. Enter Collection ID: "conversations" (or let it auto-generate)
4. Click "Create"
5. **Copy the Collection ID** for later

**Add Attributes to Conversations Collection:**

1. Click on the "Attributes" tab
2. Add the following attributes by clicking "Create attribute":

   | Attribute Key | Type    | Size | Required | Default |
   |--------------|---------|------|----------|---------|
   | title        | String  | 255  | Yes      | -       |
   | userId       | String  | 100  | Yes      | -       |
   | createdAt    | String  | 50   | Yes      | -       |
   | updatedAt    | String  | 50   | Yes      | -       |

3. After creating all attributes, go to the "Settings" tab
4. Under "Permissions", add the following for testing (you can make this more restrictive later):
   - **Role**: Any
   - Permissions: Create, Read, Update, Delete

#### Collection 2: Messages

1. Go back to your database
2. Click "Create collection"
3. Enter name: "messages"
4. Enter Collection ID: "messages" (or let it auto-generate)
5. Click "Create"
6. **Copy the Collection ID** for later

**Add Attributes to Messages Collection:**

1. Click on the "Attributes" tab
2. Add the following attributes:

   | Attribute Key   | Type    | Size  | Required | Default |
   |----------------|---------|-------|----------|---------|
   | conversationId | String  | 100   | Yes      | -       |
   | role           | String  | 20    | Yes      | -       |
   | content        | String  | 10000 | Yes      | -       |
   | createdAt      | String  | 50    | Yes      | -       |

3. After creating all attributes, go to the "Settings" tab
4. Under "Permissions", add the following for testing:
   - **Role**: Any
   - Permissions: Create, Read, Update, Delete

### 7. Create Indexes (Optional but Recommended)

For better performance, create indexes on frequently queried fields:

**Conversations Collection:**
1. Go to "Indexes" tab
2. Create index:
   - Key: `userId_index`
   - Type: Key
   - Attributes: `userId`
   - Orders: ASC

**Messages Collection:**
1. Go to "Indexes" tab
2. Create index:
   - Key: `conversationId_index`
   - Type: Key
   - Attributes: `conversationId`
   - Orders: ASC

### 8. Update Your .env File

Now update your `.env` file with all the credentials you collected:

```env
# Gemini API Key (you already have this)
GEMINI_API_KEY=your_gemini_api_key_here

# Appwrite Configuration
APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=your_project_id_here
APPWRITE_API_KEY=your_api_key_here
APPWRITE_DATABASE_ID=chatbot_db
APPWRITE_CONVERSATIONS_COLLECTION_ID=conversations
APPWRITE_MESSAGES_COLLECTION_ID=messages

# Server Configuration
PORT=3000
```

### 9. Test Your Setup

1. Save your `.env` file
2. Restart your server:
   ```bash
   npm start
   ```
3. Look for the message: `✓ Appwrite initialized successfully!`
4. Check the storage indicator in the app - it should now say "Appwrite DB" instead of "Local Storage"

## Troubleshooting

### "Appwrite not configured" message

- Double-check that all environment variables in `.env` are set correctly
- Make sure there are no spaces around the `=` sign
- Ensure Collection IDs and Database ID match exactly (case-sensitive)

### Permission Denied Errors

- Check that you've set the correct permissions on both collections
- For development, you can use "Any" role with all permissions
- For production, implement proper authentication and use more restrictive permissions

### Cannot Create Documents

- Ensure all required attributes are present in your collections
- Check that attribute names match exactly (case-sensitive)
- Verify that string sizes are large enough for your data

## Local Storage Fallback

Don't worry! If Appwrite is not configured, the app will automatically use local in-memory storage. This means:
- ✅ The app will still work
- ❌ Data will be lost when the server restarts
- ❌ Data won't be shared across devices

## Next Steps

Once Appwrite is set up:

1. **Add User Authentication**: Implement Appwrite Auth to support multiple users
2. **Secure Permissions**: Update collection permissions to be user-specific
3. **Add Real-time Updates**: Use Appwrite Realtime to sync chats across devices
4. **Implement Search**: Add full-text search across conversations

## Resources

- [Appwrite Documentation](https://appwrite.io/docs)
- [Appwrite Discord Community](https://discord.com/invite/appwrite)
- [Appwrite Console](https://cloud.appwrite.io)

## Security Notes

⚠️ **Important Security Considerations:**

1. **Never commit your .env file** to version control
2. **Use .gitignore** to exclude `.env` from your repository
3. **Rotate API keys regularly** in production
4. **Implement user authentication** before deploying to production
5. **Set up proper CORS policies** in Appwrite settings
6. **Use environment-specific configurations** for dev/staging/production

---

Need help? Feel free to check the Appwrite documentation or ask in their community Discord!
