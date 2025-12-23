class ChatSystem {
    constructor() {
        this.user = null;
        this.messages = [];
        this.currentReactionMessageId = null;
        this.isLoading = false;
        this.emojiCategories = {
            popular: ['👍', '❤️', '😂', '😮', '😢', '🎉', '🔥', '👏', '🥳', '🤔', '😍', '🙌'],
            smileys: ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯', '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐', '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠'],
            objects: ['⌚', '📱', '📲', '💻', '⌨️', '🖥', '🖨', '🖱', '🖲', '🕹', '🗜', '💽', '💾', '💿', '📀', '📼', '📷', '📸', '📹', '🎥', '📽', '🎞', '📞', '☎️', '📟', '📠', '📺', '📻', '🎙', '🎚', '🎛', '🧭', '⏱', '⏲', '⏰', '🕰', '⌛', '⏳', '📡', '🔋', '🔌', '💡', '🔦', '🕯', '🧯', '🛢', '💸', '💵', '💴', '💶', '💷', '💰', '💳', '💎', '⚖️', '🧰', '🔧', '🔨', '⚒', '🛠', '⛏', '🔩', '⚙️', '🧱', '⛓', '🧲', '🔫', '💣', '🧨', '🪓', '🔪', '🗡', '⚔️', '🛡', '🚬', '⚰️', '⚱️', '🏺', '🔮', '📿', '🧿', '💈', '⚗️', '🔭', '🔬', '🕳', '🩹', '🩺', '💊', '💉', '🩸', '🧬', '🦠', '🧫', '🧪', '🌡', '🧹', '🧺', '🧻', '🚽', '🚰', '🚿', '🛁', '🧼', '🪒', '🧽', '🧴', '🛎', '🔑', '🗝', '🚪', '🪑', '🛋', '🛏', '🛌', '🧸', '🖼', '🛍', '🛒', '🎁', '🎈', '🎏', '🎀', '🎊', '🎉', '🎎', '🏮', '🎐', '🧧', '✉️', '📩', '📨', '📧', '💌', '📥', '📤', '📦', '🏷', '📪', '📫', '📬', '📭', '📮', '📯', '📜', '📃', '📄', '📑', '🧾', '📊', '📈', '📉', '🗒', '🗓', '📆', '📅', '🗑', '📇', '🗃', '🗳', '🗄', '📋', '📁', '📂', '🗂', '🗞', '📰', '📓', '📔', '📒', '📕', '📗', '📘', '📙', '📚', '📖', '🔖', '🧷', '🔗', '📎', '🖇', '📐', '📏', '🧮', '📌', '📍', '✂️', '🖊', '🖋', '✒️', '🖌', '🖍', '📝', '✏️', '🔍', '🔎', '🔏', '🔐', '🔒', '🔓'],
            symbols: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️', '✝️', '☪️', '🕉', '☸️', '✡️', '🔯', '🕎', '☯️', '☦️', '🛐', '⛎', '♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓', '🆔', '⚛️', '🉑', '☢️', '☣️', '📴', '📳', '🈶', '🈚', '🈸', '🈺', '🈷️', '✴️', '🆚', '💮', '🉐', '㊙️', '㊗️', '🈴', '🈵', '🈹', '🈲', '🅰️', '🅱️', '🆎', '🆑', '🅾️', '🆘', '❌', '⭕', '🛑', '⛔', '📛', '🚫', '💯', '💢', '♨️', '🚷', '🚯', '🚳', '🚱', '🔞', '📵', '🚭', '❗', '❕', '❓', '❔', '‼️', '⁉️', '🔅', '🔆', '〽️', '⚠️', '🚸', '🔱', '⚜️', '🔰', '♻️', '✅', '🈯', '💹', '❇️', '✳️', '❎', '🌐', '💠', 'Ⓜ️', '🌀', '💤', '🏧', '🚾', '♿', '🅿️', '🈳', '🈂️', '🛂', '🛃', '🛄', '🛅', '🚹', '🚺', '🚼', '🚻', '🚮', '🎦', '📶', '🈁', '🔣', 'ℹ️', '🔤', '🔡', '🔠', '🆖', '🆗', '🆙', '🆒', '🆕', '🆓', '0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟', '🔢', '#️⃣', '*️⃣', '⏏️', '▶️', '⏸', '⏯', '⏹', '⏺', '⏭', '⏮', '⏩', '⏪', '⏫', '⏬', '◀️', '🔼', '🔽', '➡️', '⬅️', '⬆️', '⬇️', '↗️', '↘️', '↙️', '↖️', '↕️', '↔️', '↪️', '↩️', '⤴️', '⤵️', '🔀', '🔁', '🔂', '🔄', '🔃', '🎵', '🎶', '➕', '➖', '➗', '✖️', '♾', '💲', '💱', '™️', '©️', '®️', '〰️', '➰', '➿', '🔚', '🔙', '🔛', '🔝', '🔜', '✔️', '☑️', '🔘', '⚪', '⚫', '🔴', '🔵', '🔺', '🔻', '🔸', '🔹', '🔶', '🔷', '🔳', '🔲', '▪️', '▫️', '◾', '◽', '◼️', '◻️', '🟥', '🟧', '🟨', '🟩', '🟦', '🟪', '🟫', '⬛', '⬜', '🟦', '🟧', '🟨', '🟩', '🟪', '🟫', '🔈', '🔇', '🔉', '🔊', '🔔', '🔕', '📣', '📢', '👁‍🗨', '💬', '💭', '🗯', '♠️', '♣️', '♥️', '♦️', '🃏', '🎴', '🀄', '🕐', '🕑', '🕒', '🕓', '🕔', '🕕', '🕖', '🕗', '🕘', '🕙', '🕚', '🕛', '🕜', '🕝', '🕞', '🕟', '🕠', '🕡', '🕢', '🕣', '🕤', '🕥', '🕦', '🕧']
        };

        this.init();
    }

    async init() {
        this.showLoading();
        await this.initializeUser();
        await this.loadMessages();
        this.setupEventListeners();
        this.setupEmojiPicker();
        this.hideLoading();
    }

    async initializeUser() {
        try {
            // Check if user exists in localStorage
            const savedUser = localStorage.getItem('chatUser');
            
            if (savedUser) {
                this.user = JSON.parse(savedUser);
            } else {
                // Get new user from server
                const response = await fetch('/.netlify/functions/auth', {
                    method: 'GET'
                });
                
                if (!response.ok) throw new Error('Failed to get user');
                
                const data = await response.json();
                this.user = data;
                
                // Save user to localStorage
                localStorage.setItem('chatUser', JSON.stringify(this.user));
                
                // Register user in database
                await fetch('/.netlify/functions/auth', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(this.user)
                });
            }
            
            this.updateUserUI();
            this.showNotification('Welcome to the chat!', 'success');
            
        } catch (error) {
            console.error('Error initializing user:', error);
            this.showNotification('Failed to initialize user. Please refresh.', 'error');
        }
    }

    async loadMessages() {
        try {
            this.isLoading = true;
            const response = await fetch('/.netlify/functions/getMessages');
            
            if (!response.ok) throw new Error('Failed to load messages');
            
            const data = await response.json();
            this.messages = data.messages.reverse(); // Reverse to show newest at bottom
            
            this.renderMessages();
            this.scrollToBottom();
            
        } catch (error) {
            console.error('Error loading messages:', error);
            this.showNotification('Failed to load messages', 'error');
        } finally {
            this.isLoading = false;
        }
    }

    async sendMessage(text) {
        if (!text.trim() || !this.user) return;
        
        try {
            const messageData = {
                text: text.trim(),
                userId: this.user.userId,
                userName: this.user.userName,
                avatar: this.user.avatar
            };
            
            const response = await fetch('/.netlify/functions/sendMessage', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(messageData)
            });
            
            if (!response.ok) throw new Error('Failed to send message');
            
            const data = await response.json();
            
            // Add message to local array
            this.messages.push(data.message);
            
            // Render the new message
            this.renderMessage(data.message);
            
            // Clear input
            document.getElementById('message-input').value = '';
            this.updateCharCount();
            
            // Scroll to bottom
            this.scrollToBottom();
            
            this.showNotification('Message sent!', 'success');
            
        } catch (error) {
            console.error('Error sending message:', error);
            this.showNotification('Failed to send message', 'error');
        }
    }

    async reactToMessage(messageId, emoji) {
        if (!this.user || !messageId || !emoji) return;
        
        try {
            const reactionData = {
                messageId,
                userId: this.user.userId,
                userName: this.user.userName,
                emoji
            };
            
            const response = await fetch('/.netlify/functions/reactToMessage', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(reactionData)
            });
            
            if (!response.ok) throw new Error('Failed to react to message');
            
            const data = await response.json();
            
            // Update the message in local array
            const index = this.messages.findIndex(m => m.id === messageId);
            if (index !== -1) {
                this.messages[index] = data.message;
                this.updateMessageReactions(messageId, data.message.reactions);
            }
            
        } catch (error) {
            console.error('Error reacting to message:', error);
            this.showNotification('Failed to react to message', 'error');
        }
    }

    renderMessages() {
        const container = document.getElementById('messages-container');
        const emptyState = document.getElementById('empty-state');
        
        // Clear container
        container.innerHTML = '';
        
        if (this.messages.length === 0) {
            emptyState.style.display = 'block';
            return;
        }
        
        emptyState.style.display = 'none';
        
        // Render all messages
        this.messages.forEach(message => {
            this.renderMessage(message);
        });
    }

    renderMessage(message) {
        const container = document.getElementById('messages-container');
        const emptyState = document.getElementById('empty-state');
        
        emptyState.style.display = 'none';
        
        const messageElement = document.createElement('div');
        messageElement.className = `message ${message.userId === this.user?.userId ? 'own-message' : ''}`;
        messageElement.dataset.messageId = message.id;
        
        const time = message.timestamp ? new Date(message.timestamp).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
        }) : 'Just now';
        
        // Format reactions
        let reactionsHTML = '';
        if (message.reactions) {
            Object.entries(message.reactions).forEach(([emoji, users]) => {
                if (users && users.length > 0) {
                    const hasUserReacted = users.some(u => u.userId === this.user?.userId);
                    reactionsHTML += `
                        <div class="reaction ${hasUserReacted ? 'own-reaction' : ''}" 
                             data-emoji="${emoji}" 
                             data-message-id="${message.id}">
                            <span class="emoji">${emoji}</span>
                            <span class="reaction-count">${users.length}</span>
                        </div>
                    `;
                }
            });
        }
        
        messageElement.innerHTML = `
            <div class="message-header">
                <img src="${message.avatar}" alt="${message.userName}" class="message-avatar">
                <span class="message-sender">${message.userName}</span>
                <span class="message-time">${time}</span>
            </div>
            <div class="message-content">${this.escapeHtml(message.text)}</div>
            ${reactionsHTML ? `<div class="message-reactions">${reactionsHTML}</div>` : ''}
        `;
        
        // Add click event for reactions
        messageElement.addEventListener('click', (e) => {
            if (!e.target.closest('.reaction') && !e.target.closest('.message-reactions')) {
                this.showReactionPopup(message.id, e);
            }
        });
        
        // Add click event for existing reactions
        messageElement.querySelectorAll('.reaction').forEach(reaction => {
            reaction.addEventListener('click', (e) => {
                e.stopPropagation();
                const emoji = reaction.dataset.emoji;
                const messageId = reaction.dataset.messageId;
                this.reactToMessage(messageId, emoji);
            });
        });
        
        container.appendChild(messageElement);
    }

    updateMessageReactions(messageId, reactions) {
        const messageElement = document.querySelector(`.message[data-message-id="${messageId}"]`);
        if (!messageElement) return;
        
        const reactionsContainer = messageElement.querySelector('.message-reactions');
        
        // Clear existing reactions
        if (reactionsContainer) {
            reactionsContainer.innerHTML = '';
        } else {
            // Create reactions container if it doesn't exist
            const container = document.createElement('div');
            container.className = 'message-reactions';
            messageElement.appendChild(container);
        }
        
        // Add new reactions
        if (reactions) {
            Object.entries(reactions).forEach(([emoji, users]) => {
                if (users && users.length > 0) {
                    const hasUserReacted = users.some(u => u.userId === this.user?.userId);
                    const reactionElement = document.createElement('div');
                    reactionElement.className = `reaction ${hasUserReacted ? 'own-reaction' : ''}`;
                    reactionElement.dataset.emoji = emoji;
                    reactionElement.dataset.messageId = messageId;
                    reactionElement.innerHTML = `
                        <span class="emoji">${emoji}</span>
                        <span class="reaction-count">${users.length}</span>
                    `;
                    
                    reactionElement.addEventListener('click', (e) => {
                        e.stopPropagation();
                        this.reactToMessage(messageId, emoji);
                    });
                    
                    reactionsContainer.appendChild(reactionElement);
                }
            });
        }
        
        // Remove reactions container if empty
        if (reactionsContainer.children.length === 0) {
            reactionsContainer.remove();
        }
    }

    setupEventListeners() {
        // Send message on button click
        document.getElementById('send-btn').addEventListener('click', () => {
            const input = document.getElementById('message-input');
            this.sendMessage(input.value);
        });
        
        // Send message on Enter key
        document.getElementById('message-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage(e.target.value);
            }
        });
        
        // Character count
        document.getElementById('message-input').addEventListener('input', (e) => {
            this.updateCharCount();
        });
        
        // Emoji picker button
        document.getElementById('emoji-picker-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleEmojiPicker();
        });
        
        // Close emoji picker when clicking outside
        document.addEventListener('click', (e) => {
            const emojiPicker = document.getElementById('emoji-picker');
            const emojiBtn = document.getElementById('emoji-picker-btn');
            
            if (emojiPicker.classList.contains('show') && 
                !emojiPicker.contains(e.target) && 
                !emojiBtn.contains(e.target)) {
                emojiPicker.classList.remove('show');
            }
            
            // Close reaction popup
            const reactionPopup = document.getElementById('reaction-popup');
            if (reactionPopup.style.display === 'block' && 
                !reactionPopup.contains(e.target)) {
                reactionPopup.style.display = 'none';
            }
        });
        
        // Close emoji picker button
        document.getElementById('close-emoji-btn').addEventListener('click', () => {
            document.getElementById('emoji-picker').classList.remove('show');
        });
        
        // Quick emoji buttons
        document.querySelectorAll('.emoji-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const emoji = e.target.dataset.emoji;
                const input = document.getElementById('message-input');
                input.value += emoji;
                input.focus();
                this.updateCharCount();
            });
        });
        
        // Logout/change user
        document.getElementById('logout-btn').addEventListener('click', () => {
            localStorage.removeItem('chatUser');
            window.location.reload();
        });
        
        // Refresh chat
        document.getElementById('refresh-chat').addEventListener('click', () => {
            this.loadMessages();
        });
        
        // Clear chat (client-side only)
        document.getElementById('clear-chat').addEventListener('click', () => {
            if (confirm('Clear all messages from your view?')) {
                this.messages = [];
                this.renderMessages();
            }
        });
        
        // Handle window resize
        window.addEventListener('resize', () => {
            this.adjustReactionPopupPosition();
        });
    }

    setupEmojiPicker() {
        const emojiGrid = document.getElementById('emoji-grid');
        
        // Load popular emojis by default
        this.loadEmojiCategory('popular');
        
        // Category buttons
        document.querySelectorAll('.emoji-category').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const category = e.target.dataset.category;
                
                // Update active state
                document.querySelectorAll('.emoji-category').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                
                // Load emojis for category
                this.loadEmojiCategory(category);
            });
        });
    }

    loadEmojiCategory(category) {
        const emojiGrid = document.getElementById('emoji-grid');
        const emojis = this.emojiCategories[category] || this.emojiCategories.popular;
        
        emojiGrid.innerHTML = '';
        
        emojis.forEach(emoji => {
            const button = document.createElement('button');
            button.className = 'emoji-item';
            button.textContent = emoji;
            button.title = emoji;
            
            button.addEventListener('click', () => {
                const input = document.getElementById('message-input');
                input.value += emoji;
                input.focus();
                this.updateCharCount();
                
                // Close picker after selection
                document.getElementById('emoji-picker').classList.remove('show');
            });
            
            emojiGrid.appendChild(button);
        });
    }

    showReactionPopup(messageId, event) {
        const popup = document.getElementById('reaction-popup');
        this.currentReactionMessageId = messageId;
        
        // Position popup near the click
        const rect = event.target.closest('.message').getBoundingClientRect();
        popup.style.left = `${event.clientX - 100}px`;
        popup.style.top = `${event.clientY - 60}px`;
        popup.style.display = 'block';
        
        // Add event listeners to reaction options
        popup.querySelectorAll('.reaction-option').forEach(option => {
            option.onclick = (e) => {
                e.stopPropagation();
                const emoji = e.target.dataset.emoji;
                this.reactToMessage(messageId, emoji);
                popup.style.display = 'none';
            };
        });
        
        // Auto-hide after 3 seconds
        setTimeout(() => {
            if (popup.style.display === 'block') {
                popup.style.display = 'none';
            }
        }, 3000);
    }

    adjustReactionPopupPosition() {
        const popup = document.getElementById('reaction-popup');
        if (popup.style.display === 'block') {
            // Adjust position if needed
            const rect = popup.getBoundingClientRect();
            if (rect.right > window.innerWidth) {
                popup.style.left = `${window.innerWidth - rect.width - 10}px`;
            }
            if (rect.bottom > window.innerHeight) {
                popup.style.top = `${window.innerHeight - rect.height - 10}px`;
            }
        }
    }

    toggleEmojiPicker() {
        const picker = document.getElementById('emoji-picker');
        picker.classList.toggle('show');
        
        // Position picker
        if (picker.classList.contains('show')) {
            const inputRect = document.getElementById('message-input').getBoundingClientRect();
            picker.style.bottom = `${window.innerHeight - inputRect.top + 10}px`;
            picker.style.right = '2rem';
        }
    }

    updateCharCount() {
        const input = document.getElementById('message-input');
        const count = input.value.length;
        document.getElementById('char-count').textContent = count;
        
        // Change color if接近 limit
        const charCount = document.querySelector('.character-count');
        if (count > 450) {
            charCount.style.color = '#ef4444';
        } else if (count > 400) {
            charCount.style.color = '#f59e0b';
        } else {
            charCount.style.color = 'var(--text-light)';
        }
    }

    updateUserUI() {
        if (!this.user) return;
        
        document.getElementById('user-name').textContent = this.user.userName;
        document.getElementById('user-id').textContent = `ID: ${this.user.userId.substring(0, 8)}...`;
        document.getElementById('user-avatar').src = this.user.avatar;
    }

    scrollToBottom() {
        const container = document.getElementById('messages-container');
        container.scrollTop = container.scrollHeight;
    }

    showLoading() {
        document.getElementById('loading-overlay').style.display = 'flex';
    }

    hideLoading() {
        document.getElementById('loading-overlay').style.display = 'none';
    }

    showNotification(message, type = 'info') {
        // Remove existing notifications
        const existing = document.querySelector('.notification');
        if (existing) existing.remove();
        
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(notification);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 3000);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the chat system when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.chatSystem = new ChatSystem();
    
    // Start polling for new messages (simulate real-time)
    setInterval(() => {
        if (!window.chatSystem.isLoading) {
            window.chatSystem.loadMessages();
        }
    }, 5000); // Poll every 5 seconds
});