// DOM Elements
const chatContainer = document.getElementById('chatContainer');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const typingIndicator = document.getElementById('typingIndicator');
const status = document.getElementById('status');

// Sidebar elements
const sidebar = document.getElementById('sidebar');
const toggleSidebarBtn = document.getElementById('toggleSidebarBtn');
const closeSidebarBtn = document.getElementById('closeSidebarBtn');
const newChatBtn = document.getElementById('newChatBtn');
const conversationsList = document.getElementById('conversationsList');
const storageType = document.getElementById('storageType');

// Menu elements
const menuBtn = document.getElementById('menuBtn');
const sideMenu = document.getElementById('sideMenu');
const closeMenu = document.getElementById('closeMenu');
const menuOverlay = document.getElementById('menuOverlay');
const renameChat = document.getElementById('renameChat');
const deleteChat = document.getElementById('deleteChat');
const viewModels = document.getElementById('viewModels');

// Modal elements
const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modalTitle');
const modalBody = document.getElementById('modalBody');
const closeModal = document.getElementById('closeModal');
const modalOverlay = document.getElementById('modalOverlay');

// State
let currentConversationId = null;
let conversationHistory = [];
let appwriteEnabled = false;
const userId = 'guest'; // In a real app, this would be the logged-in user's ID

// API endpoints
const API_URL = '/api/chat';
const MODELS_URL = '/api/models';
const CONVERSATIONS_URL = '/api/conversations';
const STATUS_URL = '/api/status';

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    await checkAppwriteStatus();
    await loadConversations();
    userInput.focus();
    autoResizeTextarea();
});

// Check Appwrite status
async function checkAppwriteStatus() {
    try {
        const response = await fetch(STATUS_URL);
        const data = await response.json();
        appwriteEnabled = data.appwriteEnabled;
        storageType.textContent = appwriteEnabled ? 'Appwrite DB' : 'Local Storage';
    } catch (error) {
        console.error('Error checking Appwrite status:', error);
    }
}

// Sidebar toggle
toggleSidebarBtn.addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
});

if (closeSidebarBtn) {
    closeSidebarBtn.addEventListener('click', () => {
        sidebar.classList.add('collapsed');
    });
}

// New chat button
newChatBtn.addEventListener('click', async () => {
    await createNewConversation();
});

// Menu functionality
menuBtn.addEventListener('click', () => {
    sideMenu.classList.add('active');
});

closeMenu.addEventListener('click', () => {
    sideMenu.classList.remove('active');
});

menuOverlay.addEventListener('click', () => {
    sideMenu.classList.remove('active');
});

// Auto-resize textarea
userInput.addEventListener('input', autoResizeTextarea);

function autoResizeTextarea() {
    userInput.style.height = 'auto';
    userInput.style.height = Math.min(userInput.scrollHeight, 120) + 'px';
}

// Send message on Enter (but allow Shift+Enter for new line)
userInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

// Send button click
sendBtn.addEventListener('click', sendMessage);

// Rename chat
renameChat.addEventListener('click', () => {
    if (!currentConversationId) {
        alert('No active conversation to rename');
        return;
    }
    sideMenu.classList.remove('active');
    showRenameModal();
});

// Delete chat
deleteChat.addEventListener('click', async () => {
    if (!currentConversationId) {
        alert('No active conversation to delete');
        return;
    }
    
    if (confirm('Are you sure you want to delete this conversation? This cannot be undone.')) {
        sideMenu.classList.remove('active');
        await deleteConversation(currentConversationId);
    }
});

// View models
viewModels.addEventListener('click', async () => {
    sideMenu.classList.remove('active');
    showModal('Available Models', '<div class="empty-state">Loading models...</div>');
    
    try {
        const response = await fetch(MODELS_URL);
        const data = await response.json();
        
        if (data.success && data.models) {
            showModal('Available Models', generateModelsHTML(data.models, data.currentModel));
        } else {
            showModal('Available Models', '<div class="empty-state">Failed to load models</div>');
        }
    } catch (error) {
        console.error('Error fetching models:', error);
        showModal('Available Models', '<div class="empty-state">Error loading models</div>');
    }
});

// Modal functionality
closeModal.addEventListener('click', () => {
    modal.classList.remove('active');
});

modalOverlay.addEventListener('click', () => {
    modal.classList.remove('active');
});

// Create new conversation
async function createNewConversation() {
    try {
        const response = await fetch(CONVERSATIONS_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                title: 'New Chat',
                userId: userId
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            currentConversationId = data.conversation.$id;
            conversationHistory = [];
            
            // Clear chat container
            chatContainer.innerHTML = `
                <div class="welcome-message">
                    <div class="welcome-icon">👋</div>
                    <h2>New Conversation Started!</h2>
                    <p>Start chatting by typing a message below.</p>
                    <div class="feature-list">
                        <div class="feature-item">💬 Natural conversations</div>
                        <div class="feature-item">🧠 Powered by Google Gemini</div>
                        <div class="feature-item">📱 Mobile friendly</div>
                        <div class="feature-item">💾 Chat history</div>
                    </div>
                </div>
            `;
            
            await loadConversations();
            userInput.focus();
            
            // On mobile, close sidebar after creating new chat
            if (window.innerWidth <= 768) {
                sidebar.classList.add('collapsed');
            }
        }
    } catch (error) {
        console.error('Error creating conversation:', error);
        updateStatus('Error creating conversation');
    }
}

// Load conversations
async function loadConversations() {
    try {
        const response = await fetch(`${CONVERSATIONS_URL}?userId=${userId}`);
        const data = await response.json();
        
        if (data.success) {
            renderConversations(data.conversations);
        }
    } catch (error) {
        console.error('Error loading conversations:', error);
    }
}

// Render conversations in sidebar
function renderConversations(conversations) {
    if (!conversations || conversations.length === 0) {
        conversationsList.innerHTML = `
            <div class="empty-conversations">
                <p>No conversations yet</p>
                <p class="small-text">Start a new chat to begin</p>
            </div>
        `;
        return;
    }
    
    conversationsList.innerHTML = conversations.map(conv => {
        const date = new Date(conv.updatedAt || conv.createdAt);
        const dateStr = formatDate(date);
        const isActive = conv.$id === currentConversationId;
        
        return `
            <div class="conversation-item ${isActive ? 'active' : ''}" data-id="${conv.$id}">
                <div class="conversation-title">${escapeHtml(conv.title)}</div>
                <div class="conversation-date">${dateStr}</div>
            </div>
        `;
    }).join('');
    
    // Add click listeners
    document.querySelectorAll('.conversation-item').forEach(item => {
        item.addEventListener('click', () => {
            const convId = item.dataset.id;
            loadConversation(convId);
        });
    });
}

// Load a specific conversation
async function loadConversation(conversationId) {
    try {
        updateStatus('Loading conversation...');
        
        const response = await fetch(`${CONVERSATIONS_URL}/${conversationId}`);
        const data = await response.json();
        
        if (data.success) {
            currentConversationId = conversationId;
            
            // Clear chat container
            chatContainer.innerHTML = '';
            
            // Load messages
            conversationHistory = [];
            
            if (data.messages && data.messages.length > 0) {
                data.messages.forEach(msg => {
                    const role = msg.role === 'user' ? 'user' : 'bot';
                    const content = msg.content || msg.parts;
                    addMessage(content, role, false);
                    conversationHistory.push({
                        role: msg.role,
                        parts: content
                    });
                });
            } else {
                chatContainer.innerHTML = `
                    <div class="welcome-message">
                        <div class="welcome-icon">👋</div>
                        <h2>Continue your conversation!</h2>
                        <p>Type a message below to continue.</p>
                    </div>
                `;
            }
            
            // Update sidebar to show active conversation
            await loadConversations();
            
            updateStatus('Ready to chat');
            userInput.focus();
            
            // On mobile, close sidebar after loading
            if (window.innerWidth <= 768) {
                sidebar.classList.add('collapsed');
            }
        }
    } catch (error) {
        console.error('Error loading conversation:', error);
        updateStatus('Error loading conversation');
    }
}

// Delete conversation
async function deleteConversation(conversationId) {
    try {
        const response = await fetch(`${CONVERSATIONS_URL}/${conversationId}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (data.success) {
            if (conversationId === currentConversationId) {
                currentConversationId = null;
                conversationHistory = [];
                chatContainer.innerHTML = `
                    <div class="welcome-message">
                        <div class="welcome-icon">👋</div>
                        <h2>Welcome to AI Chatbot!</h2>
                        <p>Start a conversation by typing a message below.</p>
                        <div class="feature-list">
                            <div class="feature-item">💬 Natural conversations</div>
                            <div class="feature-item">🧠 Powered by Google Gemini</div>
                            <div class="feature-item">📱 Mobile friendly</div>
                            <div class="feature-item">💾 Chat history</div>
                        </div>
                    </div>
                `;
            }
            
            await loadConversations();
            updateStatus('Conversation deleted');
        }
    } catch (error) {
        console.error('Error deleting conversation:', error);
        updateStatus('Error deleting conversation');
    }
}

// Show rename modal
function showRenameModal() {
    const currentConv = document.querySelector('.conversation-item.active .conversation-title');
    const currentTitle = currentConv ? currentConv.textContent : 'New Chat';
    
    const formHTML = `
        <form class="rename-form" id="renameForm">
            <input type="text" id="newTitle" value="${escapeHtml(currentTitle)}" maxlength="100" required>
            <div class="rename-form-actions">
                <button type="button" class="btn btn-secondary" id="cancelRename">Cancel</button>
                <button type="submit" class="btn btn-primary">Save</button>
            </div>
        </form>
    `;
    
    showModal('Rename Conversation', formHTML);
    
    const form = document.getElementById('renameForm');
    const input = document.getElementById('newTitle');
    const cancelBtn = document.getElementById('cancelRename');
    
    input.focus();
    input.select();
    
    cancelBtn.addEventListener('click', () => {
        modal.classList.remove('active');
    });
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const newTitle = input.value.trim();
        
        if (newTitle && currentConversationId) {
            await updateConversationTitle(currentConversationId, newTitle);
            modal.classList.remove('active');
        }
    });
}

// Update conversation title
async function updateConversationTitle(conversationId, title) {
    try {
        const response = await fetch(`${CONVERSATIONS_URL}/${conversationId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ title })
        });
        
        const data = await response.json();
        
        if (data.success) {
            await loadConversations();
            updateStatus('Title updated');
            setTimeout(() => updateStatus('Ready to chat'), 2000);
        }
    } catch (error) {
        console.error('Error updating title:', error);
        updateStatus('Error updating title');
    }
}

// Send message function
async function sendMessage() {
    const message = userInput.value.trim();
    
    if (!message) return;
    
    // Create new conversation if none exists
    if (!currentConversationId) {
        await createNewConversation();
    }
    
    // Clear input and reset height
    userInput.value = '';
    autoResizeTextarea();
    
    // Disable input while processing
    userInput.disabled = true;
    sendBtn.disabled = true;
    updateStatus('Thinking...');
    
    // Remove welcome message if it exists
    const welcomeMsg = chatContainer.querySelector('.welcome-message');
    if (welcomeMsg) {
        welcomeMsg.remove();
    }
    
    // Add user message to UI
    addMessage(message, 'user');
    
    // Add to conversation history
    conversationHistory.push({
        role: 'user',
        parts: message
    });
    
    // Show typing indicator
    typingIndicator.classList.add('active');
    scrollToBottom();
    
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: message,
                conversationId: currentConversationId,
                history: conversationHistory
            })
        });
        
        const data = await response.json();
        
        // Hide typing indicator
        typingIndicator.classList.remove('active');
        
        if (data.success) {
            // Add bot response to UI
            addMessage(data.response, 'bot');
            
            // Add to conversation history
            conversationHistory.push({
                role: 'model',
                parts: data.response
            });
            
            // Reload conversations to update the list (title may have changed)
            await loadConversations();
            
            updateStatus('Ready to chat');
        } else {
            addMessage('Sorry, I encountered an error. Please try again.', 'bot');
            updateStatus('Error occurred');
        }
    } catch (error) {
        console.error('Error:', error);
        typingIndicator.classList.remove('active');
        addMessage('Sorry, I couldn\'t connect to the server. Please check your connection.', 'bot');
        updateStatus('Connection error');
    }
    
    // Re-enable input
    userInput.disabled = false;
    sendBtn.disabled = false;
    userInput.focus();
}

// Add message to chat
function addMessage(text, sender, animate = true) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;
    if (!animate) {
        messageDiv.style.animation = 'none';
    }
    
    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    messageDiv.innerHTML = `
        <div class="message-content">
            ${escapeHtml(text)}
            <div class="message-time">${time}</div>
        </div>
    `;
    
    chatContainer.appendChild(messageDiv);
    scrollToBottom();
}

// Show modal
function showModal(title, content) {
    modalTitle.textContent = title;
    modalBody.innerHTML = content;
    modal.classList.add('active');
}

// Generate models HTML
function generateModelsHTML(models, currentModel) {
    if (!models || models.length === 0) {
        return '<div class="empty-state">No models available</div>';
    }
    
    return `
        <div class="model-item" style="border: 2px solid var(--primary-color);">
            <div class="model-name">🔧 Currently using: ${currentModel}</div>
        </div>
        ${models.map(model => `
            <div class="model-item">
                <div class="model-name">${model.displayName || model.name}</div>
                ${model.description ? `<div class="model-detail">📝 ${model.description}</div>` : ''}
                ${model.supportedGenerationMethods ? `<div class="model-detail">⚙️ Methods: ${model.supportedGenerationMethods.join(', ')}</div>` : ''}
                ${model.inputTokenLimit ? `<div class="model-detail">📥 Input Tokens: ${model.inputTokenLimit.toLocaleString()}</div>` : ''}
                ${model.outputTokenLimit ? `<div class="model-detail">📤 Output Tokens: ${model.outputTokenLimit.toLocaleString()}</div>` : ''}
            </div>
        `).join('')}
    `;
}

// Update status
function updateStatus(text) {
    status.textContent = text;
}

// Scroll to bottom
function scrollToBottom() {
    setTimeout(() => {
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }, 100);
}

// Format date
function formatDate(date) {
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
        return 'Today ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
        return 'Yesterday';
    } else if (days < 7) {
        return days + ' days ago';
    } else {
        return date.toLocaleDateString();
    }
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML.replace(/\n/g, '<br>');
}
