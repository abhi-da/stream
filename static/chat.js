document.addEventListener('DOMContentLoaded', function() {
    const chatForm = document.getElementById('chat-form');
    const chatMessages = document.getElementById('chat-messages');
    const messageInput = document.getElementById('message');
    const usernameInput = document.getElementById('username');
    let lastMessageId = '';
    let sessionId = '';

    // Function to add a message to the chat UI
    function addMessage(username, message, timestamp, isCurrentUser = false) {
        const messageElement = document.createElement('div');
        messageElement.className = `message ${isCurrentUser ? 'current-user' : ''}`;
        messageElement.innerHTML = `
            <span class="username">${username}</span>
            <span class="timestamp">${timestamp}</span>
            <p>${message}</p>
        `;
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Load messages with deduplication
    function loadMessages() {
        fetch('/chat/get')
            .then(response => response.json())
            .then(data => {
                sessionId = data.session_id;
                const newMessages = data.messages.filter(msg => msg.id !== lastMessageId);
                
                if (newMessages.length > 0) {
                    newMessages.forEach(msg => {
                        addMessage(msg.username, msg.message, msg.timestamp);
                    });
                    lastMessageId = newMessages[newMessages.length - 1].id;
                }
            })
            .catch(error => console.error('Error loading messages:', error));
    }
// Toggle stream links on mobile
const mobileLinksToggle = document.querySelector('.mobile-links-toggle');
const streamList = document.querySelector('.stream-list');

mobileLinksToggle.addEventListener('click', () => {
  streamList.classList.toggle('active');
  mobileLinksToggle.textContent = streamList.classList.contains('active') 
    ? '❌ Close' 
    : '📺 Show Stream Links';
});

// Close menu when clicking outside
document.addEventListener('click', (e) => {
  if (window.innerWidth <= 767 && 
      !e.target.closest('.stream-list') && 
      !e.target.closest('.mobile-links-toggle')) {
    streamList.classList.remove('active');
    mobileLinksToggle.textContent = '📺 Show Stream Links';
  }
});
// Disable all iframe interactions
document.addEventListener('DOMContentLoaded', function() {
  const iframe = document.getElementById('stream-iframe');
  if (iframe) {
    // Block all iframe pointer events
    iframe.style.pointerEvents = 'none';
    
    // Fullscreen button functionality
    const fullscreenBtn = document.querySelector('.fullscreen-btn');
    fullscreenBtn.addEventListener('click', function() {
      if (iframe.requestFullscreen) {
        iframe.requestFullscreen();
      } else if (iframe.webkitRequestFullscreen) {
        iframe.webkitRequestFullscreen();
      } else if (iframe.msRequestFullscreen) {
        iframe.msRequestFullscreen();
      }
    });
    
    // Additional protection against new windows
    iframe.addEventListener('load', function() {
      try {
        iframe.contentWindow.document.body.style.pointerEvents = 'none';
        iframe.contentWindow.document.querySelectorAll('a').forEach(a => {
          a.addEventListener('click', e => e.preventDefault());
        });
      } catch(e) {
        // Cross-origin security will block this
      }
    });
  }
});

    // Handle form submission
    chatForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = usernameInput.value.trim();
        const message = messageInput.value.trim();
        
        if (message && username) {
            // Add message immediately to UI
            addMessage(username, message, new Date().toLocaleTimeString(), true);
            
            fetch('/chat/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `username=${encodeURIComponent(username)}&message=${encodeURIComponent(message)}`
            })
            .then(response => {
                if (response.ok) {
                    messageInput.value = '';
                    messageInput.focus();
                }
            })
            .catch(error => console.error('Error sending message:', error));
        }
    });

    // Toggle buttons for mobile
    document.querySelector('.menu-toggle').addEventListener('click', function() {
        document.querySelector('.stream-list').classList.toggle('active');
    });

    document.querySelector('.chat-toggle').addEventListener('click', function() {
        document.querySelector('.chat-container').classList.toggle('active');
    });

    // Check for new messages every second
    setInterval(loadMessages, 1000);

    // Initial load
    loadMessages();
});
