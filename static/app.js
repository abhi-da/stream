const socket = io();
let username = null;

// Initialize chat
function initChat() {
    username = prompt('Enter your chat nickname:') || `User${Math.floor(Math.random() * 1000)}`;
    
    socket.on('message', (data) => {
        const msgElement = document.createElement('div');
        msgElement.className = 'message';
        msgElement.innerHTML = `<strong>${data.username}:</strong> ${data.text}`;
        document.getElementById('chatMessages').appendChild(msgElement);
        document.getElementById('chatMessages').scrollTop = document.getElementById('chatMessages').scrollHeight;
    });
    
    socket.on('update_viewers', (data) => {
        document.getElementById('viewerCount').textContent = data.count;
    });
}

// Load stream into player
function loadStream(quality, streamId) {
    const placeholder = document.getElementById('player-placeholder');
    placeholder.innerHTML = `
        <iframe src="{{ url_for('watch', quality='${quality}', stream_id='${streamId}') }}" 
                allowfullscreen frameborder="0"></iframe>
    `;
}

// Send chat message
function sendMessage() {
    const input = document.getElementById('messageInput');
    const text = input.value.trim();
    if (text) {
        socket.emit('message', {
            username: username,
            text: text
        });
        input.value = '';
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    initChat();
    
    // Handle enter key in chat
    document.getElementById('messageInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });
    
    // Heartbeat to stay connected
    setInterval(() => socket.emit('heartbeat'), 30000);
});
