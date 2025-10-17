// DOM Elements
const chatContainer = document.getElementById('chatContainer');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const typingIndicator = document.getElementById('typingIndicator');
const status = document.getElementById('status');

// Menu elements
const menuBtn = document.getElementById('menuBtn');
const sideMenu = document.getElementById('sideMenu');
const closeMenu = document.getElementById('closeMenu');
const menuOverlay = document.getElementById('menuOverlay');
const clearHistory = document.getElementById('clearHistory');
const viewHistory = document.getElementById('viewHistory');
const viewModels = document.getElementById('viewModels');

// Modal elements
const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modalTitle');
const modalBody = document.getElementById('modalBody');
const closeModal = document.getElementById('closeModal');
const modalOverlay = document.getElementById('modalOverlay');

// Conversation history
let conversationHistory = [];

// API endpoint (will be served by Express)
const API_URL = '/api/chat';
const MODELS_URL = '/api/models';

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    userInput.focus();
    autoResizeTextarea();
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

// Clear history
clearHistory.addEventListener('click', () => {
    if (confirm('Are you sure you want to clear the conversation history?')) {
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
                </div>
            </div>
        `;
        sideMenu.classList.remove('active');
        updateStatus('History cleared');
        setTimeout(() => updateStatus('Ready to chat'), 2000);
    }
});

// View history
viewHistory.addEventListener('click', () => {
    sideMenu.classList.remove('active');
    showModal('Conversation History', generateHistoryHTML());
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

function showModal(title, content) {
    modalTitle.textContent = title;
    modalBody.innerHTML = content;
    modal.classList.add('active');
}

function generateHistoryHTML() {
    if (conversationHistory.length === 0) {
        return '<div class="empty-state">No conversation history yet. Start chatting to see your messages here!</div>';
    }
    
    return conversationHistory.map((msg, index) => {
        const role = msg.role === 'user' ? 'You' : 'Bot';
        const className = msg.role === 'user' ? 'user' : 'bot';
        return `
            <div class="history-item ${className}">
                <div class="history-item-header">${index + 1}. ${role}</div>
                <div class="history-item-text">${escapeHtml(msg.parts)}</div>
            </div>
        `;
    }).join('');
}

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

// Send message function
async function sendMessage() {
    const message = userInput.value.trim();
    
    if (!message) return;
    
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
function addMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;
    
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

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML.replace(/\n/g, '<br>');
}
