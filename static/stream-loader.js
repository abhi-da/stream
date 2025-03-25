class StreamLoader {
    constructor() {
        this.currentStream = null;
        this.retryCount = 0;
        this.maxRetries = 3;
    }
    
    loadStream(streamUrl, containerId) {
        this.currentStream = streamUrl;
        const container = document.getElementById(containerId);
        
        // Clear previous stream
        container.innerHTML = '';
        
        // Create new iframe
        const iframe = document.createElement('iframe');
        iframe.className = 'video-frame';
        iframe.src = streamUrl;
        iframe.allowFullscreen = true;
        iframe.frameBorder = '0';
        
        // Error handling
        iframe.onerror = () => {
            if (this.retryCount < this.maxRetries) {
                this.retryCount++;
                setTimeout(() => this.loadStream(streamUrl, containerId), 2000);
            } else {
                container.innerHTML = `
                    <div class="stream-error">
                        <p>Failed to load stream. Please try another.</p>
                        <button onclick="location.reload()">Retry</button>
                    </div>
                `;
            }
        };
        
        container.appendChild(iframe);
    }
}

const streamLoader = new StreamLoader();
