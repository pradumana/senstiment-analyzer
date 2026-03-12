const chatContainer = document.getElementById('chatContainer');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');
const analyticsBtn = document.getElementById('analyticsBtn');
const analyticsModal = document.getElementById('analyticsModal');
const closeModal = document.getElementById('closeModal');
const sidebar = document.getElementById('sidebar');
const toggleSidebar = document.getElementById('toggleSidebar');
const menuBtn = document.getElementById('menuBtn');
const historyList = document.getElementById('historyList');
const exportBtn = document.getElementById('exportBtn');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');
const darkModeBtn = document.getElementById('darkModeBtn');
const voiceBtn = document.getElementById('voiceBtn');

// Store conversation history
let conversationHistory = [];
let messageIdCounter = 0;
let isRecording = false;
let recognition = null;

// Add message to chat with enhanced features
function addMessage(text, isUser, sentiment = null, confidence = null, messageId = null) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user' : 'bot'}`;
    messageDiv.setAttribute('role', 'article');
    messageDiv.setAttribute('aria-label', `${isUser ? 'Your' : 'Bot'} message`);
    
    if (messageId) {
        messageDiv.dataset.messageId = messageId;
    }
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.textContent = text;
    
    messageDiv.appendChild(contentDiv);
    
    // Add sentiment badge and feedback buttons for user messages
    if (isUser && sentiment) {
        const infoDiv = document.createElement('div');
        infoDiv.className = 'message-info';
        
        const badge = document.createElement('div');
        badge.className = `sentiment-badge sentiment-${sentiment.toLowerCase()}`;
        badge.textContent = `${sentiment} (${(confidence * 100).toFixed(0)}%)`;
        
        const feedbackDiv = document.createElement('div');
        feedbackDiv.className = 'feedback-buttons';
        
        const correctBtn = document.createElement('button');
        correctBtn.className = 'feedback-btn correct';
        correctBtn.innerHTML = '👍';
        correctBtn.title = 'Correct sentiment';
        correctBtn.setAttribute('aria-label', 'Mark sentiment as correct');
        correctBtn.onclick = () => sendFeedback(messageId, text, sentiment, true);
        
        const incorrectBtn = document.createElement('button');
        incorrectBtn.className = 'feedback-btn incorrect';
        incorrectBtn.innerHTML = '👎';
        incorrectBtn.title = 'Wrong sentiment';
        incorrectBtn.setAttribute('aria-label', 'Mark sentiment as incorrect');
        incorrectBtn.onclick = () => sendFeedback(messageId, text, sentiment, false);
        
        feedbackDiv.appendChild(correctBtn);
        feedbackDiv.appendChild(incorrectBtn);
        
        infoDiv.appendChild(badge);
        infoDiv.appendChild(feedbackDiv);
        messageDiv.appendChild(infoDiv);
    }
    
    // Add reactions for bot messages
    if (!isUser) {
        addReactionButtons(messageDiv, true);
    }
    
    chatContainer.appendChild(messageDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
    
    return messageDiv;
}

// Show typing indicator
function showTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message bot';
    typingDiv.id = 'typingIndicator';
    
    const indicator = document.createElement('div');
    indicator.className = 'typing-indicator';
    indicator.innerHTML = '<span></span><span></span><span></span>';
    
    typingDiv.appendChild(indicator);
    chatContainer.appendChild(typingDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Remove typing indicator
function removeTypingIndicator() {
    const indicator = document.getElementById('typingIndicator');
    if (indicator) {
        indicator.remove();
    }
}

// FIXED Send Message function
async function sendMessage() {
    const message = messageInput.value.trim();
    
    if (!message) return;
    
    // Clear any existing error messages
    const existingErrors = document.querySelectorAll('.error-message');
    existingErrors.forEach(error => error.remove());
    
    messageInput.disabled = true;
    sendButton.disabled = true;
    
    const messageId = ++messageIdCounter;
    const userMessageDiv = addMessage(message, true, null, null, messageId);
    
    messageInput.value = '';
    showTypingIndicator();
    
    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: message })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // Variable typing delay (more natural)
        const typingDelay = 500 + Math.random() * 1000;
        await new Promise(resolve => setTimeout(resolve, typingDelay));
        
        removeTypingIndicator();
        
        // Update user message with sentiment
        userMessageDiv.remove();
        const newUserMsg = addMessage(message, true, data.sentiment, data.confidence, messageId);
        
        // Add emotion and intent badges if available
        if (data.emotion || data.intent) {
            const infoDiv = newUserMsg.querySelector('.message-info');
            if (data.emotion) {
                const emotionBadge = document.createElement('span');
                emotionBadge.className = 'emotion-badge';
                emotionBadge.textContent = data.emotion;
                infoDiv.appendChild(emotionBadge);
            }
            if (data.intent) {
                const intentBadge = document.createElement('span');
                intentBadge.className = 'intent-badge';
                intentBadge.textContent = data.intent;
                infoDiv.appendChild(intentBadge);
            }
        }
        
        // Add bot response
        addMessage(data.bot_response, false);
        
        // Show suggested replies
        if (data.intent || data.sentiment) {
            showSuggestedReplies(data.intent, data.sentiment);
        }
        
        // Store in history
        conversationHistory.push({
            id: messageId,
            user: message,
            sentiment: data.sentiment,
            confidence: data.confidence,
            intent: data.intent || null,
            emotion: data.emotion || null,
            bot: data.bot_response,
            timestamp: new Date().toISOString()
        });
        
        updateHistorySidebar();
        autoTrain(data);
        
    } catch (error) {
        removeTypingIndicator();
        
        // Show error as separate error message, not bot message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = `
            <div class="error-content">
                ⚠️ Connection failed. Please check your internet connection.
                <button class="retry-btn" onclick="retryMessage('${message.replace(/'/g, "\\'")}')">🔄 Retry</button>
            </div>
        `;
        chatContainer.appendChild(errorDiv);
        chatContainer.scrollTop = chatContainer.scrollHeight;
        
        console.error('Chat Error:', error);
    }
    
    messageInput.disabled = false;
    sendButton.disabled = false;
    messageInput.focus();
}

// Retry failed message
window.retryMessage = function(message) {
    // Remove error messages
    const errorMessages = document.querySelectorAll('.error-message');
    errorMessages.forEach(error => error.remove());
    
    messageInput.value = message;
    sendMessage();
};

// Rest of the functions remain the same...
// (I'll add the other functions in the next part)

// Send feedback to improve model
async function sendFeedback(messageId, message, predictedSentiment, isCorrect) {
    try {
        let correctSentiment = predictedSentiment;
        
        if (!isCorrect) {
            const options = ['POSITIVE', 'NEGATIVE', 'NEUTRAL'].filter(s => s !== predictedSentiment);
            correctSentiment = prompt(`What should the sentiment be?\n1. ${options[0]}\n2. ${options[1]}\n\nEnter 1 or 2:`) === '1' ? options[0] : options[1];
        }
        
        const response = await fetch('/api/feedback', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: message,
                predicted_sentiment: predictedSentiment,
                correct_sentiment: correctSentiment,
                is_correct: isCorrect
            })
        });
        
        if (response.ok) {
            const result = await response.json();
            
            const messageDiv = document.querySelector(`[data-message-id="${messageId}"]`);
            if (messageDiv) {
                const feedbackBtns = messageDiv.querySelector('.feedback-buttons');
                if (feedbackBtns) {
                    feedbackBtns.innerHTML = isCorrect ? 
                        '<span class="feedback-thanks">✓ Thanks!</span>' : 
                        '<span class="feedback-thanks">✓ Corrected!</span>';
                }
            }
            
            console.log('✅ Feedback recorded:', result);
            loadModelStats();
        }
    } catch (error) {
        console.error('Feedback error:', error);
    }
}

// Auto-training function
async function autoTrain(data) {
    try {
        const response = await fetch('/api/train', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: data.user_message,
                sentiment: data.sentiment,
                confidence: data.confidence
            })
        });
        
        if (response.ok) {
            const result = await response.json();
            console.log('✅ Model trained:', {
                totalInteractions: result.total_interactions,
                learnedWords: result.learned_words
            });
            
            updateTrainingStatus(result);
        }
    } catch (error) {
        console.error('Training error:', error);
    }
}

// Update training status in UI
function updateTrainingStatus(result) {
    const statusDiv = document.getElementById('trainingStatus');
    if (statusDiv) {
        const totalWords = result.learned_words.positive + result.learned_words.negative + result.learned_words.neutral;
        statusDiv.textContent = `🧠 Learned: ${totalWords} words from ${result.total_interactions} conversations`;
    }
}

// Message Reactions
function addReactionButtons(messageDiv, isBot) {
    if (!isBot) return;
    
    const reactionsDiv = document.createElement('div');
    reactionsDiv.className = 'message-reactions';
    
    const reactions = ['👍', '❤️', '😊', '🎉', '🤔'];
    reactions.forEach(emoji => {
        const btn = document.createElement('button');
        btn.className = 'reaction-btn';
        btn.textContent = emoji;
        btn.onclick = () => {
            btn.classList.toggle('active');
            console.log('Reaction:', emoji);
        };
        reactionsDiv.appendChild(btn);
    });
    
    messageDiv.appendChild(reactionsDiv);
}

// Suggested Replies
function showSuggestedReplies(intent, sentiment) {
    const existingSuggestions = document.querySelector('.suggested-replies');
    if (existingSuggestions) {
        existingSuggestions.remove();
    }
    
    let suggestions = [];
    
    if (intent === 'question') {
        suggestions = ['Tell me more', 'Can you explain?', 'What else?'];
    } else if (intent === 'complaint') {
        suggestions = ['I need help', 'Can you fix this?', 'What should I do?'];
    } else if (sentiment === 'POSITIVE') {
        suggestions = ['Thank you!', 'That\'s great!', 'Perfect!'];
    } else if (sentiment === 'NEGATIVE') {
        suggestions = ['I need assistance', 'This is frustrating', 'Help please'];
    } else {
        suggestions = ['Tell me more', 'What do you suggest?', 'Okay'];
    }
    
    const suggestionsDiv = document.createElement('div');
    suggestionsDiv.className = 'suggested-replies';
    suggestionsDiv.setAttribute('role', 'region');
    suggestionsDiv.setAttribute('aria-label', 'Suggested replies');
    
    suggestions.forEach(text => {
        const btn = document.createElement('button');
        btn.className = 'suggested-reply';
        btn.textContent = text;
        btn.onclick = () => {
            messageInput.value = text;
            messageInput.focus();
            suggestionsDiv.remove();
        };
        suggestionsDiv.appendChild(btn);
    });
    
    const inputContainer = document.querySelector('.input-container');
    inputContainer.parentNode.insertBefore(suggestionsDiv, inputContainer);
}

// Dark Mode Toggle
darkModeBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    darkModeBtn.textContent = isDark ? '☀️' : '🌙';
    localStorage.setItem('darkMode', isDark);
});

// Load dark mode preference
if (localStorage.getItem('darkMode') === 'true') {
    document.body.classList.add('dark-mode');
    darkModeBtn.textContent = '☀️';
}

// Sidebar Toggle
toggleSidebar.addEventListener('click', () => {
    sidebar.classList.toggle('hidden');
    toggleSidebar.textContent = sidebar.classList.contains('hidden') ? '→' : '←';
});

menuBtn.addEventListener('click', () => {
    sidebar.classList.remove('hidden');
});

// Update History Sidebar
function updateHistorySidebar() {
    if (conversationHistory.length === 0) {
        historyList.innerHTML = '<p class="no-history">No conversations yet</p>';
        return;
    }
    
    historyList.innerHTML = conversationHistory
        .slice()
        .reverse()
        .map(item => `
            <div class="history-item ${item.sentiment.toLowerCase()}" data-id="${item.id}">
                <div class="history-item-text">${item.user}</div>
                <div class="history-item-meta">
                    <span>${item.sentiment}</span>
                    <span>${new Date(item.timestamp).toLocaleTimeString()}</span>
                </div>
            </div>
        `)
        .join('');
}

// Export Chat
exportBtn.addEventListener('click', () => {
    const exportModal = document.createElement('div');
    exportModal.className = 'export-modal';
    exportModal.style.display = 'flex';
    exportModal.innerHTML = `
        <div class="export-options">
            <h3>Export Conversation</h3>
            <button id="exportJSON">📄 Export as JSON</button>
            <button id="exportTXT">📝 Export as Text</button>
            <button id="closeExport">❌ Cancel</button>
        </div>
    `;
    document.body.appendChild(exportModal);
    
    document.getElementById('exportJSON').addEventListener('click', () => {
        const dataStr = JSON.stringify(conversationHistory, null, 2);
        downloadFile(dataStr, 'chat-history.json', 'application/json');
        exportModal.remove();
    });
    
    document.getElementById('exportTXT').addEventListener('click', () => {
        const text = conversationHistory.map(item => 
            `[${new Date(item.timestamp).toLocaleString()}]\nYou: ${item.user}\nSentiment: ${item.sentiment} (${(item.confidence * 100).toFixed(0)}%)\nBot: ${item.bot}\n\n`
        ).join('');
        downloadFile(text, 'chat-history.txt', 'text/plain');
        exportModal.remove();
    });
    
    document.getElementById('closeExport').addEventListener('click', () => {
        exportModal.remove();
    });
});

function downloadFile(content, filename, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

// Clear History
clearHistoryBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to clear all conversation history?')) {
        conversationHistory = [];
        updateHistorySidebar();
        localStorage.removeItem('chatPatterns');
    }
});

// Voice Input
if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    
    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        messageInput.value = transcript;
        isRecording = false;
        voiceBtn.classList.remove('recording');
        voiceBtn.textContent = '🎤';
    };
    
    recognition.onerror = () => {
        isRecording = false;
        voiceBtn.classList.remove('recording');
        voiceBtn.textContent = '🎤';
    };
    
    recognition.onend = () => {
        isRecording = false;
        voiceBtn.classList.remove('recording');
        voiceBtn.textContent = '🎤';
    };
    
    voiceBtn.addEventListener('click', () => {
        if (isRecording) {
            recognition.stop();
        } else {
            recognition.start();
            isRecording = true;
            voiceBtn.classList.add('recording');
            voiceBtn.textContent = '🔴';
        }
    });
} else {
    voiceBtn.style.display = 'none';
}

// Analytics Modal
analyticsBtn.addEventListener('click', async () => {
    analyticsModal.style.display = 'flex';
    await loadAnalytics();
});

closeModal.addEventListener('click', () => {
    analyticsModal.style.display = 'none';
});

analyticsModal.addEventListener('click', (e) => {
    if (e.target === analyticsModal) {
        analyticsModal.style.display = 'none';
    }
});

// Load analytics data
async function loadAnalytics() {
    const content = document.getElementById('analyticsContent');
    content.innerHTML = '<div class="loading">Loading analytics...</div>';
    
    try {
        const response = await fetch('/api/model-stats');
        if (!response.ok) throw new Error('Failed to load analytics');
        
        const stats = await response.json();
        
        const total = stats.total_interactions;
        const dist = stats.sentiment_distribution;
        const vocab = stats.learned_vocabulary;
        
        content.innerHTML = `
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-value">${total}</div>
                    <div class="stat-label">Total Conversations</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${vocab.positive_words + vocab.negative_words + vocab.neutral_words}</div>
                    <div class="stat-label">Words Learned</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${stats.feedback_count || 0}</div>
                    <div class="stat-label">User Corrections</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${stats.accuracy ? (stats.accuracy * 100).toFixed(1) + '%' : 'N/A'}</div>
                    <div class="stat-label">Accuracy</div>
                </div>
            </div>
            
            <div class="chart-section">
                <h3>Sentiment Distribution</h3>
                <div class="bar-chart">
                    <div class="bar-item">
                        <div class="bar-label">Positive</div>
                        <div class="bar-container">
                            <div class="bar bar-positive" style="width: ${total ? (dist.positive / total * 100) : 0}%"></div>
                            <span class="bar-value">${dist.positive}</span>
                        </div>
                    </div>
                    <div class="bar-item">
                        <div class="bar-label">Negative</div>
                        <div class="bar-container">
                            <div class="bar bar-negative" style="width: ${total ? (dist.negative / total * 100) : 0}%"></div>
                            <span class="bar-value">${dist.negative}</span>
                        </div>
                    </div>
                    <div class="bar-item">
                        <div class="bar-label">Neutral</div>
                        <div class="bar-container">
                            <div class="bar bar-neutral" style="width: ${total ? (dist.neutral / total * 100) : 0}%"></div>
                            <span class="bar-value">${dist.neutral}</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="words-section">
                <div class="words-column">
                    <h3>Top Positive Words</h3>
                    <div class="word-list">
                        ${stats.top_positive_words.slice(0, 10).map(([word, weight]) => 
                            `<div class="word-item">
                                <span class="word">${word}</span>
                                <span class="weight">${weight.toFixed(2)}</span>
                            </div>`
                        ).join('')}
                    </div>
                </div>
                <div class="words-column">
                    <h3>Top Negative Words</h3>
                    <div class="word-list">
                        ${stats.top_negative_words.slice(0, 10).map(([word, weight]) => 
                            `<div class="word-item">
                                <span class="word">${word}</span>
                                <span class="weight">${weight.toFixed(2)}</span>
                            </div>`
                        ).join('')}
                    </div>
                </div>
            </div>
        `;
    } catch (error) {
        content.innerHTML = '<div class="error">Failed to load analytics. Please try again.</div>';
        console.error('Analytics error:', error);
    }
}

// Load model stats on page load
async function loadModelStats() {
    try {
        const response = await fetch('/api/model-stats');
        if (response.ok) {
            const stats = await response.json();
            console.log('📊 Model Statistics:', stats);
            
            if (stats.total_interactions > 0) {
                const statusDiv = document.getElementById('trainingStatus');
                const totalWords = stats.learned_vocabulary.positive_words + 
                                 stats.learned_vocabulary.negative_words + 
                                 stats.learned_vocabulary.neutral_words;
                statusDiv.textContent = `🧠 Learned: ${totalWords} words from ${stats.total_interactions} conversations`;
            }
        }
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// Event listeners
sendButton.addEventListener('click', sendMessage);

messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        messageInput.focus();
    }
    
    if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        darkModeBtn.click();
    }
    
    if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
        e.preventDefault();
        toggleSidebar.click();
    }
    
    if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault();
        exportBtn.click();
    }
    
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'C') {
        e.preventDefault();
        document.body.classList.toggle('high-contrast');
        localStorage.setItem('highContrast', document.body.classList.contains('high-contrast'));
    }
});

// Load preferences
if (localStorage.getItem('highContrast') === 'true') {
    document.body.classList.add('high-contrast');
}

// ARIA labels for accessibility
messageInput.setAttribute('aria-label', 'Type your message');
sendButton.setAttribute('aria-label', 'Send message');
darkModeBtn.setAttribute('aria-label', 'Toggle dark mode');
voiceBtn.setAttribute('aria-label', 'Voice input');
analyticsBtn.setAttribute('aria-label', 'View analytics');

// Focus input on load
messageInput.focus();

// Load stats when page loads
loadModelStats();