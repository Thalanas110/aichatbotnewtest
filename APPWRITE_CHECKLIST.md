# Quick Appwrite Setup Checklist

## ✅ Step-by-Step Checklist

### 1. Create Appwrite Account
- [ ] Go to https://cloud.appwrite.io
- [ ] Sign up for free account
- [ ] Verify email

### 2. Create Project
- [ ] Create new project
- [ ] Name it "AI Chatbot"
- [ ] Copy Project ID: `___________________________`

### 3. Get API Key
- [ ] Go to "Overview" → "Integrate with your server"
- [ ] Click "API Keys" → "Create API Key"
- [ ] Name: "Chatbot Server"
- [ ] Enable scopes: databases.*, collections.*, documents.*
- [ ] Copy API Key: `___________________________`

### 4. Create Database
- [ ] Go to "Databases" → "Create database"
- [ ] Name: "chatbot_db"
- [ ] Copy Database ID: `___________________________`

### 5. Create "conversations" Collection
- [ ] Inside database, create collection
- [ ] Name: "conversations"
- [ ] Copy Collection ID: `___________________________`
- [ ] Add attributes:

```
| Attribute  | Type   | Size | Required |
|------------|--------|------|----------|
| title      | String | 255  | ✓        |
| userId     | String | 100  | ✓        |
| createdAt  | String | 50   | ✓        |
| updatedAt  | String | 50   | ✓        |
```

- [ ] Set permissions: Role "Any" → All permissions

### 6. Create "messages" Collection
- [ ] Create another collection
- [ ] Name: "messages"
- [ ] Copy Collection ID: `___________________________`
- [ ] Add attributes:

```
| Attribute      | Type   | Size  | Required |
|----------------|--------|-------|----------|
| conversationId | String | 100   | ✓        |
| role           | String | 20    | ✓        |
| content        | String | 10000 | ✓        |
| createdAt      | String | 50    | ✓        |
```

- [ ] Set permissions: Role "Any" → All permissions

### 7. Update .env File
```env
GEMINI_API_KEY=your_existing_key

APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=<paste Project ID>
APPWRITE_API_KEY=<paste API Key>
APPWRITE_DATABASE_ID=<paste Database ID>
APPWRITE_CONVERSATIONS_COLLECTION_ID=<paste conversations Collection ID>
APPWRITE_MESSAGES_COLLECTION_ID=<paste messages Collection ID>
```

### 8. Test
- [ ] Restart server: `npm start`
- [ ] Look for: `✓ Appwrite initialized successfully!`
- [ ] Check app shows: "Appwrite DB" instead of "Local Storage"
- [ ] Create a test chat
- [ ] Refresh browser - chat should still be there!

---

## 🆘 Need Help?

**Common Issues:**

**"Appwrite not configured"**
→ Double-check all IDs in .env match exactly (case-sensitive)

**"Permission denied"**
→ Make sure you set "Any" role with all permissions on both collections

**"Document not found"**
→ Verify collection IDs are correct and attributes are created

---

## 📚 Full Details

See [APPWRITE_SETUP.md](APPWRITE_SETUP.md) for detailed instructions with screenshots and explanations.

## ⏱️ Estimated Time

- First-time setup: **15-20 minutes**
- With this checklist: **10-15 minutes**

---

**Pro Tip**: Copy each ID immediately after creating it to avoid switching back and forth!
